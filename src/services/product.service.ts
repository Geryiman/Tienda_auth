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
}