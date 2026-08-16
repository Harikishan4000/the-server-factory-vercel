import { AuthCard } from '@/components/auth/AuthCard';

export const metadata = {
  title: 'Sign in — Welcome Back',
  robots: { index: false },
};

export default function LoginPage({ searchParams }: { searchParams: { callbackUrl?: string; tab?: string } }) {
  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-xl items-center px-4 py-8 sm:px-6 md:py-12">
      <AuthCard initialTab={(searchParams.tab === 'register' ? 'register' : 'login')} callbackUrl={searchParams.callbackUrl} />
    </div>
  );
}
