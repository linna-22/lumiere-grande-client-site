import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
import { usePublicHotelSettings } from "../context/PublicHotelSettingsContext";

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V4.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V11H8v3h2.4v8h3.1Z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="17.2"
        cy="6.8"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M18.9 3H21l-6.6 7.6L22 21h-6.3l-4.9-6.4L5.2 21H3l7.1-8.1L2.9 3h6.4l4.4 5.8L18.9 3Zm-1.1 16.1h1.2L7.3 4.8H6l11.8 14.3Z" />
    </svg>
  );
}

export default function Footer() {
  const {
    settings: hotelSettings,
  } = usePublicHotelSettings();

  const hotelName =
    hotelSettings?.hotel_name ||
    "Lumiere Grande Hotel";

  const hotelLogo =
    hotelSettings?.hotel_logo_url || "";

  const hotelAddress =
    hotelSettings?.hotel_address ||
    "Phnom Penh, Cambodia";

  const hotelPhone =
    hotelSettings?.hotel_phone || "";

  const hotelEmail =
    hotelSettings?.hotel_email || "";

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link
            to="/"
            className="mb-4 flex items-center gap-2 min-w-0"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-amber-500/40 text-amber-500">
              {hotelLogo ? (
                <img
                  src={hotelLogo}
                  alt={hotelName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-serif text-lg font-semibold">
                  {hotelName
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}
            </span>

            <span
              className="truncate font-serif text-xl text-white"
              title={hotelName}
            >
              {hotelName}
            </span>
          </Link>

          <p className="text-sm leading-relaxed text-slate-400">
            An address of distinction where timeless
            elegance meets modern comfort. Experience
            hospitality reimagined in the heart of the
            city.
          </p>

          <div className="mt-5 flex items-center gap-3">
            {[
              FacebookIcon,
              InstagramIcon,
              TwitterIcon,
            ].map((Icon, i) => (
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
          <h4 className="mb-4 font-serif text-base text-white">
            Explore
          </h4>

          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                to="/"
                className="text-slate-400 transition hover:text-amber-500"
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                to="/suites"
                className="text-slate-400 transition hover:text-amber-500"
              >
                Suites &amp; Rooms
              </Link>
            </li>

            <li>
              <Link
                to="/contact"
                className="text-slate-400 transition hover:text-amber-500"
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-base text-white">
            Guest Services
          </h4>

          <ul className="space-y-2.5 text-sm text-slate-400">
            <li>24/7 Concierge</li>
            <li>Valet &amp; Parking</li>
            <li>Spa &amp; Wellness</li>
            <li>Fine Dining</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-base text-white">
            Contact
          </h4>

          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span>{hotelAddress}</span>
            </li>

            {hotelPhone && (
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <span>{hotelPhone}</span>
              </li>
            )}

            {hotelEmail && (
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <span>{hotelEmail}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()}{" "}
        {hotelName}. All rights reserved.
      </div>
    </footer>
  );
}
