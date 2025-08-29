import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Truck, Percent, Star } from "lucide-react"

const vouchers = [
  {
    id: 1,
    title: "Giảm 100K",
    description: "Đơn tối thiểu 500K",
    code: "SAVE100K",
    icon: Percent,
    color: "bg-red-500",
    expiry: "31/12/2024",
  },
  {
    id: 2,
    title: "Freeship",
    description: "Miễn phí vận chuyển",
    code: "FREESHIP",
    icon: Truck,
    color: "bg-blue-500",
    expiry: "31/12/2024",
  },
  {
    id: 3,
    title: "Giảm 50K",
    description: "Đơn tối thiểu 200K",
    code: "SAVE50K",
    icon: Gift,
    color: "bg-green-500",
    expiry: "31/12/2024",
  },
  {
    id: 4,
    title: "Cashback 15%",
    description: "Tối đa 200K",
    code: "CASHBACK15",
    icon: Star,
    color: "bg-purple-500",
    expiry: "31/12/2024",
  },
]

export function VoucherSection() {
  return (
    <section className="bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Voucher & Khuyến mãi</h2>
          <Button variant="outline">Xem tất cả</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {vouchers.map((voucher) => {
            const IconComponent = voucher.icon
            return (
              <Card
                key={voucher.id}
                className="group hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-accent"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 ${voucher.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-accent transition-colors">
                        {voucher.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">{voucher.description}</p>

                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs font-mono">
                          {voucher.code}
                        </Badge>
                        <span className="text-xs text-muted-foreground">HSD: {voucher.expiry}</span>
                      </div>

                      <Button size="sm" className="w-full mt-3 bg-accent hover:bg-accent/90">
                        Lưu voucher
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
