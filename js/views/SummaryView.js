import View from './View.js';
import {
  escapeHtml,
  formatCurrency,
  formatHectares,
  formatNumber,
} from '../utils/format.js';

export default class SummaryView extends View {
  constructor() {
    super('.view-summary');
  }

  addHandlerFilter(handler) {
    this._parentElement.addEventListener('change', (event) => {
      const select = event.target.closest('[data-role="season-filter"]');
      if (!select) return;
      handler(select.value);
    });
  }

  _generateMarkup() {
    const { stats, seasons, season } = this._data;

    const filter = `
      <div class="summary__toolbar">
        <label class="summary__filter">
          <span>Showing</span>
          <select data-role="season-filter" aria-label="Filter summary by season">
            <option value="all" ${season === 'all' ? 'selected' : ''}>All seasons</option>
            ${seasons
              .map(
                (item) =>
                  `<option value="${escapeHtml(item)}" ${season === item ? 'selected' : ''}>${escapeHtml(item)}</option>`,
              )
              .join('')}
          </select>
        </label>
        <p class="summary__count">
          ${stats.cropCount} ${stats.cropCount === 1 ? 'crop' : 'crops'} ·
          ${formatHectares(stats.totalArea)} ·
          ${stats.entryCount} ${stats.entryCount === 1 ? 'entry' : 'entries'}
        </p>
      </div>
    `;

    if (!stats.cropCount) {
      return `
        ${filter}
        <div class="empty empty--compact">
          <h3>Nothing planted in this season yet</h3>
          <p>Add a crop with this season or pick “All seasons” to see your other records.</p>
        </div>
      `;
    }

    return `
      ${filter}
      ${this._generateKpis(stats)}
      <div class="summary__split">
        ${this._generateBreakdown(stats)}
        ${this._generateNote(stats, season)}
      </div>
    `;
  }

  _generateKpis(stats) {
    const profitClass = stats.profit >= 0 ? 'kpi--positive' : 'kpi--negative';
    const roiText =
      stats.roi === null
        ? 'No costs logged yet'
        : `${formatNumber(Math.abs(stats.roi))}% ${stats.roi >= 0 ? 'return on costs' : 'below costs'}`;

    return `
      <div class="kpis">
        <article class="kpi">
          <span class="kpi__label">Planted area</span>
          <strong class="kpi__value">${formatHectares(stats.totalArea)}</strong>
          <span class="kpi__sub">${stats.statusCounts.Growing} growing · ${stats.statusCounts.Harvested} harvested</span>
        </article>

        <article class="kpi">
          <span class="kpi__label">Income</span>
          <strong class="kpi__value money--in">${formatCurrency(stats.income)}</strong>
          <span class="kpi__sub">${stats.incomeCount} income ${stats.incomeCount === 1 ? 'entry' : 'entries'}</span>
        </article>

        <article class="kpi">
          <span class="kpi__label">Costs</span>
          <strong class="kpi__value">${formatCurrency(stats.expenses)}</strong>
          <span class="kpi__sub">${stats.expenseCount} expense ${stats.expenseCount === 1 ? 'entry' : 'entries'}</span>
        </article>

        <article class="kpi kpi--profit ${profitClass}">
          <span class="kpi__label">Net profit</span>
          <strong class="kpi__value">${formatCurrency(stats.profit)}</strong>
          <span class="kpi__sub">${roiText}</span>
        </article>
      </div>
    `;
  }

  _generateBreakdown(stats) {
    const crops = [...stats.breakdown].sort((a, b) => b.profit - a.profit);
    const maxAbs = Math.max(...crops.map((crop) => Math.abs(crop.profit)), 1);

    return `
      <div class="summary__breakdown">
        <h3>Profit by crop</h3>
        <ul class="bars">
          ${crops
            .map((crop) => {
              const width = Math.min((Math.abs(crop.profit) / maxAbs) * 100, 100);
              const tone = crop.profit >= 0 ? 'bar__fill--positive' : 'bar__fill--negative';
              const amountClass = crop.profit >= 0 ? 'money--in' : 'money--out';

              return `
                <li class="bar">
                  <div class="bar__head">
                    <span class="bar__name">${escapeHtml(crop.name)}</span>
                    <span class="bar__amount ${amountClass}">${formatCurrency(crop.profit)}</span>
                  </div>
                  <div class="bar__track" role="presentation">
                    <span class="bar__fill ${tone}" style="width: ${width.toFixed(1)}%"></span>
                  </div>
                </li>
              `;
            })
            .join('')}
        </ul>
      </div>
    `;
  }

  _generateNote(stats, season) {
    const seasonLabel = season === 'all' ? 'All recorded seasons' : season;
    const best = stats.bestCrop;
    const bestLine =
      best && best.profit > 0
        ? `<strong>${escapeHtml(best.name)}</strong> leads with ${formatCurrency(best.profit)} profit.`
        : 'No crop is in profit yet — log harvest income to see returns.';

    const growingLine = stats.statusCounts.Growing
      ? `${stats.statusCounts.Growing} ${stats.statusCounts.Growing === 1 ? 'crop is' : 'crops are'} still growing, so this season's income can still change.`
      : 'All crops in this view are harvested and their income is complete.';

    return `
      <aside class="summary__note">
        <p class="summary__season-label">${escapeHtml(seasonLabel)}</p>
        <h3>Season at a glance</h3>
        <p>${stats.cropCount} ${stats.cropCount === 1 ? 'crop' : 'crops'} across ${formatHectares(stats.totalArea)} with ${stats.entryCount} logged ${stats.entryCount === 1 ? 'entry' : 'entries'}.</p>
        <p>${bestLine}</p>
        <p class="summary__muted">${growingLine}</p>
        <div class="summary__status">
          <span class="status-pill status-pill--planned">${stats.statusCounts.Planned} planned</span>
          <span class="status-pill status-pill--growing">${stats.statusCounts.Growing} growing</span>
          <span class="status-pill status-pill--harvested">${stats.statusCounts.Harvested} harvested</span>
        </div>
      </aside>
    `;
  }
}
