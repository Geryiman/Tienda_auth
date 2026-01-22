import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { hasRole } from '../middlewares/roles.middleware';

const router = Router();

// 1. Catálogo Híbrido (Público)
// Muestra productos Locales (Arriba) + Mercado Libre (Abajo)
router.get('/', ProductController.getAll);

// 2. Buscador Específico (Público)
router.get('/search', ProductController.searchExternal);

// 3. Crear Producto Local (Privado)
router.post('/', 
    authenticateToken, 
    hasRole(['admin', 'seller']), 
    ProductController.create
);

export default router;