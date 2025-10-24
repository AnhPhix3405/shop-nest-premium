"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import SearchFilter from "@/components/search/searchFilter"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Star, Heart, ShoppingCart, Eye, MapPin, Truck } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductService, type Product } from "@/lib/services/productService"
import { useToast } from "@/components/ui/use-toast"

// Transform API product to display format
interface DisplayProduct {
  id: number
  name: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  rating: number
  reviewCount: number
  sold: number
  location: string
  shop: string
  isPreferred: boolean
  isMall: boolean
  badges: string[]
  shipping: string
  description?: string
}

const transformProduct = (product: Product): DisplayProduct => {
  // Get first image or use placeholder
  const image = product.product_images && product.product_images.length > 0 
    ? product.product_images[0].url 
    : "/api/placeholder/300/300"

  // Mock some display data since these aren't in the API yet
  const mockRating = (Math.random() * 2 + 3).toFixed(1)
  const mockReviewCount = Math.floor(Math.random() * 1000) + 50
  const mockSold = Math.floor(Math.random() * 5000) + 10
  const mockOriginalPrice = product.price + Math.floor(Math.random() * 500000)
  const mockDiscount = Math.floor(((mockOriginalPrice - product.price) / mockOriginalPrice) * 100)

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: mockDiscount > 0 ? mockOriginalPrice : undefined,
    discount: mockDiscount > 0 ? mockDiscount : undefined,
    image,
    rating: parseFloat(mockRating),
    reviewCount: mockReviewCount,
    sold: mockSold,
    location: Math.random() > 0.5 ? "TP. Hồ Chí Minh" : "Hà Nội",
    shop: `Shop ${product.seller_id}`,
    isPreferred: Math.random() > 0.7,
    isMall: Math.random() > 0.8,
    badges: product.stock > 0 ? ["Còn hàng"] : ["Hết hàng"],
    shipping: Math.random() > 0.5 ? "Giao hàng nhanh" : "Giao hàng tiêu chuẩn",
    description: product.description
  }
}

const ITEMS_PER_PAGE = 24
const MAX_PAGES = 17

function SearchContent() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get("keyword") || ""
  const { toast } = useToast()
  
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("relevant")
  const [filters, setFilters] = useState({})
  const [products, setProducts] = useState<DisplayProduct[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch products when keyword changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (!keyword.trim()) {
        setProducts([])
        return
      }

      setLoading(true)
      try {
        const apiProducts = await ProductService.searchProducts(keyword)
        const displayProducts = apiProducts.map(transformProduct)
        setProducts(displayProducts)
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
        toast({
          variant: "destructive",
          title: "Lỗi tìm kiếm",
          description: "Có lỗi xảy ra khi tìm kiếm sản phẩm. Vui lòng thử lại."
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [keyword])

  // All products are already filtered by the API search
  const filteredProducts = products

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return b.id - a.id
      case "bestseller":
        return b.sold - a.sold
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "relevant":
      default:
        // Mock relevance based on rating and sold count
        const scoreA = parseFloat(a.rating.toString()) * 0.3 + (a.sold / 1000) * 0.7
        const scoreB = parseFloat(b.rating.toString()) * 0.3 + (b.sold / 1000) * 0.7
        return scoreB - scoreA
    }
  })

  // Calculate pagination
  const totalProducts = sortedProducts.length
  const totalPages = Math.min(Math.ceil(totalProducts / ITEMS_PER_PAGE), MAX_PAGES)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentProducts = sortedProducts.slice(startIndex, endIndex)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  const renderStars = (rating: number | string) => {
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating
    const fullStars = Math.floor(numRating)
    const hasHalfStar = numRating % 1 >= 0.5

    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < fullStars
                ? 'fill-yellow-400 text-yellow-400'
                : i === fullStars && hasHalfStar
                ? 'fill-yellow-400/50 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-600">({numRating})</span>
      </div>
    )
  }

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1) // Reset to first page when sort changes
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="mb-6">
          {keyword ? (
            <>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Kết quả tìm kiếm cho "{keyword}"
              </h1>
              <p className="text-gray-600">
                {loading ? "Đang tìm kiếm..." : `Tìm thấy ${totalProducts.toLocaleString()} sản phẩm`}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Tìm kiếm sản phẩm
              </h1>
              <p className="text-gray-600">
                Nhập từ khóa để tìm kiếm sản phẩm
              </p>
            </>
          )}
        </div>

        <div className="flex gap-6">
          {/* Sidebar - Search Filter */}
          <div className="w-80 flex-shrink-0">
            <SearchFilter onFiltersChange={handleFiltersChange} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Sắp xếp theo:</span>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevant">Liên quan</SelectItem>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="bestseller">Bán chạy</SelectItem>
                    <SelectItem value="price-low">Giá: Thấp đến Cao</SelectItem>
                    <SelectItem value="price-high">Giá: Cao đến Thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {Array.from({ length: 12 }, (_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                      <Skeleton className="w-full h-48" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-6 w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {currentProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Discount Badge */}
                        {product.discount && product.discount > 0 && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            -{product.discount}%
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="secondary" className="h-8 w-8">
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="secondary" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Mall/Preferred Badges */}
                        <div className="absolute bottom-2 left-2 flex gap-1">
                          {product.isMall && (
                            <Badge variant="destructive" className="text-xs">Mall</Badge>
                          )}
                          {product.isPreferred && (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-600">
                              Yêu thích
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="p-3">
                        {/* Product Name */}
                        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 min-h-[2.5rem]">
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="mb-2">
                          {renderStars(product.rating)}
                        </div>

                        {/* Price */}
                        <div className="mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-red-600">
                              {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {product.badges.slice(0, 2).map((badge: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Location and Sold */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>{product.location}</span>
                          </div>
                          <span>Đã bán {formatNumber(product.sold)}</span>
                        </div>

                        {/* Shipping */}
                        <div className="flex items-center text-xs text-green-600 mb-3">
                          <Truck className="w-3 h-3 mr-1" />
                          <span>{product.shipping}</span>
                        </div>

                        {/* Shop Name */}
                        <div className="text-xs text-gray-600 mb-3">
                          {product.shop}
                        </div>

                        {/* Add to Cart Button */}
                        <Button className="w-full" size="sm">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Thêm vào giỏ
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && currentProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                {keyword ? (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Không tìm thấy sản phẩm nào cho "{keyword}"
                    </h3>
                    <p className="text-gray-600">
                      Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc của bạn
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nhập từ khóa để bắt đầu tìm kiếm
                    </h3>
                    <p className="text-gray-600">
                      Tìm kiếm sản phẩm theo tên, mô tả hoặc thương hiệu
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    {/* Show dots and last page if needed */}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        {totalPages > 6 && (
                          <PaginationItem>
                            <span className="px-4 py-2">...</span>
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => handlePageChange(totalPages)}
                            className="cursor-pointer"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {/* Page Info */}
            {!loading && totalPages > 0 && (
              <div className="text-center text-sm text-gray-600 mt-4">
                Trang {currentPage} / {totalPages} 
                {totalPages >= MAX_PAGES && (
                  <span className="text-orange-600 ml-2">
                    (Hiển thị tối đa {MAX_PAGES} trang)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-6">
            <Skeleton className="w-80 h-96" />
            <div className="flex-1">
              <Skeleton className="h-16 mb-6" />
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 12 }, (_, i) => (
                  <Skeleton key={i} className="h-80" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
