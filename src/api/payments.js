// src/api/payments.js
// KHQR payment endpoints used by the client booking flow.
// If you already have a shared fetch/axios client in src/api, swap `request` for it.

const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON response (e.g. 500 HTML page)
  }

  if (!response.ok) {
    const message = data?.errors
      ? Object.values(data.errors).flat().join(" ")
      : data?.message;

    const error = new Error(message || "Payment request failed.");
    error.status = response.status; // 410 = QR expired
    error.data = data;
    throw error;
  }

  return data;
}

/** POST /payments/khqr/generate */
export function generateKhqr({ reservationId, invoiceId, amount, currency = "USD" }) {
  return request("/payments/khqr/generate", {
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
  return request(`/payments/khqr/verify/${paymentId}`, { method: "GET" });
}