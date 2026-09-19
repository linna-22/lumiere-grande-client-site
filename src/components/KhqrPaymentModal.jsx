// src/components/booking/KhqrPaymentModal.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X } from "lucide-react";

import { verifyKhqr } from "../api/payments";

const POLL_INTERVAL_MS = 3000;
const FALLBACK_WINDOW_MS = 10 * 60 * 1000; // used only if the API sends no expires_at

function formatTime(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const minutes = String(Math.floor(safe / 60)).padStart(2, "0");
  const seconds = String(safe % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function KhqrPaymentModal({
  payment, // response from POST /payments/khqr/generate
  amount,
  onPaid,
  onExpired,
  onClose,
}) {
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(null);

  // Keep the latest callbacks without restarting the polling loop.
  const callbacks = useRef({ onPaid, onExpired });
  callbacks.current = { onPaid, onExpired };

  /* -------- countdown (display only; the server decides expiry) -------- */
  const expiresAt = useMemo(() => {
    const parsed = payment?.expires_at
      ? new Date(payment.expires_at).getTime()
      : NaN;

    return Number.isFinite(parsed) ? parsed : Date.now() + FALLBACK_WINDOW_MS;
  }, [payment?.payment_id]);

  useEffect(() => {
    const tick = () =>
      setSecondsLeft(Math.round((expiresAt - Date.now()) / 1000));

    tick();
    const id = setInterval(tick, 1000);

    return () => clearInterval(id);
  }, [expiresAt]);

  /* -------- polling -------- */
  useEffect(() => {
    if (!payment?.payment_id) return undefined;

    let cancelled = false;
    let timer;

    // Chained timeout (not setInterval) so requests never overlap.
    const poll = async () => {
      try {
        const data = await verifyKhqr(payment.payment_id);

        if (cancelled) return;

        if (data?.paid === true) {
          callbacks.current.onPaid?.(data);
          return;
        }

        setError("");
      } catch (err) {
        if (cancelled) return;

        // Backend returns 410 once the QR has expired.
        if (err.status === 410) {
          callbacks.current.onExpired?.();
          return;
        }

        // Network / 5xx: keep polling, just tell the guest.
        setError(err.message || "Unable to check payment status.");
      }

      if (!cancelled) {
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [payment?.payment_id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Scan to pay with Bakong KHQR"
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h3 className="font-serif text-2xl text-slate-900">Scan to pay</h3>

            <p className="mt-1 text-xs text-slate-500">
              Open your Bakong-supported banking app and scan this KHQR.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment window"
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* QR */}
          <div className="flex justify-center rounded-2xl border border-slate-100 bg-white p-4">
            <QRCodeSVG
              value={payment.qr_code}
              size={240}
              level="M"
              includeMargin
            />
          </div>

          {/* Amount */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-400">Amount to pay</p>

            <p className="mt-1 font-serif text-3xl font-bold text-amber-700">
              ${Number(amount).toFixed(2)}
            </p>
          </div>

          {/* Deeplink (mobile) */}
          {payment.deeplink && (
            <a
              href={payment.deeplink}
              className="mt-5 flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-amber-600"
            >
              Open Bakong app
            </a>
          )}

          {/* Status */}
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center justify-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />

              <p className="text-xs font-medium text-slate-700">
                Waiting for payment…
              </p>
            </div>

            {secondsLeft !== null && (
              <p className="mt-1 text-center text-[11px] text-slate-500">
                {secondsLeft > 0
                  ? `This code expires in ${formatTime(secondsLeft)}`
                  : "Confirming with the bank…"}
              </p>
            )}
          </div>

          {error && (
            <p className="mt-3 text-center text-xs text-red-600">{error}</p>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel payment
          </button>
        </div>
      </div>
    </div>
  );
}
