import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Provider } from './provider';
import './globals.css';
import Transition from '@/components/Transition';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Food Hero',
  description: 'CRM Platform to help donors connect with beneficiaries',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <Provider>
        <body className={inter.className}>
          <Transition>{children}</Transition>
        </body>
      </Provider>
    </html>
  );
}
