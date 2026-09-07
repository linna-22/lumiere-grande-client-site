import { Link } from "react-router-dom";
import { Users, Maximize, Star, ArrowRight } from "lucide-react";
import { useBooking } from "../context/BookingContext";

export default function RoomCard({ room }) {
  const { openBooking } = useBooking();

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-64 overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-800 backdrop-blur">
          {room.type}
        </span>
        <span className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-amber-300 backdrop-blur">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {room.rating.toFixed(1)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-xl text-slate-900">{room.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {room.shortDescription}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <Maximize className="h-4 w-4 text-amber-600" />
            {room.size} m²
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-amber-600" />
            {room.capacity} Guests
          </span>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
          <div>
            <span className="font-serif text-2xl font-semibold text-slate-900">
              ${room.pricePerNight}
            </span>
            <span className="text-sm text-slate-500"> / night</span>
          </div>
          <Link
            to={`/suites/${room.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 transition hover:gap-2.5 hover:text-amber-700"
          >
            View Detail <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          onClick={() => openBooking(room.id)}
          className="mt-4 w-full rounded-full border border-slate-900 py-2.5 text-sm font-semibold uppercase tracking-wide text-slate-900 transition hover:bg-slate-900 hover:text-white"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
