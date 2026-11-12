import { Link } from 'react-router-dom';
import { Store, Mail, Phone, MapPin, Globe, MessageCircle, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Store size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">ShopVerse</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">Your one-stop destination for everything. Shop from thousands of verified sellers across Pakistan.</p>
            <div className="flex gap-3">
              {[Globe, MessageCircle, Heart].map((Icon, i) => (
                <button key={i} className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-violet-600 transition-colors">
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[['/', 'Home'], ['/products', 'All Products'], ['/stores', 'Stores'], ['/register?role=seller', 'Become a Seller']].map(([href, label]) => (
                <li key={href}><Link to={href} className="text-sm hover:text-violet-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2.5">
              {['Electronics', 'Fashion', 'Food', 'Books', 'Beauty', 'Sports'].map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${cat}`} className="text-sm hover:text-violet-400 transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm"><MapPin size={16} className="mt-0.5 shrink-0 text-violet-400" /> Lahore, Pakistan</li>
              <li className="flex items-center gap-3 text-sm"><Phone size={16} className="text-violet-400" /> +923466231266</li>
              <li className="flex items-center gap-3 text-sm"><Mail size={16} className="text-violet-400" /> junaidrasul@gmail.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} ShopVerse. FYP Project. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-violet-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-violet-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
