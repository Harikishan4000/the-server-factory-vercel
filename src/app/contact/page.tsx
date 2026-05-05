import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { ContactForm } from '@/components/contact/ContactForm';

export const metadata: Metadata = {
  title: 'Contact ServerFactory — Get in touch',
  description: 'Contact our sales team for enterprise server quotes, custom configurations, or pre-sales engineering support.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-5xl font-extrabold">
          Get in <span className="text-brand">touch</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-ink-muted">
          Our engineers and sales team are here to help — whether you need a quote, a custom configuration, or infrastructure advice.
        </p>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.5fr]">
        <aside className="space-y-6">
          <InfoCard icon={Mail} title="Email" value="sales@serverfactory.com" href="mailto:sales@serverfactory.com" />
          <InfoCard icon={Phone} title="Phone" value="+91 80 4000 0000" href="tel:+918040000000" />
          <InfoCard icon={MapPin} title="Address" value="Bengaluru, Karnataka, India" />
          <InfoCard icon={Clock} title="Hours" value="Mon – Sat, 9:30 AM – 7:00 PM IST" />
        </aside>

        <div className="card p-8">
          <h2 className="font-display text-2xl font-bold">Send us a message</h2>
          <p className="mt-1 text-sm text-ink-muted">We typically respond within 4 business hours.</p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, value, href }: { icon: any; title: string; value: string; href?: string }) {
  const content = (
    <div className="card flex items-start gap-4 p-5 transition hover:border-brand">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{title}</p>
        <p className="mt-1 font-semibold text-ink dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href}>{content}</a> : content;
}
