import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white text-neutral-900 mt-auto border-t border-neutral-200">
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
                <h3 className="text-green-700 font-bold text-lg">FarmTech</h3>
                <p className="text-xs text-neutral-600">Farm Solutions</p>
              </div>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Your trusted partner for quality farming products and agricultural solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-green-700 font-semibold mb-4">Products</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="/products" className="text-neutral-700 hover:text-green-600 transition-colors">All Products</a>
              </li>
              <li>
                <a href="/products?category=Fertilizer" className="text-neutral-700 hover:text-green-600 transition-colors">Fertilizers</a>
              </li>
              <li>
                <a href="/products?category=Seeds" className="text-neutral-700 hover:text-green-600 transition-colors">Seeds</a>
              </li>
              <li>
                <a href="/products?category=Tools" className="text-neutral-700 hover:text-green-600 transition-colors">Tools</a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-green-700 font-semibold mb-4">Company</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="/" className="text-neutral-700 hover:text-green-600 transition-colors">Home</a>
              </li>
              <li>
                <a href="/orders" className="text-neutral-700 hover:text-green-600 transition-colors">Orders</a>
              </li>
              <li>
                <a href="/cart" className="text-neutral-700 hover:text-green-600 transition-colors">Cart</a>
              </li>
              
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-green-700 font-semibold mb-4">Contact</h3>
            <ul className="space-y-2.5 text-sm text-neutral-700">
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
