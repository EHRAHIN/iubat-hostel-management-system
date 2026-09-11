const { BazarRequisition, BazarStock } = require('../models/Bazar');
const { MealBooking } = require('../models/Meal');
const Expense = require('../models/Expense');

// Initial seed stock for kitchen if empty - exactly matching Padma Hall 7-Day Roster
const defaultStockItems = [
  { itemName: 'Miniket Rice (Medium Grain)', category: 'Grains & Staple', quantity: 180, unit: 'kg', minThreshold: 50, status: 'In Stock' },
  { itemName: 'Chinigura / Kalijira Polao Rice', category: 'Grains & Staple', quantity: 40, unit: 'kg', minThreshold: 15, status: 'In Stock' },
  { itemName: 'Rupchanda Fortified Soybean Oil', category: 'Oils & Fats', quantity: 45, unit: 'Liters', minThreshold: 20, status: 'In Stock' },
  { itemName: 'Premium Masoor Dal (Red Lentils)', category: 'Pulses & Dal', quantity: 30, unit: 'kg', minThreshold: 15, status: 'In Stock' },
  { itemName: 'Munshiganj Fresh Potatoes', category: 'Vegetables & Spices', quantity: 65, unit: 'kg', minThreshold: 25, status: 'In Stock' },
  { itemName: 'Local Red Onions (Deshi)', category: 'Vegetables & Spices', quantity: 30, unit: 'kg', minThreshold: 15, status: 'In Stock' },
  { itemName: 'Fresh Broiler Chicken (Halal)', category: 'Protein & Poultry', quantity: 32, unit: 'kg', minThreshold: 15, status: 'In Stock' },
  { itemName: 'Fresh River Rui Fish (Curry Cut)', category: 'Fish & Seafood', quantity: 24, unit: 'kg', minThreshold: 10, status: 'In Stock' },
  { itemName: 'Fresh Cleaned Pangash Fish', category: 'Fish & Seafood', quantity: 20, unit: 'kg', minThreshold: 10, status: 'In Stock' },
  { itemName: 'Fresh Halal Beef (Bone-in)', category: 'Protein & Poultry', quantity: 22, unit: 'kg', minThreshold: 10, status: 'In Stock' },
  { itemName: 'Farm Brown Eggs (Layer)', category: 'Protein & Poultry', quantity: 160, unit: 'Pcs', minThreshold: 50, status: 'In Stock' },
  { itemName: 'Mixed Seasonal Fresh Vegetables', category: 'Vegetables & Spices', quantity: 28, unit: 'kg', minThreshold: 12, status: 'In Stock' },
  { itemName: 'Green Chillies & Garlic/Ginger', category: 'Vegetables & Spices', quantity: 12, unit: 'kg', minThreshold: 5, status: 'In Stock' },
  { itemName: 'Turmeric, Cumin & Biryani Spices', category: 'Vegetables & Spices', quantity: 8, unit: 'kg', minThreshold: 3, status: 'In Stock' },
  { itemName: 'Ispahani Tea & Pure Sugar', category: 'Dairy & Others', quantity: 16, unit: 'kg', minThreshold: 5, status: 'In Stock' },
];

