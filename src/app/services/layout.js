import { createPageMetadata } from '../seo';

export const metadata = createPageMetadata({
  title: 'Digital Services',
  description: 'Explore Everestkit digital marketing, content, web development, and business services.',
  path: '/services',
});

export default function ServicesLayout({ children }) {
  return children;
}