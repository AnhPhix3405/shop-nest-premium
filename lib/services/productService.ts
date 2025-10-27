import { API_BASE_URL, PRODUCT_ENDPOINTS, buildEndpoint } from '@/config/api'

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  stock: number
  category_id?: number
  seller_id: number
  created_at: string
  updated_at: string
  product_images?: ProductImage[]
}

export interface ProductImage {
  id: number
  product_id: number
  url: string
  created_at: string
}

export interface ProductFormData {
  name: string
  description?: string
  price: number
  stock: number
  category_id?: number
  image_urls?: string[]
}

export interface CreateProductResponse {
  success: boolean
  message: string
  data: Product | null
  error?: {
    status?: number
    statusText?: string
    data?: any
  }
}

export interface SearchResponse {
  success: boolean
  message: string
  data: Product[]
}

export class ProductService {
  /**
   * Tạo sản phẩm mới
   */
  static async createProduct(productData: ProductFormData, accessToken: string): Promise<CreateProductResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${buildEndpoint.products.create()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(productData)
      })

      const result = await response.json()

      // Nếu response không ok, return error thay vì throw
      if (!response.ok) {
        return {
          success: false,
          message: result.message || `HTTP error! status: ${response.status}`,
          data: null as any,
          error: {
            status: response.status,
            statusText: response.statusText,
            data: result
          }
        } as any
      }

      return result
    } catch (error: any) {
      console.error('Create product error:', error)
      
      // Return error thay vì throw
      return {
        success: false,
        message: error.message || 'Network error occurred',
        data: null as any,
        error: error
      } as any
    }
  }

  static async searchProducts(keyword: string): Promise<Product[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}${PRODUCT_ENDPOINTS.SEARCH}?q=${encodeURIComponent(keyword)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: SearchResponse = await response.json()
      
      if (result.success) {
        return result.data
      } else {
        console.error('Search failed:', result.message)
        return []
      }
    } catch (error) {
      console.error('Error searching products:', error)
      return []
    }
  }
}