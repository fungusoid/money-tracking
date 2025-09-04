import React, { useState } from 'react';

function CategoryManager({ categories, onAddCategory }) {
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#757575'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    onAddCategory(newCategory);
    setNewCategory({
      name: '',
      color: '#757575'
    });
  };

  const predefinedColors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7',
    '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
    '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
    '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'
  ];

  return (
    <div className="category-manager">
      <div className="add-category">
        <h2>Add New Category</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Category Name *</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Enter category name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              <input
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
              />
              <div className="predefined-colors">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${newCategory.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewCategory({ ...newCategory, color })}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Add Category
          </button>
        </form>
      </div>

      <div className="category-lists">
        <div className="category-section">
          <h3>All Categories ({categories.length})</h3>
          <div className="category-grid">
            {categories.map(category => (
              <div key={category.id} className="category-card">
                <div 
                  className="category-color" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="category-name">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryManager;
