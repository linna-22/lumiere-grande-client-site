import { createContext, useContext, useMemo, useState } from "react";

const BookingContext = createContext(undefined);

const initialBookingData = {
  guest_id: null,

  guest_details: {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    id_type: "",
    id_number: "",
    nationality: "",
  },

  check_in_date: "",
  check_out_date: "",

  adults: 1,
  children: 0,

  rooms: [],

  tax: 0,
  discount: 0,

  payment_option: "full",
  payment_method: "bakong_khqr",
};

export function BookingProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [presetRoomId, setPresetRoomId] = useState(null);

  const [bookingData, setBookingData] = useState(initialBookingData);

  const [bookingResult, setBookingResult] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const openBooking = (roomId) => {
    setPresetRoomId(roomId);
    setBookingData({
      ...initialBookingData,
      rooms: [],
    });
    setBookingResult(null);
    setError(null);
    setIsOpen(true);
  };

  const closeBooking = () => {
    setIsOpen(false);
    setError(null);
  };

  const updateBooking = (data) => {
    setBookingData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const updateGuestDetails = (data) => {
    setBookingData((prev) => ({
      ...prev,
      guest_details: {
        ...prev.guest_details,
        ...data,
      },
    }));
  };

  const updateRooms = (rooms) => {
    setBookingData((prev) => ({
      ...prev,
      rooms,
    }));
  };

  const setBookingField = (field, value) => {
    setBookingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetBooking = () => {
    setBookingData(initialBookingData);
    setPresetRoomId(null);
    setBookingResult(null);
    setError(null);
    setIsSubmitting(false);
  };

  const value = useMemo(
    () => ({
      // Modal
      isOpen,
      openBooking,
      closeBooking,

      // Selected room
      presetRoomId,

      // Reservation form data
      bookingData,
      setBookingField,
      updateBooking,
      updateGuestDetails,
      updateRooms,

      // Reservation API result
      bookingResult,
      setBookingResult,

      // Request state
      isSubmitting,
      setIsSubmitting,

      error,
      setError,

      // Reset
      resetBooking,
    }),
    [
      isOpen,
      presetRoomId,
      bookingData,
      bookingResult,
      isSubmitting,
      error,
    ]
  );

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);

  if (!ctx) {
    throw new Error(
      "useBooking must be used within BookingProvider"
    );
  }

  return ctx;
}