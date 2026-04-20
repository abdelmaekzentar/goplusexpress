/* ═══════════════════════════════════════════════════════
   GO PLUS EXPRESS — Simulators Engine
   ═══════════════════════════════════════════════════════ */

/* ── helpers ── */
const fmt = (n, cur='MAD') => n.toLocaleString('fr-MA',{minimumFractionDigits:2,maximumFractionDigits:2}) + ' ' + cur;
const fmtUSD = n => n.toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:0}) + ' USD';
const fmtEUR = n => n.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}) + ' EUR';

function el(id){ return document.getElementById(id); }
function setTxt(id,val){ const e=el(id); if(e) e.textContent=val; }

/* ════════════════════════════════
   1. CUSTOMS DUTY SIMULATOR
   ════════════════════════════════ */
function calcCustoms(){
  const cif    = parseFloat(el('cifValue')?.value)||0;
  const qty    = parseFloat(el('qtyValue')?.value)||1;
  const diPct  = parseFloat(el('diRate')?.value)||0;
  const vatPct = parseFloat(el('vatRate')?.value)||20;
  const ticPu  = parseFloat(el('ticRate')?.value)||0;
  const fdsPct = parseFloat(el('fdsRate')?.value)||0;
  const paraPct= parseFloat(el('paraRate')?.value)||0;

  const di     = cif * diPct / 100;
  const tic    = ticPu * qty;
  const fds    = cif * fdsPct / 100;
  const para   = cif * paraPct / 100;
  const vatBase= cif + di + tic + fds + para;
  const vat    = vatBase * vatPct / 100;
  const total  = di + tic + fds + para + vat;
  const grand  = cif + total;

  setTxt('r_cif',     fmt(cif));
  setTxt('r_di',      fmt(di));
  setTxt('r_tic',     fmt(tic));
  setTxt('r_fds',     fmt(fds));
  setTxt('r_para',    fmt(para));
  setTxt('r_vat_base',fmt(vatBase));
  setTxt('r_vat',     fmt(vat));
  setTxt('r_total',   fmt(total));
  setTxt('r_grand',   fmt(grand));
}

/* initial call */
document.addEventListener('DOMContentLoaded', ()=>{ calcCustoms(); calcExpress(); calcMaritime(); calcRoad(); });

/* ════════════════════════════════
   2. EXPRESS SIMULATOR
   ════════════════════════════════ */
let currentCarrier = 'dhl';

function selectCarrier(c){
  currentCarrier = c;
  ['dhl','fedex','aramex'].forEach(x=>{
    el('cb-'+x)?.classList.toggle('active', x===c);
  });
  const logo = el('carrierLogo');
  if(logo) logo.innerHTML = `<img src="assets/logos/${c}.png" alt="${c.toUpperCase()}" style="height:36px;object-fit:contain">`;
  calcExpress();
}

/* Zone matrices  (origin → dest → zone 1-6) */
const ZONE_MATRIX = {
  MA:{ MA:1, FR:2, ES:2, DE:3, GB:3, BE:3, IT:3, CH:3, US:5, CN:6, AE:4, PL:4 },
  FR:{ FR:1, MA:2, ES:1, DE:1, GB:1, IT:1, US:4, CN:5, AE:4, PL:2 },
  ES:{ ES:1, MA:2, FR:1, DE:2, GB:2, IT:2, US:4, CN:5, AE:4, PL:3 },
  DE:{ DE:1, FR:1, ES:2, MA:3, GB:1, IT:1, US:4, CN:5, AE:4, PL:1 },
  CN:{ CN:1, MA:6, FR:5, ES:5, DE:5, US:3, AE:3, GB:5, PL:5 },
  US:{ US:1, MA:5, FR:4, ES:4, DE:4, CN:3, AE:4, GB:2, PL:4 },
  AE:{ AE:1, MA:4, FR:4, ES:4, DE:4, CN:3, US:4, GB:4, PL:4 },
  GB:{ GB:1, MA:3, FR:1, ES:2, DE:1, CN:5, US:2, AE:4, PL:2 },
};

