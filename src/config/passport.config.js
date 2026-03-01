import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { UserModel } from "../dao/models/user.model.js";
import { createHash, isValidPassword } from "../utils/hash.js";
import dotenv from "dotenv";

dotenv.config();

export const initializePassport = () => {

    // ================= REGISTER =================
    passport.use("register", new LocalStrategy(
        { passReqToCallback: true, usernameField: "email" },
        async (req, username, password, done) => {
            try {
                console.log("Register body:", req.body); // 🔹 debug

                const { first_name, last_name, age } = req.body;

                if (!first_name || !last_name || !age || !username || !password) {
                    return done(null, false, { message: "Faltan datos obligatorios" });
                }

                const exists = await UserModel.findOne({ email: username });
                if (exists) return done(null, false, { message: "El usuario ya existe" });

                const newUser = {
                    first_name,
                    last_name,
                    age,
                    email: username,
                    password: createHash(password)
                };

                const result = await UserModel.create(newUser);
                return done(null, result);

            } catch (error) {
                return done(error);
            }
        }
    ));

    // ================= LOGIN =================
    passport.use("login", new LocalStrategy(
        { usernameField: "email" },
        async (username, password, done) => {
            try {
                const user = await UserModel.findOne({ email: username });
                if (!user) return done(null, false, { message: "Usuario no encontrado" });

                if (!isValidPassword(user, password))
                    return done(null, false, { message: "Contraseña incorrecta" });

                return done(null, user);

            } catch (error) {
                return done(error);
            }
        }
    ));

    // ================= JWT =================
    passport.use("jwt", new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET
        },
        async (jwt_payload, done) => {
            try {
                if (!jwt_payload) return done(null, false);
                return done(null, jwt_payload);
            } catch (error) {
                return done(error, false);
            }
        }
    ));
};