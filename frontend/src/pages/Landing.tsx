import { motion } from 'framer-motion';
import { BarChart3, BellRing, FileText, Home, Languages, ShieldCheck, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card } from '../components/ui';

const features = [
  { title: 'Multi-property control', text: 'Track houses, apartments, villas, and commercial units with occupancy, dues, and owner-scoped access.', icon: Home },
  { title: 'Payments and receipts', text: 'Create rent, advance, maintenance, EB, and water requests with Razorpay-ready order and webhook APIs.', icon: FileText },
  { title: 'Tenant reminders', text: 'Send in-app reminders, prepare SMS and WhatsApp provider hooks, and keep a full notification trail.', icon: BellRing },
  { title: 'Secure by role', text: 'JWT, refresh tokens, BCrypt, method security, scoped queries, validation, CORS, and rate limiting are wired in.', icon: ShieldCheck },
  { title: 'Tamil-ready experience', text: 'Branding and content structure support English and Tamil for owner and tenant workflows.', icon: Languages },
  { title: 'Mobile friendly', text: 'Responsive dashboards, tables, forms, and navigation work cleanly across phone and desktop widths.', icon: Smartphone },
];

const testimonials = [
  ['Ravi Kumar', 'Chennai owner', 'Rent status and receipts are finally in one place.'],
  ['Priya S', 'Tenant', 'I can see dues, payments, and receipts without calling the owner.'],
  ['Anand Homes', 'Property manager', 'The owner dashboard makes monthly follow-up much easier.'],
];

export function Landing() {
  return <div className="space-y-16">
    <section
      className="relative -mx-4 overflow-hidden rounded-lg bg-slate-950 px-4 py-14 text-white shadow-2xl md:px-10 lg:min-h-[72svh]"
      style={{
        backgroundImage: "linear-gradient(90deg, rgba(2,6,23,.88), rgba(15,23,42,.58), rgba(15,23,42,.2)), url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1800&q=80')",
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[58svh] max-w-3xl flex-col justify-center space-y-6">
        <Badge className="w-fit bg-white/15 text-amber-100">Premium South Indian rental SaaS</Badge>
        <div>
          <p className="text-lg font-black text-marigold">வீட்டு வாடகை</p>
          <h1 className="mt-2 text-5xl font-black tracking-tight md:text-7xl">Veetu Vadagai</h1>
        </div>
        <p className="max-w-2xl text-lg text-slate-100 md:text-xl">A secure rental management platform for owners, tenants, receipts, agreements, dues, and reminders.</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/register"><Button className="bg-marigold text-slate-950 hover:bg-amber-300">Start free</Button></Link>
          <Link to="/login"><Button className="bg-white text-slate-950 hover:bg-slate-100">Login</Button></Link>
        </div>
      </motion.div>
    </section>

    <section className="grid gap-4 md:grid-cols-3">
      {features.map(({ title, text, icon: Icon }) => <Card key={title} className="space-y-3">
        <div className="inline-flex rounded-lg bg-kolam/10 p-3 text-kolam"><Icon size={22} /></div>
        <h2 className="text-xl font-black">{title}</h2>
        <p className="text-slate-600 dark:text-slate-300">{text}</p>
      </Card>)}
    </section>

    <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <Card className="space-y-4 bg-slate-950 text-white">
        <div className="inline-flex rounded-lg bg-white/10 p-3 text-marigold"><BarChart3 size={24} /></div>
        <h2 className="text-3xl font-black">Owner-grade analytics</h2>
        <p className="text-slate-300">Revenue, occupied/vacant stats, tenant counts, pending dues, and recent payments are available from the first dashboard.</p>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Paid" value="100%" />
          <Stat label="Dues" value="Rs.0" />
          <Stat label="Homes" value="1+" />
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map(([name, role, quote]) => <Card key={name}>
          <p className="text-lg font-black">{name}</p>
          <p className="text-sm text-kolam">{role}</p>
          <p className="mt-4 text-slate-600 dark:text-slate-300">{quote}</p>
        </Card>)}
      </div>
    </section>

    <section className="grid gap-4 md:grid-cols-3">
      <Price title="Starter" price="Rs.0" text="1 property, tenant profile, receipts." />
      <Price title="Owner Pro" price="Rs.499/mo" text="Unlimited properties, reminders, analytics." active />
      <Price title="Enterprise" price="Custom" text="Multi-branch operations and integrations." />
    </section>

    <section className="grid gap-6 md:grid-cols-2">
      <Card>
        <h2 className="text-3xl font-black">FAQ</h2>
        <p className="mt-4 font-semibold">Does it support Tamil?</p>
        <p className="text-slate-600 dark:text-slate-300">Yes. The branding and copy structure are ready for English and Tamil.</p>
        <p className="mt-4 font-semibold">Can tenants pay online?</p>
        <p className="text-slate-600 dark:text-slate-300">Yes. The backend includes Razorpay order, webhook, status sync, and UPI intent support.</p>
      </Card>
      <Card>
        <h2 className="text-3xl font-black">Contact</h2>
        <p className="mt-4">hello@veetuvadagai.example</p>
        <p className="text-slate-600 dark:text-slate-300">Built for Chennai, Coimbatore, Madurai, Bengaluru, and rental portfolios across India.</p>
      </Card>
    </section>

    <footer className="pb-8 text-center text-slate-500">© 2026 Veetu Vadagai. Secure rental management for India.</footer>
  </div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-white/10 p-4"><p className="text-sm text-slate-300">{label}</p><p className="text-2xl font-black">{value}</p></div>;
}

function Price({ title, price, text, active }: { title: string; price: string; text: string; active?: boolean }) {
  return <Card className={active ? 'ring-2 ring-marigold' : undefined}>
    <h3 className="text-2xl font-black">{title}</h3>
    <p className="mt-3 text-4xl font-black">{price}</p>
    <p className="mt-3 text-slate-600 dark:text-slate-300">{text}</p>
  </Card>;
}
