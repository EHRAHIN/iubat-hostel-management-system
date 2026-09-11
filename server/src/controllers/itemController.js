const Item = require('../models/Item');
const mongoose = require('mongoose');

// In-memory fallback storage for when MongoDB is temporarily disconnected
let fallbackItems = [
  {
    _id: 'sample-1',
    title: 'Initialize MERN Stack Architecture',
    description: 'Set up Express server, React Vite client, MongoDB models and connection handlers.',
    category: 'Development',
    status: 'completed',
    priority: 'high',
    tags: ['mern', 'setup', 'fullstack'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'sample-2',
    title: 'Design Modern Glassmorphism UI',
    description: 'Craft responsive components with CSS variables, rich animations, and theme support.',
    category: 'Design',
    status: 'completed',
    priority: 'medium',
    tags: ['ui', 'css', 'design'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'sample-3',
    title: 'Connect MongoDB Atlas Database',
    description: 'Provide Mongo URI in server/.env to enable persistent cloud database storage.',
    category: 'Development',
    status: 'in-progress',
    priority: 'high',
    tags: ['mongodb', 'database', 'atlas'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all items with optional search and filters
// @route   GET /api/items
const getItems = async (req, res, next) => {
  try {
    const { search, category, status, priority, sort } = req.query;

    if (isDbConnected()) {
      let query = {};

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }

      if (category && category !== 'All') {
        query.category = category;
      }

      if (status && status !== 'All') {
        query.status = status;
      }

      if (priority && priority !== 'All') {
        query.priority = priority;
      }

      let sortOption = { createdAt: -1 };
      if (sort === 'oldest') sortOption = { createdAt: 1 };
      if (sort === 'title') sortOption = { title: 1 };
      if (sort === 'priority') sortOption = { priority: 1 };

      const items = await Item.find(query).sort(sortOption);
      return res.status(200).json({
        success: true,
        count: items.length,
        data: items,
        source: 'database',
      });
    } else {
      // In-memory fallback
      let results = [...fallbackItems];

      if (search) {
        const s = search.toLowerCase();
        results = results.filter(
          (item) =>
            item.title.toLowerCase().includes(s) ||
            item.description.toLowerCase().includes(s) ||
            (item.tags && item.tags.some((t) => t.toLowerCase().includes(s)))
        );
      }

      if (category && category !== 'All') {
        results = results.filter((item) => item.category === category);
      }

      if (status && status !== 'All') {
        results = results.filter((item) => item.status === status);
      }

      if (priority && priority !== 'All') {
        results = results.filter((item) => item.priority === priority);
      }

      return res.status(200).json({
        success: true,
        count: results.length,
        data: results,
        source: 'memory_fallback',
        message: 'Serving in-memory data. Connect MongoDB in server/.env for database persistence.',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const item = await Item.findById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }
      return res.status(200).json({ success: true, data: item });
    } else {
      const item = fallbackItems.find((i) => i._id === id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }
      return res.status(200).json({ success: true, data: item });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create new item
// @route   POST /api/items
const createItem = async (req, res, next) => {
  try {
    const { title, description, category, status, priority, tags } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    if (isDbConnected()) {
      const newItem = await Item.create({
        title: title.trim(),
        description: description || '',
        category: category || 'General',
        status: status || 'pending',
        priority: priority || 'medium',
        tags: Array.isArray(tags) ? tags : typeof tags === 'string' && tags ? tags.split(',').map((t) => t.trim()) : [],
      });

      return res.status(201).json({
        success: true,
        data: newItem,
        message: 'Item created successfully in MongoDB',
      });
    } else {
      const newItem = {
        _id: `mem-${Date.now()}`,
        title: title.trim(),
        description: description || '',
        category: category || 'General',
        status: status || 'pending',
        priority: priority || 'medium',
        tags: Array.isArray(tags) ? tags : typeof tags === 'string' && tags ? tags.split(',').map((t) => t.trim()) : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      fallbackItems.unshift(newItem);

      return res.status(201).json({
        success: true,
        data: newItem,
        message: 'Item created (in-memory mode)',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, status, priority, tags } = req.body;

    if (isDbConnected()) {
      const updatedItem = await Item.findByIdAndUpdate(
        id,
        {
          ...(title !== undefined && { title: title.trim() }),
          ...(description !== undefined && { description }),
          ...(category !== undefined && { category }),
          ...(status !== undefined && { status }),
          ...(priority !== undefined && { priority }),
          ...(tags !== undefined && {
            tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
          }),
        },
        { new: true, runValidators: true }
      );

      if (!updatedItem) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }

      return res.status(200).json({
        success: true,
        data: updatedItem,
        message: 'Item updated successfully',
      });
    } else {
      const index = fallbackItems.findIndex((i) => i._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }

      fallbackItems[index] = {
        ...fallbackItems[index],
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(tags !== undefined && {
          tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
        }),
        updatedAt: new Date().toISOString(),
      };

      return res.status(200).json({
        success: true,
        data: fallbackItems[index],
        message: 'Item updated (in-memory mode)',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const deletedItem = await Item.findByIdAndDelete(id);
      if (!deletedItem) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }
      return res.status(200).json({
        success: true,
        data: {},
        message: 'Item deleted successfully',
      });
    } else {
      const index = fallbackItems.findIndex((i) => i._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }

      fallbackItems.splice(index, 1);
      return res.status(200).json({
        success: true,
        data: {},
        message: 'Item deleted (in-memory mode)',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Seed sample data
// @route   POST /api/items/seed
const seedItems = async (req, res, next) => {
  try {
    const samples = [
      {
        title: 'Master React & Component Design',
        description: 'Build interactive dashboards with modern hooks, state management, and reusable components.',
        category: 'Development',
        status: 'completed',
        priority: 'high',
        tags: ['react', 'frontend', 'javascript'],
      },
      {
        title: 'Construct Express RESTful Endpoints',
        description: 'Implement secure, modular routing controllers and robust JSON validation.',
        category: 'Development',
        status: 'completed',
        priority: 'high',
        tags: ['express', 'backend', 'api'],
      },
      {
        title: 'Connect MongoDB Atlas Database',
        description: 'Configure Mongoose models, indexes, schemas, and connection pools.',
        category: 'Development',
        status: 'in-progress',
        priority: 'medium',
        tags: ['mongodb', 'database', 'mongoose'],
      },
      {
        title: 'Implement Dark & Glass UI Theme',
        description: 'Style application using CSS design tokens, glowing borders, and accessible colors.',
        category: 'Design',
        status: 'completed',
        priority: 'medium',
        tags: ['design', 'css', 'theme'],
      },
      {
        title: 'Deploy to Cloud Hosting (Vercel & Render)',
        description: 'Deploy frontend to Vercel/Netlify and Express backend to Render/Fly.io.',
        category: 'Marketing',
        status: 'pending',
        priority: 'low',
        tags: ['deployment', 'devops', 'cloud'],
      },
    ];

    if (isDbConnected()) {
      await Item.deleteMany({});
      const created = await Item.insertMany(samples);
      return res.status(201).json({
        success: true,
        count: created.length,
        data: created,
        message: 'Database seeded with sample items successfully',
      });
    } else {
      fallbackItems = samples.map((s, index) => ({
        ...s,
        _id: `mem-seed-${index + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      return res.status(201).json({
        success: true,
        count: fallbackItems.length,
        data: fallbackItems,
        message: 'In-memory data seeded successfully',
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  seedItems,
};