/* Base rates per zone (kg=0.5 doc / 1kg parcel) — indicative EUR */
const CARRIER_RATES = {
  dhl:{
    doc:  [0, 18, 22, 28, 38, 55, 72],  // zones 1-6
    parcel:[0, 20, 28, 38, 52, 75, 100],
    perKg: [0,  3,  4,  5,  7, 10, 14],
    fuel: 0.22, // 22%
    minW: 0.5,
    volDiv: 5000,
  },
  fedex:{
    doc:  [0, 19, 24, 30, 40, 58, 76],
    parcel:[0, 22, 30, 42, 56, 80, 106],
    perKg: [0,3.2, 4.2, 5.5, 7.5, 11, 15],
    fuel: 0.20,
    minW: 0.5,
    volDiv: 5000,
  },
  aramex:{
    doc:  [0, 16, 20, 26, 36, 52, 68],
    parcel:[0, 18, 26, 36, 50, 72, 96],
    perKg: [0,2.8, 3.8, 5.0, 7.0, 9.5, 13],
    fuel: 0.18,
    minW: 0.5,
    volDiv: 5000,
  }
};

function calcExpress(){
  const type    = el('shipType')?.value || 'parcel';
  const service = el('serviceType')?.value || 'express';
  const orig    = el('originCountry')?.value || 'MA';
  const dest    = el('destCountry')?.value || 'FR';
  const realW   = parseFloat(el('weightKg')?.value)||1;
  const L       = parseFloat(el('dimL')?.value)||30;
  const W       = parseFloat(el('dimW')?.value)||20;
  const H       = parseFloat(el('dimH')?.value)||15;

  const rates   = CARRIER_RATES[currentCarrier];
  const zoneMatrix = ZONE_MATRIX[orig] || ZONE_MATRIX['MA'];
  const zone    = zoneMatrix[dest] || 4;
  const volW    = (L * W * H) / rates.volDiv;
  const taxW    = Math.max(realW, volW, rates.minW);

  const baseDoc    = rates.doc[zone]    || 0;
  const baseParcel = rates.parcel[zone] || 0;
  const perKg      = rates.perKg[zone]  || 0;

  let base;
  if(type === 'doc'){
    base = baseDoc + (taxW > 0.5 ? (taxW - 0.5) * perKg : 0);
  } else {
    base = baseParcel + Math.max(0, taxW - 1) * perKg;
  }

  // economy discount
  if(service === 'economy') base *= 0.75;

  const fuel  = base * rates.fuel;
  const total = base + fuel;

  setTxt('e_real',  realW.toFixed(1) + ' kg');
  setTxt('e_vol',   volW.toFixed(2) + ' kg');
  setTxt('e_tax',   taxW.toFixed(2) + ' kg');
  setTxt('e_zone',  'Zone ' + zone);
  setTxt('e_base',  fmtEUR(base));
  setTxt('e_fuel',  fmtEUR(fuel));
  setTxt('e_total', fmtEUR(total));
}

/* ════════════════════════════════
   3. MARITIME FCL SIMULATOR
   ════════════════════════════════ */

/* Ocean freight base rates (USD) per container type + route */
const OCEAN_RATES = {
  /* polGroup → podGroup → {20dc,40dc,40hc,20rf,40rf} */
  EU_MED: { MACAS:{dc20:850,dc40:1400,hc40:1500,rf20:2200,rf40:3200}, MATAN:{dc20:800,dc40:1300,hc40:1400,rf20:2100,rf40:3100}, MAAGA:{dc20:950,dc40:1550,hc40:1650,rf20:2400,rf40:3400}, MANAD:{dc20:820,dc40:1350,hc40:1450,rf20:2150,rf40:3150} },
  EU_NW:  { MACAS:{dc20:1100,dc40:1800,hc40:1950,rf20:2800,rf40:4000}, MATAN:{dc20:1050,dc40:1700,hc40:1850,rf20:2700,rf40:3900}, MAAGA:{dc20:1200,dc40:1950,hc40:2100,rf20:3000,rf40:4300}, MANAD:{dc20:1080,dc40:1750,hc40:1900,rf20:2750,rf40:3950} },
  ASIA:   { MACAS:{dc20:2200,dc40:3500,hc40:3800,rf20:5500,rf40:7500}, MATAN:{dc20:2100,dc40:3400,hc40:3700,rf20:5400,rf40:7400}, MAAGA:{dc20:2400,dc40:3800,hc40:4100,rf20:5900,rf40:8000}, MANAD:{dc20:2200,dc40:3500,hc40:3800,rf20:5500,rf40:7500} },
  AMER:   { MACAS:{dc20:1800,dc40:2900,hc40:3100,rf20:4500,rf40:6200}, MATAN:{dc20:1750,dc40:2800,hc40:3000,rf20:4400,rf40:6100}, MAAGA:{dc20:1950,dc40:3100,hc40:3300,rf20:4700,rf40:6500}, MANAD:{dc20:1800,dc40:2900,hc40:3100,rf20:4500,rf40:6200} },
  GULF:   { MACAS:{dc20:1400,dc40:2200,hc40:2400,rf20:3500,rf40:4800}, MATAN:{dc20:1350,dc40:2100,hc40:2300,rf20:3400,rf40:4700}, MAAGA:{dc20:1500,dc40:2400,hc40:2600,rf20:3700,rf40:5100}, MANAD:{dc20:1400,dc40:2200,hc40:2400,rf20:3500,rf40:4800} },
};

