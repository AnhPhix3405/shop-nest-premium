import { API_BASE_URL, buildEndpoint } from '@/config/api'

// Types
export interface FileValidation {
  isValid: boolean
  error?: string
}

export interface UploadResponse {
  success: boolean
  message: string
  data: {
    url: string
    public_id: string
    width: number
    height: number
    file_info?: {
      original_name: string
      size: number
      mime_type: string
    }
    product_updated?: boolean
    product_id?: number
  }
}

export interface MultipleUploadResponse {
  success: boolean
  message: string
  data: {
    uploaded_images: Array<{
      url: string
      public_id: string
      width: number
      height: number
      original_name: string
    }>
    failed_uploads: string[]
    total_uploaded: number
    total_failed: number
    product_updated?: boolean
    product_id?: number
  }
}

export interface DeleteResponse {
  success: boolean
  message: string
  data: {
    public_id: string
    image_url: string
    cloudinary_result: string
    database_deleted: boolean
  }
}

export class UploadService {
  private static instance: UploadService
  private readonly maxFileSize = 5 * 1024 * 1024 // 5MB
  private readonly allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  private constructor() {}

  static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService()
    }
    return UploadService.instance
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): FileValidation {
    if (!this.allowedImageTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `${file.name} không phải là file ảnh hợp lệ (chỉ chấp nhận JPG, PNG, WebP)`
      }
    }
    
    if (file.size > this.maxFileSize) {
      return {
        isValid: false,
        error: `${file.name} vượt quá giới hạn ${Math.round(this.maxFileSize / 1024 / 1024)}MB`
      }
    }
    
    return { isValid: true }
  }

  /**
   * Validate image URL
   */
  validateImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      const extension = urlObj.pathname.split('.').pop()?.toLowerCase()
      return ['jpg', 'jpeg', 'png', 'webp'].includes(extension || '')
    } catch {
      return false
    }
  }

  /**
   * Upload avatar image
   */
  async uploadAvatar(file: File, token: string): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await fetch(`${API_BASE_URL}${buildEndpoint.upload.avatar()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  /**
   * Upload single product image
   */
  async uploadProductImage(
    file: File, 
    token: string, 
    productId?: string
  ): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('image', file)
    
    if (productId && productId !== 'new-product') {
      formData.append('product_id', productId)
    }

    const response = await fetch(`${API_BASE_URL}${buildEndpoint.upload.productImage()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  /**
   * Upload multiple product images
   */
  async uploadProductImages(
    files: File[], 
    token: string, 
    productId?: string
  ): Promise<MultipleUploadResponse> {
    const formData = new FormData()
    
    files.forEach(file => {
      formData.append('images', file)
    })
    
    if (productId && productId !== 'new-product') {
      formData.append('product_id', productId)
    }

    const response = await fetch(`${API_BASE_URL}${buildEndpoint.upload.productImages()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  /**
   * Upload image from URL
   */
  async uploadFromUrl(
    imageUrl: string, 
    token: string, 
    folder: string = 'shop-nest/products'
  ): Promise<UploadResponse> {
    const response = await fetch(`${API_BASE_URL}${buildEndpoint.upload.fromUrl()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        imageUrl: imageUrl,
        folder: folder
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  /**
   * Delete image by public_id
   */
  async deleteImage(
    publicId: string, 
    token: string, 
    imageUrl?: string
  ): Promise<DeleteResponse> {
    const body = imageUrl 
      ? { image_url: imageUrl }
      : { public_id: publicId }

    const response = await fetch(`${API_BASE_URL}${buildEndpoint.upload.delete()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  /**
   * Delete image by URL
   */
  async deleteImageByUrl(imageUrl: string, token: string): Promise<DeleteResponse> {
    const response = await fetch(`${API_BASE_URL}${buildEndpoint.upload.deleteByUrl()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        image_url: imageUrl
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  /**
   * Batch validate files
   */
  validateFiles(files: FileList | File[]): {
    validFiles: File[]
    invalidFiles: { file: File; error: string }[]
  } {
    const validFiles: File[] = []
    const invalidFiles: { file: File; error: string }[] = []

    Array.from(files).forEach(file => {
      const validation = this.validateFile(file)
      if (validation.isValid) {
        validFiles.push(file)
      } else {
        invalidFiles.push({ file, error: validation.error! })
      }
    })

    return { validFiles, invalidFiles }
  }

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Extract public_id from Cloudinary URL
   */
  extractPublicIdFromUrl(url: string): string | null {
    try {
      // Example URL: https://res.cloudinary.com/cloud/image/upload/v123/shop-nest/products/abc123.webp
      const urlParts = url.split('/')
      const uploadIndex = urlParts.indexOf('upload')
      
      if (uploadIndex === -1) {
        return null
      }

      // Get path after 'upload/v{version}/'
      const pathAfterUpload = urlParts.slice(uploadIndex + 1)
      
      // Remove version part (v123456)
      const pathWithoutVersion = pathAfterUpload.filter(part => !part.startsWith('v') || part.length < 5)
      
      // Join path and remove file extension
      return pathWithoutVersion.join('/').replace(/\.[^/.]+$/, '')
      
    } catch {
      return null
    }
  }

  /**
   * Check if URL is a Cloudinary URL
   */
  isCloudinaryUrl(url: string): boolean {
    return url.includes('cloudinary.com') && url.includes('/image/upload/')
  }

  /**
   * Get max file size
   */
  getMaxFileSize(): number {
    return this.maxFileSize
  }

  /**
   * Get allowed image types
   */
  getAllowedImageTypes(): string[] {
    return [...this.allowedImageTypes]
  }
}

// Export singleton instance
export const uploadService = UploadService.getInstance()

// Export default for convenience
export default uploadService
