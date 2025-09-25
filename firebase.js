/**
 * Configuração do Firebase Admin SDK
 * 
 * Este módulo inicializa o Firebase Admin SDK com as credenciais necessárias
 * para acessar o Firestore e outros serviços do Firebase.
 * 
 * @author Emanuel Ozorio
 * @requires firebase-admin
 * @requires dotenv
 */

// Carrega variáveis de ambiente
require('dotenv').config();

const admin = require('firebase-admin');

/**
 * Valida se todas as variáveis de ambiente necessárias estão presentes
 * @throws {Error} Se alguma variável estiver ausente
 */
function validateEnvironmentVariables() {
    const requiredVars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(`Variáveis de ambiente ausentes: ${missingVars.join(', ')}`);
    }

    // Valida formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(process.env.FIREBASE_CLIENT_EMAIL)) {
        throw new Error('FIREBASE_CLIENT_EMAIL deve ter um formato de email válido');
    }

    // Valida se a private key tem o formato correto
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
        throw new Error('FIREBASE_PRIVATE_KEY deve ser uma chave privada válida');
    }
}

try {
    // Valida variáveis de ambiente antes de inicializar
    validateEnvironmentVariables();

    // Inicializa o Firebase Admin SDK
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Substitui \\n por quebras de linha reais na private key
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        // Opcional: especificar database URL se usando Realtime Database
        // databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`
    });

    console.log('✅ Firebase Admin SDK inicializado com sucesso');

} catch (error) {
    console.error('❌ Erro ao inicializar Firebase Admin SDK:', error.message);
    process.exit(1); // Encerra a aplicação se não conseguir conectar ao Firebase
}

// Instância do Firestore
const db = admin.firestore();

// Configurações do Firestore para melhor performance
db.settings({
    ignoreUndefinedProperties: true, // Ignora propriedades undefined
});

/**
 * Testa a conexão com o Firestore
 * @returns {Promise<boolean>} true se a conexão for bem-sucedida
 */
async function testFirestoreConnection() {
    try {
        // Tenta acessar uma coleção para testar a conexão
        await db.collection('_health_check').limit(1).get();
        console.log('✅ Conexão com Firestore estabelecida com sucesso');
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar com Firestore:', error.message);
        return false;
    }
}

// Testa a conexão na inicialização (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
    testFirestoreConnection();
}

module.exports = { 
    admin, 
    db,
    testFirestoreConnection 
};