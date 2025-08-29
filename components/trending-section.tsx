"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp } from "lucide-react"

const categories = ["Tất cả", "Điện tử", "Thời trang", "Nhà cửa", "Sách"]

const trendingProducts = [
  {
    id: 1,
    name: "iPhone 15 Pro Max 256GB",
    price: 29990000,
    image: "/iphone-15-pro-max-trending.png",
    rating: 4.9,
    sold: 2345,
    category: "Điện tử",
    trend: "+15%",
  },
  {
    id: 2,
    name: "Áo hoodie unisex form rộng",
    price: 399000,
    image: "/unisex-oversized-hoodie-trending.png",
    rating: 4.8,
    sold: 1876,
    category: "Thời trang",
    trend: "+23%",
  },
  {
    id: 3,
    name: "Máy lọc không khí Xiaomi",
    price: 2599000,
    image: "/xiaomi-air-purifier-trending.png",
    rating: 4.7,
    sold: 567,
    category: "Nhà cửa",
    trend: "+8%",
  },
  {
    id: 4,
    name: "Sách Atomic Habits",
    price: 199000,
    image: "/atomic-habits-book-trending.png",
    rating: 4.9,
    sold: 3421,
    category: "Sách",
    trend: "+45%",
  },
  {
    id: 5,
    name: "MacBook Air M3 13 inch",
    price: 29990000,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.8,
    sold: 892,
    category: "Điện tử",
    trend: "+12%",
  },
  {
    id: 6,
    name: "Giày Nike Air Force 1",
    price: 2899000,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.6,
    sold: 1234,
    category: "Thời trang",
    trend: "+19%",
  },
]

export function TrendingSection() {
  const [activeCategory, setActiveCategory] = useState("Tất cả")

  const filteredProducts =
    activeCategory === "Tất cả"
      ? trendingProducts
      : trendingProducts.filter((product) => product.category === activeCategory)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  return (
    <section className="bg-muted/20 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold text-foreground">Xu hướng & Bán chạy</h2>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap ${
                activeCategory === category ? "bg-accent text-accent-foreground" : "hover:bg-accent/10"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {filteredProducts.map((product, index) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-3">
                <div className="relative mb-3">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="w-full h-32 object-cover rounded-lg"
                  />

                  {/* Ranking badge */}
                  <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs">#{index + 1}</Badge>

                  {/* Trend indicator */}
                  <Badge className="absolute top-2 right-2 bg-green-500 text-white text-xs">{product.trend}</Badge>
                </div>

                <h3 className="font-medium text-xs mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                  {product.name}
                </h3>

                <div className="space-y-1">
                  <span className="text-accent font-bold text-sm">{formatPrice(product.price)}</span>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{product.rating}</span>
                    </div>
                    <span>{product.sold} đã bán</span>
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
