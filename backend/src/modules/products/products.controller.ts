import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
    UsePipes,
    ValidationPipe,
    UseGuards,
    Req
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type * as CommonTypes from '../../common/interfaces/authenticated-request.interface';

@Controller('products')
@UsePipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
}))
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    /**
     * Tìm kiếm sản phẩm theo tên
     * GET /products/search?q=keyword
     */
    @Get('search')
    @HttpCode(HttpStatus.OK)
    async searchProducts(
        @Query('q') searchTerm: string
    ) {
        try {
            if (!searchTerm || searchTerm.trim() === '') {
                return {
                    success: false,
                    message: 'Từ khóa tìm kiếm không được để trống',
                    data: []
                };
            }

            const products = await this.productsService.searchProducts(searchTerm.trim());

            return {
                success: true,
                message: `Tìm thấy ${products.length} sản phẩm`,
                data: products
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tìm kiếm sản phẩm',
                data: []
            };
        }
    }

    /**
     * Tạo sản phẩm mới
     * POST /products/create
     */
    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('seller')
    async createProduct(
        @Body() createProductDto: CreateProductDto,
        @Req() req: CommonTypes.AuthenticatedRequest
    ) {
        try {
            const product = await this.productsService.createProduct({
                name: createProductDto.name,
                description: createProductDto.description,
                price: createProductDto.price,
                stock: createProductDto.stock,
                category_id: createProductDto.category_id,
                seller_id: req.user.id, // Lấy từ user đã decode
                image_urls: createProductDto.image_urls
            });

            return {
                success: true,
                message: 'Tạo sản phẩm thành công',
                data: product
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo sản phẩm',
                data: null
            };
        }
    }

    /**
     * Cập nhật sản phẩm
     * PUT /products/update/:id
     */
    @Put('update/:id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('seller')
    async updateProduct(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductDto: UpdateProductDto,
        @Req() req: CommonTypes.AuthenticatedRequest
    ) {
        try {
            // Kiểm tra quyền sở hữu sản phẩm
            await this.productsService.validateProductOwnership(id, req.user.id);
            
            const product = await this.productsService.updateProduct(id, {
                name: updateProductDto.name,
                description: updateProductDto.description,
                price: updateProductDto.price,
                stock: updateProductDto.stock,
                category_id: updateProductDto.category_id,
                image_urls: updateProductDto.image_urls
            });

            return {
                success: true,
                message: 'Cập nhật sản phẩm thành công',
                data: product
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật sản phẩm',
                data: null
            };
        }
    }

    /**
     * Xóa sản phẩm
     * DELETE /products/delete/:id
     */
    @Delete('delete/:id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('seller')
    async deleteProduct(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: CommonTypes.AuthenticatedRequest
    ) {
        try {
            // Kiểm tra quyền sở hữu sản phẩm
            await this.productsService.validateProductOwnership(id, req.user.id);
            
            await this.productsService.deleteProduct(id);

            return {
                success: true,
                message: 'Xóa sản phẩm thành công',
                data: null
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa sản phẩm',
                data: null
            };
        }
    }
}
