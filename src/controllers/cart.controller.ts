import { Response } from 'express';
import { CartService } from '../services/cart.service';

export class CartController {

    static async getMyCart(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            const cart = await CartService.getCart(userId);
            res.json(cart);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async addItem(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            // Esperamos que el body tenga: { productId?, externalId?, name, price, imageUrl }
            const item = await CartService.addToCart(userId, req.body);
            res.status(200).json({ message: 'Producto agregado', item });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async removeItem(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            const itemId = parseInt(req.params.id);
            await CartService.removeItem(userId, itemId);
            res.json({ message: 'Item eliminado del carrito' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}