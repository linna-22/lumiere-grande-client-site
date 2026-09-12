import { useEffect, useState } from "react";
import {
  fetchRoomTypes,
  fetchAllRooms,
  fetchFacilities,
} from "../api/rooms";

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1200";

export function useRoomDetail(id) {
  const [state, setState] = useState({
    room: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!id) {
      setState({
        room: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    let ignore = false;

    async function loadRoom() {
      try {
        setState({
          room: null,
          isLoading: true,
          error: null,
        });

        const [roomTypes, roomsData, facilities] = await Promise.all([
          fetchRoomTypes(),
          fetchAllRooms(),
          fetchFacilities().catch(() => []),
        ]);

        console.log("Room Detail - roomTypes:", roomTypes);
        console.log("Room Detail - rooms:", roomsData);
        console.log("Room Detail - facilities:", facilities);

        const rooms = roomsData?.rooms ?? [];

        // Find the room type using the URL ID
        const type = roomTypes.find(
          (t) => String(t.id) === String(id)
        );

        if (!type) {
          throw new Error(`Room type ${id} was not found.`);
        }

        // Rooms belonging to this room type
        const matchingRooms = rooms.filter(
          (r) => String(r.room_type_id) === String(type.id)
        );

        // Build gallery from physical rooms
        const gallery = [
          ...new Set(
            matchingRooms
              .map((r) => r.image_url)
              .filter(Boolean)
          ),
        ];

        if (gallery.length === 0) {
          gallery.push(FALLBACK_IMAGE);
        }

        /*
         * Room type facilities may already be full objects
         * or may be IDs depending on the API response.
         */
        const facilityById = new Map(
          (facilities ?? []).map((f) => [String(f.id), f])
        );

        const normalizedFacilities = (type.facilities ?? [])
          .map((facility) => {
            // Already a facility object
            if (
              typeof facility === "object" &&
              facility !== null
            ) {
              return facility;
            }

            // Facility is an ID
            return facilityById.get(String(facility));
          })
          .filter(Boolean);

        const room = {
          id: type.id,
          name: type.name ?? "Unnamed Room",
          type: type.name ?? "Room",
          description: type.description ?? "",
          image: gallery[0],
          gallery,

          pricePerNight: Number(type.base_price ?? 0),

          capacity: Number(type.capacity ?? 0),

          maxOccupancy: Number(
            type.max_occupancy ?? type.capacity ?? 0
          ),

          facilities: normalizedFacilities,

          rooms: matchingRooms,
        };

        console.log("Room Detail - final room:", room);

        if (!ignore) {
          setState({
            room,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Failed to load room detail:", error);

        if (!ignore) {
          setState({
            room: null,
            isLoading: false,
            error,
          });
        }
      }
    }

    loadRoom();

    return () => {
      ignore = true;
    };
  }, [id]);

  return state;
}