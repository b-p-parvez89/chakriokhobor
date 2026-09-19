import './globals.css';

import Header from '../components/Header';
import Footer from '../components/Footer';
import AdSense from '../components/AdSense';


const API = (process.env.NEXT_PUBLIC_API_URL || 'https:chakriokhobor.onrender.com').replace(/\/$/, '');

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https:chakriokhobor.onrender.com';

async function getSiteSettings() {
  if (!API) return {};

  try {
    const res = await fetch(`${API}/site-settings`, {
      cache: 'no-store',
    });

    if (!res.ok) return {};

    const json = await res.json();

    return json?.data || {};
  } catch {
    return {};
  }
}

export async function generateMetadata() {
  const s = await getSiteSettings();

  const siteTitle =
    s.siteTitle ||
    'ChakriOKhobor | চাকরি, শিক্ষা ও খবর';

  const siteDescription =
    s.siteDescription ||
    'বাংলাদেশের চাকরি, শিক্ষা ও গুরুত্বপূর্ণ খবরের প্ল্যাটফর্ম।';

  const canonical =
    s.canonical ||
    SITE_URL;

  const keywords = (
    s.keywords ||
    'বাংলাদেশ খবর, চাকরি, চাকরির খবর, সরকারি চাকরি, বেসরকারি চাকরি, শিক্ষা, নিয়োগ বিজ্ঞপ্তি'
  )
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  return {
    metadataBase: new URL(SITE_URL),

    applicationName: 'ChakriOKhobor',

    title: {
      default: siteTitle,
      template: '%s | ChakriOKhobor',
    },

    description: siteDescription,

    keywords,

    // Google Search Console Verification
    verification: {
      google:
        'CyA3s9l-8ytydcsQZ4-hwvMNU-yuLi6pzjdpIKYqDDE',
    },

    authors: [
      {
        name: 'ChakriOKhobor',
        url: SITE_URL,
      },
    ],

    creator: 'ChakriOKhobor',
    publisher: 'ChakriOKhobor',

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },

    openGraph: {
      type: 'website',

      locale: 'bn_BD',

      url: canonical,

      siteName: 'ChakriOKhobor',

      title: siteTitle,

      description: siteDescription,

      images: [
        {
          url: `${SITE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'ChakriOKhobor',
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',

      title: siteTitle,

      description: siteDescription,

      images: [`${SITE_URL}/og-image.jpg`],
    },

    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  };
}

export default async function Layout({ children }) {
  const s = await getSiteSettings();

  const showAds =
    s.adsenseEnabled &&
    s.adsenseClient &&
    s.adsenseSlot;

  return (
    <html lang="bn">
      <body>
        <Header />

        <main>{children}</main>

        {showAds && (
          <div className="container adWrap">
            <AdSense
              client={s.adsenseClient}
              slot={s.adsenseSlot}
            />
          </div>
        )}

        <Footer />
      </body>
    </html>
  );
}