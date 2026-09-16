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

        const [roomTypesResponse, roomsResponse, facilitiesResponse] =
          await Promise.all([
            fetchRoomTypes(),
            fetchAllRooms(),
            fetchFacilities().catch(() => []),
          ]);

        console.log(
          "Room Detail - roomTypes response:",
          roomTypesResponse
        );

        console.log(
          "Room Detail - rooms response:",
          roomsResponse
        );

        console.log(
          "Room Detail - facilities response:",
          facilitiesResponse
        );

        // ============================================
        // Normalize API responses
        // ============================================

        const roomTypes = Array.isArray(roomTypesResponse)
          ? roomTypesResponse
          : roomTypesResponse?.data ?? [];

        const rooms = Array.isArray(roomsResponse)
          ? roomsResponse
          : roomsResponse?.data ?? [];

        const facilities = Array.isArray(facilitiesResponse)
          ? facilitiesResponse
          : facilitiesResponse?.data ?? [];

        console.log(
          "Room Detail - normalized roomTypes:",
          roomTypes
        );

        console.log(
          "Room Detail - normalized rooms:",
          rooms
        );

        console.log(
          "Room Detail - normalized facilities:",
          facilities
        );

        // ============================================
        // Find room type by URL ID
        // ============================================

        const type = roomTypes.find(
          (t) => String(t.id) === String(id)
        );

        if (!type) {
          throw new Error(
            `Room type ${id} was not found.`
          );
        }

        // ============================================
        // Find physical rooms belonging to this type
        // ============================================

        const matchingRooms = rooms.filter(
          (r) =>
            String(r.room_type_id) ===
            String(type.id)
        );

        console.log(
          "Room Detail - matching rooms:",
          matchingRooms
        );

        // ============================================
        // Build gallery from physical rooms
        // ============================================

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

        // ============================================
        // Normalize facilities
        // ============================================

        const facilityById = new Map(
          facilities.map((f) => [
            String(f.id),
            f,
          ])
        );

        const normalizedFacilities = (
          type.facilities ?? []
        )
          .map((facility) => {
            // Facility is already an object
            if (
              typeof facility === "object" &&
              facility !== null
            ) {
              return facility;
            }

            // Facility is an ID
            return facilityById.get(
              String(facility)
            );
          })
          .filter(Boolean);

        // ============================================
        // Build frontend room object
        // ============================================

        const room = {
          // IMPORTANT:
          // This is the ROOM TYPE ID because the
          // detail page is currently based on room type.
          id: type.id,

          name:
            type.name ??
            "Unnamed Room",

          type:
            type.name ??
            "Room",

          description:
            type.description ?? "",

          image:
            gallery[0],

          gallery,

          pricePerNight:
            Number(type.base_price ?? 0),

          capacity:
            Number(type.capacity ?? 0),

          maxOccupancy:
            Number(
              type.max_occupancy ??
              type.capacity ??
              0
            ),

          facilities:
            normalizedFacilities,

          rooms:
            matchingRooms,
        };

        console.log(
          "Room Detail - final room:",
          room
        );

        if (!ignore) {
          setState({
            room,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error(
          "Failed to load room detail:",
          error
        );

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
