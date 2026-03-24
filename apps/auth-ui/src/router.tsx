import { createBrowserRouter, Navigate } from "react-router-dom"

import { LoginPage } from "./features/auth/pages/login-page"
import { NotFoundPage } from "./features/auth/pages/not-found-page"
import { RegisterPage } from "./features/auth/pages/register-page"
import { UnauthorizedPage } from "./features/auth/pages/unauthorized-page"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/register",
    element: <RegisterPage />
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
])
