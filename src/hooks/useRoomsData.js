import { useEffect, useState } from "react";
import { fetchAllRooms, fetchFacilities } from "../api/rooms";

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1200";

export function useRoomsData() {
  const [state, setState] = useState({
    rooms: [],
    roomTypeNames: [],
    minPrice: 0,
    maxPrice: 0,
    summary: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const [{ rooms, summary }, facilities] = await Promise.all([
          fetchAllRooms(),
          fetchFacilities().catch(() => []),
        ]);

        const facilityById = new Map(facilities.map((f) => [f.id, f]));

        // Only show physically available rooms on the public website.
        const availableRooms = rooms.filter(
          (room) =>
            String(room.status || "").toLowerCase() === "available"
        );

        const combined = availableRooms
          .filter((room) => room.room_type)
          .map((room) => {
            const type = room.room_type;

            const typeFacilities = (type.facilities ?? [])
              .map((fid) => {
                if (typeof fid === "object" && fid !== null) {
                  return fid;
                }

                return facilityById.get(fid);
              })
              .filter(Boolean);

            return {
              id: room.id,
              roomTypeId: type.id,
              roomNumber: room.room_number,
              floor: room.floor,
              status: room.status,
              name: type.name,
              type: type.name,
              description: type.description,
              image: room.image_url || FALLBACK_IMAGE,
              pricePerNight: Number(type.base_price ?? 0),
              capacity: type.capacity,
              maxOccupancy: type.max_occupancy,
              facilities: typeFacilities,
              created_at: room.created_at,
              featured: room.featured ?? false,
            };
          });

        if (ignore) return;

        const prices = combined
          .map((r) => Number(r.pricePerNight))
          .filter((p) => Number.isFinite(p));

        const typeNames = [
          ...new Set(combined.map((r) => r.type)),
        ];

        setState({
          rooms: combined,
          roomTypeNames: typeNames,
          minPrice: prices.length ? Math.min(...prices) : 0,
          maxPrice: prices.length ? Math.max(...prices) : 0,
          summary,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (!ignore) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error,
          }));
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  return state;
}