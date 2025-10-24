import { Search, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface NoResultsFoundProps {
  type?: "no-keyword" | "no-results"
  keyword?: string
  title?: string
  description?: string
  showBackButton?: boolean
  onRetry?: () => void
}

export default function NoResultsFound({ 
  type = "no-results", 
  keyword,
  title,
  description,
  showBackButton = false,
  onRetry 
}: NoResultsFoundProps) {
  
  const getDefaultContent = () => {
    switch (type) {
      case "no-keyword":
        return {
          title: "Nhập từ khóa để bắt đầu tìm kiếm",
          description: "Tìm kiếm sản phẩm theo tên, mô tả hoặc thương hiệu",
          icon: (
            <div className="mx-auto w-24 h-24 text-gray-300 mb-6">
              <Search className="w-full h-full" />
            </div>
          ),
          suggestions: [
            "Thử nhập tên sản phẩm cụ thể",
            "Sử dụng từ khóa đơn giản hơn",
            "Tìm kiếm theo thương hiệu",
            "Duyệt qua các danh mục sản phẩm"
          ]
        }
      case "no-results":
      default:
        return {
          title: keyword ? `Không tìm thấy sản phẩm nào cho "${keyword}"` : "Không tìm thấy sản phẩm nào",
          description: "Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc của bạn",
          icon: (
            <div className="mx-auto w-24 h-24 text-gray-300 mb-6">
              <svg fill="currentColor" viewBox="0 0 20 20" className="w-full h-full">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          ),
          suggestions: [
            "Kiểm tra chính tả từ khóa",
            "Thử sử dụng từ khóa ngắn gọn hơn",
            "Sử dụng từ khóa chung chung hơn",
            "Xóa bộ lọc để xem nhiều kết quả hơn"
          ]
        }
    }
  }

  const content = {
    title: title || getDefaultContent().title,
    description: description || getDefaultContent().description,
    icon: getDefaultContent().icon,
    suggestions: getDefaultContent().suggestions
  }

  return (
    <div className="text-center py-16 px-4">
      {/* Icon */}
      {content.icon}
      
      {/* Main Content */}
      <div className="max-w-md mx-auto">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          {content.title}
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {content.description}
        </p>

        {/* Suggestions */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-700 mb-3 text-sm">
            💡 Gợi ý cho bạn:
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            {content.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showBackButton && (
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Về trang chủ
              </Button>
            </Link>
          )}
          
          {type === "no-results" && onRetry && (
            <Button onClick={onRetry} className="w-full sm:w-auto">
              <Search className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
          )}
          
          {type === "no-keyword" && (
            <Link href="/">
              <Button className="w-full sm:w-auto">
                <Search className="w-4 h-4 mr-2" />
                Khám phá sản phẩm
              </Button>
            </Link>
          )}
        </div>

        {/* Popular Categories (for no-keyword type) */}
        {type === "no-keyword" && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-700 mb-4 text-sm">
              🔥 Danh mục phổ biến:
            </h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "Điện thoại",
                "Laptop", 
                "Thời trang",
                "Giày dép",
                "Đồng hồ",
                "Túi xách"
              ].map((category) => (
                <Link 
                  key={category}
                  href={`/search?keyword=${encodeURIComponent(category)}`}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100 transition-colors"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Cần hỗ trợ? Liên hệ{" "}
            <Link href="/support" className="text-blue-500 hover:underline">
              Trung tâm hỗ trợ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
