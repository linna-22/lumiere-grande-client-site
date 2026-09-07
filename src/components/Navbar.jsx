import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X, Gem } from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { cn } from "../utils/cn";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/suites", label: "Suites" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openBooking } = useBooking();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isTransparent = !scrolled && !mobileOpen && location.pathname === "/";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        isTransparent ? "bg-transparent py-5" : "bg-white/95 py-3 shadow-sm backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
        <NavLink to="/" className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border",
              isTransparent
                ? "border-white/40 text-white"
                : "border-amber-600/30 bg-amber-50 text-amber-700"
            )}
          >
            <Gem className="h-5 w-5" />
          </span>
          <span
            className={cn(
              "font-serif text-lg tracking-wide sm:text-xl",
              isTransparent ? "text-white" : "text-slate-900"
            )}
          >
            Lumiere Grande
          </span>
        </NavLink>

        <nav className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium uppercase tracking-wide transition-colors",
                  isTransparent
                    ? isActive
                      ? "text-amber-300"
                      : "text-white/90 hover:text-amber-300"
                    : isActive
                      ? "text-amber-600"
                      : "text-slate-700 hover:text-amber-600"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openBooking()}
            className="hidden rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-sm shadow-amber-600/30 transition hover:bg-amber-700 sm:inline-flex"
          >
            Book Now
          </button>
          <button
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full md:hidden",
              isTransparent ? "text-white" : "text-slate-800"
            )}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mt-3 space-y-1 border-t border-slate-100 bg-white px-5 py-4 shadow-lg md:hidden">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "block rounded-lg px-3 py-2.5 text-sm font-medium uppercase tracking-wide",
                  isActive ? "bg-amber-50 text-amber-600" : "text-slate-700 hover:bg-slate-50"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <button
            onClick={() => openBooking()}
            className="mt-2 w-full rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-amber-700"
          >
            Book Now
          </button>
        </div>
      )}
    </header>
  );
}
