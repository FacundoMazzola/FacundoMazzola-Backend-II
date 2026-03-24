import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import UserDTO from "../dto/user.dto.js";
import { sendRecoveryEmail } from "../utils/mailer.js";
import { createHash, isValidPassword } from "../utils/hash.js";
import UserRepository from "../repositories/user.repository.js";

const router = Router();
const userRepository = new UserRepository();

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

        const payload = {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            age: user.age,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });

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

        const user = new UserDTO(req.user);

        res.json({
            status: "success",
            user
        });
    }
);

// ================= FORGOT PASSWORD =================
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        const user = await userRepository.getByEmail(email);
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "Usuario no encontrado"
            });
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;

        await user.save();

        await sendRecoveryEmail(email, token);

        res.json({
            status: "success",
            message: "Email enviado"
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error al enviar el mail"
        });
    }
});

// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userRepository.getByEmail(decoded.email);
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "Usuario no encontrado"
            });
        }

        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({
                status: "error",
                message: "Token expirado"
            });
        }

        if (isValidPassword(user, newPassword)) {
            return res.status(400).json({
                status: "error",
                message: "No podés usar la misma contraseña"
            });
        }

        user.password = createHash(newPassword);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.json({
            status: "success",
            message: "Contraseña actualizada"
        });

    } catch (error) {
        res.status(400).json({
            status: "error",
            message: "Token inválido"
        });
    }
});

export default router;