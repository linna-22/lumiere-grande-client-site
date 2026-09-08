import { apiFetch } from './client'

export function forgotPassword(email) {
  return apiFetch('/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function verifyResetOtp({ email, otp }) {
  return apiFetch('/verify-reset-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  })
}

export function resetPassword({ email, otp, password, password_confirmation }) {
  return apiFetch('/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, otp, password, password_confirmation }),
  })
}