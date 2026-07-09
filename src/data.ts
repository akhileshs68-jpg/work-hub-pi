/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tenant, UserProfile, Job, ServiceListing, Review, Conversation, ChatMessage, Notification } from './types';

// Digital Services and Local Services lists as per PRD
export const DIGITAL_CATEGORIES = [
  'Web Development',
  'Mobile App Development',
  'AI/ML',
  'Graphic Design',
  'Video Editing',
  'Writing/Translation',
  'Digital Marketing',
  'UI/UX Design',
  'Data Entry',
  'SEO',
  'Virtual Assistance'
];

export const LOCAL_CATEGORIES = [
  'Electrician',
  'Plumber',
  'Carpenter',
  'Construction',
  'Painter',
  'Mechanic',
  'AC Repair',
  'Home Tutor',
  'Photographer',
  'Cleaning',
  'Moving',
  'Landscaping',
  'Welding',
  'Appliance Repair',
  'Pest Control',
  'Catering'
];

export const ALL_CATEGORIES = [...DIGITAL_CATEGORIES, ...LOCAL_CATEGORIES];

// Predefined tenants representing white-label Partner Portals
export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-pigigs',
    name: 'PiGigs Global',
    subdomain: 'pigigs.workhubpi.com',
    logo: '⚡',
    tagline: 'The Ultimate Tech & Creative Freelancing Platform on Pi Network',
    themeColor: '#4F46E5', // Indigo-600
    bannerUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    seoTitle: 'PiGigs - Digital Freelance Marketplace',
    seoDescription: 'Find and hire top web developers, UX designers, AI experts, and copywriters accepting Pi Network tokens.',
    contactEmail: 'support@pigigs.com',
    contactPhone: '+1 (555) 019-2831',
    contactAddress: 'Suite 400, 100 Innovation Way, San Francisco, CA',
    socials: {
      facebook: 'https://facebook.com/pigigs',
      twitter: 'https://twitter.com/pigigs',
      linkedin: 'https://linkedin.com/company/pigigs'
    },
    isActive: true
  },
  {
    id: 'tenant-localhelper',
    name: 'Pi LocalHelper',
    subdomain: 'helper.workhubpi.com',
    logo: '🛠️',
    tagline: 'On-Demand Handyman, Home Tutors & Maintenance Services Near You',
    themeColor: '#059669', // Emerald-600
    bannerUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
    seoTitle: 'Pi LocalHelper - Local Service Directory',
    seoDescription: 'Directly discover electricians, plumbers, tutoring, and landscaping in your city. Quick contact via Chat or Direct Call.',
    contactEmail: 'contact@pilocalhelper.com',
    contactPhone: '+1 (555) 987-6543',
    contactAddress: '12 Main Street, Austin, TX',
    socials: {
      facebook: 'https://facebook.com/pilocalhelper',
      instagram: 'https://instagram.com/pilocalhelper'
    },
    isActive: true
  },
  {
    id: 'tenant-buildpi',
    name: 'BuildPi Hub',
    subdomain: 'build.workhubpi.com',
    logo: '🏗️',
    tagline: 'Industrial & Domestic Construction, Remodeling, and Welding Services',
    themeColor: '#D97706', // Amber-600
    bannerUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    seoTitle: 'BuildPi - Construction & Trade Services',
    seoDescription: 'Connect with expert trade professionals for painting, carpentry, welding, and general contracting.',
    contactEmail: 'info@buildpi.com',
    contactPhone: '+1 (555) 456-7890',
    contactAddress: '88 Industrial Ave, Detroit, MI',
    socials: {
      linkedin: 'https://linkedin.com/company/buildpi',
      twitter: 'https://twitter.com/buildpi'
    },
    isActive: true
  }
];

