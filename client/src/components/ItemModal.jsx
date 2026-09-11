import React, { useState, useEffect } from 'react';
import { X, Save, PlusCircle, Sparkles } from 'lucide-react';

export default function ItemModal({ isOpen, onClose, onSave, itemToEdit, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Development',
    status: 'pending',
    priority: 'medium',
    tags: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        title: itemToEdit.title || '',
        description: itemToEdit.description || '',
        category: itemToEdit.category || 'Development',
        status: itemToEdit.status || 'pending',
        priority: itemToEdit.priority || 'medium',
        tags: Array.isArray(itemToEdit.tags) ? itemToEdit.tags.join(', ') : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'Development',
        status: 'pending',
        priority: 'medium',
        tags: '',
      });
    }
    setErrors({});
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    const payload = {
      ...formData,
      tags: formData.tags
        ? formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };

    onSave(payload);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900/90 border border-white/10 p-6 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 mb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              {itemToEdit ? <Sparkles size={20} /> : <PlusCircle size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">
                {itemToEdit ? 'Edit MERN Item' : 'Create New Item'}
              </h2>
              <p className="text-xs text-slate-400">
                {itemToEdit ? 'Update details in your database' : 'Save a new record to your MongoDB collection'}
              </p>
            </div>
          </div>
          <button 
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-xs font-semibold text-slate-300">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Implement user authentication"
              className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-950/60 border ${
                errors.title ? 'border-red-500' : 'border-white/10 focus:border-indigo-500'
              } text-white text-sm outline-none transition-colors`}
              autoFocus
            />
            {errors.title && <span className="text-[11px] text-red-400">{errors.title}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-xs font-semibold text-slate-300">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide context, acceptance criteria, or requirements..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/60 border border-white/10 focus:border-indigo-500 text-white text-sm outline-none transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="category" className="text-xs font-semibold text-slate-300">
                Category
              </label>
              <select 
                id="category" 
                name="category" 
                value={formData.category} 
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-white/10 focus:border-indigo-500 text-white text-xs outline-none cursor-pointer"
              >
                <option value="General">General</option>
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="status" className="text-xs font-semibold text-slate-300">
                Status
              </label>
              <select 
                id="status" 
                name="status" 
                value={formData.status} 
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-white/10 focus:border-indigo-500 text-white text-xs outline-none cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="priority" className="text-xs font-semibold text-slate-300">
                Priority
              </label>
              <select 
                id="priority" 
                name="priority" 
                value={formData.priority} 
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-white/10 focus:border-indigo-500 text-white text-xs outline-none cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="tags" className="text-xs font-semibold text-slate-300">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="react, tailwind, node, api"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/60 border border-white/10 focus:border-indigo-500 text-white text-sm outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-white/10">
            <button
              type="button"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white shadow-lg transition-all disabled:opacity-50"
              disabled={isSubmitting}
              id="btn-save-item"
            >
              <Save size={14} />
              <span>{isSubmitting ? 'Saving...' : itemToEdit ? 'Update Item' : 'Create Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
