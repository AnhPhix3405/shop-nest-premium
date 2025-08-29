import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart } from "lucide-react"

const products = [
  {
    id: 1,
    name: "Áo thun nam basic cotton 100%",
    price: 299000,
    originalPrice: 399000,
    image: "/men-basic-cotton-t-shirt.png",
    rating: 4.8,
    sold: 1234,
    discount: 25,
    isLiked: false,
  },
  {
    id: 2,
    name: "Giày sneaker nữ thể thao",
    price: 899000,
    originalPrice: 1299000,
    image: "/women-sport-sneakers.png",
    rating: 4.9,
    sold: 856,
    discount: 31,
    isLiked: true,
  },
  {
    id: 3,
    name: "Túi xách nữ da thật cao cấp",
    price: 1599000,
    originalPrice: 2199000,
    image: "/women-leather-handbag.png",
    rating: 4.7,
    sold: 432,
    discount: 27,
    isLiked: false,
  },
  {
    id: 4,
    name: "Đồng hồ nam thông minh",
    price: 2499000,
    originalPrice: 3499000,
    image: "/men-smart-watch.png",
    rating: 4.6,
    sold: 678,
    discount: 29,
    isLiked: false,
  },
  {
    id: 5,
    name: "Tai nghe bluetooth cao cấp",
    price: 1299000,
    originalPrice: 1799000,
    image: "/premium-bluetooth-headphones.png",
    rating: 4.8,
    sold: 923,
    discount: 28,
    isLiked: true,
  },
  {
    id: 6,
    name: "Balo laptop chống nước",
    price: 599000,
    originalPrice: 899000,
    image: "/waterproof-laptop-backpack.png",
    rating: 4.5,
    sold: 567,
    discount: 33,
    isLiked: false,
  },
  {
    id: 7,
    name: "Kem dưỡng da mặt vitamin C",
    price: 399000,
    originalPrice: 599000,
    image: "/vitamin-c-face-cream.png",
    rating: 4.9,
    sold: 1456,
    discount: 33,
    isLiked: false,
  },
  {
    id: 8,
    name: "Nồi cơm điện cao tần 1.8L",
    price: 1899000,
    originalPrice: 2599000,
    image: "/electric-rice-cooker-1-8l.png",
    rating: 4.7,
    sold: 234,
    discount: 27,
    isLiked: false,
  },
]

export function ProductShowcase() {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Gợi ý hôm nay</h2>
          <Button variant="outline">Xem thêm</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={250}
                    height={250}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />

                  {/* Discount badge */}
                  {product.discount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                      -{product.discount}%
                    </Badge>
                  )}

                  {/* Like button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`absolute top-2 right-2 w-8 h-8 p-0 bg-white/80 hover:bg-white ${
                      product.isLiked ? "text-red-500" : "text-muted-foreground"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${product.isLiked ? "fill-current" : ""}`} />
                  </Button>

                  {/* Quick add to cart */}
                  <Button
                    size="sm"
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-accent hover:bg-accent/90"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-accent font-bold text-lg">{formatPrice(product.price)}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-muted-foreground text-sm line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{product.rating}</span>
                      </div>
                      <span>Đã bán {product.sold}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
