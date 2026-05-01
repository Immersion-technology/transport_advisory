import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  noindex?: boolean;
  image?: string;
}

const SITE_NAME = 'Transport Advisory Services';
const SITE_URL = 'https://transportadvisory.ng';
const DEFAULT_DESCRIPTION =
  'Transport Advisory Services — your vehicle documents, road traffic and vehicular concerns, always in order. Track Vehicle Insurance, Vehicle Licence and Roadworthiness expiry, all in one place. Free SMS and e-mail reminders, online renewal, and doorstep delivery. Not government owned.';
const DEFAULT_IMAGE = `${SITE_URL}/apple-touch-icon.svg`;

const routeMetadata: Record<string, { title: string; description?: string; noindex?: boolean }> = {
  '/': {
    title: 'Transport Advisory Services — Vehicle Compliance Platform for Nigeria',
    description: 'Transport Advisory Services tracks Vehicle Insurance, Vehicle Licence, and Roadworthiness expiry — sends free SMS and e-mail reminders, renews documents online, and delivers them to your doorstep. Avoid ₦60,000+ ANPR fines in Lagos. Not government owned.',
  },
  '/login': { title: 'Sign In · Transport Advisory Services', description: 'Sign in to manage your vehicle documents, track expiry dates, and renew online.' },
  '/start': { title: 'Start a Service · Transport Advisory Services', description: 'Submit your vehicle and document details — we create your account and send a one-time login link to your email.' },
  '/auth/magic': { title: 'Signing in · Transport Advisory Services', noindex: true },
  '/dashboard': { title: 'Dashboard · Transport Advisory Services', noindex: true },
  '/vehicles': { title: 'My Vehicles · Transport Advisory Services', noindex: true },
  '/applications': { title: 'Applications · Transport Advisory Services', noindex: true },
  '/verifications': { title: 'Vehicle Verification · Transport Advisory Services', noindex: true },
  '/settings': { title: 'Settings · Transport Advisory Services', noindex: true },
  '/admin': { title: 'Admin · Transport Advisory Services', noindex: true },
};

export default function SEO(props: SEOProps = {}) {
  const { pathname } = useLocation();

  const routeMeta = routeMetadata[pathname]
    || Object.entries(routeMetadata).find(([k]) => k !== '/' && pathname.startsWith(k))?.[1]
    || routeMetadata['/'];

  const title = props.title || routeMeta.title;
  const description = props.description || routeMeta.description || DEFAULT_DESCRIPTION;
  const noindex = props.noindex ?? routeMeta.noindex ?? false;
  const image = props.image || DEFAULT_IMAGE;
  const url = `${SITE_URL}${pathname}`;
  const keywords = props.keywords
    || 'transport advisory services, vehicle compliance nigeria, motor insurance reminder, vehicle licence renewal, roadworthiness certificate, hackney permit, commercial vehicle permit, ride-hailing permit, fleet management nigeria, lagos anpr fines, change of ownership, articulated vehicle registration';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NGN',
      description: 'Free reminders forever — service charge applied only at point of renewal',
    },
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Lagos',
        addressCountry: 'NG',
      },
    },
    areaServed: {
      '@type': 'Country',
      name: 'Nigeria',
    },
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_NG" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}
