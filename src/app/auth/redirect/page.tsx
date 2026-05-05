import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

// After OAuth sign-in, NextAuth redirects to this page which then forwards
// to the right destination based on role.
export default async function AuthRedirectPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  redirect(session.user.role === 'ADMIN' ? '/admin' : '/account');
}
