import { useEffect, useState } from "react";
import {
  BedDouble,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Hotel,
  LoaderCircle,
  WalletCards,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { fetchReservations } from "../api/reservations";
import { useAuth } from "../context/AuthContext";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatMoney(value) {
  const amount = Number(value ?? 0);
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatStatus(value) {
  if (!value) return "Unknown";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status) {
  switch (status) {
    case "confirmed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/10";
    case "pending":
      return "bg-amber-50 text-amber-700 ring-amber-600/10";
    case "checked_in":
      return "bg-blue-50 text-blue-700 ring-blue-600/10";
    case "checked_out":
      return "bg-slate-100 text-slate-600 ring-slate-500/10";
    case "cancelled":
      return "bg-rose-50 text-rose-700 ring-rose-600/10";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-500/10";
  }
}

function getRooms(reservation) {
  return reservation?.reservationRooms ?? reservation?.reservation_rooms ?? [];
}

function getRoomTypeName(item) {
  const roomType = item?.roomType ?? item?.room_type;

  if (typeof roomType === "string") return roomType;
  return roomType?.name ?? item?.room_type_name ?? "Room";
}

function getRoomNumber(item) {
  const room = item?.room;

  if (typeof room === "string") return room;
  return room?.room_number ?? item?.room_number ?? null;
}

function getPaymentLabel(reservation) {
  const payments = reservation?.payments ?? [];

  if (payments.length > 0) {
    const latest = payments[payments.length - 1];
    return latest?.status
      ? formatStatus(latest.status)
      : "Payment recorded";
  }

  if (reservation?.payment_status) {
    return formatStatus(reservation.payment_status);
  }

  if (reservation?.payment_method) {
    return formatStatus(reservation.payment_method);
  }

  return "Not paid yet";
}

function getReservationId(reservation) {
  return reservation?.reservation_id ?? reservation?.id;
}

export default function MyBookings() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/login", {
        replace: true,
        state: { from: "/my-bookings" },
      });
      return;
    }

    let ignore = false;

    async function loadBookings() {
      try {
        setLoading(true);

        // Do NOT send the customer's email as the `search` parameter.
        // The current Laravel search query uses a `name` column on `guests`,
        // but that column does not exist in the database. Loading without
        // `search` avoids that SQL error, then we filter the returned rows
        // on the frontend.
        const response = await fetchReservations({
          per_page: 100,
        });

        const rows = response?.data?.data ?? response?.data ?? [];
        const list = Array.isArray(rows) ? rows : [];

        const email = String(user?.email ?? "").trim().toLowerCase();

        const mine = list.filter((reservation) => {
          const guestEmail = String(
            reservation?.guest?.email ??
              reservation?.guest_details?.email ??
              reservation?.email ??
              "",
          )
            .trim()
            .toLowerCase();

          // Only show reservations when we can confirm they belong
          // to the logged-in customer.
          return email !== "" && guestEmail === email;
        });

        mine.sort((a, b) => {
          const first = new Date(a?.created_at ?? 0).getTime();
          const second = new Date(b?.created_at ?? 0).getTime();
          return second - first;
        });

        if (!ignore) {
          setBookings(mine);
        }
      } catch (err) {
        console.error("Failed to load customer bookings:", err);

        if (!ignore) {
          // Keep the customer page friendly even when the reservations endpoint
          // has a backend/search mismatch or returns an unexpected response.
          setBookings([]);
          }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      ignore = true;
    };
  }, [authLoading, isAuthenticated, navigate, user?.email]);

  if (authLoading || (loading && !isAuthenticated)) {
    return (
      <main className="min-h-screen bg-[#f8f7f4] px-4 pb-20 pt-32 sm:px-6">
        <div className="flex justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-4 pb-20 pt-28 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600">
            My Account
          </p>

          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-serif text-4xl text-slate-900 sm:text-5xl">
                My Bookings
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                View your reservations, stay dates, rooms, payment information,
                and booking status in one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/suites")}
              className="w-fit rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
            >
              Book Another Stay
            </button>
          </div>
        </div>

        {/* Empty */}
        {!loading && bookings.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <CalendarDays className="h-7 w-7" />
            </div>

            <h2 className="mt-5 font-serif text-2xl text-slate-900">
              No bookings yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Once you complete a reservation, your booking details will appear
              here.
            </p>

            <button
              type="button"
              onClick={() => navigate("/suites")}
              className="mt-6 rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              Explore Suites
            </button>
          </div>
        )}

        {/* Bookings */}
        <div className="space-y-5">
          {bookings.map((booking) => {
            const reservationId = getReservationId(booking);
            const rooms = getRooms(booking);
            const expanded = String(expandedId) === String(reservationId);
            const total = booking?.total_amount ?? booking?.invoice?.total_amount;
            const guest = booking?.guest;

            return (
              <article
                key={reservationId ?? booking?.reservation_code}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Booking header */}
                <div className="flex flex-col gap-5 bg-slate-900 px-6 py-6 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Reservation Code
                    </p>
                    <p className="mt-2 font-mono text-xl font-bold tracking-wider text-amber-400">
                      {booking?.reservation_code ?? "-"}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ${statusClass(
                      booking?.status,
                    )}`}
                  >
                    {formatStatus(booking?.status)}
                  </span>
                </div>

                {/* Main information */}
                <div className="p-6 sm:p-8">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex gap-3">
                      <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Check In
                        </p>
                        <p className="mt-1 font-medium text-slate-800">
                          {formatDate(booking?.check_in_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Check Out
                        </p>
                        <p className="mt-1 font-medium text-slate-800">
                          {formatDate(booking?.check_out_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <BedDouble className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Rooms
                        </p>
                        <p className="mt-1 font-medium text-slate-800">
                          {rooms.length} {rooms.length === 1 ? "Room" : "Rooms"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <WalletCards className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Total
                        </p>
                        <p className="mt-1 font-semibold text-amber-700">
                          {formatMoney(total)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick room summary */}
                  {rooms.length > 0 && (
                    <div className="mt-7 rounded-2xl bg-slate-50 p-5">
                      <div className="flex items-center gap-2">
                        <Hotel className="h-4 w-4 text-amber-600" />
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                          Reserved Rooms
                        </p>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {rooms.map((item, index) => (
                          <div
                            key={item?.id ?? `${reservationId}-room-${index}`}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                          >
                            <p className="font-medium text-slate-800">
                              {getRoomTypeName(item)}
                            </p>
                            {getRoomNumber(item) && (
                              <p className="mt-1 text-xs text-slate-500">
                                Room {getRoomNumber(item)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expand */}
                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(expanded ? null : reservationId)
                      }
                      className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 transition hover:text-amber-700"
                    >
                      {expanded ? "Hide Booking Details" : "View Booking Details"}
                      {expanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {expanded && (
                    <div className="mt-5 grid gap-5 border-t border-slate-100 pt-5 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                          Guest Information
                        </p>

                        <div className="mt-4 space-y-3 text-sm">
                          <div>
                            <p className="text-xs text-slate-400">Name</p>
                            <p className="mt-1 font-medium text-slate-800">
                              {guest?.name ??
                                (`${guest?.first_name ?? ""} ${guest?.last_name ?? ""}`.trim() || "-")}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">Email</p>
                            <p className="mt-1 font-medium text-slate-800">
                              {guest?.email ?? user?.email ?? "-"}
                            </p>
                          </div>

                          {guest?.phone && (
                            <div>
                              <p className="text-xs text-slate-400">Phone</p>
                              <p className="mt-1 font-medium text-slate-800">
                                {guest.phone}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                          Payment Information
                        </p>

                        <div className="mt-4 space-y-3 text-sm">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-500">Total</span>
                            <span className="font-semibold text-slate-800">
                              {formatMoney(total)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-500">Payment</span>
                            <span className="font-medium text-slate-800">
                              {getPaymentLabel(booking)}
                            </span>
                          </div>

                          {booking?.payment_option && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-500">Payment Option</span>
                              <span className="font-medium capitalize text-slate-800">
                                {String(booking.payment_option).replaceAll("_", " ")}
                              </span>
                            </div>
                          )}

                          {booking?.adults != null && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-500">Guests</span>
                              <span className="font-medium text-slate-800">
                                {booking.adults} adult{Number(booking.adults) === 1 ? "" : "s"}
                                {booking.children
                                  ? `, ${booking.children} child${Number(booking.children) === 1 ? "" : "ren"}`
                                  : ""}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center py-10">
            <LoaderCircle className="h-7 w-7 animate-spin text-amber-600" />
          </div>
        )}
      </div>
    </main>
  );
}
