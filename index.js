import express from 'express'
import {userRouter} from "./routes/user.routes.js"
import {authRouter} from "./routes/auth.routes.js"
const PORT = 5000
const app = express()

app.use(express.json())
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))