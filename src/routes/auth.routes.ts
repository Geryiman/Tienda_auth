import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/roles.middleware';

const router = Router();

// Definición de rutas del módulo Auth
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/profile', authenticateToken, AuthController.profile);
// Ruta protegida solo para Admins
router.get('/admin', authenticateToken, isAdmin, AuthController.adminOnly);

// Futuro: router.post('/login', AuthController.login);

export default router;