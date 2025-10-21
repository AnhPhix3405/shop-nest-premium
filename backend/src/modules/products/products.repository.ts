import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductImage } from './entity';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  ) {}

  // ==================== PRODUCT REPOSITORY METHODS ====================

  /**
   * Tạo sản phẩm mới
   */
  async createProduct(productData: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(productData);
    return await this.productRepository.save(product);
  }

  /**
   * Tìm sản phẩm theo ID
   */
  async findProductById(id: number, relations?: string[]): Promise<Product | null> {
    return await this.productRepository.findOne({
      where: { id },
      relations,
    });
  }

  /**
   * Tìm tất cả sản phẩm
   */
  async findAllProducts(relations?: string[]): Promise<Product[]> {
    return await this.productRepository.find({
      relations,
    });
  }

  /**
   * Tìm sản phẩm theo seller ID
   */
  async findProductsBySellerId(sellerId: number, relations?: string[]): Promise<Product[]> {
    return await this.productRepository.find({
      where: { seller_id: sellerId },
      relations,
    });
  }

  /**
   * Tìm sản phẩm theo category ID
   */
  async findProductsByCategoryId(categoryId: number, relations?: string[]): Promise<Product[]> {
    return await this.productRepository.find({
      where: { category_id: categoryId },
      relations,
    });
  }

  /**
   * Tìm kiếm sản phẩm theo tên
   */
  async searchProductsByName(searchTerm: string, relations?: string[]): Promise<Product[]> {
    let query = this.productRepository
      .createQueryBuilder('product')
      .where('product.name ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
    
    if (relations?.includes('product_images')) {
      query = query.leftJoinAndSelect('product.product_images', 'product_images');
    }
    
    return await query.orderBy('product.created_at', 'DESC').getMany();
  }

  /**
   * Cập nhật sản phẩm
   */
  async updateProduct(id: number, updateData: Partial<Product>): Promise<Product | null> {
    await this.productRepository.update(id, updateData);
    return await this.findProductById(id);
  }

  /**
   * Xóa sản phẩm
   */
  async deleteProduct(id: number): Promise<boolean> {
    const result = await this.productRepository.delete(id);
    return (result.affected || 0) > 0;
  }

  /**
   * Kiểm tra sản phẩm có tồn tại không
   */
  async productExists(id: number): Promise<boolean> {
    const count = await this.productRepository.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Cập nhật stock sản phẩm
   */
  async updateProductStock(id: number, quantity: number): Promise<Product | null> {
    await this.productRepository.update(id, { stock: quantity });
    return await this.findProductById(id);
  }

  /**
   * Tăng/giảm stock sản phẩm
   */
  async incrementProductStock(id: number, increment: number): Promise<Product | null> {
    await this.productRepository
      .createQueryBuilder()
      .update(Product)
      .set({ stock: () => `stock + ${increment}` })
      .where('id = :id', { id })
      .execute();
    
    return await this.findProductById(id);
  }

  // ==================== PRODUCT IMAGE REPOSITORY METHODS ====================

  /**
   * Thêm ảnh cho sản phẩm
   */
  async addProductImage(productId: number, imageUrl: string): Promise<ProductImage> {
    const productImage = this.productImageRepository.create({
      product_id: productId,
      image_url: imageUrl,
    });
    return await this.productImageRepository.save(productImage);
  }

  /**
   * Lấy tất cả ảnh của sản phẩm
   */
  async getProductImages(productId: number): Promise<ProductImage[]> {
    return await this.productImageRepository.find({
      where: { product_id: productId },
    });
  }

  /**
   * Tìm ảnh sản phẩm theo ID
   */
  async findProductImageById(id: number): Promise<ProductImage | null> {
    return await this.productImageRepository.findOne({
      where: { id },
    });
  }

  /**
   * Tìm ảnh sản phẩm theo URL
   */
  async findProductImageByUrl(imageUrl: string): Promise<ProductImage | null> {
    return await this.productImageRepository.findOne({
      where: { image_url: imageUrl },
    });
  }

  /**
   * Xóa ảnh sản phẩm
   */
  async deleteProductImage(id: number): Promise<boolean> {
    const result = await this.productImageRepository.delete(id);
    return (result.affected || 0) > 0;
  }

  /**
   * Xóa tất cả ảnh của sản phẩm
   */
  async deleteAllProductImages(productId: number): Promise<boolean> {
    const result = await this.productImageRepository.delete({ product_id: productId });
    return (result.affected || 0) > 0;
  }

  /**
   * Cập nhật URL ảnh
   */
  async updateProductImageUrl(id: number, imageUrl: string): Promise<ProductImage | null> {
    await this.productImageRepository.update(id, { image_url: imageUrl });
    return await this.findProductImageById(id);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Đếm tổng số sản phẩm
   */
  async countAllProducts(): Promise<number> {
    return await this.productRepository.count();
  }

  /**
   * Đếm sản phẩm theo seller
   */
  async countProductsBySeller(sellerId: number): Promise<number> {
    return await this.productRepository.count({
      where: { seller_id: sellerId },
    });
  }

  /**
   * Đếm sản phẩm theo category
   */
  async countProductsByCategory(categoryId: number): Promise<number> {
    return await this.productRepository.count({
      where: { category_id: categoryId },
    });
  }

  /**
   * Lấy sản phẩm với phân trang
   */
  async getProductsWithPagination(
    page: number = 1,
    limit: number = 10,
    relations?: string[]
  ): Promise<{ products: Product[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    
    const [products, total] = await this.productRepository.findAndCount({
      relations,
      skip,
      take: limit,
    });

    return {
      products,
      total,
      page,
      limit,
    };
  }

  /**
   * Lấy sản phẩm theo price range
   */
  async findProductsByPriceRange(
    minPrice: number,
    maxPrice: number,
  ): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .where('product.price >= :minPrice AND product.price <= :maxPrice', {
        minPrice,
        maxPrice,
      })
      .orderBy('product.created_at', 'DESC')
      .getMany();
  }
}