// Reference cities for distance calculations (Haversine formula helper)
export const CITIES = [
  { name: 'San Francisco', state: 'California', country: 'United States', lat: 37.7749, lng: -122.4194 },
  { name: 'Austin', state: 'Texas', country: 'United States', lat: 30.2672, lng: -97.7431 },
  { name: 'New York', state: 'New York', country: 'United States', lat: 40.7128, lng: -74.0060 },
  { name: 'Detroit', state: 'Michigan', country: 'United States', lat: 42.3314, lng: -83.0458 }
];

// Initial profiles
export const INITIAL_PROFILES: UserProfile[] = [
  // Super Admin
  {
    id: 'usr-superadmin',
    tenantId: '',
    role: 'super_admin',
    username: 'pinetwork_master',
    displayName: 'Global Super Admin',
    photoUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=superadmin',
    bio: 'Work Hub Pi system administrator. Overseeing all sub-marketplaces and white-label platforms.',
    phone: '+1 (800) 555-0100',
    email: 'admin@workhubpi.com',
    location: {
      country: 'United States',
      state: 'California',
      district: 'SF Bay Area',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194
    },
    createdAt: '2026-01-01T00:00:00Z'
  },
  // Partner Admins
  {
    id: 'usr-partner-pigigs',
    tenantId: 'tenant-pigigs',
    role: 'partner_admin',
    username: 'pigigs_manager',
    displayName: 'Elena Rostova',
    photoUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=elena',
    bio: 'Partner Administrator for PiGigs Global. Specializing in curation of elite digital talents.',
    phone: '+1 (555) 019-2831',
    email: 'elena@pigigs.com',
    location: {
      country: 'United States',
      state: 'California',
      district: 'SF Bay Area',
      city: 'San Francisco',
      latitude: 37.7850,
      longitude: -122.4300
    },
    createdAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 'usr-partner-localhelper',
    tenantId: 'tenant-localhelper',
    role: 'partner_admin',
    username: 'helper_boss',
    displayName: 'Marcus Brody',
    photoUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=marcus',
    bio: 'Partner Admin of Pi LocalHelper. Dedicated to organizing local home solutions.',
    phone: '+1 (555) 987-6543',
    email: 'marcus@pilocalhelper.com',
    location: {
      country: 'United States',
      state: 'Texas',
      district: 'Travis County',
      city: 'Austin',
      latitude: 30.2700,
      longitude: -97.7400
    },
    createdAt: '2026-01-15T09:30:00Z'
  },

  // Clients
  {
    id: 'usr-client-tech',
    tenantId: 'tenant-pigigs',
    role: 'client',
    username: 'tech_founder',
    displayName: 'David Vance',
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    bio: 'SaaS startup founder. Seeking top talent for rapid prototyping and AI systems integration.',
    phone: '+1 (555) 301-4402',
    email: 'david@vancestartups.io',
    location: {
      country: 'United States',
      state: 'California',
      district: 'SF Bay Area',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194
    },
    clientProfile: {
      savedProviderIds: ['usr-provider-webdev']
    },
    createdAt: '2026-02-01T15:00:00Z'
  },
  {
    id: 'usr-client-home',
    tenantId: 'tenant-localhelper',
    role: 'client',
    username: 'homeowner_sarah',
    displayName: 'Sarah Jenkins',
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    bio: 'Homeowner in Austin. Regularly need AC service, landscaping, and tutoring for my kids.',
    phone: '+1 (555) 404-5829',
    email: 'sjenkins@gmail.com',
    location: {
      country: 'United States',
      state: 'Texas',
      district: 'Travis County',
      city: 'Austin',
      latitude: 30.2672,
      longitude: -97.7431
    },
    clientProfile: {
      savedProviderIds: ['usr-provider-plumber']
    },
    createdAt: '2026-02-12T10:00:00Z'
  },

  // Providers
  {
    id: 'usr-provider-webdev',
    tenantId: 'tenant-pigigs',
    role: 'provider',
    username: 'dev_alex',
    displayName: 'Alex Mercer',
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    bio: 'Full Stack React & Node.js Developer. 6 years experience. Specializing in high-performance Web Apps and custom dashboards. Prompt delivery, payments in Pi.',
    phone: '+1 (555) 802-9912',
    email: 'alex.mercer@gmail.com',
    location: {
      country: 'United States',
      state: 'California',
      district: 'SF Bay Area',
      city: 'San Francisco',
      latitude: 37.7600, // ~1.8 km from downtown SF
      longitude: -122.4100
    },
    providerProfile: {
      portfolioLinks: ['https://mercerdev.io', 'https://github.com/amercer'],
      workSamples: ['E-Commerce SaaS Dashboard', 'Pi Wallet Integration Hook', 'Mobile Gym Tracker'],
      categories: ['Web Development', 'UI/UX Design', 'SEO'],
      availability: 'Available',
      rating: 4.9,
      reviewCount: 3
    },
    createdAt: '2026-01-20T08:00:00Z'
  },
  {
    id: 'usr-provider-ai',
    tenantId: 'tenant-pigigs',
    role: 'provider',
    username: 'ai_guru',
    displayName: 'Dr. Chloe Tan',
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chloe',
    bio: 'Former Big Tech Machine Learning Researcher. Building custom LLM pipelines, AI/ML chatbots, and fine-tuning custom models. Accept payments in Pi Network.',
    phone: '+1 (555) 901-7766',
    email: 'chloe.tan.ai@outlook.com',
    location: {
      country: 'United States',
      state: 'California',
      district: 'SF Bay Area',
      city: 'San Francisco',
      latitude: 37.7900, // ~2.2 km from downtown SF
      longitude: -122.4000
    },
    providerProfile: {
      portfolioLinks: ['https://chloetan-ai.github.io', 'https://huggingface.co/ctan'],
      workSamples: ['Vantage-1 7B Finetuning', 'RAG Document Analysis System', 'Pi Network NLP Bot'],
      categories: ['AI/ML', 'Mobile App Development'],
      availability: 'Available',
      rating: 5.0,
      reviewCount: 1
    },
    createdAt: '2026-01-25T14:22:00Z'
  },
  {
    id: 'usr-provider-plumber',
    tenantId: 'tenant-localhelper',
    role: 'provider',
    username: 'plumb_master',
    displayName: 'Jim Carter (Carter Plumbing)',
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jim',
    bio: 'Licensed plumber with 15 years experience. Kitchen remodeling, drain cleaning, emergency pipe repair, water heater diagnostics. Fast local service in Austin!',
    phone: '+1 (555) 606-2211',
    email: 'carterplumbing@tx.net',
    location: {
      country: 'United States',
      state: 'Texas',
      district: 'Travis County',
      city: 'Austin',
      latitude: 30.2550, // ~1.9 km from downtown Austin
      longitude: -122.4100 // Austin (mocked with Texas coordinates for distance)
    },
    providerProfile: {
      portfolioLinks: ['https://carterplumbingatx.com'],
      workSamples: ['Commercial Kitchen Pipeline', 'Modern Heat Pump Setup', 'Under-Sink Pipe Re-Route'],
      categories: ['Plumber', 'Appliance Repair', 'AC Repair'],
      availability: 'Available',
      rating: 4.8,
      reviewCount: 2
    },
    createdAt: '2026-01-18T11:00:00Z'
  },
  {
    id: 'usr-provider-tutor',
    tenantId: 'tenant-localhelper',
    role: 'provider',
    username: 'tutor_amy',
    displayName: 'Amy Wilson, M.Ed.',
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amy',
    bio: 'Certified high school Math & Science teacher. Specialized in algebra, geometry, calculus, and AP Physics. 1-on-1 offline or digital tutoring. Fully tailored.',
    phone: '+1 (555) 701-4433',
    email: 'amy.wilson@edu.org',
    location: {
      country: 'United States',
      state: 'Texas',
      district: 'Travis County',
      city: 'Austin',
      latitude: 30.2900, // ~3.1 km from downtown Austin
      longitude: -97.7300
    },
    providerProfile: {
      portfolioLinks: [],
      workSamples: ['Calculus Success Guide', 'SAT Practice Sheets'],
      categories: ['Home Tutor'],
      availability: 'Available',
      rating: 5.0,
      reviewCount: 1
    },
    createdAt: '2026-02-05T16:00:00Z'
  }
];

