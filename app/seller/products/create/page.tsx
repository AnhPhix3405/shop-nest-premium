'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCreateProduct } from '@/hooks/useProduct';

export default function CreateProductPage() {
  const router = useRouter();
  
  // Sử dụng hook useCreateProduct để thay thế tất cả logic
  const {
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
    resetCreatedProduct,
  } = useCreateProduct();

  // Nếu đã tạo thành công, hiển thị success screen
  if (createdProduct) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">
              Tạo sản phẩm thành công!
            </CardTitle>
            <CardDescription className="text-green-700">
              Sản phẩm "{createdProduct.name}" đã được tạo và lưu vào hệ thống.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Info */}
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-semibold mb-3">Thông tin sản phẩm</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">ID sản phẩm:</span> #{createdProduct.id}
                </div>
                <div>
                  <span className="font-medium">Tên:</span> {createdProduct.name}
                </div>
                <div>
                  <span className="font-medium">Giá:</span> {createdProduct.price.toLocaleString()} VNĐ
                </div>
                <div>
                  <span className="font-medium">Tồn kho:</span> {createdProduct.stock}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleUploadImages}
                className="flex items-center gap-2"
                size="lg"
              >
                <Upload className="h-4 w-4" />
                Thêm ảnh sản phẩm
              </Button>
              <Button 
                variant="outline" 
                onClick={handleViewProduct}
                size="lg"
              >
                Xem sản phẩm
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  resetCreatedProduct();
                  router.push('/seller/products');
                }}
                size="lg"
              >
                Quay về danh sách
              </Button>
            </div>

            <Alert>
              <Upload className="h-4 w-4" />
              <AlertDescription>
                <strong>Tiếp theo:</strong> Hãy thêm ảnh để sản phẩm của bạn trở nên hấp dẫn hơn với khách hàng.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      {/* Authentication Check */}
      {!user && (
        <Alert className="mb-6">
          <AlertDescription>
            Vui lòng đăng nhập để tạo sản phẩm.
          </AlertDescription>
        </Alert>
      )}

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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !user}
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
