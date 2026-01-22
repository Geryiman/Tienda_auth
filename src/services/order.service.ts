import prisma from '../config/prisma';

export class OrderService {

    static async createOrder(userId: number, address: string) {
        // 1. Obtener el carrito actual
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: true }
        });

        if (!cart || cart.items.length === 0) {
            throw new Error('El carrito está vacío. No se puede crear la orden.');
        }

        // 2. Calcular total final (Doble verificación por seguridad)
        const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // 3. TRANSACCIÓN ATÓMICA (Todo o nada)
        const order = await prisma.$transaction(async (tx) => {
            
            // A. VALIDACIÓN FINAL DE STOCK (Doble check)
            // Antes de cobrar, verificamos que nadie nos ganó el producto
            for (const item of cart.items) {
                if (item.productId) { // Solo para productos locales que tienen stock en BD
                    const product = await tx.product.findUnique({ where: { id: item.productId } });
                    
                    if (!product || product.stock < item.quantity) {
                        throw new Error(`Lo sentimos, el producto '${item.name}' ya no tiene suficiente stock.`);
                    }
                }
            }

            // B. Crear la Orden (El registro de venta para el vendedor/admin)
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    total,
                    address,
                    status: 'PAID',
                    items: {
                        create: cart.items.map(item => ({
                            productId: item.productId,
                            externalId: item.externalId,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity
                        }))
                    }
                },
                include: { items: true }
            });

            // C. RESTAR STOCK (Aquí sucede la magia 📉)
            // No borramos el producto, solo bajamos la cantidad disponible.
            for (const item of cart.items) {
                if (item.productId) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { 
                            stock: { decrement: item.quantity } // Resta automática
                        }
                    });
                }
            }

            // D. Vaciar el carrito
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id }
            });

            return newOrder;
        });

        return order;
    }

    // Ver historial de mis compras
    static async getMyOrders(userId: number) {
        return await prisma.order.findMany({
            where: { userId },
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
    }
}