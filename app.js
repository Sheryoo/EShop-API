const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");

const app = express();

const productRouter = require("./routes/products");
const userRouter = require("./routes/users");
const categoryRouter = require("./routes/categories");
const orderRouter = require("./routes/orders");
const errorHandler = require("./helpers/error-handler");

const API = process.env.API_URI;
const MongoUrl = process.env.MONGO_URI;

mongoose.connect(MongoUrl);
mongoose.connection.once("open", () => {
  console.log("Connected to the Database Successfully !!!");
});

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(errorHandler);

app.use(`${API}/products`, productRouter);
app.use(`${API}/users`, userRouter);
app.use(`${API}/categories`, categoryRouter);
app.use(`${API}/orders`, orderRouter);
app.use('/public/uploads', express.static(__dirname+'/public/uploads'));


app.listen(3030, () => {
  console.log("The server is running on : http://localhost:3030/api/v1/");
});
