import { SITE_URL } from '../config/site';

export function createPageMetadata({ title, description, path }) {
  const canonical = new URL(path, SITE_URL).toString();

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | Everestkit`,
      description,
      url: canonical,
      siteName: 'Everestkit',
      type: 'website',
    },
  };
}

export const noIndexMetadata = {
  robots: {
    index: false,
    follow: false,
  },
};
