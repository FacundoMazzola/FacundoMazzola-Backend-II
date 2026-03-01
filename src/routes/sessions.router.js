// src/routes/sessions.router.js
import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = Router();

// ================= REGISTER =================
router.post(
    "/register",
    passport.authenticate("register", { session: false }),
    async (req, res) => {
        res.status(201).json({
            status: "success",
            message: "Usuario registrado correctamente"
        });
    }
);

// ================= LOGIN =================
router.post(
    "/login",
    passport.authenticate("login", { session: false }),
    async (req, res) => {
        const user = req.user;

        // 🔐 Creamos un objeto limpio para firmar el JWT
        const payload = {
            user: {
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                age: user.age
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({
            status: "success",
            access_token: token
        });
    }
);

// ================= CURRENT =================
router.get(
    "/current",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const { _id, first_name, last_name, email, age } = req.user;

        res.json({
            status: "success",
            user: { _id, first_name, last_name, email, age }
        });
    }
);

export default router;