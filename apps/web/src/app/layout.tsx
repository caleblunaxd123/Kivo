import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Vozpe — Anota ahora, ordena después',
    template: '%s — Vozpe',
  },
  description: 'Registra gastos grupales por voz, foto o texto. La sheet viva que tu grupo necesita. Disponible en iOS, Android y Web.',
  keywords: ['gastos grupales', 'split expenses', 'tracker gastos', 'app gastos', 'vozpe'],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/logo-vozpe.png',
  },
  themeColor: '#1F6FE5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-bg-base text-text-primary antialiased`}>
        {children}
      </body>
    </html>
  );
}
