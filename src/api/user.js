import { apiFetch } from './client'

export function getCurrentUser() {
  return apiFetch('/user/me')
}

export function changePassword({ current_password, new_password, new_password_confirmation }) {
  return apiFetch('/user/change-password', {
    method: 'PUT',
    body: JSON.stringify({ current_password, new_password, new_password_confirmation }),
  })
}

export function getProfile() {
  return apiFetch('/user/profile')
}

export function updateProfile(data) {
  return apiFetch('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}