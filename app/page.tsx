import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CategoryMenu } from "@/components/category-menu"
import { FlashSaleSection } from "@/components/flash-sale-section"
import { VoucherSection } from "@/components/voucher-section"
import { ProductShowcase } from "@/components/product-showcase"
import { TrendingSection } from "@/components/trending-section"
import { BrandHighlight } from "@/components/brand-highlight"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CategoryMenu />
        <FlashSaleSection />
        <VoucherSection />
        <ProductShowcase />
        <TrendingSection />
        <BrandHighlight />
      </main>
      <Footer />
    </div>
  )
}
