'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/types';
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
  Plus,
  MoveUp,
  MoveDown,
  Star
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { buildEndpoint, API_BASE_URL } from '@/config/api';

interface ImageItem {
  id: string;
  url: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
  public_id?: string;
  original_name?: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    public_id: string;
    width: number;
    height: number;
    file_info?: {
      original_name: string;
      size: number;
      mime_type: string;
    };
    product_updated?: boolean;
    product_id?: number;
  };
}

interface MultipleUploadResponse {
  success: boolean;
  message: string;
  data: {
    uploaded_images: Array<{
      url: string;
      public_id: string;
      width: number;
      height: number;
      original_name: string;
    }>;
    failed_uploads: string[];
    total_uploaded: number;
    total_failed: number;
    product_updated?: boolean;
    product_id?: number;
  };
}

export default function UploadImagesPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  
  // Get user and token from Redux
  const { user } = useSelector((state: RootState) => state.auth);
  
  // States
  const [images, setImages] = useState<ImageItem[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const maxImages = 10;
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  // Delete image from Cloudinary and database
  const deleteImageFromCloudinary = async (publicId: string, imageUrl?: string): Promise<boolean> => {
    try {
      // Use delete-by-url endpoint if we have the image URL, otherwise use delete endpoint
      const endpoint = imageUrl 
        ? `${API_BASE_URL}${buildEndpoint.upload.deleteByUrl()}`
        : `${API_BASE_URL}${buildEndpoint.upload.delete()}`;
        
      const body = imageUrl 
        ? { image_url: imageUrl }
        : { public_id: publicId };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error: any) {
      console.error('Delete image error:', error);
      return false;
    }
  };

  // Validate file
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    if (!allowedImageTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `${file.name} không phải là file ảnh hợp lệ (chỉ chấp nhận JPG, PNG, WebP)`
      };
    }
    
    if (file.size > maxFileSize) {
      return {
        isValid: false,
        error: `${file.name} vượt quá giới hạn ${Math.round(maxFileSize / 1024 / 1024)}MB`
      };
    }
    
    return { isValid: true };
  };

  // Check authentication
  useEffect(() => {
    if (!user || !user.access_token) {
      toast({
        title: 'Lỗi xác thực',
        description: 'Vui lòng đăng nhập để upload ảnh.',
        variant: 'destructive'
      });
      router.push('/login');
    }
  }, [user, router]);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, []);

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

  // Upload image from URL
  const uploadImageFromUrl = async (imageUrl: string): Promise<UploadResponse | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}${buildEndpoint.upload.fromUrl()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          folder: 'shop-nest/products'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Upload from URL error:', error);
      throw error;
    }
  };

  // Upload single file
  const uploadSingleFile = async (file: File): Promise<UploadResponse | null> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (productId && productId !== 'new-product') {
        formData.append('product_id', productId);
      }

      const response = await fetch(`${API_BASE_URL}${buildEndpoint.upload.productImage()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Upload file error:', error);
      throw error;
    }
  };

  // Upload multiple files
  const uploadMultipleFiles = async (files: File[]): Promise<MultipleUploadResponse | null> => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      if (productId && productId !== 'new-product') {
        formData.append('product_id', productId);
      }

      const response = await fetch(`${API_BASE_URL}${buildEndpoint.upload.productImages()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Upload multiple files error:', error);
      throw error;
    }
  };

  // Add image by URL
  const addImageByUrl = async () => {
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

    if (!user?.access_token) {
      toast({
        title: 'Lỗi xác thực',
        description: 'Vui lòng đăng nhập để upload ảnh.',
        variant: 'destructive'
      });
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

    try {
      const result = await uploadImageFromUrl(url);
      
      if (result?.success) {
        setImages(prev => prev.map(img => 
          img.id === newImage.id 
            ? { 
                ...img, 
                status: 'success',
                progress: 100,
                url: result.data.url,
                public_id: result.data.public_id
              }
            : img
        ));

        toast({
          title: 'Upload thành công',
          description: result.message,
        });
      } else {
        throw new Error(result?.message || 'Upload failed');
      }
    } catch (error: any) {
      setImages(prev => prev.map(img => 
        img.id === newImage.id 
          ? { 
              ...img, 
              status: 'error',
              progress: 100,
              error: error.message
            }
          : img
      ));

      toast({
        title: 'Lỗi upload',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    if (!user?.access_token) {
      toast({
        title: 'Lỗi xác thực',
        description: 'Vui lòng đăng nhập để upload ảnh.',
        variant: 'destructive'
      });
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        invalidFiles.push(validation.error!);
      }
    });

    // Show validation errors
    if (invalidFiles.length > 0) {
      invalidFiles.forEach(error => {
        toast({
          title: "File không hợp lệ",
          description: error,
          variant: "destructive"
        });
      });
    }

    if (validFiles.length === 0) {
      return;
    }

    if (images.length + validFiles.length > maxImages) {
      toast({
        title: "Quá số lượng cho phép",
        description: `Chỉ có thể upload tối đa ${maxImages} ảnh`,
        variant: "destructive"
      });
      return;
    }

    // Add files to state with uploading status
    const newImages: ImageItem[] = validFiles.map(file => ({
      id: `file-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0,
      original_name: file.name
    }));

    setImages(prev => [...prev, ...newImages]);

    // Upload files
    if (validFiles.length === 1) {
      await uploadSingleFileHandler(validFiles[0], newImages[0].id);
    } else {
      await uploadMultipleFilesHandler(validFiles, newImages);
    }
  };

  // Handle single file upload
  const uploadSingleFileHandler = async (file: File, imageId: string) => {
    try {
      const result = await uploadSingleFile(file);
      
      if (result?.success) {
        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { 
                ...img, 
                status: 'success',
                progress: 100,
                url: result.data.url,
                public_id: result.data.public_id
              }
            : img
        ));

        toast({
          title: 'Upload thành công',
          description: result.message,
        });
      } else {
        throw new Error(result?.message || 'Upload failed');
      }
    } catch (error: any) {
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { 
              ...img, 
              status: 'error',
              progress: 100,
              error: error.message
            }
          : img
      ));

      toast({
        title: 'Lỗi upload',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Handle multiple files upload
  const uploadMultipleFilesHandler = async (files: File[], newImages: ImageItem[]) => {
    try {
      const result = await uploadMultipleFiles(files);
      
      if (result?.success && result.data.uploaded_images) {
        // Update successful uploads
        result.data.uploaded_images.forEach((uploadedImg, index) => {
          const imageId = newImages[index]?.id;
          if (imageId) {
            setImages(prev => prev.map(img => 
              img.id === imageId 
                ? { 
                    ...img, 
                    status: 'success',
                    progress: 100,
                    url: uploadedImg.url,
                    public_id: uploadedImg.public_id
                  }
                : img
            ));
          }
        });

        // Mark failed uploads
        if (result.data.failed_uploads.length > 0) {
          result.data.failed_uploads.forEach(failedName => {
            const failedImage = newImages.find(img => img.original_name === failedName);
            if (failedImage) {
              setImages(prev => prev.map(img => 
                img.id === failedImage.id 
                  ? { 
                      ...img, 
                      status: 'error',
                      progress: 100,
                      error: 'Upload failed'
                    }
                  : img
              ));
            }
          });
        }

        toast({
          title: 'Upload hoàn tất',
          description: result.message,
        });
      } else {
        throw new Error(result?.message || 'Upload failed');
      }
    } catch (error: any) {
      // Mark all as failed
      newImages.forEach(newImg => {
        setImages(prev => prev.map(img => 
          img.id === newImg.id 
            ? { 
                ...img, 
                status: 'error',
                progress: 100,
                error: error.message
              }
            : img
        ));
      });

      toast({
        title: 'Lỗi upload',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Remove image
  const removeImage = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    // If image has public_id, delete from Cloudinary and database
    if (image.public_id && image.status === 'success') {
      const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa ảnh này?');
      if (!confirmDelete) return;

      // Pass both public_id and image URL for better deletion handling
      const deleteSuccess = await deleteImageFromCloudinary(image.public_id, image.url);
      if (!deleteSuccess) {
        toast({
          title: 'Lỗi xóa ảnh',
          description: 'Không thể xóa ảnh từ cloud/database. Ảnh sẽ được xóa khỏi danh sách.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Xóa ảnh thành công',
          description: 'Ảnh đã được xóa khỏi cloud và database',
        });
      }
    }

    // Remove from state
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter(img => img.id !== imageId);
    });

    if (!image.public_id || image.status !== 'success') {
      toast({
        title: 'Xóa ảnh thành công',
        description: 'Ảnh đã được xóa khỏi danh sách',
      });
    }
  };

  // Retry upload
  const retryUpload = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, status: 'uploading', progress: 0, error: undefined }
        : img
    ));

    if (image.url.startsWith('blob:')) {
      // It's a file upload - show error because we can't retry without the original file
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { 
              ...img, 
              status: 'error',
              progress: 100,
              error: 'Vui lòng chọn lại file để upload'
            }
          : img
      ));
      
      toast({
        title: 'Không thể thử lại',
        description: 'Vui lòng chọn lại file để upload',
        variant: 'destructive'
      });
    } else {
      // It's a URL upload
      try {
        const result = await uploadImageFromUrl(image.url);
        
        if (result?.success) {
          setImages(prev => prev.map(img => 
            img.id === imageId 
              ? { 
                  ...img, 
                  status: 'success',
                  progress: 100,
                  url: result.data.url,
                  public_id: result.data.public_id
                }
              : img
          ));

          toast({
            title: 'Upload thành công',
            description: result.message,
          });
        } else {
          throw new Error(result?.message || 'Upload failed');
        }
      } catch (error: any) {
        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { 
                ...img, 
                status: 'error',
                progress: 100,
                error: error.message
              }
            : img
        ));

        toast({
          title: 'Lỗi upload',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  };

  // Move image up/down in the list
  const moveImage = (imageId: string, direction: 'up' | 'down') => {
    setImages(prev => {
      const currentIndex = prev.findIndex(img => img.id === imageId);
      if (currentIndex === -1) return prev;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newImages = [...prev];
      [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];
      
      return newImages;
    });
  };

  // Set image as main/primary
  const setAsMainImage = (imageId: string) => {
    setImages(prev => {
      const imageIndex = prev.findIndex(img => img.id === imageId);
      if (imageIndex === -1 || imageIndex === 0) return prev;

      const newImages = [...prev];
      const [imageToMove] = newImages.splice(imageIndex, 1);
      newImages.unshift(imageToMove);
      
      return newImages;
    });

    toast({
      title: 'Đặt ảnh chính thành công',
      description: 'Ảnh đã được đặt làm ảnh chính cho sản phẩm',
    });
  };
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

  // Submit all images (if not already uploaded to product)
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

    // Check if there are any uploading images
    const uploadingImages = images.filter(img => img.status === 'uploading');
    if (uploadingImages.length > 0) {
      toast({
        title: "Vui lòng đợi",
        description: `Còn ${uploadingImages.length} ảnh đang được upload`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Show success message
      toast({
        title: "Lưu ảnh thành công! 🎉",
        description: `Đã upload ${successImages.length} ảnh cho sản phẩm`,
      });
      
      // Redirect to product list or product detail after a delay
      setTimeout(() => {
        if (productId && productId !== 'new-product') {
          router.push(`/seller/products/${productId}`);
        } else {
          router.push('/seller/products');
        }
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

  // Clear all images
  const clearAllImages = () => {
    const confirmClear = window.confirm('Bạn có chắc chắn muốn xóa tất cả ảnh?');
    if (!confirmClear) return;

    // Revoke blob URLs
    images.forEach(image => {
      if (image.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url);
      }
    });

    setImages([]);
    toast({
      title: 'Đã xóa tất cả ảnh',
      description: 'Tất cả ảnh đã được xóa khỏi danh sách',
    });
  };

  const successCount = images.filter(img => img.status === 'success').length;
  const uploadingCount = images.filter(img => img.status === 'uploading').length;
  const errorCount = images.filter(img => img.status === 'error').length;

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

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
                  JPG, PNG, WebP - Tối đa {Math.round(maxFileSize / 1024 / 1024)}MB mỗi file
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
                  Đảm bảo URL ảnh có thể truy cập công khai và kết thúc bằng .jpg, .jpeg, .png hoặc .webp
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Image Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Ảnh đã thêm ({images.length}/{maxImages})
                  </CardTitle>
                  <CardDescription>
                    Xem trước và quản lý ảnh sản phẩm
                  </CardDescription>
                </div>
                {images.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllImages}
                    className="text-red-600 hover:text-red-700"
                  >
                    Xóa tất cả
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Chưa có ảnh nào được thêm
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sử dụng các phương thức bên trái để thêm ảnh. Ảnh đầu tiên sẽ là ảnh chính của sản phẩm.
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
                        {index === 0 ? (
                          <Badge variant="default" className="text-xs bg-yellow-500">
                            <Star className="h-3 w-3 mr-1" />
                            Ảnh chính
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setAsMainImage(image.id)}
                            className="h-6 px-2 text-xs"
                            title="Đặt làm ảnh chính"
                          >
                            <Star className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(image.id)}
                          className="h-6 w-6 p-0"
                          title="Xóa ảnh"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Move buttons */}
                      {images.length > 1 && (
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {index > 0 && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => moveImage(image.id, 'up')}
                              className="h-6 w-6 p-0"
                              title="Di chuyển lên"
                            >
                              <MoveUp className="h-3 w-3" />
                            </Button>
                          )}
                          {index < images.length - 1 && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => moveImage(image.id, 'down')}
                              className="h-6 w-6 p-0"
                              title="Di chuyển xuống"
                            >
                              <MoveDown className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
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
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          {images.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={clearAllImages}
              className="w-full sm:w-auto text-red-600 hover:text-red-700"
            >
              Xóa tất cả
            </Button>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (productId && productId !== 'new-product') {
                router.push(`/seller/products/${productId}`);
              } else {
                router.push('/seller/products');
              }
            }}
            className="w-full sm:w-auto"
          >
            Bỏ qua (Thêm ảnh sau)
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || successCount === 0 || uploadingCount > 0}
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
    </div>
  );
}
