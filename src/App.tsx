import { useBottleCustomization } from './hooks/useBottleCustomization'
import Hero from './components/Hero'
import BottleCustomizer from './components/BottleCustomizer'
import DesignShowcase from './components/DesignShowcase'
import { Navbar, Services, WhyChooseUs, HowItWorks, Contact, Footer } from './components/Sections'

export default function App() {
  const c = useBottleCustomization()
  return (<>
    <Navbar /><main>
      <Hero c={c} /><BottleCustomizer c={c} /><DesignShowcase />
      <Services /><WhyChooseUs /><HowItWorks /><Contact c={c} />
    </main><Footer />
  </>)
}
