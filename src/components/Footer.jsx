import { Link } from "react-router-dom";
import { Gem, MapPin, Phone, Mail } from "lucide-react";

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 22v-8.5H16l.5-3.5h-3V7.7c0-1 .3-1.7 1.7-1.7H16.6V2.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V13h2.6v9h3.4Z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 3H21l-6.6 7.6L22 21h-6.3l-4.9-6.4L5.2 21H3l7.1-8.1L2.9 3h6.4l4.4 5.8L18.9 3Zm-1.1 16.1h1.2L7.3 4.8H6l11.8 14.3Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="mb-4 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/40 text-amber-500">
              <Gem className="h-5 w-5" />
            </span>
            <span className="font-serif text-xl text-white">Lumiere Grande</span>
          </Link>
          <p className="text-sm leading-relaxed text-slate-400">
            An address of distinction where timeless elegance meets modern comfort. Experience
            hospitality reimagined in the heart of the city.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {[FacebookIcon, InstagramIcon, TwitterIcon].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-400 transition hover:border-amber-500 hover:text-amber-500"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-base text-white">Explore</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/" className="text-slate-400 transition hover:text-amber-500">
                Home
              </Link>
            </li>
            <li>
              <Link to="/suites" className="text-slate-400 transition hover:text-amber-500">
                Suites &amp; Rooms
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-slate-400 transition hover:text-amber-500">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-base text-white">Guest Services</h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li>24/7 Concierge</li>
            <li>Valet &amp; Parking</li>
            <li>Spa &amp; Wellness</li>
            <li>Fine Dining</li>
            <li>Event &amp; Meeting Spaces</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-base text-white">Contact</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span>128 Grande Avenue, Marina District, Metropolis, 10001</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span>+1 (212) 555-0198</span>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span>reservations@lumieregrande.com</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Lumiere Grande Hotel. All rights reserved.
      </div>
    </footer>
  );
}
