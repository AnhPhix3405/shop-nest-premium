'use client';

import { Search, ShoppingCart, Bell, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/lib/store/types'
import { logout } from '@/lib/store/authSlice'
import { useRouter } from 'next/navigation'
import { API_BASE_URL, buildEndpoint } from '@/config/api'

export function Header() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleUserNavigation = () => {
    if (!user) return;

    if (user.role === 'customer') {
      router.push('/customer/purchase');
    } else if (user.role === 'seller') {
      router.push('/seller/products');
    } else if (user.role === 'admin') {
      router.push('/admin/dashboard');
    }
  };

  const handleLogout = async () => {
    if (!user) return;

    // Confirm logout
    const confirmLogout = window.confirm('Bạn có chắc chắn muốn đăng xuất?');
    if (!confirmLogout) return;

    try {
      // Call logout API
      const response = await fetch(`${API_BASE_URL}${buildEndpoint.auth.logout()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Logout failed');
      }

      // Clear Redux state
      // Show success message
      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi hệ thống",
      });
      dispatch(logout());
      // Redirect to home page
      // router.push('/');

    } catch (error: any) {
      console.error('Logout error:', error);
      
      toast({
        title: "Lỗi đăng xuất",
        description: error.message || "Có lỗi xảy ra khi đăng xuất, nhưng bạn đã được đăng xuất khỏi thiết bị này",
        variant: "destructive"
      });

      // Still redirect to home
      // router.push('/');
    }
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2 text-sm">
          <div className="flex items-center gap-4">
            {user?.role === 'seller' ? (
              <Link href="/seller" className="hover:text-primary-foreground/80 transition-colors cursor-pointer">
                Kênh Người Bán
              </Link>
            ) : (
              <>
                <span>Kênh Người Bán</span>
                <span className="hidden md:inline">Trở thành Người bán ShopNest</span>
              </>
            )}
            <span className="hidden lg:inline">Tải ứng dụng</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline">Thông báo</span>
            <span className="hidden lg:inline">Hỗ trợ</span>
            <span className="hidden lg:inline">Tiếng Việt</span>
            {!user && (
              <>
                <Link href="/register" className="hover:text-primary-foreground/80 transition-colors cursor-pointer">
                  Đăng ký
                </Link>
                <Link href="/login" className="hover:text-primary-foreground/80 transition-colors cursor-pointer">
                  Đăng nhập
                </Link>
              </>
            )}
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
          <div className="flex-1 max-w-4xl">
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
            {/* Shopping cart - only for customers */}
            {(!user || user.role === 'customer') && (
              <Button
                variant="ghost"
                size="sm"
                className="relative text-primary-foreground hover:bg-primary-foreground/10"
              >
                <ShoppingCart className="w-6 h-6" />
                <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground min-w-5 h-5 text-xs">3</Badge>
              </Button>
            )}

            {/* Notifications */}
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

            {!user ? (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
                    <User className="w-6 h-6" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium hidden sm:block">{user.username}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full p-0 hover:bg-primary-foreground/10">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} alt={user.username} />
                        <AvatarFallback className="text-primary text-sm font-medium">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} alt={user.username} />
                        <AvatarFallback className="text-sm">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.username}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleUserNavigation} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      {user.role === 'customer' ? 'Đơn mua' : 
                       user.role === 'seller' ? 'Quản lý sản phẩm' : 'Dashboard'}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Hồ sơ cá nhân
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
