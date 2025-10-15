'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  Link, 
  Check,
  AlertCircle,
  Camera,
  Plus
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

interface ImageItem {
  id: string;
  url: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

export default function UploadImagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId') || 'new-product';
  
  // States
  const [images, setImages] = useState<ImageItem[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const maxImages = 10;
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // Validate URL
  const isValidImageUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const extension = urlObj.pathname.split('.').pop()?.toLowerCase();
      return ['jpg', 'jpeg', 'png', 'webp'].includes(extension || '');
    } catch {
      return false;
    }
  };

  // Add image by URL
  const addImageByUrl = () => {
    const url = currentImageUrl.trim();
    
    if (!url) {
      setErrors(prev => ({ ...prev, url: 'Vui lòng nhập URL ảnh' }));
      return;
    }

    if (!isValidImageUrl(url)) {
      setErrors(prev => ({ ...prev, url: 'URL không hợp lệ hoặc không phải là ảnh' }));
      return;
    }

    if (images.length >= maxImages) {
      setErrors(prev => ({ ...prev, url: `Tối đa ${maxImages} ảnh cho một sản phẩm` }));
      return;
    }

    if (images.some(img => img.url === url)) {
      setErrors(prev => ({ ...prev, url: 'URL ảnh đã tồn tại' }));
      return;
    }

    const newImage: ImageItem = {
      id: `url-${Date.now()}`,
      url: url,
      status: 'uploading',
      progress: 0
    };

    setImages(prev => [...prev, newImage]);
    setCurrentImageUrl('');
    setErrors(prev => ({ ...prev, url: '' }));

    // Simulate upload progress
    simulateUpload(newImage.id, url);
  };

  // Simulate upload progress
  const simulateUpload = (imageId: string, url: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, progress: Math.min(progress, 100) }
          : img
      ));

      if (progress >= 100) {
        clearInterval(interval);
        // Simulate random success/error
        const isSuccess = Math.random() > 0.1; // 90% success rate
        
        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { 
                ...img, 
                status: isSuccess ? 'success' : 'error',
                progress: 100,
                error: isSuccess ? undefined : 'Không thể tải ảnh từ URL này'
              }
            : img
        ));
      }
    }, 200);
  };

  // Handle file upload
  const handleFileUpload = (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      if (!allowedImageTypes.includes(file.type)) {
        toast({
          title: "File không hợp lệ",
          description: `${file.name} không phải là file ảnh hợp lệ`,
          variant: "destructive"
        });
        return false;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File quá lớn",
          description: `${file.name} vượt quá giới hạn 10MB`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    if (images.length + validFiles.length > maxImages) {
      toast({
        title: "Quá số lượng cho phép",
        description: `Chỉ có thể upload tối đa ${maxImages} ảnh`,
        variant: "destructive"
      });
      return;
    }

    validFiles.forEach(file => {
      const imageId = `file-${Date.now()}-${Math.random()}`;
      const imageUrl = URL.createObjectURL(file);
      
      const newImage: ImageItem = {
        id: imageId,
        url: imageUrl,
        status: 'uploading',
        progress: 0
      };

      setImages(prev => [...prev, newImage]);
      
      // Simulate upload
      simulateFileUpload(imageId, file);
    });
  };

  // Simulate file upload
  const simulateFileUpload = (imageId: string, file: File) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25;
      
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, progress: Math.min(progress, 100) }
          : img
      ));

      if (progress >= 100) {
        clearInterval(interval);
        
        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, status: 'success', progress: 100 }
            : img
        ));
      }
    }, 150);
  };

  // Remove image
  const removeImage = (imageId: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === imageId);
      if (image && image.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  // Retry upload
  const retryUpload = (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, status: 'uploading', progress: 0, error: undefined }
        : img
    ));

    if (image.url.startsWith('blob:')) {
      // It's a file upload, simulate again
      simulateFileUpload(imageId, new File([], 'retry'));
    } else {
      // It's a URL upload
      simulateUpload(imageId, image.url);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Submit all images
  const handleSubmit = async () => {
    const successImages = images.filter(img => img.status === 'success');
    
    if (successImages.length === 0) {
      toast({
        title: "Chưa có ảnh nào",
        description: "Vui lòng thêm ít nhất một ảnh cho sản phẩm",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement API call to save images
      console.log('Images to save:', successImages.map(img => img.url));
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Upload ảnh thành công! 🎉",
        description: `Đã upload ${successImages.length} ảnh cho sản phẩm`,
      });
      
      // Redirect to product list or product detail
      setTimeout(() => {
        router.push('/seller/products');
      }, 1500);
      
    } catch (error) {
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể lưu ảnh. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const successCount = images.filter(img => img.status === 'success').length;
  const uploadingCount = images.filter(img => img.status === 'uploading').length;
  const errorCount = images.filter(img => img.status === 'error').length;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
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
          <h1 className="text-3xl font-bold">Upload ảnh sản phẩm</h1>
          <p className="text-muted-foreground">
            Thêm ảnh để khách hàng có thể xem sản phẩm của bạn (tối đa {maxImages} ảnh)
          </p>
        </div>
      </div>

      {/* Stats */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{images.length}</div>
              <div className="text-sm text-muted-foreground">Tổng ảnh</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-muted-foreground">Thành công</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{uploadingCount}</div>
              <div className="text-sm text-muted-foreground">Đang tải</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-muted-foreground">Lỗi</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Methods */}
        <div className="lg:col-span-1 space-y-4">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Upload từ máy tính
              </CardTitle>
              <CardDescription>
                Chọn ảnh từ thiết bị của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Kéo và thả ảnh vào đây hoặc
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-input')?.click()}
                    disabled={images.length >= maxImages}
                  >
                    Chọn file
                  </Button>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileUpload(e.target.files);
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG, WebP - Tối đa 10MB mỗi file
                </p>
              </div>
            </CardContent>
          </Card>

          {/* URL Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Upload từ URL
              </CardTitle>
              <CardDescription>
                Thêm ảnh từ đường link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL ảnh</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentImageUrl}
                    onChange={(e) => {
                      setCurrentImageUrl(e.target.value);
                      if (errors.url) {
                        setErrors(prev => ({ ...prev, url: '' }));
                      }
                    }}
                    placeholder="https://example.com/image.jpg"
                    className={errors.url ? 'border-red-500' : ''}
                    disabled={images.length >= maxImages}
                  />
                  <Button
                    type="button"
                    onClick={addImageByUrl}
                    disabled={!currentImageUrl.trim() || images.length >= maxImages}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.url && (
                  <p className="text-sm text-red-500">{errors.url}</p>
                )}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Đảm bảo URL ảnh có thể truy cập công khai và kết thúc bằng .jpg, .png hoặc .webp
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Image Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Ảnh đã thêm ({images.length}/{maxImages})
              </CardTitle>
              <CardDescription>
                Xem trước và quản lý ảnh sản phẩm
              </CardDescription>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Chưa có ảnh nào được thêm
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sử dụng các phương thức bên trái để thêm ảnh
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((image, index) => (
                    <div key={image.id} className="relative border rounded-lg overflow-hidden">
                      {/* Image */}
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        <img
                          src={image.url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden flex-col items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-8 w-8 mb-2" />
                          <span className="text-sm">Không thể tải ảnh</span>
                        </div>
                      </div>

                      {/* Status Overlay */}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        {image.status === 'uploading' && (
                          <div className="text-white text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                            <div className="text-sm">Đang tải... {Math.round(image.progress || 0)}%</div>
                            <Progress 
                              value={image.progress || 0} 
                              className="w-24 mt-2 bg-white/20"
                            />
                          </div>
                        )}
                        
                        {image.status === 'success' && (
                          <div className="text-white text-center">
                            <div className="rounded-full bg-green-500 p-2 mx-auto mb-2">
                              <Check className="h-4 w-4" />
                            </div>
                            <div className="text-sm">Thành công</div>
                          </div>
                        )}
                        
                        {image.status === 'error' && (
                          <div className="text-white text-center">
                            <div className="rounded-full bg-red-500 p-2 mx-auto mb-2">
                              <X className="h-4 w-4" />
                            </div>
                            <div className="text-sm">Lỗi</div>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="mt-2"
                              onClick={() => retryUpload(image.id)}
                            >
                              Thử lại
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Ảnh chính
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(image.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/seller/products')}
          className="w-full sm:w-auto"
        >
          Bỏ qua (Thêm ảnh sau)
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || successCount === 0}
          className="w-full sm:w-auto flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Lưu ảnh ({successCount})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
