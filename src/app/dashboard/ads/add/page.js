import { redirect } from 'next/navigation';

// Ads are now created and edited from the Manage Ads list.
export default function Page() {
  redirect('/dashboard/ads');
}
