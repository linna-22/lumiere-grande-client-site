import { apiFetch, fetchCsrfCookie } from './client'

export async function register({ name, email, password, password_confirmation }) {
  await fetchCsrfCookie()
  return apiFetch('/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, password_confirmation }),
  })
  // Note: backend currently does NOT return access_token here, even though
  // it creates one server-side. Until that's fixed, redirect to Login after
  // successful registration rather than trying to auto-log-in.
}