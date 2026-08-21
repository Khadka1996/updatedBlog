import { noIndexMetadata } from '../seo';
import DashboardShell from './DashboardShell';

// The dashboard is an authenticated admin/moderator area and should never
// appear in search results. robots.txt already disallows crawling /dashboard/,
// but that alone doesn't guarantee exclusion if a URL is ever linked
// externally — noindex is the reliable belt-and-suspenders fix.
export const metadata = {
  title: 'Dashboard',
  ...noIndexMetadata,
};

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
