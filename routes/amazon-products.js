/**
 * Rotas para busca de produtos da Amazon
 * 
 * Este módulo define as rotas relacionadas à busca de produtos na Amazon,
 * implementando cache inteligente no Firestore para otimizar performance
 * e reduzir chamadas desnecessárias à API da Amazon.
 * 
 * @author Emanuel Ozorio
 */

const express = require('express');
const router = express.Router();
const { db, admin } = require('../firebase');
const { searchItems } = require('../paapi');

// Constantes de configuração
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
const DEFAULT_ITEM_COUNT = 10;
const MAX_ITEM_COUNT = 50;

/**
 * Valida os parâmetros da requisição de busca
 * @param {Object} queryParams - Parâmetros da query string
 * @returns {Object} Parâmetros validados e sanitizados
 * @throws {Error} Se os parâmetros forem inválidos
 */
function validateSearchRequest(queryParams) {
    const { query, itemCount } = queryParams;

    // Valida query obrigatória
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
        throw new Error('Parâmetro "query" é obrigatório e deve ser uma string não vazia');
    }

    // Valida e sanitiza itemCount
    let parsedItemCount = parseInt(itemCount, 10);
    if (Number.isNaN(parsedItemCount) || parsedItemCount < 1) {
        parsedItemCount = DEFAULT_ITEM_COUNT;
    } else if (parsedItemCount > MAX_ITEM_COUNT) {
        parsedItemCount = MAX_ITEM_COUNT;
    }

    return {
        query: query.trim().toLowerCase(), // Normaliza para cache consistente
        itemCount: parsedItemCount,
        originalQuery: query.trim() // Mantém query original para busca
    };
}

/**
 * Verifica se os dados do cache ainda são válidos
 * @param {Object} cachedData - Dados recuperados do cache
 * @returns {boolean} true se os dados ainda são válidos
 */
function isCacheValid(cachedData) {
    if (!cachedData || !cachedData.updatedAt) {
        return false;
    }

    const cacheAge = Date.now() - cachedData.updatedAt.toMillis();
    return cacheAge < CACHE_DURATION_MS;
}

/**
 * Cria uma chave única para o cache baseada nos parâmetros da busca
 * @param {string} query - Query de busca
 * @param {number} itemCount - Número de itens
 * @returns {string} Chave única para o cache
 */
function createCacheKey(query, itemCount) {
    // Usa hash simples para criar chave consistente
    return `${query.toLowerCase()}_${itemCount}`;
}

/**
 * GET /amazon-products/search
 * 
 * Busca produtos da Amazon com cache inteligente no Firestore.
 * Se os dados estiverem em cache e válidos (< 24h), retorna do cache.
 * Caso contrário, busca na API da Amazon e atualiza o cache.
 * 
 * Query Parameters:
 * - query (string, obrigatório): Palavras-chave para busca
 * - itemCount (number, opcional): Número de itens (1-50, padrão: 10)
 * 
 * Responses:
 * - 200: Array de produtos encontrados
 * - 400: Parâmetros inválidos
 * - 500: Erro interno do servidor
 */
router.get("/search", async (req, res) => {
    const startTime = Date.now();
    let fromCache = false;

    try {
        // Valida e sanitiza parâmetros da requisição
        const { query, itemCount, originalQuery } = validateSearchRequest(req.query);
        
        console.log(`🔍 Iniciando busca: "${originalQuery}" (${itemCount} itens)`);

        // Cria chave única para o cache
        const cacheKey = createCacheKey(query, itemCount);
        const docRef = db.collection("amazonAds").doc(cacheKey);
        
        // Tenta recuperar dados do cache
        const doc = await docRef.get();
        const cachedData = doc.exists ? doc.data() : null;

        // Verifica se pode usar dados do cache
        if (cachedData && isCacheValid(cachedData)) {
            fromCache = true;
            console.log(`💾 Dados recuperados do cache: "${originalQuery}"`);
            
            // Adiciona metadados de cache na resposta
            return res.json({
                products: cachedData.products,
                metadata: {
                    source: 'cache',
                    cachedAt: cachedData.updatedAt.toDate().toISOString(),
                    itemCount: cachedData.products.length,
                    query: originalQuery,
                    processingTime: `${Date.now() - startTime}ms`
                }
            });
        }

        console.log(`🌐 Buscando na API da Amazon: "${originalQuery}"`);
        
        // Busca produtos na API da Amazon
        const products = await searchItems({
            query: originalQuery,
            itemCount
        });

        // Dados para salvar no cache
        const cacheData = {
            keyword: originalQuery,
            normalizedKeyword: query,
            itemCount,
            updatedAt: admin.firestore.Timestamp.now(),
            products,
            totalFound: products.length
        };

        // Salva no cache (fire-and-forget para não atrasar resposta)
        docRef.set(cacheData).catch(error => {
            console.error('Erro ao salvar no cache:', error.message);
            // Não propaga o erro pois a busca foi bem-sucedida
        });

        console.log(`✅ Busca concluída: ${products.length} produto(s) encontrado(s)`);

        // Retorna produtos com metadados
        return res.json({
            products,
            metadata: {
                source: 'amazon_api',
                searchedAt: new Date().toISOString(),
                itemCount: products.length,
                query: originalQuery,
                processingTime: `${Date.now() - startTime}ms`
            }
        });

    } catch (error) {
        const processingTime = Date.now() - startTime;
        
        console.error(`❌ Erro na busca (${processingTime}ms):`, error.message);

        // Determina status code baseado no tipo de erro
        let statusCode = 500;
        let errorMessage = 'Erro interno do servidor';

        if (error.message.includes('obrigatório') || error.message.includes('inválido')) {
            statusCode = 400;
            errorMessage = error.message;
        } else if (error.message.includes('Amazon')) {
            statusCode = 503; // Service Unavailable
            errorMessage = 'Serviço da Amazon temporariamente indisponível';
        }

        return res.status(statusCode).json({
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            metadata: {
                processingTime: `${processingTime}ms`,
                timestamp: new Date().toISOString(),
                fromCache
            }
        });
    }
});

/**
 * GET /amazon-products/health
 * 
 * Endpoint de health check específico para o serviço de produtos Amazon
 */
router.get("/health", async (req, res) => {
    try {
        // Testa conexão básica com Firestore
        await db.collection('_health_check').limit(1).get();
        
        res.json({
            status: 'OK',
            service: 'amazon-products',
            cache: 'operational',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            service: 'amazon-products',
            error: 'Cache unavailable',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * DELETE /amazon-products/cache/:query
 * 
 * Remove dados específicos do cache (útil para desenvolvimento/debug)
 * Disponível apenas em ambiente de desenvolvimento
 */
if (process.env.NODE_ENV === 'development') {
    router.delete("/cache/:query", async (req, res) => {
        try {
            const { query } = req.params;
            const { itemCount = DEFAULT_ITEM_COUNT } = req.query;
            
            const cacheKey = createCacheKey(query, parseInt(itemCount, 10));
            const docRef = db.collection("amazonAds").doc(cacheKey);
            
            await docRef.delete();
            
            res.json({
                message: 'Cache removido com sucesso',
                cacheKey,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                error: 'Erro ao remover cache',
                details: error.message
            });
        }
    });
}

module.exports = router;
