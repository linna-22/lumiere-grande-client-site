import { apiFetch } from "./client";

export async function createReservation(data) {
  return apiFetch("/reservation", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchReservations(params = {}) {
  const query = new URLSearchParams(params).toString();

  return apiFetch(`/reservations${query ? `?${query}` : ""}`);
}
