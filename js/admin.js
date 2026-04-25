/* ═══════════════════════════════════════════════════════════════
   GO PLUS EXPRESS — Administration Backend (localStorage-based)
   Gestion tarifaire & visualisation expéditions/simulations
   ═══════════════════════════════════════════════════════════════ */

/* ── Clés localStorage ── */
const ADM_K = {
  fuel:        'gpe_fuel',
  margins:     'gpe_express_margins',
  maritime:    'gpe_maritime',
  routier:     'gpe_routier',
  groupage:    'gpe_groupage',
  expeditions: 'gpe_expeditions',
  simulations: 'gpe_simulations'
};

/* ── Données par défaut ── */
const ADM_DEF = {
  fuel: {
    dhl:    { pct: 46.0 },
    fedex:  { pct: 48.0 },
    aramex: { pct: 47.0 },
    updatedMonth: ''
  },
  margins: {
    dhl:    { 1:10, 2:10, 3:10, 4:10, 5:10, 6:10, 7:10, 8:10, 9:10 },
    fedex:  { A:10, B:10, C:10, D:10, E:10, F:10, G:10, H:10, I:10 },
    aramex: { 1:10, 2:10, 3:10, 4:10, 5:10, 6:10 }
  },
  maritime: {
    routes: [
      { id:'ma-es', from:'Casablanca', to:'Espagne (Algésiras)',        transit:3,  currency:'EUR' },
      { id:'ma-fr', from:'Casablanca', to:'France (Sète / Marseille)',   transit:5,  currency:'EUR' },
      { id:'ma-it', from:'Casablanca', to:'Italie (Gênes)',              transit:7,  currency:'EUR' },
      { id:'ma-be', from:'Casablanca', to:'Belgique (Anvers)',           transit:8,  currency:'EUR' },
      { id:'ma-nl', from:'Casablanca', to:'Pays-Bas (Rotterdam)',        transit:9,  currency:'EUR' },
      { id:'ma-uk', from:'Casablanca', to:'Royaume-Uni (Southampton)',   transit:10, currency:'EUR' },
      { id:'ma-de', from:'Casablanca', to:'Allemagne (Hambourg)',        transit:10, currency:'EUR' },
      { id:'ma-us', from:'Casablanca', to:'USA (New York)',              transit:18, currency:'USD' },
      { id:'ma-cn', from:'Casablanca', to:'Chine (Shanghai)',            transit:30, currency:'USD' },
      { id:'ma-ae', from:'Casablanca', to:'EAU (Jebel Ali)',            transit:20, currency:'USD' },
      { id:'ma-br', from:'Casablanca', to:'Brésil (Santos)',             transit:21, currency:'USD' },
      { id:'ma-sg', from:'Casablanca', to:'Singapour',                  transit:25, currency:'USD' }
    ],
    containers: [
      { code:'20GP', label:"Conteneur 20' GP",          rate:1200, unit:'USD' },
      { code:'40GP', label:"Conteneur 40' GP",          rate:1900, unit:'USD' },
      { code:'40HC', label:"Conteneur 40' HC",          rate:2100, unit:'USD' },
      { code:'45HC', label:"Conteneur 45' HC",          rate:2400, unit:'USD' },
      { code:'LCL',  label:"Groupage LCL (par CBM)",   rate:95,   unit:'USD' }
    ],
    routeOverrides: {}
  },
  routier: {
    routes: [
      { id:'ro-es', from:'Maroc', to:'Espagne',       transit:2, currency:'EUR' },
      { id:'ro-pt', from:'Maroc', to:'Portugal',      transit:3, currency:'EUR' },
      { id:'ro-fr', from:'Maroc', to:'France',        transit:4, currency:'EUR' },
      { id:'ro-be', from:'Maroc', to:'Belgique',      transit:5, currency:'EUR' },
      { id:'ro-nl', from:'Maroc', to:'Pays-Bas',      transit:5, currency:'EUR' },
      { id:'ro-de', from:'Maroc', to:'Allemagne',     transit:5, currency:'EUR' },
      { id:'ro-it', from:'Maroc', to:'Italie',        transit:6, currency:'EUR' },
      { id:'ro-uk', from:'Maroc', to:'Royaume-Uni',   transit:7, currency:'EUR' }
    ],
    vehicles: [
      { code:'SEMI',    label:'Semi-remorque 33T',         capacity:33, rate:4500 },
      { code:'MEGA',    label:'Mega 34T (H:3m)',           capacity:34, rate:5200 },
      { code:'20GP',    label:"Conteneur 20' GP",          capacity:20, rate:2800 },
      { code:'40GP',    label:"Conteneur 40' GP",          capacity:25, rate:3800 },
      { code:'40HC',    label:"Conteneur 40' HC (H:2.70m)",capacity:26, rate:4200 },
      { code:'PORTE',   label:'Porte-conteneur',           capacity:25, rate:4000 },
      { code:'PLATEAU', label:'Plateau (hors-gabarit)',    capacity:30, rate:4800 },
      { code:'FRIGO',   label:'Frigorifique (-18°C)',      capacity:22, rate:6500 }
    ],
    routeRates: {}
  },
  groupage: {
    routes: [
      { id:'gr-es', from:'Maroc', to:'Espagne',    transit:3, factor:1.00 },
      { id:'gr-pt', from:'Maroc', to:'Portugal',   transit:4, factor:1.05 },
      { id:'gr-fr', from:'Maroc', to:'France',     transit:5, factor:1.10 },
      { id:'gr-be', from:'Maroc', to:'Belgique',   transit:6, factor:1.15 },
      { id:'gr-nl', from:'Maroc', to:'Pays-Bas',   transit:6, factor:1.15 },
      { id:'gr-de', from:'Maroc', to:'Allemagne',  transit:6, factor:1.20 },
      { id:'gr-it', from:'Maroc', to:'Italie',     transit:7, factor:1.20 }
    ],
    brackets: [
      { min:0,     max:99,    ppt:9.50, min_charge:150  },
      { min:100,   max:299,   ppt:8.50, min_charge:850  },
      { min:300,   max:499,   ppt:7.50, min_charge:2550 },
      { min:500,   max:999,   ppt:6.80, min_charge:3750 },
      { min:1000,  max:2999,  ppt:6.20, min_charge:6800 },
      { min:3000,  max:9999,  ppt:5.50, min_charge:18600},
      { min:10000, max:99999, ppt:4.80, min_charge:55000}
    ]
  }
};

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function admLoad(key) {
  try {
    const raw = localStorage.getItem(ADM_K[key]);
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(ADM_DEF[key] || []));
  } catch(e) {
    return JSON.parse(JSON.stringify(ADM_DEF[key] || []));
  }
}
function admSave(key, data) {
  try { localStorage.setItem(ADM_K[key], JSON.stringify(data)); } catch(e) {}
}

/* Public: fuel surcharge pour l'utiliser dans les simulateurs */
function admGetFuelPct(carrier) {
  const fuel = admLoad('fuel');
  return (fuel[carrier] && fuel[carrier].pct != null) ? fuel[carrier].pct : ADM_DEF.fuel[carrier].pct;
}