const POL_GROUP = {
  ESVLC:'EU_MED', ESBCN:'EU_MED', FRMRS:'EU_MED', ITGOA:'EU_MED',
  NLRTM:'EU_NW', DEHAM:'EU_NW', GBFXT:'EU_NW',
  CNSHA:'ASIA', CNNGB:'ASIA', CNSZX:'ASIA',
  USNYK:'AMER', USNYC:'AMER',
  AEJEA:'GULF',
};

const TRANSIT_DAYS = {
  EU_MED:{MACAS:'5-8 jours',MATAN:'4-7 jours',MAAGA:'7-10 jours',MANAD:'6-9 jours'},
  EU_NW: {MACAS:'7-12 jours',MATAN:'6-10 jours',MAAGA:'9-14 jours',MANAD:'8-12 jours'},
  ASIA:  {MACAS:'25-35 jours',MATAN:'24-33 jours',MAAGA:'28-38 jours',MANAD:'26-36 jours'},
  AMER:  {MACAS:'18-25 jours',MATAN:'17-24 jours',MAAGA:'20-28 jours',MANAD:'19-26 jours'},
  GULF:  {MACAS:'12-18 jours',MATAN:'11-16 jours',MAAGA:'14-20 jours',MANAD:'13-18 jours'},
};

const THC = { MACAS:250, MATAN:230, MAAGA:270, MANAD:240 };
const THC_POL = { EU_MED:180, EU_NW:200, ASIA:120, AMER:210, GULF:140 };
const BAF_PCT = 0.15; // 15% of ocean
const DOC_FEE = 150;
const HAZ_SURCHARGE = 350;
const OOG_SURCHARGE = 500;

const CTR_KEY = { '20dc':'dc20', '40dc':'dc40', '40hc':'hc40', '20rf':'rf20', '40rf':'rf40' };

function calcMaritime(){
  const pol   = el('polPort')?.value || 'ESVLC';
  const pod   = el('podPort')?.value || 'MACAS';
  const ctr   = el('ctrType')?.value || '20dc';
  const cargoV= parseFloat(el('cargoValue')?.value)||50000;
  const inco  = el('incoterm')?.value || 'FOB';
  const ctype = el('cargoType')?.value || 'general';

  const group    = POL_GROUP[pol] || 'EU_MED';
  const rateGroup= OCEAN_RATES[group]?.[pod] || OCEAN_RATES['EU_MED']['MACAS'];
  const cKey     = CTR_KEY[ctr] || 'dc20';
  let ocean      = rateGroup[cKey] || 1000;

  // surcharges
  if(ctype === 'haz') ocean += HAZ_SURCHARGE;
  if(ctype === 'oog') ocean += OOG_SURCHARGE;

  // incoterm adjustments
  if(inco === 'CIF') ocean *= 0.85; // already partially covered
  if(inco === 'EXW') ocean *= 1.12; // includes pre-carriage

  const baf        = ocean * BAF_PCT;
  const thcPol     = THC_POL[group] || 180;
  const thcPod     = THC[pod] || 250;
  const insurance  = cargoV * 0.003;
  const total      = ocean + baf + thcPol + thcPod + DOC_FEE + insurance;
  const transit    = TRANSIT_DAYS[group]?.[pod] || '15-25 jours';

  setTxt('m_ocean',    fmtUSD(ocean));
  setTxt('m_baf',      fmtUSD(baf));
  setTxt('m_thc_pol',  fmtUSD(thcPol));
  setTxt('m_thc_pod',  fmtUSD(thcPod));
  setTxt('m_doc',      fmtUSD(DOC_FEE));
  setTxt('m_insurance',fmtUSD(insurance));
  setTxt('m_total',    fmtUSD(total));
  setTxt('m_transit',  transit);
}

/* ════════════════════════════════
   4. ROAD GROUPAGE SIMULATOR
   ════════════════════════════════ */

