import { Router } from "express";
import passport from "passport";
import { authorizeRole } from "../middlewares/authorization.js";
import { TicketModel } from "../dao/models/ticket.model.js";
import { ProductModel } from "../dao/models/product.model.js";
import { CartModel } from "../dao/models/cart.model.js";

const router = Router();

// ================= PURCHASE =================
router.post(
    "/:cid/purchase",
    passport.authenticate("jwt", { session: false }),
    authorizeRole("user"), // 🔥 SOLO USER
    async (req, res) => {
        try {
            const { cid } = req.params;

            const cart = await CartModel.findById(cid).populate("products.product");

            if (!cart) {
                return res.status(404).json({
                    status: "error",
                    message: "Carrito no encontrado"
                });
            }

            let total = 0;
            let productsNotProcessed = [];

            for (const item of cart.products) {

                const product = item.product;

                // 🔐 Validar stock
                if (product.stock >= item.quantity) {
                    product.stock -= item.quantity;
                    await product.save();

                    total += product.price * item.quantity;

                } else {
                    productsNotProcessed.push(product._id);
                }
            }

            // 🔐 Crear ticket SOLO con lo comprado
            const ticket = await TicketModel.create({
                code: Math.random().toString(36).substring(2, 10),
                amount: total,
                purchaser: req.user.email
            });

            // 🔐 Dejar en carrito solo lo NO comprado
            cart.products = cart.products.filter(p =>
                productsNotProcessed.includes(p.product._id)
            );

            await cart.save();

            res.json({
                status: "success",
                ticket,
                productsNotProcessed
            });

        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Error en la compra"
            });
        }
    }
);

export default router;