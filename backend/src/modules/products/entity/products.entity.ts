import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { ProductImage } from './product_image.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, nullable: false })
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false })
  price: number;

  @Column({ type: 'integer', nullable: false, default: 0 })
  stock: number;

  @Column({ type: 'integer', nullable: true })
  category_id: number;

  @Column({ type: 'integer', nullable: false })
  seller_id: number;

  // Relations
  
  /**
   * Relation with Categories
   * Many products can belong to one category
   * ON DELETE SET NULL - if category is deleted, category_id becomes null
   */
  // @ManyToOne(() => Category, (category) => category.products, {
  //   onDelete: 'SET NULL',
  // })
  // @JoinColumn({ name: 'category_id' })
  // category: Category;

  /**
   * Relation with Users (Seller)
   * Many products can belong to one seller
   * ON DELETE CASCADE - if seller is deleted, products are deleted
   */
  // @ManyToOne(() => User, (user) => user.products, {
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn({ name: 'seller_id' })
  // seller: User;

  /**
   * Relation with Product Images
   * One product can have many images
   * ON DELETE CASCADE - if product is deleted, all images are deleted
   */
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: false,
  })
  product_images: ProductImage[];

  /**
   * Relation with Cart Items
   * One product can be in many cart items
   */
  // @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  // cart_items: CartItem[];

  /**
   * Relation with Order Items
   * One product can be in many order items
   */
  // @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  // order_items: OrderItem[];

  /**
   * Relation with Reviews
   * One product can have many reviews
   */
  // @OneToMany(() => Review, (review) => review.product)
  // reviews: Review[];
}
