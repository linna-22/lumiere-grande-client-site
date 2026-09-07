import { createContext, useContext, useMemo, useState } from "react";

const BookingContext = createContext(undefined);

export function BookingProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [presetRoomId, setPresetRoomId] = useState(undefined);

  const value = useMemo(
    () => ({
      isOpen,
      presetRoomId,
      openBooking: (roomId) => {
        setPresetRoomId(roomId);
        setIsOpen(true);
      },
      closeBooking: () => setIsOpen(false),
    }),
    [isOpen, presetRoomId]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
