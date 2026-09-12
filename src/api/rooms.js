const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

async function getJson(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);

  if (!res.ok) {
    throw new Error(`Request to ${path} failed (${res.status})`);
  }

  return res.json();
}

export async function fetchRoomTypes() {
  const json = await getJson("/room-types");
  return json.data;
}

// Fetches every page of /api/rooms and concatenates the results,
// so filters (type/price) can apply across the full set.
export async function fetchAllRooms() {
  const perPage = 100;

  const first = await getJson(`/rooms?per_page=${perPage}&page=1`);

  let allRooms = [...first.data];

  const lastPage = first.meta?.last_page ?? 1;

  if (lastPage > 1) {
    const requests = [];

    for (let page = 2; page <= lastPage; page++) {
      requests.push(
        getJson(`/rooms?per_page=${perPage}&page=${page}`)
      );
    }

    const rest = await Promise.all(requests);

    rest.forEach((r) => {
      allRooms.push(...r.data);
    });
  }

  return {
    rooms: allRooms,
    summary: first.summary ?? null,
  };
}

// Fetch one room for the suite/details page
export async function fetchRoom(id) {
  const json = await getJson(`/rooms/${id}`);

  return json.data ?? json;
}

export async function fetchFacilities() {
  const json = await getJson("/facilities");

  return json.facilities ?? json.data ?? [];
}