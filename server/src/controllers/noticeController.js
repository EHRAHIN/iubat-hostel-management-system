const Notice = require('../models/Notice');

// @desc    Get notices (filtered by category, search)
// @route   GET /api/notices
exports.getNotices = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { refNo: { $regex: search, $options: 'i' } },
      ];
    }

    const notices = await Notice.find(query).sort({ isPinned: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: notices.length, data: notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new notice / administrative circular
// @route   POST /api/notices
exports.createNotice = async (req, res) => {
  try {
    const { title, category, refNo, summary, authority, isPinned } = req.body;

    if (!title || !summary) {
      return res.status(400).json({ success: false, message: 'Title and summary are required' });
    }

    const notice = await Notice.create({
      title,
      category: category || 'Administration',
      refNo: refNo || `IUBAT/RO/2026/${Math.floor(100 + Math.random() * 900)}`,
      summary,
      authority: authority || 'Office of the Provost',
      isPinned: isPinned || false,
    });

    res.status(201).json({ success: true, data: notice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update notice
// @route   PUT /api/notices/:id
exports.updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    res.status(200).json({ success: true, data: notice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    res.status(200).json({ success: true, message: 'Notice removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
