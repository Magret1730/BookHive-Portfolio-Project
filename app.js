import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import db from './models/indexModel.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 8080;

// Synchronize the models with the database
db.syncDb()
  .then(() => {
    app.listen(port, () => console.log(`Server is running on PORT ${port}`));
  })
  .catch(err => {
    console.error('Failed to start server: ', err);
  });

// Body Parser middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// cookie parser middleware
app.use(cookieParser());

// development and production
const environment = process.env.NODE_ENV || 'production';
// const isProduction = environment === 'production';

// Routes Middlewares
app.use('/api/v1/users', userRoutes);
