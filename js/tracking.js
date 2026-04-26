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

// ── AWB prefix → airline lookup table ────────────────────────
// Source : IATA prefix registry (official)
const AWB_PREFIXES = {
  '001': { name:'American Airlines Cargo', url: n => `https://www.aa.com/cargo/tracking?awb=${n}` },
  '006': { name:'Japan Airlines Cargo',    url: n => `https://www.jal.co.jp/en/jc/tracking/?awbNumber=${n}` },
  '014': { name:'Air Canada Cargo',        url: n => `https://www.aircanadacargo.com/en/tracking?awb=${n}` },
  '020': { name:'Lufthansa Cargo',         url: n => `https://lufthansa-cargo.com/tracking#${n}` },
  '023': { name:'Finnair Cargo',           url: n => `https://cargo.finnair.com/en/tracking?awb=${n}` },
  '043': { name:'Iberia Cargo',            url: n => `https://iberia.com/cargoes/track?awb=${n}` },
  '057': { name:'Air France Cargo',        url: n => `https://www.airfrancecargo.com/tracking/${n}` },
  '074': { name:'Delta Cargo',             url: n => `https://www.deltacargo.com/Cargo/home/trackShipment?trackingNumber=${n}` },
  '086': { name:'Korean Air Cargo',        url: n => `https://www.koreanair.com/kr/en/cargo/tracking?awb=${n}` },
  '098': { name:'Emirates SkyCargo',       url: n => `https://cargo.emirates.com/tracking/#!/awb/${n}` },
  '116': { name:'Saudia Cargo',            url: n => `https://saudicargo.com/en/tracking?awbNumber=${n}` },
  '118': { name:'Asiana Cargo',            url: n => `https://flyasiana.com/C/en/cargo/tracking?awb=${n}` },
  '125': { name:'British Airways Cargo',   url: n => `https://cargo.ba.com/en-gb/tracking#?awb=${n}` },
  '157': { name:'Aeroflot Cargo',          url: n => `https://track-trace.com/aircargo/${n}` },
  '172': { name:'RAM Cargo (Royal Air Maroc)', url: n => `https://www.royalairmaroc.com/ma-fr/Informations/Cargo?awb=${n}` },
  '176': { name:'Qatar Airways Cargo',     url: n => `https://www.qrcargo.com/s/track?awb=${n}` },
  '180': { name:'Cathay Cargo',            url: n => `https://www.cathaypacificcargo.com/manage-booking/track-your-shipment.html?awb=${n}` },
  '235': { name:'Turkish Cargo',           url: n => { const [pfx, num] = n.split('-'); return `https://www.turkishcargo.com/en/cargo-tracking?awbPrefix=${pfx}&awbNumber=${num}`; } },
  '260': { name:'Singapore Airlines Cargo',url: n => `https://www.singaporeair.com/en_UK/us/cargo/cargo-tracking/?awb=${n}` },
  '297': { name:'Air Arabia Cargo',        url: n => `https://cargo.airarabia.com/en/tracking?awb=${n}` },
  '434': { name:'Cargolux',               url: n => `https://www.cargolux.com/Cargo-Services/Tracking/?AWB=${n}` },
  '507': { name:'Air Algérie Fret',        url: n => `https://track-trace.com/aircargo/${n}` },
  '604': { name:'Flydubai Cargo',          url: n => `https://www.flydubai.com/en/cargo/tracking?awb=${n}` },
  '607': { name:'Etihad Cargo',            url: n => `https://etihadcargo.com/en/track-shipment?awb=${n}` },
  '620': { name:'Royal Jordanian Cargo',   url: n => `https://track-trace.com/aircargo/${n}` },
  '724': { name:'FedEx Cargo',             url: n => `https://www.fedex.com/fedextrack/?trknbr=${n}` },
  '775': { name:'Cargolux Italia',         url: n => `https://www.cargolux.com/Cargo-Services/Tracking/?AWB=${n}` },
};

function getAWBCarrier(awbNum) {
  const prefix = awbNum.replace(/[^0-9-]/g,'').split('-')[0];
  return AWB_PREFIXES[prefix] || null;
}

// ── Card HTML pour AWB / BL — SANS données fictives ──────────
function buildAWBCard(awbNum, airline, officialUrl, containerId) {
  const trackTraceUrl = `https://www.track-trace.com/aircargo/${awbNum}`;
  const multiUrl      = `https://www.track-trace.com/aircargo`;

  return `
    <div class="track-card">
      <div class="track-awb-header">
        <div class="track-awb-icon"><i class="fa-solid fa-plane-departure"></i></div>
        <div>
          <div class="track-awb-num">AWB — ${awbNum}</div>
          <div class="track-awb-carrier">${airline}</div>
        </div>
        <div class="track-awb-status-badge"><i class="fa-solid fa-satellite-dish"></i> Temps réel requis</div>
      </div>
      <div class="track-awb-info">
        <i class="fa-solid fa-circle-info"></i>
        Le suivi AWB en temps réel nécessite de consulter directement le système du transporteur.
        Les données affichées ici seraient des estimations non fiables — nous vous redirigeons vers la source officielle.
      </div>
      <div class="track-awb-btns">
        <a href="${officialUrl}" target="_blank" rel="noopener" class="track-awb-btn track-awb-btn-primary">
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
          Tracking officiel ${airline}
        </a>
        <a href="${trackTraceUrl}" target="_blank" rel="noopener" class="track-awb-btn track-awb-btn-secondary">
          <i class="fa-solid fa-globe"></i>
          TrackTrace AWB
        </a>
      </div>
      <p class="track-disclaimer">Données en temps réel fournies par ${airline} · Consultez le site officiel du transporteur pour un suivi précis.</p>
    </div>`;
}

