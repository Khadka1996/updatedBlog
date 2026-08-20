import { noIndexMetadata } from '../seo';

export const metadata = { title: 'Forgot Password', ...noIndexMetadata };

export default function Layout({ children }) {
  return children;
}
