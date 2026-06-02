require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const cookieParser = require("cookie-parser");
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
app.get("/", (req, res) => {
  res.json("Hello, Welcome to express routes");
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB Connected"))
  .catch(() => console.log("DB Connection Fail"));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`The server running at http://localhost:${PORT}`);
});