// Initial Job posts
export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    tenantId: 'tenant-pigigs',
    clientId: 'usr-client-tech',
    title: 'Vite & Tailwind Dashboard Prototyping',
    description: 'We need a senior frontend engineer to build a functional SaaS dashboard mockup. Must use React 19, Vite, Tailwind CSS, and Recharts. Need dynamic views for user registration, admin configuration, and real-time statistics tracking. Deliver within 5 days.',
    category: 'Web Development',
    serviceType: 'digital',
    country: 'United States',
    state: 'California',
    district: 'SF Bay Area',
    city: 'San Francisco',
    latitude: 37.7749,
    longitude: -122.4194,
    visibility: 'Global',
    budget: 150, // Pi
    status: 'Open',
    createdAt: '2026-07-01T10:00:00Z'
  },
  {
    id: 'job-2',
    tenantId: 'tenant-pigigs',
    clientId: 'usr-client-tech',
    title: 'Custom Brand Identity & Vector Logos',
    description: 'Looking for a graphic designer to create a complete visual asset bundle for our decentralized marketplace. Includes logo variants (dark/light theme), brand book, custom typography suggestions, and 8 illustrative dashboard icons. Deliver as SVG.',
    category: 'Graphic Design',
    serviceType: 'digital',
    country: 'United States',
    state: 'California',
    district: 'SF Bay Area',
    city: 'San Francisco',
    latitude: 37.7749,
    longitude: -122.4194,
    visibility: 'Global',
    budget: 65, // Pi
    status: 'Open',
    createdAt: '2026-07-03T14:30:00Z'
  },
  {
    id: 'job-3',
    tenantId: 'tenant-localhelper',
    clientId: 'usr-client-home',
    title: 'Clogged Main Sewer Pipe Diagnostic & Hydro Jetting',
    description: 'Emergency plumber needed. Main sewer cleanout is backing up into the front lawn. Need camera inspection, location of block, and hydro-jetting cleanout. Must have their own specialized truck gear.',
    category: 'Plumber',
    serviceType: 'local',
    country: 'United States',
    state: 'Texas',
    district: 'Travis County',
    city: 'Austin',
    latitude: 30.2672,
    longitude: -97.7431,
    visibility: 'Local',
    budget: 95, // Pi
    status: 'Open',
    createdAt: '2026-07-06T08:00:00Z'
  }
];

