/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import cloudinary from '../../config/cloudinary.config';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { 
  singleFileOptions, 
  multipleFilesOptions 
} from '../../middleware/multer.middleware';
import { ProductsService } from '../products/products.service';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {

  constructor(
    private readonly productsService: ProductsService
  ) {}

  /**
   * Validate uploaded file
   */
  private validateUploadedFile(file: any): void {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Kiểm tra file đã được xử lý bởi multer
    if (!file.path || !file.filename) {
      throw new BadRequestException('File processing failed');
    }

    // Kiểm tra file có tồn tại trên disk không
    if (!fs.existsSync(file.path)) {
      throw new BadRequestException('Uploaded file not found');
    }
  }

  /**
   * Clean up temporary files
   */
  private cleanupTempFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting temp file:', error);
    }
  }

  /**
   * Upload avatar/single image
   * POST /upload/avatar
   */
  @Post('avatar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('seller', 'customer', 'admin')
  @UseInterceptors(FileInterceptor('avatar', singleFileOptions))
  async uploadAvatar(
    @UploadedFile() file: any
  ) {
    try {
      // Validate uploaded file
      this.validateUploadedFile(file);

      // Upload file to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'shop-nest/avatars',
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto' }
        ]
      });

      // Delete temporary file from local storage
      this.cleanupTempFile(file.path);

      return {
        success: true,
        message: 'Upload avatar thành công',
        data: {
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          file_info: {
            original_name: file.originalname,
            size: file.size,
            mime_type: file.mimetype
          }
        }
      };

    } catch (error) {
      // Clean up file if error occurs
      if (file && file.path) {
        this.cleanupTempFile(file.path);
      }
      
      console.error('Upload avatar error:', error);
      throw new InternalServerErrorException('Upload failed');
    }
  }

  /**
   * Upload single product image
   * POST /upload/product-image
   */
  @Post('product-image')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('seller', 'admin')
  @UseInterceptors(FileInterceptor('image', singleFileOptions))
  async uploadProductImage(
    @UploadedFile() file: any,
    @Body('product_id') productId?: number
  ) {
    try {
      // Validate uploaded file
      this.validateUploadedFile(file);

      // Upload file to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'shop-nest/products',
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { format: 'webp' }
        ]
      });

      // Delete temporary file from local storage
      this.cleanupTempFile(file.path);

      const responseData = {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        file_info: {
          original_name: file.originalname,
          size: file.size,
          mime_type: file.mimetype
        }
      };

      // Nếu có product_id, tự động thêm ảnh vào sản phẩm
      if (productId) {
        try {
          await this.productsService.addProductImage(productId, result.secure_url);
          return {
            success: true,
            message: 'Upload ảnh sản phẩm thành công và đã thêm vào sản phẩm',
            data: {
              ...responseData,
              product_updated: true,
              product_id: productId
            }
          };
        } catch (productError) {
          console.error('Error adding image to product:', productError);
          return {
            success: true,
            message: 'Upload ảnh thành công nhưng không thể thêm vào sản phẩm',
            data: {
              ...responseData,
              product_updated: false,
              product_error: productError.message
            }
          };
        }
      }

      return {
        success: true,
        message: 'Upload ảnh sản phẩm thành công',
        data: responseData
      };

    } catch (error) {
      // Clean up file if error occurs
      if (file && file.path) {
        this.cleanupTempFile(file.path);
      }
      
      console.error('Upload product image error:', error);
      throw new InternalServerErrorException('Upload failed');
    }
  }

  /**
   * Upload multiple product images
   * POST /upload/product-images
   */
  @Post('product-images')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('seller', 'admin')
  @UseInterceptors(FilesInterceptor('images', 10, multipleFilesOptions))
  async uploadProductImages(
    @UploadedFiles() files: any[],
    @Body('product_id') productId?: number
  ) {
    const uploadedImages: any[] = [];
    const failedUploads: string[] = [];

    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('No files uploaded');
      }

      // Upload each file to Cloudinary
      for (const file of files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'shop-nest/products',
            resource_type: 'image',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto' },
              { format: 'webp' }
            ]
          });

          uploadedImages.push({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            original_name: file.originalname
          });

          // Delete temporary file
          this.cleanupTempFile(file.path);

        } catch (uploadError) {
          console.error(`Failed to upload ${file.originalname}:`, uploadError);
          failedUploads.push(file.originalname);
          
          // Clean up temp file
          this.cleanupTempFile(file.path);
        }
      }

      // Nếu có product_id và có ảnh upload thành công, tự động thêm vào sản phẩm
      if (productId && uploadedImages.length > 0) {
        try {
          const imageUrls: string[] = uploadedImages.map((img: any) => img.url as string);
          
          // Lấy ảnh hiện tại của sản phẩm
          const existingImages = await this.productsService.getProductImages(productId);
          const existingUrls = existingImages.map(img => img.image_url);
          
          // Thêm ảnh mới vào danh sách ảnh hiện tại
          const allImageUrls = [...existingUrls, ...imageUrls];
          
          // Cập nhật sản phẩm với tất cả ảnh
          await this.productsService.replaceAllProductImages(productId, allImageUrls);
          
          return {
            success: uploadedImages.length > 0,
            message: `Upload thành công ${uploadedImages.length}/${files.length} ảnh và đã cập nhật sản phẩm`,
            data: {
              uploaded_images: uploadedImages,
              failed_uploads: failedUploads,
              total_uploaded: uploadedImages.length,
              total_failed: failedUploads.length,
              product_updated: true,
              product_id: productId
            }
          };
        } catch (productError: any) {
          console.error('Error adding images to product:', productError);
          return {
            success: uploadedImages.length > 0,
            message: `Upload thành công ${uploadedImages.length}/${files.length} ảnh nhưng không thể cập nhật sản phẩm`,
            data: {
              uploaded_images: uploadedImages,
              failed_uploads: failedUploads,
              total_uploaded: uploadedImages.length,
              total_failed: failedUploads.length,
              product_updated: false,
              product_error: productError.message
            }
          };
        }
      }

      return {
        success: uploadedImages.length > 0,
        message: `Upload thành công ${uploadedImages.length}/${files.length} ảnh`,
        data: {
          uploaded_images: uploadedImages,
          failed_uploads: failedUploads,
          total_uploaded: uploadedImages.length,
          total_failed: failedUploads.length,
          product_updated: false
        }
      };

    } catch (error) {
      // Clean up all temp files if error occurs
      if (files && files.length > 0) {
        files.forEach(file => {
          if (file && file.path) {
            this.cleanupTempFile(file.path);
          }
        });
      }
      
      console.error('Upload multiple images error:', error);
      throw new InternalServerErrorException('Upload failed');
    }
  }

  /**
   * Upload image from URL
   * POST /upload/from-url
   */
  @Post('from-url')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('seller', 'admin')
  async uploadFromUrl(
    @Body('imageUrl') imageUrl: string,
    @Body('folder') folder = 'shop-nest/products'
  ) {
    try {
      if (!imageUrl) {
        throw new BadRequestException('Image URL is required');
      }

      // Upload from URL to Cloudinary
      const result = await cloudinary.uploader.upload(imageUrl, {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { format: 'webp' }
        ]
      });

      return {
        success: true,
        message: 'Upload từ URL thành công',
        data: {
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          original_url: imageUrl
        }
      };

    } catch (error) {
      console.error('Upload from URL error:', error);
      throw new InternalServerErrorException('Upload from URL failed');
    }
  }

  /**
   * Delete image from Cloudinary and database
   * POST /upload/delete
   */
  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('seller', 'admin')
  async deleteImage(
    @Body('public_id') publicId?: string,
    @Body('image_url') imageUrl?: string
  ) {
    try {
      if (!publicId && !imageUrl) {
        throw new BadRequestException('Either public_id or image_url is required');
      }

      let cloudinaryPublicId = publicId;
      let dbImageUrl = imageUrl;

      // If only image_url is provided, extract public_id from URL
      if (!publicId && imageUrl) {
        // Extract public_id from Cloudinary URL
        // Example: https://res.cloudinary.com/cloud/image/upload/v123/shop-nest/products/abc123.webp
        const urlParts = imageUrl.split('/');
        const versionIndex = urlParts.findIndex(part => part.startsWith('v'));
        if (versionIndex !== -1 && versionIndex + 1 < urlParts.length) {
          // Get everything after version as public_id (without extension)
          const pathAfterVersion = urlParts.slice(versionIndex + 1).join('/');
          cloudinaryPublicId = pathAfterVersion.replace(/\.[^/.]+$/, ''); // Remove extension
        } else {
          throw new BadRequestException('Invalid Cloudinary URL format');
        }
      }

      // If only public_id is provided, we need to find the corresponding image_url in database
      if (!imageUrl && publicId) {
        // We'll need to search for images that contain this public_id in their URL
        // This is a fallback approach since we don't store public_id separately
        dbImageUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/.*/${publicId}.*`;
      }

      // Delete from Cloudinary first
      const cloudinaryResult = await cloudinary.uploader.destroy(cloudinaryPublicId!);
      const cloudinarySuccess = cloudinaryResult.result === 'ok';

      // Delete from database if we have image_url
      let databaseSuccess = false;
      if (dbImageUrl && !dbImageUrl.includes('.*')) {
        try {
          await this.productsService.deleteProductImageByUrl(dbImageUrl);
          databaseSuccess = true;
        } catch (error) {
          console.error('Database deletion error:', error);
          // Don't throw error here, as Cloudinary deletion might have succeeded
        }
      }

      return {
        success: cloudinarySuccess || databaseSuccess,
        message: this.getDeleteMessage(cloudinarySuccess, databaseSuccess),
        data: {
          public_id: cloudinaryPublicId,
          image_url: dbImageUrl,
          cloudinary_result: cloudinaryResult.result,
          database_deleted: databaseSuccess
        }
      };

    } catch (error) {
      console.error('Delete image error:', error);
      throw new InternalServerErrorException('Delete image failed');
    }
  }

  /**
   * Delete image from Cloudinary and database by URL
   * POST /upload/delete-by-url
   */
  @Post('delete-by-url')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('seller', 'admin')
  async deleteImageByUrl(
    @Body('image_url') imageUrl: string
  ) {
    try {
      if (!imageUrl) {
        throw new BadRequestException('Image URL is required');
      }

      // Extract public_id from Cloudinary URL
      let publicId: string;
      try {
        // Example URL: https://res.cloudinary.com/cloud/image/upload/v123/shop-nest/products/abc123.webp
        const urlParts = imageUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        
        if (uploadIndex === -1) {
          throw new Error('Not a valid Cloudinary URL');
        }

        // Get path after 'upload/v{version}/'
        const pathAfterUpload = urlParts.slice(uploadIndex + 1);
        
        // Remove version part (v123456)
        const pathWithoutVersion = pathAfterUpload.filter(part => !part.startsWith('v') || part.length < 5);
        
        // Join path and remove file extension
        publicId = pathWithoutVersion.join('/').replace(/\.[^/.]+$/, '');
        
      } catch {
        throw new BadRequestException('Invalid Cloudinary URL format');
      }

      // Delete from Cloudinary
      const cloudinaryResult = await cloudinary.uploader.destroy(publicId);
      const cloudinarySuccess = cloudinaryResult.result === 'ok';

      // Delete from database
      let databaseSuccess = false;
      try {
        await this.productsService.deleteProductImageByUrl(imageUrl);
        databaseSuccess = true;
      } catch (dbError) {
        console.error('Database deletion error:', dbError);
        // Continue execution, don't throw error
      }

      return {
        success: cloudinarySuccess || databaseSuccess,
        message: this.getDeleteMessage(cloudinarySuccess, databaseSuccess),
        data: {
          public_id: publicId,
          image_url: imageUrl,
          cloudinary_result: cloudinaryResult.result,
          database_deleted: databaseSuccess
        }
      };

    } catch (error) {
      console.error('Delete image by URL error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Delete image failed');
    }
  }

  /**
   * Helper method to generate appropriate delete message
   */
  private getDeleteMessage(cloudinarySuccess: boolean, databaseSuccess: boolean): string {
    if (cloudinarySuccess && databaseSuccess) {
      return 'Xóa ảnh thành công từ cả Cloudinary và database';
    } else if (cloudinarySuccess && !databaseSuccess) {
      return 'Xóa ảnh thành công từ Cloudinary nhưng không tìm thấy trong database';
    } else if (!cloudinarySuccess && databaseSuccess) {
      return 'Xóa ảnh thành công từ database nhưng không tìm thấy trong Cloudinary';
    } else {
      return 'Không tìm thấy ảnh trong cả Cloudinary và database';
    }
  }
}
