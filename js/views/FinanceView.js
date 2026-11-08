import View from './View.js';
import {
  escapeHtml,
  formatCurrency,
  formatDate,
  todayISO,
} from '../utils/format.js';

export default class FinanceView extends View {
  constructor() {
    super('.view-finance');
  }

  addHandlerAddEntry(handler) {
    this._parentElement.addEventListener('submit', (event) => {
      const form = event.target.closest('form');
      if (!form) return;
      event.preventDefault();

      const data = Object.fromEntries(new FormData(form).entries());
      const errors = this._validate(data);

      if (errors.length) {
        this._showErrors(errors, form);
        return;
      }

      this._clearErrors(form);
      handler(data);
    });

    this._parentElement.addEventListener('input', (event) => {
      const field = event.target.closest('.field--invalid');
      if (field) {
        field.classList.remove('field--invalid');
        event.target.removeAttribute('aria-invalid');
      }
      this._updatePreview();
    });

    this._parentElement.addEventListener('change', () => this._updatePreview());
  }

  addHandlerDeleteEntry(handler) {
    this._parentElement.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action="delete-entry"]');
      if (!button) return;
      if (!window.confirm('Delete this finance entry? The totals will update right away.')) return;
      handler(button.dataset.id);
    });
  }

  _validate(data) {
    const errors = [];

    if (!['income', 'expense'].includes(data.type)) {
      errors.push({ field: 'type', message: 'Choose income or expense.' });
    }
    if (!data.cropId || !this._data.statsById[data.cropId]) {
      errors.push({ field: 'cropId', message: 'Choose the crop this entry belongs to.' });
    }

    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push({ field: 'amount', message: 'Amount must be greater than zero.' });
    }
    if (!data.date) {
      errors.push({ field: 'date', message: 'Date is required.' });
    }

    return errors;
  }

  _showErrors(errors, form) {
    const box = form.querySelector('[data-error]');
    const label = errors.length === 1 ? 'field needs' : 'fields need';

    box.innerHTML = `
      <p class="form__error-title">
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <circle cx="10" cy="10" r="9" fill="currentColor" opacity=".14" />
          <path d="M10 5.5v5.5M10 14.2v.3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        ${errors.length} ${label} your attention
      </p>
      <ul>${errors.map((error) => `<li>${escapeHtml(error.message)}</li>`).join('')}</ul>
    `;

    errors.forEach((error) => {
      const input = form.elements.namedItem(error.field);
      if (!input) return;
      input.setAttribute('aria-invalid', 'true');
      input.closest('.field')?.classList.add('field--invalid');
    });

    const firstInput = form.elements.namedItem(errors[0].field);
    firstInput?.focus({ preventScroll: true });
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  _clearErrors(form) {
    form.querySelector('[data-error]').innerHTML = '';
    form.querySelectorAll('.field--invalid').forEach((field) => {
      field.classList.remove('field--invalid');
    });
    form.querySelectorAll('[aria-invalid]').forEach((input) => {
      input.removeAttribute('aria-invalid');
    });
  }

  _updatePreview() {
    const form = this._parentElement.querySelector('form');
    const preview = form?.querySelector('[data-preview]');
    if (!preview) return;

    const type = form.elements.type.value;
    const cropId = form.elements.cropId.value;
    const amount = Number(form.elements.amount.value);
    const crop = this._data.crops.find((item) => item.id === cropId);
    const stats = this._data.statsById[cropId];

    if (!crop || !stats) {
      preview.className = 'preview';
      preview.innerHTML =
        '<span class="preview__hint">Choose a crop to see how this entry changes its profit.</span>';
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      preview.className = 'preview';
      preview.innerHTML = `
        <span class="preview__hint">Current profit for</span>
        <strong>${escapeHtml(crop.name)}</strong>
        <span class="preview__hint">is</span>
        <strong class="${stats.profit >= 0 ? 'money--in' : 'money--out'}">${formatCurrency(stats.profit)}</strong>.
        <span class="preview__hint">Type an amount to preview the change.</span>
      `;
      return;
    }

    const projected = stats.profit + (type === 'income' ? amount : -amount);
    const projectedClass = projected >= 0 ? 'money--in' : 'money--out';

    preview.className = `preview preview--${projected >= 0 ? 'positive' : 'negative'}`;
    preview.innerHTML = `
      <span class="preview__hint">After this ${type},</span>
      <strong>${escapeHtml(crop.name)}</strong>
      <span class="preview__hint">is projected at</span>
      <strong class="preview__value ${projectedClass}">${formatCurrency(projected)}</strong>
      <span class="preview__hint">profit.</span>
    `;
  }

  _generateMarkup() {
    const { crops, entries, statsById, categories } = this._data;

    const cropOptions = crops
      .map(
        (crop) =>
          `<option value="${crop.id}">${escapeHtml(crop.name)} · ${escapeHtml(crop.plot)}</option>`,
      )
      .join('');

    const entryCount = entries.length;
    const entryWord = entryCount === 1 ? 'entry' : 'entries';

    return `
      <form class="form form--compact" novalidate>
        <div class="form__error" data-error role="alert" aria-live="polite"></div>

        <div class="form__grid form__grid--finance">
          <label class="field">
            <span>Type</span>
            <select name="type">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>

          <label class="field">
            <span>Crop <b aria-hidden="true">*</b></span>
            <select name="cropId">
              <option value="">Select a crop</option>
              ${cropOptions}
            </select>
          </label>

          <label class="field">
            <span>Category</span>
            <input type="text" name="category" list="entry-categories" placeholder="Fertilizer, labor, sale…" autocomplete="off" />
          </label>

          <label class="field">
            <span>Amount (₱) <b aria-hidden="true">*</b></span>
            <input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" />
          </label>

          <label class="field">
            <span>Date <b aria-hidden="true">*</b></span>
            <input type="date" name="date" value="${todayISO()}" />
          </label>

          <label class="field field--wide">
            <span>Note <em>optional</em></span>
            <input type="text" name="note" placeholder="Buyer, supplier, or batch" autocomplete="off" />
          </label>
        </div>

        <p class="preview" data-preview aria-live="polite">
          <span class="preview__hint">Choose a crop to see how this entry changes its profit.</span>
        </p>

        <div class="form__actions">
          <button class="btn btn--primary" type="submit">Log entry</button>
        </div>

        <datalist id="entry-categories">
          ${categories.map((category) => `<option value="${escapeHtml(category)}"></option>`).join('')}
        </datalist>
      </form>

      <div class="ledger">
        <div class="ledger__head">
          <h3>Recent entries</h3>
          <span class="ledger__count">${entryCount} ${entryWord}</span>
        </div>

        ${
          entries.length
            ? `<ul class="ledger__list">
                ${entries.map((entry) => this._generateEntry(entry)).join('')}
              </ul>`
            : `<div class="ledger__empty">
                <p>No entries yet. Log a cost or a harvest sale above and the totals will follow.</p>
              </div>`
        }
      </div>
    `;
  }

  _generateEntry(entry) {
    const isIncome = entry.type === 'income';
    const crop = this._data.crops.find((item) => item.id === entry.cropId);
    const cropName = crop?.name ?? 'Deleted crop';
    const note = entry.note ? ` · ${escapeHtml(entry.note)}` : '';
    const sign = isIncome ? '+' : '−';
    const amountClass = isIncome ? 'ledger__amount--in' : 'ledger__amount--out';
    const typeClass = isIncome ? 'ledger__type--income' : 'ledger__type--expense';
    const typeLabel = isIncome ? 'Income' : 'Expense';

    return `
      <li class="ledger__item">
        <span class="ledger__type ${typeClass}" aria-hidden="true">${isIncome ? '+' : '−'}</span>

        <div class="ledger__body">
          <p class="ledger__title">
            ${escapeHtml(entry.category)}
            <span class="ledger__crop">${escapeHtml(cropName)}</span>
          </p>
          <p class="ledger__meta">
            ${formatDate(entry.date)}${note}
            <span class="sr-only">${typeLabel} entry</span>
          </p>
        </div>

        <span class="ledger__amount ${amountClass}">${sign}${formatCurrency(entry.amount)}</span>

        <button
          type="button"
          class="icon-btn"
          data-action="delete-entry"
          data-id="${entry.id}"
          aria-label="Delete ${escapeHtml(entry.category)} entry for ${escapeHtml(cropName)}"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path d="M4 6h12M8 6V4h4v2M6 6l.7 9h6.6L14 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </li>
    `;
  }
}
