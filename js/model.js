const STORAGE_KEY = 'anitrack-state-v1';

export const SEASONS = ['2026 Wet Season', '2026 Dry Season', '2027 Wet Season'];
export const STATUSES = ['Planned', 'Growing', 'Harvested'];
export const CROP_NAMES = [
  'Rice',
  'Corn',
  'Banana',
  'Coconut',
  'Abaca',
  'Cacao',
  'Mungbean',
  'Peanut',
  'Cassava',
  'Sugarcane',
];
export const PLOT_NAMES = [
  'Mati',
  'Banganga',
  'Cateel',
  'Baganga',
  'Caraga',
  'Lupon',
  'San Isidro',
  'Governor Generoso',
];
export const ENTRY_CATEGORIES = [
  'Seeds',
  'Fertilizer',
  'Labor',
  'Pesticide',
  'Fuel',
  'Transport',
  'Harvest sale',
  'Fiber sale',
  'Other',
];

const createId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const createSeedState = () => ({
  crops: [
    {
      id: 'crop-rice',
      name: 'Rice',
      variety: 'NSIC Rc 222',
      plot: 'Purok 2, Banganga · Mati',
      area: 1.5,
      plantedOn: '2026-06-12',
      expectedHarvest: '2026-10-05',
      season: '2026 Wet Season',
      status: 'Growing',
      notes: 'Irrigated lowland plot. Second fertilizer round due late August.',
    },
    {
      id: 'crop-corn',
      name: 'Corn',
      variety: 'Pioneer 30T80',
      plot: 'Purok 5 · Mati',
      area: 0.8,
      plantedOn: '2026-07-02',
      expectedHarvest: '2026-09-25',
      season: '2026 Wet Season',
      status: 'Growing',
      notes: 'Rain-fed upland plot planted after the first heavy rains.',
    },
    {
      id: 'crop-banana',
      name: 'Banana',
      variety: 'Lakatan',
      plot: 'Cateel',
      area: 0.5,
      plantedOn: '2026-03-10',
      expectedHarvest: '2026-11-30',
      season: '2026 Wet Season',
      status: 'Growing',
      notes: 'First bunches sold in August while the stand keeps fruiting.',
    },
    {
      id: 'crop-mungbean',
      name: 'Mungbean',
      variety: 'Pagasa 19',
      plot: 'Baganga',
      area: 0.6,
      plantedOn: '2026-04-05',
      expectedHarvest: '2026-06-20',
      season: '2026 Dry Season',
      status: 'Harvested',
      notes: 'Short dry-season catch crop after rice.',
    },
    {
      id: 'crop-abaca',
      name: 'Abaca',
      variety: 'Inosa',
      plot: 'Caraga',
      area: 2.0,
      plantedOn: '2025-11-15',
      expectedHarvest: '2026-10-30',
      season: '2026 Wet Season',
      status: 'Growing',
      notes: 'Fiber stripped and sold in weekly batches through August.',
    },
  ],
  entries: [
    { id: 'entry-01', cropId: 'crop-rice', type: 'expense', category: 'Seeds', amount: 8400, date: '2026-06-10', note: 'Certified seed, 3 sacks' },
    { id: 'entry-02', cropId: 'crop-rice', type: 'expense', category: 'Fertilizer', amount: 12500, date: '2026-07-18', note: 'Urea and complete fertilizer' },
    { id: 'entry-03', cropId: 'crop-rice', type: 'expense', category: 'Labor', amount: 15000, date: '2026-08-02', note: 'Land preparation and transplanting' },
    { id: 'entry-04', cropId: 'crop-corn', type: 'expense', category: 'Seeds', amount: 3200, date: '2026-07-01', note: 'Hybrid corn seed' },
    { id: 'entry-05', cropId: 'crop-corn', type: 'expense', category: 'Fertilizer', amount: 4800, date: '2026-07-22', note: 'First sidedress application' },
    { id: 'entry-06', cropId: 'crop-banana', type: 'expense', category: 'Seeds', amount: 4200, date: '2026-03-08', note: 'Lakatan suckers' },
    { id: 'entry-07', cropId: 'crop-banana', type: 'income', category: 'Harvest sale', amount: 18500, date: '2026-08-16', note: 'First bunch harvest' },
    { id: 'entry-08', cropId: 'crop-mungbean', type: 'expense', category: 'Seeds', amount: 1800, date: '2026-04-03', note: 'Certified mungbean seed' },
    { id: 'entry-09', cropId: 'crop-mungbean', type: 'expense', category: 'Labor', amount: 2500, date: '2026-06-18', note: 'Harvest and threshing help' },
    { id: 'entry-10', cropId: 'crop-mungbean', type: 'income', category: 'Harvest sale', amount: 32000, date: '2026-06-22', note: 'Sold to the Baganga traders' },
    { id: 'entry-11', cropId: 'crop-abaca', type: 'expense', category: 'Seeds', amount: 6000, date: '2025-11-10', note: 'Abaca seedlings' },
    { id: 'entry-12', cropId: 'crop-abaca', type: 'expense', category: 'Fertilizer', amount: 3500, date: '2026-05-14', note: 'Organic fertilizer' },
    { id: 'entry-13', cropId: 'crop-abaca', type: 'income', category: 'Fiber sale', amount: 55000, date: '2026-08-20', note: 'Three weekly fiber batches' },
  ],
  season: 'all',
});

