/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { Cart } from './carts.entity';

@Entity('cart_items')
@Check('quantity > 0')
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  cart_id: number;

  @Column({ type: 'integer' })
  product_id: number;

  @Column({ type: 'integer', nullable: false })
  quantity: number;


  // Relations
  @ManyToOne(() => Cart, (cart) => cart.cart_items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  // Relation to products (assuming you have a products entity)
  // @ManyToOne(() => Product, (product) => product.cart_items, {
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn({ name: 'product_id' })
  // product: Product;
}
