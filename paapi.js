require('dotenv').config()

const ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk');

const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance;

defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY;
defaultClient.secretKey = process.env.AMAZON_SECRET_KEY;
defaultClient.host = 'webservices.amazon.com.br';
defaultClient.region = 'us-east-1';

const api = new ProductAdvertisingAPIv1.DefaultApi();

/**
 * Realiza uma busca na Amazon usando o PAAPI 5.0
 * @param {string} keywords - Palavras-chave da busca
 * @param {number} itemCount - Número de itens retornados
 * @returns {Promise<Object>} - Resultado da busca
 */
async function searchItems({ query, itemCount}) {
    const request = new ProductAdvertisingAPIv1.SearchItemsRequest();
    
    const parsedItemCount = parseInt(itemCount, 10);

    request['PartnerTag'] = process.env.AMAZON_PARTNER_TAG;
    request['PartnerType'] = 'Associates';
    request['Marketplace'] = 'www.amazon.com.br';
    request['Merchant'] = 'Amazon'
    request['Keywords'] = String(query || '').trim();
    request['SearchIndex'] = 'All';
    request['ItemCount'] = Number.isNaN(parsedItemCount) ? 1 : parsedItemCount;
    request['Resources'] = ['ItemInfo.Title', 'Offers.Listings.Price', 'Offers.Listings.SavingBasis', 'Images.Primary.Medium'];

    try {
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
        
        const items = result?.SearchResult?.Items;
        if (!items) {
            console.warn('Nenhum item retornado pela Amazon:', JSON.stringify(result, null, 2));
            return [];
        }

        return items.map(item => ({
            asin: item?.ASIN,
            url: item?.DetailPageURL,
            title: item?.ItemInfo?.Title?.DisplayValue,
            image: item?.Images?.Primary?.Medium?.URL,
            price: item?.Offers?.Listings?.[0]?.Price?.Amount | '',
            basis: item?.Offers?.Listings?.[0]?.SavingBasis?.Amount | ''
        }));
    } catch (error) {
        console.error('Erro na busca Amazon:', JSON.stringify(error, null, 2));
        throw error;
    }
}

module.exports = { searchItems };