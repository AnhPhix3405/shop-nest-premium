import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { Product, ProductImage } from './entity';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
  ) {}

  // ==================== PRODUCT CRUD METHODS ====================

  /**
   * Tạo sản phẩm mới
   */
  async createProduct(createProductData: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    category_id?: number;
    seller_id: number;
    image_urls?: string[];
  }): Promise<Product> {
    const { image_urls, ...productData } = createProductData;

    // Tạo sản phẩm
    const product = await this.productsRepository.createProduct(productData);

    // Thêm ảnh nếu có
    if (image_urls && image_urls.length > 0) {
      for (const imageUrl of image_urls) {
        await this.productsRepository.addProductImage(product.id, imageUrl);
      }
    }

    return await this.getProductById(product.id);
  }

  /**
   * Lấy sản phẩm theo ID
   */
  async getProductById(id: number): Promise<Product> {
    const product = await this.productsRepository.findProductById(id, ['product_images']);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  /**
   * Lấy tất cả sản phẩm
   */
  async getAllProducts(): Promise<Product[]> {
    return await this.productsRepository.findAllProducts(['product_images']);
  }

  /**
   * Lấy sản phẩm theo seller ID
   */
  async getProductsBySellerId(sellerId: number): Promise<Product[]> {
    return await this.productsRepository.findProductsBySellerId(sellerId, ['product_images']);
  }

  /**
   * Lấy sản phẩm theo category ID
   */
  async getProductsByCategoryId(categoryId: number): Promise<Product[]> {
    return await this.productsRepository.findProductsByCategoryId(categoryId, ['product_images']);
  }

  /**
   * Tìm kiếm sản phẩm theo tên
   */
  async searchProducts(searchTerm: string): Promise<Product[]> {
    if (!searchTerm || searchTerm.trim() === '') {
      throw new BadRequestException('Search term is required');
    }

    return await this.productsRepository.searchProductsByName(searchTerm, ['product_images']);
  }

  /**
   * Cập nhật sản phẩm
   */
  async updateProduct(id: number, updateData: {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    category_id?: number;
    image_urls?: string[];
  }): Promise<Product> {
    const existingProduct = await this.productsRepository.findProductById(id);
    
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Cập nhật thông tin sản phẩm (không bao gồm image_urls)
    const { image_urls, ...productUpdateData } = updateData;
    const updatedProduct = await this.productsRepository.updateProduct(id, productUpdateData);
    
    if (!updatedProduct) {
      throw new NotFoundException(`Failed to update product with ID ${id}`);
    }

    // Cập nhật ảnh nếu có
    if (image_urls !== undefined) {
      await this.replaceAllProductImages(id, image_urls);
    }

    return await this.getProductById(id);
  }

  /**
   * Xóa sản phẩm
   */
  async deleteProduct(id: number): Promise<void> {
    const existingProduct = await this.productsRepository.findProductById(id);
    
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const deleted = await this.productsRepository.deleteProduct(id);
    
    if (!deleted) {
      throw new BadRequestException(`Failed to delete product with ID ${id}`);
    }
  }

  // ==================== STOCK MANAGEMENT ====================

  /**
   * Cập nhật stock sản phẩm
   */
  async updateStock(id: number, quantity: number): Promise<Product> {
    if (quantity < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }

    const product = await this.productsRepository.findProductById(id);
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updatedProduct = await this.productsRepository.updateProductStock(id, quantity);
    
    if (!updatedProduct) {
      throw new BadRequestException(`Failed to update stock for product with ID ${id}`);
    }

    return updatedProduct;
  }

  /**
   * Tăng stock sản phẩm
   */
  async increaseStock(id: number, increment: number): Promise<Product> {
    if (increment <= 0) {
      throw new BadRequestException('Increment must be positive');
    }

    const product = await this.productsRepository.findProductById(id);
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updatedProduct = await this.productsRepository.incrementProductStock(id, increment);
    
    if (!updatedProduct) {
      throw new BadRequestException(`Failed to increase stock for product with ID ${id}`);
    }

    return updatedProduct;
  }

  /**
   * Giảm stock sản phẩm
   */
  async decreaseStock(id: number, decrement: number): Promise<Product> {
    if (decrement <= 0) {
      throw new BadRequestException('Decrement must be positive');
    }

    const product = await this.productsRepository.findProductById(id);
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (product.stock < decrement) {
      throw new BadRequestException('Not enough stock available');
    }

    const updatedProduct = await this.productsRepository.incrementProductStock(id, -decrement);
    
    if (!updatedProduct) {
      throw new BadRequestException(`Failed to decrease stock for product with ID ${id}`);
    }

    return updatedProduct;
  }

  // ==================== PRODUCT IMAGE METHODS ====================

  /**
   * Thêm ảnh cho sản phẩm
   */
  async addProductImage(productId: number, imageUrl: string): Promise<ProductImage> {
    const product = await this.productsRepository.findProductById(productId);
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return await this.productsRepository.addProductImage(productId, imageUrl);
  }

  /**
   * Lấy ảnh sản phẩm
   */
  async getProductImages(productId: number): Promise<ProductImage[]> {
    const product = await this.productsRepository.findProductById(productId);
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return await this.productsRepository.getProductImages(productId);
  }

  /**
   * Xóa ảnh sản phẩm
   */
  async deleteProductImage(imageId: number): Promise<void> {
    const image = await this.productsRepository.findProductImageById(imageId);
    
    if (!image) {
      throw new NotFoundException(`Product image with ID ${imageId} not found`);
    }

    const deleted = await this.productsRepository.deleteProductImage(imageId);
    
    if (!deleted) {
      throw new BadRequestException(`Failed to delete product image with ID ${imageId}`);
    }
  }

  /**
   * Xóa ảnh sản phẩm theo URL
   */
  async deleteProductImageByUrl(imageUrl: string): Promise<void> {
    const image = await this.productsRepository.findProductImageByUrl(imageUrl);
    
    if (!image) {
      throw new NotFoundException(`Product image with URL not found`);
    }

    const deleted = await this.productsRepository.deleteProductImage(image.id);
    
    if (!deleted) {
      throw new BadRequestException(`Failed to delete product image`);
    }
  }

  /**
   * Cập nhật URL ảnh sản phẩm
   */
  async updateProductImageUrl(imageId: number, newImageUrl: string): Promise<ProductImage> {
    const image = await this.productsRepository.findProductImageById(imageId);
    
    if (!image) {
      throw new NotFoundException(`Product image with ID ${imageId} not found`);
    }

    const updatedImage = await this.productsRepository.updateProductImageUrl(imageId, newImageUrl);
    
    if (!updatedImage) {
      throw new BadRequestException(`Failed to update product image with ID ${imageId}`);
    }

    return updatedImage;
  }

  /**
   * Thay thế tất cả ảnh của sản phẩm
   */
  async replaceAllProductImages(productId: number, imageUrls: string[]): Promise<Product> {
    const product = await this.productsRepository.findProductById(productId);
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Xóa tất cả ảnh cũ
    const existingImages = await this.productsRepository.getProductImages(productId);
    for (const image of existingImages) {
      await this.productsRepository.deleteProductImage(image.id);
    }

    // Thêm ảnh mới
    if (imageUrls && imageUrls.length > 0) {
      for (const imageUrl of imageUrls) {
        await this.productsRepository.addProductImage(productId, imageUrl);
      }
    }

    return await this.getProductById(productId);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Lấy sản phẩm với phân trang
   */
  async getProductsWithPagination(
    page: number = 1,
    limit: number = 10
  ): Promise<{ products: Product[]; total: number; page: number; limit: number; totalPages: number }> {
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100; // Giới hạn tối đa

    const result = await this.productsRepository.getProductsWithPagination(page, limit, ['product_images']);
    
    return {
      ...result,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  /**
   * Lấy sản phẩm theo khoảng giá
   */
  async getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    if (minPrice < 0 || maxPrice < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    if (minPrice > maxPrice) {
      throw new BadRequestException('Min price cannot be greater than max price');
    }

    return await this.productsRepository.findProductsByPriceRange(minPrice, maxPrice);
  }

  /**
   * Kiểm tra sản phẩm có tồn tại không
   */
  async checkProductExists(id: number): Promise<boolean> {
    return await this.productsRepository.productExists(id);
  }

  /**
   * Kiểm tra sản phẩm có thuộc về seller không
   */
  async checkProductOwnership(productId: number, sellerId: number): Promise<boolean> {
    const product = await this.productsRepository.findProductById(productId);
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return product.seller_id === sellerId;
  }

  /**
   * Validate quyền sở hữu sản phẩm
   */
  async validateProductOwnership(productId: number, sellerId: number): Promise<void> {
    const isOwner = await this.checkProductOwnership(productId, sellerId);
    
    if (!isOwner) {
      throw new BadRequestException('Bạn không có quyền thao tác với sản phẩm này');
    }
  }

  /**
   * Đếm tổng số sản phẩm
   */
  async getTotalProductsCount(): Promise<number> {
    return await this.productsRepository.countAllProducts();
  }

  /**
   * Đếm sản phẩm theo seller
   */
  async getProductsCountBySeller(sellerId: number): Promise<number> {
    return await this.productsRepository.countProductsBySeller(sellerId);
  }

  /**
   * Đếm sản phẩm theo category
   */
  async getProductsCountByCategory(categoryId: number): Promise<number> {
    return await this.productsRepository.countProductsByCategory(categoryId);
  }
}
