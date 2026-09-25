import { useEffect, useState } from "react";
import {
  fetchRoomTypes,
  fetchAllRooms,
  fetchFacilities,
} from "../api/rooms";

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1200";

export function useRoomDetail(roomTypeId, roomId = null) {
  const [state, setState] = useState({
    room: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!roomTypeId) {
      setState({ room: null, isLoading: false, error: null });
      return;
    }

    let ignore = false;

    async function loadRoom() {
      try {
        setState({ room: null, isLoading: true, error: null });

        const [roomTypesResponse, roomsResponse, facilitiesResponse] =
          await Promise.all([
            fetchRoomTypes(),
            fetchAllRooms(),
            fetchFacilities().catch(() => []),
          ]);

        const roomTypes = Array.isArray(roomTypesResponse)
          ? roomTypesResponse
          : roomTypesResponse?.data ?? [];

        const rooms = Array.isArray(roomsResponse)
          ? roomsResponse
          : roomsResponse?.rooms ?? roomsResponse?.data ?? [];

        const facilities = Array.isArray(facilitiesResponse)
          ? facilitiesResponse
          : facilitiesResponse?.data ?? [];

        const type = roomTypes.find(
          (item) => String(item.id) === String(roomTypeId),
        );

        if (!type) {
          throw new Error(`Room type ${roomTypeId} was not found.`);
        }

        const matchingRooms = rooms.filter(
          (item) => String(item.room_type_id) === String(type.id),
        );

        // If a physical room was supplied in the URL, use ONLY that room.
        // This prevents the booking flow from silently switching to another room.
        const selectedPhysicalRoom = roomId
          ? matchingRooms.find(
              (item) => String(item.id) === String(roomId),
            )
          : matchingRooms[0];

        if (roomId && !selectedPhysicalRoom) {
          throw new Error(`Room ${roomId} was not found for this room type.`);
        }

        const gallery = [
          ...new Set(
            matchingRooms.map((item) => item.image_url).filter(Boolean),
          ),
        ];

        if (gallery.length === 0) gallery.push(FALLBACK_IMAGE);

        const facilityById = new Map(
          facilities.map((facility) => [String(facility.id), facility]),
        );

        const normalizedFacilities = (type.facilities ?? [])
          .map((facility) => {
            if (typeof facility === "object" && facility !== null) {
              return facility;
            }
            return facilityById.get(String(facility));
          })
          .filter(Boolean);

        const room = {
          // Physical room ID is the identity of this detail page when available.
          id: selectedPhysicalRoom?.id ?? type.id,
          roomTypeId: type.id,
          roomNumber: selectedPhysicalRoom?.room_number ?? null,
          floor: selectedPhysicalRoom?.floor ?? null,
          status: selectedPhysicalRoom?.status ?? null,
          name: type.name ?? "Unnamed Room",
          type: type.name ?? "Room",
          description: type.description ?? "",
          image: selectedPhysicalRoom?.image_url || gallery[0],
          gallery,
          pricePerNight: Number(type.base_price ?? 0),
          capacity: Number(type.capacity ?? 0),
          maxOccupancy: Number(type.max_occupancy ?? type.capacity ?? 0),
          facilities: normalizedFacilities,
          rooms: matchingRooms,
          selectedRoom: selectedPhysicalRoom ?? null,
        };

        if (!ignore) {
          setState({ room, isLoading: false, error: null });
        }
      } catch (error) {
        console.error("Failed to load room detail:", error);

        if (!ignore) {
          setState({ room: null, isLoading: false, error });
        }
      }
    }

    loadRoom();

    return () => {
      ignore = true;
    };
  }, [roomTypeId, roomId]);

  return state;
}
