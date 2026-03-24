export function validateEmail(email: string): string | null {
  const trimmed = email.trim()
  if (!trimmed) {
    return "Enter an email address."
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    return "Enter a valid email address."
  }

  return null
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return "Enter your password."
  }

  if (password.length < 8) {
    return "Use at least 8 characters."
  }

  return null
}

export function validateName(name: string): string | null {
  if (!name.trim()) {
    return "Enter your full name."
  }

  if (name.trim().length < 2) {
    return "Name must be at least 2 characters."
  }

  return null
}