/* Public: margin multiplier pour un transporteur/zone */
function admGetMargin(carrier, zone) {
  const margins = admLoad('margins');
  if (margins[carrier] && margins[carrier][zone] != null)
    return 1 + margins[carrier][zone] / 100;
  return 1.10; // défaut +10%
}

/* Log simulation */
function admLogSim(data) {
  const list = admLoad('simulations');
  const arr = Array.isArray(list) ? list : [];
  arr.unshift({
    id: 'SIM-' + Date.now(),
    date: new Date().toISOString(),
    ...data
  });
  admSave('simulations', arr.slice(0, 500)); // garder 500 max
}

/* Log expédition */
function admLogExpedition(data) {
  const list = admLoad('expeditions');
  const arr = Array.isArray(list) ? list : [];
  arr.unshift({
    id: 'EXP-' + Date.now(),
    date: new Date().toISOString(),
    ...data
  });
  admSave('expeditions', arr.slice(0, 1000));
}

/* ══════════════════════════════════════════════
   INIT & NAVIGATION
══════════════════════════════════════════════ */
let _admCurrentTab = 'fuel';

function admInit() {
  admTab('fuel');
}

function admTab(name) {
  _admCurrentTab = name;
  document.querySelectorAll('.adm-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.adm-panel').forEach(p => p.classList.remove('active'));
  const tabEl = document.getElementById('adm-tab-' + name);
  const panEl = document.getElementById('adm-panel-' + name);
  if (tabEl) tabEl.classList.add('active');
  if (panEl) panEl.classList.add('active');

  if (name === 'fuel')        admRenderFuel();
  if (name === 'express')     admRenderExpress();
  if (name === 'maritime')    admRenderMaritime();
  if (name === 'routier')     admRenderRoutier();
  if (name === 'groupage')    admRenderGroupage();
  if (name === 'expeditions') admRenderExpeditions();
  if (name === 'simulations') admRenderSimulations();
}

function admToast(msg, ok) {
  const t = document.getElementById('adm-toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'adm-toast ' + (ok !== false ? 'adm-toast-ok' : 'adm-toast-err');
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 2800);
}

/* ══════════════════════════════════════════════
   PANEL 1 — SURCHARGE FUEL
══════════════════════════════════════════════ */
function admRenderFuel() {
  const fuel = admLoad('fuel');
  const today = new Date().toISOString().slice(0,7);
  const month = fuel.updatedMonth || today;

  const carriers = [
    { key:'dhl',    label:'DHL',    color:'#d40511', icon:'fa-d' },
    { key:'fedex',  label:'FedEx',  color:'#4d148c', icon:'fa-f' },
    { key:'aramex', label:'Aramex', color:'#ef4123', icon:'fa-a' }
  ];

  let html = `
  <div class="adm-section-intro">
    <i class="fa-solid fa-gas-pump adm-intro-icon"></i>
    <div>
      <strong>Surcharge carburant mensuelle</strong>
      <span>Mise à jour chaque mois — appliquée automatiquement sur tous les calculs express</span>
    </div>
  </div>
  <div class="adm-fuel-month">
    <label>Mois de référence</label>
    <input type="month" id="adm-fuel-month" value="${month}" class="adm-input" style="max-width:180px"/>
  </div>
  <div class="adm-fuel-grid">`;

  carriers.forEach(c => {
    const pct = (fuel[c.key] && fuel[c.key].pct != null) ? fuel[c.key].pct : ADM_DEF.fuel[c.key].pct;
    html += `
    <div class="adm-fuel-card">
      <div class="adm-fuel-carrier" style="background:${c.color}">
        <span>${c.label}</span>
      </div>
      <div class="adm-fuel-body">
        <label>Surcharge carburant (%)</label>
        <div class="adm-fuel-input-row">
          <input type="number" id="adm-fuel-${c.key}" value="${pct}" min="0" max="200" step="0.1"
            class="adm-input adm-input-pct"/>
          <span class="adm-pct-sign">%</span>
        </div>
        <div class="adm-fuel-note">
          Exemple : tarif de base 500 MAD → <strong id="adm-fuel-ex-${c.key}">${(500*(1+pct/100)).toFixed(0)} MAD</strong> TTC
        </div>
      </div>
    </div>`;
  });

  html += `</div>
  <div class="adm-fuel-history-wrap">
    <h4><i class="fa-solid fa-clock-rotate-left"></i> Historique des surcharges</h4>
    <div id="adm-fuel-history">${admBuildFuelHistory(fuel)}</div>
  </div>
  <div class="adm-actions">
    <button class="adm-btn adm-btn-primary" onclick="admSaveFuel()">
      <i class="fa-solid fa-floppy-disk"></i> Enregistrer les surcharges
    </button>
    <button class="adm-btn adm-btn-ghost" onclick="admRenderFuel()">
      <i class="fa-solid fa-rotate-right"></i> Réinitialiser
    </button>
  </div>`;

  document.getElementById('adm-panel-fuel').innerHTML = html;

  // Live preview
  ['dhl','fedex','aramex'].forEach(c => {
    const inp = document.getElementById('adm-fuel-' + c);
    if (inp) inp.addEventListener('input', function() {
      const ex = document.getElementById('adm-fuel-ex-' + c);
      if (ex) ex.textContent = (500 * (1 + +this.value / 100)).toFixed(0) + ' MAD';
    });
  });
}

function admBuildFuelHistory(fuel) {
  if (!fuel.history || !fuel.history.length) return '<p style="color:#94a3b8;font-size:.82rem">Aucun historique enregistré.</p>';
  let h = '<table class="adm-table" style="font-size:.8rem"><thead><tr><th>Mois</th><th>DHL</th><th>FedEx</th><th>Aramex</th></tr></thead><tbody>';
  fuel.history.slice(-12).reverse().forEach(r => {
    h += `<tr><td>${r.month}</td><td>${r.dhl}%</td><td>${r.fedex}%</td><td>${r.aramex}%</td></tr>`;
  });
  return h + '</tbody></table>';
}

function admSaveFuel() {
  const fuel = admLoad('fuel');
  const month = document.getElementById('adm-fuel-month')?.value || '';
  const dhl    = parseFloat(document.getElementById('adm-fuel-dhl')?.value || fuel.dhl?.pct || 46);
  const fedex  = parseFloat(document.getElementById('adm-fuel-fedex')?.value || fuel.fedex?.pct || 48);
  const aramex = parseFloat(document.getElementById('adm-fuel-aramex')?.value || fuel.aramex?.pct || 47);

  if (!fuel.history) fuel.history = [];
  // Ajouter à l'historique si le mois a changé
  if (month && month !== fuel.updatedMonth) {
    fuel.history.push({ month, dhl, fedex, aramex, savedAt: new Date().toISOString() });
    if (fuel.history.length > 24) fuel.history = fuel.history.slice(-24);
  }

  fuel.dhl    = { pct: dhl };
  fuel.fedex  = { pct: fedex };
  fuel.aramex = { pct: aramex };
  fuel.updatedMonth = month;

  admSave('fuel', fuel);
  admToast('✅ Surcharges carburant enregistrées !');
  admRenderFuel();
}

