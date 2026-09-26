import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { Plus, ChevronUp, ChevronDown, Edit2, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';

const Categories = () => {
  const { allCategories, addCategory, updateCategory, deleteCategory, reorderCategories, loading } = useApp();
  const { success, error: showError } = useToast();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '#6b7280' });
  const [errors, setErrors] = useState({});

  const activeCategories = allCategories.filter(c => c.active).sort((a, b) => a.order - b.order);

  const colorOptions = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1',
    '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#6b7280',
  ];

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setErrors({ name: 'Category name is required' });
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        success('Category updated successfully');
        setEditingCategory(null);
      } else {
        await addCategory(formData);
        success('Category added successfully');
        setShowAddModal(false);
      }

      setFormData({ name: '', color: '#6b7280' });
      setErrors({});
    } catch (error) {
      console.error('Failed to save category:', error);
      setErrors({ name: error.message || 'Failed to save category' });
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, color: category.color });
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to deactivate this category?')) {
      try {
        await deleteCategory(categoryId);
        success('Category deactivated');
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newOrder = [...activeCategories];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    newOrder.forEach((cat, i) => cat.order = i + 1);
    reorderCategories(newOrder.concat(allCategories.filter(c => !c.active)));
  };

  const moveDown = (index) => {
    if (index === activeCategories.length - 1) return;
    const newOrder = [...activeCategories];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    newOrder.forEach((cat, i) => cat.order = i + 1);
    reorderCategories(newOrder.concat(allCategories.filter(c => !c.active)));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Categories</h1>
          <p className="text-neutral-600">Organize your expenses with custom categories</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center">
          <Plus size={18} strokeWidth={2} className="mr-2" />
          Add Category
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {activeCategories.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-neutral-500 mb-4">No categories yet. Add your first category to get started!</p>
            <Button onClick={() => setShowAddModal(true)} className="flex items-center mx-auto">
              <Plus size={18} strokeWidth={2} className="mr-2" />
              Add Category
            </Button>
          </div>
        ) : (
          activeCategories.map((category, index) => (
            <div key={category.id} className="flex items-center justify-between p-4 border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
              <div className="flex items-center flex-1">
                <div className="flex flex-col mr-3">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="text-neutral-400 hover:text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed p-1"
                  >
                    <ChevronUp size={14} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === activeCategories.length - 1}
                    className="text-neutral-400 hover:text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed p-1"
                  >
                    <ChevronDown size={14} strokeWidth={2} />
                  </button>
                </div>
                <div
                  className="w-12 h-12 rounded-full mr-4"
                  style={{ backgroundColor: category.color }}
                />
                <div>
                  <p className="text-sm font-medium text-neutral-900">{category.name}</p>
                  <div className="flex items-center mt-1">
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                    <span className="text-xs text-neutral-500">{category.color}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="px-3 py-1.5 text-sm text-neutral-700 hover:text-neutral-900 inline-flex items-center rounded hover:bg-neutral-100"
                >
                  <Edit2 size={14} strokeWidth={1.8} className="mr-1.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 inline-flex items-center rounded hover:bg-red-50"
                >
                  <Trash2 size={14} strokeWidth={1.8} className="mr-1.5" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormData({ name: '', color: '#6b7280' });
          setErrors({});
        }}
        title="Add Category"
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            placeholder="e.g., Groceries"
            required
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(color => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-full transition-transform ${
                    formData.color === color ? 'ring-2 ring-neutral-900 ring-offset-2 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Category</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={editingCategory !== null}
        onClose={() => {
          setEditingCategory(null);
          setFormData({ name: '', color: '#6b7280' });
          setErrors({});
        }}
        title="Edit Category"
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(color => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-full transition-transform ${
                    formData.color === color ? 'ring-2 ring-neutral-900 ring-offset-2 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
