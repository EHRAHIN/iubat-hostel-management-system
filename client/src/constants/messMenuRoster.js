// Weekly Residential Mess Roster & Procurement Catalog (Padma Hall Dining)
// Exactly synchronized with the student dining schedule

export const WEEKLY_MESS_ROSTER = [
  {
    dayIndex: 0,
    day: 'Sun',
    dayFull: 'Sunday',
    lunch: 'Chicken Bhuna',
    dinner: 'Dim Curry',
    dailyBazarItems: [
      { name: 'Fresh Broiler Chicken (Halal)', quantity: 30, unit: 'kg', estimatedRate: 210, estimatedTotal: 6300, category: 'Protein & Poultry', forDish: 'Chicken Bhuna (Lunch)' },
      { name: 'Farm Brown Eggs (Layer)', quantity: 120, unit: 'Pcs', estimatedRate: 11, estimatedTotal: 1320, category: 'Protein & Poultry', forDish: 'Dim Curry (Dinner)' },
      { name: 'Munshiganj Fresh Potatoes', quantity: 25, unit: 'kg', estimatedRate: 40, estimatedTotal: 1000, category: 'Vegetables & Spices', forDish: 'Curry Potatoes' },
      { name: 'Local Red Onions & Green Chillies', quantity: 12, unit: 'kg', estimatedRate: 75, estimatedTotal: 900, category: 'Vegetables & Spices', forDish: 'Curry Gravy' },
      { name: 'Ginger, Garlic & Garam Masala Pack', quantity: 4, unit: 'kg', estimatedRate: 220, estimatedTotal: 880, category: 'Vegetables & Spices', forDish: 'Spices' },
    ],
  },
  {
    dayIndex: 1,
    day: 'Mon',
    dayFull: 'Monday',
    lunch: 'Rui Fish',
    dinner: 'Mixed Sabji',
    dailyBazarItems: [
      { name: 'Fresh River Rui Fish (Curry Cut)', quantity: 26, unit: 'kg', estimatedRate: 340, estimatedTotal: 8840, category: 'Fish & Seafood', forDish: 'Rui Fish Curry (Lunch)' },
      { name: 'Mixed Seasonal Vegetables (Papaya, Potato, Potol, Pumpkin)', quantity: 35, unit: 'kg', estimatedRate: 45, estimatedTotal: 1575, category: 'Vegetables & Spices', forDish: 'Mixed Sabji (Dinner)' },
      { name: 'Deshi Onions, Green Chillies & Coriander', quantity: 10, unit: 'kg', estimatedRate: 80, estimatedTotal: 800, category: 'Vegetables & Spices', forDish: 'Vegetable & Fish Seasoning' },
      { name: 'Mustard Oil & Panch Phoron Pack', quantity: 2, unit: 'Liters', estimatedRate: 260, estimatedTotal: 520, category: 'Oils & Fats', forDish: 'Sabji Cooking' },
    ],
  },
  {
    dayIndex: 2,
    day: 'Tue',
    dayFull: 'Tuesday',
    lunch: 'Egg Curry',
    dinner: 'Pangash Fish',
    dailyBazarItems: [
      { name: 'Farm Brown Eggs (Layer)', quantity: 140, unit: 'Pcs', estimatedRate: 11, estimatedTotal: 1540, category: 'Protein & Poultry', forDish: 'Egg Curry (Lunch)' },
      { name: 'Fresh Cleaned Pangash Fish (Steaks)', quantity: 28, unit: 'kg', estimatedRate: 200, estimatedTotal: 5600, category: 'Fish & Seafood', forDish: 'Pangash Fish (Dinner)' },
      { name: 'Munshiganj Potatoes & Fresh Tomatoes', quantity: 25, unit: 'kg', estimatedRate: 45, estimatedTotal: 1125, category: 'Vegetables & Spices', forDish: 'Gravy Base' },
      { name: 'Deshi Onions, Garlic & Green Chillies', quantity: 10, unit: 'kg', estimatedRate: 80, estimatedTotal: 800, category: 'Vegetables & Spices', forDish: 'Curry Base' },
    ],
  },
  {
    dayIndex: 3,
    day: 'Wed',
    dayFull: 'Wednesday',
    lunch: 'Beef/Special',
    dinner: 'Dal & Bhorta',
    dailyBazarItems: [
      { name: 'Fresh Halal Beef (Bone-in Curry Cut)', quantity: 24, unit: 'kg', estimatedRate: 780, estimatedTotal: 18720, category: 'Protein & Poultry', forDish: 'Beef/Special Curry (Lunch)' },
      { name: 'Potatoes (For Aloo/Dimer Bhorta)', quantity: 25, unit: 'kg', estimatedRate: 40, estimatedTotal: 1000, category: 'Vegetables & Spices', forDish: 'Aloo/Egg Bhorta (Dinner)' },
      { name: 'Premium Masoor Dal (Red Lentils)', quantity: 8, unit: 'kg', estimatedRate: 140, estimatedTotal: 1120, category: 'Pulses & Dal', forDish: 'Tarka Dal (Dinner)' },
      { name: 'Deshi Red Onions, Dry Chillies & Mustard Oil', quantity: 12, unit: 'kg', estimatedRate: 90, estimatedTotal: 1080, category: 'Vegetables & Spices', forDish: 'Bhorta & Beef Seasoning' },
      { name: 'Coriander, Garlic & Green Chillies', quantity: 4, unit: 'kg', estimatedRate: 150, estimatedTotal: 600, category: 'Vegetables & Spices', forDish: 'Fresh Garnish' },
    ],
  },
  {
    dayIndex: 4,
    day: 'Thu',
    dayFull: 'Thursday',
    lunch: 'Chicken Khichuri',
    dinner: 'Egg Curry',
    dailyBazarItems: [
      { name: 'Fresh Broiler Chicken (Halal)', quantity: 25, unit: 'kg', estimatedRate: 210, estimatedTotal: 5250, category: 'Protein & Poultry', forDish: 'Chicken Khichuri (Lunch)' },
      { name: 'Chinigura/Kalijira Aromatic Rice', quantity: 18, unit: 'kg', estimatedRate: 120, estimatedTotal: 2160, category: 'Grains & Staple', forDish: 'Khichuri Rice' },
      { name: 'Bhuna Moong Dal & Masoor Dal', quantity: 8, unit: 'kg', estimatedRate: 150, estimatedTotal: 1200, category: 'Pulses & Dal', forDish: 'Khichuri Lentils' },
      { name: 'Farm Brown Eggs (Dinner Egg Curry)', quantity: 130, unit: 'Pcs', estimatedRate: 11, estimatedTotal: 1430, category: 'Protein & Poultry', forDish: 'Egg Curry (Dinner)' },
      { name: 'Potatoes, Onions & Whole Khichuri Spices', quantity: 15, unit: 'kg', estimatedRate: 70, estimatedTotal: 1050, category: 'Vegetables & Spices', forDish: 'Khichuri Spices' },
    ],
  },
  {
    dayIndex: 5,
    day: 'Fri',
    dayFull: 'Friday',
    lunch: 'Special Biryani',
    dinner: 'Chicken Curry',
    dailyBazarItems: [
      { name: 'Special Biryani Broiler/Sonali Chicken', quantity: 35, unit: 'kg', estimatedRate: 230, estimatedTotal: 8050, category: 'Protein & Poultry', forDish: 'Special Biryani (Lunch)' },
      { name: 'Aromatic Kalijira/Chinigura Polao Rice', quantity: 25, unit: 'kg', estimatedRate: 130, estimatedTotal: 3250, category: 'Grains & Staple', forDish: 'Biryani Rice' },
      { name: 'Aarong Pure Ghee, Liquid Milk & Shahi Biryani Spices', quantity: 4, unit: 'kg', estimatedRate: 450, estimatedTotal: 1800, category: 'Dairy & Others', forDish: 'Biryani Flavoring' },
      { name: 'Salad Items (Cucumber, Deshi Tomatoes, Chillies, Lemons)', quantity: 12, unit: 'kg', estimatedRate: 75, estimatedTotal: 900, category: 'Vegetables & Spices', forDish: 'Fresh Salad' },
      { name: 'Fresh Broiler Chicken (Dinner Curry)', quantity: 22, unit: 'kg', estimatedRate: 210, estimatedTotal: 4620, category: 'Protein & Poultry', forDish: 'Chicken Curry (Dinner)' },
      { name: 'Curry Potatoes & Onions', quantity: 18, unit: 'kg', estimatedRate: 50, estimatedTotal: 900, category: 'Vegetables & Spices', forDish: 'Dinner Gravy' },
    ],
  },
  {
    dayIndex: 6,
    day: 'Sat',
    dayFull: 'Saturday',
    lunch: 'Pangas/Rui',
    dinner: 'Egg Masala',
    dailyBazarItems: [
      { name: 'Fresh Fish (Pangas/Rui Fresh Catch)', quantity: 28, unit: 'kg', estimatedRate: 240, estimatedTotal: 6720, category: 'Fish & Seafood', forDish: 'Pangas/Rui Fish (Lunch)' },
      { name: 'Farm Brown Eggs (Layer)', quantity: 130, unit: 'Pcs', estimatedRate: 11, estimatedTotal: 1430, category: 'Protein & Poultry', forDish: 'Egg Masala (Dinner)' },
      { name: 'Munshiganj Potatoes & Fresh Tomatoes', quantity: 25, unit: 'kg', estimatedRate: 45, estimatedTotal: 1125, category: 'Vegetables & Spices', forDish: 'Egg Masala Gravy' },
      { name: 'Deshi Onions, Ginger, Garlic & Green Chillies', quantity: 12, unit: 'kg', estimatedRate: 80, estimatedTotal: 960, category: 'Vegetables & Spices', forDish: 'Fish Curry Base' },
    ],
  },
];

