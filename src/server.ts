import express from 'express';
import cors, { CorsOptions } from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

import snippetRoute from './routes/snippetRoute';
import authRouter from './routes/authRouter';

const app = express();

const whiteList = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL2
]

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Error de CORS: El origen no está permitido'));
    }
  },
  credentials: true //* 👈 Esto permite que el navegador envíe cookies
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

app.use(morgan('dev'))

app.use('/api/snippets', snippetRoute);
app.use('/api/auth', authRouter);


export default app;