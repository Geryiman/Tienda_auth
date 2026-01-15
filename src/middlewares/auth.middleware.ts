import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extendemos la interfaz Request para que pueda llevar datos del usuario
export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
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
        const decoded = jwt.verify(token, secret);
        
        // 4. Guardamos los datos del usuario dentro de la petición (req)
        req.user = decoded;
        
        // 5. Dejamos pasar al usuario
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
};