export const MONTHLY_BULK_STAPLES = [
  { name: 'Miniket Rice (50kg Bag)', quantity: 12, unit: 'Bags', estimatedRate: 3600, estimatedTotal: 43200, category: 'Grains & Staple', usedFor: 'All 7 Days (Daily Lunch & Dinner Rice)' },
  { name: 'Rupchanda Fortified Soybean Oil (16L Tin)', quantity: 5, unit: 'Tins', estimatedRate: 2750, estimatedTotal: 13750, category: 'Oils & Fats', usedFor: 'All 7 Days (Daily Cooking & Frying)' },
  { name: 'Premium Masoor Dal (50kg Bag)', quantity: 2, unit: 'Bags', estimatedRate: 6800, estimatedTotal: 13600, category: 'Pulses & Dal', usedFor: 'Wed Dal & Bhorta, Thu Khichuri & Daily Dal' },
  { name: 'Local Red Onions Wholesale Sack (40kg Bag)', quantity: 4, unit: 'Bags', estimatedRate: 2400, estimatedTotal: 9600, category: 'Vegetables & Spices', usedFor: 'All Weekly Curries Base' },
  { name: 'Chinigura / Kalijira Polao Rice (25kg Bag)', quantity: 3, unit: 'Bags', estimatedRate: 3100, estimatedTotal: 9300, category: 'Grains & Staple', usedFor: 'Friday Special Biryani & Thursday Khichuri' },
  { name: 'Whole & Powdered Spices Pack (Turmeric, Chilli, Cumin, Coriander)', quantity: 18, unit: 'kg', estimatedRate: 320, estimatedTotal: 5760, category: 'Vegetables & Spices', usedFor: 'All 7 Days Curries & Biryani' },
  { name: 'Wholesale Garlic & Ginger Sacks (20kg Bag)', quantity: 2, unit: 'Bags', estimatedRate: 3200, estimatedTotal: 6400, category: 'Vegetables & Spices', usedFor: 'All Fish, Chicken & Beef Preparations' },
  { name: 'Ispahani Tea (5kg) & Fresh Sugar (25kg Bag)', quantity: 1, unit: 'Lot', estimatedRate: 4800, estimatedTotal: 4800, category: 'Dairy & Others', usedFor: 'Daily Dining Staff & Student Tea' },
];

