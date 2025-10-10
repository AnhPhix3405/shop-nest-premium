import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CartsService } from './carts.service';
import { Cart } from './carts.entity';
import { CartItem } from './cart_items.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AddItemToCartDto, UpdateCartItemDto } from './dto';

// Interface for authenticated request
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    username: string;
    email: string;
    role: {
      id: number;
      name: string;
    };
  };
}



@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  // ==================== CART ENDPOINTS ====================

  /**
   * Tạo giỏ hàng mới cho user hiện tại
   * POST /carts
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('customer')
  async createCart(@Req() req: AuthenticatedRequest): Promise<Cart> {
    return await this.cartsService.createCart(req.user.id);
  }

  /**
   * Lấy giỏ hàng của user hiện tại (tạo mới nếu chưa có)
   * GET /carts/my-cart
   */
  @UseGuards(RolesGuard)
  @Roles('customer')
  @Get('my-cart')
  async getOrCreateCart(@Req() req: AuthenticatedRequest): Promise<Cart> {
    return await this.cartsService.getOrCreateCart(req.user.id);
  }

  /**
   * Lấy giỏ hàng theo ID
   * GET /carts/:id
   */
  @Get(':id')
  async getCartById(@Param('id', ParseIntPipe) cartId: number): Promise<Cart> {
    return await this.cartsService.getCartById(cartId);
  }

  /**
   * Lấy chi tiết giỏ hàng của user hiện tại
   * GET /carts/details
   */
  @Get('details')
  async getUserCartDetails(@Req() req: AuthenticatedRequest): Promise<Cart> {
    return await this.cartsService.getUserCartDetails(req.user.id);
  }

  /**
   * Lấy thống kê giỏ hàng của user hiện tại
   * GET /carts/stats
   */
  @Get('stats')
  async getCartStats(@Req() req: AuthenticatedRequest): Promise<any> {
    return await this.cartsService.getCartStats(req.user.id);
  }

  /**
   * Xóa giỏ hàng theo ID
   * DELETE /carts/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCart(@Param('id', ParseIntPipe) cartId: number): Promise<void> {
    await this.cartsService.deleteCart(cartId);
  }

  /**
   * Xóa giỏ hàng theo user ID
   * DELETE /carts/user/:userId
   */
  @Delete('user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCartByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<void> {
    await this.cartsService.deleteCartByUserId(userId);
  }

  // ==================== CART ITEM ENDPOINTS ====================

  /**
   * Thêm sản phẩm vào giỏ hàng của user hiện tại
   * POST /carts/items
   */
  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('customer')
  async addItemToCart(
    @Req() req: AuthenticatedRequest,
    @Body() addItemDto: AddItemToCartDto,
  ): Promise<CartItem> {
    return await this.cartsService.addItemToCart(
      req.user.id,
      addItemDto.product_id,
      addItemDto.quantity,
    );
  }

  /**
   * Lấy tất cả items trong giỏ hàng của user hiện tại
   * GET /carts/items
   */
  @Get('items')
  async getCartItemsByUserId(@Req() req: AuthenticatedRequest): Promise<CartItem[]> {
    return await this.cartsService.getCartItemsByUserId(req.user.id);
  }

  /**
   * Lấy tất cả items trong giỏ hàng theo cart ID
   * GET /carts/:cartId/items
   */
  @Get(':cartId/items')
  async getCartItems(@Param('cartId', ParseIntPipe) cartId: number): Promise<CartItem[]> {
    return await this.cartsService.getCartItems(cartId);
  }

  /**
   * Lấy cart item theo ID
   * GET /carts/items/:itemId
   */
  @Get('items/:itemId')
  async getCartItemById(@Param('itemId', ParseIntPipe) cartItemId: number): Promise<CartItem> {
    return await this.cartsService.getCartItemById(cartItemId);
  }

  /**
   * Cập nhật quantity của cart item
   * PUT /carts/items/:itemId
   */
  @Put('items/:itemId')
  async updateCartItemQuantity(
    @Param('itemId', ParseIntPipe) cartItemId: number,
    @Body() updateItemDto: UpdateCartItemDto,
  ): Promise<CartItem> {
    return await this.cartsService.updateCartItemQuantity(cartItemId, updateItemDto.quantity);
  }

  /**
   * Xóa cart item theo ID
   * DELETE /carts/items/:itemId
   */
  @Delete('items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCartItem(@Param('itemId', ParseIntPipe) cartItemId: number): Promise<void> {
    await this.cartsService.removeCartItem(cartItemId);
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng của user hiện tại
   * DELETE /carts/items/product/:productId
   */
  @Delete('items/product/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItemFromUserCart(
    @Req() req: AuthenticatedRequest,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<void> {
    await this.cartsService.removeItemFromUserCart(req.user.id, productId);
  }

  /**
   * Xóa tất cả items trong giỏ hàng theo cart ID
   * DELETE /carts/:cartId/items
   */
  @Delete(':cartId/items')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(@Param('cartId', ParseIntPipe) cartId: number): Promise<void> {
    await this.cartsService.clearCart(cartId);
  }

  /**
   * Xóa tất cả items trong giỏ hàng của user hiện tại
   * DELETE /carts/clear
   */
  @Delete('clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearUserCart(@Req() req: AuthenticatedRequest): Promise<void> {
    await this.cartsService.clearUserCart(req.user.id);
  }

  // ==================== UTILITY ENDPOINTS ====================

  /**
   * Đếm số lượng items trong giỏ hàng của user hiện tại
   * GET /carts/count
   */
  @Get('count')
  async getCartItemCount(@Req() req: AuthenticatedRequest): Promise<{ count: number }> {
    const count = await this.cartsService.getCartItemCount(req.user.id);
    return { count };
  }

  /**
   * Tính tổng quantity của tất cả items trong giỏ hàng của user hiện tại
   * GET /carts/total-quantity
   */
  @Get('total-quantity')
  async getTotalQuantity(@Req() req: AuthenticatedRequest): Promise<{ total: number }> {
    const total = await this.cartsService.getTotalQuantity(req.user.id);
    return { total };
  }

  /**
   * Kiểm tra sản phẩm có trong giỏ hàng của user hiện tại không
   * GET /carts/check-product/:productId
   */
  @Get('check-product/:productId')
  async isProductInCart(
    @Req() req: AuthenticatedRequest,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<{ exists: boolean }> {
    const exists = await this.cartsService.isProductInCart(req.user.id, productId);
    return { exists };
  }
}
