import Category from '../models/Category.js';
import Product from '../models/Product.js';


// @desc    Отримати всі активні категорії
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    // Додаємо кількість товарів для кожної категорії
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({
          category: cat._id,
          isActive: true,
        });
        return { ...cat.toJSON(), productCount };
      })
    );

    res.json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Отримати одну категорію за slug
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = async (req, res, next) => {
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

    const productCount = await Product.countDocuments({
      category: category._id,
      isActive: true,
    });

    res.json({
      success: true,
      data: { ...category.toJSON(), productCount },
    });
  } catch (error) {
    next(error);
  }
};

export { getCategories, getCategoryBySlug };
