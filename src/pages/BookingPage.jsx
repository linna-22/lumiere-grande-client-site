import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  BedDouble,
  CalendarDays,
  Check,
  CheckCircle2,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  ShieldCheck,
  User,
  Users,
  WalletCards,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useBooking } from "../context/BookingContext";
import { fetchAllRooms, fetchRoomTypes } from "../api/rooms";
import { createReservation } from "../api/reservations";
import { generateKhqr } from "../api/payments";
import KhqrPaymentModal from "../components/KhqrPaymentModal";

/* =========================================================
   DATE HELPERS
========================================================= */

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/* =========================================================
   MAIN BOOKING PAGE
========================================================= */

export default function BookingPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    bookingData,
    updateBooking,
    updateGuestDetails,
    setBookingField,
    bookingResult,
    setBookingResult,
    isSubmitting,
    setIsSubmitting,
    error,
    setError,
    resetBooking,
  } = useBooking();

  const [step, setStep] = useState(1);

  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Reservation created on the server (reused if the guest closes the QR and retries)
  const [createdReservation, setCreatedReservation] = useState(null);

  // Response from POST /payments/khqr/generate (drives the QR modal)
  const [khqrPayment, setKhqrPayment] = useState(null);

  /* =======================================================
     ROOM TYPE ID
  ======================================================= */

  const roomTypeId = id;

  /* =======================================================
     LOAD ROOMS
  ======================================================= */

  useEffect(() => {
    let ignore = false;

    async function loadRooms() {
      try {
        setLoadingRooms(true);
        setError(null);

        const [types, roomsData] = await Promise.all([
          fetchRoomTypes(),
          fetchAllRooms(),
        ]);

        if (ignore) return;

        setRoomTypes(types ?? []);
        setRooms(roomsData?.rooms ?? []);
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load booking rooms:", err);

          setError(err?.message || "Unable to load room information.");
        }
      } finally {
        if (!ignore) {
          setLoadingRooms(false);
        }
      }
    }

    loadRooms();

    return () => {
      ignore = true;
    };
  }, []);

  /* =======================================================
     INITIALIZE BOOKING
  ======================================================= */

  useEffect(() => {
    if (!bookingData.check_in_date) {
      updateBooking({
        check_in_date: todayISO(),
        check_out_date: addDaysISO(2),
      });
    }

    if (!bookingData.adults) {
      setBookingField("adults", 1);
    }
  }, []);

  /* =======================================================
     SELECTED ROOM TYPE
  ======================================================= */

  const selectedRoomType = useMemo(() => {
    if (!roomTypeId) return null;

    return roomTypes.find((type) => String(type.id) === String(roomTypeId));
  }, [roomTypes, roomTypeId]);

  /* =======================================================
     AVAILABLE ROOMS
  ======================================================= */

  const availableRooms = useMemo(() => {
    if (!roomTypeId) return [];

    return rooms.filter(
      (room) =>
        String(room.room_type_id) === String(roomTypeId) &&
        room.status === "available",
    );
  }, [rooms, roomTypeId]);

  /* =======================================================
     NIGHTLY RATE
  ======================================================= */

  const nightlyRate = Number(selectedRoomType?.base_price ?? 0);

  /* =======================================================
     NIGHTS
  ======================================================= */

  const nights = useMemo(() => {
    if (!bookingData.check_in_date || !bookingData.check_out_date) {
      return 0;
    }

    const inDate = new Date(bookingData.check_in_date);
    const outDate = new Date(bookingData.check_out_date);

    const diff = Math.round(
      (outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return diff > 0 ? diff : 0;
  }, [bookingData.check_in_date, bookingData.check_out_date]);

  /* =======================================================
     PRICE CALCULATION
  ======================================================= */

  const subtotal = nightlyRate * nights;

  const tax = Number(bookingData.tax ?? 0);

  const discount = Number(bookingData.discount ?? 0);

  const total = Math.max(0, subtotal + tax - discount);

  const paidAmount =
    bookingData.payment_option === "deposit" ? total * 0.5 : total;

  const remainingBalance = total - paidAmount;

  /* =======================================================
     AUTO SELECT FIRST AVAILABLE ROOM
  ======================================================= */

  useEffect(() => {
    if (availableRooms.length > 0 && bookingData.rooms.length === 0) {
      const firstRoom = availableRooms[0];

      updateBooking({
        rooms: [
          {
            room_type_id: Number(roomTypeId),
            room_id: firstRoom.id,
            nightly_rate: nightlyRate,
          },
        ],
      });
    }
  }, [availableRooms, roomTypeId, bookingData.rooms.length, nightlyRate]);

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateStep = () => {
    setError(null);

    /* Guest */
    if (step === 1) {
      const guest = bookingData.guest_details;

      if (
        !guest.first_name?.trim() ||
        !guest.last_name?.trim() ||
        !guest.email?.trim() ||
        !guest.phone?.trim()
      ) {
        setError("Please complete all required guest information.");

        return false;
      }
    }

    /* Stay */
    if (step === 2) {
      if (nights <= 0) {
        setError("Please select a valid check-in and check-out date.");

        return false;
      }

      if (Number(bookingData.adults) < 1) {
        setError("At least one adult is required.");

        return false;
      }
    }

    /* Room */
    if (step === 3) {
      if (!bookingData.rooms || bookingData.rooms.length === 0) {
        setError("Please select a room.");

        return false;
      }
    }

    /* Payment */
    if (step === 4) {
      if (!bookingData.payment_option) {
        setError("Please select a payment option.");

        return false;
      }

      if (!bookingData.payment_method) {
        setError("Please select a payment method.");

        return false;
      }
    }

    return true;
  };

  /* =======================================================
     NEXT
  ======================================================= */

  const nextStep = () => {
    if (!validateStep()) return;

    setStep((current) => Math.min(4, current + 1));
  };

  /* =======================================================
     PREVIOUS
  ======================================================= */

  const previousStep = () => {
    setError(null);

    setStep((current) => Math.max(1, current - 1));
  };

  /* =======================================================
     SUBMIT RESERVATION + KHQR
  ======================================================= */

  // Amount is based on the server's total so it matches the invoice.
  const getAmountToPay = (serverTotal) =>
    Number(
      (bookingData.payment_option === "deposit"
        ? serverTotal * 0.5
        : serverTotal
      ).toFixed(2),
    );

  const finishBooking = (reservation, paid) => {
    const serverTotal = Number(reservation.total_amount ?? total);
    const paidNow = paid ? getAmountToPay(serverTotal) : 0;

    setBookingResult({
      ...reservation,
      payment_method: bookingData.payment_method,
      paid_amount: paidNow,
      remaining_balance: Math.max(0, serverTotal - paidNow),
    });

    setStep(5);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!validateStep()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      /* 1. Create the reservation once. Reuse it on retry. */
      let reservation = createdReservation;

      if (!reservation) {
        /*
         * IMPORTANT:
         * Keep this payload exactly compatible
         * with the working backend.
         */
        const payload = {
          guest_id: bookingData.guest_id ?? null,

          guest_details: {
            first_name: bookingData.guest_details.first_name,

            last_name: bookingData.guest_details.last_name,

            email: bookingData.guest_details.email,

            phone: bookingData.guest_details.phone,

            id_type: bookingData.guest_details.id_type,

            id_number: bookingData.guest_details.id_number,

            nationality: bookingData.guest_details.nationality,
          },

          check_in_date: bookingData.check_in_date,

          check_out_date: bookingData.check_out_date,

          adults: Number(bookingData.adults),

          children: Number(bookingData.children ?? 0),

          rooms: bookingData.rooms,

          tax: Number(bookingData.tax ?? 0),

          discount: Number(bookingData.discount ?? 0),

          payment_option: bookingData.payment_option,

          payment_method: bookingData.payment_method,
        };

        console.log("Creating reservation:", payload);

        const response = await createReservation(payload);

        console.log("Reservation response:", response);

        reservation = response?.data ?? null;

        if (!reservation) {
          throw new Error(
            "Reservation was created but no details were returned.",
          );
        }

        setCreatedReservation(reservation);
      }

      /* 2a. Bakong KHQR: generate the QR and show it to the guest */
      if (bookingData.payment_method === "bakong_khqr") {
        const reservationId = reservation.reservation_id ?? reservation.id;
        const invoiceId = reservation.invoice_id ?? reservation.invoice?.id;

        if (!reservationId || !invoiceId) {
          throw new Error(
            "Reservation response is missing reservation_id or invoice_id.",
          );
        }

        const qr = await generateKhqr({
          reservationId,
          invoiceId,
          amount: getAmountToPay(Number(reservation.total_amount ?? total)),
          currency: "USD",
        });

        if (!qr?.payment_id || !qr?.qr_code) {
          throw new Error("Invalid KHQR response from the server.");
        }

        setKhqrPayment(qr);

        return;
      }

      /* 2b. Pay at hotel: nothing to charge online */
      finishBooking(reservation, false);
    } catch (err) {
      console.error("Booking failed:", err);

      setError(
        err?.message || "Unable to complete your booking. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKhqrPaid = () => {
    setKhqrPayment(null);

    finishBooking(createdReservation, true);
  };

  const handleKhqrExpired = () => {
    setKhqrPayment(null);

    setError(
      "The QR code expired. Select Pay with KHQR to generate a new one.",
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loadingRooms) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center px-6 pt-20">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
              <Loader2 className="h-7 w-7 animate-spin text-amber-600" />
            </div>

            <h2 className="mt-5 font-serif text-2xl text-slate-900">
              Preparing your reservation
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Loading room availability...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     ROOM NOT FOUND
  ======================================================= */

  if (!selectedRoomType) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-28">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
            <BedDouble className="h-9 w-9 text-amber-600" />
          </div>

          <h1 className="mt-6 font-serif text-3xl text-slate-900">
            Room not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            We couldn't find this room type. Please return to our suites and
            choose another room.
          </p>

          <button
            type="button"
            onClick={() => navigate("/suites")}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Suites
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     SUCCESS PAGE
  ======================================================= */

  if (step === 5 && bookingResult) {
    return (
      <SuccessPage
        bookingResult={bookingResult}
        bookingData={bookingData}
        selectedRoomType={selectedRoomType}
        nights={nights}
        total={total}
        paidAmount={paidAmount}
        remainingBalance={remainingBalance}
        resetBooking={resetBooking}
        navigate={navigate}
      />
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f8f7f4] px-4 pb-20 pt-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-amber-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Secure reservation
          </div>
        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-9">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600">
            Reserve Your Stay
          </p>

          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-serif text-3xl leading-tight text-slate-900 sm:text-5xl">
                Complete Your Reservation
              </h1>

              <p className="mt-3 text-sm text-slate-500">
                You're booking{" "}
                <span className="font-semibold text-slate-700">
                  {selectedRoomType.name}
                </span>
              </p>
            </div>

            <div className="rounded-full bg-white px-4 py-2 text-sm shadow-sm ring-1 ring-slate-200">
              <span className="text-slate-400">From</span>{" "}
              <span className="font-semibold text-slate-900">
                ${nightlyRate.toLocaleString()}
              </span>{" "}
              <span className="text-slate-400">/ night</span>
            </div>
          </div>
        </div>

        {/* =================================================
            STEP INDICATOR
        ================================================= */}

        <BookingSteps step={step} />

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 shadow-sm">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
              !
            </div>

            <div>
              <p className="font-semibold">Unable to continue</p>

              <p className="mt-0.5">
                {typeof error === "string"
                  ? error
                  : error?.message || "Something went wrong."}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="w-full">
          <div>
            {/* =================================================
                STEP 1 — GUEST
            ================================================= */}

            {step === 1 && (
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <SectionHeader
                  icon={User}
                  eyebrow="Step 1"
                  title="Guest Information"
                  description="Tell us who will be staying at the hotel."
                />

                <div className="p-6 sm:p-8">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      label="First Name"
                      required
                      value={bookingData.guest_details.first_name}
                      placeholder="Enter first name"
                      onChange={(value) =>
                        updateGuestDetails({
                          first_name: value,
                        })
                      }
                    />

                    <Input
                      label="Last Name"
                      required
                      value={bookingData.guest_details.last_name}
                      placeholder="Enter last name"
                      onChange={(value) =>
                        updateGuestDetails({
                          last_name: value,
                        })
                      }
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      required
                      value={bookingData.guest_details.email}
                      placeholder="you@example.com"
                      onChange={(value) =>
                        updateGuestDetails({
                          email: value,
                        })
                      }
                    />

                    <Input
                      label="Phone Number"
                      type="tel"
                      required
                      value={bookingData.guest_details.phone}
                      placeholder="+855 ..."
                      onChange={(value) =>
                        updateGuestDetails({
                          phone: value,
                        })
                      }
                    />

                    <SelectInput
                      label="ID Type"
                      value={bookingData.guest_details.id_type}
                      onChange={(value) =>
                        updateGuestDetails({
                          id_type: value,
                        })
                      }
                      options={[
                        {
                          value: "identitycard",
                          label: "Identity Card",
                        },
                        {
                          value: "passport",
                          label: "Passport",
                        },
                        {
                          value: "driver_license",
                          label: "Driver's License",
                        },
                      ]}
                    />

                    <Input
                      label="ID Number"
                      value={bookingData.guest_details.id_number}
                      placeholder="Enter identification number"
                      onChange={(value) =>
                        updateGuestDetails({
                          id_number: value,
                        })
                      }
                    />

                    <Input
                      label="Nationality"
                      value={bookingData.guest_details.nationality}
                      placeholder="Enter nationality"
                      onChange={(value) =>
                        updateGuestDetails({
                          nationality: value,
                        })
                      }
                    />
                  </div>

                  <InfoBox
                    icon={ShieldCheck}
                    title="Your information is secure"
                    text="Your guest information is used only to process and manage your reservation."
                  />
                </div>
              </section>
            )}

            {/* =================================================
                STEP 2 — STAY
            ================================================= */}

            {step === 2 && (
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <SectionHeader
                  icon={CalendarDays}
                  eyebrow="Step 2"
                  title="Your Stay"
                  description="Choose when you'd like to stay with us."
                />

                <div className="p-6 sm:p-8">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <DateInput
                      label="Check-in"
                      value={bookingData.check_in_date}
                      min={todayISO()}
                      onChange={(value) =>
                        setBookingField("check_in_date", value)
                      }
                    />

                    <DateInput
                      label="Check-out"
                      value={bookingData.check_out_date}
                      min={bookingData.check_in_date || todayISO()}
                      onChange={(value) =>
                        setBookingField("check_out_date", value)
                      }
                    />
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <NumberInput
                      label="Adults"
                      value={bookingData.adults}
                      min="1"
                      onChange={(value) =>
                        setBookingField("adults", Number(value))
                      }
                    />

                    <NumberInput
                      label="Children"
                      value={bookingData.children}
                      min="0"
                      onChange={(value) =>
                        setBookingField("children", Number(value))
                      }
                    />
                  </div>

                  {/* Stay preview */}

                  <div className="mt-7 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
                          Your stay
                        </p>

                        <p className="mt-2 font-serif text-2xl">
                          {nights > 0
                            ? `${nights} night${nights !== 1 ? "s" : ""}`
                            : "Select your dates"}
                        </p>

                        <p className="mt-1 text-sm text-slate-300">
                          {bookingData.adults} adult
                          {Number(bookingData.adults) !== 1 ? "s" : ""}
                          {Number(bookingData.children) > 0 &&
                            ` · ${bookingData.children} child${
                              Number(bookingData.children) !== 1 ? "ren" : ""
                            }`}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-xs text-slate-400">
                          Estimated room charge
                        </p>

                        <p className="mt-1 font-serif text-3xl font-bold text-amber-400">
                          ${subtotal.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
                STEP 3 — ROOM
            ================================================= */}

            {step === 3 && (
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <SectionHeader
                  icon={BedDouble}
                  eyebrow="Step 3"
                  title="Choose Your Room"
                  description="Select an available room for your stay."
                />

                <div className="p-6 sm:p-8">
                  {/* Room type */}

                  <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 ring-1 ring-amber-100">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                          Selected Room Type
                        </p>

                        <h3 className="mt-2 font-serif text-2xl text-slate-900">
                          {selectedRoomType.name}
                        </h3>

                        {selectedRoomType.description && (
                          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                            {selectedRoomType.description}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 rounded-2xl bg-white px-5 py-4 text-center shadow-sm">
                        <p className="text-xs text-slate-400">Per night</p>

                        <p className="mt-1 font-serif text-2xl font-bold text-slate-900">
                          ${nightlyRate.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Available Rooms
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {availableRooms.length} room
                        {availableRooms.length !== 1 ? "s" : ""} available
                      </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Available
                    </div>
                  </div>

                  {availableRooms.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                      <BedDouble className="mx-auto h-10 w-10 text-slate-300" />

                      <p className="mt-4 font-semibold text-slate-700">
                        No rooms available
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        There are currently no available rooms for this room
                        type.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {availableRooms.map((room) => {
                        const selected = bookingData.rooms.some(
                          (item) => Number(item.room_id) === Number(room.id),
                        );

                        return (
                          <button
                            type="button"
                            key={room.id}
                            onClick={() =>
                              updateBooking({
                                rooms: [
                                  {
                                    room_type_id: Number(room.room_type_id),
                                    room_id: room.id,
                                    nightly_rate: nightlyRate,
                                  },
                                ],
                              })
                            }
                            className={`group relative overflow-hidden rounded-3xl border p-5 text-left transition-all duration-200 ${
                              selected
                                ? "border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-100"
                                : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
                            }`}
                          >
                            {selected && (
                              <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
                                <Check className="h-4 w-4" />
                              </div>
                            )}

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition group-hover:bg-amber-100 group-hover:text-amber-600">
                              <BedDouble className="h-6 w-6" />
                            </div>

                            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Room
                            </p>

                            <h4 className="mt-1 font-serif text-2xl text-slate-900">
                              {room.room_number}
                            </h4>

                            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                              <MapPin className="h-3.5 w-3.5" />
                              Floor {room.floor}
                            </div>

                            {room.description && (
                              <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-400">
                                {room.description}
                              </p>
                            )}

                            <div className="mt-5 border-t border-slate-100 pt-4">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">
                                  Room status
                                </span>

                                <span className="text-xs font-semibold text-emerald-600">
                                  Available
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* =================================================
                STEP 4 — PAYMENT
            ================================================= */}

            {step === 4 && (
              <section className="space-y-5">
                {/* Payment */}

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <SectionHeader
                    icon={CreditCard}
                    eyebrow="Step 4"
                    title="Payment"
                    description="Choose how you'd like to pay for your reservation."
                  />

                  <div className="p-6 sm:p-8">
                    {/* Payment option */}

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Payment Option
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Choose full payment or a 50% deposit.
                      </p>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <PaymentOption
                          selected={bookingData.payment_option === "full"}
                          title="Full Payment"
                          description={`Pay 100% now · $${total.toLocaleString()}`}
                          icon={WalletCards}
                          onClick={() =>
                            setBookingField("payment_option", "full")
                          }
                        />

                        <PaymentOption
                          selected={bookingData.payment_option === "deposit"}
                          title="50% Deposit"
                          description={`Pay 50% now · $${(
                            total * 0.5
                          ).toLocaleString()}`}
                          icon={CreditCard}
                          onClick={() =>
                            setBookingField("payment_option", "deposit")
                          }
                        />
                      </div>
                    </div>

                    {/* Method */}

                    <div className="mt-8">
                      <p className="text-sm font-semibold text-slate-800">
                        Payment Method
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Select your preferred payment method.
                      </p>

                      <div className="mt-4 grid gap-4 sm:grid-cols-1">
                        <PaymentOption
                          selected={
                            bookingData.payment_method === "bakong_khqr"
                          }
                          title="Bakong KHQR"
                          description="Scan with any Bakong-supported banking app"
                          icon={WalletCards}
                          onClick={() =>
                            setBookingField("payment_method", "bakong_khqr")
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                      Final Review
                    </p>

                    <h3 className="mt-1 font-serif text-2xl text-slate-900">
                      Reservation Summary
                    </h3>
                  </div>

                  <div className="p-6 sm:p-8">
                    {/* Stay */}

                    <div className="flex gap-4 rounded-2xl bg-slate-50 p-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                        <BedDouble className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-lg text-slate-900">
                          {selectedRoomType.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {nights} night
                          {nights !== 1 ? "s" : ""} · Room{" "}
                          {bookingData.rooms[0]?.room_id
                            ? (rooms.find(
                                (room) =>
                                  Number(room.id) ===
                                  Number(bookingData.rooms[0]?.room_id),
                              )?.room_number ?? "Selected")
                            : "Selected"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-slate-400">Room</p>

                        <p className="mt-1 font-semibold text-slate-900">
                          ${subtotal.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Dates */}

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <MiniDetail
                        icon={CalendarDays}
                        label="Check-in"
                        value={bookingData.check_in_date}
                      />

                      <MiniDetail
                        icon={CalendarDays}
                        label="Check-out"
                        value={bookingData.check_out_date}
                      />
                    </div>

                    {/* Price */}

                    <div className="mt-7 space-y-4">
                      <SummaryRow
                        label="Room charge"
                        value={`$${subtotal.toLocaleString()}`}
                      />

                      <SummaryRow
                        label="Tax"
                        value={`$${tax.toLocaleString()}`}
                      />

                      <SummaryRow
                        label="Discount"
                        value={`-$${discount.toLocaleString()}`}
                      />

                      <div className="border-t border-slate-200 pt-5">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-700">
                              Total
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Final reservation amount
                            </p>
                          </div>

                          <p className="font-serif text-3xl font-bold text-slate-900">
                            ${total.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Pay now */}

                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {bookingData.payment_method === "cash"
                                ? "Due at hotel"
                                : "Pay Now"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {bookingData.payment_option === "deposit"
                                ? "50% deposit"
                                : "Full payment"}
                            </p>
                          </div>

                          <p className="font-serif text-2xl font-bold text-amber-700">
                            ${paidAmount.toLocaleString()}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-amber-200 pt-4">
                          <span className="text-sm text-slate-600">
                            Remaining
                          </span>

                          <span className="font-semibold text-slate-900">
                            ${remainingBalance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
                NAVIGATION
            ================================================= */}

            <div className="mt-7 flex items-center justify-between">
              <button
                type="button"
                onClick={step === 1 ? () => navigate(-1) : previousStep}
                disabled={isSubmitting || Boolean(createdReservation)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />

                {step === 1 ? "Cancel" : "Previous"}
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-md"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    nights <= 0 ||
                    bookingData.rooms.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-600 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {bookingData.payment_method === "bakong_khqr"
                        ? "Pay with KHQR"
                        : "Confirm & Book"}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          KHQR PAYMENT MODAL
      ================================================= */}

      {khqrPayment && (
        <KhqrPaymentModal
          payment={khqrPayment}
          amount={getAmountToPay(
            Number(createdReservation?.total_amount ?? total),
          )}
          onPaid={handleKhqrPaid}
          onExpired={handleKhqrExpired}
          onClose={() => setKhqrPayment(null)}
        />
      )}
    </div>
  );
}

/* =========================================================
   SUCCESS PAGE
========================================================= */

function SuccessPage({
  bookingResult,
  bookingData,
  selectedRoomType,
  nights,
  total,
  paidAmount,
  remainingBalance,
  resetBooking,
  navigate,
}) {
  return (
    <div className="min-h-screen bg-[#f8f7f4] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Success hero */}

        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 shadow-sm ring-8 ring-emerald-50/60">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">
            Reservation Successful
          </p>

          <h1 className="mt-2 font-serif text-4xl text-slate-900 sm:text-5xl">
            Booking Confirmed!
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Thank you for choosing us. Your reservation has been successfully
            created.
          </p>
        </div>

        {/* Confirmation card */}

        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-7 text-white sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Reservation Code
                </p>

                <p className="mt-2 font-mono text-2xl font-bold tracking-wider text-amber-400">
                  {bookingResult.reservation_code}
                </p>
              </div>

              <div className="rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300">
                Confirmed
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Room */}

            <div className="flex gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                <BedDouble className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Room
                </p>

                <p className="mt-1 font-serif text-lg text-slate-900">
                  {selectedRoomType.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {nights} night
                  {nights !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Guest */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <ConfirmationDetail
                icon={User}
                label="Guest"
                value={`${bookingData.guest_details.first_name} ${bookingData.guest_details.last_name}`}
              />

              <ConfirmationDetail
                icon={Mail}
                label="Email"
                value={bookingData.guest_details.email}
              />
            </div>

            {/* Amount */}

            <div className="mt-7 border-t border-slate-100 pt-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <AmountBox
                  label="Total"
                  value={`$${Number(
                    bookingResult.total_amount ?? total,
                  ).toLocaleString()}`}
                />

                <AmountBox
                  label="Paid"
                  value={`$${Number(
                    bookingResult.paid_amount ?? paidAmount,
                  ).toLocaleString()}`}
                  highlight
                />

                <AmountBox
                  label="Remaining"
                  value={`$${Number(
                    bookingResult.remaining_balance ?? remainingBalance,
                  ).toLocaleString()}`}
                />
              </div>

              {bookingResult.payment_method === "cash" && (
                <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-xs text-amber-800">
                  Please pay the balance in cash at check-in.
                </p>
              )}
            </div>

            {/* Invoice */}

            <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs text-slate-400">Invoice Number</p>

                <p className="mt-1 font-mono text-sm font-semibold text-slate-800">
                  {bookingResult.invoice_no}
                </p>
              </div>

              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Actions */}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => {
              resetBooking();
              navigate("/suites");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600"
          >
            Browse More Rooms
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BOOKING STEPS
========================================================= */

function BookingSteps({ step }) {
  const steps = [
    { number: 1, label: "Guest", icon: User },
    { number: 2, label: "Stay", icon: CalendarDays },
    { number: 3, label: "Room", icon: BedDouble },
    { number: 4, label: "Payment", icon: CreditCard },
  ];

  return (
    <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid grid-cols-4 gap-2">
        {steps.map((item) => {
          const active = step >= item.number;
          const current = step === item.number;

          const Icon = item.icon;

          return (
            <div key={item.number} className="relative">
              <div
                className={`flex flex-col items-center gap-2 rounded-2xl px-2 py-3 transition ${
                  active ? "bg-amber-50 text-amber-700" : "text-slate-400"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    active
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-400"
                  } ${current ? "ring-4 ring-amber-100" : ""}`}
                >
                  {step > item.number ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                <span className="text-[11px] font-bold sm:text-xs">
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({ icon: Icon, eyebrow, title, description }) {
  return (
    <div className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/70 px-6 py-6 sm:px-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <Icon className="h-6 w-6" />
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
            {eyebrow}
          </p>

          <h2 className="mt-1 font-serif text-2xl text-slate-900">{title}</h2>

          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INPUT
========================================================= */

function Input({
  label,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
        {required && <span className="ml-1 text-amber-600">*</span>}
      </label>

      <input
        type={type}
        required={required}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
      />
    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function SelectInput({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
        >
          <option value="">Select ID type</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ArrowRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
      </div>
    </div>
  );
}

/* =========================================================
   DATE INPUT
========================================================= */

function DateInput({ label, value, onChange, min }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-600" />

        <input
          type="date"
          required
          min={min}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
        />
      </div>
    </div>
  );
}

/* =========================================================
   NUMBER INPUT
========================================================= */

function NumberInput({ label, value, min, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <div className="relative">
        <Users className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-600" />

        <input
          type="number"
          min={min}
          value={value ?? 0}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
        />
      </div>
    </div>
  );
}

/* =========================================================
   PAYMENT OPTION
========================================================= */

function PaymentOption({ selected, title, description, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 ${
        selected
          ? "border-amber-500 bg-amber-50 shadow-sm ring-2 ring-amber-100"
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-sm"
      }`}
    >
      {selected && (
        <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white">
          <Check className="h-3.5 w-3.5" />
        </div>
      )}

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          selected ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-4 font-semibold text-slate-900">{title}</p>

      <p className="mt-1 pr-5 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </button>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({ icon: Icon, title, text }) {
  return (
    <div className="mt-7 flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

      <div>
        <p className="text-sm font-semibold text-emerald-800">{title}</p>

        <p className="mt-1 text-xs leading-5 text-emerald-700">{text}</p>
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>

      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}

/* =========================================================
   MINI DETAIL
========================================================= */

function MiniDetail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-xs font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   CONFIRMATION DETAIL
========================================================= */

function ConfirmationDetail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-amber-600">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-medium text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   AMOUNT BOX
========================================================= */

function AmountBox({ label, value, highlight = false }) {
  return (
    <div
      className={`rounded-2xl p-4 ${highlight ? "bg-emerald-50" : "bg-slate-50"}`}
    >
      <p className="text-xs text-slate-400">{label}</p>

      <p
        className={`mt-1 font-serif text-xl font-bold ${
          highlight ? "text-emerald-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
