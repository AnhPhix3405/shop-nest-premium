import { Smartphone, Laptop, Shirt, Home, Car, Baby, Gamepad2, Book, Utensils, Dumbbell, Palette } from "lucide-react"

const categories = [
  { name: "Điện thoại & Phụ kiện", icon: Smartphone, color: "bg-blue-100 text-blue-600" },
  { name: "Máy tính & Laptop", icon: Laptop, color: "bg-purple-100 text-purple-600" },
  { name: "Thời trang nam", icon: Shirt, color: "bg-green-100 text-green-600" },
  { name: "Thời trang nữ", icon: Shirt, color: "bg-pink-100 text-pink-600" },
  { name: "Nhà cửa & Đời sống", icon: Home, color: "bg-orange-100 text-orange-600" },
  { name: "Ô tô & Xe máy", icon: Car, color: "bg-red-100 text-red-600" },
  { name: "Mẹ & Bé", icon: Baby, color: "bg-yellow-100 text-yellow-600" },
  { name: "Thể thao & Du lịch", icon: Dumbbell, color: "bg-indigo-100 text-indigo-600" },
  { name: "Điện tử & Điện lạnh", icon: Gamepad2, color: "bg-cyan-100 text-cyan-600" },
  { name: "Sách & Văn phòng phẩm", icon: Book, color: "bg-teal-100 text-teal-600" },
  { name: "Sức khỏe & Làm đẹp", icon: Palette, color: "bg-rose-100 text-rose-600" },
  { name: "Thực phẩm & Đồ uống", icon: Utensils, color: "bg-amber-100 text-amber-600" },
]

export function CategoryMenu() {
  return (
    <section className="bg-white border-b">
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-xl font-bold mb-4 text-foreground">Danh mục</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-4">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <div
                key={category.name}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
              >
                <div
                  className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors">
                  {category.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
