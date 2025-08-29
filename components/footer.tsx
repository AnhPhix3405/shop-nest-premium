import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">SN</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">ShopNest</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Nền tảng thương mại điện tử hàng đầu Việt Nam, mang đến trải nghiệm mua sắm tuyệt vời cho hàng triệu người
              dùng.
            </p>
            <div className="flex gap-3">
              <Button size="sm" variant="outline" className="w-10 h-10 p-0 bg-transparent">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="w-10 h-10 p-0 bg-transparent">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="w-10 h-10 p-0 bg-transparent">
                <Youtube className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Customer service */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Chăm sóc khách hàng</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  ShopNest Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  ShopNest Mall
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Hướng dẫn mua hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Hướng dẫn bán hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Thanh toán
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  ShopNest Xu
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Vận chuyển
                </a>
              </li>
            </ul>
          </div>

          {/* About ShopNest */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Về ShopNest</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Giới thiệu về ShopNest Việt Nam
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Tuyển dụng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Điều khoản ShopNest
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Chính hãng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Kênh người bán
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Flash Sales
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Chương trình Tiếp thị liên kết
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Liên hệ</h4>
            <div className="space-y-3 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>1900 1234</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@shopnest.vn</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>
                  Tầng 4-5-6, Tòa nhà Capital Place, số 29 đường Liễu Giai, Phường Ngọc Khánh, Quận Ba Đình, Thành phố
                  Hà Nội, Việt Nam
                </span>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-foreground mb-2">Đăng ký nhận tin</h5>
              <div className="flex gap-2">
                <Input placeholder="Email của bạn" className="text-sm" />
                <Button size="sm" className="bg-accent hover:bg-accent/90">
                  Đăng ký
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2024 ShopNest. Tất cả các quyền được bảo lưu.</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Chính sách bảo mật</span>
              <span>Điều khoản sử dụng</span>
              <span>Chính sách cookie</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
