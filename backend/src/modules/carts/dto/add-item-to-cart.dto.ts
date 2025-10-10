import { IsNumber, IsPositive, Min } from 'class-validator';

export class AddItemToCartDto {
  @IsNumber({}, { message: 'Product ID phải là số' })
  @IsPositive({ message: 'Product ID phải là số dương' })
  product_id: number;

  @IsNumber({}, { message: 'Quantity phải là số' })
  @Min(1, { message: 'Quantity phải lớn hơn 0' })
  quantity: number;
}