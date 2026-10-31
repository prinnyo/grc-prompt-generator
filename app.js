// State
let state = { workstream: null, usecase: null, stack: [], fields: {} };

function inferTier(stack) {
  if (!stack.length) return 'standard';
  const scores = { standard: 0, ai: 0, agentic: 0 };
  stack.forEach(s => {
    scores[tierOf(s)]++;
  });
  if (scores.agentic > 0) return 'agentic';
  if (scores.ai > 0) return 'ai';
  return 'standard';
}

const TIER_RANK = { standard: 0, ai: 1, agentic: 2 };

function tierOf(stackKey) {
  return DATA.stacks[stackKey]?.tier || 'standard';
}

// Show the workflow for the most mature selected stack, so it matches the inferred tier
function pickPrimaryStack(stack) {
  return stack.reduce((best, s) => TIER_RANK[tierOf(s)] > TIER_RANK[tierOf(best)] ? s : best);
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Workflow for a use case + stack: a hand-written override if one exists, otherwise composed
// from the stack's steps and the use case's stages
function getWorkflow(uc, stackKey) {
  const override = uc.overrides?.[stackKey];
  if (override) return override;

  const stack = DATA.stacks[stackKey];
  const fill = text => text.replace(/\{(draft|review|record|trigger)\}/g, (_, k) => uc.stages[k]);
  return {
    current: stack.current,
    next: [
      `AI drafts ${uc.stages.draft}`,
      fill(stack.steps.route),
      fill(stack.steps.store),
      fill(stack.steps.remind),
      `⚠ ${uc.stages.checkpoint}`
    ],
    nudge: stack.nudge
  };
}

// Button labels come from data.js (author-controlled); esc() keeps stray & or < from breaking the markup
function renderWorkstreams() {
  document.getElementById('workstream-opts').innerHTML = Object.entries(DATA.workstreams).map(([val, w]) =>
    `<button class="opt-btn" data-val="${val}">${esc(w.label)}<span class="opt-sub">${esc(w.sub)}</span></button>`
  ).join('');
}

function renderStacks() {
  document.getElementById('stack-opts').innerHTML = Object.entries(DATA.stacks).map(([val, s]) => `
    <button class="stack-btn" data-val="${val}">
      <div class="stack-icon" style="background:${s.iconBg};">${s.icon}</div>
      <span>${esc(s.name)}<br><span style="font-size:10px;color:var(--ink-3);">${esc(s.sub)}</span></span>
      <div class="stack-check"></div>
    </button>`
  ).join('');
}

function activateStep(n) {
  document.querySelectorAll('.step').forEach((s, i) => {
    s.classList.toggle('active', i + 1 === n);
    s.classList.toggle('done', i + 1 < n);
  });
}

// Step 1: workstream
document.getElementById('workstream-opts').addEventListener('click', e => {
  const btn = e.target.closest('.opt-btn');
  if (!btn) return;
  document.querySelectorAll('#workstream-opts .opt-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.workstream = btn.dataset.val;
  state.usecase = null;
  renderUsecases();
  activateStep(2);
  checkGenerate();
  document.getElementById('output-panel').classList.remove('visible');
});

function renderUsecases() {
  const container = document.getElementById('usecase-opts');
  const cases = Object.entries(DATA.usecases).filter(([, c]) => c.workstream === state.workstream);
  container.innerHTML = cases.map(([val, c]) =>
    `<button class="opt-btn" data-val="${val}">${esc(c.label)}<span class="opt-sub">${esc(c.sub)}</span></button>`
  ).join('');
}

document.getElementById('usecase-opts').addEventListener('click', e => {
  const btn = e.target.closest('.opt-btn');
  if (!btn) return;
  document.querySelectorAll('#usecase-opts .opt-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.usecase = btn.dataset.val;
  activateStep(3);
  checkGenerate();
  document.getElementById('output-panel').classList.remove('visible');
});

// Step 3: stack multi-select
document.getElementById('stack-opts').addEventListener('click', e => {
  const btn = e.target.closest('.stack-btn');
  if (!btn) return;
  btn.classList.toggle('selected');
  const val = btn.dataset.val;
  if (state.stack.includes(val)) {
    state.stack = state.stack.filter(s => s !== val);
  } else {
    state.stack.push(val);
  }
  checkGenerate();
});

function checkGenerate() {
  document.getElementById('generate-btn').disabled = !(state.usecase && state.stack.length);
}

document.getElementById('generate-btn').addEventListener('click', () => {
  if (!state.usecase || !state.stack.length) return;
  renderOutput();
});

function renderOutput() {
  const tier = inferTier(state.stack);
  const ucData = DATA.usecases[state.usecase];

  if (!ucData.prompt) {
    document.getElementById('output-panel').innerHTML = `<p style="color:var(--ink-3);font-size:12px;padding:20px 0;">This use case is coming soon. Subscribe to The AI GRC Desk for updates.</p>${subscribeCtaHtml()}`;
    document.getElementById('output-panel').classList.add('visible');
    return;
  }

  const primaryStack = pickPrimaryStack(state.stack);
  const wf = getWorkflow(ucData, primaryStack);

  const tierBadgeClass = tier;
  const tierLabel = DATA.maturityLabel[tier];

  const currentSteps = wf.current.map(s =>
    `<div class="wf-step">${s}</div>`
  ).join('');

  const nextSteps = wf.next.map(s => {
    const isCheckpoint = s.startsWith('⚠');
    return `<div class="wf-step ${isCheckpoint ? 'checkpoint' : ''}">${s}</div>`;
  }).join('');

  const govTags = ucData.governance.tags.map(t => `<span class="gov-tag">${t}</span>`).join('');

  const stackName = DATA.stacks[primaryStack].workflowLabel;

  const wsCaseName = DATA.workstreams[state.workstream].label;

  document.getElementById('output-panel').innerHTML = `
    <div class="output-header">
      <div class="output-meta">
        <div class="output-title">${ucData.title}</div>
        <div class="output-breadcrumb">
          <span>${wsCaseName}</span>
          <span class="bc-sep">·</span>
          <span>${stackName}</span>
          <span class="bc-sep">·</span>
          <span class="tier-badge ${tierBadgeClass}">${tierLabel}</span>
        </div>
      </div>
      <div class="inferred-badge">
        ◎ Maturity inferred from your stack
      </div>
    </div>

    <div class="output-grid">

      <div class="out-card">
        <div class="out-card-header">
          <div class="out-card-label"><div class="out-card-label-dot green"></div>Structured prompt</div>
          <button class="copy-btn" onclick="copyPrompt(this)">Copy</button>
        </div>
        <div class="out-card-body">
          ${fillFormHtml(ucData)}
          <div class="prompt-block" id="prompt-text">${promptHtml(ucData)}</div>
        </div>
      </div>

      <div class="out-card">
        <div class="out-card-header">
          <div class="out-card-label"><div class="out-card-label-dot blue"></div>Stack-specific workflow</div>
        </div>
        <div class="out-card-body">
          <div class="workflow-compare">
            <div class="workflow-col current">
              <div class="workflow-col-header">Current — ${stackName}</div>
              <div class="workflow-steps">${currentSteps}</div>
            </div>
            <div class="workflow-col next">
              <div class="workflow-col-header">With AI — ${tierLabel}</div>
              <div class="workflow-steps">${nextSteps}</div>
            </div>
          </div>
          <div class="upgrade-nudge">
            <div class="nudge-icon">↑</div>
            <div class="nudge-text"><strong>Next level:</strong> ${wf.nudge}</div>
          </div>
        </div>
      </div>

      <div class="out-card">
        <div class="out-card-header">
          <div class="out-card-label"><div class="out-card-label-dot amber"></div>Governance check</div>
        </div>
        <div class="out-card-body">
          <div class="gov-tags">${govTags}</div>
          <p class="gov-note">${esc(DATA.referenceNote)}</p>
          <p style="font-size:12px;line-height:1.75;color:var(--ink-2);">${ucData.governance.check}</p>
        </div>
      </div>

    </div>

    ${subscribeCtaHtml()}

    <button class="reset-btn" onclick="resetTool()">← Start over</button>
  `;

  restoreFields(ucData);
  syncPrompt();

  document.getElementById('output-panel').classList.add('visible');
  document.getElementById('output-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Email capture ──
// Inline Beehiiv embed if DATA.subscribe.embedUrl is set, otherwise a link to the hosted subscribe page.
// Only Beehiiv's embed host is accepted, so a typo in data.js can't point the iframe somewhere else.
function subscribeCtaHtml() {
  const { pageUrl, embedUrl, embedHeight } = DATA.subscribe;
  const embed = embedUrl.startsWith('https://embeds.beehiiv.com/') ? embedUrl : '';
  const action = embed
    ? `<iframe class="cta-embed" src="${esc(embed)}" title="Subscribe to The AI GRC Desk" height="${Number(embedHeight) || 320}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`
    : `<a class="cta-btn" href="${esc(pageUrl)}" target="_blank" rel="noopener noreferrer">Subscribe free →</a>`;

  return `
    <div class="subscribe-cta${embed ? ' with-embed' : ''}">
      <div class="cta-text">
        <div class="cta-heading">Get the full workflow in your inbox</div>
        <div class="cta-sub">Each weekly issue of The AI GRC Desk covers one use case end-to-end — with the case study behind it.</div>
      </div>
      ${action}
    </div>`;
}

// ── Fill-in fields ──
// Prompts in data.js use {{key}} tokens; each token has a matching entry in the use case's `fields`.
// Values are only ever written with .value / .textContent, never into markup.

function fillFormHtml(uc) {
  const fields = uc.fields || [];
  if (!fields.length) return '';

  const control = f => {
    const id = `fill-${esc(f.key)}`;
    const attrs = `id="${id}" data-field="${esc(f.key)}"`;
    const hint = esc(f.hint || '');
    switch (f.type) {
      case 'textarea':
        return `<textarea ${attrs} rows="3" placeholder="${hint}"></textarea>`;
      case 'select':
        return `<select ${attrs}><option value="">Choose…</option>${f.options.map(o => `<option>${esc(o)}</option>`).join('')}</select>`;
      case 'combo':
      case 'framework': {
        const options = f.type === 'framework' ? DATA.frameworks : f.options;
        return `<input type="text" ${attrs} list="${id}-list" autocomplete="off" placeholder="${hint || 'Choose or type your own'}">
          <datalist id="${id}-list">${options.map(o => `<option value="${esc(o)}"></option>`).join('')}</datalist>`;
      }
      default:
        return `<input type="text" ${attrs} autocomplete="off" placeholder="${hint}">`;
    }
  };

  return `
    <div class="fill-form">
      <div class="fill-head"><span>Fill in your details</span><span class="fill-count" id="fill-count"></span></div>
      <div class="fill-grid">
        ${fields.map(f => `
        <div class="fill-field${f.wide ? ' wide' : ''}">
          <label for="fill-${esc(f.key)}">${esc(f.label)}</label>
          ${control(f)}
        </div>`).join('')}
      </div>
    </div>`;
}

// The prompt template is trusted markup from data.js; each {{key}} becomes an empty span that syncPrompt() fills
function promptHtml(uc) {
  return uc.prompt.replace(/\{\{(\w+)\}\}/g, (_, key) => `<span class="ph" data-ph="${esc(key)}"></span>`);
}

function restoreFields(uc) {
  const saved = state.fields[state.usecase] || {};
  (uc.fields || []).forEach(f => {
    const el = document.getElementById(`fill-${f.key}`);
    if (el && saved[f.key]) el.value = saved[f.key];
  });
}

function syncPrompt() {
  const uc = DATA.usecases[state.usecase];
  const values = state.fields[state.usecase] || {};
  const fields = uc.fields || [];
  const labelOf = key => fields.find(f => f.key === key)?.label || key;

  document.querySelectorAll('#prompt-text .ph').forEach(span => {
    const value = (values[span.dataset.ph] || '').trim();
    span.textContent = value || `[${labelOf(span.dataset.ph)}]`;
    span.classList.toggle('filled', !!value);
  });

  const count = document.getElementById('fill-count');
  if (count) {
    const filled = fields.filter(f => (values[f.key] || '').trim()).length;
    count.textContent = `${filled} of ${fields.length} filled`;
    count.classList.toggle('complete', filled === fields.length);
  }
}

document.getElementById('output-panel').addEventListener('input', e => {
  const key = e.target.dataset.field;
  if (!key) return;
  (state.fields[state.usecase] ??= {})[key] = e.target.value;
  syncPrompt();
});

function copyPrompt(btn) {
  const el = document.getElementById('prompt-text');
  const text = el.innerText;
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Copied';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
  });
}

function resetTool() {
  state = { workstream: null, usecase: null, stack: [], fields: {} };
  document.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
  document.querySelectorAll('.stack-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('usecase-opts').innerHTML = '';
  document.getElementById('output-panel').classList.remove('visible');
  document.getElementById('generate-btn').disabled = true;
  activateStep(1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render the data-driven buttons
renderWorkstreams();
renderStacks();
