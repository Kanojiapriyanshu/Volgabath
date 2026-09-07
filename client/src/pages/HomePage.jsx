import { Link } from 'react-router-dom';
import ComplaintForm from '../components/ComplaintForm';
import { COMPANY_PHONE, COMPANY_PHONE_DISPLAY } from '../config';

const SERVICES = [
  { icon: '🚿', name: 'Water Leakage Fix', desc: 'Stop leaks before they damage your home' },
  { icon: '🔧', name: 'Pipe Repair', desc: 'Burst or broken pipe repairs' },
  { icon: '🚽', name: 'Toilet Repair', desc: 'Flush, seat & bowl issues fixed' },
  { icon: '🚰', name: 'Tap & Faucet', desc: 'Dripping taps & mixer repairs' },
  { icon: '💧', name: 'Water Tank', desc: 'Tank cleaning & overflow fixes' },
  { icon: '🚫', name: 'Drain Unblocking', desc: 'Clogged drains cleared fast' },
];

const HIGHLIGHTS = [
  { icon: '⚡', title: 'Quick Response', desc: 'Within 2 hours' },
  { icon: '👨‍🔧', title: 'Certified Technicians', desc: 'Trained professionals' },
  { icon: '💰', title: 'Affordable Pricing', desc: 'No hidden charges' },
];

function LogoIcon() {
  return (
    <svg className="h-10 w-10" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="#FF6B2C" fillOpacity="0.2" />
      <path
        d="M14 30l6-12 6 12M26 18v12"
        stroke="#FF6B2C"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 16c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z"
        fill="#4FC3F7"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-mobile lg:max-w-4xl">
        {/* Hero */}
        <section
          className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-cover bg-center px-5 py-12 text-center text-white"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800)`,
          }}
        >
          <div className="absolute top-6 left-1/2 -translate-x-1/2">
            <LogoIcon />
          </div>
          <div className="mt-16 max-w-sm">
            <h1 className="font-heading text-3xl font-bold leading-tight sm:text-4xl">
              Fast & Reliable Plumbing Services
            </h1>
            <p className="mt-3 text-base text-gray-200 sm:text-lg">
              Available 24/7 for Emergency Repairs
            </p>
            <a
              href={`tel:+91${COMPANY_PHONE}`}
              className="mt-8 flex w-full items-center justify-center rounded-xl bg-orange py-4 font-heading text-base font-bold text-white shadow-lg transition hover:bg-orange/90"
            >
              📞 Call Now: {COMPANY_PHONE_DISPLAY}
            </a>
          </div>
        </section>

        {/* Services */}
        <section className="px-5 py-12">
          <h2 className="text-center font-heading text-2xl font-bold text-navy">Our Services</h2>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {SERVICES.map((s) => (
              <div
                key={s.name}
                className="rounded-xl bg-white p-4 shadow-md ring-1 ring-gray-100"
              >
                <span className="text-2xl">{s.icon}</span>
                <h3 className="mt-2 font-heading text-sm font-semibold text-navy">{s.name}</h3>
                <p className="mt-1 text-xs text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-navy px-5 py-12 text-white">
          <h2 className="text-center font-heading text-2xl font-bold">Why Choose Us</h2>
          <div className="mt-8 space-y-4">
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.title}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <span className="text-3xl">{h.icon}</span>
                <div>
                  <h3 className="font-heading font-semibold">{h.title}</h3>
                  <p className="text-sm text-gray-300">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Complaint Form */}
        <section className="bg-surface px-5 py-12">
          <h2 className="text-center font-heading text-2xl font-bold text-navy">
            Register Your Complaint
          </h2>
          <div className="mx-auto mt-8 max-w-md">
            <img
              src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600"
              alt="Plumbing professional"
              className="mb-6 h-40 w-full rounded-2xl object-cover shadow-md"
            />
            <div className="rounded-2xl bg-white p-6 shadow-xl">
              <ComplaintForm />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-navy px-5 py-10 text-center text-white">
          <h3 className="font-heading text-xl font-bold">Volga Metal Industries</h3>
          <p className="mt-1 text-sm text-gray-300">Your trusted local plumbing partner</p>
          <p className="mt-4 font-medium text-orange">Emergency: {COMPANY_PHONE_DISPLAY}</p>
          <Link
            to="/admin/login"
            className="mt-6 inline-block text-xs text-gray-400 hover:text-gray-200"
          >
            Admin Login
          </Link>
        </footer>
      </div>
    </div>
  );
}