/* Base rate per m3 (EUR) and per kg for groupage, by origin country */
const ROAD_RATES_CBM = { ES:145, FR:165, BE:185, DE:185, IT:195, PT:155, CH:210, PL:220 };
const ROAD_RATES_KG  = { ES:2.3, FR:2.6, BE:2.9, DE:2.9, IT:3.1, PT:2.5, CH:3.4, PL:3.5 };
const FTL_RATES      = { ES:2800, FR:3200, BE:3600, DE:3600, IT:3800, PT:3000, CH:4200, PL:4500 };
const DEST_SURCHARGE = { CAS:0, RAB:80, TAN:120, FES:160, MAR:200, AGA:300, OUJ:220, LAY:800 };
const TRANSIT_ROAD   = {
  ES:{ CAS:'3-4j', RAB:'3-4j', TAN:'2-3j', FES:'4-5j', MAR:'5-6j', AGA:'6-7j', OUJ:'5-6j', LAY:'10-12j' },
  FR:{ CAS:'5-6j', RAB:'5-6j', TAN:'4-5j', FES:'6-7j', MAR:'7-8j', AGA:'8-9j', OUJ:'7-8j', LAY:'12-14j' },
  BE:{ CAS:'6-7j', RAB:'6-7j', TAN:'5-6j', FES:'7-8j', MAR:'8-9j', AGA:'9-10j',OUJ:'8-9j', LAY:'13-15j' },
  DE:{ CAS:'6-8j', RAB:'6-8j', TAN:'5-7j', FES:'7-9j', MAR:'8-10j',AGA:'9-11j',OUJ:'8-10j',LAY:'13-16j' },
  IT:{ CAS:'7-8j', RAB:'7-8j', TAN:'6-7j', FES:'8-9j', MAR:'9-10j',AGA:'10-11j',OUJ:'9-10j',LAY:'14-16j'},
  PT:{ CAS:'4-5j', RAB:'4-5j', TAN:'3-4j', FES:'5-6j', MAR:'6-7j', AGA:'7-8j', OUJ:'6-7j', LAY:'11-13j' },
  CH:{ CAS:'8-9j', RAB:'8-9j', TAN:'7-8j', FES:'9-10j',MAR:'10-11j',AGA:'11-12j',OUJ:'10-11j',LAY:'15-17j'},
  PL:{ CAS:'9-11j',RAB:'9-11j',TAN:'8-10j',FES:'10-12j',MAR:'11-13j',AGA:'12-14j',OUJ:'11-13j',LAY:'16-18j'},
};
const GOODS_SURCHARGE = { general:0, food:200, haz:400, fragile:150 };
const FUEL_SURCHARGE_RATE = 0.14;

function calcRoad(){
  const origin   = el('roadOrigin')?.value || 'ES';
  const dest     = el('roadDest')?.value || 'CAS';
  const rtype    = el('roadType')?.value || 'groupage';
  const cbm      = parseFloat(el('roadCbm')?.value)||5;
  const weight   = parseFloat(el('roadWeight')?.value)||2000;
  const goods    = el('roadGoods')?.value || 'general';

  let base;
  if(rtype === 'ftl'){
    base = FTL_RATES[origin] || 3200;
  } else {
    const rateCbm = ROAD_RATES_CBM[origin] || 165;
    const rateKg  = ROAD_RATES_KG[origin]  || 2.6;
    // weight equiv: 1m3 = 333kg for road
    const weightEquivCbm = weight / 333;
    const taxCbm = Math.max(cbm, weightEquivCbm);
    base = taxCbm * rateCbm;
    // minimum floor from kg rate
    const kgBase = weight * rateKg / 10;
    base = Math.max(base, kgBase);
  }

  const destSurch  = DEST_SURCHARGE[dest] || 0;
  const goodsSurch = GOODS_SURCHARGE[goods] || 0;
  const customsMA  = 200;
  const tir        = 50;
  const subtotal   = base + destSurch + goodsSurch;
  const fuel       = subtotal * FUEL_SURCHARGE_RATE;
  const total      = subtotal + fuel + customsMA + tir;
  const transit    = TRANSIT_ROAD[origin]?.[dest] || '5-8j';

  setTxt('rd_base',    fmtEUR(base + destSurch + goodsSurch));
  setTxt('rd_customs', fmtEUR(customsMA));
  setTxt('rd_fuel',    fmtEUR(fuel));
  setTxt('rd_tir',     fmtEUR(tir));
  setTxt('rd_total',   fmtEUR(total));
  setTxt('rd_transit', transit);
}

/* ════════════════════════════════
   5. TAB SWITCHER
   ════════════════════════════════ */