function buildBLCard(blNum) {
  const url = `https://www.track-trace.com/bill-of-lading/${blNum}`;
  return `
    <div class="track-card">
      <div class="track-awb-header">
        <div class="track-awb-icon"><i class="fa-solid fa-ship"></i></div>
        <div>
          <div class="track-awb-num">BL — ${blNum}</div>
          <div class="track-awb-carrier">Connaissement maritime</div>
        </div>
      </div>
      <div class="track-awb-info">
        <i class="fa-solid fa-circle-info"></i>
        Le suivi BL en temps réel est assuré par TrackTrace, Port de Casablanca et Tanger Med.
      </div>
      <div class="track-awb-btns">
        <a href="${url}" target="_blank" rel="noopener" class="track-awb-btn track-awb-btn-primary">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> TrackTrace BL
        </a>
        <a href="https://portnet.ma/" target="_blank" rel="noopener" class="track-awb-btn track-awb-btn-secondary">
          <i class="fa-solid fa-anchor"></i> PortNet Maroc
        </a>
      </div>
      <p class="track-disclaimer">Consultez le site officiel de l'armateur ou TrackTrace pour les informations en temps réel.</p>
    </div>`;
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

  // AWB : détecter la compagnie via le préfixe et rediriger
  if (detected.carrier === 'awb') {
    const airline = getAWBCarrier(num);
    const name    = airline ? airline.name : 'Compagnie aérienne';
    const url     = airline ? airline.url(num) : `https://www.track-trace.com/aircargo/${num}`;
    setTrackResult(buildAWBCard(num, name, url, 'trackResult'));
    return;
  }

  // BL : rediriger vers TrackTrace + PortNet
  if (detected.carrier === 'bl') {
    setTrackResult(buildBLCard(num));
    return;
  }

  // Express (DHL / FedEx / Aramex) : deep-link uniquement
  const linkUrl = CARRIER_LINKS[detected.carrier] ? CARRIER_LINKS[detected.carrier](num) : null;
  if (linkUrl) {
    setTrackResult(`
      <div class="track-card">
        <div class="track-awb-header">
          <div class="track-awb-icon"><i class="fa-solid fa-box"></i></div>
          <div>
            <div class="track-awb-num">${num}</div>
            <div class="track-awb-carrier">${detected.label}</div>
          </div>
        </div>
        <div class="track-awb-info">
          <i class="fa-solid fa-circle-info"></i>
          Tracking en temps réel via le site officiel ${detected.label}.
        </div>
        <div class="track-awb-btns">
          <a href="${linkUrl}" target="_blank" rel="noopener" class="track-awb-btn track-awb-btn-primary">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Tracker sur ${detected.label}
          </a>
        </div>
        <p class="track-disclaimer">Données en temps réel fournies par ${detected.label}.</p>
      </div>`);
  } else {
    setTrackResult(trackingError('Numéro non reconnu ou transporteur non supporté.'));
  }
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
  const sel    = document.getElementById('trackCarrierAWB');
  const input  = document.getElementById('trackNumberAWB');
  const result = document.getElementById('trackResultAWB');
  if (!input || !result) return;
  const num = input.value.trim();
  if (!num) { input.focus(); return; }
  const carrier = sel ? sel.value : 'awb';

  let html = '';
  if (carrier === 'awb') {
    const airline = getAWBCarrier(num);
    const name    = airline ? airline.name : 'Compagnie aérienne';
    const url     = airline ? airline.url(num) : `https://www.track-trace.com/aircargo/${num}`;
    html = buildAWBCard(num, name, url, 'trackResultAWB');
  } else if (carrier === 'bl') {
    html = buildBLCard(num);
  } else {
    // Express (DHL, FedEx, Aramex)
    const linkUrl = CARRIER_LINKS[carrier] ? CARRIER_LINKS[carrier](num) : `https://www.track-trace.com/aircargo/${num}`;
    html = `
      <div class="track-card">
        <div class="track-awb-header">
          <div class="track-awb-icon"><i class="fa-solid fa-box"></i></div>
          <div>
            <div class="track-awb-num">${num}</div>
            <div class="track-awb-carrier">${carrier.toUpperCase()}</div>
          </div>
        </div>
        <div class="track-awb-btns">
          <a href="${linkUrl}" target="_blank" rel="noopener" class="track-awb-btn track-awb-btn-primary">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Tracker sur ${carrier.toUpperCase()}
          </a>
        </div>
      </div>`;
  }

  result.innerHTML = html;
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
