import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const categories = await Category.find();
  res.json({ success: true, count: categories.length, data: categories });
});

router.post('/', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Видалити категорію
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Не знайдено' });
    res.json({ success: true, message: 'Категорію видалено' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Оновити категорію (назва, slug, опис, фото)
router.patch('/:id', async (req, res) => {
  try {
    const allowed = ['name', 'slug', 'description', 'imageUrl', 'isActive'];
    const update = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ success: false, message: 'Не знайдено' });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
