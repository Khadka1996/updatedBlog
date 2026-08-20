import { createPageMetadata } from '../seo';

export const metadata = createPageMetadata({
  title: 'Contact Everestkit',
  description: 'Contact the Everestkit team about digital services, tools, partnerships, or support.',
  path: '/contact',
});

export default function ContactLayout({ children }) {
  return children;
}