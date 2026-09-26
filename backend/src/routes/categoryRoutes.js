const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const { createCategoryValidator, updateCategoryValidator } = require('../validators/categoryValidator');

router.get('/', authenticate, categoryController.getCategories);
router.post('/', authenticate, createCategoryValidator, categoryController.createCategory);
router.put('/:id', authenticate, updateCategoryValidator, categoryController.updateCategory);
router.delete('/:id', authenticate, categoryController.deleteCategory);
router.patch('/reorder', authenticate, categoryController.reorderCategories);

module.exports = router;
