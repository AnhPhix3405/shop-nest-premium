"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock } from "lucide-react"

const flashSaleProducts = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    originalPrice: 29990000,
    salePrice: 24990000,
    image: "/iphone-15-pro-max.png",
    sold: 45,
    total: 100,
    discount: 17,
  },
  {
    id: 2,
    name: "Samsung Galaxy S24",
    originalPrice: 22990000,
    salePrice: 18990000,
    image: "/samsung-galaxy-s24.png",
    sold: 78,
    total: 150,
    discount: 17,
  },
  {
    id: 3,
    name: "MacBook Air M3",
    originalPrice: 34990000,
    salePrice: 29990000,
    image: "/macbook-air-m3.png",
    sold: 23,
    total: 50,
    discount: 14,
  },
  {
    id: 4,
    name: "AirPods Pro 2",
    originalPrice: 6990000,
    salePrice: 5490000,
    image: "/airpods-pro-2.png",
    sold: 156,
    total: 200,
    discount: 21,
  },
  {
    id: 5,
    name: "iPad Pro 11 inch",
    originalPrice: 24990000,
    salePrice: 21990000,
    image: "/ipad-pro-11-inch.png",
    sold: 67,
    total: 120,
    discount: 12,
  },
]

export function FlashSaleSection() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 34,
    seconds: 56,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  return (
    <section className="bg-gradient-to-r from-accent/10 to-secondary/10 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold text-foreground">Flash Sale</h2>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg">
              <span className="text-sm font-medium">Kết thúc trong:</span>
              <div className="flex gap-1">
                <span className="bg-white text-accent px-2 py-1 rounded text-sm font-bold min-w-8 text-center">
                  {timeLeft.hours.toString().padStart(2, "0")}
                </span>
                <span className="text-white">:</span>
                <span className="bg-white text-accent px-2 py-1 rounded text-sm font-bold min-w-8 text-center">
                  {timeLeft.minutes.toString().padStart(2, "0")}
                </span>
                <span className="text-white">:</span>
                <span className="bg-white text-accent px-2 py-1 rounded text-sm font-bold min-w-8 text-center">
                  {timeLeft.seconds.toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="text-accent border-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
          >
            Xem tất cả
          </Button>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {flashSaleProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="relative mb-3">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                    -{product.discount}%
                  </Badge>
                </div>

                <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                  {product.name}
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-bold text-lg">{formatPrice(product.salePrice)}</span>
                  </div>
                  <span className="text-muted-foreground text-sm line-through">
                    {formatPrice(product.originalPrice)}
                  </span>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <Progress value={(product.sold / product.total) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Đã bán {product.sold}/{product.total}
                    </p>
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
