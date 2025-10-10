import { IsNumber, Min } from 'class-validator';

export class UpdateCartItemDto {
  @IsNumber({}, { message: 'Quantity phải là số' })
  @Min(1, { message: 'Quantity phải lớn hơn 0' })
  quantity: number;
}