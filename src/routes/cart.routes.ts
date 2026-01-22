import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Todas estas rutas requieren estar logueado
router.use(authenticateToken);

router.get('/', CartController.getMyCart);       // Ver mi carrito
router.post('/', CartController.addItem);        // Agregar producto
router.delete('/:id', CartController.removeItem);// Quitar producto por ID de Item

export default router;