import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './products.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  product_id: number;

  @Column({ type: 'text', nullable: false })
  image_url: string;

  // Relations

  /**
   * Relation with Products
   * Many product images belong to one product
   * ON DELETE CASCADE - if product is deleted, all images are deleted
   */
  @ManyToOne(() => Product, (product) => product.product_images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
