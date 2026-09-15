const Notice = require('../models/Notice');

// @desc    Get notices (filtered by category, search, role, targetAudience, floor)
// @route   GET /api/notices
exports.getNotices = async (req, res) => {
  try {
    const { category, search, audience, role, floor } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Role-based target audience filtering
    if (role && !['super', 'admin'].includes(role.toLowerCase())) {
      const allowed = ['all'];
      const r = role.toLowerCase();
      if (r === 'student') {
        allowed.push('students');
        if (floor) {
          const fl = floor.toString().includes('2') ? 'floor-2' : 'floor-1';
          allowed.push(fl);
        }
      } else if (r === 'teacher') {
        allowed.push('teachers');
        if (floor) {
          const fl = floor.toString().includes('2') ? 'floor-2' : 'floor-1';
          allowed.push(fl);
        }
      } else if (r === 'staff') {
        allowed.push('staff');
      } else if (r === 'parent') {
        allowed.push('parents');
      }
      query.$or = [
        { targetAudience: { $in: allowed } },
        { targetAudience: { $exists: false } }, // backward compatibility
        { targetAudience: null },
      ];
    } else if (audience && audience !== 'all') {
      query.targetAudience = audience;
    }

    if (search) {
      const sRegex = { $regex: search, $options: 'i' };
      const searchConditions = [
        { title: sRegex },
        { summary: sRegex },
        { content: sRegex },
        { refNo: sRegex },
      ];
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: searchConditions },
        ];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const notices = await Notice.find(query).sort({ isPinned: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: notices.length, data: notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new notice / administrative circular (by Hostel Super / Provost)
// @route   POST /api/notices
exports.createNotice = async (req, res) => {
  try {
    const { 
      title, 
      category, 
      refNo, 
      summary, 
      content, 
      authority, 
      targetAudience, 
      targetAudienceLabel, 
      isPinned,
      publishedBy 
    } = req.body;

    if (!title || (!summary && !content)) {
      return res.status(400).json({ success: false, message: 'Title and content/summary are required' });
    }

    // Auto-generate official reference if missing
    const totalCount = await Notice.countDocuments() + 1;
    const catCode = category === 'Allocation' ? 'RO' 
      : category === 'Dining' ? 'MC' 
      : category === 'Maintenance' ? 'IT' 
      : category === 'Discipline' ? 'HD' 
      : 'PRV';

    const officialRef = (refNo && refNo.trim()) 
      ? refNo.trim() 
      : `HSTL/${catCode}/2026/${String(totalCount).padStart(3, '0')}`;

    const audienceLabels = {
      all: 'All Residents & Campus',
      students: 'Students Only',
      teachers: 'Floor Teachers (House Tutors)',
      staff: 'Dining & Maintenance Staff',
      parents: 'Parents & Guardians',
      'floor-1': 'Padma Floor 1 Residents',
      'floor-2': 'Padma Floor 2 Residents',
    };

    const chosenAudience = targetAudience || 'all';

    const notice = await Notice.create({
      title: title.trim(),
      category: category || 'Administration',
      refNo: officialRef,
      summary: (summary || content).trim(),
      content: (content || summary).trim(),
      targetAudience: chosenAudience,
      targetAudienceLabel: targetAudienceLabel || audienceLabels[chosenAudience] || 'All Residents & Campus',
      authority: authority || 'Office of the Provost',
      publishedBy: publishedBy || 'Prof. Dr. Monirul Islam (Hostel Super / Provost)',
      isPinned: Boolean(isPinned),
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
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
