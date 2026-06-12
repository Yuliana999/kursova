import Product from '../models/Product.js';
import Category from '../models/Category.js';

// @desc    Отримати всі товари (з фільтрацією, пошуком, пагінацією)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      category,   // slug категорії
      search,     // пошук по назві/опису
      minPrice,
      maxPrice,
      inStock,    // "true" — тільки в наявності
      sort = 'createdAt_desc',
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { isActive: true };

    if (category) {
      const isObjectId = /^[a-f\d]{24}$/i.test(category);
      const cat = isObjectId
        ? await Category.findById(category)
        : await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (inStock === 'true') {
      filter.stockQuantity = { $gt: 0 };
    }

    const sortMap = {
      createdAt_desc:      { createdAt: -1 },
      createdAt_asc:       { createdAt: 1 },
      price_asc:           { price: 1 },
      price_desc:          { price: -1 },
      name_asc:            { name: 1 },
      discountPercent_desc:{ discountPercent: -1 },
    };
    const sortOption = sortMap[sort] || { createdAt: -1 };

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Отримати один товар за ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не знайдено',
      });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Отримати товари за категорією (slug)
// @route   GET /api/products/category/:slug
// @access  Public
export const getProductsByCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категорію не знайдено',
      });
    }

    const { sort = 'createdAt_desc', page = 1, limit = 12 } = req.query;

    const sortMap = {
      createdAt_desc:      { createdAt: -1 },
      price_asc:           { price: 1 },
      price_desc:          { price: -1 },
      name_asc:            { name: 1 },
      discountPercent_desc:{ discountPercent: -1 },
    };

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const filter = { category: category._id, isActive: true };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sortMap[sort] || { createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      category: { name: category.name, slug: category.slug },
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
