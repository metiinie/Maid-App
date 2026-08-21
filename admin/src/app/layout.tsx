import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Recruitment Agency Admin Dashboard',
    description: 'Multi-tenant SaaS Admin Portal for Ethiopian Recruitment Agencies',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="h-full bg-slate-50">
            <body className={`${inter.className} h-full antialiased`}>{children}</body>
        </html>
    );
}
