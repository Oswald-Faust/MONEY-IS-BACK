import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustedBy } from './components/TrustedBy';
import { PlatformToggle } from './components/PlatformToggle';
import { Features } from './components/Features';
import { Benefits } from './components/Benefits';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { Blog } from './components/Blog';
import { Community } from './components/Community';
import { Footer } from './components/Footer';

export default function DreelioReplica() {
  return (
    <div className="font-sans antialiased bg-white text-gray-900 overflow-x-hidden selection:bg-blue-200">
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <PlatformToggle />
        <Features />
        <Benefits />
        <Testimonials />
        <Pricing />
        <Blog />
        <Community />
      </main>
      <Footer />
    </div>
  );
}
