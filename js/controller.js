import * as model from './model.js';
import CropListView from './views/CropListView.js';
import CropFormView from './views/CropFormView.js';
import FinanceView from './views/FinanceView.js';
import SummaryView from './views/SummaryView.js';

const cropListView = new CropListView();
const cropFormView = new CropFormView();
const financeView = new FinanceView();
const summaryView = new SummaryView();

let editingCropId = null;

const getCropsWithStats = () =>
  model.state.crops.map((crop) => ({
    ...crop,
    stats: model.getCropStats(crop.id),
  }));

const getStatsById = () =>
  Object.fromEntries(
    model.state.crops.map((crop) => [crop.id, model.getCropStats(crop.id)]),
  );

const getSeasonOptions = () => [
  ...new Set([...model.SEASONS, ...model.getSeasons()]),
];

const controlCropList = () => {
  cropListView.render({ crops: getCropsWithStats() });
};

const controlCropForm = (crop = null) => {
  cropFormView.render({
    crop,
    seasons: getSeasonOptions(),
    cropNames: model.CROP_NAMES,
    plotNames: model.PLOT_NAMES,
    statuses: model.STATUSES,
  });
};

const controlFinance = () => {
  const entries = [...model.state.entries].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt,
  );

  financeView.render({
    crops: model.state.crops,
    entries,
    statsById: getStatsById(),
    categories: model.ENTRY_CATEGORIES,
  });
};

const controlSummary = () => {
  summaryView.render({
    stats: model.getSeasonStats(),
    seasons: getSeasonOptions(),
    season: model.state.season,
  });
};

const controlCropFigures = () => {
  controlCropList();
  controlFinance();
  controlSummary();
};

const controlAddCrop = (data) => {
  model.addCrop(data);
  controlCropForm();
  controlCropFigures();
};

const controlUpdateCrop = (data) => {
  if (!editingCropId) return;
  model.updateCrop(editingCropId, data);
  editingCropId = null;
  controlCropForm();
  controlCropFigures();
};

const controlEditCrop = (id) => {
  const crop = model.getCropById(id);
  if (!crop) return;

  editingCropId = id;
  controlCropForm(crop);
  cropFormView.scrollIntoView();
};

const controlCancelEdit = () => {
  editingCropId = null;
  controlCropForm();
};

const controlDeleteCrop = (id) => {
  model.deleteCrop(id);

  if (editingCropId === id) {
    editingCropId = null;
    controlCropForm();
  }

  controlCropFigures();
};

const controlAddEntry = (data) => {
  model.addEntry(data);
  controlCropFigures();
};

const controlDeleteEntry = (id) => {
  model.deleteEntry(id);
  controlCropFigures();
};

const controlFilterSeason = (season) => {
  model.setSeason(season);
  controlSummary();
};

const init = () => {
  controlCropForm();
  controlCropList();
  controlFinance();
  controlSummary();

  cropFormView.addHandlerSubmit((data) => {
    if (editingCropId) controlUpdateCrop(data);
    else controlAddCrop(data);
  });
  cropFormView.addHandlerCancel(controlCancelEdit);

  cropListView.addHandlerEdit(controlEditCrop);
  cropListView.addHandlerDelete(controlDeleteCrop);

  financeView.addHandlerAddEntry(controlAddEntry);
  financeView.addHandlerDeleteEntry(controlDeleteEntry);

  summaryView.addHandlerFilter(controlFilterSeason);
};

init();
