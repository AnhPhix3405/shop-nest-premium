import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsArray, 
  IsPositive, 
  MinLength,
  MaxLength,
  Min,
  ArrayMaxSize,
  IsNotEmpty
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  @MinLength(3, { message: 'Tên sản phẩm phải có ít nhất 3 ký tự' })
  @MaxLength(200, { message: 'Tên sản phẩm không được vượt quá 200 ký tự' })
  name: string;

  @IsString({ message: 'Mô tả sản phẩm phải là chuỗi' })
  @IsOptional()
  @MaxLength(5000, { message: 'Mô tả không được vượt quá 5000 ký tự' })
  description?: string;

  @IsNumber({}, { message: 'Giá sản phẩm phải là số' })
  @IsPositive({ message: 'Giá sản phẩm phải lớn hơn 0' })
  @Type(() => Number)
  price: number;

  @IsNumber({}, { message: 'Số lượng tồn kho phải là số' })
  @Min(0, { message: 'Số lượng tồn kho không được âm' })
  @Type(() => Number)
  stock: number;

  @IsNumber({}, { message: 'Category ID phải là số' })
  @IsOptional()
  @IsPositive({ message: 'Category ID phải là số dương' })
  @Type(() => Number)
  category_id?: number;

  @IsArray({ message: 'Danh sách ảnh phải là mảng' })
  @IsOptional()
  @ArrayMaxSize(10, { message: 'Tối đa 10 ảnh cho một sản phẩm' })
  image_urls?: string[];
}

export class CreateProductImageDto {
  @IsNumber({}, { message: 'Product ID phải là số' })
  @IsPositive({ message: 'Product ID phải là số dương' })
  @Type(() => Number)
  product_id: number;

  @IsString({ message: 'URL ảnh phải là chuỗi' })
  @IsNotEmpty({ message: 'URL ảnh không được để trống' })
  image_url: string;
}

export class BulkCreateProductImagesDto {
  @IsNumber({}, { message: 'Product ID phải là số' })
  @IsPositive({ message: 'Product ID phải là số dương' })
  @Type(() => Number)
  product_id: number;

  @IsArray({ message: 'Danh sách ảnh phải là mảng' })
  @ArrayMaxSize(10, { message: 'Tối đa 10 ảnh cho một sản phẩm' })
  image_urls: string[];
}

export class ProductQueryDto {
  @IsOptional()
  @IsNumber({}, { message: 'Page phải là số' })
  @Min(1, { message: 'Page phải lớn hơn hoặc bằng 1' })
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber({}, { message: 'Limit phải là số' })
  @Min(1, { message: 'Limit phải lớn hơn hoặc bằng 1' })
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'Search term phải là chuỗi' })
  @MinLength(1, { message: 'Search term phải có ít nhất 1 ký tự' })
  search?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Category ID phải là số' })
  @IsPositive({ message: 'Category ID phải là số dương' })
  @Type(() => Number)
  category_id?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Seller ID phải là số' })
  @IsPositive({ message: 'Seller ID phải là số dương' })
  @Type(() => Number)
  seller_id?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Min price phải là số' })
  @Min(0, { message: 'Min price không được âm' })
  @Type(() => Number)
  min_price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Max price phải là số' })
  @Min(0, { message: 'Max price không được âm' })
  @Type(() => Number)
  max_price?: number;
}

export class UpdateStockDto {
  @IsNumber({}, { message: 'Số lượng tồn kho phải là số' })
  @Min(0, { message: 'Số lượng tồn kho không được âm' })
  @Type(() => Number)
  stock: number;
}

export class StockAdjustmentDto {
  @IsNumber({}, { message: 'Số lượng điều chỉnh phải là số' })
  @IsPositive({ message: 'Số lượng điều chỉnh phải lớn hơn 0' })
  @Type(() => Number)
  quantity: number;
}
