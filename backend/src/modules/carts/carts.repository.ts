import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './carts.entity';
import { CartItem } from './cart_items.entity';

@Injectable()
export class CartsRepository {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  // ==================== CART REPOSITORY METHODS ====================

  /**
   * Tạo cart mới
   */
  async createCart(userId: number): Promise<Cart> {
    const cart = this.cartRepository.create({
      user_id: userId,
    });
    return await this.cartRepository.save(cart);
  }

  /**
   * Tìm cart theo user ID
   */
  async findCartByUserId(userId: number, relations?: string[]): Promise<Cart | null> {
    return await this.cartRepository.findOne({
      where: { user_id: userId },
      relations,
    });
  }

  /**
   * Tìm cart theo ID
   */
  async findCartById(cartId: number, relations?: string[]): Promise<Cart | null> {
    return await this.cartRepository.findOne({
      where: { id: cartId },
      relations,
    });
  }

  /**
   * Cập nhật cart
   */
  async updateCart(cartId: number, updateData: Partial<Cart>): Promise<Cart | null> {
    await this.cartRepository.update(cartId, updateData);
    return await this.findCartById(cartId);
  }

  /**
   * Xóa cart theo ID
   */
  async deleteCartById(cartId: number): Promise<boolean> {
    const result = await this.cartRepository.delete(cartId);
    return (result.affected || 0) > 0;
  }

  /**
   * Xóa cart theo user ID
   */
  async deleteCartByUserId(userId: number): Promise<boolean> {
    const result = await this.cartRepository.delete({ user_id: userId });
    return (result.affected || 0) > 0;
  }

  /**
   * Kiểm tra cart có tồn tại không
   */
  async cartExists(userId: number): Promise<boolean> {
    const count = await this.cartRepository.count({
      where: { user_id: userId },
    });
    return count > 0;
  }

  // ==================== CART ITEM REPOSITORY METHODS ====================

  /**
   * Tạo cart item mới
   */
  async createCartItem(cartId: number, productId: number, quantity: number): Promise<CartItem> {
    const cartItem = this.cartItemRepository.create({
      cart_id: cartId,
      product_id: productId,
      quantity,
    });
    return await this.cartItemRepository.save(cartItem);
  }

  /**
   * Tìm cart item theo ID
   */
  async findCartItemById(cartItemId: number, relations?: string[]): Promise<CartItem | null> {
    return await this.cartItemRepository.findOne({
      where: { id: cartItemId },
      relations,
    });
  }

  /**
   * Tìm cart item theo cart ID và product ID
   */
  async findCartItemByProduct(cartId: number, productId: number): Promise<CartItem | null> {
    return await this.cartItemRepository.findOne({
      where: {
        cart_id: cartId,
        product_id: productId,
      },
    });
  }

  /**
   * Lấy tất cả cart items của một cart
   */
  async findCartItemsByCartId(cartId: number): Promise<CartItem[]> {
    return await this.cartItemRepository.find({
      where: { cart_id: cartId },
    });
  }

  /**
   * Cập nhật cart item
   */
  async updateCartItem(cartItemId: number, updateData: Partial<CartItem>): Promise<CartItem | null> {
    await this.cartItemRepository.update(cartItemId, updateData);
    return await this.findCartItemById(cartItemId);
  }

  /**
   * Cập nhật quantity của cart item
   */
  async updateCartItemQuantity(cartItemId: number, quantity: number): Promise<CartItem | null> {
    await this.cartItemRepository.update(cartItemId, { quantity });
    return await this.findCartItemById(cartItemId);
  }

  /**
   * Xóa cart item theo ID
   */
  async deleteCartItemById(cartItemId: number): Promise<boolean> {
    const result = await this.cartItemRepository.delete(cartItemId);
    return (result.affected || 0) > 0;
  }

  /**
   * Xóa cart item theo cart ID và product ID
   */
  async deleteCartItemByProduct(cartId: number, productId: number): Promise<boolean> {
    const result = await this.cartItemRepository.delete({
      cart_id: cartId,
      product_id: productId,
    });
    return (result.affected || 0) > 0;
  }

  /**
   * Xóa tất cả cart items của một cart
   */
  async deleteAllCartItems(cartId: number): Promise<boolean> {
    const result = await this.cartItemRepository.delete({ cart_id: cartId });
    return (result.affected || 0) > 0;
  }

  /**
   * Đếm số lượng cart items trong cart
   */
  async countCartItems(cartId: number): Promise<number> {
    return await this.cartItemRepository.count({
      where: { cart_id: cartId },
    });
  }

  /**
   * Tính tổng quantity của tất cả items trong cart
   */
  async getTotalQuantity(cartId: number): Promise<number> {
    const result = await this.cartItemRepository
      .createQueryBuilder('cart_item')
      .select('SUM(cart_item.quantity)', 'total')
      .where('cart_item.cart_id = :cartId', { cartId })
      .getRawOne() as { total: string };

    return parseInt(result?.total || '0') || 0;
  }

  /**
   * Kiểm tra sản phẩm có trong cart không
   */
  async isProductInCart(cartId: number, productId: number): Promise<boolean> {
    const count = await this.cartItemRepository.count({
      where: {
        cart_id: cartId,
        product_id: productId,
      },
    });
    return count > 0;
  }

  /**
   * Lấy tất cả carts (admin use)
   */
  async findAllCarts(relations?: string[]): Promise<Cart[]> {
    return await this.cartRepository.find({
      relations,
    });
  }

  /**
   * Lấy tất cả cart items (admin use)
   */
  async findAllCartItems(relations?: string[]): Promise<CartItem[]> {
    return await this.cartItemRepository.find({
      relations,
      
    });
  }

  /**
   * Bulk update cart items
   */
  async bulkUpdateCartItems(updates: Array<{ id: number; quantity: number }>): Promise<void> {
    const promises = updates.map(update =>
      this.cartItemRepository.update(update.id, { quantity: update.quantity })
    );
    await Promise.all(promises);
  }

  /**
   * Raw query - Lấy cart với thống kê
   */
  async getCartWithStats(userId: number): Promise<any> {
    return await this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.cart_items', 'items')
      .select([
        'cart.id as cart_id',
        'cart.user_id',
        'cart.created_at',
        'cart.updated_at',
        'COUNT(items.id) as item_count',
        'COALESCE(SUM(items.quantity), 0) as total_quantity'
      ])
      .where('cart.user_id = :userId', { userId })
      .groupBy('cart.id')
      .getRawOne();
  }
}
