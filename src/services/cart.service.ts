import prisma from '../config/prisma';


export class CartService {

    // Obtener el carrito del usuario (y calcular totales)
    static async getCart(userId: number) {
        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: true }
        });

        // Si no existe carrito, devolvemos uno "virtual" vacío
        if (!cart) {
            return { items: [], total: 0 };
        }

        // Calculamos el total al vuelo
        const total = cart.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        return { ...cart, total };
    }

    // Agregar item al carrito
    static async addToCart(userId: number, productData: any) {
        const { productId, externalId, name, price, imageUrl, quantity = 1 } = productData;

        // 1. Asegurar que el usuario tenga un carrito
        let cart = await prisma.cart.findUnique({ where: { userId } });
        
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId } });
        }

        // 2. VALIDACIÓN DE STOCK
        // Si es un producto local, revisamos que haya suficientes unidades
        if (productId) {
            const productLocal = await prisma.product.findUnique({
                where: { id: parseInt(productId) }
            });

            if (productLocal) {
                // Verificamos cuánto tiene ya en el carrito para no pasarnos
                const itemInCart = await prisma.cartItem.findFirst({
                    where: { cartId: cart.id, productId: parseInt(productId) }
                });

                const currentQty = itemInCart ? itemInCart.quantity : 0;
                const totalDesired = currentQty + quantity;

                if (totalDesired > productLocal.stock) {
                    throw new Error(`Stock insuficiente. Solo quedan ${productLocal.stock} unidades y tú quieres ${totalDesired}.`);
                }
            }
        }

        // 3. Construir condiciones de búsqueda dinámicamente
        const searchConditions: any[] = [];
        if (productId) searchConditions.push({ productId: parseInt(productId) });
        if (externalId) searchConditions.push({ externalId: String(externalId) });

        if (searchConditions.length === 0) {
            throw new Error('Se requiere productId o externalId');
        }

        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                OR: searchConditions
            }
        });

        if (existingItem) {
            // Si ya existe, solo sumamos la cantidad
            return await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity }
            });
        } else {
            // Si es nuevo, creamos el item
            return await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: productId ? parseInt(productId) : null,
                    externalId: externalId ? String(externalId) : null,
                    name,
                    price: parseFloat(price),
                    imageUrl,
                    quantity
                }
            });
        }
    }

    // Eliminar item específico
    static async removeItem(userId: number, itemId: number) {
        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) throw new Error('Carrito no encontrado');

        return await prisma.cartItem.deleteMany({
            where: {
                id: itemId,
                cartId: cart.id
            }
        });
    }

    // Vaciar carrito
    static async clearCart(userId: number) {
        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (cart) {
            await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
    }
}