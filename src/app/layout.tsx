import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/JsonLd";
import { YandexMetrika } from "@/components/YandexMetrika";

import { FaqWidget } from "@/components/FaqWidget";
import { FloatingContact } from "@/components/FloatingContact";
import { FloatingFeedback } from "@/components/FloatingFeedback";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { CookieConsent } from "@/components/CookieConsent";
import { PromoCodeNotifier } from "@/components/PromoCodeNotifier";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

import { SITE_URL } from '@/config/site'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Теллур-Интех — Поддержка пользователей ККТ',
  description: 'Центр технического обслуживания кассового оборудования в Санкт-Петербурге. Подключение маркировки, регистрация ККТ, настройка ЭДО и Честный ЗНАК. С 1995 года. Многолетний опыт.',

  keywords: [
    'калькулятор маркировки', 'маркировка товаров Санкт-Петербург', 'маркировка СПб',
    'подключение маркировки', 'Честный ЗНАК', 'честныйзнак.рф', 'ТС ПИоТ',
    'ЭДО подключение', 'ОФД подключение', 'регистрация ККТ', 'ФФД 1.2',
    'кассовое оборудование СПб', 'сервисный центр касс',
    'Меркурий', 'Атол', 'Сигма', 'Эвотор', 'Штрих-М', 'Пионер', 'AQSI',
    'маркировка под ключ', 'удалённая настройка маркировки',
    // каталог касс
    'купить онлайн кассу', 'каталог онлайн касс', 'касса под ключ спб',
    'купить кассу с установкой', 'онлайн касса цена',
    // фн/офд
    'купить фн 15 месяцев', 'купить фн 36 месяцев', 'офд такском подключить',
    'замена фн спб', 'продление офд',
    // эквайринг
    'касса с эквайрингом', 'терминал оплаты для кассы', 'эквайринг спб',
    // то и сервис
    'техническое обслуживание касс', 'договор то ккт', 'ремонт касс спб',
    'сервисный центр ккт', 'цто касс спб',
    // эцп/эдо
    'получить эцп спб', 'продлить эцп', 'настройка эдо диадок', 'настройка эдо сбис',
    // гео
    'касса пушкин', 'касса гатчина', 'касса всеволожск', 'цто пушкин', 'цто гатчина',
  ],
  authors: [{ name: 'Теллур-Интех' }],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'Теллур-Интех — Поддержка пользователей ККТ в Санкт-Петербурге',
    description: 'Центр технического обслуживания кассового оборудования. Маркировка, ККТ, ЭДО, Честный ЗНАК. С 1995 года. Многолетний опыт.',
    url: SITE_URL,
    siteName: 'Теллур-Интех',
    locale: 'ru_RU',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Теллур-Интех — Поддержка пользователей ККТ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Теллур-Интех — Поддержка пользователей ККТ',
    description: 'Центр технического обслуживания кассового оборудования в Санкт-Петербурге. Маркировка, ККТ, ЭДО, Честный ЗНАК.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    yandex: '1a88703cc40147f3',
    google: 'fnOIiIKszugreztjlMIPeYK5C_ZzQT4pIHwEiMDyRz8',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        <JsonLd />
        <YandexMetrika />
        <Navbar />
        <div className="flex-1 flex flex-col">{children}</div>
        <SiteFooter />
        <noscript>
          <div style={{ padding: '16px', maxWidth: '768px', margin: '0 auto', fontFamily: 'sans-serif', fontSize: '14px', lineHeight: '1.6', color: '#334155' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#163A5F', marginBottom: '12px' }}>
              Теллур-Интех — Поддержка пользователей ККТ
            </h1>
            <p>Центр технического обслуживания кассового оборудования в Санкт-Петербурге и Ленинградской области. ООО «Теллур-Интех» — с 1995 года. Многолетний опыт, постоянные клиенты. Подключение маркировки, регистрация ККТ, настройка Честного ЗНАК, ЭДО, ТС ПИоТ. Меркурий, Атол, Сигма, Эвотор, Штрих-М, Пионер, AQSI.</p>
            <p>Центральный офис: Санкт-Петербург, ул. Заслонова 32-34 (м. Обводный канал / Лиговский проспект). Также офисы в Пушкине (Октябрьский бульвар 50/30) и Гатчине (ул. Хохлова 6). Тел: +7 (812) 321-06-06, +7 (812) 465-94-57, +7 (813) 714-08-95.</p>
            <p>Для работы с сайтом включите JavaScript в настройках браузера.</p>
          </div>
        </noscript>
        <ScrollToTopButton />

        <FaqWidget />
        <FloatingContact />
        <FloatingFeedback />
        <CookieConsent />
        <PromoCodeNotifier />
      </body>
    </html>
  );
}
