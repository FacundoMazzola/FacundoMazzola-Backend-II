import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import passport from "passport";

import { initializePassport } from "./config/passport.config.js";
import sessionsRouter from "./routes/sessions.router.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initializePassport();
app.use(passport.initialize());

// 👇 conectar router
app.use("/api/sessions", sessionsRouter);

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Conectado a MongoDB"))
    .catch(error => console.log("Error conexión Mongo:", error));

console.log("JWT_SECRET:", process.env.JWT_SECRET);

export default app;