function showSim(name){
  document.querySelectorAll('.sim-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sim-tab').forEach(t => t.classList.remove('active'));
  const panel = el('sim-' + name);
  const tab   = el('tab-' + name);
  if (panel) panel.classList.add('active');
  if (tab)   tab.classList.add('active');
  if(name==='express')  calcExpress();
  if(name==='maritime') calcMaritime();
  if(name==='road')     calcRoad();
  if(name==='packing')  calcPacking();
  if(name==='export')   calcExport();
}

function scrollToSim(tabId){
  document.getElementById('simulators')?.scrollIntoView({behavior:'smooth'});
  setTimeout(()=>{ el(tabId)?.click(); }, 600);
}

/* ════════════════════════════════
   6. PRINT / DOWNLOAD QUOTE
   ════════════════════════════════ */
function printQuote(type){
  const date = new Date().toLocaleDateString('fr-MA');
  let content = '';

  if(type==='customs'){
    content = `
      <h2>GO PLUS EXPRESS — Estimation Droits de Douane</h2>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Code SH:</strong> ${el('hsCode')?.textContent || '—'}</p>
      <p><strong>Description:</strong> ${el('hsDesc')?.textContent || '—'}</p>
      <p><strong>Valeur CIF:</strong> ${el('r_cif')?.textContent}</p>
      <p><strong>Droit d'Importation:</strong> ${el('r_di')?.textContent}</p>
      <p><strong>TIC:</strong> ${el('r_tic')?.textContent}</p>
      <p><strong>FDS:</strong> ${el('r_fds')?.textContent}</p>
      <p><strong>Parafiscale:</strong> ${el('r_para')?.textContent}</p>
      <p><strong>TVA:</strong> ${el('r_vat')?.textContent}</p>
      <p><strong>TOTAL TAXES:</strong> ${el('r_total')?.textContent}</p>
      <p><strong>COÛT TOTAL IMPORT:</strong> ${el('r_grand')?.textContent}</p>
    `;
  } else if(type==='express'){
    content = `
      <h2>GO PLUS EXPRESS — Estimation Express</h2>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Transporteur:</strong> ${currentCarrier.toUpperCase()}</p>
      <p><strong>Poids réel:</strong> ${el('e_real')?.textContent}</p>
      <p><strong>Zone:</strong> ${el('e_zone')?.textContent}</p>
      <p><strong>Tarif de base:</strong> ${el('e_base')?.textContent}</p>
      <p><strong>Surcharge:</strong> ${el('e_fuel')?.textContent}</p>
      <p><strong>TOTAL:</strong> ${el('e_total')?.textContent}</p>
    `;
  } else if(type==='maritime'){
    content = `
      <h2>GO PLUS EXPRESS — Estimation Maritime FCL</h2>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Fret Océan:</strong> ${el('m_ocean')?.textContent}</p>
      <p><strong>BAF:</strong> ${el('m_baf')?.textContent}</p>
      <p><strong>THC POD:</strong> ${el('m_thc_pod')?.textContent}</p>
      <p><strong>Assurance:</strong> ${el('m_insurance')?.textContent}</p>
      <p><strong>TOTAL:</strong> ${el('m_total')?.textContent}</p>
      <p><strong>Transit:</strong> ${el('m_transit')?.textContent}</p>
    `;
  } else if(type==='road'){
    content = `
      <h2>GO PLUS EXPRESS — Estimation Routier</h2>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Tarif de base:</strong> ${el('rd_base')?.textContent}</p>
      <p><strong>Douane Maroc:</strong> ${el('rd_customs')?.textContent}</p>
      <p><strong>Surcharge carburant:</strong> ${el('rd_fuel')?.textContent}</p>
      <p><strong>TOTAL:</strong> ${el('rd_total')?.textContent}</p>
      <p><strong>Transit:</strong> ${el('rd_transit')?.textContent}</p>
    `;
  } else if(type==='export'){
    content = `
      <h2>GO PLUS EXPRESS — Estimation Export Express</h2>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Transporteur:</strong> ${currentExportCarrier.toUpperCase()}</p>
      <p><strong>Poids réel:</strong> ${el('ex_real')?.textContent}</p>
      <p><strong>Poids volumétrique:</strong> ${el('ex_vol')?.textContent}</p>
      <p><strong>Poids taxable:</strong> ${el('ex_tax')?.textContent}</p>
      <p><strong>Zone:</strong> ${el('ex_zone')?.textContent}</p>
      <p><strong>Tarif de base:</strong> ${el('ex_base')?.textContent}</p>
      <p><strong>Surcharge carburant:</strong> ${el('ex_fuel')?.textContent}</p>
      <p><strong>Assurance:</strong> ${el('ex_insur')?.textContent}</p>
      <p><strong>TOTAL:</strong> ${el('ex_total')?.textContent}</p>
      <p><strong>Délai:</strong> ${el('ex_transit')?.textContent}</p>
    `;
  } else if(type==='packing'){
    content = `
      <h2>GO PLUS EXPRESS — Récapitulatif Chargement</h2>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Nombre d'articles:</strong> ${el('pk_items')?.textContent}</p>
      <p><strong>Volume total:</strong> ${el('pk_vol')?.textContent}</p>
      <p><strong>Poids total:</strong> ${el('pk_weight')?.textContent}</p>
      <p><strong>Palettes nécessaires:</strong> ${el('pk_pallets')?.textContent}</p>
      <p><strong>Unités de transport:</strong> ${el('pk_units')?.textContent}</p>
      <p><strong>Taux de remplissage:</strong> ${el('pk_fill')?.textContent}</p>
      <p><strong>Recommandation:</strong> ${el('pk_reco')?.textContent}</p>
    `;
  }

  const win = window.open('','_blank','width=600,height=700');
  win.document.write(`
    <html><head><title>GO PLUS EXPRESS — Devis</title>
    <style>body{font-family:Inter,sans-serif;padding:40px;max-width:600px;margin:0 auto}
    h2{color:#00A99D;border-bottom:2px solid #00A99D;padding-bottom:12px;margin-bottom:24px}
    p{margin:10px 0;font-size:14px}strong{min-width:200px;display:inline-block}
    .footer{margin-top:40px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#888}
    </style></head><body>
    <img src="../assets/logo.png" style="height:50px;margin-bottom:20px"/>
    ${content}
    <div class="footer">
      <p>GO PLUS EXPRESS — Casablanca, Maroc</p>
      <p>contact@goplusexpress.ma | +212 5XX XXX XXX</p>
      <p><em>Estimation indicative. Ce devis n'a pas de valeur contractuelle.</em></p>
    </div>
    <script>window.print();<\/script>
    </body></html>`);
  win.document.close();
}

