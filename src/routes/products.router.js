import { Router } from "express";
import passport from "passport";
import { authorizeRole } from "../middlewares/authorization.js";
import { ProductModel } from "../dao/models/product.model.js";

const router = Router();

// 🔥 SOLO ADMIN puede crear productos
router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    authorizeRole("admin"),
    async (req, res) => {

        try {
            const product = await ProductModel.create(req.body);

            res.status(201).json({
                status: "success",
                product
            });

        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Error al crear producto"
            });
        }
    }
);

// 🔥 SOLO ADMIN puede eliminar productos
router.delete(
    "/:pid",
    passport.authenticate("jwt", { session: false }),
    authorizeRole("admin"),
    async (req, res) => {

        try {
            await ProductModel.findByIdAndDelete(req.params.pid);

            res.json({
                status: "success",
                message: "Producto eliminado"
            });

        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Error al eliminar producto"
            });
        }
    }
);

export default router;