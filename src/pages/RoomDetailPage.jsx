import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, CheckCircle2 } from "lucide-react";
import { useRoomDetail } from "../hooks/useRoomDetail";
import { useRoomsData } from "../hooks/useRoomsData";
import { useBooking } from "../context/BookingContext";
import RoomCard from "../components/RoomCard";

export default function RoomDetailPage() {
  const { id } = useParams();
  const { room, isLoading, error } = useRoomDetail(id);
  const { rooms: allRooms } = useRoomsData();
  const { openBooking } = useBooking();
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setActiveImage(0);
  }, [id]);

  if (isLoading) {
    return <div className="pt-24 pb-20 text-center text-slate-500">Loading room…</div>;
  }

  if (error) {
    return (
      <div className="pt-24 pb-20 text-center text-red-500">
        Couldn't load this room right now. Please try again later.
      </div>
    );
  }

  if (!room) {
    return <Navigate to="/suites" replace />;
  }

  const otherRooms = allRooms.filter((r) => r.id !== room.id).slice(0, 3);

  return (
    <div className="pt-24">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-6 pt-8 sm:px-8">
        <Link
          to="/suites"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-amber-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Suites &amp; Rooms
        </Link>
      </div>

      {/* Gallery */}
      <section className="mx-auto max-w-7xl px-6 pt-6 sm:px-8">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr]">
          <div className="h-72 overflow-hidden rounded-2xl sm:h-[420px]">
            <img
              src={room.gallery[activeImage]}
              alt={room.name}
              className="h-full w-full object-cover transition duration-500"
            />
          </div>
          {room.gallery.length > 1 && (
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
              {room.gallery.map((img, idx) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(idx)}
                  className={`h-24 overflow-hidden rounded-xl border-2 transition sm:h-[132px] ${
                    activeImage === idx ? "border-amber-500" : "border-transparent"
                  }`}
                >
                  <img src={img} alt={`${room.name} ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl gap-12 px-6 py-14 sm:px-8 lg:grid lg:grid-cols-3">
        <div className="lg:col-span-2">
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
            {room.type}
          </span>

          <h1 className="mt-4 font-serif text-3xl text-slate-900 sm:text-4xl">{room.name}</h1>

          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4 border-y border-slate-100 py-6 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-600" /> Up to {room.maxOccupancy} Guests
            </span>
          </div>

          <h2 className="mt-8 font-serif text-xl text-slate-900">About This Room</h2>
          <p className="mt-3 leading-relaxed text-slate-600">{room.description}</p>

          {room.facilities.length > 0 && (
            <>
              <h2 className="mt-10 font-serif text-xl text-slate-900">Room Facilities</h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {room.facilities.map((facility) => (
                  <div key={facility.id} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-600" />
                    {facility.name}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Booking sidebar */}
        <aside className="mt-10 lg:mt-0">
          <div className="sticky top-28 rounded-2xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/50">
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-3xl font-semibold text-slate-900">
                ${room.pricePerNight}
              </span>
              <span className="text-sm text-slate-500">/ night</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">Taxes and fees calculated at checkout</p>

            <ul className="mt-6 space-y-3 border-y border-slate-100 py-5 text-sm text-slate-600">
              <li className="flex justify-between">
                <span>Room Type</span>
                <span className="font-medium text-slate-800">{room.type}</span>
              </li>
              <li className="flex justify-between">
                <span>Max Occupancy</span>
                <span className="font-medium text-slate-800">{room.maxOccupancy} Guests</span>
              </li>
            </ul>

            <button
              onClick={() => openBooking(room.id)}
              className="mt-6 w-full rounded-full bg-amber-600 py-3.5 text-sm font-semibold uppercase tracking-wide text-white shadow-sm shadow-amber-600/30 transition hover:bg-amber-700"
            >
              Book Now
            </button>
            <p className="mt-3 text-center text-xs text-slate-400">
              Free cancellation available up to 48 hours before check-in
            </p>
          </div>
        </aside>
      </section>

      {/* Other rooms */}
      {otherRooms.length > 0 && (
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <h2 className="font-serif text-2xl text-slate-900 sm:text-3xl">You May Also Like</h2>
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {otherRooms.map((r) => (
                <RoomCard key={r.id} room={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}