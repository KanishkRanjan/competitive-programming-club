import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import { connect } from "./connection";

import leaderboardRoute from './routes/leaderboard'
import scapperRoute from './routes/scrapper'
import problemRoute from './routes/problems'
import CustomError from './utils/error/custom.error'

import errorHandler from './utils/middlewares/errorhandler.middleware'
import responseHandler from './utils/middlewares/responder.middleware'
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT || 3000);

// app.get('/error', (req, res, next) => {
//     const error = new CustomError('Something went wrong!', 500);
//     next(error);
// });
  

app.use(cors());
app.use(express.json())
app.use('/api/leaderboard', leaderboardRoute);
app.use('/api/scrapper' , scapperRoute);
app.use('/api/problems'  , problemRoute);

//remove handler and make into one 
app.use(responseHandler);
app.use(errorHandler);

app.listen(port,"0.0.0.0", async () => {
  await connect();
  console.log(`Server is running on http://localhost:${port}`);
});
  