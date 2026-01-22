import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/', OrderController.checkout);    // Crear orden (Pagar)
router.get('/', OrderController.getHistory);   // Ver mi historial

export default router;