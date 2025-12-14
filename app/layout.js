import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Toast from '@/components/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <Toast />
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </div>
            </CartProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
