import axios from 'axios';

export class MercadoLibreService {
    
    // CAMBIO TOTAL: Ahora usamos DummyJSON como la "Base de Datos Global"
    // Es una API pública gratuita diseñada para simular una tienda real sin bloqueos.
    private static BASE_URL = 'https://dummyjson.com/products/search';

    static async searchProducts(query: string) {
        try {
            console.log(`[INFO] Connecting to Global Product DB (DummyJSON). Query: "${query}"`);

            const response = await axios.get(`${this.BASE_URL}`, {
                params: { q: query },
                timeout: 5000 // Es muy rápida, 5s sobra
            });

            const items = response.data.products;
            console.log(`[INFO] Response received. Items found: ${items.length}`);

            if (items.length === 0) {
                console.warn('[WARN] No products found for this query.');
                return [];
            }

            // Procesamiento de datos de DummyJSON
            const processed = items.map((item: any) => {
                // DummyJSON ya nos da el % de descuento exacto
                const hasDiscount = item.discountPercentage > 1; // Si tiene más de 1% de descuento
                
                // Calculamos cuánto costaba antes (Matemática inversa del descuento)
                // Precio = Original * (1 - %)  --->  Original = Precio / (1 - %)
                const originalPrice = hasDiscount 
                    ? item.price / (1 - (item.discountPercentage / 100))
                    : item.price;

                return {
                    externalId: `GLOBAL-${item.id}`,
                    name: item.title,
                    description: item.description, // ¡Esta API sí nos da descripción!
                    price: item.price,
                    originalPrice: parseFloat(originalPrice.toFixed(2)), // Redondeamos a 2 decimales
                    isOffer: hasDiscount,
                    discountLabel: hasDiscount ? `${Math.round(item.discountPercentage)}% OFF` : null,
                    imageUrl: item.thumbnail,
                    permalink: `https://dummyjson.com/products/${item.id}`, // Enlace al producto en la nube
                    source: 'Global Store API'
                };
            });

            return this.filterAndSortOffers(processed);

        } catch (error: any) {
            console.error(`[ERROR] External API failed: ${error.message}`);
            return [];
        }
    }

    // Lógica para priorizar ofertas (Se mantiene igual de útil)
    private static filterAndSortOffers(products: any[]) {
        const onlyOffers = products.filter((p: any) => p.isOffer === true);

        if (onlyOffers.length > 0) {
            console.log(`[INFO] Found ${onlyOffers.length} offers in catalog.`);
            return onlyOffers; 
        } else {
            // Si no hay ofertas, devolvemos todo lo que encontramos
            console.log('[INFO] No offers found, showing standard catalog.');
            return products; 
        }
    }
}