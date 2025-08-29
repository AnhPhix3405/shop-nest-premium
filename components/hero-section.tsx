"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const banners = [
  {
    id: 1,
    title: "Siêu Sale 12.12",
    subtitle: "Giảm đến 50% cho tất cả sản phẩm",
    image: "/ecommerce-sale-banner-with-shopping-items.png",
    cta: "Mua ngay",
  },
  {
    id: 2,
    title: "Thời trang mùa đông",
    subtitle: "Bộ sưu tập mới nhất 2024",
    image: "/winter-fashion-banner.png",
    cta: "Khám phá",
  },
  {
    id: 3,
    title: "Điện tử - Công nghệ",
    subtitle: "Ưu đãi đặc biệt cho thiết bị điện tử",
    image: "/electronics-technology-sale-banner.png",
    cta: "Xem ngay",
  },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main banner */}
        <div className="lg:col-span-3 relative overflow-hidden rounded-lg">
          <div className="relative h-80 lg:h-96">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image src={banner.image || "/placeholder.svg"} alt={banner.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                <div className="absolute left-8 top-1/2 -translate-y-1/2 text-white">
                  <h2 className="text-4xl font-bold mb-2 text-balance">{banner.title}</h2>
                  <p className="text-xl mb-6 text-pretty">{banner.subtitle}</p>
                  <Button size="lg" className="bg-accent hover:bg-accent/90">
                    {banner.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
            onClick={nextSlide}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? "bg-white" : "bg-white/50"
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>

        {/* Side banners */}
        <div className="space-y-4">
          <div className="relative h-44 rounded-lg overflow-hidden">
            <Image src="/flash-sale-countdown-banner.png" alt="Flash Sale" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="font-bold text-lg">Flash Sale</h3>
              <p className="text-sm">Kết thúc trong 2h</p>
            </div>
          </div>

          <div className="relative h-44 rounded-lg overflow-hidden">
            <Image src="/voucher-discount-banner.png" alt="Voucher" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="font-bold text-lg">Voucher 100K</h3>
              <p className="text-sm">Miễn phí vận chuyển</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