/* ══════════════════════════════════════════════
   PANEL 2 — MARGES EXPRESS
══════════════════════════════════════════════ */
const ADM_ZONE_LABELS = {
  dhl: {
    1:'Z1 – Espagne/Belgique/Monaco',
    2:'Z2 – Italie/Portugal/UK',
    3:'Z3 – Autriche/Suisse/Scandinavie/Tunisie',
    4:'Z4 – USA/Canada/Golfe/Égypte',
    5:'Z5 – Chine/Inde/Japon/Asie-Pacifique',
    6:'Z6 – Europe de l\'Est/Afrique subsaharienne',
    7:'Z7 – Reste du monde',
    8:'Z8 – France',
    9:'Z9 – Allemagne'
  },
  fedex: {
    A:'A – USA', B:'B – Canada/Caraïbes/Mexique',
    C:'C – Asie Pacifique (Japon/HK/SG/KR)',
    D:'D – Chine/Asie du Sud-Est',
    E:'E – Golfe/Inde/Proche-Orient',
    F:'F – Australie/Nouvelle-Zélande',
    G:'G – Amérique latine',
    H:'H – Afrique/Maroc/Maghreb',
    I:'I – Europe Zone 1 (France/Allemagne/Belgique...)'
  },
  aramex: {
    1:'Z1 – Golfe (EAU/Arabie/Qatar/Koweït/Bahreïn)',
    2:'Z2 – Proche-Orient (Jordanie/Liban/Égypte)',
    3:'Z3 – Asie du Sud (Inde/Pakistan/Bangladesh)',
    4:'Z4 – Afrique',
    5:'Z5 – Europe',
    6:'Z6 – Amériques/Asie-Pacifique/Autres'
  }
};

function admRenderExpress() {
  const margins = admLoad('margins');
  const fuel = admLoad('fuel');
  const carriers = ['dhl','fedex','aramex'];

  let html = `
  <div class="adm-section-intro">
    <i class="fa-solid fa-percent adm-intro-icon"></i>
    <div>
      <strong>Marges commerciales par transporteur et zone</strong>
      <span>La marge est appliquée APRÈS la surcharge carburant. Prix final = Base × (1 + Fuel%) × (1 + Marge%)</span>
    </div>
  </div>

  <div class="adm-carrier-tabs">
    <button class="adm-ctab active" id="adm-ctab-dhl" onclick="admExpressCarrierTab('dhl')">
      <span style="color:#d40511;font-weight:800">DHL</span>
    </button>
    <button class="adm-ctab" id="adm-ctab-fedex" onclick="admExpressCarrierTab('fedex')">
      <span style="color:#4d148c;font-weight:800">FedEx</span>
    </button>
    <button class="adm-ctab" id="adm-ctab-aramex" onclick="admExpressCarrierTab('aramex')">
      <span style="color:#ef4123;font-weight:800">Aramex</span>
    </button>
  </div>`;

  carriers.forEach(c => {
    const fuelPct = (fuel[c] && fuel[c].pct != null) ? fuel[c].pct : ADM_DEF.fuel[c].pct;
    const zones = ADM_ZONE_LABELS[c];
    html += `<div class="adm-carrier-panel ${c==='dhl'?'active':''}" id="adm-cpanel-${c}">
      <div class="adm-carrier-header">
        <span class="adm-carrier-badge adm-carrier-${c}">${c.toUpperCase()}</span>
        <span class="adm-fuel-badge"><i class="fa-solid fa-gas-pump"></i> Fuel actuel : <strong>${fuelPct}%</strong></span>
      </div>
      <table class="adm-table adm-margins-table">
        <thead>
          <tr>
            <th>Zone</th>
            <th>Description</th>
            <th style="width:120px">Marge (%)</th>
            <th style="width:150px">Exemple (base 500 MAD)</th>
          </tr>
        </thead>
        <tbody>`;
    Object.entries(zones).forEach(([z, desc]) => {
      const m = (margins[c] && margins[c][z] != null) ? margins[c][z] : 10;
      const ex = (500 * (1 + fuelPct/100) * (1 + m/100)).toFixed(0);
      html += `<tr>
        <td><span class="adm-zone-pill">${z}</span></td>
        <td style="font-size:.82rem">${desc}</td>
        <td>
          <div class="adm-input-row-sm">
            <input type="number" class="adm-input adm-input-sm" data-carrier="${c}" data-zone="${z}"
              value="${m}" min="-50" max="500" step="0.5" onchange="admUpdateMarginPreview(this,${fuelPct})"/>
            <span>%</span>
          </div>
        </td>
        <td class="adm-preview-cell" id="adm-prev-${c}-${z}">${ex} MAD</td>
      </tr>`;
    });
    html += `</tbody></table></div>`;
  });

  html += `
  <div class="adm-actions">
    <button class="adm-btn adm-btn-primary" onclick="admSaveMargins()">
      <i class="fa-solid fa-floppy-disk"></i> Enregistrer les marges
    </button>
    <button class="adm-btn adm-btn-ghost" onclick="admRenderExpress()">
      <i class="fa-solid fa-rotate-right"></i> Réinitialiser
    </button>
  </div>`;

  document.getElementById('adm-panel-express').innerHTML = html;
}

function admExpressCarrierTab(carrier) {
  document.querySelectorAll('.adm-ctab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.adm-carrier-panel').forEach(p => p.classList.remove('active'));
  const t = document.getElementById('adm-ctab-' + carrier);
  const p = document.getElementById('adm-cpanel-' + carrier);
  if (t) t.classList.add('active');
  if (p) p.classList.add('active');
}

function admUpdateMarginPreview(inp, fuelPct) {
  const m = parseFloat(inp.value) || 0;
  const carrier = inp.dataset.carrier;
  const zone = inp.dataset.zone;
  const prev = document.getElementById('adm-prev-' + carrier + '-' + zone);
  if (prev) prev.textContent = (500 * (1 + fuelPct/100) * (1 + m/100)).toFixed(0) + ' MAD';
}

function admSaveMargins() {
  const margins = admLoad('margins');
  document.querySelectorAll('[data-carrier][data-zone]').forEach(inp => {
    const c = inp.dataset.carrier;
    const z = inp.dataset.zone;
    const v = parseFloat(inp.value);
    if (!margins[c]) margins[c] = {};
    margins[c][z] = isNaN(v) ? 10 : v;
  });
  admSave('margins', margins);
  admToast('✅ Marges enregistrées !');
}

