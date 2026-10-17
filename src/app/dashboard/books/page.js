import { redirect } from 'next/navigation';

// Unused placeholder route (not linked from the menu) — send visitors to the overview.
export default function Page() {
  redirect('/dashboard');
}