// @desc    Get all bazar requisitions
// @route   GET /api/bazar/requisitions
exports.getRequisitions = async (req, res) => {
  try {
    const { hall, type, status, targetDate } = req.query;
    const filter = {};

    if (hall && hall !== 'all') {
      filter.hall = { $regex: hall.includes('Meghna') ? 'Meghna' : 'Padma', $options: 'i' };
    }
    if (type && type !== 'all') filter.requisitionType = type;
    if (status && status !== 'all') filter.status = status;
    if (targetDate) filter.targetDate = targetDate;

    let requisitions = await BazarRequisition.find(filter).sort({ createdAt: -1 });

    // Seed initial samples if completely empty
    if (requisitions.length === 0 && Object.keys(filter).length === 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const seedSamples = [
        {
          requisitionId: 'BZR-2026-DAILY-01',
          requisitionType: 'Daily Next-Day Bazar',
          targetDate: tomorrowStr,
          title: `Daily Kitchen Market for ${tomorrowStr} (Chicken & Veggies)`,
          hall: 'Padma Residential Hall (Male)',
          items: [
            { name: 'Fresh Broiler Chicken (Halal)', quantity: 30, unit: 'kg', category: 'Protein & Poultry', estimatedRate: 210, estimatedTotal: 6300 },
            { name: 'Potatoes & Seasonal Vegetables', quantity: 25, unit: 'kg', category: 'Vegetables & Spices', estimatedRate: 40, estimatedTotal: 1000 },
            { name: 'Green Chillies, Coriander & Lemons', quantity: 4, unit: 'kg', category: 'Vegetables & Spices', estimatedRate: 120, estimatedTotal: 480 },
            { name: 'Fresh Farm Eggs', quantity: 120, unit: 'Pcs', category: 'Protein & Poultry', estimatedRate: 11, estimatedTotal: 1320 },
          ],
          totalEstimatedCost: 9100,
          totalActualCost: 0,
          submittedBy: 'Md. Kalam Hossain (Dining Staff In-Charge)',
          status: 'Pending Super Approval',
        },
        {
          requisitionId: 'BZR-2026-MONTH-01',
          requisitionType: 'Monthly Big Bazar',
          targetDate: todayStr,
          title: 'Monthly Big Bulk Grocery Procurement (March 2026)',
          hall: 'Padma Residential Hall (Male)',
          items: [
            { name: 'Miniket Rice (50kg Bag)', quantity: 10, unit: 'Bags', category: 'Grains & Staple', estimatedRate: 3600, estimatedTotal: 36000 },
            { name: 'Soybean Oil (16L Tin)', quantity: 4, unit: 'Liters', category: 'Oils & Fats', estimatedRate: 2750, estimatedTotal: 11000 },
            { name: 'Masoor Dal (50kg Bag)', quantity: 2, unit: 'Bags', category: 'Pulses & Dal', estimatedRate: 6800, estimatedTotal: 13600 },
            { name: 'Deshi Onions (Wholesale Bag)', quantity: 3, unit: 'Bags', category: 'Vegetables & Spices', estimatedRate: 2400, estimatedTotal: 7200 },
          ],
          totalEstimatedCost: 67800,
          totalActualCost: 67200,
          approvedBudget: 67800,
          approvedBy: 'Prof. Dr. Monirul Islam (Hostel Super / Provost)',
          approvalRemarks: 'Approved for central wholesale procurement under Kawran Bazar Arat.',
          approvedAt: new Date(),
          voucherNo: 'VOUCH-M-8912',
          submittedBy: 'Md. Kalam Hossain (Dining Staff In-Charge)',
          status: 'Approved by Hostel Super',
        },
      ];

      await BazarRequisition.insertMany(seedSamples);
      requisitions = await BazarRequisition.find().sort({ createdAt: -1 });
    }

    res.status(200).json({ success: true, count: requisitions.length, data: requisitions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Dining Staff submits a new bazar requisition (Daily Next-Day or Monthly Big Bazar)
// @route   POST /api/bazar/requisitions
exports.createRequisition = async (req, res) => {
  try {
    const {
      requisitionType,
      targetDate,
      title,
      hall,
      items,
      totalEstimatedCost,
      submittedBy,
    } = req.body;

    const finalEstimatedCost = Number(
      totalEstimatedCost ||
      req.body.estimatedBudgetBDT ||
      req.body.estimatedCost ||
      items.reduce((acc, it) => acc + (Number(it.estimatedCost || it.estimatedCostBDT || 0)), 0)
    );

    if (!items || items.length === 0 || (!finalEstimatedCost && finalEstimatedCost !== 0)) {
      return res.status(400).json({ success: false, message: 'Requisition items and estimated cost are required.' });
    }

    const timestamp = Date.now().toString().slice(-6);
    const prefix = requisitionType === 'Monthly Big Bazar' ? 'MONTH' : 'DAILY';
    const requisitionId = `BZR-2026-${prefix}-${timestamp}`;

    const isAlreadyPurchased = Boolean(req.body.isAlreadyPurchased || req.body.markAsPurchased || req.body.status === 'Purchased & Stocked');
    const finalVoucher = req.body.voucherNo || `VOUCH-BZR-${Math.floor(100000 + Math.random() * 900000)}`;

    const newReq = await BazarRequisition.create({
      requisitionId,
      requisitionType: requisitionType || 'Daily Next-Day Bazar',
      targetDate: targetDate || new Date().toISOString().split('T')[0],
      title: title || `${requisitionType} for ${targetDate || 'Upcoming Schedule'}`,
      hall: hall || 'Padma Residential Hall (Male)',
      items,
      totalEstimatedCost: finalEstimatedCost,
      totalActualCost: isAlreadyPurchased ? (Number(req.body.actualCost) || finalEstimatedCost) : 0,
      approvedBudget: isAlreadyPurchased ? (Number(req.body.actualCost) || finalEstimatedCost) : null,
      voucherNo: isAlreadyPurchased ? finalVoucher : '',
      submittedBy: submittedBy || 'Dining Staff In-Charge',
      approvedBy: isAlreadyPurchased ? (submittedBy || 'Dining Staff / Super') : '',
      status: isAlreadyPurchased ? 'Purchased & Stocked' : 'Pending Super Approval',
    });

    let updatedStock = [];
    if (isAlreadyPurchased) {
      updatedStock = await updatePantryStockFromRequisition(newReq);
      // Also log expense
      await Expense.create({
        expenseId: `EXP-${newReq.requisitionId}`,
        title: `${newReq.requisitionType}: ${newReq.title}`,
        category: 'Mess Grocery & Food Supplies',
        hall: newReq.hall || 'Padma Residential Hall (Male)',
        amountBDT: newReq.totalActualCost,
        vendor: 'Kawran Bazar & Local Wholesale Arat',
        voucherNo: finalVoucher,
        approvedBy: newReq.approvedBy || 'Dining Staff / Super',
        paymentMethod: 'Petty Cash',
        date: newReq.targetDate,
        month: new Date(newReq.targetDate).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        notes: `Direct bazar procurement logged under Requisition #${newReq.requisitionId}`,
      });
    }

    res.status(201).json({
      success: true,
      message: isAlreadyPurchased
        ? `Bazar procurement logged for ৳${newReq.totalActualCost.toLocaleString()} BDT and kitchen pantry stock updated immediately!`
        : `Bazar requisition #${newReq.requisitionId} submitted to Hostel Super for approval!`,
      data: newReq,
      updatedStock,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Hostel Super approves bazar requisition with approved budget & remarks
// @route   PUT /api/bazar/requisitions/:id/approve
exports.approveRequisition = async (req, res) => {
  try {
    const { approvedBy, approvedBudget, approvalRemarks } = req.body;
    const reqDoc = await BazarRequisition.findById(req.params.id);

    if (!reqDoc) {
      return res.status(404).json({ success: false, message: 'Requisition not found' });
    }

    reqDoc.status = 'Approved by Hostel Super';
    reqDoc.approvedBy = approvedBy || 'Prof. Dr. Monirul Islam (Hostel Super / Provost)';
    reqDoc.approvedBudget = Number(approvedBudget) || reqDoc.totalEstimatedCost;
    reqDoc.approvalRemarks = approvalRemarks || 'Approved upon checking dining student headcount and pantry status.';
    reqDoc.approvedAt = new Date();
    await reqDoc.save();

    res.status(200).json({
      success: true,
      message: `Bazar Requisition #${reqDoc.requisitionId} approved by Hostel Super with budget of ৳${reqDoc.approvedBudget.toLocaleString()} BDT!`,
      data: reqDoc,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Hostel Super rejects bazar requisition
// @route   PUT /api/bazar/requisitions/:id/reject
exports.rejectRequisition = async (req, res) => {
  try {
    const { approvedBy, remarks } = req.body;
    const reqDoc = await BazarRequisition.findById(req.params.id);

    if (!reqDoc) {
      return res.status(404).json({ success: false, message: 'Requisition not found' });
    }

    reqDoc.status = 'Rejected';
    reqDoc.approvedBy = approvedBy || 'Hostel Super';
    reqDoc.approvalRemarks = remarks || 'Requisition rejected. Please adjust item quantities or rely on existing stock.';
    await reqDoc.save();

    res.status(200).json({
      success: true,
      message: `Bazar Requisition #${reqDoc.requisitionId} rejected.`,
      data: reqDoc,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Smart matching helper to map bazar items to central pantry inventory
function matchPantryStockItem(stockItems, itemName) {
  const q = (itemName || '').toLowerCase().trim();

  // 1. Exact match
  const exact = stockItems.find((s) => s.itemName.toLowerCase() === q);
  if (exact) return exact;

  // 2. Specialized keyword matching for weekly roster & bulk items
  if (q.includes('chicken') || q.includes('poultry') || q.includes('morgi')) {
    return stockItems.find((s) => s.itemName.toLowerCase().includes('chicken'));
  }
  if (q.includes('egg') || q.includes('dim')) {
    return stockItems.find((s) => s.itemName.toLowerCase().includes('egg') || s.itemName.toLowerCase().includes('dim'));
  }
  if (q.includes('rui') || (q.includes('fish') && !q.includes('pangas'))) {
    return stockItems.find((s) => s.itemName.toLowerCase().includes('rui'));
  }
  if (q.includes('pangash') || q.includes('pangas')) {
    return stockItems.find((s) => s.itemName.toLowerCase().includes('pangash'));
  }
  if (q.includes('beef') || q.includes('meat') || q.includes('gorur')) {
    return stockItems.find((s) => s.itemName.toLowerCase().includes('beef'));
  }
  if (q.includes('polao') || q.includes('chinigura') || q.includes('kalijira')) {
    return stockItems.find((s) => s.itemName.toLowerCase().includes('polao') || s.itemName.toLowerCase().includes('chinigura'));
  }
  if (q.includes('miniket') || (q.includes('rice') && !q.includes('polao') && !q.includes('aromatic'))) {
    return stockItems.find((s) => s.itemName.toLowerCase().includes('miniket') || s.itemName.toLowerCase().includes('rice'));
  }
  if (q.includes('oil') || q.includes('soybean') || q.includes('rupchanda') || q.includes('mustard')) {
    return stockItems.find((s) => s.itemName.toLowerCase().includes('oil') || s.itemName.toLowerCase().includes('soybean'));
  }
  if (q.includes('dal') || q.includes('lentil') || q.includes('masoor') || q.includes('moong')) {
    return stockItems.find((s) => s.itemName.toLowerCase().includes('dal') || s.itemName.toLowerCase().includes('masoor'));
  }
  if (q.includes('potato') || q.includes('aloo')) {
    return stockItems.find((s) => s.itemName.toLowerCase().includes('potato') || s.itemName.toLowerCase().includes('potatoes'));
  }
  if (q.includes('onion') || q.includes('peyaj')) {
    return stockItems.find((s) => s.itemName.toLowerCase().includes('onion') || s.itemName.toLowerCase().includes('onions') || s.itemName.toLowerCase().includes('deshi'));
  }
  if (q.includes('vegetable') || q.includes('sabji') || q.includes('potol') || q.includes('papaya')) {
    return stockItems.find((s) => s.itemName.toLowerCase().includes('vegetable') || s.itemName.toLowerCase().includes('vegetables'));
  }
  if (q.includes('tea') || q.includes('sugar') || q.includes('chini')) {
    return stockItems.find((s) => s.itemName.toLowerCase().includes('tea') || s.itemName.toLowerCase().includes('sugar'));
  }
  if (q.includes('chilli') || q.includes('garlic') || q.includes('ginger') || q.includes('morich')) {
    return stockItems.find((s) => s.itemName.toLowerCase().includes('chillies') || s.itemName.toLowerCase().includes('garlic'));
  }
  if (q.includes('spice') || q.includes('masala') || q.includes('turmeric') || q.includes('cumin')) {
    return stockItems.find((s) => s.itemName.toLowerCase().includes('spices') || s.itemName.toLowerCase().includes('masala'));
  }

  // 3. Substring match fallback
  return stockItems.find((s) => q.includes(s.itemName.toLowerCase()) || s.itemName.toLowerCase().includes(q));
}

// Helper to convert bulk wholesale units (bags, tins, lots) to standard pantry stock units (kg, Liters, Pcs)
function normalizeStockAddition(item) {
  const qty = Number(item.quantity) || 0;
  const unit = (item.unit || '').toLowerCase().trim();
  const name = (item.name || '').toLowerCase().trim();

  if (unit.includes('bag') || unit.includes('sack')) {
    if (name.includes('50kg') || name.includes('miniket') || name.includes('dal')) {
      return { quantity: qty * 50, unit: 'kg' };
    }
    if (name.includes('40kg') || name.includes('onion')) {
      return { quantity: qty * 40, unit: 'kg' };
    }
    if (name.includes('25kg') || name.includes('polao') || name.includes('sugar')) {
      return { quantity: qty * 25, unit: 'kg' };
    }
    if (name.includes('20kg') || name.includes('garlic')) {
      return { quantity: qty * 20, unit: 'kg' };
    }
    return { quantity: qty * 25, unit: 'kg' };
  }

  if (unit.includes('tin')) {
    if (name.includes('16l') || name.includes('oil')) {
      return { quantity: qty * 16, unit: 'Liters' };
    }
    return { quantity: qty * 16, unit: 'Liters' };
  }

  if (unit.includes('lot')) {
    if (name.includes('tea') || name.includes('sugar')) {
      return { quantity: qty * 30, unit: 'kg' };
    }
  }

  return { quantity: qty, unit: item.unit || 'kg' };
}

async function updatePantryStockFromRequisition(reqDoc) {
  const purchaseDate = new Date().toISOString().split('T')[0];
  const allStock = await BazarStock.find();
  const updatedItems = [];

  for (const item of (reqDoc.items || [])) {
    const { quantity: addQty, unit: targetUnit } = normalizeStockAddition(item);
    let stockItem = matchPantryStockItem(allStock, item.name);

    if (stockItem) {
      stockItem.quantity = Math.round((stockItem.quantity + addQty) * 10) / 10;
      stockItem.lastRestockedDate = purchaseDate;
      stockItem.status = stockItem.quantity > stockItem.minThreshold ? 'In Stock' : 'Low Stock';
      await stockItem.save();
      updatedItems.push({
        itemName: stockItem.itemName,
        addedQuantity: addQty,
        newTotal: stockItem.quantity,
        unit: stockItem.unit,
      });
    } else {
      const newStock = await BazarStock.create({
        itemName: item.name,
        category: item.category || 'Grains & Staple',
        quantity: addQty,
        unit: targetUnit,
        minThreshold: 15,
        status: 'In Stock',
        lastRestockedDate: purchaseDate,
        hall: reqDoc.hall || 'Padma Residential Hall (Male)',
      });
      allStock.push(newStock);
      updatedItems.push({
        itemName: newStock.itemName,
        addedQuantity: addQty,
        newTotal: newStock.quantity,
        unit: newStock.unit,
      });
    }
  }
  return updatedItems;
}

// @desc    Dining Staff marks requisition as Purchased & Stocked, updates pantry stock & logs expense
// @route   PUT /api/bazar/requisitions/:id/purchase
exports.markPurchased = async (req, res) => {
  try {
    const { actualCost, voucherNo, items, completedBy } = req.body;
    const reqDoc = await BazarRequisition.findById(req.params.id);

    if (!reqDoc) {
      return res.status(404).json({ success: false, message: 'Requisition not found' });
    }

    const finalCost = Number(actualCost) || reqDoc.approvedBudget || reqDoc.totalEstimatedCost;
    const finalVoucher = voucherNo || `VOUCH-BZR-${Math.floor(100000 + Math.random() * 900000)}`;

    reqDoc.status = 'Purchased & Stocked';
    reqDoc.totalActualCost = finalCost;
    reqDoc.voucherNo = finalVoucher;
    if (!reqDoc.approvedBudget) reqDoc.approvedBudget = finalCost;
    if (!reqDoc.approvedBy) reqDoc.approvedBy = completedBy || 'Hostel Super';
    if (items && items.length > 0) reqDoc.items = items;
    await reqDoc.save();

    // Automatically & immediately update BazarStock in kitchen
    const updatedStock = await updatePantryStockFromRequisition(reqDoc);

    // Also record in central Institutional Expense collection
    await Expense.create({
      expenseId: `EXP-${reqDoc.requisitionId}`,
      title: `${reqDoc.requisitionType}: ${reqDoc.title}`,
      category: 'Mess Grocery & Food Supplies',
      hall: reqDoc.hall || 'Padma Residential Hall (Male)',
      amountBDT: finalCost,
      vendor: 'Kawran Bazar & Local Wholesale Arat',
      voucherNo: finalVoucher,
      approvedBy: reqDoc.approvedBy || 'Hostel Super',
      paymentMethod: 'Petty Cash',
      date: reqDoc.targetDate,
      month: new Date(reqDoc.targetDate).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      notes: `Bazar completed & stocked for ${reqDoc.targetDate} under Requisition #${reqDoc.requisitionId}`,
    });

    res.status(200).json({
      success: true,
      message: `Bazar completed for ৳${finalCost.toLocaleString()} BDT under Voucher #${finalVoucher}! Kitchen pantry stock updated immediately.`,
      data: reqDoc,
      updatedStock,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get current Kitchen & Grocery Stock
// @route   GET /api/bazar/stock
exports.getStock = async (req, res) => {
  try {
    let stock = await BazarStock.find().sort({ category: 1, itemName: 1 });

    // Seed stock if empty
    if (stock.length === 0) {
      await BazarStock.insertMany(defaultStockItems);
      stock = await BazarStock.find().sort({ category: 1, itemName: 1 });
    } else {
      // Ensure all roster stock items exist
      const existingNames = new Set(stock.map((s) => s.itemName.toLowerCase()));
      const missing = defaultStockItems.filter((d) => !existingNames.has(d.itemName.toLowerCase()));
      if (missing.length > 0) {
        await BazarStock.insertMany(missing);
        stock = await BazarStock.find().sort({ category: 1, itemName: 1 });
      }
    }

    res.status(200).json({ success: true, count: stock.length, data: stock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a specific stock item quantity
// @route   PUT /api/bazar/stock/:id
exports.updateStockItem = async (req, res) => {
  try {
    const { quantity, minThreshold, status } = req.body;
    const stockItem = await BazarStock.findById(req.params.id);

    if (!stockItem) {
      return res.status(404).json({ success: false, message: 'Stock item not found' });
    }

    if (quantity !== undefined) stockItem.quantity = Number(quantity);
    if (minThreshold !== undefined) stockItem.minThreshold = Number(minThreshold);
    stockItem.status = stockItem.quantity <= 0 ? 'Critical Empty' : stockItem.quantity < stockItem.minThreshold ? 'Low Stock' : (status || 'In Stock');
    stockItem.lastRestockedDate = new Date().toISOString().split('T')[0];
    await stockItem.save();

    res.status(200).json({ success: true, message: `Stock updated for ${stockItem.itemName}!`, data: stockItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get Daily Headcount Attendance & Bazar Cost Report by Date ("kundin kotojon khaise and bazar er cost oitar list date select korew dekhte parbe")
// @route   GET /api/bazar/daily-report
exports.getDailyReport = async (req, res) => {
  try {
    const targetDate = req.query.date || new Date().toISOString().split('T')[0];
    const { hall } = req.query;

    const mealQuery = { date: targetDate };
    if (hall && hall !== 'all') {
      mealQuery.hall = { $regex: hall.includes('Meghna') ? 'Meghna' : 'Padma', $options: 'i' };
    }

    // 1. Get all meal bookings for this selected date (applied meals count immediately whether collected or not!)
    const allBookingsForDate = await MealBooking.find(mealQuery).sort({ createdAt: 1 });
    const countedBookings = allBookingsForDate.filter((b) => b.status !== 'Rejected');
    const collectedBookings = allBookingsForDate.filter((b) => b.foodCollected || b.status === 'Approved & Served');
    const uncollectedBookings = allBookingsForDate.filter((b) => !b.foodCollected && b.status !== 'Approved & Served' && b.status !== 'Rejected');

    // Counts by meal type (all applied meals are counted in daily totals)
    let breakfastCount = 0;
    let lunchCount = 0;
    let dinnerCount = 0;

    for (const b of countedBookings) {
      if (b.mealType === 'Breakfast') breakfastCount++;
      else if (b.mealType === 'Lunch') lunchCount++;
      else if (b.mealType === 'Dinner') dinnerCount++;
      else if (b.mealType.includes('Full') || b.mealType.includes('3 Meals')) {
        breakfastCount++;
        lunchCount++;
        dinnerCount++;
      }
    }

    // 2. Get Bazar costs for this selected date
    const bazarQuery = { targetDate };
    if (hall && hall !== 'all') {
      bazarQuery.hall = { $regex: hall.includes('Meghna') ? 'Meghna' : 'Padma', $options: 'i' };
    }
    const dayRequisitions = await BazarRequisition.find(bazarQuery);

    let totalBazarCost = 0;
    for (const r of dayRequisitions) {
      if (r.status === 'Purchased & Stocked' && r.totalActualCost > 0) {
        totalBazarCost += r.totalActualCost;
      } else if (r.status === 'Approved by Hostel Super') {
        totalBazarCost += (r.approvedBudget || r.totalEstimatedCost);
      } else {
        totalBazarCost += r.totalEstimatedCost;
      }
    }

    // If dayRequisitions are empty for that date, also check Expense collection for that date
    if (dayRequisitions.length === 0) {
      const dayExpenses = await Expense.find({
        date: targetDate,
        category: 'Mess Grocery & Food Supplies',
      });
      totalBazarCost = dayExpenses.reduce((sum, e) => sum + e.amountBDT, 0);
    }

    const totalEaters = countedBookings.length;
    const costPerMeal = totalEaters > 0 && totalBazarCost > 0 ? Math.round(totalBazarCost / totalEaters) : 0;

    res.status(200).json({
      success: true,
      data: {
        selectedDate: targetDate,
        summary: {
          totalServedMeals: totalEaters, // All applied meals count whether collected or not!
          collectedCount: collectedBookings.length,
          uncollectedCount: uncollectedBookings.length,
          breakfastCount,
          lunchCount,
          dinnerCount,
          totalBazarCostBDT: totalBazarCost,
          costPerMealBDT: costPerMeal,
        },
        attendees: countedBookings.map((b) => ({
          bookingId: b.bookingId,
          studentId: b.studentId,
          studentName: b.studentName,
          room: b.room,
          mealType: b.mealType,
          diet: b.diet,
          tokenCostBDT: b.tokenCostBDT,
          foodCollected: Boolean(b.foodCollected || b.status === 'Approved & Served'),
          servedTime: b.approvedAt ? new Date(b.approvedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : (b.foodCollected ? 'Collected' : 'Applied & Counted'),
          status: b.status,
        })),
        requisitions: dayRequisitions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Monthly Bazar Expenditure & Attendance Report (Date-wise receipts & monthly totals)
// @route   GET /api/bazar/monthly-report
exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, hall } = req.query;
    const currentMonthPrefix = month || new Date().toISOString().slice(0, 7); // e.g. '2026-09' or '2026-03'

    const filter = {
      targetDate: { $regex: `^${currentMonthPrefix}` },
    };
    if (hall && hall !== 'all') {
      filter.hall = { $regex: hall.includes('Meghna') ? 'Meghna' : 'Padma', $options: 'i' };
    }

    const monthRequisitions = await BazarRequisition.find(filter).sort({ targetDate: -1, createdAt: -1 });

    // Calculate total spend and group by date
    let totalMonthlyCost = 0;
    const dateWiseMap = {};

    for (const reqDoc of monthRequisitions) {
      const cost = reqDoc.status === 'Purchased & Stocked' && reqDoc.totalActualCost > 0
        ? reqDoc.totalActualCost
        : (reqDoc.approvedBudget || reqDoc.totalEstimatedCost);

      totalMonthlyCost += cost;

      const d = reqDoc.targetDate;
      if (!dateWiseMap[d]) {
        dateWiseMap[d] = {
          date: d,
          totalCostBDT: 0,
          requisitions: [],
        };
      }
      dateWiseMap[d].totalCostBDT += cost;
      dateWiseMap[d].requisitions.push(reqDoc);
    }

    // Also get total student meals for the selected month
    const mealFilter = {
      date: { $regex: `^${currentMonthPrefix}` },
    };
    if (hall && hall !== 'all') {
      mealFilter.hall = { $regex: hall.includes('Meghna') ? 'Meghna' : 'Padma', $options: 'i' };
    }
    const monthMeals = await MealBooking.find(mealFilter);
    const countedMeals = monthMeals.filter((m) => m.status !== 'Rejected');
    const collectedMeals = countedMeals.filter((m) => m.foodCollected || m.status === 'Approved & Served');

    const dateWiseList = Object.values(dateWiseMap).sort((a, b) => b.date.localeCompare(a.date));

    res.status(200).json({
      success: true,
      data: {
        month: currentMonthPrefix,
        totalMonthlyCostBDT: totalMonthlyCost,
        totalRequisitionsCount: monthRequisitions.length,
        totalPurchasedCount: monthRequisitions.filter((r) => r.status === 'Purchased & Stocked').length,
        totalMonthlyMeals: countedMeals.length,
        totalCollectedMeals: collectedMeals.length,
        averageDailySpend: dateWiseList.length > 0 ? Math.round(totalMonthlyCost / dateWiseList.length) : 0,
        dateWiseBreakdown: dateWiseList,
        allRequisitions: monthRequisitions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
