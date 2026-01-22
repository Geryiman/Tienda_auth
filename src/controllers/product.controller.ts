import { Response, Request } from 'express';
import { ProductService } from '../services/product.service';
import { MercadoLibreService } from '../services/mercadolibre.service';

export class ProductController {

    // 1. Crear Producto (Solo Local - Requiere Auth y Rol)
    static async create(req: any, res: Response) {
        try {
            // req.user viene del middleware de autenticación
            const userId = req.user.userId;
            const product = await ProductService.createProduct(userId, req.body);
            
            res.status(201).json({
                message: 'Producto creado exitosamente.',
                data: product
            });
        } catch (error: any) {
            console.error('[ERROR] Create Product:', error);
            res.status(500).json({ error: 'Error interno del servidor.' });
        }
    }

    // 2. Obtener Catálogo Completo (Home Page)
    // Mezcla inventario local + catálogo general externo
    // REGLA DE NEGOCIO: Mostrar ofertas primero, luego el resto del inventario.
    static async getAll(req: Request, res: Response) {
        try {
            console.log('[INFO] Fetching full unified catalog...');

            // Ejecutamos ambas consultas en paralelo para mayor velocidad
            const [localProducts, externalProducts] = await Promise.all([
                ProductService.getAllProducts(),
                MercadoLibreService.searchProducts('') // String vacío trae el catálogo general
            ]);

            // Normalizamos los productos locales para que coincidan con la estructura externa
            const formattedLocal = localProducts.map(p => ({
                ...p,
                source: 'LOCAL_INVENTORY',
                originalPrice: p.price, // Locales no tienen lógica de oferta calculada aquí por defecto
                isOffer: false,
                discountLabel: null
            }));

            // Fusionamos todo en una sola lista
            const unifiedCatalog = [...formattedLocal, ...externalProducts];

            // ORDENAMIENTO INTELIGENTE: Ofertas primero 
            // Si 'isOffer' es true, el producto sube al inicio de la lista.
            // Si ambos son iguales (ambos ofertas o ambos normales), mantiene el orden original.
            unifiedCatalog.sort((a, b) => {
                return (Number(b.isOffer) - Number(a.isOffer));
            });

            res.json({
                message: 'Catálogo cargado correctamente.',
                total_local: localProducts.length,
                total_external: externalProducts.length,
                total_global: unifiedCatalog.length,
                data: unifiedCatalog
            });

        } catch (error: any) {
            console.error('[ERROR] GetAll:', error);
            res.status(500).json({ error: 'Error recuperando el catálogo.' });
        }
    }

    // 3. Buscador Unificado (Search Bar)
    // Busca coincidencias en BD Local y API Externa
    static async searchExternal(req: Request, res: Response) {
        try {
            const query = req.query.q as string;

            if (!query) {
                res.status(400).json({ error: 'El parámetro de búsqueda "q" es requerido.' });
                return;
            }

            console.log(`[INFO] Searching for: "${query}"`);

            // Buscamos en ambos lados simultáneamente
            const [localResults, externalResults] = await Promise.all([
                ProductService.searchLocalProducts(query),
                MercadoLibreService.searchProducts(query)
            ]);

            // Formateamos locales
            const formattedLocal = localResults.map(p => ({
                ...p,
                source: 'LOCAL_INVENTORY',
                originalPrice: p.price,
                isOffer: false
            }));

            // Unificamos
            const unifiedResults = [...formattedLocal, ...externalResults];

            // --- LÓGICA DE "NO ENCONTRADO" (Requisito Clave) ---
            if (unifiedResults.length === 0) {
                res.status(404).json({
                    message: 'Aún no tenemos este producto en tienda.',
                    query: query,
                    suggestion: 'Intenta buscar con términos más generales o en inglés.'
                });
                return;
            }

            // Si hay resultados, también aplicamos el ordenamiento por ofertas aquí
            unifiedResults.sort((a, b) => (Number(b.isOffer) - Number(a.isOffer)));

            // Si hay resultados, los devolvemos
            res.json({
                message: 'Resultados encontrados.',
                count: unifiedResults.length,
                data: unifiedResults
            });

        } catch (error: any) {
            console.error('[ERROR] Search:', error);
            res.status(500).json({ error: 'Error interno durante la búsqueda.' });
        }
    }
}