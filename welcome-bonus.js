// ========Helper functions

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// to wrap highlighted(pink) part of title in semantic em
function highlight(text, part) {
  const safeText = escapeHtml(text);
  if (!part || !text.includes(part)) return safeText;
  const safePart = escapeHtml(part);
  return safeText.replace(safePart, () => `<em class="wbl-accent">${safePart}</em>`);
}

// for formatting number -> "1 000"
function formatNumber(number) {
  return String(number).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
}

// text transform uppercase doesn't change Geo
// this is another helper function to convert letters
function applyGeorgianCaps(root) {
    root.querySelectorAll('[data-caps]').forEach((element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      walker.currentNode.nodeValue = walker.currentNode.nodeValue.toUpperCase();
    }
  });
}


//icnons
const plusIcon = `
  <svg class="wbl-icon" viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="8" fill="currentColor"/>
    <path d="M8 4.5v7M4.5 8h7" stroke="#0f9d2a" stroke-width="2" stroke-linecap="round"/>
  </svg>`;

const chevronIcon = `
  <svg class="wbl-icon wbl-rule__chevron" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

// ============Section templates
//-here starts hero -

function renderHero(hero) {
  return `
    <section class="wbl-hero">
      <h2 class="wbl-hero__title" data-caps>${highlight(hero.title, hero.titleHighlight)}</h2>
      <p class="wbl-hero__subtitle">${escapeHtml(hero.subtitle)}</p>
    </section>`;
}

//-here starts 4 summary cards 
function renderSummary(items) {
  const cards = items.map((item) => `
    <li class="wbl-summary__item ${item.highlighted ? 'wbl-summary__item--highlighted' : ''}">
      <strong class="wbl-summary__value">${escapeHtml(item.value)}</strong>
      <span class="wbl-summary__label" data-caps>${escapeHtml(item.label)}</span>
    </li>`).join('');

  return `<ul class="wbl-summary">${cards}</ul>`;
}
//1.freespins block (register + deposit)
function renderFreespins(count, game, labels) {
  return `
    <div class="wbl-freespins">
      <span class="wbl-freespins__count">${escapeHtml(count)}</span>
      <span class="wbl-freespins__info">
        <span class="wbl-freespins__label">${escapeHtml(labels.freespin)}</span>
        <span class="wbl-freespins__game">${escapeHtml(game)}</span>
      </span>
    </div>`;
}

function renderRegister(register, labels, number) {
  return `
    <section class="wbl-section">
      <h2 class="wbl-section__title">${number}. ${escapeHtml(register.title)}</h2>
      <div class="wbl-card wbl-register">
        <img class="wbl-register__image" src="${escapeHtml(register.image)}" alt="${escapeHtml(register.game)}">
        <div class="wbl-register__content">
          <h3 class="wbl-card__heading" data-caps>${escapeHtml(register.text)}</h3>
          ${renderFreespins(register.freespins, register.game, labels)}
          <a class="wbl-button wbl-button--green" data-caps href="${escapeHtml(register.url)}">${escapeHtml(register.button)}</a>
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
      <tr class="${index === lastIndex ? 'wbl-tiers__row--top' : ''}">
        <td>${escapeHtml(amount)}</td>
        <td><span class="wbl-tiers__reward">${escapeHtml(tier.freespins)} ${escapeHtml(labels.fs)}</span>
        </td>
      </tr>`;
  }).join('');

  return `
    <section class="wbl-section">
      <h2 class="wbl-section__title">${number}. ${escapeHtml(deposit.title)}</h2>
      <div class="wbl-card wbl-deposit">
        <h3 class="wbl-card__heading" data-caps>${escapeHtml(deposit.text)}</h3>
        <div class="wbl-deposit__row">
          ${renderFreespins(deposit.freespins, deposit.game, labels)}
          <a class="wbl-button wbl-button--green" data-caps href="${escapeHtml(deposit.url)}">${escapeHtml(deposit.button)} ${plusIcon}</a>
        </div>
        <table class="wbl-tiers">
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
    <span class="wbl-countdown__unit">
      <span class="wbl-countdown__value" data-unit="${unit}">00</span>
      <span class="wbl-countdown__name">${escapeHtml(labels[unit])}</span>
    </span>`).join('<span class="wbl-countdown__separator" aria-hidden="true">:</span>');

  return `
    <div class="wbl-countdown" role="timer">
      <span class="wbl-countdown__label" data-caps data-countdown-label>${escapeHtml(labels.countdownTitle)}</span>
      <div class="wbl-countdown__units">${cells}</div>
    </div>`;
}

function renderProgress(missions, labels) {
  // const { current, currency } = missions.progress;
  // const max = Math.max(...missions.milestones.map((m) => m.amount));
  // const percent = Math.min((current / max) * 100, 100);
  const { current, currency } = missions.progress;
  const max = Math.max(...missions.milestones.map((m) => m.amount));

  // The last milestone sits at 95%, so the track continues a bit past it (as in the design)
  const SCALE_END = 95;
  const toPercent = (amount) => (amount / max) * SCALE_END;
  const percent = current >= max ? 100 : toPercent(current);


  const amounts = missions.milestones.map((m) => `
    <span class="wbl-progress__mark" style="left: ${toPercent(m.amount)}%">
      ${formatNumber(m.amount)}${escapeHtml(currency)}
    </span>`).join('');

  const rewards = missions.milestones.map((m) => `
    <span class="wbl-progress__mark" style="left: ${toPercent(m.amount)}%">
      <span class="wbl-progress__reward">${escapeHtml(m.reward)}</span>
      <img class="wbl-progress__icon" src="${escapeHtml(m.rewardIcon)}" alt="${escapeHtml(labels.fs)}">
    </span>`).join('');

  const ticks = missions.milestones.map((m) => `
    <span class="wbl-progress__tick" style="left: ${toPercent(m.amount)}%"></span>`).join('');

   return `
    <div class="wbl-progress">
      <div class="wbl-progress__row">
        <span class="wbl-progress__label" data-caps>${escapeHtml(labels.progress)}</span>
        <div class="wbl-progress__marks">${amounts}</div>
      </div>

      <div class="wbl-progress__track"
           role="progressbar"
           aria-label="${escapeHtml(labels.progress)}"
           aria-valuemin="0"
           aria-valuemax="${max}"
           aria-valuenow="${current}">
        <div class="wbl-progress__fill" style="width: ${percent}%"></div>
        ${ticks}
        <span class="wbl-progress__badge" style="left: ${percent}%">+${formatNumber(current)}${escapeHtml(currency)}</span>
      </div>

      <div class="wbl-progress__row">
        <span class="wbl-progress__label" data-caps>${escapeHtml(labels.reward)}</span>
        <div class="wbl-progress__marks wbl-progress__marks--rewards">${rewards}</div>
      </div>
    </div>`;

}

function renderSlots(slots) {
  const items = slots.map((slot) => `
    <li class="wbl-slots__item">
      <img class="wbl-slots__image" src="${escapeHtml(slot.image)}" alt="${escapeHtml(slot.name)}" loading="lazy">
    </li>`).join('');

  return `<ul class="wbl-slots">${items}</ul>`;
}

function renderMissions(missions, labels, number) {
  return `
    <section class="wbl-section">
      <h2 class="wbl-section__title">${number}. ${escapeHtml(missions.sectionTitle)}</h2>
      <div class="wbl-card wbl-missions">
        <h3 class="wbl-card__heading" data-caps>${highlight(missions.title, missions.titleHighlight)}</h3>
        ${renderCountdown(labels)}
        ${renderProgress(missions, labels)}
        ${renderSlots(missions.slots)}
        <a class="wbl-button wbl-button--pink" data-caps href="${escapeHtml(missions.buttonUrl)}">${escapeHtml(missions.button)}</a>
      </div>
    </section>`;
}

// rules section
function renderRules(rules, labels) {
  const items = rules.map((rule) => `
    <details class="wbl-rule">
      <summary class="wbl-rule__title">${escapeHtml(rule.title)} ${chevronIcon}</summary>
      <p class="wbl-rule__body">${escapeHtml(rule.body)}</p>
    </details>`).join('');

  return `
    <section class="wbl-section wbl-rules">
      <h2 class="wbl-rules__title" data-caps>${escapeHtml(labels.rulesTitle)}</h2>
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

    this.style.setProperty('--wbl-bg-desktop', `url("${data.background.imageDesktop}")`);
    this.style.setProperty('--wbl-bg-mobile', `url("${data.background.imageMobile}")`);

    this.innerHTML = `
      <div class="wbl-hero-space" aria-hidden="true"></div>
      <div class="wbl-container">
        ${renderHero(data.hero)}
        ${renderSummary(data.summary)}
        ${renderRegister(data.register, labels, 1)}
        ${renderDeposit(data.deposit, labels, 2)}
        ${renderMissions(data.missions, labels, 3)}
        ${renderRules(data.rules, labels)}
      </div>`;
      applyGeorgianCaps(this);

  }
}

customElements.define('welcome-bonus', WelcomeBonus);

