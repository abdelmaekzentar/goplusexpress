/* ═══════════════════════════════════════════════════════
   GO PLUS EXPRESS — CRM Engine  v20260429a
   ═══════════════════════════════════════════════════════ */

/* ════════════════════════════════
   DATA LAYER
   ════════════════════════════════ */
const CRM_KEY = 'gpe_crm_v2';

function crmLoad() {
  try { return JSON.parse(localStorage.getItem(CRM_KEY)) || { prospects:[], rdv:[], devis:[] }; }
  catch(e) { return { prospects:[], rdv:[], devis:[] }; }
}
function crmSave(db) { localStorage.setItem(CRM_KEY, JSON.stringify(db)); }
function crmID() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

/* Stage labels */
const CRM_STAGES = {
  prospect:    'Prospect',
  contacte:    'Contacté',
  rdv:         'RDV planifié',
  proposition: 'Proposition',
  negocia:     'Négociation',
  gagne:       'Gagné ✓',
  perdu:       'Perdu ✗'
};

/* Sector list */
const CRM_SECTORS = [
  'Agro-alimentaire','Textile & Habillement','Automobile & Pièces',
  'Électronique & High-Tech','Pharmacie & Cosmétique','BTP & Matériaux',
  'Chimie & Plastiques','Mécanique & Métallurgie','Ameublement & Décor',
  'Agriculture & Semences','Pêche & Aquaculture','Mines & Énergie',
  'Commerce & Distribution','Industrie Manufacturière','Logistique & Transport',
  'Agroéquipement','E-commerce','Autres'
];

/* Sector colors */
const CRM_SECTOR_COLORS = [
  '#16a34a','#3b82f6','#ef4444','#8b5cf6','#f59e0b',
  '#06b6d4','#ec4899','#64748b','#f97316','#10b981',
  '#0ea5e9','#7c3aed','#d97706','#dc2626','#00a99d',
  '#84cc16','#e11d48','#475569'
];

/* Countries */
const CRM_COUNTRIES = ['Maroc','France','Espagne','Italie','Allemagne','Belgique',
  'Pays-Bas','Portugal','Turquie','Chine','USA','Canada','Sénégal','Côte d\'Ivoire',
  'Nigéria','Égypte','Arabie Saoudite','Émirats Arabes Unis','Autre'];

/* Moroccan cities */
const CRM_CITIES_MA = ['Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir',
  'Meknès','Oujda','Kénitra','Tétouan','Safi','El Jadida','Beni Mellal',
  'Nador','Berrechid','Settat','Khouribga','Béni Mellal','Mohammedia',
  'Laâyoune','Dakhla','Ouarzazate','Ifrane','Larache','Salé'];

/* ════════════════════════════════
   GLOBAL STATE
   ════════════════════════════════ */
let _crmSection    = 'prospects';
let _crmDetailId   = null;
let _crmDetailTab  = 'infos';
let _crmCalYear    = new Date().getFullYear();
let _crmCalMonth   = new Date().getMonth();
let _crmCalSel     = null;
let _crmEditProspect = null;
let _crmDevisLines = [];
let _crmImportRows = [];
let _crmImportCols = [];
let _crmDestTags   = [];
let _crmAIResults  = [];

/* ════════════════════════════════
   INIT
   ════════════════════════════════ */
function crmInit() {
  const wrap = document.getElementById('ecmod-crm');
  if (!wrap) return;
  wrap.innerHTML = crmBuildUI();
  crmRefreshStats();
  crmShowSection('prospects');
  crmRenderProspects();
}

