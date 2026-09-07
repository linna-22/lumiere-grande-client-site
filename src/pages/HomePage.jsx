import { Link } from "react-router-dom";
import {
  ArrowRight,
  Wifi,
  Waves,
  UtensilsCrossed,
  Sparkles,
  Car,
  BellRing,
  Star,
  Quote,
} from "lucide-react";
import { rooms } from "../data/rooms";
import RoomCard from "../components/RoomCard";
import { useBooking } from "../context/BookingContext";

const stats = [
  { value: "18", label: "Years of Excellence" },
  { value: "120+", label: "Rooms & Suites" },
  { value: "4.9", label: "Average Guest Rating" },
  { value: "35K+", label: "Happy Guests" },
];

const features = [
  {
    icon: Wifi,
    title: "High-Speed WiFi",
    description: "Stay connected with complimentary fiber-speed internet throughout the hotel.",
  },
  {
    icon: Waves,
    title: "Infinity Pool",
    description: "Unwind at our rooftop infinity pool with sweeping skyline views.",
  },
  {
    icon: UtensilsCrossed,
    title: "Fine Dining",
    description: "Savor curated menus crafted by award-winning chefs at our signature restaurant.",
  },
  {
    icon: Sparkles,
    title: "Luxury Spa",
    description: "Rejuvenate mind and body with bespoke treatments at Lumiere Spa & Wellness.",
  },
  {
    icon: Car,
    title: "Valet Parking",
    description: "Arrive in ease with complimentary valet and secure parking service.",
  },
  {
    icon: BellRing,
    title: "24/7 Concierge",
    description: "Our dedicated concierge team is on hand around the clock for every request.",
  },
];

const testimonials = [
  {
    name: "Amelia Carter",
    role: "Travel Blogger",
    quote:
      "Lumiere Grande redefined what a luxury stay means to me. The attention to detail in every corner is simply unmatched.",
  },
  {
    name: "James Whitfield",
    role: "Business Executive",
    quote:
      "Perfect for business travel — impeccable service, serene rooms, and an executive lounge that made my trip effortless.",
  },
  {
    name: "Sophia Martinez",
    role: "Honeymooner",
    quote:
      "We celebrated our honeymoon at the Presidential Suite and it exceeded every expectation. Truly unforgettable.",
  },
];

export default function HomePage() {
  const { openBooking } = useBooking();
  const featuredRooms = rooms.filter((room) => room.featured);

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-slate-950">
        <img
          src="/images/hero-hotel.jpg"
          alt="Lumiere Grande Hotel exterior at dusk"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />

        <div className="relative mx-auto w-full max-w-7xl px-6 pt-24 sm:px-8">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-amber-400">
            Welcome to Lumiere Grande
          </p>
          <h1 className="max-w-3xl font-serif text-4xl leading-tight text-white sm:text-6xl">
            Where Timeless Elegance Meets Modern Comfort
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
            Indulge in an unforgettable escape with breathtaking views, exquisite dining, and
            personalized service crafted around you.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              onClick={() => openBooking()}
              className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-amber-600/30 transition hover:bg-amber-700"
            >
              Book Now
            </button>
            <Link
              to="/suites"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:border-white hover:bg-white/10"
            >
              Explore Suites <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-16 grid max-w-2xl grid-cols-2 gap-6 border-t border-white/15 pt-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-2xl text-amber-400 sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-300 sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:py-28">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/14011664/pexels-photo-14011664.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200"
              alt="Hotel lobby"
              className="h-[420px] w-full rounded-2xl object-cover shadow-xl"
            />
            <div className="absolute -bottom-8 -right-6 hidden max-w-[220px] rounded-2xl bg-white p-5 shadow-xl sm:block">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="mt-2 text-sm text-slate-600">
                "The most memorable stay of our lives."
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">
              Our Story
            </p>
            <h2 className="mt-3 font-serif text-3xl text-slate-900 sm:text-4xl">
              A Legacy of Refined Hospitality
            </h2>
            <p className="mt-5 leading-relaxed text-slate-600">
              For nearly two decades, Lumiere Grande Hotel has stood as a beacon of sophistication
              in the heart of the city. Our passion lies in curating extraordinary experiences —
              from beautifully appointed rooms to world-class dining and wellness — ensuring every
              guest leaves with cherished memories.
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              Whether you're here for business, romance, or leisure, our dedicated team is
              devoted to crafting a stay that feels distinctly yours.
            </p>
            <Link
              to="/contact"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-600 transition hover:gap-3 hover:text-amber-700"
            >
              Get in Touch <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">
              Amenities
            </p>
            <h2 className="mt-3 font-serif text-3xl text-slate-900 sm:text-4xl">
              Everything You Need for a Perfect Stay
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:bg-amber-600 group-hover:text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-serif text-lg text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Suites */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:py-28">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">
              Accommodations
            </p>
            <h2 className="mt-3 font-serif text-3xl text-slate-900 sm:text-4xl">
              Featured Suites & Rooms
            </h2>
          </div>
          <Link
            to="/suites"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-600 transition hover:gap-3 hover:text-amber-700"
          >
            View All Rooms <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-900 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
              Testimonials
            </p>
            <h2 className="mt-3 font-serif text-3xl text-white sm:text-4xl">
              What Our Guests Say
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl bg-white/5 p-7 backdrop-blur">
                <Quote className="h-7 w-7 text-amber-400" />
                <p className="mt-4 text-sm leading-relaxed text-slate-200">{t.quote}</p>
                <div className="mt-6 flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="mt-3 font-serif text-white">{t.name}</p>
                <p className="text-xs text-slate-400">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative overflow-hidden bg-slate-950 py-20">
        <img
          src="https://images.pexels.com/photos/15925412/pexels-photo-15925412.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1600"
          alt="Hotel at night"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/40" />
        <div className="relative mx-auto max-w-4xl px-6 text-center sm:px-8">
          <h2 className="font-serif text-3xl text-white sm:text-4xl">
            Your Unforgettable Escape Awaits
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-200">
            Reserve your suite today and experience the pinnacle of modern luxury hospitality.
          </p>
          <button
            onClick={() => openBooking()}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-600 px-8 py-4 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-amber-600/30 transition hover:bg-amber-700"
          >
            Book Your Stay Now
          </button>
        </div>
      </section>
    </div>
  );
}
