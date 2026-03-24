export interface MockUser {
  email: string
  password: string
  otpEnabled: boolean
  hasPermission: boolean
  otpCode: string
}

const USERS: MockUser[] = [
  {
    email: "otp.user@demo.com",
    password: "Password@123",
    otpEnabled: true,
    hasPermission: true,
    otpCode: "123456"
  },
  {
    email: "nootp.user@demo.com",
    password: "Password@123",
    otpEnabled: false,
    hasPermission: true,
    otpCode: ""
  },
  {
    email: "unauthorized.user@demo.com",
    password: "Password@123",
    otpEnabled: false,
    hasPermission: false,
    otpCode: ""
  }
]

export function findUser(email: string): MockUser | undefined {
  const normalized = email.trim().toLowerCase()
  return USERS.find(user => user.email === normalized)
}