export function getRosterForDate(dateStr) {
  if (!dateStr) return WEEKLY_MESS_ROSTER[0];
  const d = new Date(dateStr + 'T12:00:00');
  const dayIndex = isNaN(d.getDay()) ? 0 : d.getDay();
  return WEEKLY_MESS_ROSTER[dayIndex] || WEEKLY_MESS_ROSTER[0];
}

export function getStockUsageForRoster(itemName) {
  const name = (itemName || '').toLowerCase();
  if (name.includes('chicken') || name.includes('poultry')) {
    return {
      procurementType: 'Daily Bazar',
      categoryBadge: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      dishes: 'Sun Lunch (Bhuna), Thu Lunch (Khichuri), Fri Lunch (Biryani) & Dinner (Curry)'
    };
  }
  if (name.includes('egg') || name.includes('dim')) {
    return {
      procurementType: 'Daily Bazar',
      categoryBadge: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      dishes: 'Sun Dinner (Dim Curry), Tue Lunch (Egg Curry), Thu Dinner (Egg Curry), Sat Dinner (Egg Masala)'
    };
  }
  if (name.includes('rui') || name.includes('pangash') || name.includes('pangas') || name.includes('fish')) {
    return {
      procurementType: 'Daily Bazar',
      categoryBadge: 'bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      dishes: 'Mon Lunch (Rui Fish), Tue Dinner (Pangash Fish), Sat Lunch (Pangas/Rui)'
    };
  }
  if (name.includes('beef') || name.includes('meat')) {
    return {
      procurementType: 'Daily Bazar',
      categoryBadge: 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      dishes: 'Wed Lunch (Beef/Special Feast)'
    };
  }
  if (name.includes('vegetable') || name.includes('sabji') || name.includes('potol') || name.includes('papaya')) {
    return {
      procurementType: 'Daily Bazar',
      categoryBadge: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      dishes: 'Mon Dinner (Mixed Sabji), Daily Curries'
    };
  }
  if (name.includes('potato') || name.includes('aloo')) {
    return {
      procurementType: 'Daily Bazar',
      categoryBadge: 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      dishes: 'Wed Dinner (Aloo Bhorta), All Daily Curries Gravy'
    };
  }
  if (name.includes('polao') || name.includes('kalijira') || name.includes('chinigura')) {
    return {
      procurementType: 'Monthly Stock',
      categoryBadge: 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      dishes: 'Fri Lunch (Special Biryani), Thu Lunch (Chicken Khichuri)'
    };
  }
  if (name.includes('rice') || name.includes('miniket') || name.includes('chal')) {
    return {
      procurementType: 'Monthly Stock',
      categoryBadge: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      dishes: 'All 7 Days (Daily Lunch & Dinner Steamed Rice)'
    };
  }
  if (name.includes('oil') || name.includes('soybean') || name.includes('mustard')) {
    return {
      procurementType: 'Monthly Stock',
      categoryBadge: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      dishes: 'All 7 Days (Daily Cooking, Deep Frying, Bhorta)'
    };
  }
  if (name.includes('dal') || name.includes('lentil') || name.includes('masoor') || name.includes('moong')) {
    return {
      procurementType: 'Monthly Stock',
      categoryBadge: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      dishes: 'Wed Dinner (Dal & Bhorta), Thu (Khichuri), Daily Tarka Dal'
    };
  }
  if (name.includes('spice') || name.includes('masala') || name.includes('chilli') || name.includes('turmeric') || name.includes('cumin') || name.includes('onion') || name.includes('garlic') || name.includes('ginger')) {
    return {
      procurementType: 'Monthly Stock',
      categoryBadge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      dishes: 'All 7 Days (Curry Bases, Gravies & Marinades)'
    };
  }
  if (name.includes('tea') || name.includes('sugar') || name.includes('milk') || name.includes('ghee')) {
    return {
      procurementType: 'Monthly Stock',
      categoryBadge: 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      dishes: 'Daily Staff & Student Tea, Friday Biryani Ghee'
    };
  }
  return {
    procurementType: 'Kitchen Staple',
    categoryBadge: 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
    dishes: 'General Kitchen Provision'
  };
}

