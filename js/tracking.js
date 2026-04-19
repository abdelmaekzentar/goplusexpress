/* ============================================================
   GO PLUS EXPRESS — tracking.js
   Multi-carrier tracking: DHL, FedEx, Aramex, IATA AWB, BL
   Real-time flight info via AviationStack (free tier)
   ============================================================ */

// ── Carrier Detection ─────────────────────────────────────────
const CARRIER_PATTERNS = [
  { carrier: 'dhl',    label: 'DHL Express',    re: /^[0-9]{10,11}$/ },
  { carrier: 'fedex',  label: 'FedEx',          re: /^[0-9]{12}$|^[0-9]{15}$|^[0-9]{20}$|^96[0-9]{18}$/ },
  { carrier: 'aramex', label: 'Aramex',         re: /^[0-9]{9,11}$/ },
  { carrier: 'awb',    label: 'IATA AWB',       re: /^[0-9]{3}-[0-9]{8}$/ },
  { carrier: 'bl',     label: 'Bill of Lading', re: /^[A-Z]{3,4}[A-Z0-9]{6,12}$/i },
  { carrier: 'flight', label: 'Vol / Flight',   re: /^[A-Z]{2}[0-9]{3,4}$/i },
];

function detectCarrier(num) {
  const n = num.trim().toUpperCase();
  for (const p of CARRIER_PATTERNS) {
    if (p.re.test(n)) return p;
  }
  return null;
}

// ── Tracking UI helpers ───────────────────────────────────────
function setTrackResult(html) {
  const el = document.getElementById('trackResult');
  if (el) {
    el.innerHTML = html;
    el.classList.remove('hidden');
  }
}

function trackingCard(title, steps, extra = '') {
  const stepsHtml = steps.map((s, i) => `
    <div class="track-step ${s.done ? 'done' : ''} ${i === steps.findLastIndex(x => x.done) ? 'active' : ''}">
      <div class="track-dot"></div>
      <div class="track-info">
        <span class="track-label">${s.label}</span>
        <span class="track-time">${s.time || ''}</span>
        <span class="track-loc">${s.location || ''}</span>
      </div>
    </div>`).join('');
  return `
    <div class="track-card">
      <h4 class="track-title"><i class="fa-solid fa-location-dot"></i> ${title}</h4>
      <div class="track-timeline">${stepsHtml}</div>
      ${extra}
      <p class="track-disclaimer">${t('trackDisclaimer')}</p>
    </div>`;
}

function trackingError(msg) {
  return `<div class="track-card track-error">
    <i class="fa-solid fa-triangle-exclamation"></i>
    <p>${msg}</p>
  </div>`;
}

function trackingLoading() {
  return `<div class="track-card track-loading">
    <div class="spinner"></div>
    <p>${t('trackSearching') || 'Recherche en cours…'}</p>
  </div>`;
}

// ── Carrier deep-link URLs ────────────────────────────────────
const CARRIER_LINKS = {
  dhl:    n => `https://www.dhl.com/ma-fr/home/tracking/tracking-express.html?submit=1&tracking-id=${n}`,
  fedex:  n => `https://www.fedex.com/fedextrack/?trknbr=${n}`,
  aramex: n => `https://www.aramex.com/ma/fr/track/results?ShipmentNumber=${n}`,
  awb:    n => `https://www.iata.org/en/programs/cargo/e/eawb/`,
  bl:     n => `https://www.track-trace.com/bill-of-lading/${n}`,
};

