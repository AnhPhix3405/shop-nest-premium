"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Star, X, MapPin, Truck, Store, Shield, Award, Gift } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"

interface SearchFilterProps {
  onFiltersChange?: (filters: any) => void
}

export default function SearchFilter({ onFiltersChange }: SearchFilterProps) {
  // State for all filters
  const [location, setLocation] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [shippingMethods, setShippingMethods] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 10000000])
  const [shopType, setShopType] = useState("")
  const [condition, setCondition] = useState("")
  const [rating, setRating] = useState("")
  const [services, setServices] = useState<string[]>([])
  const [promotions, setPromotions] = useState<string[]>([])

  // Collapsible states
  const [openSections, setOpenSections] = useState({
    location: true,
    category: true,
    shipping: true,
    price: true,
    shopType: true,
    condition: true,
    rating: true,
    services: false,
    promotions: false
  })

  // Mock data
  const categoryOptions = [
    "Thời trang nam",
    "Thời trang nữ", 
    "Điện thoại & Phụ kiện",
    "Máy tính & Laptop",
    "Máy ảnh & Máy quay phim",
    "Đồng hồ",
    "Giày dép nam",
    "Giày dép nữ",
    "Túi ví nam",
    "Túi ví nữ",
    "Thiết bị điện gia dụng",
    "Sức khỏe & Làm đẹp",
    "Nhà cửa & Đời sống"
  ]

  const shippingOptions = [
    "Giao hàng nhanh",
    "Giao hàng tiêu chuẩn", 
    "Giao hàng tiết kiệm",
    "Grab",
    "Viettel Post",
    "Giao hàng tận nơi",
    "J&T Express",
    "Shopee Express"
  ]

  const serviceOptions = [
    "Hoàn tiền 111%",
    "Trả góp 0%",
    "Freeship xtra",
    "30 ngày đổi trả",
    "Chính hãng 100%",
    "Giao hàng 2h",
    "Bảo hành tận nơi"
  ]

  const promotionOptions = [
    "Giảm giá sốc",
    "Mua 1 tặng 1",
    "Freeship",
    "Giảm 50%",
    "Flash sale",
    "Voucher xtra",
    "Combo tiết kiệm"
  ]

  // Toggle functions
  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }))
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setCategories(prev => [...prev, category])
    } else {
      setCategories(prev => prev.filter(c => c !== category))
    }
  }

  const handleShippingChange = (method: string, checked: boolean) => {
    if (checked) {
      setShippingMethods(prev => [...prev, method])
    } else {
      setShippingMethods(prev => prev.filter(m => m !== method))
    }
  }

  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setServices(prev => [...prev, service])
    } else {
      setServices(prev => prev.filter(s => s !== service))
    }
  }

  const handlePromotionChange = (promotion: string, checked: boolean) => {
    if (checked) {
      setPromotions(prev => [...prev, promotion])
    } else {
      setPromotions(prev => prev.filter(p => p !== promotion))
    }
  }

  const clearAllFilters = () => {
    setLocation("")
    setCategories([])
    setShippingMethods([])
    setPriceRange([0, 10000000])
    setShopType("")
    setCondition("")
    setRating("")
    setServices([])
    setPromotions([])
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < count ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <Card className="w-80 h-fit sticky top-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Bộ lọc tìm kiếm</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-1" />
            Xóa tất cả
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        
        {/* Nơi bán */}
        <Collapsible open={openSections.location} onOpenChange={() => toggleSection('location')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-blue-500" />
              <span className="font-medium">Nơi bán</span>
            </div>
            {openSections.location ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <Input
              placeholder="Nhập tỉnh thành, quận huyện..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Theo danh mục */}
        <Collapsible open={openSections.category} onOpenChange={() => toggleSection('category')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md">
            <div className="flex items-center">
              <Store className="w-4 h-4 mr-2 text-green-500" />
              <span className="font-medium">Theo danh mục</span>
            </div>
            {openSections.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {categoryOptions.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={categories.includes(category)}
                  onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                />
                <Label htmlFor={category} className="text-sm cursor-pointer">
                  {category}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Đơn vị vận chuyển */}
        <Collapsible open={openSections.shipping} onOpenChange={() => toggleSection('shipping')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md">
            <div className="flex items-center">
              <Truck className="w-4 h-4 mr-2 text-orange-500" />
              <span className="font-medium">Đơn vị vận chuyển</span>
            </div>
            {openSections.shipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {shippingOptions.map((method) => (
              <div key={method} className="flex items-center space-x-2">
                <Checkbox
                  id={method}
                  checked={shippingMethods.includes(method)}
                  onCheckedChange={(checked) => handleShippingChange(method, checked as boolean)}
                />
                <Label htmlFor={method} className="text-sm cursor-pointer">
                  {method}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Khoảng giá */}
        <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md">
            <div className="flex items-center">
              <span className="w-4 h-4 mr-2 text-red-500">₫</span>
              <span className="font-medium">Khoảng giá</span>
            </div>
            {openSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-3">
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={10000000}
                step={100000}
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{formatPrice(priceRange[0])}</span>
              <span>-</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Từ"
                value={priceRange[0].toLocaleString()}
                readOnly
                className="text-xs"
              />
              <Input
                placeholder="Đến"
                value={priceRange[1].toLocaleString()}
                readOnly
                className="text-xs"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Loại shop */}
        <Collapsible open={openSections.shopType} onOpenChange={() => toggleSection('shopType')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-purple-500" />
              <span className="font-medium">Loại shop</span>
            </div>
            {openSections.shopType ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <RadioGroup value={shopType} onValueChange={setShopType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mall" id="mall" />
                <Label htmlFor="mall" className="text-sm cursor-pointer">ShopNest Mall</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="preferred" id="preferred" />
                <Label htmlFor="preferred" className="text-sm cursor-pointer">Shop yêu thích</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="plus" id="plus" />
                <Label htmlFor="plus" className="text-sm cursor-pointer">ShopNest Plus</Label>
              </div>
            </RadioGroup>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Tình trạng */}
        <Collapsible open={openSections.condition} onOpenChange={() => toggleSection('condition')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md">
            <div className="flex items-center">
              <Badge variant="outline" className="w-4 h-4 mr-2 text-teal-500 border-teal-500" />
              <span className="font-medium">Tình trạng</span>
            </div>
            {openSections.condition ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <RadioGroup value={condition} onValueChange={setCondition}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new" className="text-sm cursor-pointer">Hàng mới</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="used" id="used" />
                <Label htmlFor="used" className="text-sm cursor-pointer">Hàng đã sử dụng</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="refurbished" id="refurbished" />
                <Label htmlFor="refurbished" className="text-sm cursor-pointer">Hàng tân trang</Label>
              </div>
            </RadioGroup>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Đánh giá */}
        <Collapsible open={openSections.rating} onOpenChange={() => toggleSection('rating')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md">
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              <span className="font-medium">Đánh giá</span>
            </div>
            {openSections.rating ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            <RadioGroup value={rating} onValueChange={setRating}>
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center space-x-2">
                  <RadioGroupItem value={stars.toString()} id={`${stars}-stars`} />
                  <Label htmlFor={`${stars}-stars`} className="flex items-center cursor-pointer">
                    <div className="flex mr-2">
                      {renderStars(stars)}
                    </div>
                    <span className="text-sm">từ {stars} sao</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Dịch vụ */}
        <Collapsible open={openSections.services} onOpenChange={() => toggleSection('services')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md">
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-2 text-indigo-500" />
              <span className="font-medium">Dịch vụ</span>
            </div>
            {openSections.services ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {serviceOptions.map((service) => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox
                  id={service}
                  checked={services.includes(service)}
                  onCheckedChange={(checked) => handleServiceChange(service, checked as boolean)}
                />
                <Label htmlFor={service} className="text-sm cursor-pointer">
                  {service}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Khuyến mãi */}
        <Collapsible open={openSections.promotions} onOpenChange={() => toggleSection('promotions')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md">
            <div className="flex items-center">
              <Gift className="w-4 h-4 mr-2 text-pink-500" />
              <span className="font-medium">Khuyến mãi</span>
            </div>
            {openSections.promotions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {promotionOptions.map((promotion) => (
              <div key={promotion} className="flex items-center space-x-2">
                <Checkbox
                  id={promotion}
                  checked={promotions.includes(promotion)}
                  onCheckedChange={(checked) => handlePromotionChange(promotion, checked as boolean)}
                />
                <Label htmlFor={promotion} className="text-sm cursor-pointer">
                  {promotion}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Applied Filters Summary */}
        {(categories.length > 0 || shippingMethods.length > 0 || services.length > 0 || promotions.length > 0 || shopType || condition || rating || location) && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Bộ lọc đã chọn:</h4>
              <div className="flex flex-wrap gap-1">
                {location && (
                  <Badge variant="secondary" className="text-xs">
                    📍 {location}
                  </Badge>
                )}
                {categories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
                {shippingMethods.map((method) => (
                  <Badge key={method} variant="secondary" className="text-xs">
                    🚚 {method}
                  </Badge>
                ))}
                {shopType && (
                  <Badge variant="secondary" className="text-xs">
                    🏪 {shopType === 'mall' ? 'ShopNest Mall' : shopType === 'preferred' ? 'Shop yêu thích' : 'ShopNest Plus'}
                  </Badge>
                )}
                {condition && (
                  <Badge variant="secondary" className="text-xs">
                    📦 {condition === 'new' ? 'Hàng mới' : condition === 'used' ? 'Hàng đã sử dụng' : 'Hàng tân trang'}
                  </Badge>
                )}
                {rating && (
                  <Badge variant="secondary" className="text-xs">
                    ⭐ {rating}+ sao
                  </Badge>
                )}
                {services.map((service) => (
                  <Badge key={service} variant="secondary" className="text-xs">
                    🎯 {service}
                  </Badge>
                ))}
                {promotions.map((promotion) => (
                  <Badge key={promotion} variant="secondary" className="text-xs">
                    🎁 {promotion}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
