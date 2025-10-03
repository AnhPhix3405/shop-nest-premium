'use client';

import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks/redux';
import { CustomerSidebar } from '@/components/customer/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  ShoppingBag, 
  Clock, 
  Truck, 
  Package, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Search,
  Star
} from 'lucide-react';

// Mock order data
const mockOrders = [
  {
    id: 'ORD001',
    status: 'pending',
    total: 2500000,
    items: 3,
    date: '2025-10-01',
    shopName: 'Official Apple Store',
    products: [
      { 
        id: 1,
        name: 'iPhone 15 Pro Max 256GB Natural Titanium', 
        image: '/iphone-15-pro-max.png', 
        price: 2000000, 
        quantity: 1,
        variant: 'Natural Titanium, 256GB'
      },
      { 
        id: 2,
        name: 'AirPods Pro 2nd Generation', 
        image: '/airpods-pro-2.png', 
        price: 500000, 
        quantity: 1,
        variant: 'Trắng'
      }
    ]
  },
  {
    id: 'ORD002',
    status: 'shipping',
    total: 15000000,
    items: 1,
    date: '2025-09-28',
    shopName: 'MacBook Official',
    products: [
      { 
        id: 3,
        name: 'MacBook Air M3 13-inch', 
        image: '/macbook-air-m3.png', 
        price: 15000000, 
        quantity: 1,
        variant: 'Silver, 256GB SSD, 8GB RAM'
      }
    ]
  },
  {
    id: 'ORD003',
    status: 'delivered',
    total: 750000,
    items: 1,
    date: '2025-09-25',
    shopName: 'Smart Watch Pro',
    products: [
      { 
        id: 4,
        name: 'Men Smart Watch Series 9', 
        image: '/men-smart-watch.png', 
        price: 750000, 
        quantity: 1,
        variant: 'Đen, 45mm'
      }
    ]
  },
  {
    id: 'ORD004',
    status: 'completed',
    total: 3000000,
    items: 2,
    date: '2025-09-20',
    shopName: 'Samsung Official Store',
    products: [
      { 
        id: 5,
        name: 'Samsung Galaxy S24 Ultra', 
        image: '/samsung-galaxy-s24.png', 
        price: 1800000, 
        quantity: 1,
        variant: 'Titanium Black, 256GB'
      },
      { 
        id: 6,
        name: 'Premium Bluetooth Headphones', 
        image: '/premium-bluetooth-headphones.png', 
        price: 1200000, 
        quantity: 1,
        variant: 'Noise Cancelling'
      }
    ]
  },
  {
    id: 'ORD005',
    status: 'cancelled',
    total: 900000,
    items: 1,
    date: '2025-09-15',
    shopName: 'iPad Store Vietnam',
    products: [
      { 
        id: 7,
        name: 'iPad Pro 11-inch M4', 
        image: '/ipad-pro-11-inch.png', 
        price: 900000, 
        quantity: 1,
        variant: 'Space Gray, WiFi, 128GB'
      }
    ]
  },
  {
    id: 'ORD006',
    status: 'return',
    total: 450000,
    items: 1,
    date: '2025-09-10',
    shopName: 'Fashion House',
    products: [
      { 
        id: 8,
        name: 'Women Leather Handbag Premium', 
        image: '/women-leather-handbag.png', 
        price: 450000, 
        quantity: 1,
        variant: 'Brown, Size M'
      }
    ]
  }
];

