import { createPageMetadata } from '../../seo';

export const metadata = createPageMetadata({
  title: 'QR Code Generator',
  description:
    'Create free QR codes for a URL, text, WiFi, email, phone, SMS or contact card. Customise colours, size and error correction, add a logo, and download as PNG or SVG.',
  path: '/tools/qr-code-generator',
});

export default function Layout({ children }) {
  return children;
}
