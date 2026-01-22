import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { hasRole } from '../middlewares/roles.middleware'; // 1. Cambiamos el import

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/profile', authenticateToken, AuthController.profile);

// RUTA VIP
// 2. Usamos hasRole
router.get('/admin', authenticateToken, hasRole(['admin']), AuthController.adminOnly);

export default router;