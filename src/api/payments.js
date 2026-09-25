import { apiFetch } from "./client";

/** POST /payments/khqr/generate */
export function generateKhqr({
  reservationId,
  invoiceId,
  amount,
  currency = "USD",
}) {
  return apiFetch("/payments/khqr/generate", {
    method: "POST",
    body: JSON.stringify({
      reservation_id: reservationId,
      invoice_id: invoiceId,
      amount: Number(Number(amount).toFixed(2)),
      currency,
    }),
  });
}

/** GET /payments/khqr/verify/{paymentId} */
export function verifyKhqr(paymentId) {
  return apiFetch(`/payments/khqr/verify/${paymentId}`, {
    method: "GET",
  });
}
