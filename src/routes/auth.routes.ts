import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

// Definición de rutas del módulo Auth
router.post('/register', AuthController.register);

// Futuro: router.post('/login', AuthController.login);

export default router;