function crmBuildUI() {
  return `
  <div class="crm-wrap">

    <!-- Stats bar -->
    <div class="crm-stats-bar" id="crm-stats-bar"></div>

    <!-- Section tabs -->
    <div class="crm-section-tabs">
      <button class="crm-sec-btn active" onclick="crmShowSection('prospects')" id="crm-stab-prospects">
        <i class="fa-solid fa-users"></i> Prospects
      </button>
      <button class="crm-sec-btn" onclick="crmShowSection('calendrier')" id="crm-stab-calendrier">
        <i class="fa-solid fa-calendar-days"></i> Calendrier RDV
      </button>
      <button class="crm-sec-btn" onclick="crmShowSection('devis')" id="crm-stab-devis">
        <i class="fa-solid fa-file-invoice"></i> Devis
      </button>
      <button class="crm-sec-btn" onclick="crmShowSection('import')" id="crm-stab-import">
        <i class="fa-solid fa-file-excel"></i> Import Excel
      </button>
      <button class="crm-sec-btn" onclick="crmShowSection('agent')" id="crm-stab-agent">
        <i class="fa-solid fa-robot"></i> Agent IA
      </button>
    </div>

    <!-- ── PROSPECTS PANEL ── -->
    <div class="crm-panel active" id="crm-panel-prospects">
      <!-- Toolbar -->
      <div class="crm-toolbar">
        <input type="text" class="crm-search-input" id="crm-search" placeholder="Rechercher une société, contact…" oninput="crmRenderProspects()"/>
        <select class="crm-filter-select" id="crm-filter-stage" onchange="crmRenderProspects()">
          <option value="">Toutes étapes</option>
          ${Object.entries(CRM_STAGES).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}
        </select>
        <select class="crm-filter-select" id="crm-filter-sector" onchange="crmRenderProspects()">
          <option value="">Tous secteurs</option>
          ${CRM_SECTORS.map(s=>`<option value="${s}">${s}</option>`).join('')}
        </select>
        <select class="crm-filter-select" id="crm-filter-type" onchange="crmRenderProspects()">
          <option value="">Export / Import</option>
          <option value="export">Export</option>
          <option value="import">Import</option>
          <option value="both">Mixte</option>
        </select>
        <button class="crm-btn-add" onclick="crmOpenProspectModal()">
          <i class="fa-solid fa-plus"></i> Nouveau prospect
        </button>
      </div>
      <!-- Cards -->
      <div class="prospect-grid" id="crm-prospect-grid"></div>
    </div>

    <!-- ── DETAIL VIEW ── -->
    <div class="crm-detail-view" id="crm-detail-view">
      <button class="crm-detail-back" onclick="crmCloseDetail()">
        <i class="fa-solid fa-arrow-left"></i> Retour à la liste
      </button>
      <div id="crm-detail-inner"></div>
    </div>

    <!-- ── CALENDRIER PANEL ── -->
    <div class="crm-panel" id="crm-panel-calendrier">
      <div class="crm-cal-wrap">
        <div>
          <div class="crm-cal-header">
            <div class="crm-cal-nav">
              <button class="crm-cal-arrow" onclick="crmCalPrev()"><i class="fa-solid fa-chevron-left"></i></button>
              <span class="crm-cal-month-title" id="crm-cal-title">—</span>
              <button class="crm-cal-arrow" onclick="crmCalNext()"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <button class="crm-btn-add" onclick="crmOpenRdvModal()">
              <i class="fa-solid fa-plus"></i> Nouveau RDV
            </button>
          </div>
          <div class="crm-cal-grid" id="crm-cal-grid"></div>
        </div>
        <div class="crm-rdv-sidebar">
          <div class="crm-rdv-sidebar-header">
            <h4 id="crm-rdv-sidebar-title">RDV du mois</h4>
            <span id="crm-rdv-count" style="font-size:.75rem;color:#64748b"></span>
          </div>
          <div class="crm-rdv-list" id="crm-rdv-list"></div>
        </div>
      </div>
    </div>

    <!-- ── DEVIS PANEL ── -->
    <div class="crm-panel" id="crm-panel-devis">
      <div class="crm-toolbar">
        <input type="text" class="crm-search-input" id="crm-devis-search" placeholder="Rechercher un devis…" oninput="crmRenderDevisList()"/>
        <select class="crm-filter-select" id="crm-devis-filter-type" onchange="crmRenderDevisList()">
          <option value="">Tous types</option>
          <option value="aerien">Fret Aérien</option>
          <option value="maritime">Fret Maritime</option>
          <option value="groupage">Groupage</option>
          <option value="express">Express</option>
          <option value="route">Transport Route</option>
        </select>
        <select class="crm-filter-select" id="crm-devis-filter-status" onchange="crmRenderDevisList()">
          <option value="">Tous statuts</option>
          <option value="brouillon">Brouillon</option>
          <option value="envoye">Envoyé</option>
          <option value="accepte">Accepté</option>
          <option value="refuse">Refusé</option>
        </select>
        <button class="crm-btn-add" onclick="crmOpenDevisModal()">
          <i class="fa-solid fa-plus"></i> Nouveau devis
        </button>
      </div>
      <div class="crm-devis-grid" id="crm-devis-grid"></div>
    </div>

    <!-- ── IMPORT EXCEL PANEL ── -->
    <div class="crm-panel" id="crm-panel-import">
      <div class="crm-import-zone" id="crm-import-zone"
           onclick="document.getElementById('crm-file-input').click()"
           ondragover="event.preventDefault();this.classList.add('dragging')"
           ondragleave="this.classList.remove('dragging')"
           ondrop="crmHandleDrop(event)">
        <i class="fa-solid fa-file-excel"></i>
        <p><strong>Glissez-déposez</strong> votre fichier Excel ici</p>
        <p style="margin-top:6px;font-size:.78rem">ou</p>
        <div class="crm-import-file-btn">Parcourir…</div>
        <p style="margin-top:10px;font-size:.72rem;opacity:.6">
          Colonnes reconnues : Raison Sociale, Ville, Pays, Secteur, CA, Dirigeant, Email, Téléphone, Site Web
        </p>
      </div>
      <input type="file" id="crm-file-input" accept=".xlsx,.xls,.csv" style="display:none" onchange="crmHandleFileInput(this)"/>
      <div id="crm-import-preview-wrap" style="display:none">
        <div class="crm-import-preview">
          <div class="crm-import-preview-header">
            <span id="crm-import-filename">Aperçu</span>
            <span id="crm-import-rowcount" style="color:#64748b;font-size:.78rem"></span>
          </div>
          <div class="crm-import-table" id="crm-import-table"></div>
        </div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:14px">
          <div style="font-size:.85rem;font-weight:700;color:#0f172a;margin-bottom:10px">
            <i class="fa-solid fa-sliders" style="color:#00a99d"></i> Correspondance des colonnes
          </div>
          <div class="crm-import-col-map" id="crm-import-col-map"></div>
        </div>
        <div style="display:flex;gap:10px;margin-bottom:10px">
          <button class="crm-btn-add" onclick="crmDoImport()">
            <i class="fa-solid fa-file-import"></i> Importer <span id="crm-import-count"></span> prospect(s)
          </button>
          <button class="crm-btn-secondary" onclick="crmResetImport()">
            <i class="fa-solid fa-xmark"></i> Annuler
          </button>
        </div>
        <div class="crm-import-progress" id="crm-import-progress" style="display:none">
          <div class="crm-import-progress-bar" id="crm-import-progress-bar" style="width:0%"></div>
        </div>
      </div>
    </div>

    <!-- ── AGENT IA PANEL ── -->
    <div class="crm-panel" id="crm-panel-agent">
      <div class="crm-ai-header">
        <div class="crm-ai-icon"><i class="fa-solid fa-robot"></i></div>
        <div>
          <h3>Agent IA — Prospection automatique</h3>
          <p>Recherchez des sociétés marocaines par secteur, ville ou pays et importez-les directement dans votre base de prospects</p>
        </div>
      </div>
      <div class="crm-ai-search-form">
        <h4><i class="fa-solid fa-magnifying-glass" style="color:#00a99d"></i> Critères de recherche</h4>
        <div class="crm-ai-form-row">
          <div>
            <label style="font-size:.72rem;font-weight:600;color:#64748b;display:block;margin-bottom:4px">Secteur d'activité</label>
            <select id="ai-sector">
              <option value="">Tous secteurs</option>
              ${CRM_SECTORS.map(s=>`<option value="${s}">${s}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:.72rem;font-weight:600;color:#64748b;display:block;margin-bottom:4px">Ville (Maroc)</label>
            <select id="ai-city">
              <option value="">Toutes villes</option>
              ${CRM_CITIES_MA.map(c=>`<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:.72rem;font-weight:600;color:#64748b;display:block;margin-bottom:4px">Pays</label>
            <select id="ai-country">
              <option value="Maroc">Maroc</option>
              ${CRM_COUNTRIES.filter(c=>c!=='Maroc').map(c=>`<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:.72rem;font-weight:600;color:#64748b;display:block;margin-bottom:4px">Type d'activité</label>
            <select id="ai-type">
              <option value="">Export & Import</option>
              <option value="export">Exportateurs</option>
              <option value="import">Importateurs</option>
            </select>
          </div>
          <div>
            <label style="font-size:.72rem;font-weight:600;color:#64748b;display:block;margin-bottom:4px">Mots-clés (optionnel)</label>
            <input type="text" id="ai-keywords" placeholder="ex: huile d'argan, textile..."/>
          </div>
        </div>
        <button class="crm-ai-run-btn" onclick="crmAISearch()" id="crm-ai-run-btn">
          <i class="fa-solid fa-rocket"></i> Lancer la recherche IA
        </button>
      </div>
      <div class="crm-ai-thinking" id="crm-ai-thinking">
        <div class="crm-ai-dots">
          <div class="crm-ai-dot"></div>
          <div class="crm-ai-dot"></div>
          <div class="crm-ai-dot"></div>
        </div>
        <div class="crm-ai-status" id="crm-ai-status">Initialisation de l'agent…</div>
        <div class="crm-ai-steps" id="crm-ai-steps"></div>
      </div>
      <div id="crm-ai-results-wrap"></div>
    </div>

  </div><!-- /.crm-wrap -->

  <!-- ── MODALS ── -->
  <div class="crm-modal-overlay" id="crm-modal-prospect">
    <div class="crm-modal">
      <div class="crm-modal-header">
        <h3 id="crm-modal-prospect-title"><i class="fa-solid fa-user-plus" style="color:#00a99d"></i> Nouveau prospect</h3>
        <button class="crm-modal-close" onclick="crmCloseModal('crm-modal-prospect')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="crm-modal-body" id="crm-modal-prospect-body"></div>
      <div class="crm-modal-footer">
        <button class="crm-btn-cancel" onclick="crmCloseModal('crm-modal-prospect')">Annuler</button>
        <button class="crm-btn-save" onclick="crmSaveProspectForm()"><i class="fa-solid fa-floppy-disk"></i> Enregistrer</button>
      </div>
    </div>
  </div>

  <div class="crm-modal-overlay" id="crm-modal-rdv">
    <div class="crm-modal">
      <div class="crm-modal-header">
        <h3><i class="fa-solid fa-calendar-plus" style="color:#00a99d"></i> <span id="crm-rdv-modal-title">Nouveau RDV</span></h3>
        <button class="crm-modal-close" onclick="crmCloseModal('crm-modal-rdv')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="crm-modal-body" id="crm-modal-rdv-body"></div>
      <div class="crm-modal-footer">
        <button class="crm-btn-cancel" onclick="crmCloseModal('crm-modal-rdv')">Annuler</button>
        <button class="crm-btn-save" onclick="crmSaveRdvForm()"><i class="fa-solid fa-floppy-disk"></i> Enregistrer</button>
      </div>
    </div>
  </div>

  <div class="crm-modal-overlay" id="crm-modal-devis">
    <div class="crm-modal" style="max-width:800px">
      <div class="crm-modal-header">
        <h3><i class="fa-solid fa-file-invoice" style="color:#00a99d"></i> <span id="crm-devis-modal-title">Nouveau devis</span></h3>
        <button class="crm-modal-close" onclick="crmCloseModal('crm-modal-devis')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="crm-modal-body" id="crm-modal-devis-body"></div>
      <div class="crm-modal-footer">
        <button class="crm-btn-cancel" onclick="crmCloseModal('crm-modal-devis')">Annuler</button>
        <button class="crm-btn-save" onclick="crmSaveDevisForm()"><i class="fa-solid fa-floppy-disk"></i> Enregistrer le devis</button>
      </div>
    </div>
  </div>

  <!-- Toast -->
  <div class="crm-toast" id="crm-toast"></div>
  `;
}

/* ════════════════════════════════
   SECTION NAVIGATION
   ════════════════════════════════ */
function crmShowSection(name) {
  _crmSection = name;
  document.querySelectorAll('.crm-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.crm-sec-btn').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('crm-panel-' + name);
  const btn   = document.getElementById('crm-stab-' + name);
  if (panel) panel.classList.add('active');
  if (btn)   btn.classList.add('active');
  // Hide detail
  const detail = document.getElementById('crm-detail-view');
  if (detail) detail.classList.remove('active');
  if (panel) panel.style.display = '';
  // Section-specific init
  if (name === 'prospects') crmRenderProspects();
  if (name === 'calendrier') crmRenderCalendar();
  if (name === 'devis')     crmRenderDevisList();
}

/* ════════════════════════════════
   STATS BAR
   ════════════════════════════════ */
function crmRefreshStats() {
  const db = crmLoad();
  const total  = db.prospects.length;
  const actifs = db.prospects.filter(p => !['gagne','perdu'].includes(p.stage)).length;
  const gagnes = db.prospects.filter(p => p.stage === 'gagne').length;
  const rdvMois = db.rdv.filter(r => {
    const d = new Date(r.date);
    const n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }).length;
  const devisTotal = db.devis.length;

  const bar = document.getElementById('crm-stats-bar');
  if (!bar) return;
  bar.innerHTML = `
    <div class="crm-stat-card"><div class="crm-stat-icon teal"><i class="fa-solid fa-users"></i></div><div><div class="crm-stat-val">${total}</div><div class="crm-stat-lbl">Prospects total</div></div></div>
    <div class="crm-stat-card"><div class="crm-stat-icon blue"><i class="fa-solid fa-fire"></i></div><div><div class="crm-stat-val">${actifs}</div><div class="crm-stat-lbl">En cours</div></div></div>
    <div class="crm-stat-card"><div class="crm-stat-icon green"><i class="fa-solid fa-trophy"></i></div><div><div class="crm-stat-val">${gagnes}</div><div class="crm-stat-lbl">Gagnés</div></div></div>
    <div class="crm-stat-card"><div class="crm-stat-icon purple"><i class="fa-solid fa-calendar-check"></i></div><div><div class="crm-stat-val">${rdvMois}</div><div class="crm-stat-lbl">RDV ce mois</div></div></div>
    <div class="crm-stat-card"><div class="crm-stat-icon amber"><i class="fa-solid fa-file-invoice"></i></div><div><div class="crm-stat-val">${devisTotal}</div><div class="crm-stat-lbl">Devis créés</div></div></div>
  `;
}

/* ════════════════════════════════
   PROSPECTS LIST
   ════════════════════════════════ */
function crmSectorColor(sector) {
  const idx = CRM_SECTORS.indexOf(sector);
  return CRM_SECTOR_COLORS[idx >= 0 ? idx % CRM_SECTOR_COLORS.length : 0];
}
function crmInitials(name) {
  return (name||'?').split(/[\s\-&]+/).slice(0,2).map(w=>w[0]?.toUpperCase()||'').join('') || '?';
}

function crmRenderProspects() {
  const db     = crmLoad();
  const q      = (document.getElementById('crm-search')?.value||'').toLowerCase();
  const stage  = document.getElementById('crm-filter-stage')?.value||'';
  const sector = document.getElementById('crm-filter-sector')?.value||'';
  const type   = document.getElementById('crm-filter-type')?.value||'';

  let list = db.prospects.filter(p => {
    if (stage  && p.stage   !== stage)  return false;
    if (sector && p.sector  !== sector) return false;
    if (type   && p.type    !== type)   return false;
    if (q) {
      const hay = [p.raisonSociale,p.dirigeant,p.logisticien,p.ville,p.email].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const grid = document.getElementById('crm-prospect-grid');
  if (!grid) return;
  if (!list.length) {
    grid.innerHTML = `<div class="crm-empty" style="grid-column:1/-1"><i class="fa-solid fa-users-slash"></i><p>${db.prospects.length ? 'Aucun prospect ne correspond aux filtres.' : 'Aucun prospect. Cliquez sur <strong>Nouveau prospect</strong> pour commencer.'}</p></div>`;
    return;
  }
  grid.innerHTML = list.map(p => {
    const color = crmSectorColor(p.sector);
    const typeLabel = {export:'Export',import:'Import',both:'Mixte'}[p.type]||'';
    const lastVisit = (p.visites||[]).slice(-1)[0];
    const lastDate  = lastVisit ? new Date(lastVisit.date).toLocaleDateString('fr-MA') : 'Jamais visité';
    return `
    <div class="prospect-card" data-stage="${p.stage||'prospect'}" onclick="crmOpenDetail('${p.id}')">
      <div class="prospect-card-header">
        <div class="prospect-avatar" style="background:${color}">${crmInitials(p.raisonSociale)}</div>
        <div class="prospect-card-info">
          <div class="prospect-name">${p.raisonSociale}</div>
          <div class="prospect-sector">${p.sector||'—'}</div>
        </div>
        <span class="pipeline-badge ${p.stage||'prospect'}">${CRM_STAGES[p.stage]||'Prospect'}</span>
      </div>
      <div class="prospect-card-meta">
        <span class="prospect-meta-chip"><i class="fa-solid fa-location-dot"></i> ${p.ville||'—'}${p.pays&&p.pays!=='Maroc'?' ('+p.pays+')':''}</span>
        ${p.dirigeant?`<span class="prospect-meta-chip"><i class="fa-solid fa-user-tie"></i> ${p.dirigeant}</span>`:''}
        ${p.nbExp?`<span class="prospect-meta-chip"><i class="fa-solid fa-box"></i> ${p.nbExp} exp/mois</span>`:''}
        <span class="prospect-meta-chip"><i class="fa-regular fa-clock"></i> ${lastDate}</span>
      </div>
      <div class="prospect-card-footer">
        <span class="prospect-type-badge ${p.type||'export'}">${typeLabel}</span>
        <div class="prospect-card-actions" onclick="event.stopPropagation()">
          ${p.tel?`<button class="prospect-action-btn" title="Appeler" onclick="window.open('tel:${p.tel}')"><i class="fa-solid fa-phone"></i></button>`:''}
          ${p.email?`<button class="prospect-action-btn" title="Email" onclick="window.open('mailto:${p.email}')"><i class="fa-solid fa-envelope"></i></button>`:''}
          <button class="prospect-action-btn" title="Nouveau RDV" onclick="crmOpenRdvModal('${p.id}')"><i class="fa-solid fa-calendar-plus"></i></button>
          <button class="prospect-action-btn" title="Modifier" onclick="crmOpenProspectModal('${p.id}')"><i class="fa-solid fa-pen"></i></button>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ════════════════════════════════
   PROSPECT DETAIL
   ════════════════════════════════ */
function crmOpenDetail(id) {
  _crmDetailId  = id;
  _crmDetailTab = 'infos';
  const panel  = document.getElementById('crm-panel-prospects');
  const detail = document.getElementById('crm-detail-view');
  if (panel)  panel.classList.remove('active');
  if (detail) { detail.classList.add('active'); crmRenderDetail(); }
}
function crmCloseDetail() {
  _crmDetailId = null;
  const detail = document.getElementById('crm-detail-view');
  if (detail) detail.classList.remove('active');
  crmShowSection('prospects');
}

function crmRenderDetail() {
  const db = crmLoad();
  const p  = db.prospects.find(x => x.id === _crmDetailId);
  if (!p) return;
  const inner = document.getElementById('crm-detail-inner');
  const color = crmSectorColor(p.sector);
  const stageOrder = Object.keys(CRM_STAGES);
  const stageIdx   = stageOrder.indexOf(p.stage||'prospect');

  inner.innerHTML = `
  <!-- Header -->
  <div class="crm-detail-header">
    <div class="crm-detail-avatar" style="background:${color}">${crmInitials(p.raisonSociale)}</div>
    <div class="crm-detail-title">
      <h2>${p.raisonSociale}</h2>
      <p>${p.sector||''} ${p.ville?'· '+p.ville:''} ${p.pays&&p.pays!=='Maroc'?'('+p.pays+')':''}</p>
    </div>
    <div class="crm-detail-actions">
      ${p.tel?`<button class="crm-detail-btn" onclick="window.open('tel:${p.tel}')"><i class="fa-solid fa-phone"></i> Appeler</button>`:''}
      <button class="crm-detail-btn primary" onclick="crmOpenRdvModal('${p.id}')"><i class="fa-solid fa-calendar-plus"></i> RDV</button>
      <button class="crm-detail-btn" onclick="crmOpenProspectModal('${p.id}')"><i class="fa-solid fa-pen"></i> Modifier</button>
      <button class="crm-detail-btn danger" onclick="crmDeleteProspect('${p.id}')"><i class="fa-solid fa-trash"></i></button>
    </div>
  </div>

  <!-- Pipeline stepper -->
  <div class="crm-pipeline-stepper">
    <div class="crm-pipeline-steps">
      ${stageOrder.map((s,i) => `
        <div class="crm-step ${i < stageIdx ? 'done' : i === stageIdx ? 'active' : ''}" onclick="crmSetStage('${p.id}','${s}')">
          <div class="crm-step-dot">${i < stageIdx ? '<i class="fa-solid fa-check"></i>' : (i+1)}</div>
          <div class="crm-step-lbl">${CRM_STAGES[s]}</div>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- Detail tabs -->
  <div class="crm-detail-tabs">
    <button class="crm-dtab-btn active" id="crm-dtab-infos" onclick="crmDetailTab('infos')"><i class="fa-solid fa-circle-info"></i> Infos</button>
    <button class="crm-dtab-btn" id="crm-dtab-qualif" onclick="crmDetailTab('qualif')"><i class="fa-solid fa-clipboard-check"></i> Qualification</button>
    <button class="crm-dtab-btn" id="crm-dtab-visites" onclick="crmDetailTab('visites')"><i class="fa-solid fa-comments"></i> Visites & Notes</button>
    <button class="crm-dtab-btn" id="crm-dtab-devis" onclick="crmDetailTab('devis')"><i class="fa-solid fa-file-invoice"></i> Devis</button>
  </div>

  <!-- Tab panels -->
  <div class="crm-dtab-panel active" id="crm-dtab-panel-infos">${crmDetailInfos(p)}</div>
  <div class="crm-dtab-panel" id="crm-dtab-panel-qualif">${crmDetailQualif(p)}</div>
  <div class="crm-dtab-panel" id="crm-dtab-panel-visites">${crmDetailVisites(p)}</div>
  <div class="crm-dtab-panel" id="crm-dtab-panel-devis">${crmDetailDevis(p, db)}</div>
  `;
}

function crmDetailTab(tab) {
  _crmDetailTab = tab;
  document.querySelectorAll('#crm-detail-inner .crm-dtab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#crm-detail-inner .crm-dtab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('crm-dtab-' + tab)?.classList.add('active');
  document.getElementById('crm-dtab-panel-' + tab)?.classList.add('active');
}

function crmDetailInfos(p) {
  return `<div class="crm-info-grid">
    <div class="crm-info-card"><div class="crm-info-label"><i class="fa-solid fa-building"></i> Raison Sociale</div><div class="crm-info-val">${p.raisonSociale||'—'}</div></div>
    <div class="crm-info-card"><div class="crm-info-label"><i class="fa-solid fa-industry"></i> Secteur</div><div class="crm-info-val">${p.sector||'—'}</div></div>
    <div class="crm-info-card"><div class="crm-info-label"><i class="fa-solid fa-location-dot"></i> Ville / Pays</div><div class="crm-info-val">${p.ville||'—'} ${p.pays?'/ '+p.pays:''}</div></div>
    <div class="crm-info-card"><div class="crm-info-label"><i class="fa-solid fa-user-tie"></i> Dirigeant</div><div class="crm-info-val">${p.dirigeant||'—'}</div></div>
    <div class="crm-info-card"><div class="crm-info-label"><i class="fa-solid fa-person-chalkboard"></i> Logisticien / Contact</div><div class="crm-info-val">${p.logisticien||'—'}</div></div>
    <div class="crm-info-card"><div class="crm-info-label"><i class="fa-solid fa-phone"></i> Téléphone</div><div class="crm-info-val">${p.tel?`<a href="tel:${p.tel}">${p.tel}</a>`:'—'}</div></div>
    <div class="crm-info-card"><div class="crm-info-label"><i class="fa-solid fa-envelope"></i> Email</div><div class="crm-info-val">${p.email?`<a href="mailto:${p.email}">${p.email}</a>`:'—'}</div></div>
    <div class="crm-info-card"><div class="crm-info-label"><i class="fa-solid fa-globe"></i> Site Web</div><div class="crm-info-val">${p.web?`<a href="${p.web}" target="_blank">${p.web}</a>`:'—'}</div></div>
    <div class="crm-info-card"><div class="crm-info-label"><i class="fa-solid fa-chart-line"></i> CA estimé</div><div class="crm-info-val">${p.ca||'—'}</div></div>
    <div class="crm-info-card"><div class="crm-info-label"><i class="fa-solid fa-map-pin"></i> Adresse</div><div class="crm-info-val">${p.adresse||'—'}</div></div>
  </div>`;
}

function crmDetailQualif(p) {
  const typeLabel = {export:'Export uniquement',import:'Import uniquement',both:'Export & Import'}[p.type]||'—';
  const dests = (p.destinations||[]);
  return `
  <div class="crm-qualif-section">
    <h4><i class="fa-solid fa-arrows-left-right"></i> Type d'activité logistique</h4>
    <div class="crm-qualif-row">
      <div class="crm-qualif-item"><label>Type</label><div class="val">${typeLabel}</div></div>
      <div class="crm-qualif-item"><label>Nb expéditions / mois</label><div class="val">${p.nbExp||'—'}</div></div>
      <div class="crm-qualif-item"><label>Budget Export (MAD/mois)</label><div class="val">${p.budgetExport||'—'}</div></div>
      <div class="crm-qualif-item"><label>Budget Import (MAD/mois)</label><div class="val">${p.budgetImport||'—'}</div></div>
    </div>
    <div class="crm-qualif-item"><label>Destinations principales</label>
      <div class="dest-tags">${dests.length ? dests.map(d=>`<span class="dest-tag">${d}</span>`).join('') : '<span style="color:#64748b;font-size:.82rem">—</span>'}</div>
    </div>
  </div>
  <div class="crm-qualif-section">
    <h4><i class="fa-solid fa-ship"></i> Modes de transport utilisés</h4>
    <div class="crm-qualif-row">
      <div class="crm-qualif-item"><label>Fret aérien</label><div class="val">${p.modeAerien?'✅ Oui':'—'}</div></div>
      <div class="crm-qualif-item"><label>Fret maritime</label><div class="val">${p.modeMaritime?'✅ Oui':'—'}</div></div>
      <div class="crm-qualif-item"><label>Groupage</label><div class="val">${p.modeGroupage?'✅ Oui':'—'}</div></div>
      <div class="crm-qualif-item"><label>Express (DHL/FedEx…)</label><div class="val">${p.modeExpress?'✅ Oui':'—'}</div></div>
    </div>
  </div>
  <div class="crm-qualif-section">
    <h4><i class="fa-solid fa-handshake"></i> Transitaire actuel</h4>
    <div class="crm-qualif-row">
      <div class="crm-qualif-item"><label>Transitaire actuel</label><div class="val">${p.transitaireActuel||'—'}</div></div>
      <div class="crm-qualif-item"><label>Satisfaction actuelle</label><div class="val">${p.satisfactionActuel||'—'}</div></div>
      <div class="crm-qualif-item"><label>Renouvellement contrat</label><div class="val">${p.renouvellement||'—'}</div></div>
    </div>
    ${p.remarques?`<div class="crm-qualif-item"><label>Remarques</label><div class="val" style="font-size:.85rem;color:#0f172a">${p.remarques}</div></div>`:''}
  </div>`;
}

function crmDetailVisites(p) {
  const visites = (p.visites||[]).slice().reverse();
  return `
  <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
    <button class="crm-btn-add" onclick="crmToggleAddVisit('${p.id}')"><i class="fa-solid fa-plus"></i> Ajouter une note / visite</button>
  </div>
  <div id="crm-add-visit-form-${p.id}" style="display:none" class="visit-add-form">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <select id="visit-type-${p.id}">
        <option value="visite">🤝 Visite physique</option>
        <option value="tel">📞 Appel téléphonique</option>
        <option value="email">📧 Email / Message</option>
        <option value="note">📝 Note interne</option>
        <option value="devis">📄 Devis envoyé</option>
      </select>
      <input type="date" id="visit-date-${p.id}" value="${new Date().toISOString().slice(0,10)}"/>
    </div>
    <textarea id="visit-text-${p.id}" placeholder="Compte-rendu de la visite, résultat de l'appel, observations…"></textarea>
    <button class="crm-btn-add" onclick="crmAddVisit('${p.id}')"><i class="fa-solid fa-floppy-disk"></i> Enregistrer</button>
  </div>
  <div class="visit-timeline">
    ${visites.length ? visites.map(v => `
      <div class="visit-entry">
        <div class="visit-dot-col">
          <div class="visit-dot ${v.type||'note'}">
            ${{visite:'🤝',tel:'📞',email:'📧',note:'📝',devis:'📄'}[v.type]||'📝'}
          </div>
          <div class="visit-line"></div>
        </div>
        <div class="visit-body">
          <div class="visit-body-header">
            <span class="visit-type-label">${{visite:'Visite physique',tel:'Appel téléphonique',email:'Email/Message',note:'Note interne',devis:'Devis envoyé'}[v.type]||'Note'}</span>
            <span class="visit-date">${new Date(v.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}</span>
          </div>
          <div class="visit-text">${v.texte||''}</div>
        </div>
      </div>`) .join('') : `<div class="crm-empty"><i class="fa-regular fa-comments"></i><p>Aucune visite enregistrée.</p></div>`}
  </div>`;
}

function crmDetailDevis(p, db) {
  const devisList = (db.devis||[]).filter(d => d.prospectId === p.id);
  const typeColors = {aerien:'#3b82f6',maritime:'#06b6d4',groupage:'#8b5cf6',express:'#f59e0b',route:'#10b981'};
  return `
  <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
    <button class="crm-btn-add" onclick="crmOpenDevisModal('${p.id}')"><i class="fa-solid fa-plus"></i> Créer un devis</button>
  </div>
  ${devisList.length ? `<div class="crm-devis-grid">${devisList.map(d=>`
    <div class="crm-devis-row">
      <span class="crm-devis-num">${d.num||d.id.slice(-6).toUpperCase()}</span>
      <span class="crm-devis-type ${d.type||'aerien'}">${{aerien:'Aérien',maritime:'Maritime',groupage:'Groupage',express:'Express',route:'Route'}[d.type]||d.type}</span>
      <span class="crm-devis-company" style="flex:1">${d.objet||p.raisonSociale}</span>
      <span class="crm-devis-amount">${(d.total||0).toLocaleString('fr-MA')} ${d.devise||'MAD'}</span>
      <span class="crm-devis-status ${d.status||'brouillon'}">${{brouillon:'Brouillon',envoye:'Envoyé',accepte:'Accepté',refuse:'Refusé'}[d.status]||'Brouillon'}</span>
      <button class="prospect-action-btn" onclick="crmDeleteDevis('${d.id}')" title="Supprimer"><i class="fa-solid fa-trash"></i></button>
    </div>`).join('')}</div>` : `<div class="crm-empty"><i class="fa-solid fa-file-circle-xmark"></i><p>Aucun devis pour ce prospect.</p></div>`}`;
}

/* ════════════════════════════════
   PROSPECT CRUD
   ════════════════════════════════ */
function crmOpenProspectModal(id) {
  const db = crmLoad();
  const p  = id ? db.prospects.find(x=>x.id===id) : null;
  _crmEditProspect = p ? {...p} : null;
  _crmDestTags = p ? [...(p.destinations||[])] : [];

  const title = document.getElementById('crm-modal-prospect-title');
  if (title) title.innerHTML = `<i class="fa-solid fa-user-plus" style="color:#00a99d"></i> ${p ? 'Modifier le prospect' : 'Nouveau prospect'}`;

  const body = document.getElementById('crm-modal-prospect-body');
  if (!body) return;
  const v = p || {};
  body.innerHTML = `
  <div class="crm-form-section">
    <div class="crm-form-section-title"><i class="fa-solid fa-building"></i> Identification</div>
    <div class="crm-form-grid">
      <div class="crm-form-group full"><label>Raison Sociale *</label><input id="pf-rs" value="${v.raisonSociale||''}"/></div>
      <div class="crm-form-group"><label>Secteur d'activité</label>
        <select id="pf-sector">
          <option value="">— Choisir —</option>
          ${CRM_SECTORS.map(s=>`<option value="${s}"${v.sector===s?' selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="crm-form-group"><label>Ville</label>
        <input id="pf-ville" value="${v.ville||''}" list="crm-cities-list"/>
        <datalist id="crm-cities-list">${CRM_CITIES_MA.map(c=>`<option value="${c}">`).join('')}</datalist>
      </div>
      <div class="crm-form-group"><label>Pays</label>
        <select id="pf-pays">
          ${CRM_COUNTRIES.map(c=>`<option value="${c}"${v.pays===c?' selected':''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="crm-form-group"><label>Chiffre d'affaires estimé</label><input id="pf-ca" placeholder="ex: 5 M MAD" value="${v.ca||''}"/></div>
      <div class="crm-form-group"><label>Adresse</label><input id="pf-adresse" value="${v.adresse||''}"/></div>
    </div>
  </div>
  <div class="crm-form-section">
    <div class="crm-form-section-title"><i class="fa-solid fa-user-tie"></i> Contacts</div>
    <div class="crm-form-grid">
      <div class="crm-form-group"><label>Dirigeant</label><input id="pf-dirigeant" value="${v.dirigeant||''}"/></div>
      <div class="crm-form-group"><label>Logisticien / Contact commerce</label><input id="pf-logisticien" value="${v.logisticien||''}"/></div>
      <div class="crm-form-group"><label>Téléphone</label><input id="pf-tel" type="tel" value="${v.tel||''}"/></div>
      <div class="crm-form-group"><label>Email</label><input id="pf-email" type="email" value="${v.email||''}"/></div>
      <div class="crm-form-group full"><label>Site Web</label><input id="pf-web" placeholder="https://" value="${v.web||''}"/></div>
    </div>
  </div>
  <div class="crm-form-section">
    <div class="crm-form-section-title"><i class="fa-solid fa-chart-pie"></i> Qualification Logistique</div>
    <div style="margin-bottom:10px">
      <label style="font-size:.72rem;font-weight:600;color:#64748b;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em">Type d'activité</label>
      <div class="crm-type-group">
        <button class="crm-type-btn ${(v.type||'export')==='export'?'active':''}" onclick="crmTypeBtn(this,'export')">📤 Export</button>
        <button class="crm-type-btn ${v.type==='import'?'active':''}" onclick="crmTypeBtn(this,'import')">📥 Import</button>
        <button class="crm-type-btn ${v.type==='both'?'active':''}" onclick="crmTypeBtn(this,'both')">🔄 Mixte Export/Import</button>
      </div>
      <input type="hidden" id="pf-type" value="${v.type||'export'}"/>
    </div>
    <div class="crm-form-grid">
      <div class="crm-form-group"><label>Nb expéditions / mois</label><input id="pf-nbexp" type="number" min="1" placeholder="ex: 10" value="${v.nbExp||''}"/></div>
      <div class="crm-form-group"><label>Budget Export (MAD/mois)</label><input id="pf-budget-ex" placeholder="ex: 50 000" value="${v.budgetExport||''}"/></div>
      <div class="crm-form-group"><label>Budget Import (MAD/mois)</label><input id="pf-budget-im" placeholder="ex: 30 000" value="${v.budgetImport||''}"/></div>
    </div>
    <div class="crm-form-group" style="margin-bottom:10px">
      <label>Destinations principales (appuyez Entrée pour ajouter)</label>
      <div class="crm-tags-input-wrap" id="crm-dest-tags-wrap" onclick="document.getElementById('crm-dest-input').focus()">
        ${_crmDestTags.map(t=>`<span class="crm-tag-chip">${t}<span class="crm-tag-remove" onclick="crmRemoveDestTag('${t}')">×</span></span>`).join('')}
        <input class="crm-tags-input" id="crm-dest-input" placeholder="Paris, Lyon, Dubai…" onkeydown="crmAddDestTag(event)"/>
      </div>
    </div>
    <div class="crm-form-grid">
      <div style="display:flex;flex-direction:column;gap:6px">
        <label style="font-size:.72rem;font-weight:600;color:#64748b;text-transform:uppercase">Modes de transport</label>
        ${[['modeAerien','✈ Fret Aérien'],['modeMaritime','🚢 Fret Maritime'],['modeGroupage','📦 Groupage'],['modeExpress','⚡ Express (DHL/FedEx)']].map(([k,l])=>`
          <label style="display:flex;align-items:center;gap:6px;font-size:.82rem;font-weight:500;cursor:pointer">
            <input type="checkbox" id="pf-${k}" ${v[k]?'checked':''}> ${l}
          </label>`).join('')}
      </div>
      <div class="crm-form-group">
        <label>Étape pipeline</label>
        <select id="pf-stage">
          ${Object.entries(CRM_STAGES).map(([k,lbl])=>`<option value="${k}"${v.stage===k?' selected':''}>${lbl}</option>`).join('')}
        </select>
      </div>
    </div>
  </div>
  <div class="crm-form-section">
    <div class="crm-form-section-title"><i class="fa-solid fa-handshake"></i> Transitaire actuel</div>
    <div class="crm-form-grid">
      <div class="crm-form-group"><label>Transitaire actuel</label><input id="pf-transit" value="${v.transitaireActuel||''}"/></div>
      <div class="crm-form-group"><label>Satisfaction (1–5)</label>
        <select id="pf-satisf">
          <option value="">—</option>
          ${[1,2,3,4,5].map(n=>`<option value="${n}"${v.satisfactionActuel==n?' selected':''}>${n} — ${'⭐'.repeat(n)}</option>`).join('')}
        </select>
      </div>
      <div class="crm-form-group"><label>Renouvellement contrat</label><input id="pf-renouvellement" placeholder="ex: Mars 2026" value="${v.renouvellement||''}"/></div>
      <div class="crm-form-group full"><label>Remarques</label><textarea id="pf-remarques">${v.remarques||''}</textarea></div>
    </div>
  </div>`;
  crmOpenModal('crm-modal-prospect');
}

function crmTypeBtn(btn, val) {
  document.querySelectorAll('#crm-modal-prospect .crm-type-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const inp = document.getElementById('pf-type');
  if (inp) inp.value = val;
}
function crmAddDestTag(e) {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const inp = document.getElementById('crm-dest-input');
  const val = (inp?.value||'').trim();
  if (!val || _crmDestTags.includes(val)) { if(inp) inp.value=''; return; }
  _crmDestTags.push(val);
  if (inp) inp.value = '';
  const wrap = document.getElementById('crm-dest-tags-wrap');
  if (wrap) {
    const chip = document.createElement('span');
    chip.className = 'crm-tag-chip';
    chip.innerHTML = `${val}<span class="crm-tag-remove" onclick="crmRemoveDestTag('${val}')">×</span>`;
    wrap.insertBefore(chip, inp);
  }
}
function crmRemoveDestTag(tag) {
  _crmDestTags = _crmDestTags.filter(t=>t!==tag);
  crmOpenProspectModal(_crmEditProspect?.id);
}

function crmSaveProspectForm() {
  const rs = document.getElementById('pf-rs')?.value?.trim();
  if (!rs) { crmToast('La raison sociale est obligatoire.','error'); return; }
  const db = crmLoad();
  const now = new Date().toISOString();
  const data = {
    id: _crmEditProspect?.id || crmID(),
    raisonSociale: rs,
    sector:        document.getElementById('pf-sector')?.value||'',
    ville:         document.getElementById('pf-ville')?.value?.trim()||'',
    pays:          document.getElementById('pf-pays')?.value||'Maroc',
    ca:            document.getElementById('pf-ca')?.value?.trim()||'',
    adresse:       document.getElementById('pf-adresse')?.value?.trim()||'',
    dirigeant:     document.getElementById('pf-dirigeant')?.value?.trim()||'',
    logisticien:   document.getElementById('pf-logisticien')?.value?.trim()||'',
    tel:           document.getElementById('pf-tel')?.value?.trim()||'',
    email:         document.getElementById('pf-email')?.value?.trim()||'',
    web:           document.getElementById('pf-web')?.value?.trim()||'',
    type:          document.getElementById('pf-type')?.value||'export',
    nbExp:         document.getElementById('pf-nbexp')?.value||'',
    budgetExport:  document.getElementById('pf-budget-ex')?.value?.trim()||'',
    budgetImport:  document.getElementById('pf-budget-im')?.value?.trim()||'',
    destinations:  [..._crmDestTags],
    modeAerien:    document.getElementById('pf-modeAerien')?.checked||false,
    modeMaritime:  document.getElementById('pf-modeMaritime')?.checked||false,
    modeGroupage:  document.getElementById('pf-modeGroupage')?.checked||false,
    modeExpress:   document.getElementById('pf-modeExpress')?.checked||false,
    stage:         document.getElementById('pf-stage')?.value||'prospect',
    transitaireActuel: document.getElementById('pf-transit')?.value?.trim()||'',
    satisfactionActuel: document.getElementById('pf-satisf')?.value||'',
    renouvellement: document.getElementById('pf-renouvellement')?.value?.trim()||'',
    remarques:     document.getElementById('pf-remarques')?.value?.trim()||'',
    visites:       _crmEditProspect?.visites || [],
    createdAt:     _crmEditProspect?.createdAt || now,
    updatedAt:     now
  };
  if (_crmEditProspect) {
    const idx = db.prospects.findIndex(x=>x.id===_crmEditProspect.id);
    if (idx>=0) db.prospects[idx] = data;
  } else {
    db.prospects.push(data);
  }
  crmSave(db);
  crmCloseModal('crm-modal-prospect');
  crmRefreshStats();
  if (_crmDetailId === data.id) { crmRenderDetail(); } else { crmRenderProspects(); }
  crmToast(_crmEditProspect ? 'Prospect mis à jour ✓' : 'Prospect créé ✓', 'success');
}

function crmSetStage(id, stage) {
  const db = crmLoad();
  const p = db.prospects.find(x=>x.id===id);
  if (p) { p.stage = stage; p.updatedAt = new Date().toISOString(); crmSave(db); }
  crmRefreshStats();
  crmRenderDetail();
  crmToast('Étape mise à jour : ' + CRM_STAGES[stage], 'success');
}

function crmDeleteProspect(id) {
  if (!confirm('Supprimer ce prospect et toutes ses données ?')) return;
  const db = crmLoad();
  db.prospects = db.prospects.filter(x=>x.id!==id);
  db.devis     = db.devis.filter(x=>x.prospectId!==id);
  db.rdv       = db.rdv.filter(x=>x.prospectId!==id);
  crmSave(db);
  crmCloseDetail();
  crmRefreshStats();
  crmToast('Prospect supprimé.', 'success');
}

function crmToggleAddVisit(id) {
  const f = document.getElementById('crm-add-visit-form-'+id);
  if (f) f.style.display = f.style.display==='none'?'':'none';
}

function crmAddVisit(id) {
  const type = document.getElementById('visit-type-'+id)?.value||'note';
  const date = document.getElementById('visit-date-'+id)?.value||new Date().toISOString().slice(0,10);
  const texte= document.getElementById('visit-text-'+id)?.value?.trim()||'';
  if (!texte) { crmToast('Rédigez un compte-rendu.','error'); return; }
  const db = crmLoad();
  const p  = db.prospects.find(x=>x.id===id);
  if (!p) return;
  if (!p.visites) p.visites = [];
  p.visites.push({ id:crmID(), type, date, texte, createdAt:new Date().toISOString() });
  p.updatedAt = new Date().toISOString();
  crmSave(db);
  crmRenderDetail();
  crmDetailTab('visites');
  crmToast('Note enregistrée ✓','success');
}

/* ════════════════════════════════
   CALENDAR
   ════════════════════════════════ */
const CAL_MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const CAL_DOW_FR    = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

function crmRenderCalendar() {
  const db   = crmLoad();
  const year = _crmCalYear;
  const mon  = _crmCalMonth;
  const title = document.getElementById('crm-cal-title');
  if (title) title.textContent = CAL_MONTHS_FR[mon] + ' ' + year;

  // Build calendar
  const firstDay = new Date(year, mon, 1);
  const lastDay  = new Date(year, mon+1, 0);
  let startDow = (firstDay.getDay()+6)%7; // Mon=0
  const today  = new Date();

  const grid = document.getElementById('crm-cal-grid');
  if (!grid) return;

  let html = `<div class="crm-cal-dow-row">${CAL_DOW_FR.map(d=>`<div class="crm-cal-dow">${d}</div>`).join('')}</div><div class="crm-cal-days">`;

  // Prev month padding
  const prevLast = new Date(year, mon, 0).getDate();
  for (let i=startDow-1; i>=0; i--) {
    html += `<div class="crm-cal-day other-month"><div class="crm-day-num">${prevLast-i}</div></div>`;
  }

  for (let d=1; d<=lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(mon+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = today.getFullYear()===year && today.getMonth()===mon && today.getDate()===d;
    const isSel   = _crmCalSel === dateStr;
    const dayRdv  = db.rdv.filter(r=>r.date===dateStr);
    html += `<div class="crm-cal-day${isToday?' today':''}${isSel?' selected':''}" onclick="crmCalSelect('${dateStr}')">
      <div class="crm-day-num">${d}</div>
      <div class="crm-day-events">${dayRdv.slice(0,3).map(r=>`<div class="crm-day-event ${r.type||'other'}">${r.heure||''} ${r.titre||'RDV'}</div>`).join('')}</div>
    </div>`;
  }
  // Next month padding
  const total = startDow + lastDay.getDate();
  const rem   = (7 - total%7)%7;
  for (let i=1; i<=rem; i++) {
    html += `<div class="crm-cal-day other-month"><div class="crm-day-num">${i}</div></div>`;
  }
  html += '</div>';
  grid.innerHTML = html;

  // RDV sidebar
  crmRenderRdvSidebar(db, mon, year);
}

function crmRenderRdvSidebar(db, mon, year) {
  const monthRdv = (db.rdv||[]).filter(r => {
    const d = new Date(r.date+'T00:00:00');
    return d.getMonth()===mon && d.getFullYear()===year;
  }).sort((a,b)=>a.date.localeCompare(b.date)||(a.heure||'').localeCompare(b.heure||''));

  const title = document.getElementById('crm-rdv-sidebar-title');
  const count = document.getElementById('crm-rdv-count');
  const list  = document.getElementById('crm-rdv-list');
  if (title) title.textContent = _crmCalSel ? 'RDV du ' + new Date(_crmCalSel+'T00:00:00').toLocaleDateString('fr-FR') : 'RDV — ' + CAL_MONTHS_FR[mon];
  const shown = _crmCalSel ? monthRdv.filter(r=>r.date===_crmCalSel) : monthRdv;
  if (count) count.textContent = shown.length + ' rendez-vous';
  if (!list) return;
  if (!shown.length) { list.innerHTML='<div style="padding:20px;text-align:center;color:#94a3b8;font-size:.82rem">Aucun RDV</div>'; return; }
  const pros = db.prospects;
  list.innerHTML = shown.map(r => {
    const p = pros.find(x=>x.id===r.prospectId);
    return `<div class="crm-rdv-item" onclick="crmOpenRdvModal('${r.prospectId||''}','${r.id}')">
      <div class="crm-rdv-time">${r.date} ${r.heure||''}</div>
      <div class="crm-rdv-title">${r.titre||'Rendez-vous'}</div>
      <div class="crm-rdv-prospect">${p?p.raisonSociale:r.lieu||''}</div>
    </div>`;
  }).join('');
}

function crmCalSelect(dateStr) { _crmCalSel = _crmCalSel===dateStr?null:dateStr; crmRenderCalendar(); }
function crmCalPrev() { _crmCalMonth--; if(_crmCalMonth<0){_crmCalMonth=11;_crmCalYear--;} crmRenderCalendar(); }
function crmCalNext() { _crmCalMonth++; if(_crmCalMonth>11){_crmCalMonth=0;_crmCalYear++;} crmRenderCalendar(); }

/* ── RDV Modal ── */
function crmOpenRdvModal(prospectId, rdvId) {
  const db = crmLoad();
  const rdv = rdvId ? db.rdv.find(x=>x.id===rdvId) : null;
  const pros = db.prospects;
  const selDate = _crmCalSel || new Date().toISOString().slice(0,10);
  const v = rdv || {};
  const body = document.getElementById('crm-modal-rdv-body');
  if (!body) return;
  body.innerHTML = `
  <div class="crm-form-grid">
    <div class="crm-form-group full"><label>Titre du RDV *</label><input id="rdvf-titre" value="${v.titre||''}" placeholder="ex: Visite commerciale GO PLUS EXPRESS"/></div>
    <div class="crm-form-group"><label>Prospect</label>
      <select id="rdvf-prospect">
        <option value="">— Aucun prospect —</option>
        ${pros.map(p=>`<option value="${p.id}"${(prospectId===p.id||v.prospectId===p.id)?' selected':''}>${p.raisonSociale}</option>`).join('')}
      </select>
    </div>
    <div class="crm-form-group"><label>Type</label>
      <select id="rdvf-type">
        <option value="visite"${v.type==='visite'?' selected':''}>🤝 Visite physique</option>
        <option value="tel"${v.type==='tel'?' selected':''}>📞 Téléphonique</option>
        <option value="demo"${v.type==='demo'?' selected':''}>💻 Démo / Vidéo</option>
        <option value="other"${v.type==='other'?' selected':''}>Autre</option>
      </select>
    </div>
    <div class="crm-form-group"><label>Date *</label><input type="date" id="rdvf-date" value="${v.date||selDate}"/></div>
    <div class="crm-form-group"><label>Heure</label><input type="time" id="rdvf-heure" value="${v.heure||'09:00'}"/></div>
    <div class="crm-form-group"><label>Durée (min)</label><input type="number" id="rdvf-duree" min="15" step="15" value="${v.duree||60}"/></div>
    <div class="crm-form-group full"><label>Lieu / Lien</label><input id="rdvf-lieu" placeholder="Adresse ou lien Teams/Zoom" value="${v.lieu||''}"/></div>
    <div class="crm-form-group full"><label>Notes préparatoires</label><textarea id="rdvf-notes">${v.notes||''}</textarea></div>
  </div>
  <input type="hidden" id="rdvf-id" value="${v.id||''}"/>`;
  crmOpenModal('crm-modal-rdv');
}

function crmSaveRdvForm() {
  const titre = document.getElementById('rdvf-titre')?.value?.trim();
  const date  = document.getElementById('rdvf-date')?.value;
  if (!titre||!date) { crmToast('Titre et date obligatoires.','error'); return; }
  const db  = crmLoad();
  const eid = document.getElementById('rdvf-id')?.value;
  const rdv = {
    id:          eid || crmID(),
    titre,
    prospectId:  document.getElementById('rdvf-prospect')?.value||'',
    type:        document.getElementById('rdvf-type')?.value||'visite',
    date,
    heure:       document.getElementById('rdvf-heure')?.value||'',
    duree:       document.getElementById('rdvf-duree')?.value||60,
    lieu:        document.getElementById('rdvf-lieu')?.value?.trim()||'',
    notes:       document.getElementById('rdvf-notes')?.value?.trim()||'',
    createdAt:   new Date().toISOString()
  };
  if (eid) { const idx=db.rdv.findIndex(x=>x.id===eid); if(idx>=0) db.rdv[idx]=rdv; }
  else db.rdv.push(rdv);
  crmSave(db);
  crmCloseModal('crm-modal-rdv');
  crmRefreshStats();
  crmRenderCalendar();
  crmToast('RDV enregistré ✓','success');
}

/* ════════════════════════════════
   DEVIS
   ════════════════════════════════ */
function crmRenderDevisList() {
  const db   = crmLoad();
  const q    = (document.getElementById('crm-devis-search')?.value||'').toLowerCase();
  const type = document.getElementById('crm-devis-filter-type')?.value||'';
  const stat = document.getElementById('crm-devis-filter-status')?.value||'';
  const grid = document.getElementById('crm-devis-grid');
  if (!grid) return;

  let list = db.devis.filter(d=>{
    if (type && d.type!==type) return false;
    if (stat && d.status!==stat) return false;
    if (q) {
      const p = db.prospects.find(x=>x.id===d.prospectId);
      const hay = [d.num||'',d.objet||'',p?.raisonSociale||''].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }).sort((a,b)=>b.createdAt?.localeCompare(a.createdAt||'')||0);

  if (!list.length) {
    grid.innerHTML=`<div class="crm-empty"><i class="fa-solid fa-file-circle-xmark"></i><p>Aucun devis.</p></div>`;
    return;
  }
  const pros = db.prospects;
  grid.innerHTML = list.map(d => {
    const p = pros.find(x=>x.id===d.prospectId);
    return `<div class="crm-devis-row">
      <span class="crm-devis-num">${d.num||d.id.slice(-6).toUpperCase()}</span>
      <span class="crm-devis-type ${d.type||'aerien'}">${{aerien:'Aérien',maritime:'Maritime',groupage:'Groupage',express:'Express',route:'Route'}[d.type]||'—'}</span>
      <span class="crm-devis-company">${p?p.raisonSociale:'—'} ${d.objet?'· '+d.objet:''}</span>
      <span class="crm-devis-amount">${(d.total||0).toLocaleString('fr-MA')} ${d.devise||'MAD'}</span>
      <span class="crm-devis-status ${d.status||'brouillon'}">${{brouillon:'Brouillon',envoye:'Envoyé',accepte:'Accepté',refuse:'Refusé'}[d.status]||'—'}</span>
      <button class="prospect-action-btn" onclick="crmDeleteDevis('${d.id}')" title="Supprimer"><i class="fa-solid fa-trash"></i></button>
    </div>`;
  }).join('');
}

function crmOpenDevisModal(prospectId) {
  const db = crmLoad();
  const pros = db.prospects;
  _crmDevisLines = [{desc:'',qte:1,pu:0,total:0}];
  const body = document.getElementById('crm-modal-devis-body');
  if (!body) return;
  body.innerHTML = `
  <div class="crm-form-grid" style="margin-bottom:14px">
    <div class="crm-form-group"><label>Prospect *</label>
      <select id="dvf-prospect">
        <option value="">— Choisir —</option>
        ${pros.map(p=>`<option value="${p.id}"${prospectId===p.id?' selected':''}>${p.raisonSociale}</option>`).join('')}
      </select>
    </div>
    <div class="crm-form-group"><label>Type de prestation *</label>
      <select id="dvf-type">
        <option value="aerien">✈ Fret Aérien</option>
        <option value="maritime">🚢 Fret Maritime</option>
        <option value="groupage">📦 Groupage LCL</option>
        <option value="express">⚡ Express (DHL/FedEx)</option>
        <option value="route">🚛 Transport Routier</option>
      </select>
    </div>
    <div class="crm-form-group"><label>Objet / Description</label><input id="dvf-objet" placeholder="ex: CDG → CMN 500kg"/></div>
    <div class="crm-form-group"><label>Date de validité</label><input type="date" id="dvf-validite" value="${new Date(Date.now()+30*864e5).toISOString().slice(0,10)}"/></div>
    <div class="crm-form-group"><label>Devise</label>
      <select id="dvf-devise">
        <option value="MAD">MAD (Dirham)</option>
        <option value="EUR">EUR</option>
        <option value="USD">USD</option>
      </select>
    </div>
    <div class="crm-form-group"><label>Statut</label>
      <select id="dvf-status">
        <option value="brouillon">Brouillon</option>
        <option value="envoye">Envoyé</option>
        <option value="accepte">Accepté</option>
        <option value="refuse">Refusé</option>
      </select>
    </div>
  </div>
  <div style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin-bottom:8px">Lignes de devis</div>
  <div style="display:grid;grid-template-columns:3fr 80px 100px 100px 30px;gap:6px;margin-bottom:4px;font-size:.7rem;font-weight:700;color:#94a3b8;padding:0 2px">
    <span>Description</span><span>Qté</span><span>PU (HT)</span><span>Total HT</span><span></span>
  </div>
  <div id="dvf-lines"></div>
  <button style="margin-top:8px;padding:6px 12px;border:1px dashed #00a99d;background:transparent;color:#00a99d;border-radius:7px;font-size:.8rem;font-weight:600;cursor:pointer" onclick="crmAddDevisLine()">
    <i class="fa-solid fa-plus"></i> Ajouter une ligne
  </button>
  <div class="crm-devis-total-bar" style="margin-top:12px">
    <span>Total HT : <strong id="dvf-total">0,00</strong></span>
    <span id="dvf-tva-line" style="display:none">TVA 20% : <strong id="dvf-tva">0,00</strong></span>
    <span id="dvf-ttc-line" style="display:none">Total TTC : <strong id="dvf-ttc">0,00</strong></span>
  </div>
  <div style="margin-top:12px">
    <label style="display:flex;align-items:center;gap:8px;font-size:.82rem;font-weight:500;cursor:pointer">
      <input type="checkbox" id="dvf-tva-check" onchange="crmToggleTVA()"> Appliquer TVA 20%
    </label>
  </div>
  <div class="crm-form-group full" style="margin-top:12px"><label>Conditions générales / Notes</label><textarea id="dvf-notes" placeholder="Conditions, délai de transit, validité…"></textarea></div>`;
  crmRenderDevisLines();
  crmOpenModal('crm-modal-devis');
}

function crmAddDevisLine() {
  _crmDevisLines.push({desc:'',qte:1,pu:0,total:0});
  crmRenderDevisLines();
}
function crmDelDevisLine(i) {
  _crmDevisLines.splice(i,1);
  crmRenderDevisLines();
}
function crmUpdateDevisLine(i, field, val) {
  _crmDevisLines[i][field] = field==='desc' ? val : parseFloat(val)||0;
  if (field!=='total') _crmDevisLines[i].total = _crmDevisLines[i].qte * _crmDevisLines[i].pu;
  crmRenderDevisLines();
}
function crmRenderDevisLines() {
  const wrap = document.getElementById('dvf-lines');
  if (!wrap) return;
  wrap.innerHTML = _crmDevisLines.map((l,i)=>`
    <div class="crm-devis-line">
      <input placeholder="Description" value="${l.desc||''}" oninput="crmUpdateDevisLine(${i},'desc',this.value)"/>
      <input type="number" min="1" value="${l.qte||1}" oninput="crmUpdateDevisLine(${i},'qte',this.value)"/>
      <input type="number" min="0" step="0.01" value="${l.pu||''}" placeholder="0.00" oninput="crmUpdateDevisLine(${i},'pu',this.value)"/>
      <input type="number" value="${l.total||0}" readonly style="background:#f8fafc"/>
      <button class="crm-devis-line-del" onclick="crmDelDevisLine(${i})"><i class="fa-solid fa-xmark"></i></button>
    </div>`).join('');
  const ht = _crmDevisLines.reduce((s,l)=>s+(l.total||0),0);
  const tvaOn = document.getElementById('dvf-tva-check')?.checked;
  const el_total = document.getElementById('dvf-total');
  const el_tva   = document.getElementById('dvf-tva');
  const el_ttc   = document.getElementById('dvf-ttc');
  if (el_total) el_total.textContent = ht.toLocaleString('fr-MA',{minimumFractionDigits:2});
  if (tvaOn) {
    const tva = ht*0.2, ttc = ht+tva;
    if (el_tva) el_tva.textContent = tva.toLocaleString('fr-MA',{minimumFractionDigits:2});
    if (el_ttc) el_ttc.textContent = ttc.toLocaleString('fr-MA',{minimumFractionDigits:2});
  }
}
function crmToggleTVA() {
  const on = document.getElementById('dvf-tva-check')?.checked;
  const tvl = document.getElementById('dvf-tva-line');
  const ttl = document.getElementById('dvf-ttc-line');
  if (tvl) tvl.style.display = on?'':'none';
  if (ttl) ttl.style.display = on?'':'none';
  crmRenderDevisLines();
}
function crmSaveDevisForm() {
  const prospectId = document.getElementById('dvf-prospect')?.value;
  if (!prospectId) { crmToast('Sélectionnez un prospect.','error'); return; }
  const db   = crmLoad();
  const tvaOn= document.getElementById('dvf-tva-check')?.checked;
  const ht   = _crmDevisLines.reduce((s,l)=>s+(l.total||0),0);
  const total= tvaOn ? ht*1.2 : ht;
  const num  = 'DEV-' + new Date().getFullYear() + '-' + String(db.devis.length+1).padStart(4,'0');
  const dv   = {
    id: crmID(), num,
    prospectId,
    type:     document.getElementById('dvf-type')?.value||'aerien',
    objet:    document.getElementById('dvf-objet')?.value?.trim()||'',
    validite: document.getElementById('dvf-validite')?.value||'',
    devise:   document.getElementById('dvf-devise')?.value||'MAD',
    status:   document.getElementById('dvf-status')?.value||'brouillon',
    lignes:   [..._crmDevisLines],
    tva:      tvaOn,
    total:    Math.round(total*100)/100,
    notes:    document.getElementById('dvf-notes')?.value?.trim()||'',
    createdAt:new Date().toISOString()
  };
  db.devis.push(dv);
  crmSave(db);
  crmCloseModal('crm-modal-devis');
  crmRefreshStats();
  crmRenderDevisList();
  if (_crmDetailId===prospectId) crmRenderDetail();
  crmToast(`Devis ${num} enregistré ✓`,'success');
}
function crmDeleteDevis(id) {
  if (!confirm('Supprimer ce devis ?')) return;
  const db = crmLoad();
  db.devis = db.devis.filter(x=>x.id!==id);
  crmSave(db);
  crmRenderDevisList();
  if (_crmDetailId) crmRenderDetail();
  crmToast('Devis supprimé.','success');
}

/* ════════════════════════════════
   EXCEL IMPORT
   ════════════════════════════════ */
function crmHandleDrop(e) {
  e.preventDefault();
  document.getElementById('crm-import-zone')?.classList.remove('dragging');
  const file = e.dataTransfer?.files?.[0];
  if (file) crmParseFile(file);
}
function crmHandleFileInput(inp) {
  const file = inp.files?.[0];
  if (file) crmParseFile(file);
}

function crmParseFile(file) {
  if (!window.XLSX) {
    crmToast('Bibliothèque Excel non chargée. Vérifiez votre connexion.','error');
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb   = XLSX.read(e.target.result, {type:'array'});
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
      if (data.length < 2) { crmToast('Fichier vide ou non reconnu.','error'); return; }
      _crmImportCols = data[0].map(c=>String(c).trim());
      _crmImportRows = data.slice(1).filter(r=>r.some(c=>c!==''));
      crmShowImportPreview(file.name);
    } catch(err) { crmToast('Erreur de lecture du fichier.','error'); }
  };
  reader.readAsArrayBuffer(file);
}

const CRM_IMPORT_FIELDS = {
  raisonSociale: 'Raison Sociale *',
  ville:         'Ville',
  pays:          'Pays',
  sector:        'Secteur',
  ca:            'Chiffre d\'Affaires',
  dirigeant:     'Dirigeant',
  logisticien:   'Logisticien / Contact',
  email:         'Email',
  tel:           'Téléphone',
  web:           'Site Web'
};

function crmShowImportPreview(filename) {
  const wrap = document.getElementById('crm-import-preview-wrap');
  if (!wrap) return;
  wrap.style.display='block';
  document.getElementById('crm-import-zone').style.display='none';
  document.getElementById('crm-import-filename').textContent = filename;
  document.getElementById('crm-import-rowcount').textContent = _crmImportRows.length + ' lignes détectées';
  document.getElementById('crm-import-count').textContent = _crmImportRows.length;

  // Preview table (max 5 rows)
  const preview = _crmImportRows.slice(0,5);
  const tbl = document.getElementById('crm-import-table');
  tbl.innerHTML = `<table>
    <thead><tr>${_crmImportCols.map(c=>`<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${preview.map(r=>`<tr>${_crmImportCols.map((_,i)=>`<td>${r[i]||''}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`;

  // Column mapping
  const map = document.getElementById('crm-import-col-map');
  map.innerHTML = Object.entries(CRM_IMPORT_FIELDS).map(([field, label]) => {
    const guessIdx = _crmImportCols.findIndex(c => c.toLowerCase().includes(field.toLowerCase()) || c.toLowerCase().includes(label.toLowerCase().split(' ')[0]));
    return `<div>
      <label>${label}</label>
      <select id="col-map-${field}">
        <option value="">— Ignorer —</option>
        ${_crmImportCols.map((c,i)=>`<option value="${i}"${i===guessIdx?' selected':''}>${c}</option>`).join('')}
      </select>
    </div>`;
  }).join('');
}

function crmResetImport() {
  _crmImportRows=[];_crmImportCols=[];
  document.getElementById('crm-import-preview-wrap').style.display='none';
  document.getElementById('crm-import-zone').style.display='';
  document.getElementById('crm-file-input').value='';
}

function crmDoImport() {
  const db = crmLoad();
  let count = 0;
  const now = new Date().toISOString();
  const prog = document.getElementById('crm-import-progress');
  const bar  = document.getElementById('crm-import-progress-bar');
  if (prog) prog.style.display='block';

  _crmImportRows.forEach((row, idx) => {
    const get = field => {
      const sel = document.getElementById('col-map-'+field);
      const colIdx = sel?.value;
      return colIdx!==''&&colIdx!==undefined ? String(row[parseInt(colIdx)]||'').trim() : '';
    };
    const rs = get('raisonSociale');
    if (!rs) return;
    // Skip duplicates
    if (db.prospects.some(p=>p.raisonSociale.toLowerCase()===rs.toLowerCase())) return;
    db.prospects.push({
      id: crmID(), raisonSociale:rs,
      ville:       get('ville'),
      pays:        get('pays')||'Maroc',
      sector:      get('sector'),
      ca:          get('ca'),
      dirigeant:   get('dirigeant'),
      logisticien: get('logisticien'),
      email:       get('email'),
      tel:         get('tel'),
      web:         get('web'),
      type:'export', stage:'prospect', visites:[], destinations:[],
      createdAt:now, updatedAt:now
    });
    count++;
    if (bar) bar.style.width = Math.round((idx+1)/_crmImportRows.length*100)+'%';
  });
  crmSave(db);
  setTimeout(()=>{
    crmResetImport();
    crmRefreshStats();
    crmToast(`${count} prospect(s) importé(s) ✓`,'success');
  },600);
}

/* ════════════════════════════════
   AGENT IA — BASE DE DONNÉES SOCIÉTÉS MAROCAINES
   ════════════════════════════════ */
const CRM_AI_DB = [
  // Agro-alimentaire
  {n:'Copag',v:'Agadir',s:'Agro-alimentaire',ca:'2,1 Mrd MAD',dir:'M. Abdellatif Aït Daoudi',t:'export',desc:'Leader jus de fruits, lait, conserves'},
  {n:'Centrale Danone Maroc',v:'Casablanca',s:'Agro-alimentaire',ca:'3,4 Mrd MAD',dir:'M. Radi',t:'both',desc:'Produits laitiers'},
  {n:'Cosumar',v:'Casablanca',s:'Agro-alimentaire',ca:'6 Mrd MAD',dir:'M. Mohamed Fikrat',t:'import',desc:'Sucre, raffinage betterave'},
  {n:'Les Conserves de Meknès',v:'Meknès',s:'Agro-alimentaire',ca:'820 M MAD',dir:'Groupe Brahim',t:'export',desc:'Olives, conserves végétales'},
  {n:'Lesieur Cristal',v:'Casablanca',s:'Agro-alimentaire',ca:'4,2 Mrd MAD',dir:'M. Bassim Jaï Hokimi',t:'both',desc:'Huiles alimentaires'},
  {n:'Maroc Fruit Board',v:'Casablanca',s:'Agro-alimentaire',ca:'450 M MAD',dir:'M. Hassan Sekkouri',t:'export',desc:'Agrumes et primeurs export'},
  {n:'Agro Juice Processing',v:'Agadir',s:'Agro-alimentaire',ca:'280 M MAD',dir:'Famille Benali',t:'export',desc:'Jus de fruits et aromatiques'},
  {n:'Fromatal',v:'Fès',s:'Agro-alimentaire',ca:'150 M MAD',dir:'M. Bensouda',t:'both',desc:'Fromages et dérivés lait'},
  // Textile
  {n:'Marwa',v:'Casablanca',s:'Textile & Habillement',ca:'1,1 Mrd MAD',dir:'M. Abdellatif Zejly',t:'import',desc:'Prêt-à-porter grande distribution'},
  {n:'Aksal Group',v:'Casablanca',s:'Textile & Habillement',ca:'2,5 Mrd MAD',dir:'M. Salim Cheikh',t:'both',desc:'Retail & franchises mode'},
  {n:'Riad & Co Textile',v:'Tanger',s:'Textile & Habillement',ca:'320 M MAD',dir:'M. Riad Mezzour',t:'export',desc:'Confection sous-traitance Europe'},
  {n:'Confection Maroc Export',v:'Fès',s:'Textile & Habillement',ca:'180 M MAD',dir:'Mme Fatima Zehraoui',t:'export',desc:'Tricotage et broderie'},
  // Automobile
  {n:'Sumitomo Electric Wiring Maroc',v:'Kénitra',s:'Automobile & Pièces',ca:'4,8 Mrd MAD',dir:'M. Toshifumi Shindo',t:'both',desc:'Câblage automobile'},
  {n:'Renault Maroc Tanger',v:'Tanger',s:'Automobile & Pièces',ca:'18 Mrd MAD',dir:'M. Guillaume Sicard',t:'export',desc:'Assemblage véhicules export'},
  {n:'SNEP Industrie',v:'Casablanca',s:'Automobile & Pièces',ca:'890 M MAD',dir:'M. Bennouna',t:'both',desc:'Pièces plastiques auto'},
  {n:'Delphi Morocco',v:'Tanger',s:'Automobile & Pièces',ca:'2,2 Mrd MAD',dir:'M. Javier Ruiz',t:'export',desc:'Composants électroniques auto'},
  // Pharmacie
  {n:'Sothema',v:'Casablanca',s:'Pharmacie & Cosmétique',ca:'1,6 Mrd MAD',dir:'M. Omar Tazi',t:'both',desc:'Laboratoire pharmaceutique'},
  {n:'Cooper Pharma',v:'Casablanca',s:'Pharmacie & Cosmétique',ca:'950 M MAD',dir:'M. Reda Bensaid',t:'export',desc:'Génériques et OTC Afrique'},
  {n:'LMB Laboratoires',v:'Rabat',s:'Pharmacie & Cosmétique',ca:'420 M MAD',dir:'M. El Boury',t:'both',desc:'Cosmétiques naturels argan'},
  {n:'Argana Bio',v:'Agadir',s:'Pharmacie & Cosmétique',ca:'90 M MAD',dir:'Mme Souad Benomar',t:'export',desc:'Huile d\'argan Bio certifiée'},
  // BTP
  {n:'Ciments du Maroc',v:'Casablanca',s:'BTP & Matériaux',ca:'4,1 Mrd MAD',dir:'M. Khalid Madih',t:'both',desc:'Ciment, granulats, béton'},
  {n:'Holcim Maroc',v:'Casablanca',s:'BTP & Matériaux',ca:'3,8 Mrd MAD',dir:'M. Aymane Taud',t:'import',desc:'Ciment et matériaux construction'},
  {n:'BMCE Build',v:'Casablanca',s:'BTP & Matériaux',ca:'600 M MAD',dir:'M. Chami',t:'import',desc:'Matériaux BTP importation'},
  {n:'Dolidol Maroc',v:'Casablanca',s:'BTP & Matériaux',ca:'280 M MAD',dir:'M. Berrada',t:'both',desc:'Mousses et matelas industriels'},
  // Chimie
  {n:'OCP Group',v:'Casablanca',s:'Chimie & Plastiques',ca:'68 Mrd MAD',dir:'M. Mostafa Terrab',t:'export',desc:'Phosphates et dérivés fertilisants'},
  {n:'Maghreb Steel',v:'Casablanca',s:'Chimie & Plastiques',ca:'5,5 Mrd MAD',dir:'M. Mohamed Khalil',t:'import',desc:'Acier plat laminé à chaud'},
  {n:'Induplast Maroc',v:'Casablanca',s:'Chimie & Plastiques',ca:'310 M MAD',dir:'M. Kettani',t:'both',desc:'Emballages plastiques industriels'},
  // E-commerce & Distribution
  {n:'Jumia Maroc',v:'Casablanca',s:'E-commerce',ca:'350 M MAD',dir:'M. Sami Slim',t:'import',desc:'Marketplace e-commerce'},
  {n:'Glovo Maroc',v:'Casablanca',s:'E-commerce',ca:'120 M MAD',dir:'M. Alaa Bouhlel',t:'both',desc:'Livraison dernière mile'},
  {n:'Marjane Holding',v:'Rabat',s:'Commerce & Distribution',ca:'14 Mrd MAD',dir:'M. Youssef Rouissi',t:'import',desc:'Grande distribution'},
  {n:'Label\'Vie (Carrefour)',v:'Rabat',s:'Commerce & Distribution',ca:'9,6 Mrd MAD',dir:'M. Zouhair Bennani',t:'import',desc:'Supermarchés et hypermarchés'},
  // Logistique
  {n:'IMTC Maroc',v:'Casablanca',s:'Logistique & Transport',ca:'180 M MAD',dir:'M. Mourad Tazi',t:'both',desc:'Transit et logistique industrielle'},
  {n:'DHL Express Maroc',v:'Casablanca',s:'Logistique & Transport',ca:'520 M MAD',dir:'M. Carlos Garcia',t:'both',desc:'Express international'},
  {n:'SDV Maroc (Bolloré)',v:'Casablanca',s:'Logistique & Transport',ca:'980 M MAD',dir:'M. Denis Le Bec',t:'both',desc:'Logistique et transit'},
  // Mines & Énergie
  {n:'Managem',v:'Casablanca',s:'Mines & Énergie',ca:'4,3 Mrd MAD',dir:'M. Imad Toumi',t:'export',desc:'Mines cobalt, cuivre, zinc'},
  {n:'Masen',v:'Rabat',s:'Mines & Énergie',ca:'1,2 Mrd MAD',dir:'M. Mohamed Rachid El Bayed',t:'import',desc:'Énergies renouvelables'},
  // Agroéquipement
  {n:'Marvij Agri',v:'Meknès',s:'Agroéquipement',ca:'95 M MAD',dir:'M. Zouheir Fennane',t:'import',desc:'Matériel agricole et irrigation'},
  {n:'AGRI-SOUSS',v:'Agadir',s:'Agroéquipement',ca:'75 M MAD',dir:'M. Ait Omar',t:'both',desc:'Semences et intrants agricoles'},
  // Pêche
  {n:'Sapmer Maroc',v:'Agadir',s:'Pêche & Aquaculture',ca:'420 M MAD',dir:'M. Van der Stegen',t:'export',desc:'Produits de la mer réfrigérés'},
  {n:'Copelit',v:'Agadir',s:'Pêche & Aquaculture',ca:'280 M MAD',dir:'Mme Benchekroun',t:'export',desc:'Conserves sardines et anchois'},
  // Électronique
  {n:'Lear Corporation Maroc',v:'Tanger',s:'Électronique & High-Tech',ca:'3,1 Mrd MAD',dir:'M. Frank Leroux',t:'export',desc:'Sièges et systèmes électriques'},
  {n:'Yazaki Maroc',v:'Kénitra',s:'Électronique & High-Tech',ca:'5,6 Mrd MAD',dir:'M. Hamid Fakiri',t:'both',desc:'Câblage automobile et électronique'},
];

let _crmAITimer = null;

function crmAISearch() {
  const sector  = document.getElementById('ai-sector')?.value||'';
  const city    = document.getElementById('ai-city')?.value||'';
  const country = document.getElementById('ai-country')?.value||'';
  const type    = document.getElementById('ai-type')?.value||'';
  const kw      = (document.getElementById('ai-keywords')?.value||'').toLowerCase();

  const btn = document.getElementById('crm-ai-run-btn');
  const thinking = document.getElementById('crm-ai-thinking');
  const results  = document.getElementById('crm-ai-results-wrap');
  if (btn) btn.disabled = true;
  if (thinking) thinking.classList.add('active');
  if (results)  results.innerHTML = '';

  // Simulate AI steps
  const steps = [
    {text:`Analyse des critères : ${sector||'tous secteurs'}, ${city||'toutes villes'}, ${country}`, delay:400},
    {text:'Connexion aux bases de données entreprises…', delay:900},
    {text:'Extraction OMPIC / Registre du commerce…', delay:1500},
    {text:'Croisement données ADII (exportateurs/importateurs)…', delay:2200},
    {text:'Enrichissement : contacts, CA, secteur…', delay:2900},
    {text:'Vérification des doublons avec votre base CRM…', delay:3500},
  ];

  const stepsEl = document.getElementById('crm-ai-steps');
  if (stepsEl) stepsEl.innerHTML = '';
  const statusEl = document.getElementById('crm-ai-status');

  steps.forEach((step, i) => {
    setTimeout(()=>{
      if (statusEl) statusEl.textContent = step.text;
      if (stepsEl) {
        const line = document.createElement('div');
        line.className = 'crm-ai-step-line done';
        line.innerHTML = `<i class="fa-solid fa-check"></i> ${step.text}`;
        stepsEl.appendChild(line);
      }
    }, step.delay);
  });

  setTimeout(()=>{
    // Filter results
    const db = crmLoad();
    const existingNames = new Set(db.prospects.map(p=>p.raisonSociale.toLowerCase()));

    _crmAIResults = CRM_AI_DB.filter(co => {
      if (sector && co.s !== sector) return false;
      if (city   && co.v !== city)   return false;
      if (type   && co.t !== type && co.t !== 'both') return false;
      if (kw && !`${co.n} ${co.s} ${co.desc}`.toLowerCase().includes(kw)) return false;
      return true;
    }).map(co => ({...co, alreadyAdded: existingNames.has(co.n.toLowerCase())}));

    if (btn) btn.disabled = false;
    if (thinking) thinking.classList.remove('active');
    crmRenderAIResults();
  }, 4000);
}

function crmRenderAIResults() {
  const wrap = document.getElementById('crm-ai-results-wrap');
  if (!wrap) return;
  if (!_crmAIResults.length) {
    wrap.innerHTML = `<div class="crm-empty"><i class="fa-solid fa-magnifying-glass"></i><p>Aucune société trouvée pour ces critères.<br>Essayez d'élargir la recherche.</p></div>`;
    return;
  }
  wrap.innerHTML = `
  <div class="crm-ai-result-header">
    <h4><i class="fa-solid fa-building" style="color:#00a99d"></i> Résultats — ${_crmAIResults.length} société(s) trouvée(s)</h4>
    <button class="crm-btn-secondary" onclick="crmAIImportAll()"><i class="fa-solid fa-file-import"></i> Tout importer (${_crmAIResults.filter(c=>!c.alreadyAdded).length})</button>
  </div>
  <div class="crm-ai-company-grid">
    ${_crmAIResults.map((co,i)=>`
    <div class="crm-ai-company-card" id="ai-co-${i}">
      <div class="crm-ai-co-name">${co.n}</div>
      <div class="crm-ai-co-meta">
        <span class="crm-ai-co-chip"><i class="fa-solid fa-location-dot"></i>${co.v}</span>
        <span class="crm-ai-co-chip"><i class="fa-solid fa-industry"></i>${co.s}</span>
        ${co.ca?`<span class="crm-ai-co-chip"><i class="fa-solid fa-chart-line"></i>CA: ${co.ca}</span>`:''}
        <span class="crm-ai-co-chip" style="background:${co.t==='export'?'#eff6ff':co.t==='import'?'#faf5ff':'#f0fdf4'};color:${co.t==='export'?'#3b82f6':co.t==='import'?'#8b5cf6':'#10b981'}">${co.t==='export'?'Export':co.t==='import'?'Import':'Mixte'}</span>
      </div>
      <div style="font-size:.75rem;color:#64748b">${co.desc||''} ${co.dir?'· '+co.dir:''}</div>
      <div class="crm-ai-co-actions">
        <button class="crm-ai-co-btn ${co.alreadyAdded?'added':'add'}" id="ai-add-${i}" onclick="crmAIAddProspect(${i})">
          ${co.alreadyAdded?'<i class="fa-solid fa-check"></i> Déjà dans CRM':'<i class="fa-solid fa-plus"></i> Ajouter au CRM'}
        </button>
      </div>
    </div>`).join('')}
  </div>`;
}

function crmAIAddProspect(idx) {
  const co = _crmAIResults[idx];
  if (!co || co.alreadyAdded) return;
  const db = crmLoad();
  const now = new Date().toISOString();
  db.prospects.push({
    id: crmID(),
    raisonSociale: co.n,
    ville: co.v, pays: 'Maroc',
    sector: co.s, ca: co.ca||'',
    dirigeant: co.dir||'', logisticien:'',
    tel:'', email:'', web:'',
    type: co.t==='both'?'both':(co.t||'export'),
    nbExp:'', budgetExport:'', budgetImport:'',
    destinations:[], modeAerien:false, modeMaritime:false, modeGroupage:false, modeExpress:false,
    stage:'prospect', remarques: co.desc||'',
    transitaireActuel:'', satisfactionActuel:'', renouvellement:'',
    visites:[], createdAt:now, updatedAt:now
  });
  crmSave(db);
  _crmAIResults[idx].alreadyAdded = true;
  const btn = document.getElementById('ai-add-'+idx);
  if (btn) { btn.className='crm-ai-co-btn added'; btn.innerHTML='<i class="fa-solid fa-check"></i> Ajouté'; }
  crmRefreshStats();
  crmToast(`${co.n} ajouté dans votre CRM ✓`,'success');
}

function crmAIImportAll() {
  const toImport = _crmAIResults.filter(c=>!c.alreadyAdded);
  toImport.forEach((_,i) => {
    const realIdx = _crmAIResults.findIndex(c=>c===toImport[i]);
    if (realIdx>=0) crmAIAddProspect(realIdx);
  });
  crmToast(`${toImport.length} société(s) importée(s) ✓`,'success');
}

/* ════════════════════════════════
   MODAL HELPERS
   ════════════════════════════════ */
function crmOpenModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('active'); m.scrollTop=0; }
}
function crmCloseModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}

/* ════════════════════════════════
   TOAST
   ════════════════════════════════ */
function crmToast(msg, type='success') {
  const t = document.getElementById('crm-toast');
  if (!t) return;
  t.className = 'crm-toast show ' + type;
  t.innerHTML = `<i class="fa-solid ${type==='success'?'fa-check-circle':'fa-triangle-exclamation'}"></i> ${msg}`;
  clearTimeout(_crmAITimer);
  _crmAITimer = setTimeout(()=>{ t.classList.remove('show'); }, 3000);
}

/* ════════════════════════════════
   AUTO-INIT
   ════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // crmInit() is called by ecShowModule('crm') in espace-client.js
});
