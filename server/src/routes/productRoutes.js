import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const router = express.Router();

// Знайти категорію по slug, _id або назві
async function findCategory(value) {
  if (!value) return null;

  // По slug
  let cat = await Category.findOne({ slug: value });
  if (cat) return cat;

  // По _id
  if (/^[a-f\d]{24}$/i.test(value)) {
    cat = await Category.findById(value);
    if (cat) return cat;
  }

  // По назві
  cat = await Category.findOne({ name: { $regex: value, $options: 'i' } });
  return cat || null;
}

// створити продукт
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// отримати всі продукти (з фільтрацією)
router.get('/', async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      const category = await findCategory(req.query.category);
      if (!category) {
        return res.json({ success: true, count: 0, data: [] });
      }

      // Шукаємо по ObjectId І по рядку одночасно —
      // бо деякі товари в БД мають category збережену як рядок
      const catObjectId = category._id;
      const catString   = category._id.toString();

      filter.$or = [
        { category: catObjectId },
        { category: catString  },
      ];
    }

    if (req.query.search) {
      const searchCondition = [
        { name:        { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
      // Якщо вже є $or від категорії — обгортаємо в $and
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchCondition }];
        delete filter.$or;
      } else {
        filter.$or = searchCondition;
      }
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    if (req.query.inStock === 'true') {
      filter.stockQuantity = { $gt: 0 };
    }

    // Пагінація
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name slug').skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count:   products.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// отримати продукт за id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// оновити кількість товару
router.patch('/:id/stock', async (req, res) => {
  try {
    const { stockQuantity } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stockQuantity: Number(stockQuantity) },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// Оновити товар повністю (адмін)
router.patch('/:id', async (req, res) => {
  try {
    const allowed = ['name', 'description', 'price', 'discountPercent', 'stockQuantity', 'imageUrl', 'category', 'isActive'];
    const update = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) return res.status(404).json({ success: false, message: 'Товар не знайдено' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Видалити товар (адмін)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Товар не знайдено' });
    res.json({ success: true, message: 'Товар видалено' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
