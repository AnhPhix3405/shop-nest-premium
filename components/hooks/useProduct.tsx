'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/types';
import { toast } from '@/components/ui/use-toast';
import { ProductService, type Product, type ProductFormData as ServiceProductFormData } from '@/lib/services/productService';
import { logout } from '@/lib/store/authSlice';
import { useAppDispatch } from '@/lib/hooks/redux';
// Types for hook
export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category_id: string;
}

// useCreateProduct Hook
export const useCreateProduct = () => {
  const dispatch = useAppDispatch();

  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: ''
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);

  // Mock categories (sau này sẽ fetch từ API)
  const categories = [
    { id: '1', name: 'Điện tử' },
    { id: '2', name: 'Thời trang' },
    { id: '3', name: 'Nhà cửa & Đời sống' },
    { id: '4', name: 'Sách & Văn phòng phẩm' },
    { id: '5', name: 'Thể thao & Du lịch' },
    { id: '6', name: 'Làm đẹp & Sức khỏe' },
    { id: '7', name: 'Ô tô & Xe máy' },
    { id: '8', name: 'Khác' }
  ];

  // Handle input changes
  const handleInputChange = useCallback((field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error khi user nhập lại
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên sản phẩm là bắt buộc';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Tên sản phẩm phải có ít nhất 3 ký tự';
    } else if (formData.name.length > 200) {
      newErrors.name = 'Tên sản phẩm không được vượt quá 200 ký tự';
    }

    if (formData.description && formData.description.length > 5000) {
      newErrors.description = 'Mô tả không được vượt quá 5000 ký tự';
    }

    const price = parseFloat(formData.price);
    if (!formData.price) {
      newErrors.price = 'Giá sản phẩm là bắt buộc';
    } else if (isNaN(price) || price <= 0) {
      newErrors.price = 'Giá sản phẩm phải là số dương';
    }

    const stock = parseInt(formData.stock);
    if (!formData.stock) {
      newErrors.stock = 'Số lượng tồn kho là bắt buộc';
    } else if (isNaN(stock) || stock < 0) {
      newErrors.stock = 'Số lượng tồn kho không được âm';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Vui lòng chọn danh mục';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Check authentication
  const checkAuth = useCallback(() => {
    if (!user || !user.access_token) {
      toast({
        title: 'Lỗi xác thực',
        description: 'Vui lòng đăng nhập để tạo sản phẩm.',
        variant: 'destructive'
      });
      router.push('/login');
      return false;
    }
    return true;
  }, [user, router]);

  // Submit form
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkAuth()) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Prepare data for ProductService
      const productData: ServiceProductFormData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category_id: parseInt(formData.category_id)
      };

      console.log('🚀 Creating product with data:', productData);

      // Use ProductService instead of direct API call
      const result = await ProductService.createProduct(productData, user!.access_token);

      // Kiểm tra result thay vì dựa vào catch
      if (!result.success) {
        // Xử lý lỗi từ service
        const backendMessage = result.message || 'Đã có lỗi xảy ra khi tạo sản phẩm';

        // Alert đơn giản hiển thị lỗi
        if (typeof window !== 'undefined') {
          if (backendMessage === "Access token has expired") {
            alert('❌ Lỗi: Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            // Xử lý logout và redirect
            dispatch(logout());
            router.push('/login');
            return;
          }
          alert(`❌ Lỗi: ${backendMessage}`);
        }

        toast({
          title: 'Lỗi tạo sản phẩm',
          description: backendMessage,
          variant: 'destructive'
        });

        return;
      }

      console.log('✅ Product created successfully:', result);
      setCreatedProduct(result.data!);

      toast({
        title: 'Thành công!',
        description: `Sản phẩm "${result.data!.name}" đã được tạo thành công.`,
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: ''
      });

    } catch (error: any) {
      console.error('❌ Unexpected error:', error);

      // Chỉ xử lý các lỗi không dự đoán được (network, parsing, etc.)
      const errorMessage = 'Lỗi kết nối mạng. Vui lòng thử lại.';

      if (typeof window !== 'undefined') {
        alert(`❌ Lỗi: ${errorMessage}`);
      }

      toast({
        title: 'Lỗi hệ thống',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, checkAuth, user]);

  // Navigation functions
  const handleUploadImages = useCallback(() => {
    if (createdProduct) {
      router.push(`/seller/products/${createdProduct.id}/upload/images`);
    }
  }, [createdProduct, router]);

  const handleViewProduct = useCallback(() => {
    if (createdProduct) {
      router.push(`/seller/products/${createdProduct.id}`);
    }
  }, [createdProduct, router]);

  const handleBackToList = useCallback(() => {
    setCreatedProduct(null);
    router.push('/seller/products');
  }, [router]);

  const resetCreatedProduct = useCallback(() => {
    setCreatedProduct(null);
  }, []);

  return {
    // State
    formData,
    isSubmitting,
    errors,
    createdProduct,
    categories,
    user,

    // Actions
    handleInputChange,
    handleSubmit,
    handleUploadImages,
    handleViewProduct,
    handleBackToList,
    resetCreatedProduct,

    // Utils
    validateForm,
    checkAuth
  };
};