/* ── Contact form ── */
function sendQuote(e){
  e.preventDefault();
  showToast('Demande envoyée ! Nous vous répondrons sous 24h.', 'success');
  e.target.reset();
  return false;
}

/* ════════════════════════════════
   6. PACKING / LOADING CALCULATOR
   ════════════════════════════════ */

// Vehicle / container inner dimensions [L(m), W(m), H(m), maxPayload(kg)]
const VEHICLE_DIMS = {
  semi:  [13.6,  2.4,  2.7,  24000],
  mega:  [13.6,  2.4,  3.0,  24000],
  fourgon: [4.2, 1.8,  2.0,   3500],
  porteur: [7.5, 2.4,  2.7,  12000],
  '20dc':  [5.9, 2.35, 2.39, 28000],
  '40dc':  [12.0,2.35, 2.39, 27000],
  '40hc':  [12.0,2.35, 2.70, 26500],
  '45hc':  [13.6,2.35, 2.70, 27000],
};

// Pallet base dimensions [L(m), W(m)]
const PALLET_BASE = {
  eu:  [1.2, 0.8],
  us:  [1.2, 1.0],
  iso: [1.1, 1.1],
};

function getPalletLines() {
  return Array.from(document.querySelectorAll('.packing-line')).map(row => {
    const qty    = parseInt(row.querySelector('.pl-qty')?.value)  || 1;
    const l      = parseFloat(row.querySelector('.pl-l')?.value)  || 0;
    const w      = parseFloat(row.querySelector('.pl-w')?.value)  || 0;
    const h      = parseFloat(row.querySelector('.pl-h')?.value)  || 0;
    const weight = parseFloat(row.querySelector('.pl-weight')?.value) || 0;
    return { qty, l, w, h, weight };
  }).filter(r => r.l > 0 && r.w > 0 && r.h > 0);
}

function addPackingLine() {
  const container = document.getElementById('packingLines');
  if (!container) return;
  const idx = container.querySelectorAll('.packing-line').length;
  const div = document.createElement('div');
  div.className = 'packing-line';
  div.dataset.idx = idx;
  div.innerHTML = `
    <input type="text"   class="pl-desc"   placeholder="Description" style="flex:2"/>
    <input type="number" class="pl-qty"    placeholder="Qté" min="1" value="1" style="width:60px"/>
    <input type="number" class="pl-l"      placeholder="L(cm)" min="1" value="60" style="width:72px"/>
    <input type="number" class="pl-w"      placeholder="l(cm)" min="1" value="40" style="width:72px"/>
    <input type="number" class="pl-h"      placeholder="H(cm)" min="1" value="40" style="width:72px"/>
    <input type="number" class="pl-weight" placeholder="kg/u"  min="0.1" step="0.1" value="20" style="width:72px"/>`;
  container.appendChild(div);
}

