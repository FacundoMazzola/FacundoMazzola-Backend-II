export const authorizeRole = (...roles) => {
    return (req, res, next) => {

        // 🔐 Verifica autenticación
        if (!req.user) {
            return res.status(401).json({
                status: "error",
                message: "No autenticado"
            });
        }

        // 🔐 Verifica rol
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: "error",
                message: "No autorizado"
            });
        }

        next();
    };
};