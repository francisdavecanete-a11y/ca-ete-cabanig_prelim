import View from './View.js';
import {
  escapeHtml,
  formatCurrency,
  formatHectares,
  formatShortDate,
} from '../utils/format.js';

const STATUS_CLASS = {
  Planned: 'badge--planned',
  Growing: 'badge--growing',
  Harvested: 'badge--harvested',
};

export default class CropListView extends View {
  constructor() {
    super('.view-crop-list');
  }

  addHandlerEdit(handler) {
    this._parentElement.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action="edit"]');
      if (!button) return;
      handler(button.dataset.id);
    });
  }

  addHandlerDelete(handler) {
    this._parentElement.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action="delete"]');
      if (!button) return;

      const card = button.closest('.crop-card');
      const name = card?.dataset.name ?? 'this crop';
      const confirmed = window.confirm(
        `Delete ${name}? Its expense and income entries will be removed too.`,
      );
      if (!confirmed) return;

      handler(button.dataset.id);
    });
  }

  _generateMarkup() {
    const crops = this._data.crops;

    if (!crops.length) {
      return `
        <div class="empty">
          <div class="empty__art" aria-hidden="true">
            <svg viewBox="0 0 64 64" focusable="false">
              <circle cx="32" cy="32" r="30" fill="var(--lime-200)" />
              <path d="M32 48V27" stroke="var(--green-700)" stroke-width="3" stroke-linecap="round" />
              <path d="M32 35c-10 0-15-6-15-15 9 0 15 5 15 15Z" fill="var(--green-600)" />
              <path d="M32 29c0-9 5-14 14-14 0 9-5 14-14 14Z" fill="var(--gold-500)" />
            </svg>
          </div>
          <h3>No crops yet</h3>
          <p>Add your first crop with the form beside this list and its numbers will appear here.</p>
        </div>
      `;
    }

    const totalArea = crops.reduce((sum, crop) => sum + crop.area, 0);
    const cropWord = crops.length === 1 ? 'crop' : 'crops';

    return `
      <p class="list-meta">
        <span><strong>${crops.length}</strong> ${cropWord}</span>
        <span class="list-meta__dot" aria-hidden="true"></span>
        <span><strong>${formatHectares(totalArea)}</strong> under management</span>
      </p>
      <div class="crop-list">
        ${crops.map((crop) => this._generateCrop(crop)).join('')}
      </div>
    `;
  }

  _generateCrop(crop) {
    const { stats } = crop;
    const statusClass = STATUS_CLASS[crop.status] ?? 'badge--planned';
    const profitClass = stats.profit >= 0 ? 'money--in' : 'money--out';
    const notes = crop.notes
      ? `<p class="crop-card__notes">${escapeHtml(crop.notes)}</p>`
      : '';

    return `
      <article class="crop-card" data-id="${crop.id}" data-name="${escapeHtml(crop.name)}">
        <header class="crop-card__top">
          <div class="crop-card__title">
            <h3>
              ${escapeHtml(crop.name)}
              ${crop.variety ? `<span>${escapeHtml(crop.variety)}</span>` : ''}
            </h3>
            <p class="crop-card__plot">${escapeHtml(crop.plot)}</p>
          </div>
          <span class="badge ${statusClass}">${escapeHtml(crop.status)}</span>
        </header>

        <div class="crop-card__meta">
          <span class="chip chip--area">${formatHectares(crop.area)}</span>
          <span class="chip">${escapeHtml(crop.season)}</span>
          <span class="chip chip--muted">Planted ${formatShortDate(crop.plantedOn)}</span>
          <span class="chip chip--muted">Harvest ${formatShortDate(crop.expectedHarvest)}</span>
        </div>

        ${notes}

        <dl class="crop-card__figures">
          <div>
            <dt>Income</dt>
            <dd class="money money--in">${formatCurrency(stats.income)}</dd>
          </div>
          <div>
            <dt>Costs</dt>
            <dd class="money">${formatCurrency(stats.expenses)}</dd>
          </div>
          <div>
            <dt>Profit</dt>
            <dd class="money ${profitClass}">${formatCurrency(stats.profit)}</dd>
          </div>
        </dl>

        <div class="crop-card__actions">
          <button type="button" class="btn btn--ghost btn--sm" data-action="edit" data-id="${crop.id}">
            Edit crop
          </button>
          <button type="button" class="btn btn--danger-ghost btn--sm" data-action="delete" data-id="${crop.id}">
            Delete
          </button>
        </div>
      </article>
    `;
  }
}
