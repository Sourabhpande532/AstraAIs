require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const hrRoutes = require("./routes/hrRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow any localhost origin (covers 5173, 5174, etc.) or no origin (Postman/curl)
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/ai", aiRoutes);

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
