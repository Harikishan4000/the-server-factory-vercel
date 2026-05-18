'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 md:mt-24">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
                <span className="text-brand">SERVER</span>
                <span className="text-ink dark:text-gray-100">FACTORY</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-ink-muted dark:text-gray-400">
              India&apos;s configurator-first marketplace for enterprise servers, GPU workstations,
              and data-center components from Dell, HP, Lenovo, NVIDIA and more.
            </p>
            <div className="mt-6 space-y-2 text-sm text-ink-muted dark:text-gray-400">
  <a href="mailto:sales@serverfactory.com" className="flex items-center gap-2 hover:text-brand transition-colors">
    <Mail className="h-4 w-4 text-brand" /> sales@serverfactory.com
  </a>
  <a href="tel:+918040000000" className="flex items-center gap-2 hover:text-brand transition-colors">
    <Phone className="h-4 w-4 text-brand" /> +91 80 4000 0000
  </a>
  <Link href="/contact" className="flex items-center gap-2 hover:text-brand transition-colors">
    <MapPin className="h-4 w-4 text-brand" /> Bengaluru, Karnataka, India
  </Link>
</div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-ink dark:text-gray-100">Shop</h4>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted dark:text-gray-400">
              <li><Link href="/category/servers" className="hover:text-brand">Servers</Link></li>
              <li><Link href="/category/workstations" className="hover:text-brand">Workstations</Link></li>
              <li><Link href="/category/components" className="hover:text-brand">Components</Link></li>
              <li><Link href="/category/rentals" className="hover:text-brand">Rentals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-ink dark:text-gray-100">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted dark:text-gray-400">
              <li><Link href="/about" className="hover:text-brand">About</Link></li>
              <li><Link href="/contact" className="hover:text-brand">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-ink dark:text-gray-100">Support</h4>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted dark:text-gray-400">
              <li><Link href="/account" className="hover:text-brand">My Account</Link></li>
              <li><Link href="/account/orders" className="hover:text-brand">Orders</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-6 text-xs text-ink-muted dark:border-gray-800 dark:text-gray-500 md:flex-row">
          <p>© {new Date().getFullYear()} ServerFactory. All rights reserved.</p>
          <p>Made in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
