import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const hasRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            // Validación de seguridad: ¿Hay usuario?
            if (!req.user || !req.user.roles) {
                return res.status(403).json({ error: 'Acceso denegado: No se detectaron roles.' });
            }

            const userRoles = req.user.roles; // Ej: ['seller']
            
            // Verificamos si AL MENOS UNO de los roles del usuario está permitido
            const hasPermission = userRoles.some((role: string) => allowedRoles.includes(role));

            if (!hasPermission) {
                console.log(`Bloqueo de Rol. Usuario tiene: [${userRoles}] - Se requiere: [${allowedRoles}]`);
                return res.status(403).json({ 
                    error: `Acceso denegado. Tu rol (${userRoles}) no tiene permiso para esta acción.` 
                });
            }

            next();
        } catch (error) {
            console.error('Error en middleware de roles:', error);
            res.status(500).json({ error: 'Error interno verificando permisos' });
        }
    };
};