// Initial Service listings (Directory Mode)
export const INITIAL_LISTINGS: ServiceListing[] = [
  {
    id: 'lst-1',
    tenantId: 'tenant-pigigs',
    providerId: 'usr-provider-webdev',
    title: 'Professional React/TypeScript Web Development',
    description: 'Get responsive, pixel-perfect web applications built to your exact specifications. High clean-code standards, Tailwind CSS, API integrations, and robust state engines. Quick 1-to-2 week turnarounds.',
    category: 'Web Development',
    serviceType: 'digital',
    country: 'United States',
    state: 'California',
    district: 'SF Bay Area',
    city: 'San Francisco',
    latitude: 37.7600,
    longitude: -122.4100,
    visibility: 'Global',
    price: 35, // Pi per hour
    portfolioLinks: ['https://mercerdev.io'],
    status: 'Active',
    createdAt: '2026-06-15T09:00:00Z'
  },
  {
    id: 'lst-2',
    tenantId: 'tenant-pigigs',
    providerId: 'usr-provider-ai',
    title: 'Custom AI Chatbots & LLM Agents',
    description: 'Integrate advanced generative AI pipelines into your existing app. Setup vector databases, RAG embeddings, structured API responses, and custom chat portals using the latest OpenAI/Gemini SDKs.',
    category: 'AI/ML',
    serviceType: 'digital',
    country: 'United States',
    state: 'California',
    district: 'SF Bay Area',
    city: 'San Francisco',
    latitude: 37.7900,
    longitude: -122.4000,
    visibility: 'Global',
    price: 60, // Pi per hour
    portfolioLinks: ['https://chloetan-ai.github.io'],
    status: 'Active',
    createdAt: '2026-06-22T11:00:00Z'
  },
  {
    id: 'lst-3',
    tenantId: 'tenant-localhelper',
    providerId: 'usr-provider-plumber',
    title: 'Emergency Plumbing, Pipe Repairs & Water Heaters',
    description: 'Fast, professional residential plumbing. Boiler leak repair, faucet replacement, clogged drains, toilet troubleshooting, water pressure stabilization. Licensed & bonded. Available 24/7 for critical emergencies.',
    category: 'Plumber',
    serviceType: 'local',
    country: 'United States',
    state: 'Texas',
    district: 'Travis County',
    city: 'Austin',
    latitude: 30.2550,
    longitude: -97.7550,
    visibility: 'Local',
    price: 45, // Pi per hour
    portfolioLinks: [],
    status: 'Active',
    createdAt: '2026-06-18T08:00:00Z'
  },
  {
    id: 'lst-4',
    tenantId: 'tenant-localhelper',
    providerId: 'usr-provider-tutor',
    title: '1-on-1 Algebra & Calculus Advanced Private Tutoring',
    description: 'Unlock mathematical excellence. Personalized lesson plan covering AP Calculus AB/BC, College Algebra, Trigonometry, and SAT preparation. Direct progress tracking and exercises included.',
    category: 'Home Tutor',
    serviceType: 'local',
    country: 'United States',
    state: 'Texas',
    district: 'Travis County',
    city: 'Austin',
    latitude: 30.2900,
    longitude: -97.7300,
    visibility: 'Local',
    price: 20, // Pi per hour
    portfolioLinks: [],
    status: 'Active',
    createdAt: '2026-07-01T15:00:00Z'
  }
];

