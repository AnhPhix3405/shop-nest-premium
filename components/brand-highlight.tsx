import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Verified } from "lucide-react"

const brands = [
  {
    id: 1,
    name: "Apple Official Store",
    logo: "/placeholder.svg?height=80&width=80",
    banner: "/placeholder.svg?height=120&width=300",
    verified: true,
    products: "1.2K sản phẩm",
    followers: "2.5M người theo dõi",
  },
  {
    id: 2,
    name: "Samsung Official",
    logo: "/placeholder.svg?height=80&width=80",
    banner: "/placeholder.svg?height=120&width=300",
    verified: true,
    products: "980 sản phẩm",
    followers: "1.8M người theo dõi",
  },
  {
    id: 3,
    name: "Nike Vietnam",
    logo: "/placeholder.svg?height=80&width=80",
    banner: "/placeholder.svg?height=120&width=300",
    verified: true,
    products: "756 sản phẩm",
    followers: "1.2M người theo dõi",
  },
  {
    id: 4,
    name: "Uniqlo Official",
    logo: "/placeholder.svg?height=80&width=80",
    banner: "/placeholder.svg?height=120&width=300",
    verified: true,
    products: "634 sản phẩm",
    followers: "890K người theo dõi",
  },
]

export function BrandHighlight() {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Verified className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold text-foreground">Thương hiệu chính hãng</h2>
          </div>
          <Badge variant="secondary" className="text-sm">
            ShopNest Mall
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {brands.map((brand) => (
            <Card key={brand.id} className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden">
              <CardContent className="p-0">
                {/* Banner */}
                <div className="relative h-24 overflow-hidden">
                  <Image
                    src={brand.banner || "/placeholder.svg"}
                    alt={`${brand.name} banner`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Brand info */}
                <div className="p-4 -mt-8 relative">
                  <div className="flex items-start gap-3">
                    {/* Logo */}
                    <div className="relative">
                      <Image
                        src={brand.logo || "/placeholder.svg"}
                        alt={`${brand.name} logo`}
                        width={60}
                        height={60}
                        className="rounded-full border-4 border-white shadow-lg"
                      />
                      {brand.verified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                          <Verified className="w-4 h-4 text-accent-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Brand details */}
                    <div className="flex-1 pt-2">
                      <h3 className="font-bold text-foreground group-hover:text-accent transition-colors">
                        {brand.name}
                      </h3>
                      <div className="space-y-1 mt-2">
                        <p className="text-xs text-muted-foreground">{brand.products}</p>
                        <p className="text-xs text-muted-foreground">{brand.followers}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
