const errorHandler = (err, req, res, next) => {
  console.error(`❌ ${err.message}`);

  // Mongoose — невалідний ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Невалідний ідентифікатор',
    });
  }

  // Mongoose — дублікат унікального поля
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `Поле "${field}" вже існує`,
    });
  }

  // Mongoose — помилка валідації
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join('; '),
    });
  }

  // Загальна помилка
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Внутрішня помилка сервера',
  });
};

export default errorHandler;
