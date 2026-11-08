import View from './View.js';
import { escapeHtml } from '../utils/format.js';

export default class CropFormView extends View {
  constructor() {
    super('.view-crop-form');
  }

  addHandlerSubmit(handler) {
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
      if (!field) return;
      field.classList.remove('field--invalid');
      event.target.removeAttribute('aria-invalid');
    });
  }

  addHandlerCancel(handler) {
    this._parentElement.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action="cancel"]');
      if (!button) return;
      handler();
    });
  }

  _validate(data) {
    const errors = [];

    if (!data.name?.trim()) {
      errors.push({ field: 'name', message: 'Crop name is required.' });
    }
    if (!data.plot?.trim()) {
      errors.push({ field: 'plot', message: 'Plot or barangay is required.' });
    }

    const area = Number(data.area);
    if (!Number.isFinite(area) || area <= 0) {
      errors.push({ field: 'area', message: 'Area must be greater than 0 hectares.' });
    }

    if (!data.plantedOn) {
      errors.push({ field: 'plantedOn', message: 'Planting date is required.' });
    }
    if (!data.expectedHarvest) {
      errors.push({ field: 'expectedHarvest', message: 'Expected harvest date is required.' });
    }
    if (data.plantedOn && data.expectedHarvest && data.expectedHarvest < data.plantedOn) {
      errors.push({
        field: 'expectedHarvest',
        message: 'Expected harvest cannot be before the planting date.',
      });
    }

    if (!data.season) {
      errors.push({ field: 'season', message: 'Choose a season.' });
    }
    if (!data.status) {
      errors.push({ field: 'status', message: 'Choose a crop status.' });
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

  _generateMarkup() {
    const { crop, seasons, cropNames, plotNames, statuses } = this._data;
    const isEditing = Boolean(crop);
    const value = (key) => escapeHtml(crop?.[key] ?? '');

    const seasonOptions = seasons
      .map(
        (season) =>
          `<option value="${escapeHtml(season)}" ${season === crop?.season ? 'selected' : ''}>${escapeHtml(season)}</option>`,
      )
      .join('');

    const statusOptions = statuses
      .map(
        (status) =>
          `<option value="${escapeHtml(status)}" ${status === (crop?.status ?? 'Growing') ? 'selected' : ''}>${escapeHtml(status)}</option>`,
      )
      .join('');

    return `
      <form class="form" novalidate>
        ${
          isEditing
            ? `<p class="form__banner">
                <span class="form__banner-dot" aria-hidden="true"></span>
                Editing <strong>${escapeHtml(crop.name)}</strong>. Changes save to the same record.
              </p>`
            : ''
        }

        <div class="form__error" data-error role="alert" aria-live="polite"></div>

        <div class="form__grid">
          <label class="field field--wide">
            <span>Crop name <b aria-hidden="true">*</b></span>
            <input type="text" name="name" value="${value('name')}" list="crop-names" placeholder="Rice, corn, abaca…" autocomplete="off" />
          </label>

          <label class="field">
            <span>Variety <em>optional</em></span>
            <input type="text" name="variety" value="${value('variety')}" placeholder="NSIC Rc 222" autocomplete="off" />
          </label>

          <label class="field">
            <span>Plot / barangay <b aria-hidden="true">*</b></span>
            <input type="text" name="plot" value="${value('plot')}" list="plot-names" placeholder="Purok 2, Banganga" autocomplete="off" />
          </label>

          <label class="field">
            <span>Area (hectares) <b aria-hidden="true">*</b></span>
            <input type="number" name="area" value="${value('area')}" min="0.01" step="0.01" placeholder="1.5" />
          </label>

          <label class="field">
            <span>Season <b aria-hidden="true">*</b></span>
            <select name="season">${seasonOptions}</select>
          </label>

          <label class="field">
            <span>Planted on <b aria-hidden="true">*</b></span>
            <input type="date" name="plantedOn" value="${value('plantedOn')}" />
          </label>

          <label class="field">
            <span>Expected harvest <b aria-hidden="true">*</b></span>
            <input type="date" name="expectedHarvest" value="${value('expectedHarvest')}" />
          </label>

          <label class="field">
            <span>Status <b aria-hidden="true">*</b></span>
            <select name="status">${statusOptions}</select>
          </label>

          <label class="field field--wide">
            <span>Notes <em>optional</em></span>
            <textarea name="notes" rows="2" placeholder="Irrigation, fertilizer schedule, buyer…">${value('notes')}</textarea>
          </label>
        </div>

        <div class="form__actions">
          <button class="btn btn--primary" type="submit">
            ${isEditing ? 'Save changes' : 'Add crop'}
          </button>
          ${
            isEditing
              ? '<button class="btn btn--ghost" type="button" data-action="cancel">Cancel edit</button>'
              : ''
          }
        </div>

        <datalist id="crop-names">
          ${cropNames.map((name) => `<option value="${escapeHtml(name)}"></option>`).join('')}
        </datalist>
        <datalist id="plot-names">
          ${plotNames.map((name) => `<option value="${escapeHtml(name)}"></option>`).join('')}
        </datalist>
      </form>
    `;
  }
}
