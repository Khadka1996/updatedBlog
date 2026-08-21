import { noIndexMetadata } from '../seo';

// Live chat widget page — not meant to be a discoverable search result,
// and was previously falling back to the generic homepage title/description
// (duplicate-content risk), so give it its own noindex metadata instead.
export const metadata = {
  title: 'Chat',
  ...noIndexMetadata,
};

export default function ChatLayout({ children }) {
  return children;
}
