import { noIndexMetadata } from '../seo';

export const metadata = { title: 'Reset Password', ...noIndexMetadata };

export default function Layout({ children }) {
  return children;
}
