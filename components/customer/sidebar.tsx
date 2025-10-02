'use client';

import { useAppSelector } from '@/lib/hooks/redux';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Edit, 
  Bell, 
  Settings, 
  ShoppingBag, 
  Ticket, 
  Coins,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

const sidebarItems: SidebarItem[] = [
  {
    icon: Bell,
    label: 'Thông báo',
    href: '/customer/notifications',
    badge: 5
  },
  {
    icon: Settings,
    label: 'Tài khoản của tôi',
    href: '/customer/account'
  },
  {
    icon: ShoppingBag,
    label: 'Đơn mua',
    href: '/customer/purchase'
  },
  {
    icon: Ticket,
    label: 'Kho voucher',
    href: '/customer/vouchers'
  },
  {
    icon: Coins,
    label: 'ShopNest xu',
    href: '/customer/coins',
    badge: 1250
  }
];

export function CustomerSidebar() {
  const { user } = useAppSelector(state => state.auth);
  const pathname = usePathname();

  if (!user) {
    return null;
  }

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      {/* User Profile Section */}
      <Card className="m-4 border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate text-sm">
                  {user.username}
                </h3>
                {user.is_verified && (
                  <Shield className="w-3 h-3 text-green-600 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-600 truncate">{user.email}</p>
            </div>
          </div>
          
          <Link href="/customer/profile">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs border-gray-300 hover:bg-white"
            >
              <Edit className="w-3 h-3 mr-1" />
              Sửa hồ sơ
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Navigation Menu */}
      <nav className="px-4 pb-4">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200" 
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4 flex-shrink-0",
                    isActive ? "text-blue-600" : "text-gray-500"
                  )} />
                  
                  <span className="flex-1">{item.label}</span>
                  
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "px-2 py-0.5 text-xs font-medium",
                        isActive 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {item.badge > 999 ? '999+' : item.badge}
                    </Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
