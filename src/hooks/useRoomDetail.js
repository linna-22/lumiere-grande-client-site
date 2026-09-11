import { useEffect, useState } from "react";
import { fetchRoomTypes, fetchAllRooms, fetchFacilities } from "../api/rooms";



const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1200";

export function useRoomDetail(id) {
  const [state, setState] = useState({ room: null, isLoading: true, error: null });

  useEffect(() => {
    if (!id) return;
    let ignore = false;

    (async () => {
      setState({ room: null, isLoading: true, error: null });
      try {

        const [roomTypes, rooms, facilities] = await Promise.all([
          fetchRoomTypes(),
          fetchAllRooms(),
          fetchFacilities().catch(() => []),
        ]);

        const type = roomTypes.find((t) => String(t.id) === String(id));
        if (!type) {
          if (!ignore) setState({ room: null, isLoading: false, error: null });
          return;
        }

        const facilityById = new Map(facilities.map((f) => [f.id, f]));
        const matchingRooms = rooms.filter((r) => r.room_type_id === type.id);

        const gallery = [
          ...new Set(matchingRooms.map((r) => r.image_url).filter(Boolean)),
        ];
        if (gallery.length === 0) gallery.push(FALLBACK_IMAGE);

        const room = {
          id: type.id,
          name: type.name,
          type: type.name,
          description: type.description,
          image: gallery[0],
          gallery,
          pricePerNight: type.base_price,
          capacity: type.capacity,
          maxOccupancy: type.max_occupancy,
          facilities: (type.facilities ?? [])
            .map((fid) => facilityById.get(fid))
            .filter(Boolean),
          rooms: matchingRooms,
        };

        if (!ignore) setState({ room, isLoading: false, error: null });
      } catch (error) {
        if (!ignore) setState({ room: null, isLoading: false, error });
      }
    })();

    return () => {
      ignore = true;
    };
  }, [id]);

  return state;
}