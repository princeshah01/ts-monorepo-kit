import express from "express"
import {
  errorHandler,
  notFoundHandler
} from "./middlewares/error-handler.middleware.js"
import { authRouter } from "./routes/auth.routes.js"
import { userRouter } from "./routes/user.routes.js"

const app = express()
const port = Number(process.env.PORT ?? 4001)

app.use(express.json())

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      service: "auth-service",
      status: "ok",
      timestamp: new Date().toISOString()
    }
  })
})

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/users", userRouter)

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(port, () => {
  console.log(`auth-service running on port ${port}`)
})