/* ══════════════════════════════════════════════
   PANEL 3 — TARIFS MARITIME
══════════════════════════════════════════════ */
function admRenderMaritime() {
  const data = admLoad('maritime');
  if (!data.routes) data.routes = JSON.parse(JSON.stringify(ADM_DEF.maritime.routes));
  if (!data.containers) data.containers = JSON.parse(JSON.stringify(ADM_DEF.maritime.containers));
  if (!data.routeOverrides) data.routeOverrides = {};

  const contCodes = data.containers.map(c => c.code);

  let html = `
  <div class="adm-section-intro">
    <i class="fa-solid fa-ship adm-intro-icon"></i>
    <div>
      <strong>Tarifs fret maritime par type de conteneur</strong>
      <span>Prix de base par route — modifiez les tarifs par route ou les tarifs globaux par type de conteneur</span>
    </div>
  </div>

  <div class="adm-sub-tabs">
    <button class="adm-stab active" onclick="admSubTab('maritime','containers')" id="adm-stab-maritime-containers">
      <i class="fa-solid fa-boxes-stacked"></i> Types de conteneurs
    </button>
    <button class="adm-stab" onclick="admSubTab('maritime','routes')" id="adm-stab-maritime-routes">
      <i class="fa-solid fa-route"></i> Tarifs par route
    </button>
    <button class="adm-stab" onclick="admSubTab('maritime','surcharges')" id="adm-stab-maritime-surcharges">
      <i class="fa-solid fa-plus"></i> Surcharges
    </button>
  </div>

  <!-- Containers base panel -->
  <div class="adm-sub-panel active" id="adm-sub-maritime-containers">
    <h4 class="adm-sub-title">Tarifs de base par type de conteneur (USD)</h4>
    <table class="adm-table">
      <thead><tr><th>Type</th><th>Description</th><th>Tarif de base</th><th>Devise</th></tr></thead>
      <tbody>`;

  data.containers.forEach((c, i) => {
    html += `<tr>
      <td><span class="adm-zone-pill">${c.code}</span></td>
      <td><input type="text" class="adm-input" data-cont-label="${i}" value="${c.label}" style="max-width:280px"/></td>
      <td>
        <div class="adm-input-row-sm">
          <input type="number" class="adm-input adm-input-sm" data-cont-rate="${i}" value="${c.rate}" min="0" step="10"/>
        </div>
      </td>
      <td><input type="text" class="adm-input" data-cont-unit="${i}" value="${c.unit}" style="max-width:70px"/></td>
    </tr>`;
  });

  html += `</tbody></table>
    <div class="adm-actions">
      <button class="adm-btn adm-btn-primary" onclick="admSaveMaritimeContainers()">
        <i class="fa-solid fa-floppy-disk"></i> Enregistrer les types de conteneurs
      </button>
    </div>
  </div>

  <!-- Routes panel -->
  <div class="adm-sub-panel" id="adm-sub-maritime-routes">
    <h4 class="adm-sub-title">Tarifs spécifiques par route (USD) — laisser vide pour utiliser le tarif de base</h4>
    <div style="overflow-x:auto">
    <table class="adm-table adm-routes-table">
      <thead>
        <tr>
          <th>Route</th><th>Transit</th>
          ${contCodes.map(c => `<th>${c}</th>`).join('')}
        </tr>
      </thead>
      <tbody>`;

  data.routes.forEach((r, ri) => {
    const ov = data.routeOverrides[r.id] || {};
    html += `<tr>
      <td style="min-width:200px">
        <div style="font-weight:600;font-size:.85rem">${r.from} → ${r.to}</div>
      </td>
      <td><input type="number" class="adm-input adm-input-sm" data-route-transit="${ri}" value="${r.transit}" min="1" style="width:60px"/> j</td>
      ${contCodes.map(cc => `
        <td>
          <input type="number" class="adm-input adm-input-sm" data-route-ov="${r.id}" data-cont="${cc}"
            value="${ov[cc]||''}" min="0" step="10" placeholder="base"/>
        </td>`).join('')}
    </tr>`;
  });

  html += `</tbody></table></div>
    <div class="adm-actions">
      <button class="adm-btn adm-btn-primary" onclick="admSaveMaritimeRoutes()">
        <i class="fa-solid fa-floppy-disk"></i> Enregistrer les tarifs par route
      </button>
    </div>
  </div>

  <!-- Surcharges panel -->
  <div class="adm-sub-panel" id="adm-sub-maritime-surcharges">
    <h4 class="adm-sub-title">Surcharges maritimes (USD)</h4>
    <table class="adm-table" style="max-width:550px">
      <thead><tr><th>Surcharge</th><th>Montant</th><th>Unité</th></tr></thead>
      <tbody>
        ${admBuildMaritimeSurcharges(data)}
      </tbody>
    </table>
    <div class="adm-actions">
      <button class="adm-btn adm-btn-primary" onclick="admSaveMaritimeSurcharges()">
        <i class="fa-solid fa-floppy-disk"></i> Enregistrer les surcharges
      </button>
    </div>
  </div>`;

  document.getElementById('adm-panel-maritime').innerHTML = html;
}

function admBuildMaritimeSurcharges(data) {
  const surch = data.surcharges || [
    {code:'BAF', label:'Surcharge carburant (BAF)', amount:150, unit:'par conteneur'},
    {code:'CAF', label:'Surcharge change (CAF)',    amount:50,  unit:'par conteneur'},
    {code:'THC', label:'Frais portuaires (THC)',    amount:120, unit:'par conteneur'},
    {code:'BL',  label:'Connaissement (B/L)',       amount:85,  unit:'par BL'},
    {code:'ISPS',label:'Sécurité ISPS',             amount:25,  unit:'par conteneur'},
    {code:'IMO', label:'Surcharge IMO 2020',        amount:75,  unit:'par conteneur'}
  ];
  return surch.map((s,i) => `<tr>
    <td><input type="text" class="adm-input" data-surch-label="${i}" value="${s.label}" style="max-width:260px"/></td>
    <td><input type="number" class="adm-input adm-input-sm" data-surch-amt="${i}" value="${s.amount}" min="0"/></td>
    <td><input type="text" class="adm-input" data-surch-unit="${i}" value="${s.unit}" style="max-width:140px"/></td>
  </tr>`).join('');
}

function admSubTab(section, panel) {
  const prefix = `adm-stab-${section}-`;
  document.querySelectorAll(`[id^="${prefix}"]`).forEach(t => t.classList.remove('active'));
  const sectionPanelEl = document.getElementById(`adm-panel-${section}`);
  if (sectionPanelEl) sectionPanelEl.querySelectorAll('.adm-sub-panel').forEach(p => p.classList.remove('active'));
  const t = document.getElementById(`adm-stab-${section}-${panel}`);
  const p = document.getElementById(`adm-sub-${section}-${panel}`);
  if (t) t.classList.add('active');
  if (p) p.classList.add('active');
}

function admSaveMaritimeContainers() {
  const data = admLoad('maritime');
  if (!data.containers) data.containers = JSON.parse(JSON.stringify(ADM_DEF.maritime.containers));
  document.querySelectorAll('[data-cont-rate]').forEach(inp => {
    const i = parseInt(inp.dataset.contRate);
    if (data.containers[i]) data.containers[i].rate = parseFloat(inp.value) || 0;
  });
  document.querySelectorAll('[data-cont-label]').forEach(inp => {
    const i = parseInt(inp.dataset.contLabel);
    if (data.containers[i]) data.containers[i].label = inp.value;
  });
  document.querySelectorAll('[data-cont-unit]').forEach(inp => {
    const i = parseInt(inp.dataset.contUnit);
    if (data.containers[i]) data.containers[i].unit = inp.value;
  });
  admSave('maritime', data);
  admToast('✅ Types de conteneurs enregistrés !');
}

