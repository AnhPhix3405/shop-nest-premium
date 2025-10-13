import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsArray, 
  IsPositive, 
  IsUrl,
  MinLength,
  MaxLength,
  Min,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-products.dto';

export class UpdateProductDto {
  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  @IsOptional()
  @MinLength(3, { message: 'Tên sản phẩm phải có ít nhất 3 ký tự' })
  @MaxLength(200, { message: 'Tên sản phẩm không được vượt quá 200 ký tự' })
  name?: string;

  @IsString({ message: 'Mô tả sản phẩm phải là chuỗi' })
  @IsOptional()
  @MaxLength(5000, { message: 'Mô tả không được vượt quá 5000 ký tự' })
  description?: string;

  @IsNumber({}, { message: 'Giá sản phẩm phải là số' })
  @IsOptional()
  @IsPositive({ message: 'Giá sản phẩm phải lớn hơn 0' })
  @Type(() => Number)
  price?: number;

  @IsNumber({}, { message: 'Số lượng tồn kho phải là số' })
  @IsOptional()
  @Min(0, { message: 'Số lượng tồn kho không được âm' })
  @Type(() => Number)
  stock?: number;

  @IsNumber({}, { message: 'Category ID phải là số' })
  @IsOptional()
  @IsPositive({ message: 'Category ID phải là số dương' })
  @Type(() => Number)
  category_id?: number;

  @IsArray({ message: 'Danh sách ảnh phải là mảng' })
  @IsOptional()
  @ArrayMaxSize(10, { message: 'Tối đa 10 ảnh cho một sản phẩm' })
  @IsUrl({}, { each: true, message: 'Mỗi URL ảnh phải là URL hợp lệ' })
  image_urls?: string[];
}

// Alternative approach using PartialType (recommended by NestJS)
export class UpdateProductPartialDto extends PartialType(CreateProductDto) {
  // Loại bỏ seller_id và image_urls khỏi update DTO
  seller_id?: never;
  image_urls?: never;
}

export class UpdateProductImageDto {
  @IsString({ message: 'URL ảnh phải là chuỗi' })
  @IsUrl({}, { message: 'URL ảnh phải là URL hợp lệ' })
  image_url: string;
}

export class ReplaceProductImagesDto {
  @IsArray({ message: 'Danh sách ảnh phải là mảng' })
  @ArrayMaxSize(10, { message: 'Tối đa 10 ảnh cho một sản phẩm' })
  @IsUrl({}, { each: true, message: 'Mỗi URL ảnh phải là URL hợp lệ' })
  image_urls: string[];
}

export class ProductPriceUpdateDto {
  @IsNumber({}, { message: 'Giá sản phẩm phải là số' })
  @IsPositive({ message: 'Giá sản phẩm phải lớn hơn 0' })
  @Type(() => Number)
  price: number;
}

export class ProductStatusDto {
  @IsString({ message: 'Trạng thái phải là chuỗi' })
  @IsOptional()
  status?: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
}

export class BulkUpdateProductsDto {
  @IsArray({ message: 'Danh sách ID sản phẩm phải là mảng' })
  @IsNumber({}, { each: true, message: 'Mỗi ID phải là số' })
  @Type(() => Number)
  product_ids: number[];

  @IsOptional()
  @IsString({ message: 'Trạng thái phải là chuỗi' })
  status?: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';

  @IsOptional()
  @IsNumber({}, { message: 'Category ID phải là số' })
  @IsPositive({ message: 'Category ID phải là số dương' })
  @Type(() => Number)
  category_id?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Giá sản phẩm phải là số' })
  @IsPositive({ message: 'Giá sản phẩm phải lớn hơn 0' })
  @Type(() => Number)
  price?: number;
}

export class ProductSearchDto {
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
  @MinLength(1, { message: 'Từ khóa tìm kiếm phải có ít nhất 1 ký tự' })
  @MaxLength(100, { message: 'Từ khóa tìm kiếm không được vượt quá 100 ký tự' })
  keyword: string;

  @IsOptional()
  @IsNumber({}, { message: 'Category ID phải là số' })
  @IsPositive({ message: 'Category ID phải là số dương' })
  @Type(() => Number)
  category_id?: number;

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

  @IsOptional()
  @IsString({ message: 'Sort by phải là chuỗi' })
  sort_by?: 'name' | 'price' | 'created_at' | 'stock';

  @IsOptional()
  @IsString({ message: 'Sort order phải là chuỗi' })
  sort_order?: 'ASC' | 'DESC';
}
