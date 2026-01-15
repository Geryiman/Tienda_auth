"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    // 1. Buscamos el header "Authorization"
    const authHeader = req.headers['authorization'];
    // 2. El cliente debe enviar: "Bearer TOKEN_AQUI"
    // Separamos la palabra "Bearer" del token real
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Access denied. Token missing.' });
        return;
    }
    try {
        const secret = process.env.JWT_SECRET || 'secret_default';
        // 3. Verificamos que el token sea original
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // 4. Guardamos los datos del usuario dentro de la petición (req)
        req.user = decoded;
        // 5. Dejamos pasar al usuario
        next();
    }
    catch (error) {
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
};
exports.authenticateToken = authenticateToken;
