import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Gem, User, LogOut, ChevronDown } from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../utils/cn";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/suites", label: "Suites" },
  { to: "/contact", label: "Contact" },
];

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { openBooking } = useBooking();
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setLoggingOut(false);
      setProfileMenuOpen(false);
      navigate("/");
    }
  }

  const isTransparent = !scrolled && !mobileOpen && location.pathname === "/";
  const textColor = isTransparent ? "text-white" : "text-slate-900";
  const mutedColor = isTransparent ? "text-white/90" : "text-slate-700";

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
          <span className={cn("font-serif text-lg tracking-wide sm:text-xl", textColor)}>
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

          {/* Auth section — desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  className={cn(
                    "flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors",
                    isTransparent ? "hover:bg-white/10" : "hover:bg-slate-100"
                  )}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-xs font-semibold text-white">
                    {getInitials(user?.name)}
                  </span>
                  <span className={cn("text-sm font-medium", textColor)}>
                    {user?.name}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      mutedColor,
                      "transition-transform",
                      profileMenuOpen ? "rotate-180" : ""
                    )}
                  />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-100 bg-white py-1.5 shadow-lg overflow-hidden z-30">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User size={15} />
                      View Profile
                    </button>
                    <div className="h-px bg-slate-100 my-1" />
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-60"
                    >
                      <LogOut size={15} />
                      {loggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={cn(
                    "text-sm font-medium uppercase tracking-wide transition-colors",
                    isTransparent ? "text-white/90 hover:text-amber-300" : "text-slate-700 hover:text-amber-600"
                  )}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-full border border-amber-600/40 px-4 py-2 text-sm font-medium uppercase tracking-wide text-amber-600 transition hover:bg-amber-50"
                >
                  Register
                </NavLink>
              </>
            )}
          </div>

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
         
          {/* Auth section — mobile */}
          <div className="mt-3 border-t border-slate-100 pt-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-xs font-semibold text-white">
                    {getInitials(user?.name)}
                  </span>
                  <span className="text-sm font-medium text-slate-900">{user?.name}</span>
                </div>
                <NavLink
                  to="/profile"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium uppercase tracking-wide text-slate-700 hover:bg-slate-50"
                >
                  View Profile
                </NavLink>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium uppercase tracking-wide text-rose-500 hover:bg-rose-50 disabled:opacity-60"
                >
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium uppercase tracking-wide text-slate-700 hover:bg-slate-50"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium uppercase tracking-wide text-amber-600 hover:bg-amber-50"
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}