// Initial Reviews
export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    tenantId: 'tenant-pigigs',
    jobId: 'job-completed-mock-1',
    reviewerId: 'usr-client-tech',
    revieweeId: 'usr-provider-webdev',
    rating: 5,
    comment: 'Superb front-end engineering work. Alex is highly responsive, deeply understands React and Tailwind, and delivered clean, self-documenting code. Highly recommend.',
    createdAt: '2026-05-10T14:00:00Z'
  },
  {
    id: 'rev-2',
    tenantId: 'tenant-localhelper',
    jobId: 'job-completed-mock-2',
    reviewerId: 'usr-client-home',
    revieweeId: 'usr-provider-plumber',
    rating: 5,
    comment: 'Jim saved our basement! Came within 30 minutes of our call, solved the sewer leak quickly and kept the pricing strictly as quoted. Solid provider!',
    createdAt: '2026-06-20T10:00:00Z'
  }
];

// Initial Notifications
export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'not-1',
    tenantId: 'tenant-pigigs',
    userId: 'usr-client-tech',
    title: 'New Service Listing Active',
    message: 'Dr. Chloe Tan listed a new service in AI/ML matching your preferences.',
    read: false,
    type: 'system',
    createdAt: '2026-07-08T09:00:00-07:00'
  },
  {
    id: 'not-2',
    tenantId: 'tenant-localhelper',
    userId: 'usr-provider-plumber',
    title: 'New Job Posted Nearby!',
    message: 'A client posted a "Clogged Sewer Pipe" job matching your plumbing skill set within 2km of your location!',
    read: false,
    type: 'job_match',
    createdAt: '2026-07-08T08:15:00-07:00'
  }
];

// Haversine Distance Helper to support Location Proximity in local listings
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return parseFloat(d.toFixed(1)); // in Kilometers
}
