'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ShoppingCart, 
  Package, 
  Megaphone, 
  DollarSign, 
  BarChart3, 
  Store, 
  Settings,
  ChevronDown,
  ChevronRight,
  FileText,
  RefreshCw,
  RotateCcw,
  Plus,
  AlertTriangle,
  TrendingUp,
  Wallet,
  CreditCard,
  PieChart,
  Activity,
  Star,
  User,
  Tag,
  Truck,
  MapPin,
  Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubMenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Quản lý đơn hàng',
    icon: ShoppingCart,
    subItems: [
      {
        title: 'Tất cả',
        href: '/seller/orders/all',
        icon: FileText
      },
      {
        title: 'Xử lý đơn hàng loạt',
        href: '/seller/orders/batch-processing',
        icon: RefreshCw
      },
      {
        title: 'Trả hàng/Hoàn tiền',
        href: '/seller/orders/returns-refunds',
        icon: RotateCcw
      }
    ]
  },
  {
    title: 'Quản lý sản phẩm',
    icon: Package,
    subItems: [
      {
        title: 'Tất cả sản phẩm',
        href: '/seller/products/all',
        icon: Package
      },
      {
        title: 'Thêm sản phẩm',
        href: '/seller/products/add',
        icon: Plus
      },
      {
        title: 'Sản phẩm vi phạm',
        href: '/seller/products/violations',
        icon: AlertTriangle
      }
    ]
  },
  {
    title: 'Kênh Marketing',
    icon: Megaphone,
    subItems: [
      {
        title: 'Kênh marketing và quảng cáo của tôi',
        href: '/seller/marketing/campaigns',
        icon: TrendingUp
      }
    ]
  },
  {
    title: 'Tài chính',
    icon: DollarSign,
    subItems: [
      {
        title: 'Doanh thu',
        href: '/seller/finance/revenue',
        icon: DollarSign
      },
      {
        title: 'Ví Shopee',
        href: '/seller/finance/wallet',
        icon: Wallet
      },
      {
        title: 'Tài khoản ngân hàng',
        href: '/seller/finance/bank-accounts',
        icon: CreditCard
      }
    ]
  },
  {
    title: 'Dữ liệu',
    icon: BarChart3,
    subItems: [
      {
        title: 'Phân tích bán hàng',
        href: '/seller/analytics/sales',
        icon: PieChart
      },
      {
        title: 'Hiệu quả hoạt động',
        href: '/seller/analytics/performance',
        icon: Activity
      }
    ]
  },
  {
    title: 'Quản lý shop',
    icon: Store,
    subItems: [
      {
        title: 'Đánh giá shop',
        href: '/seller/shop/reviews',
        icon: Star
      },
      {
        title: 'Hồ sơ shop',
        href: '/seller/shop/profile',
        icon: User
      },
      {
        title: 'Danh mục shop',
        href: '/seller/shop/categories',
        icon: Tag
      }
    ]
  },
  {
    title: 'Thiết lập shop',
    icon: Settings,
    subItems: [
      {
        title: 'Cài đặt vận chuyển shop',
        href: '/seller/settings/shipping',
        icon: Truck
      },
      {
        title: 'Địa chỉ',
        href: '/seller/settings/address',
        icon: MapPin
      },
      {
        title: 'Thiết lập cơ bản',
        href: '/seller/settings/basic',
        icon: Wrench
      }
    ]
  }
];

export default function SellerSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  const isParentActive = (subItems: SubMenuItem[]) => {
    return subItems.some(item => pathname === item.href);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Seller Center</h2>
      </div>
      
      <nav className="mt-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedItems.includes(item.title);
            const isParentItemActive = hasSubItems && item.subItems ? isParentActive(item.subItems) : false;

            return (
              <li key={item.title}>
                <div
                  onClick={() => {
                    if (hasSubItems) {
                      toggleExpanded(item.title);
                    } else if (item.href) {
                      router.push(item.href);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors",
                    isParentItemActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={cn(
                      "w-5 h-5",
                      isParentItemActive ? "text-blue-700" : "text-gray-500"
                    )} />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {hasSubItems && (
                    <div className="ml-auto">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>

                {hasSubItems && isExpanded && (
                  <ul className="mt-1 ml-6 space-y-1">
                    {item.subItems?.map((subItem) => (
                      <li key={subItem.title}>
                        <div
                          onClick={() => router.push(subItem.href)}
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                            isActive(subItem.href)
                              ? "bg-blue-100 text-blue-700 border-l-4 border-blue-700"
                              : "text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          <subItem.icon className={cn(
                            "w-4 h-4",
                            isActive(subItem.href) ? "text-blue-700" : "text-gray-400"
                          )} />
                          <span className="text-sm">{subItem.title}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