function admSaveMaritimeRoutes() {
  const data = admLoad('maritime');
  if (!data.routeOverrides) data.routeOverrides = {};
  if (!data.routes) data.routes = JSON.parse(JSON.stringify(ADM_DEF.maritime.routes));
  document.querySelectorAll('[data-route-transit]').forEach(inp => {
    const i = parseInt(inp.dataset.routeTransit);
    if (data.routes[i]) data.routes[i].transit = parseInt(inp.value) || 1;
  });
  document.querySelectorAll('[data-route-ov]').forEach(inp => {
    const routeId = inp.dataset.routeOv;
    const cont = inp.dataset.cont;
    const val = inp.value.trim();
    if (!data.routeOverrides[routeId]) data.routeOverrides[routeId] = {};
    if (val === '') {
      delete data.routeOverrides[routeId][cont];
    } else {
      data.routeOverrides[routeId][cont] = parseFloat(val) || 0;
    }
  });
  admSave('maritime', data);
  admToast('✅ Tarifs par route enregistrés !');
}

function admSaveMaritimeSurcharges() {
  const data = admLoad('maritime');
  const surch = [];
  const labels  = [...document.querySelectorAll('[data-surch-label]')];
  const amounts = [...document.querySelectorAll('[data-surch-amt]')];
  const units   = [...document.querySelectorAll('[data-surch-unit]')];
  labels.forEach((l, i) => {
    surch.push({
      code: String(i),
      label: l.value,
      amount: parseFloat(amounts[i]?.value) || 0,
      unit: units[i]?.value || ''
    });
  });
  data.surcharges = surch;
  admSave('maritime', data);
  admToast('✅ Surcharges maritimes enregistrées !');
}

/* ══════════════════════════════════════════════
   PANEL 4 — TARIFS ROUTIER & REMORQUES
══════════════════════════════════════════════ */
function admRenderRoutier() {
  const data = admLoad('routier');
  if (!data.routes)   data.routes   = JSON.parse(JSON.stringify(ADM_DEF.routier.routes));
  if (!data.vehicles) data.vehicles = JSON.parse(JSON.stringify(ADM_DEF.routier.vehicles));
  if (!data.routeRates) data.routeRates = {};

  let html = `
  <div class="adm-section-intro">
    <i class="fa-solid fa-truck-moving adm-intro-icon"></i>
    <div>
      <strong>Tarifs fret routier et remorques</strong>
      <span>Définissez les prix par type de véhicule/conteneur et par route de destination</span>
    </div>
  </div>

  <div class="adm-sub-tabs">
    <button class="adm-stab active" onclick="admSubTab('routier','vehicles')" id="adm-stab-routier-vehicles">
      <i class="fa-solid fa-truck"></i> Types de véhicules
    </button>
    <button class="adm-stab" onclick="admSubTab('routier','routes')" id="adm-stab-routier-routes">
      <i class="fa-solid fa-route"></i> Tarifs par route
    </button>
  </div>

  <!-- Vehicles panel -->
  <div class="adm-sub-panel active" id="adm-sub-routier-vehicles">
    <h4 class="adm-sub-title">Types de véhicules/équipements — Tarif de base (EUR)</h4>
    <table class="adm-table">
      <thead><tr><th>Code</th><th>Libellé</th><th>Capacité (T)</th><th>Tarif de base (EUR)</th></tr></thead>
      <tbody>`;

  data.vehicles.forEach((v, i) => {
    html += `<tr>
      <td><span class="adm-zone-pill">${v.code}</span></td>
      <td><input type="text" class="adm-input" data-veh-label="${i}" value="${v.label}" style="max-width:260px"/></td>
      <td><input type="number" class="adm-input adm-input-sm" data-veh-cap="${i}" value="${v.capacity}" min="0" style="width:70px"/></td>
      <td>
        <div class="adm-input-row-sm">
          <input type="number" class="adm-input adm-input-sm" data-veh-rate="${i}" value="${v.rate}" min="0" step="50"/>
          <span>€</span>
        </div>
      </td>
    </tr>`;
  });

  html += `</tbody></table>
    <div class="adm-actions">
      <button class="adm-btn adm-btn-primary" onclick="admSaveRoutierVehicles()">
        <i class="fa-solid fa-floppy-disk"></i> Enregistrer les types de véhicules
      </button>
    </div>
  </div>

  <!-- Routes panel -->
  <div class="adm-sub-panel" id="adm-sub-routier-routes">
    <h4 class="adm-sub-title">Tarifs par route et type de véhicule (EUR) — laisser vide pour utiliser le tarif de base</h4>
    <div style="overflow-x:auto">
    <table class="adm-table adm-routes-table">
      <thead>
        <tr>
          <th>Route</th><th>Transit</th>
          ${data.vehicles.map(v => `<th style="min-width:90px">${v.code}</th>`).join('')}
        </tr>
      </thead>
      <tbody>`;

  data.routes.forEach((r, ri) => {
    const rates = data.routeRates[r.id] || {};
    html += `<tr>
      <td style="min-width:160px;font-weight:600;font-size:.85rem">${r.from} → ${r.to}</td>
      <td><input type="number" class="adm-input adm-input-sm" data-ro-transit="${ri}" value="${r.transit}" min="1" style="width:55px"/> j</td>
      ${data.vehicles.map(v => `
        <td>
          <input type="number" class="adm-input adm-input-sm"
            data-ro-rate="${r.id}" data-veh="${v.code}"
            value="${rates[v.code]||''}" min="0" step="50" placeholder="${v.rate}"/>
        </td>`).join('')}
    </tr>`;
  });

  html += `</tbody></table></div>
    <div class="adm-actions">
      <button class="adm-btn adm-btn-primary" onclick="admSaveRoutierRoutes()">
        <i class="fa-solid fa-floppy-disk"></i> Enregistrer les tarifs par route
      </button>
    </div>
  </div>`;

  document.getElementById('adm-panel-routier').innerHTML = html;
}

function admSaveRoutierVehicles() {
  const data = admLoad('routier');
  if (!data.vehicles) data.vehicles = JSON.parse(JSON.stringify(ADM_DEF.routier.vehicles));
  document.querySelectorAll('[data-veh-label]').forEach(inp => {
    const i = parseInt(inp.dataset.vehLabel);
    if (data.vehicles[i]) data.vehicles[i].label = inp.value;
  });
  document.querySelectorAll('[data-veh-cap]').forEach(inp => {
    const i = parseInt(inp.dataset.vehCap);
    if (data.vehicles[i]) data.vehicles[i].capacity = parseFloat(inp.value) || 0;
  });
  document.querySelectorAll('[data-veh-rate]').forEach(inp => {
    const i = parseInt(inp.dataset.vehRate);
    if (data.vehicles[i]) data.vehicles[i].rate = parseFloat(inp.value) || 0;
  });
  admSave('routier', data);
  admToast('✅ Types de véhicules enregistrés !');
}

function admSaveRoutierRoutes() {
  const data = admLoad('routier');
  if (!data.routeRates) data.routeRates = {};
  if (!data.routes) data.routes = JSON.parse(JSON.stringify(ADM_DEF.routier.routes));
  document.querySelectorAll('[data-ro-transit]').forEach(inp => {
    const i = parseInt(inp.dataset.roTransit);
    if (data.routes[i]) data.routes[i].transit = parseInt(inp.value) || 1;
  });
  document.querySelectorAll('[data-ro-rate]').forEach(inp => {
    const routeId = inp.dataset.roRate;
    const veh = inp.dataset.veh;
    const val = inp.value.trim();
    if (!data.routeRates[routeId]) data.routeRates[routeId] = {};
    if (val === '') delete data.routeRates[routeId][veh];
    else data.routeRates[routeId][veh] = parseFloat(val) || 0;
  });
  admSave('routier', data);
  admToast('✅ Tarifs par route enregistrés !');
}

