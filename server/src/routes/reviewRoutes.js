import express from 'express';
import Review from '../models/Review.js';

const router = express.Router({ mergeParams: true }); // mergeParams to get :productId

// GET /api/products/:productId/reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .sort({ createdAt: -1 });

    const count = reviews.length;
    const avgRating = count
      ? +(reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)
      : 0;

    res.json({ success: true, count, avgRating, data: reviews });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/products/:productId/reviews  (потребує userId у body)
router.post('/', async (req, res) => {
  try {
    const { userId, userName, rating, comment } = req.body;

    if (!userId || !userName) {
      return res.status(401).json({ success: false, message: 'Потрібна авторизація' });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Оцінка має бути від 1 до 5' });
    }

    // userId може бути рядком 'admin' (не ObjectId) — зберігаємо як userIdStr
    const userIdStr = String(userId);
    const isAdmin = userId === 'admin';

    const reviewData = {
      product: req.params.productId,
      userIdStr,
      userName,
      rating: Number(rating),
      comment: comment || '',
    };

    // Якщо не адмін — зберігаємо user як ObjectId
    if (!isAdmin) {
      reviewData.user = userId;
    }

    // Оновити або створити (upsert по userIdStr)
    const review = await Review.findOneAndUpdate(
      { product: req.params.productId, userIdStr },
      reviewData,
      { upsert: true, new: true, runValidators: false, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, data: review });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