function removePackingLine() {
  const container = document.getElementById('packingLines');
  if (!container) return;
  const lines = container.querySelectorAll('.packing-line');
  if (lines.length > 1) container.removeChild(lines[lines.length - 1]);
}

function calcPacking() {
  const lines       = getPalletLines();
  if (!lines.length) return;

  const palletType  = el('palletType')?.value || 'eu';
  const palletMaxH  = (parseFloat(el('palletMaxH')?.value) || 220) / 100; // m
  const vehicleKey  = el('vehicleType')?.value || 'semi';
  const fillTarget  = (parseFloat(el('fillTarget')?.value) || 85) / 100;

  const [pL, pW]    = PALLET_BASE[palletType] || PALLET_BASE.eu;
  const [vL, vW, vH, vPayload] = VEHICLE_DIMS[vehicleKey] || VEHICLE_DIMS.semi;

  // ── Totals ──────────────────────────────────────────────────
  let totalItems  = 0;
  let totalVolM3  = 0;
  let totalWeightKg = 0;

  for (const line of lines) {
    const lM = line.l / 100;
    const wM = line.w / 100;
    const hM = line.h / 100;
    totalItems    += line.qty;
    totalVolM3    += lM * wM * hM * line.qty;
    totalWeightKg += line.weight * line.qty;
  }

  // ── Pallets needed ───────────────────────────────────────────
  // Simple approximation: each item needs floor area, stack if possible
  let palletCount = 0;
  for (const line of lines) {
    const lM = line.l / 100;
    const wM = line.w / 100;
    const hM = line.h / 100;
    // items fitting on one pallet footprint (considering rotation)
    const fitL = Math.max(1, Math.floor(pL / lM));
    const fitW = Math.max(1, Math.floor(pW / wM));
    const fitFloor = fitL * fitW;
    // layers fitting vertically
    const layers   = Math.max(1, Math.floor(palletMaxH / hM));
    const fitPallet = fitFloor * layers;
    palletCount += Math.ceil(line.qty / fitPallet);
  }

  // ── Vehicles / containers ────────────────────────────────────
  // Approach: compare by volume and by weight
  const vehicleVolM3  = vL * vW * vH;
  const usableVol     = vehicleVolM3 * fillTarget;
  const unitsByVol    = Math.ceil(totalVolM3 / usableVol);
  const unitsByWeight = Math.ceil(totalWeightKg / vPayload);
  const unitsNeeded   = Math.max(unitsByVol, unitsByWeight);
  const fillRate      = Math.min(100, (totalVolM3 / (unitsNeeded * vehicleVolM3)) * 100);
  const avgPalletW    = palletCount > 0 ? totalWeightKg / palletCount : 0;

  // ── Labels ──────────────────────────────────────────────────
  const vehicleLabel = {
    semi: 'Semi-remorque(s)', mega: 'Mega-trailer(s)',
    fourgon: 'Fourgon(s)', porteur: 'Porteur(s)',
    '20dc': 'Conteneur(s) 20\' DC', '40dc': 'Conteneur(s) 40\' DC',
    '40hc': 'Conteneur(s) 40\' HC', '45hc': 'Conteneur(s) 45\' HC',
  }[vehicleKey] || 'Unité(s)';

  // ── Recommendations ─────────────────────────────────────────
  let reco = '';
  if (fillRate < 60) {
    reco = `⚠️ Taux de remplissage faible (${fillRate.toFixed(0)}%). Envisagez un véhicule plus petit ou un groupage.`;
  } else if (fillRate > 95) {
    reco = `✅ Chargement optimal (${fillRate.toFixed(0)}%). Pensez à prévoir une marge pour l'arrimage.`;
  } else {
    reco = `✅ Chargement correct (${fillRate.toFixed(0)}%). Prévoir calage et sangles d'arrimage.`;
  }
  if (totalWeightKg > vPayload * unitsNeeded * 0.95) {
    reco += ` ⚠️ Attention au poids — proche de la limite de charge (${vPayload.toLocaleString()} kg).`;
  }

  // ── Display ──────────────────────────────────────────────────
  setTxt('pk_items',    totalItems.toLocaleString('fr-MA'));
  setTxt('pk_vol',      totalVolM3.toFixed(2) + ' m³');
  setTxt('pk_weight',   totalWeightKg.toLocaleString('fr-MA') + ' kg');
  setTxt('pk_pallets',  palletCount + ' palette(s)');
  setTxt('pk_units',    unitsNeeded + ' ' + vehicleLabel);
  setTxt('pk_fill',     fillRate.toFixed(1) + '%');
  setTxt('pk_pallet_w', avgPalletW.toFixed(0) + ' kg / palette');

  const recoEl = el('pk_reco');
  if (recoEl) recoEl.textContent = reco;
}

