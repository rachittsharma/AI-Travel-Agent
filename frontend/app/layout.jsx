import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'JournAI — AI Powered Travel Booking & Autonomous Assistant',
  description: 'Full-stack AI travel booking platform combining traditional flight/hotel booking with an autonomous AI travel assistant.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-dark-bg text-slate-100 flex flex-col min-h-screen">
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