/* ══════════════════════════════════════════════
   PANEL 5 — GROUPAGE ROUTIER
══════════════════════════════════════════════ */
function admRenderGroupage() {
  const data = admLoad('groupage');
  if (!data.routes)   data.routes   = JSON.parse(JSON.stringify(ADM_DEF.groupage.routes));
  if (!data.brackets) data.brackets = JSON.parse(JSON.stringify(ADM_DEF.groupage.brackets));

  let html = `
  <div class="adm-section-intro">
    <i class="fa-solid fa-boxes-stacked adm-intro-icon"></i>
    <div>
      <strong>Tarifs groupage routier (LTL)</strong>
      <span>Prix au tonne par tranche de poids — un facteur multiplicateur peut être appliqué par destination</span>
    </div>
  </div>

  <div class="adm-sub-tabs">
    <button class="adm-stab active" onclick="admSubTab('groupage','brackets')" id="adm-stab-groupage-brackets">
      <i class="fa-solid fa-weight-scale"></i> Tranches de poids
    </button>
    <button class="adm-stab" onclick="admSubTab('groupage','routes')" id="adm-stab-groupage-routes">
      <i class="fa-solid fa-route"></i> Facteurs par destination
    </button>
  </div>

  <!-- Brackets panel -->
  <div class="adm-sub-panel active" id="adm-sub-groupage-brackets">
    <h4 class="adm-sub-title">Grille tarifaire — Prix par tonne (EUR/T) selon le poids total de l'envoi</h4>
    <table class="adm-table" style="max-width:650px">
      <thead>
        <tr>
          <th>De (kg)</th><th>À (kg)</th>
          <th>Prix/tonne (EUR)</th>
          <th>Minimum de facturation (EUR)</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="adm-grp-brackets">
        ${data.brackets.map((b,i) => admGroupageBracketRow(b,i)).join('')}
      </tbody>
    </table>
    <div class="adm-actions">
      <button class="adm-btn adm-btn-secondary" onclick="admAddGroupageBracket()">
        <i class="fa-solid fa-plus"></i> Ajouter une tranche
      </button>
      <button class="adm-btn adm-btn-primary" onclick="admSaveGroupageBrackets()">
        <i class="fa-solid fa-floppy-disk"></i> Enregistrer les tranches
      </button>
    </div>
    <div class="adm-info-box">
      <i class="fa-solid fa-circle-info"></i>
      <div>
        <strong>Formule de calcul :</strong><br>
        Prix = MAX(Poids(T) × Prix/T × Facteur_destination, Minimum_facturation)<br>
        <em>Exemple : 250 kg → Espagne = 0.250 T × 8.50 EUR/T × 1.00 = 2.13 EUR minimum 850 EUR → <strong>850 EUR</strong></em>
      </div>
    </div>
  </div>

  <!-- Routes panel -->
  <div class="adm-sub-panel" id="adm-sub-groupage-routes">
    <h4 class="adm-sub-title">Facteur multiplicateur par destination (ex: 1.10 = +10% par rapport au tarif de base)</h4>
    <table class="adm-table" style="max-width:500px">
      <thead><tr><th>Destination</th><th>Transit (jours)</th><th>Facteur</th></tr></thead>
      <tbody>`;

  data.routes.forEach((r, i) => {
    html += `<tr>
      <td><strong>${r.from} → ${r.to}</strong></td>
      <td><input type="number" class="adm-input adm-input-sm" data-grp-transit="${i}" value="${r.transit}" min="1" style="width:55px"/> j</td>
      <td>
        <input type="number" class="adm-input adm-input-sm" data-grp-factor="${i}"
          value="${r.factor||1.00}" min="0.5" max="5" step="0.05" style="width:80px"/>
        <span style="font-size:.78rem;color:#64748b;margin-left:4px">× base</span>
      </td>
    </tr>`;
  });

  html += `</tbody></table>
    <div class="adm-actions">
      <button class="adm-btn adm-btn-primary" onclick="admSaveGroupageRoutes()">
        <i class="fa-solid fa-floppy-disk"></i> Enregistrer les destinations
      </button>
    </div>
  </div>`;

  document.getElementById('adm-panel-groupage').innerHTML = html;
}

function admGroupageBracketRow(b, i) {
  return `<tr id="adm-grp-row-${i}">
    <td><input type="number" class="adm-input adm-input-sm" data-grp-min="${i}" value="${b.min}" min="0" style="width:80px"/></td>
    <td><input type="number" class="adm-input adm-input-sm" data-grp-max="${i}" value="${b.max}" min="0" style="width:90px"/></td>
    <td><div class="adm-input-row-sm"><input type="number" class="adm-input adm-input-sm" data-grp-ppt="${i}" value="${b.ppt}" min="0" step="0.1" style="width:80px"/><span>€/T</span></div></td>
    <td><div class="adm-input-row-sm"><input type="number" class="adm-input adm-input-sm" data-grp-minc="${i}" value="${b.min_charge}" min="0" step="10" style="width:90px"/><span>€</span></div></td>
    <td><button class="adm-btn-icon adm-btn-danger" onclick="admRemoveGroupageBracket(${i})" title="Supprimer"><i class="fa-solid fa-trash"></i></button></td>
  </tr>`;
}

function admAddGroupageBracket() {
  const data = admLoad('groupage');
  if (!data.brackets) data.brackets = [];
  const last = data.brackets[data.brackets.length - 1];
  data.brackets.push({ min: last ? last.max+1 : 0, max: 9999, ppt: 5.0, min_charge: 0 });
  admSave('groupage', data);
  admRenderGroupage();
  admSubTab('groupage', 'brackets');
}

function admRemoveGroupageBracket(i) {
  const data = admLoad('groupage');
  if (!data.brackets) return;
  data.brackets.splice(i, 1);
  admSave('groupage', data);
  admRenderGroupage();
  admSubTab('groupage', 'brackets');
}

function admSaveGroupageBrackets() {
  const data = admLoad('groupage');
  const brackets = [];
  document.querySelectorAll('[data-grp-min]').forEach((inp, i) => {
    brackets.push({
      min:        parseFloat(inp.value) || 0,
      max:        parseFloat(document.querySelector(`[data-grp-max="${i}"]`)?.value) || 0,
      ppt:        parseFloat(document.querySelector(`[data-grp-ppt="${i}"]`)?.value) || 0,
      min_charge: parseFloat(document.querySelector(`[data-grp-minc="${i}"]`)?.value) || 0
    });
  });
  data.brackets = brackets.sort((a,b) => a.min - b.min);
  admSave('groupage', data);
  admToast('✅ Tranches groupage enregistrées !');
}

function admSaveGroupageRoutes() {
  const data = admLoad('groupage');
  if (!data.routes) data.routes = JSON.parse(JSON.stringify(ADM_DEF.groupage.routes));
  document.querySelectorAll('[data-grp-transit]').forEach((inp, i) => {
    if (data.routes[i]) data.routes[i].transit = parseInt(inp.value) || 1;
  });
  document.querySelectorAll('[data-grp-factor]').forEach((inp, i) => {
    if (data.routes[i]) data.routes[i].factor = parseFloat(inp.value) || 1;
  });
  admSave('groupage', data);
  admToast('✅ Destinations groupage enregistrées !');
}