const normalizeCrop = (crop) => ({
  id: crop.id,
  name: String(crop.name ?? '').trim(),
  variety: String(crop.variety ?? '').trim(),
  plot: String(crop.plot ?? '').trim(),
  area: Number(crop.area) || 0,
  plantedOn: crop.plantedOn ?? '',
  expectedHarvest: crop.expectedHarvest ?? '',
  season: crop.season ?? SEASONS[0],
  status: STATUSES.includes(crop.status) ? crop.status : 'Growing',
  notes: String(crop.notes ?? '').trim(),
});

const normalizeEntry = (entry) => ({
  id: entry.id,
  cropId: entry.cropId,
  type: entry.type === 'income' ? 'income' : 'expense',
  category: String(entry.category ?? 'Other').trim() || 'Other',
  amount: Number(entry.amount) || 0,
  date: entry.date ?? '',
  note: String(entry.note ?? '').trim(),
  createdAt: Number(entry.createdAt) || Date.now(),
});

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && Array.isArray(saved.crops) && Array.isArray(saved.entries)) {
        return {
          crops: saved.crops.filter((crop) => crop && crop.id).map(normalizeCrop),
          entries: saved.entries.filter((entry) => entry && entry.id && entry.cropId).map(normalizeEntry),
          season: typeof saved.season === 'string' ? saved.season : 'all',
        };
      }
    }
  } catch (error) {
    console.warn('AniTrack could not read saved data. Starting with the sample records.', error);
  }
  return createSeedState();
};

export const state = loadState();

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('AniTrack could not save to localStorage.', error);
  }
};

export const getCropById = (id) => state.crops.find((crop) => crop.id === id) ?? null;

export const getSeasons = () =>
  [...new Set(state.crops.map((crop) => crop.season).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );

export const getCropsForSeason = (season = state.season) =>
  season === 'all' ? [...state.crops] : state.crops.filter((crop) => crop.season === season);

export const getCropStats = (cropId) => {
  let income = 0;
  let expenses = 0;
  let entryCount = 0;

  state.entries.forEach((entry) => {
    if (entry.cropId !== cropId) return;
    entryCount += 1;
    if (entry.type === 'income') income += entry.amount;
    else expenses += entry.amount;
  });

  return { income, expenses, profit: income - expenses, entryCount };
};

export const getSeasonStats = (season = state.season) => {
  const crops = getCropsForSeason(season);
  const cropIds = new Set(crops.map((crop) => crop.id));

  let income = 0;
  let expenses = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  state.entries.forEach((entry) => {
    if (!cropIds.has(entry.cropId)) return;
    if (entry.type === 'income') {
      income += entry.amount;
      incomeCount += 1;
    } else {
      expenses += entry.amount;
      expenseCount += 1;
    }
  });

  const totalArea = crops.reduce((sum, crop) => sum + crop.area, 0);
  const profit = income - expenses;
  const breakdown = crops.map((crop) => ({
    id: crop.id,
    name: crop.name,
    status: crop.status,
    ...getCropStats(crop.id),
  }));

  const statusCounts = { Planned: 0, Growing: 0, Harvested: 0 };
  crops.forEach((crop) => {
    statusCounts[crop.status] = (statusCounts[crop.status] ?? 0) + 1;
  });

  const bestCrop = breakdown.reduce(
    (best, crop) => (best === null || crop.profit > best.profit ? crop : best),
    null,
  );

  return {
    season,
    cropCount: crops.length,
    totalArea,
    income,
    expenses,
    profit,
    roi: expenses > 0 ? (profit / expenses) * 100 : null,
    incomeCount,
    expenseCount,
    entryCount: incomeCount + expenseCount,
    breakdown,
    bestCrop,
    statusCounts,
  };
};

export const addCrop = (cropData) => {
  const crop = normalizeCrop({ ...cropData, id: createId('crop') });
  state.crops.push(crop);
  persist();
  return crop;
};

export const updateCrop = (id, updates) => {
  const index = state.crops.findIndex((crop) => crop.id === id);
  if (index === -1) return null;

  const updated = normalizeCrop({ ...state.crops[index], ...updates, id });
  state.crops[index] = updated;
  persist();
  return updated;
};

export const deleteCrop = (id) => {
  const exists = state.crops.some((crop) => crop.id === id);
  if (!exists) return false;

  state.crops = state.crops.filter((crop) => crop.id !== id);
  state.entries = state.entries.filter((entry) => entry.cropId !== id);
  persist();
  return true;
};

export const addEntry = (entryData) => {
  const entry = normalizeEntry({
    ...entryData,
    id: createId('entry'),
    createdAt: Date.now(),
  });
  state.entries.push(entry);
  persist();
  return entry;
};

export const deleteEntry = (id) => {
  const exists = state.entries.some((entry) => entry.id === id);
  if (!exists) return false;

  state.entries = state.entries.filter((entry) => entry.id !== id);
  persist();
  return true;
};

export const setSeason = (season) => {
  state.season = season || 'all';
  persist();
};
