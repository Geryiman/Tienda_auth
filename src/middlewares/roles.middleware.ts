import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware'; // Importamos el tipo que creamos antes

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    // 1. Verificamos si hay usuario (por seguridad)
    if (!req.user) {
        res.status(500).json({ error: 'User not found in request (Auth middleware missing?)' });
        return;
    }

    // 2. Revisamos los roles que vienen en el token
    const { roles } = req.user;

    if (roles && roles.includes('admin')) {
        // 3. ¡Es Admin! Pase usted.
        next();
    } else {
        // 4. No es Admin. ¡Fuera!
        res.status(403).json({ error: 'Access denied. Admins only.' });
    }
};