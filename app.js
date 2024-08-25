import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import db from './models/indexModel.js';
import userRoutes from './routes/userRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import borrowRoutes from './routes/borrowRoutes.js';
import { runAdminSeeder } from './utils/seeders.js';


const app = express();
const port = process.env.PORT || 8080;

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
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/borrow', borrowRoutes);

app.get('/', (req, res) => {
  res.send("Welcome to BookHive Application!!!");
});

// Synchronize the models with the database
// db.syncDb()
//   .then(() => {
//     app.listen(port, () => console.log(`Express Server is running on PORT ${port}`));
//   })
//   .catch(err => {
//     console.error('Failed to start server: ', err);
//   });

const startServer = async () => {
  try {
    // Synchronize the models with the database
    await db.syncDb();

    // Run the admin seeder if not already seeded
    await runAdminSeeder();

    // Start the server
    app.listen(port, () => console.log(`Express Server is running on PORT ${port}`));
  } catch (err) {
    console.error('Failed to start server: ', err);
  }
};

startServer();
