import { apiFetch } from "./client";

export async function createReservation(data) {
  return apiFetch("/reservation", {
    method: "POST",
    body: JSON.stringify(data),
  });
}