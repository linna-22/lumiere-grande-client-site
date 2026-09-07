import { useEffect, useMemo, useState } from "react";
import { X, CalendarDays, Users, BedDouble, CheckCircle2 } from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { rooms } from "../data/rooms";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export default function BookingModal() {
  const { isOpen, presetRoomId, closeBooking } = useBooking();
  const [roomId, setRoomId] = useState(presetRoomId ?? rooms[0].id);
  const [checkIn, setCheckIn] = useState(todayISO());
  const [checkOut, setCheckOut] = useState(addDaysISO(2));
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRoomId(presetRoomId ?? rooms[0].id);
      setSubmitted(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, presetRoomId]);

  const selectedRoom = useMemo(() => rooms.find((r) => r.id === roomId), [roomId]);

  const nights = useMemo(() => {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diff = Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  const total = useMemo(() => {
    if (!selectedRoom) return 0;
    return selectedRoom.pricePerNight * nights;
  }, [selectedRoom, nights]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={closeBooking}
        aria-hidden="true"
      />
      <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-amber-100 bg-white/95 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
              Reserve Your Stay
            </p>
            <h3 className="font-serif text-xl text-slate-900">Book Now</h3>
          </div>
          <button
            onClick={closeBooking}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close booking form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h4 className="font-serif text-2xl text-slate-900">Request Received!</h4>
            <p className="max-w-sm text-slate-500">
              Thank you, {name || "guest"}. Your request to book the{" "}
              <span className="font-medium text-slate-700">{selectedRoom?.name}</span> has
              been received. Our reservations team will confirm your stay by email shortly.
            </p>
            <button
              onClick={closeBooking}
              className="mt-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-amber-600"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                <BedDouble className="mr-1.5 inline h-4 w-4 text-amber-600" />
                Select Room
              </label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
              >
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} — ${room.pricePerNight}/night
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  <CalendarDays className="mr-1.5 inline h-4 w-4 text-amber-600" />
                  Check-in
                </label>
                <input
                  type="date"
                  required
                  min={todayISO()}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  <CalendarDays className="mr-1.5 inline h-4 w-4 text-amber-600" />
                  Check-out
                </label>
                <input
                  type="date"
                  required
                  min={checkIn}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                <Users className="mr-1.5 inline h-4 w-4 text-amber-600" />
                Guests
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                required
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 text-sm">
              <span className="text-slate-600">
                {nights > 0 ? `${nights} night${nights > 1 ? "s" : ""}` : "Select valid dates"}
              </span>
              <span className="font-serif text-lg font-semibold text-slate-900">
                ${total.toLocaleString()}
              </span>
            </div>

            <button
              type="submit"
              disabled={nights <= 0}
              className="w-full rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Confirm Reservation Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