const getStatusConfig = (status: string) => {
  const configs = {
    pending: { 
      label: 'Chờ xác nhận', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      icon: Clock 
    },
    shipping: { 
      label: 'Vận chuyển', 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      icon: Truck 
    },
    delivered: { 
      label: 'Chờ giao hàng', 
      color: 'bg-purple-100 text-purple-800 border-purple-200', 
      icon: Package 
    },
    completed: { 
      label: 'Hoàn thành', 
      color: 'bg-green-100 text-green-800 border-green-200', 
      icon: CheckCircle 
    },
    cancelled: { 
      label: 'Đã hủy', 
      color: 'bg-red-100 text-red-800 border-red-200', 
      icon: XCircle 
    },
    return: { 
      label: 'Trả hàng/Hoàn tiền', 
      color: 'bg-orange-100 text-orange-800 border-orange-200', 
      icon: RotateCcw 
    }
  };
  return configs[status as keyof typeof configs] || configs.pending;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export default function PurchasePage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAppSelector(state => state.auth);

  // Check if no user or user role is not customer
  if (!user || user.role !== 'customer') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 text-lg">
            This is not the web page you are looking for
          </p>
        </div>
      </div>
    );
  }

  // Lọc orders theo tab và search
  const filteredOrders = mockOrders.filter(order => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.products.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const getOrderCount = (status: string) => {
    if (status === 'all') return mockOrders.length;
    return mockOrders.filter(order => order.status === status).length;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <CustomerSidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Đơn mua</h1>
            <p className="text-gray-600">Quản lý và theo dõi tất cả đơn hàng của bạn</p>
          </div>

          {/* Orders Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingBag className="w-5 h-5" />
                  Danh sách đơn hàng
                </CardTitle>
                
                {/* Search Orders */}
                <div className="relative w-80">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm theo mã đơn hàng, tên shop, sản phẩm..."
                    className="pl-10 bg-gray-50 border-gray-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Tabs Navigation */}
                <div className="border-b border-gray-200 px-6">
                  <TabsList className="grid w-full grid-cols-7 bg-transparent h-auto p-0 gap-0">
                    <TabsTrigger 
                      value="all" 
                      className="flex items-center justify-center gap-2 py-4 px-3 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent bg-transparent text-gray-600 hover:text-gray-900 rounded-none"
                    >
                      <span className="font-medium">Tất cả</span>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        {getOrderCount('all')}
                      </Badge>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="pending"
                      className="flex items-center justify-center gap-2 py-4 px-3 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent bg-transparent text-gray-600 hover:text-gray-900 rounded-none"
                    >
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Chờ xác nhận</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">
                        {getOrderCount('pending')}
                      </Badge>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="shipping"
                      className="flex items-center justify-center gap-2 py-4 px-3 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent bg-transparent text-gray-600 hover:text-gray-900 rounded-none"
                    >
                      <Truck className="w-4 h-4" />
                      <span className="font-medium">Vận chuyển</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                        {getOrderCount('shipping')}
                      </Badge>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="delivered"
                      className="flex items-center justify-center gap-2 py-4 px-3 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent bg-transparent text-gray-600 hover:text-gray-900 rounded-none"
                    >
                      <Package className="w-4 h-4" />
                      <span className="font-medium">Chờ giao hàng</span>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                        {getOrderCount('delivered')}
                      </Badge>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="completed"
                      className="flex items-center justify-center gap-2 py-4 px-3 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent bg-transparent text-gray-600 hover:text-gray-900 rounded-none"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Hoàn thành</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                        {getOrderCount('completed')}
                      </Badge>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="cancelled"
                      className="flex items-center justify-center gap-2 py-4 px-3 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent bg-transparent text-gray-600 hover:text-gray-900 rounded-none"
                    >
                      <XCircle className="w-4 h-4" />
                      <span className="font-medium">Đã hủy</span>
                      <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                        {getOrderCount('cancelled')}
                      </Badge>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="return"
                      className="flex items-center justify-center gap-2 py-4 px-3 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent bg-transparent text-gray-600 hover:text-gray-900 rounded-none"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="font-medium">Trả hàng</span>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                        {getOrderCount('return')}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tabs Content */}
                <div className="p-6">
                  {['all', 'pending', 'shipping', 'delivered', 'completed', 'cancelled', 'return'].map(tab => (
                    <TabsContent key={tab} value={tab} className="mt-0">
                      {filteredOrders.length === 0 ? (
                        <div className="text-center py-16">
                          <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchQuery ? 'Không tìm thấy đơn hàng nào' : 'Chưa có đơn hàng nào'}
                          </h3>
                          <p className="text-gray-500">
                            {searchQuery 
                              ? 'Thử tìm kiếm với từ khóa khác' 
                              : 'Đơn hàng của bạn sẽ hiển thị ở đây'
                            }
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {filteredOrders.map(order => {
                            const statusConfig = getStatusConfig(order.status);
                            const StatusIcon = statusConfig.icon;
                            
                            return (
                              <Card key={order.id} className="border border-gray-200 hover:shadow-md transition-shadow duration-200">
                                <CardContent className="p-0">
                                  {/* Order Header */}
                                  <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                                    <div className="flex items-center gap-4">
                                      <div>
                                        <p className="text-sm text-gray-500">Mã đơn hàng</p>
                                        <p className="font-semibold text-gray-900">#{order.id}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">Shop</p>
                                        <p className="font-medium text-gray-900">{order.shopName}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <Badge className={statusConfig.color}>
                                        <StatusIcon className="w-3 h-3 mr-1" />
                                        {statusConfig.label}
                                      </Badge>
                                      <div className="text-right">
                                        <p className="text-sm text-gray-500">{order.date}</p>
                                        <p className="font-bold text-lg text-gray-900">{formatCurrency(order.total)}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Order Products */}
                                  <div className="p-4">
                                    <div className="space-y-4">
                                      {order.products.map((product) => (
                                        <div key={product.id} className="flex items-center gap-4">
                                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border">
                                            <Package className="w-10 h-10 text-gray-400" />
                                          </div>
                                          <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 mb-1">{product.name}</h4>
                                            <p className="text-sm text-gray-500 mb-1">Phân loại: {product.variant}</p>
                                            <p className="text-sm text-gray-500">Số lượng: {product.quantity}</p>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-semibold text-lg text-gray-900">{formatCurrency(product.price)}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Order Actions */}
                                  <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50">
                                    <div className="text-sm text-gray-600">
                                      Tổng thanh toán: <span className="font-bold text-lg text-red-600">{formatCurrency(order.total)}</span>
                                    </div>
                                    <div className="flex gap-3">
                                      <Button variant="outline" size="sm">
                                        Xem chi tiết
                                      </Button>
                                      <Button variant="outline" size="sm">
                                        Liên hệ shop
                                      </Button>
                                      {order.status === 'pending' && (
                                        <Button variant="destructive" size="sm">
                                          Hủy đơn hàng
                                        </Button>
                                      )}
                                      {order.status === 'delivered' && (
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                          Đã nhận hàng
                                        </Button>
                                      )}
                                      {order.status === 'completed' && (
                                        <>
                                          <Button variant="outline" size="sm">
                                            <Star className="w-4 h-4 mr-1" />
                                            Đánh giá
                                          </Button>
                                          <Button size="sm">
                                            Mua lại
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
