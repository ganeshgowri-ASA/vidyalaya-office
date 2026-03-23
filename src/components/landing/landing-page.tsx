'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  FileText,
  Table2,
  Presentation,
  Workflow,
  FileDown,
  Mail,
  MessageSquare,
  Sparkles,
  Check,
  ChevronRight,
  Users,
  FileStack,
  Shield,
  Activity,
  Menu,
  X,
  Star,
  Zap,
  Globe,
  Lock,
} from 'lucide-react';
import { useState } from 'react';

// ─── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--background) 85%, transparent)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            V
          </div>
          <span className="font-semibold text-base hidden sm:block" style={{ color: 'var(--foreground)' }}>
            विद्यालय <span style={{ color: 'var(--primary)' }}>Vidyalaya</span> Office
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Pricing', 'About'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200"
            style={{ color: 'var(--foreground)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg"
          style={{ color: 'var(--foreground)' }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-6 py-4 flex flex-col gap-4"
          style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
        >
          {['Features', 'Pricing', 'About'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium"
              style={{ color: 'var(--muted-foreground)' }}
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <Link href="/auth/login" className="text-sm font-medium py-2" style={{ color: 'var(--foreground)' }}>
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-semibold px-4 py-2 rounded-lg text-center"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero Section ──────────────────────────────────────────────────────────────

const heroModules = [
  { icon: FileText, label: 'Documents', href: '/document' },
  { icon: Table2, label: 'Spreadsheets', href: '/spreadsheet' },
  { icon: Presentation, label: 'Presentations', href: '/presentation' },
  { icon: Workflow, label: 'Graphics', href: '/graphics' },
  { icon: FileDown, label: 'PDF Tools', href: '/pdf' },
  { icon: Mail, label: 'Email', href: '/email' },
  { icon: MessageSquare, label: 'Chat', href: '/chat' },
  { icon: Sparkles, label: 'AI Assistant', href: '/dashboard' },
];

function HeroSection() {
  return (
    <section
      className="relative pt-32 pb-24 overflow-hidden"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Background gradient blobs */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, var(--primary) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 text-center relative">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8"
          style={{
            borderColor: 'var(--primary)',
            color: 'var(--primary)',
            backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
          }}
        >
          <Sparkles size={14} />
          AI-Native Office Suite
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 max-w-4xl mx-auto">
          <span
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, #a78bfa 50%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Work Smarter
          </span>{' '}
          <span style={{ color: 'var(--foreground)' }}>with AI-Powered Productivity</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          Documents, Spreadsheets, Presentations, Email, Chat — all in one intelligent workspace. Built for the modern team.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 hover:opacity-90 hover:scale-105"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Start Free
            <ChevronRight size={18} />
          </Link>
          <button
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold border transition-all duration-200 hover:scale-105"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <Activity size={18} />
            Watch Demo
          </button>
        </div>

        {/* Module icons grid */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4 max-w-3xl mx-auto">
          {heroModules.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 hover:scale-105 group"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--sidebar)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
              }}
            >
              <Icon size={22} style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features Grid ─────────────────────────────────────────────────────────────

const features = [
  {
    icon: FileText,
    title: 'Document Editor',
    description: 'Write with AI assistance, track changes, and collaborate in real-time with your entire team.',
    href: '/document',
  },
  {
    icon: Table2,
    title: 'Spreadsheet',
    description: 'Formulas, charts, pivot tables, and data analysis powered by AI for instant insights.',
    href: '/spreadsheet',
  },
  {
    icon: Presentation,
    title: 'Presentation',
    description: 'Create stunning slides with AI-generated content, smart layouts, and beautiful themes.',
    href: '/presentation',
  },
  {
    icon: Workflow,
    title: 'Graphics & Flowcharts',
    description: 'Design diagrams, flowcharts, and visual content with intuitive drag-and-drop tools.',
    href: '/graphics',
  },
  {
    icon: FileDown,
    title: 'PDF Tools',
    description: 'View, annotate, merge, split, and convert PDF documents with ease and precision.',
    href: '/pdf',
  },
  {
    icon: Mail,
    title: 'Email',
    description: 'Professional email with AI drafting, smart categorization, and customizable templates.',
    href: '/email',
  },
  {
    icon: MessageSquare,
    title: 'Chat & Messaging',
    description: 'Real-time team messaging with channels, threads, and seamless file sharing.',
    href: '/chat',
  },
  {
    icon: Sparkles,
    title: 'AI Assistant',
    description: 'Built-in AI that understands your documents and helps you work faster than ever before.',
    href: '/dashboard',
  },
];

function FeaturesGrid() {
  return (
    <section id="features" className="py-24" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
            style={{
              color: 'var(--primary)',
              backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
            }}
          >
            <Zap size={14} />
            Everything You Need
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            One suite. Every tool.
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            Replace a dozen apps with a single intelligent platform designed to keep your team in flow.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, description, href }) => (
            <Link
              key={title}
              href={href}
              className="group relative p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 block"
              style={{
                backgroundColor: 'var(--sidebar)',
                borderColor: 'var(--border)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px color-mix(in srgb, var(--primary) 15%, transparent)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* Icon container */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                }}
              >
                <Icon size={24} style={{ color: 'var(--primary)' }} />
              </div>

              <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {description}
              </p>

              {/* Arrow indicator */}
              <div
                className="mt-4 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ color: 'var(--primary)' }}
              >
                Open app <ChevronRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats / Social Proof ──────────────────────────────────────────────────────

const stats = [
  { icon: Users, value: '10,000+', label: 'Users' },
  { icon: FileStack, value: '50M+', label: 'Documents Created' },
  { icon: Activity, value: '99.9%', label: 'Uptime' },
  { icon: Shield, value: '256-bit', label: 'Encryption' },
];

function StatsSection() {
  return (
    <section
      className="py-16 border-y"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--sidebar)' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center text-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}
              >
                <Icon size={22} style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {value}
                </div>
                <div className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing Section ───────────────────────────────────────────────────────────

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    tagline: 'For individuals',
    recommended: false,
    features: [
      '5 GB storage',
      'Up to 3 documents',
      'Basic AI assistance',
      'Email support',
      'All core editors',
      'PDF viewer',
    ],
    cta: 'Get Started Free',
    href: '/auth/register',
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/mo',
    tagline: 'For professionals',
    recommended: true,
    features: [
      '100 GB storage',
      'Unlimited documents',
      'Advanced AI features',
      'Priority support',
      'Real-time collaboration',
      'Version history',
      'Custom templates',
      'Email & chat apps',
    ],
    cta: 'Start Pro Trial',
    href: '/auth/register',
  },
  {
    name: 'Enterprise',
    price: '$29',
    period: '/user/mo',
    tagline: 'For teams',
    recommended: false,
    features: [
      'Unlimited storage',
      'Admin controls',
      'SSO / SAML',
      'Dedicated support',
      'Custom integrations',
      'Audit logs',
      'SLA guarantee',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    href: '/auth/register',
  },
];

function PricingSection() {
  return (
    <section id="pricing" className="py-24" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
            style={{
              color: 'var(--primary)',
              backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
            }}
          >
            <Star size={14} />
            Simple Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Choose your plan
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            Start free, upgrade when you're ready. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                'relative flex flex-col p-8 rounded-2xl border transition-all duration-300',
                tier.recommended ? 'scale-[1.03]' : ''
              )}
              style={{
                backgroundColor: tier.recommended ? 'color-mix(in srgb, var(--primary) 8%, var(--sidebar))' : 'var(--sidebar)',
                borderColor: tier.recommended ? 'var(--primary)' : 'var(--border)',
                boxShadow: tier.recommended ? '0 0 40px color-mix(in srgb, var(--primary) 20%, transparent)' : 'none',
              }}
            >
              {/* Recommended badge */}
              {tier.recommended && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  Recommended
                </div>
              )}

              {/* Plan name & tagline */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                  {tier.name}
                </h3>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {tier.tagline}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-end gap-1 mb-8">
                <span className="text-5xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {tier.price}
                </span>
                <span className="text-sm pb-1" style={{ color: 'var(--muted-foreground)' }}>
                  {tier.period}
                </span>
              </div>

              {/* Feature list */}
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm" style={{ color: 'var(--foreground)' }}>
                    <Check
                      size={16}
                      className="shrink-0"
                      style={{ color: tier.recommended ? 'var(--primary)' : 'var(--muted-foreground)' }}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={tier.href}
                className={cn(
                  'block text-center py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:scale-[1.02]'
                )}
                style={
                  tier.recommended
                    ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }
                    : { backgroundColor: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)' }
                }
                onMouseEnter={(e) => {
                  if (!tier.recommended) (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  if (!tier.recommended) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                }}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── About / CTA Banner ────────────────────────────────────────────────────────

function AboutSection() {
  return (
    <section
      id="about"
      className="py-24"
      style={{ backgroundColor: 'var(--sidebar)' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="relative rounded-3xl p-12 md:p-20 text-center overflow-hidden border"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--primary) 8%, var(--background))',
            borderColor: 'var(--primary)',
          }}
        >
          {/* Background decoration */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, var(--primary) 0%, transparent 70%)' }}
          />

          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Globe size={20} style={{ color: 'var(--primary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                Built for the modern team
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 max-w-3xl mx-auto" style={{ color: 'var(--foreground)' }}>
              Your team's productivity, supercharged by AI
            </h2>
            <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
              Vidyalaya Office is built from the ground up with AI at its core — not as an afterthought, but as the foundation of every feature. Join thousands of teams already working smarter.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 hover:opacity-90 hover:scale-105"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                <Sparkles size={18} />
                Start for Free — No Credit Card
              </Link>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <Lock size={14} />
                SOC 2 compliant · GDPR ready · 256-bit encryption
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────

const footerLinks = {
  Product: ['Features', 'Pricing', 'Integrations', 'Changelog'],
  Resources: ['Documentation', 'API', 'Community', 'Blog'],
  Company: ['About', 'Careers', 'Contact', 'Privacy'],
};

function Footer() {
  return (
    <footer
      className="border-t"
      style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                V
              </div>
              <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                Vidyalaya Office
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
              The AI-native office suite built for the way modern teams actually work.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
              <Lock size={12} />
              Enterprise-grade security
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--foreground)' }}>
                {section}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm transition-colors duration-200"
                      style={{ color: 'var(--muted-foreground)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
        >
          <span>© {new Date().getFullYear()} Vidyalaya Office. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:underline" style={{ color: 'var(--muted-foreground)' }}>
              Terms
            </a>
            <a href="#" className="hover:underline" style={{ color: 'var(--muted-foreground)' }}>
              Privacy
            </a>
            <a href="#" className="hover:underline" style={{ color: 'var(--muted-foreground)' }}>
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesGrid />
        <PricingSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
