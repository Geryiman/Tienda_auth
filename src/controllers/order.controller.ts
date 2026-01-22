import { Response } from 'express';
import { OrderService } from '../services/order.service';

export class OrderController {

    static async checkout(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            const { address } = req.body;

            if (!address) {
                return res.status(400).json({ error: 'La dirección de envío es obligatoria' });
            }

            const order = await OrderService.createOrder(userId, address);
            
            res.status(201).json({
                message: '¡Compra exitosa! Gracias por tu preferencia.',
                orderId: order.id,
                total: order.total,
                details: order
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getHistory(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            const orders = await OrderService.getMyOrders(userId);
            res.json(orders);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}