// ── Simulate local events (demo data while no backend) ───────
function buildDemoEvents(carrier, num) {
  const now = new Date();
  const fmt = d => d.toLocaleString('fr-MA', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
  const sub = h => { const d = new Date(now); d.setHours(d.getHours() - h); return fmt(d); };

  const demos = {
    dhl: [
      { label: 'Livraison effectuée', time: sub(0),  location: 'Casablanca, MA', done: true },
      { label: 'En cours de livraison', time: sub(4), location: 'Casablanca Hub, MA', done: true },
      { label: 'Dédouanement terminé', time: sub(20), location: 'Mohammed V, CASA', done: true },
      { label: 'Arrivée au pays de destination', time: sub(24), location: 'Casablanca, MA', done: true },
      { label: 'Départ origine', time: sub(48), location: 'Paris CDG, FR', done: true },
      { label: 'Pris en charge', time: sub(50), location: 'Paris, FR', done: true },
    ],
    fedex: [
      { label: 'Delivered', time: sub(0),  location: 'Casablanca 20000, MA', done: true },
      { label: 'On FedEx vehicle for delivery', time: sub(5), location: 'Casablanca, MA', done: true },
      { label: 'Clearance in progress', time: sub(18), location: 'CASA Airport, MA', done: true },
      { label: 'Arrived at destination facility', time: sub(22), location: 'Casablanca, MA', done: true },
      { label: 'Departed facility', time: sub(46), location: 'Lyon, FR', done: true },
      { label: 'Picked up', time: sub(50), location: 'Lyon, FR', done: true },
    ],
    aramex: [
      { label: 'Livré', time: sub(0),  location: 'Casablanca, MA', done: true },
      { label: 'En livraison', time: sub(3), location: 'Casablanca, MA', done: true },
      { label: 'En douane', time: sub(16), location: 'Casablanca CASA, MA', done: true },
      { label: 'Arrivée Maroc', time: sub(20), location: 'Casablanca, MA', done: true },
      { label: 'En transit Dubaï', time: sub(38), location: 'Dubaï, AE', done: true },
      { label: 'Collecte confirmée', time: sub(50), location: 'Origine', done: true },
    ],
    awb: [
      { label: 'Marchandise livrée', time: sub(0),  location: 'CASA Fret', done: true },
      { label: 'Arrivée vol AF553', time: sub(18), location: 'CMN — Casablanca', done: true },
      { label: 'Départ CDG', time: sub(22), location: 'Paris CDG', done: true },
      { label: 'AWB émis', time: sub(50), location: 'Paris, FR', done: true },
    ],
    bl: [
      { label: 'Navire arrivé à quai', time: sub(0),  location: 'Tanger Med, MA', done: true },
      { label: 'En mer Méditerranée', time: sub(72), location: 'En route', done: true },
      { label: 'Départ Algésiras', time: sub(100), location: 'Algésiras, ES', done: true },
      { label: 'Chargement navire', time: sub(168), location: 'Algésiras, ES', done: true },
      { label: 'BL émis', time: sub(200), location: "Port d'origine", done: true },
    ],
  };
  return demos[carrier] || demos.dhl;
}

// ── Open carrier website for real tracking ───────────────────
function openCarrierLink(carrier, num) {
  const url = CARRIER_LINKS[carrier];
  if (url) window.open(url(num), '_blank', 'noopener');
}

// ── Flight tracking (AviationStack free API) ──────────────────
async function trackFlightByNum(flightNum) {
  setTrackResult(trackingLoading());
  const num = flightNum.trim().toUpperCase();
  // AviationStack free tier (limited) — user must supply their own API key
  // Replace 'YOUR_KEY' with a real key from aviationstack.com (free plan: 100 req/mo)
  const API_KEY = 'YOUR_KEY';
  const iataCode = num.replace(/\s/g, '');

  if (API_KEY === 'YOUR_KEY') {
    // Fallback: use FlightAware public search
    setTrackResult(`
      <div class="track-card">
        <h4 class="track-title"><i class="fa-solid fa-plane-up"></i> Vol ${num}</h4>
        <p style="margin-bottom:1rem">Suivez ce vol en temps réel sur FlightAware :</p>
        <a href="https://www.flightaware.com/live/flight/${iataCode}" target="_blank" rel="noopener"
           class="btn btn-primary" style="display:inline-flex;gap:.5rem;align-items:center">
          <i class="fa-solid fa-external-link-alt"></i> Voir sur FlightAware
        </a>
        <br><br>
        <a href="https://flightradar24.com/${iataCode}" target="_blank" rel="noopener"
           class="btn" style="display:inline-flex;gap:.5rem;align-items:center;background:#f47920;color:#fff">
          <i class="fa-solid fa-radar"></i> Voir sur FlightRadar24
        </a>
        <p class="track-disclaimer" style="margin-top:1rem">${t('trackDisclaimer')}</p>
      </div>`);
    return;
  }

  try {
    const resp = await fetch(
      `https://api.aviationstack.com/v1/flights?access_key=${API_KEY}&flight_iata=${iataCode}&limit=1`
    );
    const data = await resp.json();
    if (!data.data || data.data.length === 0) {
      setTrackResult(trackingError(t('trackNotFound') || 'Vol introuvable.'));
      return;
    }
    const f = data.data[0];
    const dep = f.departure;
    const arr = f.arrival;
    const status = (f.flight_status || '').toUpperCase();
    const statusLabel = {
      SCHEDULED: '⏳ Prévu',
      ACTIVE:    '✈️ En vol',
      LANDED:    '🛬 Atterri',
      CANCELLED: '❌ Annulé',
      DIVERTED:  '🔄 Dérouté',
    }[status] || status;

    const steps = [
      { label: `Départ: ${dep.airport} (${dep.iata})`, time: dep.actual || dep.estimated || dep.scheduled, location: dep.iata, done: !!dep.actual },
      { label: `En vol → ${arr.airport} (${arr.iata})`, time: '', location: '', done: status === 'ACTIVE' || status === 'LANDED' },
      { label: `Arrivée: ${arr.airport} (${arr.iata})`, time: arr.actual || arr.estimated || arr.scheduled, location: arr.iata, done: !!arr.actual },
    ];
    const extra = `<div class="track-flight-status"><span class="flight-badge">${statusLabel}</span></div>`;
    setTrackResult(trackingCard(`Vol ${f.flight.iata} — ${dep.iata} → ${arr.iata}`, steps, extra));
  } catch (err) {
    setTrackResult(trackingError('Erreur réseau. Veuillez réessayer.'));
  }
}

// ── Main doTrack() function called by HTML button ────────────
function doTrack() {
  const input = document.getElementById('trackNumber');
  if (!input) return;
  const num = input.value.trim();
  if (!num) { input.focus(); return; }

  // Use manually selected carrier if set, else auto-detect
  let detected = selectedCarrier ? { carrier: selectedCarrier, label: selectedCarrier.toUpperCase() } : detectCarrier(num);

  if (!detected) {
    setTrackResult(trackingError(
      t('trackUnknown') || `Numéro non reconnu. Formats acceptés :<br>
      <ul style="margin:.5rem 0 0 1.2rem;font-size:.85rem">
        <li>DHL Express : 10-11 chiffres</li>
        <li>FedEx : 12, 15 ou 20 chiffres</li>
        <li>Aramex : 9-11 chiffres</li>
        <li>IATA AWB : XXX-XXXXXXXX (ex: 057-12345678)</li>
        <li>Connaissement BL : ABCD1234567</li>
        <li>Vol : AT205, AF553…</li>
      </ul>`
    ));
    return;
  }

  // Flight tracking
  if (detected.carrier === 'flight') {
    trackFlight(num);
    return;
  }

  // Demo data + deep-link to real carrier
  const events = buildDemoEvents(detected.carrier, num);
  const linkUrl = CARRIER_LINKS[detected.carrier] ? CARRIER_LINKS[detected.carrier](num) : null;
  const linkBtn = linkUrl
    ? `<a href="${linkUrl}" target="_blank" rel="noopener" class="track-reallink">
        <i class="fa-solid fa-up-right-from-square"></i>
        ${t('trackVerify') || 'Vérifier sur le site officiel'} ${detected.label}
       </a>`
    : '';

  setTrackResult(trackingCard(
    `${detected.label} — ${num}`,
    events,
    linkBtn
  ));
}

// ── Flight tracking button in HTML calls trackFlight() ───────
function trackFlight() {
  const inp = document.getElementById('flightNum');
  const num = inp ? inp.value.trim() : '';
  if (num) trackFlightByNum(num);
}

// ── Tab switching ─────────────────────────────────────────────
function showTrackTab(name) {
  document.querySelectorAll('.track-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.track-panel').forEach(p => p.classList.remove('active'));
  const tab = document.getElementById('ttab-' + name);
  const panel = document.getElementById('tpanel-' + name);
  if (tab) tab.classList.add('active');
  if (panel) panel.classList.add('active');
}

// ── Carrier logo button selection ────────────────────────────
let selectedCarrier = null;
function setCarrier(c) {
  selectedCarrier = c;
  document.querySelectorAll('.carrier-logo-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('clogo-' + c);
  if (btn) btn.classList.add('active');
  const input = document.getElementById('trackNumber');
  if (input) input.focus();
}

// ── AWB / BL panel tracker ────────────────────────────────────
function doTrackAWB() {
  const sel = document.getElementById('trackCarrierAWB');
  const input = document.getElementById('trackNumberAWB');
  const result = document.getElementById('trackResultAWB');
  if (!input || !result) return;
  const num = input.value.trim();
  if (!num) { input.focus(); return; }
  const carrier = sel ? sel.value : 'awb';
  const events = buildDemoEvents(carrier, num);
  const linkUrl = CARRIER_LINKS[carrier] ? CARRIER_LINKS[carrier](num) : null;
  const linkBtn = linkUrl
    ? `<a href="${linkUrl}" target="_blank" rel="noopener" class="track-reallink">
        <i class="fa-solid fa-up-right-from-square"></i>
        ${t('trackVerify') || 'Vérifier sur le site officiel'}
       </a>`
    : '';
  result.innerHTML = `
    <div class="track-card">
      <h4 class="track-title"><i class="fa-solid fa-location-dot"></i> ${carrier.toUpperCase()} — ${num}</h4>
      <div class="track-timeline">
        ${events.map((s, i) => `
          <div class="track-step ${s.done ? 'done' : ''} ${i === events.findLastIndex(x => x.done) ? 'active' : ''}">
            <div class="track-dot"></div>
            <div class="track-info">
              <span class="track-label">${s.label}</span>
              <span class="track-time">${s.time || ''}</span>
              <span class="track-loc">${s.location || ''}</span>
            </div>
          </div>`).join('')}
      </div>
      ${linkBtn}
      <p class="track-disclaimer">${t('trackDisclaimer')}</p>
    </div>`;
  result.classList.remove('hidden');
}

// ── Enter key support ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('trackNumber');
  if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') doTrack(); });

  const awbInput = document.getElementById('trackNumberAWB');
  if (awbInput) awbInput.addEventListener('keydown', e => { if (e.key === 'Enter') doTrackAWB(); });

  const flInput = document.getElementById('flightNum');
  if (flInput) flInput.addEventListener('keydown', e => { if (e.key === 'Enter') trackFlight(); });
});
