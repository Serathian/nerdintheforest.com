import ContentNav from '@/components/layout/content-nav'
import Footer from '@/components/layout/footer'

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ContentNav />
      <main className="min-h-screen relative z-10">
        {children}
      </main>
      <Footer />
    </>
  )
}
