'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category_id: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  
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

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
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
  };



  const validateForm = (): boolean => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement API call
      console.log('Form data to submit:', {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category_id: parseInt(formData.category_id)
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful response with product ID
      const mockProductId = 123; // Sẽ thay thế bằng response từ API
      
      // Show success toast
      toast({
        title: "Tạo sản phẩm thành công! 🎉",
        description: "Sản phẩm đã được tạo. Bạn sẽ được chuyển đến trang upload ảnh.",
      });
      
      // Redirect to image upload page after short delay
      setTimeout(() => {
        router.push(`/seller/products/${mockProductId}/upload/images`);
      }, 1500);
      
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể tạo sản phẩm. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Tạo sản phẩm mới</h1>
          <p className="text-muted-foreground">
            Thêm sản phẩm mới vào cửa hàng của bạn
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>
              Thông tin cơ bản về sản phẩm của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên sản phẩm <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nhập tên sản phẩm..."
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả sản phẩm</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Mô tả chi tiết về sản phẩm..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/5000 ký tự
              </p>
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>
                Danh mục <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleInputChange('category_id', value)}
              >
                <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Chọn danh mục..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-red-500">{errors.category_id}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Price & Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Giá cả & Kho hàng</CardTitle>
            <CardDescription>
              Thiết lập giá bán và số lượng tồn kho
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">
                Giá bán (VNĐ) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="1000"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <Label htmlFor="stock">
                Số lượng tồn kho <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                placeholder="0"
                className={errors.stock ? 'border-red-500' : ''}
              />
              {errors.stock && (
                <p className="text-sm text-red-500">{errors.stock}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Note về ảnh sản phẩm */}
        <Card>
          <CardHeader>
            <CardTitle>Hình ảnh sản phẩm</CardTitle>
            <CardDescription>
              Sau khi tạo sản phẩm thành công, bạn sẽ được chuyển đến trang upload ảnh
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Upload className="h-4 w-4" />
              <AlertDescription>
                <strong>Lưu ý:</strong> Bạn sẽ có thể thêm ảnh sản phẩm ở bước tiếp theo sau khi tạo sản phẩm thành công.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Separator />

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang tạo...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Tạo sản phẩm
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
