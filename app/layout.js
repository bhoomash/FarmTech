import { Inter, Montserrat } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ConfirmProvider } from '@/components/ConfirmModal';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Toast from '@/components/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import AuthModalWrapper from '@/components/AuthModalWrapper';
import HydrationLoader from '@/components/HydrationLoader';
import CacheCleanup from '@/components/CacheCleanup';
import FarmAssistant from '@/components/chatbot/FarmAssistant';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});
const montserrat = Montserrat({ 
  subsets: ['latin'], 
  variable: '--font-montserrat', 
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  preload: true,
});

export const metadata = {
  title: 'FarmTech - Quality Farming Products & Solutions',
  description: 'Your trusted partner for fertilizers, seeds, pesticides, and farming tools',
  keywords: 'farming, fertilizers, seeds, pesticides, agriculture, farming tools',
  authors: [{ name: 'FarmTech' }],
  openGraph: {
    title: 'FarmTech - Quality Farming Products & Solutions',
    description: 'Your trusted partner for fertilizers, seeds, pesticides, and farming tools',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${montserrat.variable} font-sans`}>
        <HydrationLoader />
        <CacheCleanup />
        <ErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <ConfirmProvider>
                <Toast />
                <AuthModalWrapper />
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-grow">
                    {children}
                  </main>
                  <Footer />
                  <FarmAssistant />
                </div>
              </ConfirmProvider>
            </CartProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
