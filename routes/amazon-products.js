const express = require('express');
const router = express.Router();
const { db, admin } = require('../firebase');
const { searchItems } = require('../paapi');

router.get("/search", async (req, res) => {
    try {
        const query = req.query.query;
        const itemCount = req.query.itemCount;

        if (!query) return res.status(400).send("Missing query");

        const docRef = db.collection("amazonAds").doc(query);
        const doc = await docRef.get();

        const isStale = !doc.exists || Date.now() - doc.data()?.updatedAt.toMillis() > 24 * 60 * 60 * 1000;

        if (!isStale) {
            return res.json(doc.data().products);
        }
        
        const products = await searchItems({query, itemCount});

        await docRef.set({
            keyword: query,
            updatedAt: admin.firestore.Timestamp.now(),
            products
        })

        return res.json(products)
    } catch (error) {
        console.error("Erro PAAPI:", error);
        return res.status(500).send("Erro ao buscar produtos");
    }
});

module.exports = router;
