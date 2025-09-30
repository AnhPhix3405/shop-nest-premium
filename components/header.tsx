import { Search, ShoppingCart, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2 text-sm">
          <div className="flex items-center gap-4">
            <span>Kênh Người Bán</span>
            <span>Trở thành Người bán ShopNest</span>
            <span>Tải ứng dụng</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Thông báo</span>
            <span>Hỗ trợ</span>
            <span>Tiếng Việt</span>
            <Link href="/register" className="hover:text-primary-foreground/80 transition-colors cursor-pointer">
              Đăng ký
            </Link>
            <Link href="/login" className="hover:text-primary-foreground/80 transition-colors cursor-pointer">
              Đăng nhập
            </Link>
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center gap-8 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-foreground rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-xl">SN</span>
            </div>
            <h1 className="text-2xl font-bold">ShopNest</h1>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Input
                placeholder="Tìm kiếm sản phẩm, thương hiệu và tên shop"
                className="w-full pl-4 pr-12 py-3 bg-white text-foreground border-0 rounded-sm"
              />
              <Button
                size="sm"
                className="absolute right-0 top-0 h-full px-6 bg-accent hover:bg-accent/90 rounded-l-none"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="text-primary-foreground/80">Áo khoác</span>
              <span className="text-primary-foreground/80">Điện thoại</span>
              <span className="text-primary-foreground/80">Laptop</span>
              <span className="text-primary-foreground/80">Giày thể thao</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              className="relative text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ShoppingCart className="w-6 h-6" />
              <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground min-w-5 h-5 text-xs">3</Badge>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="relative text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Bell className="w-6 h-6" />
              <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground min-w-5 h-5 text-xs">
                5
              </Badge>
            </Button>

            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
              <User className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
