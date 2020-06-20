// 3rd party imports
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'
import cookieSession from 'cookie-session'

// my imports
require('dotenv').config()
import indexRouter from './routes/index'
import authRouter from './routes/auth'
import adminRouter from './routes/admin'
import genericErrorHandler from './middleware/genericErrorHandler'

const cookieSecret = process.env.COOKIE_SECRET

const app = express()

// initial config
app.use(logger('dev'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(
  cookieSession({
    secret: cookieSecret,
  })
)
app.use(express.static(path.join(__dirname, '../public')))

// routes
app.use('/api', indexRouter)
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)

// middleware
app.use(genericErrorHandler)

export default app