/* ════════════════════════════════
   7. EXPORT EXPRESS SIMULATOR
   Same zone logic as import but origin = MA (Casablanca)
   Rates in MAD (user will replace with contracted grid)
   ════════════════════════════════ */

let currentExportCarrier = 'dhl';

function selectExportCarrier(c) {
  currentExportCarrier = c;
  ['dhl','fedex','aramex'].forEach(x => {
    const btn = el('ecb-' + x);
    if (btn) btn.classList.toggle('active', x === c);
  });
  const logo = el('exportCarrierLogo');
  if (logo) logo.innerHTML = `<img src="assets/logos/${c}.png" alt="${c.toUpperCase()}" style="height:36px;object-fit:contain">`;
  calcExport();
}

// Export rates from MA — MAD per kg per zone (indicative)
const EXPORT_RATES_MAD = {
  dhl: {
    doc:    { base: 120, perKg: 45, fuel: 0.22 },
    parcel: { base: 180, perKg: 60, fuel: 0.22 },
  },
  fedex: {
    doc:    { base: 115, perKg: 42, fuel: 0.20 },
    parcel: { base: 175, perKg: 58, fuel: 0.20 },
  },
  aramex: {
    doc:    { base: 100, perKg: 38, fuel: 0.18 },
    parcel: { base: 160, perKg: 55, fuel: 0.18 },
  },
};

// Zone multipliers by destination
const EXPORT_ZONE = {
  ES:1, PT:1, FR:2, BE:2, IT:2, CH:2, DE:2, GB:3,
  US:4, CA:4, BR:5, CN:5, AE:3, SA:3, TR:3,
  SN:2, CI:2, NG:3, EG:2,
};
const EXPORT_ZONE_MULT = [0, 1.0, 1.15, 1.3, 1.5, 1.75, 2.0];
const EXPORT_TRANSIT = {
  ES:'J+1/2', PT:'J+1/2', FR:'J+2/3', BE:'J+2/3', IT:'J+2/3',
  CH:'J+3', DE:'J+2/3', GB:'J+3', US:'J+3/4', CA:'J+3/4',
  BR:'J+5', CN:'J+4/5', AE:'J+2/3', SA:'J+2/3', TR:'J+3',
  SN:'J+3', CI:'J+3', NG:'J+4', EG:'J+3',
};
const EXPORT_INSURANCE_RATE = 0.005; // 0.5% of declared value

function calcExport() {
  const c    = currentExportCarrier;
  const type = el('exp2ShipType')?.value || 'doc';
  const dest = el('exp2Dest')?.value || 'FR';
  const realW = parseFloat(el('exp2Weight')?.value) || 1;
  const L = parseFloat(el('exp2L')?.value) || 1;
  const W = parseFloat(el('exp2W')?.value) || 1;
  const H = parseFloat(el('exp2H')?.value) || 1;
  const declaredVal = parseFloat(el('exp2Value')?.value) || 0;

  const volW = (L * W * H) / 5000;
  const taxW = Math.max(realW, volW);

  const rates = EXPORT_RATES_MAD[c]?.[type] || EXPORT_RATES_MAD.dhl.doc;
  const zoneNum = EXPORT_ZONE[dest] || 3;
  const mult = EXPORT_ZONE_MULT[zoneNum] || 1;

  const base = (rates.base + rates.perKg * taxW) * mult;
  const fuel = base * rates.fuel;
  const insur = declaredVal * EXPORT_INSURANCE_RATE;
  const total = base + fuel + insur;
  const transit = EXPORT_TRANSIT[dest] || 'J+3/5';

  setTxt('ex_real',    realW.toFixed(1) + ' kg');
  setTxt('ex_vol',     volW.toFixed(2) + ' kg');
  setTxt('ex_tax',     taxW.toFixed(2) + ' kg');
  setTxt('ex_zone',    'Zone ' + zoneNum);
  setTxt('ex_base',    fmt(base));
  setTxt('ex_fuel',    fmt(fuel));
  setTxt('ex_insur',   insur > 0 ? fmt(insur) : '—');
  setTxt('ex_total',   fmt(total));
  setTxt('ex_transit', transit);
}

// showSim handles all tabs — defined earlier in this file.
