import { RouterProvider } from "react-router-dom"
import "@repo/ui/globals.css"

import { router } from "./router"

function App() {
  return <RouterProvider router={router} />
}

export default App
