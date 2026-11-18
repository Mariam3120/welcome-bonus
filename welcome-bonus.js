// ========Helper functions

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// to wrap highlighted(pink) part of title in span
function highlight(text, part) {
  const safeText = escapeHtml(text);
  if (!part || !text.includes(part)) return safeText;
  const safePart = escapeHtml(part);
  return safeText.replace(safePart, () => `<em class="wb-accent">${safePart}</em>`);
}

// for formatting number -> "1 000"
function formatNumber(number) {
  return String(number).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
}

//icnons
const plusIcon = `
  <svg class="wb-icon" viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="8" fill="currentColor"/>
    <path d="M8 4.5v7M4.5 8h7" stroke="#0f9d2a" stroke-width="2" stroke-linecap="round"/>
  </svg>`;

const chevronIcon = `
  <svg class="wb-icon wb-rule__chevron" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

// ============Section templates
//-here starts hero -

function renderHero(hero) {
  return `
    <section class="wb-hero">
      <h1 class="wb-hero__title">${highlight(hero.title, hero.titleHighlight)}</h1>
      <p class="wb-hero__subtitle">${escapeHtml(hero.subtitle)}</p>
    </section>`;
}

//-here starts 4 summary cards 
function renderSummary(items) {
  const cards = items.map((item) => `
    <li class="wb-summary__item ${item.highlighted ? 'wb-summary__item--highlighted' : ''}">
      <strong class="wb-summary__value">${escapeHtml(item.value)}</strong>
      <span class="wb-summary__label">${escapeHtml(item.label)}</span>
    </li>`).join('');

  return `<ul class="wb-summary">${cards}</ul>`;
}
//1.freespins block (register + deposit)
function renderFreespins(count, game, labels) {
  return `
    <div class="wb-freespins">
      <span class="wb-freespins__count">${escapeHtml(count)}</span>
      <span class="wb-freespins__info">
        <span class="wb-freespins__label">${escapeHtml(labels.freespin)}</span>
        <span class="wb-freespins__game">${escapeHtml(game)}</span>
      </span>
    </div>`;
}

function renderRegister(register, labels, number) {
  return `
    <section class="wb-section">
      <h2 class="wb-section__title">${number}. ${escapeHtml(register.title)}</h2>
      <div class="wb-card wb-register">
        <img class="wb-register__image" src="${escapeHtml(register.image)}" alt="${escapeHtml(register.game)}">
        <div class="wb-register__content">
          <h3 class="wb-card__heading">${escapeHtml(register.text)}</h3>
          ${renderFreespins(register.freespins, register.game, labels)}
          <a class="wb-button wb-button--green" href="${escapeHtml(register.url)}">${escapeHtml(register.button)}</a>
        </div>
      </div>
    </section>`;
}

//2. deposit 
function renderDeposit(deposit, labels, number) {
  const lastIndex = deposit.tiers.length - 1;

  const rows = deposit.tiers.map((tier, index) => {
    const amount = tier.to === null
      ? `${tier.from}${deposit.currency} ${labels.tierOrMore}`
      : `${tier.from} - ${tier.to} ${deposit.currency}`;

    return `
      <tr class="${index === lastIndex ? 'wb-tiers__row--top' : ''}">
        <td>${escapeHtml(amount)}</td>
        <td>${escapeHtml(tier.freespins)} ${escapeHtml(labels.fs)}</td>
      </tr>`;
  }).join('');

  return `
    <section class="wb-section">
      <h2 class="wb-section__title">${number}. ${escapeHtml(deposit.title)}</h2>
      <div class="wb-card wb-deposit">
        <h3 class="wb-card__heading">${escapeHtml(deposit.text)}</h3>
        <div class="wb-deposit__row">
          ${renderFreespins(deposit.freespins, deposit.game, labels)}
          <a class="wb-button wb-button--green" href="${escapeHtml(deposit.url)}">${escapeHtml(deposit.button)} ${plusIcon}</a>
        </div>
        <table class="wb-tiers">
          <thead>
            <tr>
              <th scope="col">${escapeHtml(labels.tierAmount)}</th>
              <th scope="col">${escapeHtml(labels.tierReward)}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>`;
}

//3. COUNTDOWN, progress and slots
function renderCountdown(labels) {
  const units = ['days', 'hours', 'minutes', 'seconds'];

  const cells = units.map((unit) => `
    <span class="wb-countdown__unit">
      <span class="wb-countdown__value" data-unit="${unit}">00</span>
      <span class="wb-countdown__name">${escapeHtml(labels[unit])}</span>
    </span>`).join('<span class="wb-countdown__separator" aria-hidden="true">:</span>');

  return `
    <div class="wb-countdown" role="timer">
      <span class="wb-countdown__label" data-countdown-label>${escapeHtml(labels.countdownTitle)}</span>
      <div class="wb-countdown__units">${cells}</div>
    </div>`;
}

function renderProgress(missions, labels) {
  const { current, currency } = missions.progress;
  const max = Math.max(...missions.milestones.map((m) => m.amount));
  const percent = Math.min((current / max) * 100, 100);

  const amounts = missions.milestones.map((m) => `
    <span class="wb-progress__mark" style="left: ${(m.amount / max) * 100}%">
      ${formatNumber(m.amount)}${escapeHtml(currency)}
    </span>`).join('');

  const rewards = missions.milestones.map((m) => `
    <span class="wb-progress__mark" style="left: ${(m.amount / max) * 100}%">
      ${escapeHtml(m.reward)}
      <img class="wb-progress__icon" src="${escapeHtml(m.rewardIcon)}" alt="${escapeHtml(labels.fs)}">
    </span>`).join('');

  const ticks = missions.milestones.map((m) => `
    <span class="wb-progress__tick" style="left: ${(m.amount / max) * 100}%"></span>`).join('');

  return `
    <div class="wb-progress">
      <span class="wb-progress__label">${escapeHtml(labels.progress)}</span>
      <div class="wb-progress__marks">${amounts}</div>

      <div class="wb-progress__track"
           role="progressbar"
           aria-label="${escapeHtml(labels.progress)}"
           aria-valuemin="0"
           aria-valuemax="${max}"
           aria-valuenow="${current}">
        <div class="wb-progress__fill" style="width: ${percent}%"></div>
        ${ticks}
        <span class="wb-progress__badge" style="left: ${percent}%">+${formatNumber(current)}${escapeHtml(currency)}</span>
      </div>

      <span class="wb-progress__label">${escapeHtml(labels.reward)}</span>
      <div class="wb-progress__marks">${rewards}</div>
    </div>`;
}

function renderSlots(slots) {
  const items = slots.map((slot) => `
    <li class="wb-slots__item">
      <img class="wb-slots__image" src="${escapeHtml(slot.image)}" alt="${escapeHtml(slot.name)}" loading="lazy">
    </li>`).join('');

  return `<ul class="wb-slots">${items}</ul>`;
}

function renderMissions(missions, labels, number) {
  return `
    <section class="wb-section">
      <h2 class="wb-section__title">${number}. ${escapeHtml(missions.sectionTitle)}</h2>
      <div class="wb-card wb-missions">
        <h3 class="wb-card__heading">${highlight(missions.title, missions.titleHighlight)}</h3>
        ${renderCountdown(labels)}
        ${renderProgress(missions, labels)}
        ${renderSlots(missions.slots)}
        <a class="wb-button wb-button--pink" href="${escapeHtml(missions.buttonUrl)}">${escapeHtml(missions.button)}</a>
      </div>
    </section>`;
}

// rules section
function renderRules(rules, labels) {
  const items = rules.map((rule) => `
    <details class="wb-rule">
      <summary class="wb-rule__title">${escapeHtml(rule.title)} ${chevronIcon}</summary>
      <p class="wb-rule__body">${escapeHtml(rule.body)}</p>
    </details>`).join('');

  return `
    <section class="wb-section wb-rules">
      <h2 class="wb-rules__title">${escapeHtml(labels.rulesTitle)}</h2>
      ${items}
    </section>`;
}

// =========here starts COMPONENT

class WelcomeBonus extends HTMLElement {
  async connectedCallback() {
    const src = this.getAttribute('src');

    try {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      this.render(data);
    } catch (error) {
      console.error('Could not load campaign:', error);
    }
  }

  render(data) {
    const { labels } = data;

    this.style.setProperty('--wb-bg-desktop', `url("${data.background.imageDesktop}")`);
    this.style.setProperty('--wb-bg-mobile', `url("${data.background.imageMobile}")`);

    this.innerHTML = `
      <div class="wb-hero-space" aria-hidden="true"></div>
      <div class="wb-container">
        ${renderHero(data.hero)}
        ${renderSummary(data.summary)}
        ${renderRegister(data.register, labels, 1)}
        ${renderDeposit(data.deposit, labels, 2)}
        ${renderMissions(data.missions, labels, 3)}
        ${renderRules(data.rules, labels)}
      </div>`;
  }
}

customElements.define('welcome-bonus', WelcomeBonus);