/* ══════════════════════════════════════════════
   PANEL 6 — EXPÉDITIONS
══════════════════════════════════════════════ */
function admRenderExpeditions() {
  const list = admLoad('expeditions');
  const arr = Array.isArray(list) ? list : [];

  let html = `
  <div class="adm-section-intro">
    <i class="fa-solid fa-tag adm-intro-icon"></i>
    <div>
      <strong>Expéditions enregistrées</strong>
      <span>${arr.length} expédition(s) — mise à jour automatique à chaque nouvelle expédition soumise</span>
    </div>
  </div>
  <div class="adm-toolbar">
    <input type="text" class="adm-input adm-search" id="adm-exp-search" placeholder="🔍 Rechercher (nom, pays, transporteur...)" oninput="admFilterExpeditions()"/>
    <div class="adm-toolbar-right">
      <button class="adm-btn adm-btn-ghost" onclick="admExportCSV('expeditions')">
        <i class="fa-solid fa-file-csv"></i> Export CSV
      </button>
      <button class="adm-btn adm-btn-ghost adm-btn-danger" onclick="admClearExpeditions()">
        <i class="fa-solid fa-trash"></i> Vider
      </button>
    </div>
  </div>`;

  if (!arr.length) {
    html += `<div class="adm-empty"><i class="fa-solid fa-inbox"></i><p>Aucune expédition enregistrée.<br>Les expéditions apparaîtront ici dès qu'elles seront soumises depuis le module <strong>Nouvelle Expédition</strong>.</p></div>`;
  } else {
    html += `<div style="overflow-x:auto">
    <table class="adm-table adm-data-table" id="adm-exp-table">
      <thead>
        <tr>
          <th>Date</th><th>ID</th>
          <th>Expéditeur</th><th>Destinataire</th>
          <th>Pays dest.</th><th>Transporteur</th>
          <th>Poids</th><th>Montant</th><th>Statut</th>
          <th></th>
        </tr>
      </thead>
      <tbody>`;
    arr.forEach(e => {
      const fromName = [e.from?.firstname, e.from?.lastname].filter(Boolean).join(' ') || e.from?.name || '—';
      const toName   = [e.to?.firstname, e.to?.lastname].filter(Boolean).join(' ') || e.to?.name || '—';
      const date = e.date ? new Date(e.date).toLocaleDateString('fr-MA') : '—';
      const statusClass = { pending:'adm-badge-orange', confirmed:'adm-badge-green', delivered:'adm-badge-blue', cancelled:'adm-badge-red' }[e.status] || 'adm-badge-orange';
      const statusLabel = { pending:'En attente', confirmed:'Confirmée', delivered:'Livré', cancelled:'Annulée' }[e.status] || 'En attente';
      html += `<tr data-search="${(fromName+toName+(e.carrier||'')+(e.to?.country||'')).toLowerCase()}">
        <td style="white-space:nowrap">${date}</td>
        <td><code style="font-size:.75rem">${(e.id||'').slice(-8)}</code></td>
        <td>${escapeHTML(fromName)}</td>
        <td>${escapeHTML(toName)}</td>
        <td>${escapeHTML(e.to?.country||e.destination||'—')}</td>
        <td><span class="adm-carrier-badge adm-carrier-${(e.carrier||'').toLowerCase()}">${e.carrier||'—'}</span></td>
        <td>${e.weight ? e.weight + ' kg' : '—'}</td>
        <td>${e.amount ? '<strong>'+e.amount+' MAD</strong>' : '—'}</td>
        <td><span class="adm-badge ${statusClass}">${statusLabel}</span></td>
        <td>
          <button class="adm-btn-icon" onclick="admViewExpedition('${e.id}')" title="Voir détail"><i class="fa-solid fa-eye"></i></button>
        </td>
      </tr>`;
    });
    html += `</tbody></table></div>`;
  }

  html += `<div id="adm-exp-detail" class="adm-detail-modal hidden"></div>`;
  document.getElementById('adm-panel-expeditions').innerHTML = html;
}

function admFilterExpeditions() {
  const q = document.getElementById('adm-exp-search')?.value.toLowerCase() || '';
  document.querySelectorAll('#adm-exp-table tbody tr').forEach(row => {
    row.style.display = (!q || (row.dataset.search||'').includes(q)) ? '' : 'none';
  });
}

function admViewExpedition(id) {
  const list = admLoad('expeditions');
  const arr  = Array.isArray(list) ? list : [];
  const e    = arr.find(x => x.id === id);
  if (!e) return;
  const modal = document.getElementById('adm-exp-detail');
  if (!modal) return;
  const date = e.date ? new Date(e.date).toLocaleString('fr-MA') : '—';
  modal.innerHTML = `
  <div class="adm-modal-content">
    <div class="adm-modal-header">
      <h3><i class="fa-solid fa-tag"></i> Détail expédition ${e.id||''}</h3>
      <button class="adm-modal-close" onclick="document.getElementById('adm-exp-detail').classList.add('hidden')">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="adm-modal-body">
      <div class="adm-detail-grid">
        <div class="adm-detail-col">
          <h4>📤 Expéditeur</h4>
          ${admDetailBlock(e.from)}
        </div>
        <div class="adm-detail-col">
          <h4>📥 Destinataire</h4>
          ${admDetailBlock(e.to)}
        </div>
      </div>
      <div class="adm-detail-meta">
        <span><strong>Transporteur :</strong> ${e.carrier||'—'}</span>
        <span><strong>Poids :</strong> ${e.weight||'—'} kg</span>
        <span><strong>Montant :</strong> ${e.amount||'—'} MAD</span>
        <span><strong>Date :</strong> ${date}</span>
        <span><strong>Statut :</strong> ${e.status||'pending'}</span>
        ${e.trackingNumber ? `<span><strong>Tracking :</strong> ${e.trackingNumber}</span>` : ''}
      </div>
      ${e.packages ? `<div><strong>Colis :</strong> ${JSON.stringify(e.packages)}</div>` : ''}
    </div>
  </div>`;
  modal.classList.remove('hidden');
}

function admDetailBlock(contact) {
  if (!contact) return '<p style="color:#94a3b8">—</p>';
  const fields = [
    [(contact.firstname||'') + ' ' + (contact.lastname||''), null],
    [contact.company, null],
    [contact.addr1, null], [contact.addr2, null],
    [contact.zip + ' ' + (contact.city||''), null],
    [contact.country, null],
    [contact.email, 'mail'],
    [contact.phone, 'phone']
  ];
  return fields.filter(f => f[0]?.trim()).map(f =>
    `<div style="font-size:.83rem;margin-bottom:3px">${escapeHTML(f[0].trim())}</div>`
  ).join('');
}

function admClearExpeditions() {
  if (!confirm('Supprimer toutes les expéditions ? Cette action est irréversible.')) return;
  admSave('expeditions', []);
  admRenderExpeditions();
  admToast('Liste expéditions vidée.');
}

