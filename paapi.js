/**
 * Integração com Amazon Product Advertising API (PAAPI 5.0)
 * 
 * Este módulo fornece funcionalidades para buscar produtos na Amazon
 * usando a API oficial de publicidade de produtos.
 * 
 * @author Emanuel Ozorio
 * @requires paapi5-nodejs-sdk
 * @requires dotenv
 */

// Carrega variáveis de ambiente
require('dotenv').config();

const ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk');

/**
 * Valida se todas as variáveis de ambiente necessárias estão presentes
 * @throws {Error} Se alguma variável estiver ausente
 */
function validateAmazonCredentials() {
    const requiredVars = [
        'AMAZON_ACCESS_KEY',
        'AMAZON_SECRET_KEY',
        'AMAZON_PARTNER_TAG'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(`Credenciais Amazon ausentes: ${missingVars.join(', ')}`);
    }
}

// Valida credenciais na inicialização
validateAmazonCredentials();

// Configuração do cliente da API
const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance;

defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY;
defaultClient.secretKey = process.env.AMAZON_SECRET_KEY;
defaultClient.host = 'webservices.amazon.com.br';
defaultClient.region = 'us-east-1';

const api = new ProductAdvertisingAPIv1.DefaultApi();

/**
 * Valida os parâmetros de entrada da busca
 * @param {Object} params - Parâmetros da busca
 * @param {string} params.query - Palavras-chave da busca
 * @param {number|string} params.itemCount - Número de itens retornados
 * @throws {Error} Se os parâmetros forem inválidos
 */
function validateSearchParams({ query, itemCount }) {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
        throw new Error('Query deve ser uma string não vazia');
    }

    const parsedItemCount = parseInt(itemCount, 10);
    if (Number.isNaN(parsedItemCount) || parsedItemCount < 1 || parsedItemCount > 50) {
        throw new Error('ItemCount deve ser um número entre 1 e 50');
    }
}

/**
 * Formata um item individual retornado pela API da Amazon
 * @param {Object} item - Item retornado pela API
 * @returns {Object} Item formatado
 */
function formatAmazonItem(item) {
    if (!item) return null;

    return {
        asin: item?.ASIN || null,
        url: item?.DetailPageURL || null,
        title: item?.ItemInfo?.Title?.DisplayValue || 'Título não disponível',
        image: item?.Images?.Primary?.Medium?.URL || null,
        // Corrigido: usar || ao invés de | (operador bitwise)
        price: item?.Offers?.Listings?.[0]?.Price?.Amount || null,
        priceFormatted: item?.Offers?.Listings?.[0]?.Price?.DisplayAmount || null,
        currency: item?.Offers?.Listings?.[0]?.Price?.Currency || 'BRL',
        // Corrigido: usar || ao invés de | (operador bitwise)
        savingBasis: item?.Offers?.Listings?.[0]?.SavingBasis?.Amount || null,
        savingBasisFormatted: item?.Offers?.Listings?.[0]?.SavingBasis?.DisplayAmount || null,
        isPrimeEligible: item?.Offers?.Listings?.[0]?.ProgramEligibility?.IsPrimeExclusive || false,
        availability: item?.Offers?.Listings?.[0]?.Availability?.Type || 'Unknown',
        // Adiciona informações extras úteis
        brand: item?.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || null,
        manufacturer: item?.ItemInfo?.ByLineInfo?.Manufacturer?.DisplayValue || null,
        model: item?.ItemInfo?.TechnicalDetails?.find(detail => 
            detail.Name === 'Model Number')?.Value?.DisplayValue || null
    };
}

/**
 * Realiza uma busca na Amazon usando o PAAPI 5.0
 * @param {Object} params - Parâmetros da busca
 * @param {string} params.query - Palavras-chave da busca
 * @param {number|string} params.itemCount - Número de itens retornados (1-50)
 * @param {string} [params.searchIndex='All'] - Índice de busca (All, Electronics, Books, etc.)
 * @param {string} [params.merchant='Amazon'] - Comerciante (Amazon, All)
 * @returns {Promise<Array>} Array de produtos encontrados
 * @throws {Error} Se houver erro na API ou parâmetros inválidos
 */
async function searchItems({ query, itemCount, searchIndex = 'All', merchant = 'Amazon' }) {
    try {
        // Valida parâmetros de entrada
        validateSearchParams({ query, itemCount });

        const request = new ProductAdvertisingAPIv1.SearchItemsRequest();
        
        const parsedItemCount = parseInt(itemCount, 10);

        // Configuração da requisição
        request['PartnerTag'] = process.env.AMAZON_PARTNER_TAG;
        request['PartnerType'] = 'Associates';
        request['Marketplace'] = 'www.amazon.com.br';
        request['Merchant'] = merchant;
        request['Keywords'] = String(query).trim();
        request['SearchIndex'] = searchIndex;
        request['ItemCount'] = parsedItemCount;
        
        // Recursos solicitados da API (otimizado para incluir mais informações úteis)
        request['Resources'] = [
            'ItemInfo.Title',
            'ItemInfo.ByLineInfo',
            'ItemInfo.TechnicalDetails',
            'Offers.Listings.Price',
            'Offers.Listings.SavingBasis',
            'Offers.Listings.ProgramEligibility.IsPrimeExclusive',
            'Offers.Listings.Availability.Type',
            'Images.Primary.Medium',
            'Images.Primary.Large'
        ];

        console.log(`🔍 Buscando produtos na Amazon: "${query}" (${parsedItemCount} itens)`);

        // Executa a requisição para a API
        const response = await new Promise((resolve, reject) => {
            api.searchItems(request, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });

        const result = ProductAdvertisingAPIv1.SearchItemsResponse.constructFromObject(response);
        
        // Verifica se há itens retornados
        const items = result?.SearchResult?.Items;
        if (!items || items.length === 0) {
            console.warn(`⚠️  Nenhum produto encontrado para: "${query}"`);
            
            // Log detalhado para debug (apenas em desenvolvimento)
            if (process.env.NODE_ENV === 'development') {
                console.warn('Resposta completa da API:', JSON.stringify(result, null, 2));
            }
            
            return [];
        }

        console.log(`✅ ${items.length} produto(s) encontrado(s) para: "${query}"`);

        // Formata e filtra itens válidos
        return items
            .map(formatAmazonItem)
            .filter(item => item !== null && item.asin); // Remove itens inválidos

    } catch (error) {
        console.error(`❌ Erro na busca Amazon para "${query}":`, error.message);
        
        // Log detalhado para debug
        if (process.env.NODE_ENV === 'development') {
            console.error('Erro completo:', JSON.stringify(error, null, 2));
        }

        // Re-propaga o erro com contexto adicional
        const enhancedError = new Error(`Falha na busca Amazon: ${error.message}`);
        enhancedError.originalError = error;
        enhancedError.query = query;
        enhancedError.itemCount = itemCount;
        
        throw enhancedError;
    }
}

/**
 * Testa a conexão com a API da Amazon
 * @returns {Promise<boolean>} true se a conexão for bem-sucedida
 */
async function testAmazonConnection() {
    try {
        await searchItems({ query: 'test', itemCount: 1 });
        console.log('✅ Conexão com Amazon PAAPI estabelecida com sucesso');
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar com Amazon PAAPI:', error.message);
        return false;
    }
}

module.exports = { 
    searchItems,
    testAmazonConnection,
    validateAmazonCredentials 
};