import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Server, Shield, Truck, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About ServerFactory — Enterprise Server Specialists in India',
  description:
    'ServerFactory is India\'s configurator-first marketplace for enterprise servers, GPU workstations, and data-center components from Dell, HP, Lenovo, and NVIDIA.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-5xl font-extrabold md:text-6xl">
          About <span className="text-brand">ServerFactory</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-muted">
          We build India&apos;s most transparent marketplace for enterprise hardware — Dell, HP, Lenovo, NVIDIA and more,
          with fully customisable configurations and honest pricing.
        </p>
      </div>

      <section className="mt-20 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-bold">Our mission</h2>
          <p className="mt-4 leading-relaxed text-ink-muted">
            Buying enterprise servers shouldn&apos;t require a week of phone calls and three sales-rep follow-ups.
            ServerFactory puts the configurator online — pick your CPU, RAM, storage, OS and add-ons, see the real price,
            and order in minutes. We ship across India with fast delivery and pre-sales engineering support.
          </p>
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold">What we sell</h2>
          <ul className="mt-4 space-y-2 text-ink-muted">
            {[
              'Rack servers (Dell PowerEdge, HPE ProLiant, Lenovo ThinkSystem)',
              'GPU servers for AI & machine learning',
              'Storage & backup servers',
              'Dell Precision, HP Z, Lenovo ThinkStation workstations',
              'CPUs, ECC memory, enterprise SSDs',
              'Monthly hardware rentals',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-24 grid gap-6 md:grid-cols-4">
        {[
          { icon: Server, title: 'Configurator-first', desc: 'Build your exact server online — no quotes required.' },
          { icon: Shield, title: 'Warranty included', desc: 'OEM warranty + optional extended support.' },
          { icon: Truck, title: 'Pan-India delivery', desc: 'Fast dispatch from Bengaluru across all states.' },
          { icon: Users, title: 'Engineer support', desc: 'Free pre-sales consultation for demanding workloads.' },
        ].map((v) => (
          <div key={v.title} className="card p-6 text-center">
            <v.icon className="mx-auto h-10 w-10 text-brand" />
            <h3 className="mt-4 font-display font-bold">{v.title}</h3>
            <p className="mt-2 text-sm text-ink-muted">{v.desc}</p>
          </div>
        ))}
      </section>

      <section className="mt-24 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-400 px-8 py-16 text-center text-white shadow-brand md:px-16">
        <h2 className="font-display text-3xl font-extrabold md:text-4xl">Ready to build your server?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/90">
          Start configuring from 60+ enterprise models, or talk to an engineer for custom requirements.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/category/servers" className="rounded-full bg-white px-8 py-3 font-bold text-brand-700 hover:scale-105">
            Shop Servers
          </Link>
          <Link href="/contact" className="rounded-full border-2 border-white px-8 py-3 font-bold text-white hover:bg-white hover:text-brand-700">
            Talk to an engineer
          </Link>
        </div>
      </section>
    </div>
  );
}
