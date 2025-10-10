import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Cart } from './carts.entity';
import { CartItem } from './cart_items.entity';
import { CartsRepository } from './carts.repository';

@Injectable()
export class CartsService {
  constructor(
    private readonly cartsRepository: CartsRepository,
  ) {}

  // ==================== CART CRUD METHODS ====================

  /**
   * Tạo giỏ hàng mới cho user
   */
  async createCart(userId: number): Promise<Cart> {
    // Kiểm tra xem user đã có cart chưa
    const existingCart = await this.cartsRepository.cartExists(userId);

    if (existingCart) { 
      throw new BadRequestException('User already has a cart');
    }

    return await this.cartsRepository.createCart(userId);
  }

  /**
   * Lấy giỏ hàng của user (tạo mới nếu chưa có)
   */
  async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartsRepository.findCartByUserId(userId, ['cart_items']);

    if (!cart) {
      cart = await this.createCart(userId);
      cart.cart_items = [];
    }

    return cart;
  }

  /**
   * Lấy giỏ hàng theo ID
   */
  async getCartById(cartId: number): Promise<Cart> {
    const cart = await this.cartsRepository.findCartById(cartId, ['cart_items', 'user']);

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    return cart;
  }

  /**
   * Lấy giỏ hàng theo user ID
   */
  async getCartByUserId(userId: number): Promise<Cart | null> {
    return await this.cartsRepository.findCartByUserId(userId, ['cart_items']);
  }

  /**
   * Xóa giỏ hàng
   */
  async deleteCart(cartId: number): Promise<void> {
    const deleted = await this.cartsRepository.deleteCartById(cartId);
    
    if (!deleted) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }
  }

  /**
   * Xóa giỏ hàng theo user ID
   */
  async deleteCartByUserId(userId: number): Promise<void> {
    const deleted = await this.cartsRepository.deleteCartByUserId(userId);
    
    if (!deleted) {
      throw new NotFoundException(`Cart for user ${userId} not found`);
    }
  }

  // ==================== CART ITEM CRUD METHODS ====================

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  async addItemToCart(userId: number, productId: number, quantity: number): Promise<CartItem> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    // Lấy hoặc tạo cart cho user
    const cart = await this.getOrCreateCart(userId);

    // Kiểm tra xem sản phẩm đã có trong cart chưa
    const existingItem = await this.cartsRepository.findCartItemByProduct(cart.id, productId);

    if (existingItem) {
      // Nếu đã có, cập nhật quantity
      const newQuantity = existingItem.quantity + quantity;
      const updatedItem = await this.cartsRepository.updateCartItemQuantity(existingItem.id, newQuantity);
      if (!updatedItem) {
        throw new NotFoundException(`Failed to update cart item with ID ${existingItem.id}`);
      }
      return updatedItem;
    } else {
      // Nếu chưa có, tạo mới
      return await this.cartsRepository.createCartItem(cart.id, productId, quantity);
    }
  }

  /**
   * Cập nhật quantity của cart item
   */
  async updateCartItemQuantity(cartItemId: number, quantity: number): Promise<CartItem> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const cartItem = await this.cartsRepository.findCartItemById(cartItemId);

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    const updatedItem = await this.cartsRepository.updateCartItemQuantity(cartItemId, quantity);
    if (!updatedItem) {
      throw new NotFoundException(`Failed to update cart item with ID ${cartItemId}`);
    }
    
    return updatedItem;
  }

  /**
   * Lấy cart item theo ID
   */
  async getCartItemById(cartItemId: number): Promise<CartItem> {
    const cartItem = await this.cartsRepository.findCartItemById(cartItemId, ['cart']);

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    return cartItem;
  }

  /**
   * Lấy tất cả cart items của một cart
   */
  async getCartItems(cartId: number): Promise<CartItem[]> {
    return await this.cartsRepository.findCartItemsByCartId(cartId);
  }

  /**
   * Lấy cart items theo user ID
   */
  async getCartItemsByUserId(userId: number): Promise<CartItem[]> {
    const cart = await this.getCartByUserId(userId);
    
    if (!cart) {
      return [];
    }

    return await this.getCartItems(cart.id);
  }

  /**
   * Xóa cart item
   */
  async removeCartItem(cartItemId: number): Promise<void> {
    const deleted = await this.cartsRepository.deleteCartItemById(cartItemId);
    
    if (!deleted) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }
  }

  /**
   * Xóa cart item theo product ID trong cart của user
   */
  async removeItemFromUserCart(userId: number, productId: number): Promise<void> {
    const cart = await this.getCartByUserId(userId);
    
    if (!cart) {
      throw new NotFoundException(`Cart for user ${userId} not found`);
    }

    const deleted = await this.cartsRepository.deleteCartItemByProduct(cart.id, productId);

    if (!deleted) {
      throw new NotFoundException(`Product ${productId} not found in user's cart`);
    }
  }

  /**
   * Xóa tất cả items trong cart
   */
  async clearCart(cartId: number): Promise<void> {
    await this.cartsRepository.deleteAllCartItems(cartId);
  }

  /**
   * Xóa tất cả items trong cart của user
   */
  async clearUserCart(userId: number): Promise<void> {
    const cart = await this.getCartByUserId(userId);
    
    if (cart) {
      await this.clearCart(cart.id);
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Đếm số lượng items trong cart
   */
  async getCartItemCount(userId: number): Promise<number> {
    const cart = await this.getCartByUserId(userId);
    
    if (!cart) {
      return 0;
    }

    return await this.cartsRepository.countCartItems(cart.id);
  }

  /**
   * Tính tổng quantity của tất cả items trong cart
   */
  async getTotalQuantity(userId: number): Promise<number> {
    const cart = await this.getCartByUserId(userId);
    
    if (!cart) {
      return 0;
    }

    return await this.cartsRepository.getTotalQuantity(cart.id);
  }

  /**
   * Kiểm tra xem sản phẩm có trong cart không
   */
  async isProductInCart(userId: number, productId: number): Promise<boolean> {
    const cart = await this.getCartByUserId(userId);
    
    if (!cart) {
      return false;
    }

    return await this.cartsRepository.isProductInCart(cart.id, productId);
  }

  /**
   * Lấy thông tin chi tiết giỏ hàng của user (bao gồm cả items)
   */
  async getUserCartDetails(userId: number): Promise<Cart> {
    return await this.getOrCreateCart(userId);
  }

  /**
   * Lấy thống kê cart của user
   */
  async getCartStats(userId: number): Promise<any> {
    return await this.cartsRepository.getCartWithStats(userId);
  }
}
