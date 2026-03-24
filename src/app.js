import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import passport from "passport";

import { initializePassport } from "./config/passport.config.js";
import sessionsRouter from "./routes/sessions.router.js";
import cartsRouter from "./routes/carts.router.js";
import productsRouter from "./routes/products.router.js";

dotenv.config();

const app = express();

// ================= MIDDLEWARES =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= PASSPORT =================
initializePassport();
app.use(passport.initialize());

// ================= ROUTES =================
app.use("/api/sessions", sessionsRouter);
app.use("/api/products", productsRouter); // 🔥 admin
app.use("/api/carts", cartsRouter);       // 🔥 user

// ================= DB =================
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Conectado a MongoDB"))
    .catch(error => console.log("Error conexión Mongo:", error));

// ================= DEBUG =================
console.log("JWT_SECRET:", process.env.JWT_SECRET);

export default app;