import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 5000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  },
})

export function showSuccessToast(message) {
  Toast.fire({ icon: 'success', title: message })
}

export function showErrorToast(message) {
  Toast.fire({ icon: 'error', title: message })
}