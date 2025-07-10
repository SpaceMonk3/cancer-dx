import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CancerDx - AI-Powered Cancer Diagnostic Platform',
  description: 'Advanced histopathology analysis for rhabdomyosarcoma detection using machine learning',
  keywords: ['cancer diagnosis', 'AI', 'histopathology', 'rhabdomyosarcoma', 'medical imaging'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen medical-gradient">
            {children}
          </div>
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}