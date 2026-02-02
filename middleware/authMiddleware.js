// Middleware to authenticate JWT tokens
export function authMiddleware(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: "No token provided or invalid token" });
    }
    next();
}
