'use client';

import React, { useState, useMemo } from 'react';
import SellerSidebar from '@/components/seller/sidebar';
import { 
  Search, 
  Filter, 
  Calendar,
  Eye,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data types
interface Product {
  id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  orderDate: string;
  totalAmount: number;
  products: Product[];
  shippingAddress: string;
  paymentMethod: string;
}

// Mock orders data
const mockOrders: Order[] = [
  {
    id: 'ORD001',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    status: 'pending',
    orderDate: '2024-10-10',
    totalAmount: 299000,
    products: [
      {
        id: 1,
        name: 'iPhone 15 Pro Max',
        image: '/iphone-15-pro-max.png',
        quantity: 1,
        price: 299000
      }
    ],
    shippingAddress: '123 Đường ABC, Quận 1, TP.HCM',
    paymentMethod: 'COD'
  },
  {
    id: 'ORD002',
    customerName: 'Trần Thị B',
    customerPhone: '0912345678',
    status: 'processing',
    orderDate: '2024-10-09',
    totalAmount: 150000,
    products: [
      {
        id: 2,
        name: 'AirPods Pro 2',
        image: '/airpods-pro-2.png',
        quantity: 1,
        price: 89000
      },
      {
        id: 3,
        name: 'MacBook Air M3',
        image: '/macbook-air-m3.png',
        quantity: 1,
        price: 61000
      }
    ],
    shippingAddress: '456 Đường XYZ, Quận 3, TP.HCM',
    paymentMethod: 'Banking'
  },
  {
    id: 'ORD003',
    customerName: 'Lê Văn C',
    customerPhone: '0923456789',
    status: 'shipped',
    orderDate: '2024-10-08',
    totalAmount: 199000,
    products: [
      {
        id: 4,
        name: 'Samsung Galaxy S24',
        image: '/samsung-galaxy-s24.png',
        quantity: 2,
        price: 199000
      }
    ],
    shippingAddress: '789 Đường DEF, Quận 7, TP.HCM',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'ORD004',
    customerName: 'Phạm Thị D',
    customerPhone: '0934567890',
    status: 'delivered',
    orderDate: '2024-10-07',
    totalAmount: 89000,
    products: [
      {
        id: 5,
        name: 'iPad Pro 11 inch',
        image: '/ipad-pro-11-inch.png',
        quantity: 1,
        price: 89000
      }
    ],
    shippingAddress: '321 Đường GHI, Quận 2, TP.HCM',
    paymentMethod: 'COD'
  },
  {
    id: 'ORD005',
    customerName: 'Hoàng Văn E',
    customerPhone: '0945678901',
    status: 'cancelled',
    orderDate: '2024-10-06',
    totalAmount: 45000,
    products: [
      {
        id: 6,
        name: 'Men Basic Cotton T-Shirt',
        image: '/men-basic-cotton-t-shirt.png',
        quantity: 3,
        price: 45000
      }
    ],
    shippingAddress: '654 Đường JKL, Quận 5, TP.HCM',
    paymentMethod: 'Banking'
  },
  {
    id: 'ORD006',
    customerName: 'Đỗ Thị F',
    customerPhone: '0956789012',
    status: 'returned',
    orderDate: '2024-10-05',
    totalAmount: 120000,
    products: [
      {
        id: 7,
        name: 'Unisex Oversized Hoodie',
        image: '/unisex-oversized-hoodie-trending.png',
        quantity: 1,
        price: 75000
      },
      {
        id: 8,
        name: 'Women Sport Sneakers',
        image: '/women-sport-sneakers.png',
        quantity: 1,
        price: 45000
      }
    ],
    shippingAddress: '987 Đường MNO, Quận 4, TP.HCM',
    paymentMethod: 'Credit Card'
  }
];

const statusConfig = {
  pending: { 
    label: 'Chờ xử lý', 
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock
  },
  processing: { 
    label: 'Đang xử lý', 
    color: 'bg-blue-100 text-blue-800',
    icon: Package
  },
  shipped: { 
    label: 'Đã gửi hàng', 
    color: 'bg-purple-100 text-purple-800',
    icon: Truck
  },
  delivered: { 
    label: 'Đã giao hàng', 
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  cancelled: { 
    label: 'Đã hủy', 
    color: 'bg-red-100 text-red-800',
    icon: XCircle
  },
  returned: { 
    label: 'Đã trả hàng', 
    color: 'bg-orange-100 text-orange-800',
    icon: RotateCcw
  }
};

export default function AllOrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Filter orders based on status, search term, and date
  const filteredOrders = useMemo(() => {
    return mockOrders.filter(order => {
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
      const matchesSearch = searchTerm === '' || 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm);
      const matchesDate = dateFilter === '' || order.orderDate === dateFilter;
      
      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [selectedStatus, searchTerm, dateFilter]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SellerSidebar />
      
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý đơn hàng</h1>
          <p className="text-gray-600">Quản lý tất cả đơn hàng của shop</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn hàng, tên khách hàng, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Date Filter */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
              <p className="text-gray-500">Thử thay đổi bộ lọc để xem thêm đơn hàng</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon;
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">#{order.id}</h3>
                        <p className="text-sm text-gray-500">{formatDate(order.orderDate)}</p>
                      </div>
                      <div className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        statusConfig[order.status].color
                      )}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[order.status].label}
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Thông tin khách hàng</h4>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                      <p className="text-sm text-gray-600">{order.customerPhone}</p>
                      <p className="text-sm text-gray-600 mt-1">{order.shippingAddress}</p>
                      <p className="text-sm text-gray-600 mt-1">Thanh toán: {order.paymentMethod}</p>
                    </div>

                    {/* Products */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Sản phẩm</h4>
                      <div className="space-y-2">
                        {order.products.map((product) => (
                          <div key={product.id} className="flex items-center space-x-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-md bg-gray-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.jpg';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                x{product.quantity} • {formatPrice(product.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Tổng đơn hàng</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          Số lượng: {order.products.reduce((sum, product) => sum + product.quantity, 0)} sản phẩm
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary */}
        {filteredOrders.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Hiển thị {filteredOrders.length} đơn hàng</span>
              <span>
                Tổng giá trị: {formatPrice(
                  filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0)
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
