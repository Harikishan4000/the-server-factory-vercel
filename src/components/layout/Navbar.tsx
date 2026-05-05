import { auth } from '@/lib/auth';
import { getCategoryTree } from '@/lib/categories';
import { NavbarClient } from './NavbarClient';

export async function Navbar() {
  const [tree, session] = await Promise.all([
    getCategoryTree(),
    auth().catch(() => null),
  ]);

  return (
    <NavbarClient
      roots={tree}
      user={session?.user ? {
        name: session.user.name ?? null,
        email: session.user.email ?? '',
        role: session.user.role,
      } : null}
    />
  );
}
