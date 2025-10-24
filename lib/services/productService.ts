import { API_BASE_URL, PRODUCT_ENDPOINTS } from '@/config/api'

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

export interface SearchResponse {
  success: boolean
  message: string
  data: Product[]
}

export class ProductService {
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