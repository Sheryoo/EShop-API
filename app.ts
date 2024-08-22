import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import { config } from "dotenv";
import mongoose from "mongoose";

// Load Environment Variables
config();

import normalUserRoutes from "./routes/normal-user";
import adminRoutes from "./routes/admin";
import errorHandler from "./helpers/error-handler";

const API_URI = process.env.API_URI;
const ADMIN_URI = process.env.ADMIN_URI;
const MongoUrl = process.env.MONGO_URI;

// Database Connection
mongoose.connect(MongoUrl);
mongoose.connection.once("open", () => {
  console.info("Connected to the Database Successfully.");
});

// Define Express App
const app = express();

// App Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan("common"));

// Normal User Routes
app.use(`${API_URI}/products`, normalUserRoutes.productRouter);
app.use(`${API_URI}/users`, normalUserRoutes.userRouter);
app.use(`${API_URI}/categories`, normalUserRoutes.categoryRouter);
app.use(`${API_URI}/orders`, normalUserRoutes.orderRouter);

// Admin Routes
app.use(`${ADMIN_URI}/products`, adminRoutes.productRouter);
app.use(`${ADMIN_URI}/users`, adminRoutes.userRouter);
app.use(`${ADMIN_URI}/categories`, adminRoutes.categoryRouter);
app.use(`${ADMIN_URI}/orders`, adminRoutes.orderRouter);
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

// Error Handler for not found routes
app.use(errorHandler);

app.listen(3030, () => {
  console.info("The server is running on : http://localhost:3030/");
});
