import express from "express"
import { env } from "./env"

const app = express()
const port = env.AUTH_PORT

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      service: "auth-service_test",
      status: "ok",
      timestamp: new Date().toISOString()
    }
  })
})

app.listen(port, () => {
  console.log(`auth-service running on port ${port}`)
})
