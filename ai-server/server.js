require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const authRoutes = require("./routes/authRoutes");
const hrRoutes = require("./routes/hrRoutes");
const aiRoutes = require("./routes/aiRoutes");
const careerRoutes = require("./routes/careerRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/career", careerRoutes);

app.get("/", (req, res) => {
  res.json("Astra HR API is running...");
});

mongoose
  .connect(process.env.MONGO_URL || "mongodb://localhost:27017/astrahr")
  .then(() => {
    console.log("DB Connected");
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`The server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log("DB Connection Fail", err));
