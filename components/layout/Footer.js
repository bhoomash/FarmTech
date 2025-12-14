import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-auto border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image 
                src="/logo.png" 
                alt="FarmTech Logo" 
                width={40} 
                height={40}
              />
              <div>
                <h3 className="text-white font-bold text-lg">FarmTech</h3>
                <p className="text-xs text-neutral-400">Farm Solutions</p>
              </div>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Your trusted partner for quality farming products and agricultural solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Products</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="/products" className="hover:text-primary-400 transition-colors">All Products</a>
              </li>
              <li>
                <a href="/products?category=Fertilizer" className="hover:text-primary-400 transition-colors">Fertilizers</a>
              </li>
              <li>
                <a href="/products?category=Seeds" className="hover:text-primary-400 transition-colors">Seeds</a>
              </li>
              <li>
                <a href="/products?category=Tools" className="hover:text-primary-400 transition-colors">Tools</a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="/" className="hover:text-primary-400 transition-colors">Home</a>
              </li>
              <li>
                <a href="/orders" className="hover:text-primary-400 transition-colors">Orders</a>
              </li>
              <li>
                <a href="/cart" className="hover:text-primary-400 transition-colors">Cart</a>
              </li>
              
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <span>📧</span>
                <span>bhoomash0000@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <span>📞</span>
                <span>+91 9159342688</span>
              </li>
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>Erode, Tamil Nadu, India</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