/* ══════════════════════════════════════════════
   PANEL 7 — SIMULATIONS
══════════════════════════════════════════════ */
function admRenderSimulations() {
  const list = admLoad('simulations');
  const arr = Array.isArray(list) ? list : [];

  // Stats
  const byType = {};
  arr.forEach(s => { byType[s.type||'?'] = (byType[s.type||'?']||0)+1; });

  let html = `
  <div class="adm-section-intro">
    <i class="fa-solid fa-chart-line adm-intro-icon"></i>
    <div>
      <strong>Journal des simulations</strong>
      <span>${arr.length} simulation(s) enregistrée(s) — toutes les simulations sont automatiquement journalisées</span>
    </div>
  </div>
  <div class="adm-stats-row">
    ${Object.entries(byType).map(([t,n]) => `
    <div class="adm-stat-chip">
      <span class="adm-stat-num">${n}</span>
      <span class="adm-stat-lbl">${admSimTypeLabel(t)}</span>
    </div>`).join('')}
    <div class="adm-stat-chip adm-stat-total">
      <span class="adm-stat-num">${arr.length}</span>
      <span class="adm-stat-lbl">Total</span>
    </div>
  </div>
  <div class="adm-toolbar">
    <input type="text" class="adm-input adm-search" id="adm-sim-search"
      placeholder="🔍 Rechercher (type, transporteur, pays...)" oninput="admFilterSimulations()"/>
    <div class="adm-toolbar-right">
      <select class="adm-input adm-select-sm" id="adm-sim-filter-type" onchange="admFilterSimulations()">
        <option value="">Tous les types</option>
        <option value="express">Express</option>
        <option value="maritime">Maritime</option>
        <option value="routier">Routier</option>
        <option value="groupage">Groupage</option>
        <option value="avion">Avion</option>
        <option value="conteneur">Conteneur</option>
      </select>
      <button class="adm-btn adm-btn-ghost" onclick="admExportCSV('simulations')">
        <i class="fa-solid fa-file-csv"></i> Export CSV
      </button>
      <button class="adm-btn adm-btn-ghost adm-btn-danger" onclick="admClearSimulations()">
        <i class="fa-solid fa-trash"></i> Vider
      </button>
    </div>
  </div>`;

  if (!arr.length) {
    html += `<div class="adm-empty"><i class="fa-solid fa-chart-bar"></i><p>Aucune simulation enregistrée.<br>Les simulations apparaîtront ici dès qu'un calcul sera lancé depuis les simulateurs.</p></div>`;
  } else {
    html += `<div style="overflow-x:auto">
    <table class="adm-table adm-data-table" id="adm-sim-table">
      <thead>
        <tr>
          <th>Date</th><th>Type</th><th>Transporteur</th>
          <th>Origine</th><th>Destination</th>
          <th>Poids/Vol.</th><th>Résultat</th>
        </tr>
      </thead>
      <tbody>`;
    arr.forEach(s => {
      const date = s.date ? new Date(s.date).toLocaleDateString('fr-MA') : '—';
      html += `<tr data-search="${[s.type,s.carrier,s.from,s.to].join(' ').toLowerCase()}" data-type="${s.type||''}">
        <td style="white-space:nowrap">${date}</td>
        <td><span class="adm-badge adm-badge-${admSimTypeColor(s.type)}">${admSimTypeLabel(s.type)}</span></td>
        <td>${s.carrier ? `<span class="adm-carrier-badge adm-carrier-${s.carrier.toLowerCase()}">${s.carrier}</span>` : '—'}</td>
        <td>${escapeHTML(s.from||'—')}</td>
        <td>${escapeHTML(s.to||'—')}</td>
        <td>${s.weight ? s.weight + ' kg' : s.volume ? s.volume + ' CBM' : '—'}</td>
        <td>${s.result ? '<strong>'+escapeHTML(String(s.result))+'</strong>' : '—'}</td>
      </tr>`;
    });
    html += `</tbody></table></div>`;
  }

  document.getElementById('adm-panel-simulations').innerHTML = html;
}

function admSimTypeLabel(t) {
  const m = {express:'✈️ Express',maritime:'🚢 Maritime',routier:'🚛 Routier',groupage:'📦 Groupage',avion:'✈️ Avion cargo',conteneur:'📦 Conteneur'};
  return m[t] || t || '?';
}
function admSimTypeColor(t) {
  const m = {express:'blue',maritime:'teal',routier:'orange',groupage:'purple',avion:'blue',conteneur:'teal'};
  return m[t] || 'gray';
}

function admFilterSimulations() {
  const q  = (document.getElementById('adm-sim-search')?.value || '').toLowerCase();
  const ft = document.getElementById('adm-sim-filter-type')?.value || '';
  document.querySelectorAll('#adm-sim-table tbody tr').forEach(row => {
    const matchQ  = !q  || (row.dataset.search||'').includes(q);
    const matchFt = !ft || row.dataset.type === ft;
    row.style.display = (matchQ && matchFt) ? '' : 'none';
  });
}

function admClearSimulations() {
  if (!confirm('Supprimer tout l\'historique des simulations ?')) return;
  admSave('simulations', []);
  admRenderSimulations();
  admToast('Historique simulations vidé.');
}

/* ══════════════════════════════════════════════
   EXPORT CSV
══════════════════════════════════════════════ */
function admExportCSV(type) {
  const list = admLoad(type);
  const arr  = Array.isArray(list) ? list : [];
  if (!arr.length) { admToast('Aucune donnée à exporter.', false); return; }

  let csv = '', headers = [], rows = [];

  if (type === 'expeditions') {
    headers = ['Date','ID','Exp_Prénom','Exp_Nom','Exp_Pays','Dest_Prénom','Dest_Nom','Dest_Pays','Transporteur','Poids_kg','Montant_MAD','Statut'];
    rows = arr.map(e => [
      e.date ? new Date(e.date).toLocaleDateString('fr-MA') : '',
      e.id||'',
      e.from?.firstname||'', e.from?.lastname||'', e.from?.country||'',
      e.to?.firstname||'', e.to?.lastname||'', e.to?.country||'',
      e.carrier||'', e.weight||'', e.amount||'', e.status||'pending'
    ]);
  } else if (type === 'simulations') {
    headers = ['Date','Type','Transporteur','Origine','Destination','Poids_kg','Volume_CBM','Résultat'];
    rows = arr.map(s => [
      s.date ? new Date(s.date).toLocaleDateString('fr-MA') : '',
      s.type||'', s.carrier||'', s.from||'', s.to||'',
      s.weight||'', s.volume||'', s.result||''
    ]);
  }

  csv  = headers.join(';') + '\n';
  csv += rows.map(r => r.map(v => '"' + String(v||'').replace(/"/g,'""') + '"').join(';')).join('\n');

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `gpe_${type}_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  admToast(`✅ Export CSV ${type} téléchargé !`);
}

/* ══════════════════════════════════════════════
   PUBLIC API — pour les simulateurs
══════════════════════════════════════════════ */
window.admGetFuelPct   = admGetFuelPct;
window.admGetMargin    = admGetMargin;
window.admLogSim       = admLogSim;
window.admLogExpedition = admLogExpedition;
window.admLoad         = admLoad;
