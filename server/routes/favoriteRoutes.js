// server/routes/favoriteRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');

const fav = require('../controllers/favoriteController');

// Services
router.get('/services', verifyToken, fav.getFavServices);
router.get('/services/:id', verifyToken, fav.isFavService);
router.post('/services/:id', verifyToken, fav.addFavService);
router.delete('/services/:id', verifyToken, fav.removeFavService);

// Maids
router.get('/maids', verifyToken, fav.getFavMaids);
router.post('/maids/:id', verifyToken, fav.addFavMaid);
router.delete('/maids/:id', verifyToken, fav.removeFavMaid);

module.exports = router;
