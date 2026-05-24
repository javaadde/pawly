import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pawly AI — AI Pet Assistant for Your Website',
  description:
    'Add a cute AI pet mascot to your website with one script tag. Pawly chats with visitors, answers questions using your business data, guides users to important sections, and collects leads.',
  keywords: 'AI chatbot, website pet, AI mascot, website assistant, lead capture, chatbot widget',
  openGraph: {
    title: 'Pawly AI — AI Pet Assistant for Your Website',
    description: 'Add a cute AI pet to any website with one script tag.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
