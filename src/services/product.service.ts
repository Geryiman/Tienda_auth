import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProductService {
    
    // Crear producto
    static async createProduct(userId: number, data: any) {
        return await prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                price: parseFloat(data.price),
                stock: parseInt(data.stock),
                imageUrl: data.imageUrl,
                userId: userId
            }
        });
    }

    // Listar TODOS los productos locales
    static async getAllProducts() {
        return await prisma.product.findMany({
            where: { isActive: true },
            include: {
                user: { select: { email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // NUEVO: Buscar productos locales por nombre o descripción
    // Esto es necesario para el buscador unificado
    static async searchLocalProducts(query: string) {
        return await prisma.product.findMany({
            where: {
                isActive: true,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            },
            include: {
                user: { select: { email: true } }
            }
        });
    }
      static async getSellerInventory(userId: number) {
        // 1. Obtener mis productos
        const products = await prisma.product.findMany({
            where: { 
                userId: userId,
                isActive: true 
            },
            orderBy: { stock: 'asc' }
        });

        // 2. Extraer los IDs para consultar ventas
        const productIds = products.map(p => p.id);

        // 3. Calcular ventas: Agrupamos por productId y sumamos la cantidad vendida
        // Esto busca en la tabla de OrderItems
        const salesStats = await prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true // Sumamos cuántos se vendieron
            },
            where: {
                productId: { in: productIds } // Solo de mis productos
            }
        });

        // 4. Fusionar la información
        return products.map(p => {
            // Buscamos si este producto tiene ventas registradas
            const stat = salesStats.find(s => s.productId === p.id);
            const totalSold = stat?._sum.quantity || 0; // Si no hay ventas, es 0

            return {
                ...p,
                sold: totalSold // Agregamos este dato extra
            };
        });
    }
}