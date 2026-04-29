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

/* ════════════════════════════════════════════════════════════
   CALCULATEUR FRET CARGO AÉRIEN
   Colis (poids volumétrique IATA ÷6000) ou Palette (poids réel)
   Tarifs multi-compagnies — lit les grilles admin si disponibles
   ════════════════════════════════════════════════════════════ */
let _fcalcType = 'box';   // 'box' | 'palette'
let _fcalcDir  = 'export'; // 'export' | 'import'

/* ── Compagnies ── */
const FCALC_AL = {
  AT:{ name:'Royal Air Maroc',     logo:'https://pics.avs.io/200/200/AT.png',  color:'#C8102E' },
  AF:{ name:'Air France Cargo',    logo:'https://pics.avs.io/200/200/AF.png',  color:'#002395' },
  EK:{ name:'Emirates SkyCargo',   logo:'https://pics.avs.io/200/200/EK.png',  color:'#B8860B' },
  SV:{ name:'Saudia Cargo',        logo:'https://pics.avs.io/200/200/SV.png',  color:'#006400' },
  TK:{ name:'Turkish Cargo',       logo:'https://pics.avs.io/200/200/TK.png',  color:'#E30A17' },
  DL:{ name:'Delta Air Lines',     logo:'https://pics.avs.io/200/200/DL.png',  color:'#003366' },
  AC:{ name:'Air Canada Cargo',    logo:'https://pics.avs.io/200/200/AC.png',  color:'#D62B1F' },
  LH:{ name:'Lufthansa Cargo',     logo:'https://pics.avs.io/200/200/LH.png',  color:'#05164D' },
  QR:{ name:'Qatar Airways Cargo', logo:'https://pics.avs.io/200/200/QR.png',  color:'#5C0632' },
  EY:{ name:'Etihad Cargo',        logo:'https://pics.avs.io/200/200/EY.png',  color:'#C8963C' },
  MS:{ name:'EgyptAir Cargo',      logo:'https://pics.avs.io/200/200/MS.png',  color:'#0D2C6E' },
  KL:{ name:'KLM Cargo',           logo:'https://pics.avs.io/200/200/KL.png',  color:'#009FDF' },
  IB:{ name:'Iberia Cargo',        logo:'https://pics.avs.io/200/200/IB.png',  color:'#D82027' },
  CX:{ name:'Cathay Cargo',        logo:'https://pics.avs.io/200/200/CX.png',  color:'#006564' },
};

/* ── Surcharge fuel (USD/kg, s'ajoute au taux de base) ── */
const FCALC_FUEL = {
  AT:0.55, AF:0.60, EK:0.65, SV:0.50, TK:0.50,
  DL:0.58, AC:0.56, LH:0.62, QR:0.58, EY:0.52,
  MS:0.45, KL:0.58, IB:0.48, CX:0.70
};

/* ── Transit (jours depuis CMN) ── */
const FCALC_TRANSIT = {
  CDG:1,LYS:2,MRS:2,MAD:1,BCN:1,FRA:2,MUC:2,LHR:2,AMS:2,LGG:2,BRU:2,FCO:2,MXP:2,LIS:1,IST:1,
  DXB:2,AUH:2,SHJ:2,DOH:2,RUH:2,JED:2,
  PVG:3,PEK:3,HKG:3,SIN:3,BOM:3,DEL:3,
  JFK:3,LAX:3,MIA:3,YUL:4,
  CAI:2,ABJ:3,LOS:3,
};

/* ── Taux de change USD → MAD (paramétrable en admin) ── */
const FCALC_USD_MAD_DEFAULT = 10;

/* ── Royal Air Maroc — tarifs d'ACHAT officiels (MAD/kg) — Grille Ex Maroc (Prepaid) ──
   Tranches : N (<45 kg) | +45 | +100 | +250 | +500 | +1000   MIN = minimum de facturation MAD ── */
const AT_COST_MAD = {
  CDG:{ MIN:850, N:17, '+45':15, '+100':13, '+250':12, '+500':12, '+1000':5  },
  LYS:{ MIN:850, N:17, '+45':16, '+100':14, '+250':13, '+500':13, '+1000':12 },
  MRS:{ MIN:850, N:17, '+45':16, '+100':14, '+250':13, '+500':13, '+1000':12 },
  MAD:{ MIN:850, N:14, '+45':13, '+100':11, '+250':9,  '+500':9,  '+1000':5  },
  BCN:{ MIN:850, N:14, '+45':13, '+100':11, '+250':9,  '+500':9,  '+1000':9  },
  FRA:{ MIN:850, N:20, '+45':18, '+100':17, '+250':13, '+500':12, '+1000':6  },
  MUC:{ MIN:850, N:20, '+45':18, '+100':17, '+250':13, '+500':12, '+1000':6  },
  LHR:{ MIN:850, N:20, '+45':19, '+100':18, '+250':15, '+500':14, '+1000':10 },
  AMS:{ MIN:850, N:20, '+45':18, '+100':17, '+250':14, '+500':13, '+1000':12 },
  LGG:{ MIN:850, N:20, '+45':18, '+100':17, '+250':14, '+500':13, '+1000':12 },
  BRU:{ MIN:850, N:20, '+45':18, '+100':17, '+250':13, '+500':12, '+1000':5  },
  FCO:{ MIN:850, N:17, '+45':17, '+100':16, '+250':15, '+500':15, '+1000':15 },
  MXP:{ MIN:850, N:17, '+45':17, '+100':16, '+250':15, '+500':15, '+1000':15 },
  LIS:{ MIN:850, N:14, '+45':13, '+100':11, '+250':9,  '+500':9,  '+1000':9  },
  IST:{ MIN:850, N:14, '+45':14, '+100':13, '+250':12, '+500':11, '+1000':10 },
  DXB:{ MIN:935, N:18, '+45':17, '+100':15, '+250':10, '+500':9,  '+1000':8  },
  AUH:{ MIN:935, N:18, '+45':17, '+100':15, '+250':10, '+500':9,  '+1000':8  },
  SHJ:{ MIN:935, N:18, '+45':17, '+100':15, '+250':10, '+500':9,  '+1000':8  },
  DOH:{ MIN:850, N:15, '+45':13, '+100':12, '+250':11, '+500':10, '+1000':9  },
  RUH:{ MIN:850, N:15, '+45':13, '+100':12, '+250':11, '+500':10, '+1000':9  },
  JED:{ MIN:850, N:15, '+45':13, '+100':12, '+250':11, '+500':10, '+1000':9  },
  PEK:{ MIN:900, N:27, '+45':23, '+100':18, '+250':18, '+500':17, '+1000':16 },
  PVG:{ MIN:900, N:27, '+45':23, '+100':18, '+250':18, '+500':17, '+1000':16 },
  JFK:{ MIN:900, N:27, '+45':23, '+100':18, '+250':18, '+500':17, '+1000':16 },
  LAX:{ MIN:900, N:27, '+45':23, '+100':18, '+250':18, '+500':17, '+1000':16 },
  MIA:{ MIN:900, N:27, '+45':23, '+100':18, '+250':18, '+500':17, '+1000':16 },
  YUL:{ MIN:900, N:27, '+45':23, '+100':17, '+250':16, '+500':15, '+1000':14 },
  CAI:{ MIN:850, N:15, '+45':13, '+100':10, '+250':8,  '+500':8,  '+1000':7  },
  ABJ:{ MIN:900, N:25, '+45':21, '+100':20, '+250':19, '+500':18, '+1000':16 },
  LOS:{ MIN:900, N:25, '+45':21, '+100':20, '+250':19, '+500':18, '+1000':16 },
};

/* ── Lire le taux USD→MAD depuis l'admin (ou valeur par défaut) ── */
function fcalcGetExchangeRate() {
  try { return parseFloat(JSON.parse(localStorage.getItem('gpe_cargo') || '{}').usdToMad) || FCALC_USD_MAD_DEFAULT; }
  catch(e) { return FCALC_USD_MAD_DEFAULT; }
}

/* ── Lire la marge commerciale par compagnie (défaut 30%) ── */
function fcalcGetMargin(code) {
  try {
    const v = JSON.parse(localStorage.getItem('gpe_cargo') || '{}').margins?.[code];
    return (v !== undefined && v !== null && v !== '') ? parseFloat(v) : 30;
  } catch(e) { return 30; }
}

/* ── Grilles tarifaires partenaires (USD/kg) — prix d'ACHAT — par dest / airline / tranche IATA
   AT (RAM) est géré séparément via AT_COST_MAD (tarifs officiels en MAD)               ── */
const FCALC_RATES = {
  /* ── FRANCE ── */
  CDG:{AF:{N:4.80,'+45':4.20,'+100':3.50,'+250':2.95,'+500':2.70,'+1000':2.50},TK:{N:4.60,'+45':4.00,'+100':3.35,'+250':2.85,'+500':2.60,'+1000':2.40},LH:{N:5.00,'+45':4.35,'+100':3.65,'+250':3.10,'+500':2.85,'+1000':2.60},EK:{N:5.50,'+45':4.80,'+100':4.10,'+250':3.50,'+500':3.20,'+1000':2.95},KL:{N:4.90,'+45':4.30,'+100':3.60,'+250':3.05,'+500':2.80,'+1000':2.55},IB:{N:4.70,'+45':4.10,'+100':3.45,'+250':2.90,'+500':2.65,'+1000':2.45},DL:{N:4.90,'+45':4.25,'+100':3.55,'+250':3.00,'+500':2.75,'+1000':2.55}},
  LYS:{AF:{N:5.00,'+45':4.35,'+100':3.65,'+250':3.10,'+500':2.85,'+1000':2.60},TK:{N:4.80,'+45':4.15,'+100':3.50,'+250':2.95,'+500':2.70,'+1000':2.50}},
  MRS:{AF:{N:4.90,'+45':4.25,'+100':3.55,'+250':3.00,'+500':2.75,'+1000':2.55},TK:{N:4.70,'+45':4.10,'+100':3.45,'+250':2.90,'+500':2.65,'+1000':2.45}},
  /* ── ESPAGNE ── */
  MAD:{IB:{N:3.80,'+45':3.30,'+100':2.75,'+250':2.35,'+500':2.10,'+1000':1.95},TK:{N:4.00,'+45':3.50,'+100':2.90,'+250':2.50,'+500':2.25,'+1000':2.05},LH:{N:4.30,'+45':3.75,'+100':3.15,'+250':2.65,'+500':2.40,'+1000':2.20}},
  BCN:{IB:{N:3.90,'+45':3.40,'+100':2.85,'+250':2.40,'+500':2.15,'+1000':2.00},TK:{N:4.10,'+45':3.55,'+100':2.95,'+250':2.50,'+500':2.25,'+1000':2.10}},
  /* ── ALLEMAGNE ── */
  FRA:{LH:{N:4.60,'+45':4.00,'+100':3.35,'+250':2.85,'+500':2.60,'+1000':2.40},TK:{N:4.80,'+45':4.15,'+100':3.50,'+250':2.95,'+500':2.70,'+1000':2.50},AF:{N:5.20,'+45':4.50,'+100':3.80,'+250':3.20,'+500':2.95,'+1000':2.70},EK:{N:5.80,'+45':5.05,'+100':4.25,'+250':3.65,'+500':3.35,'+1000':3.05}},
  MUC:{LH:{N:4.70,'+45':4.10,'+100':3.45,'+250':2.95,'+500':2.70,'+1000':2.50},TK:{N:4.90,'+45':4.25,'+100':3.60,'+250':3.05,'+500':2.80,'+1000':2.55}},
  /* ── ROYAUME-UNI ── */
  LHR:{LH:{N:5.20,'+45':4.55,'+100':3.80,'+250':3.25,'+500':2.95,'+1000':2.70},TK:{N:5.00,'+45':4.35,'+100':3.65,'+250':3.10,'+500':2.85,'+1000':2.60},EK:{N:6.00,'+45':5.25,'+100':4.40,'+250':3.80,'+500':3.50,'+1000':3.20},KL:{N:5.40,'+45':4.70,'+100':3.95,'+250':3.35,'+500':3.05,'+1000':2.80},AF:{N:5.30,'+45':4.60,'+100':3.85,'+250':3.30,'+500':3.00,'+1000':2.75}},
  /* ── BENELUX ── */
  AMS:{KL:{N:4.50,'+45':3.90,'+100':3.30,'+250':2.80,'+500':2.55,'+1000':2.35},TK:{N:4.80,'+45':4.15,'+100':3.50,'+250':2.95,'+500':2.70,'+1000':2.50},LH:{N:5.00,'+45':4.35,'+100':3.65,'+250':3.10,'+500':2.85,'+1000':2.60},DL:{N:5.10,'+45':4.45,'+100':3.75,'+250':3.20,'+500':2.90,'+1000':2.65}},
  LGG:{TK:{N:4.90,'+45':4.25,'+100':3.60,'+250':3.05,'+500':2.80,'+1000':2.55},LH:{N:5.10,'+45':4.45,'+100':3.75,'+250':3.20,'+500':2.90,'+1000':2.65}},
  BRU:{TK:{N:4.80,'+45':4.15,'+100':3.50,'+250':2.95,'+500':2.70,'+1000':2.50},LH:{N:5.10,'+45':4.45,'+100':3.75,'+250':3.20,'+500':2.90,'+1000':2.65},AF:{N:5.00,'+45':4.35,'+100':3.65,'+250':3.10,'+500':2.85,'+1000':2.60}},
  /* ── ITALIE ── */
  FCO:{TK:{N:4.60,'+45':4.00,'+100':3.35,'+250':2.85,'+500':2.60,'+1000':2.40},LH:{N:4.80,'+45':4.20,'+100':3.55,'+250':3.00,'+500':2.75,'+1000':2.55},AF:{N:5.10,'+45':4.45,'+100':3.75,'+250':3.20,'+500':2.90,'+1000':2.65}},
  MXP:{TK:{N:4.70,'+45':4.10,'+100':3.45,'+250':2.90,'+500':2.65,'+1000':2.45},LH:{N:4.90,'+45':4.25,'+100':3.60,'+250':3.05,'+500':2.80,'+1000':2.55}},
  /* ── PORTUGAL / TURQUIE ── */
  LIS:{IB:{N:3.90,'+45':3.40,'+100':2.85,'+250':2.40,'+500':2.15,'+1000':2.00},TK:{N:4.10,'+45':3.55,'+100':2.95,'+250':2.50,'+500':2.25,'+1000':2.10}},
  IST:{TK:{N:2.80,'+45':2.45,'+100':2.05,'+250':1.75,'+500':1.60,'+1000':1.45},LH:{N:3.60,'+45':3.15,'+100':2.65,'+250':2.25,'+500':2.05,'+1000':1.90}},
  /* ── EAU ── */
  DXB:{EK:{N:4.50,'+45':3.90,'+100':3.30,'+250':2.80,'+500':2.55,'+1000':2.35},QR:{N:5.00,'+45':4.35,'+100':3.65,'+250':3.10,'+500':2.85,'+1000':2.60},EY:{N:4.80,'+45':4.15,'+100':3.50,'+250':2.95,'+500':2.70,'+1000':2.50},TK:{N:5.20,'+45':4.50,'+100':3.80,'+250':3.20,'+500':2.95,'+1000':2.70},LH:{N:5.60,'+45':4.90,'+100':4.10,'+250':3.50,'+500':3.20,'+1000':2.95}},
  AUH:{EY:{N:4.70,'+45':4.10,'+100':3.45,'+250':2.90,'+500':2.65,'+1000':2.45},EK:{N:4.80,'+45':4.20,'+100':3.55,'+250':3.00,'+500':2.75,'+1000':2.55},QR:{N:5.10,'+45':4.45,'+100':3.75,'+250':3.20,'+500':2.90,'+1000':2.65}},
  SHJ:{EK:{N:4.60,'+45':4.00,'+100':3.35,'+250':2.85,'+500':2.60,'+1000':2.40},TK:{N:5.30,'+45':4.60,'+100':3.85,'+250':3.30,'+500':3.00,'+1000':2.75}},
  /* ── MOYEN-ORIENT ── */
  DOH:{QR:{N:4.20,'+45':3.65,'+100':3.05,'+250':2.60,'+500':2.35,'+1000':2.15},EK:{N:5.20,'+45':4.50,'+100':3.80,'+250':3.25,'+500':2.95,'+1000':2.70},TK:{N:5.00,'+45':4.35,'+100':3.65,'+250':3.10,'+500':2.85,'+1000':2.60}},
  RUH:{SV:{N:5.20,'+45':4.50,'+100':3.80,'+250':3.20,'+500':2.95,'+1000':2.70},EK:{N:5.60,'+45':4.85,'+100':4.10,'+250':3.50,'+500':3.20,'+1000':2.95},QR:{N:5.40,'+45':4.70,'+100':3.95,'+250':3.35,'+500':3.05,'+1000':2.80}},
  JED:{SV:{N:5.00,'+45':4.35,'+100':3.65,'+250':3.10,'+500':2.85,'+1000':2.60},EK:{N:5.40,'+45':4.70,'+100':3.95,'+250':3.35,'+500':3.05,'+1000':2.80},QR:{N:5.20,'+45':4.50,'+100':3.80,'+250':3.25,'+500':2.95,'+1000':2.70},TK:{N:5.60,'+45':4.90,'+100':4.10,'+250':3.50,'+500':3.20,'+1000':2.95}},
  /* ── ASIE ── */
  PVG:{EK:{N:8.50,'+45':7.40,'+100':6.20,'+250':5.30,'+500':4.85,'+1000':4.45},QR:{N:8.20,'+45':7.15,'+100':6.00,'+250':5.10,'+500':4.65,'+1000':4.25},TK:{N:8.80,'+45':7.65,'+100':6.45,'+250':5.50,'+500':5.00,'+1000':4.60},LH:{N:9.00,'+45':7.85,'+100':6.60,'+250':5.60,'+500':5.10,'+1000':4.70},AF:{N:9.20,'+45':8.00,'+100':6.75,'+250':5.75,'+500':5.25,'+1000':4.80}},
  PEK:{EK:{N:8.80,'+45':7.65,'+100':6.45,'+250':5.50,'+500':5.00,'+1000':4.60},QR:{N:8.50,'+45':7.40,'+100':6.20,'+250':5.30,'+500':4.85,'+1000':4.45},TK:{N:9.00,'+45':7.85,'+100':6.60,'+250':5.60,'+500':5.10,'+1000':4.70},LH:{N:9.20,'+45':8.00,'+100':6.75,'+250':5.75,'+500':5.25,'+1000':4.80}},
  HKG:{EK:{N:8.20,'+45':7.15,'+100':6.00,'+250':5.10,'+500':4.65,'+1000':4.25},CX:{N:8.00,'+45':6.95,'+100':5.85,'+250':4.95,'+500':4.55,'+1000':4.15},QR:{N:8.00,'+45':6.95,'+100':5.85,'+250':4.95,'+500':4.55,'+1000':4.15},TK:{N:8.50,'+45':7.40,'+100':6.20,'+250':5.30,'+500':4.85,'+1000':4.45},LH:{N:8.80,'+45':7.65,'+100':6.45,'+250':5.50,'+500':5.00,'+1000':4.60}},
  SIN:{EK:{N:8.50,'+45':7.40,'+100':6.20,'+250':5.30,'+500':4.85,'+1000':4.45},QR:{N:8.20,'+45':7.15,'+100':6.00,'+250':5.10,'+500':4.65,'+1000':4.25},TK:{N:8.80,'+45':7.65,'+100':6.45,'+250':5.50,'+500':5.00,'+1000':4.60},CX:{N:8.30,'+45':7.25,'+100':6.10,'+250':5.20,'+500':4.75,'+1000':4.35},LH:{N:9.00,'+45':7.85,'+100':6.60,'+250':5.60,'+500':5.10,'+1000':4.70}},
  BOM:{EK:{N:7.20,'+45':6.25,'+100':5.25,'+250':4.50,'+500':4.10,'+1000':3.75},QR:{N:7.00,'+45':6.10,'+100':5.10,'+250':4.35,'+500':3.95,'+1000':3.65},EY:{N:6.80,'+45':5.90,'+100':4.95,'+250':4.20,'+500':3.85,'+1000':3.55},TK:{N:7.40,'+45':6.45,'+100':5.40,'+250':4.60,'+500':4.20,'+1000':3.85}},
  DEL:{EK:{N:7.40,'+45':6.45,'+100':5.40,'+250':4.60,'+500':4.20,'+1000':3.85},QR:{N:7.20,'+45':6.25,'+100':5.25,'+250':4.50,'+500':4.10,'+1000':3.75},TK:{N:7.60,'+45':6.60,'+100':5.55,'+250':4.75,'+500':4.35,'+1000':4.00},EY:{N:7.00,'+45':6.10,'+100':5.10,'+250':4.35,'+500':3.95,'+1000':3.65}},
  /* ── AMÉRIQUES ── */
  JFK:{AF:{N:9.80,'+45':8.55,'+100':7.20,'+250':6.10,'+500':5.55,'+1000':5.15},LH:{N:10.00,'+45':8.70,'+100':7.35,'+250':6.25,'+500':5.70,'+1000':5.25},EK:{N:10.20,'+45':8.90,'+100':7.50,'+250':6.40,'+500':5.80,'+1000':5.35},QR:{N:10.00,'+45':8.70,'+100':7.35,'+250':6.25,'+500':5.70,'+1000':5.25},DL:{N:9.50,'+45':8.30,'+100':7.00,'+250':5.95,'+500':5.40,'+1000':5.00}},
  LAX:{EK:{N:11.00,'+45':9.60,'+100':8.05,'+250':6.85,'+500':6.25,'+1000':5.75},QR:{N:10.80,'+45':9.40,'+100':7.90,'+250':6.75,'+500':6.15,'+1000':5.65},LH:{N:11.20,'+45':9.75,'+100':8.20,'+250':6.97,'+500':6.35,'+1000':5.85},DL:{N:10.80,'+45':9.40,'+100':7.90,'+250':6.75,'+500':6.15,'+1000':5.65}},
  MIA:{AF:{N:10.50,'+45':9.15,'+100':7.70,'+250':6.55,'+500':5.95,'+1000':5.50},LH:{N:10.80,'+45':9.40,'+100':7.90,'+250':6.75,'+500':6.15,'+1000':5.65},QR:{N:10.60,'+45':9.25,'+100':7.75,'+250':6.60,'+500':6.00,'+1000':5.55},DL:{N:10.20,'+45':8.90,'+100':7.50,'+250':6.40,'+500':5.80,'+1000':5.35}},
  YUL:{AF:{N:10.50,'+45':9.15,'+100':7.70,'+250':6.55,'+500':5.95,'+1000':5.50},LH:{N:10.80,'+45':9.40,'+100':7.90,'+250':6.75,'+500':6.15,'+1000':5.65},AC:{N:10.00,'+45':8.70,'+100':7.35,'+250':6.25,'+500':5.70,'+1000':5.25}},
  /* ── AFRIQUE ── */
  CAI:{MS:{N:3.50,'+45':3.05,'+100':2.55,'+250':2.15,'+500':1.95,'+1000':1.80},EK:{N:4.80,'+45':4.20,'+100':3.55,'+250':3.00,'+500':2.75,'+1000':2.55},TK:{N:4.00,'+45':3.50,'+100':2.90,'+250':2.50,'+500':2.25,'+1000':2.05}},
  ABJ:{AF:{N:5.40,'+45':4.70,'+100':3.95,'+250':3.35,'+500':3.05,'+1000':2.80},TK:{N:5.60,'+45':4.90,'+100':4.10,'+250':3.50,'+500':3.20,'+1000':2.95}},
  LOS:{AF:{N:6.00,'+45':5.20,'+100':4.40,'+250':3.75,'+500':3.40,'+1000':3.15},EK:{N:6.80,'+45':5.90,'+100':4.95,'+250':4.25,'+500':3.85,'+1000':3.55},TK:{N:6.20,'+45':5.40,'+100':4.55,'+250':3.85,'+500':3.50,'+1000':3.25}},
};

/* ── Bascule type cargo ── */
function fcalcSetType(type, btn) {
  _fcalcType = type;
  document.querySelectorAll('.fret-type-group .fret-toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const boxEl = el('fcalc-box-inputs'), palEl = el('fcalc-pal-inputs');
  if (boxEl) boxEl.style.display = type === 'box' ? '' : 'none';
  if (palEl) palEl.style.display = type === 'palette' ? '' : 'none';
  el('fcalc-results').innerHTML = _fcalcPlaceholder();
}

/* ── Bascule direction ── */
function fcalcSetDir(dir, btn) {
  _fcalcDir = dir;
  document.querySelectorAll('.fret-dir-group .fret-toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ── Mise à jour en temps réel du poids facturable ── */
function fcalcUpdateVolW() {
  const L  = parseFloat(el('fcalc-L')?.value)  || 0;
  const W  = parseFloat(el('fcalc-W')?.value)  || 0;
  const H  = parseFloat(el('fcalc-H')?.value)  || 0;
  const kg = parseFloat(el('fcalc-weight')?.value) || 0;
  const qty = parseInt(el('fcalc-qty')?.value) || 1;
  const prev = el('fcalc-chargeW-preview');
  if (!prev) return;
  if (!kg) { prev.textContent = '—'; prev.className = 'fret-chargeW-badge'; return; }
  const act = kg * qty;
  const vol = (L && W && H) ? (L * W * H / 6000) * qty : 0;
  const cw  = Math.max(act, vol || act);
  prev.textContent = cw.toFixed(1) + ' kg';
  prev.className   = 'fret-chargeW-badge ' + (vol > act ? 'fret-cw-vol' : 'fret-cw-act');
}

/* ── Détermination de la tranche IATA ── */
function fcalcGetWB(cw) {
  if (cw >= 1000) return '+1000';
  if (cw >= 500)  return '+500';
  if (cw >= 250)  return '+250';
  if (cw >= 100)  return '+100';
  if (cw >= 45)   return '+45';
  return 'N';
}

/* ── Lecture des tarifs admin (localStorage gpe_cargo) si disponibles ── */
function fcalcGetAdminRate(dest, airlineCode, origin, dir, wb) {
  try {
    const d = JSON.parse(localStorage.getItem('gpe_cargo') || '{}');
    const store = dir === 'export' ? (d.exportRates || {}) : (d.importRates || {});
    return store[origin]?.[airlineCode]?.[dest]?.[wb] ?? null;
  } catch(e) { return null; }
}

function _fcalcPlaceholder() {
  return `<div class="fret-results-placeholder">
    <i class="fa-solid fa-plane-departure fret-placeholder-icon"></i>
    <p>Renseignez votre fret ci-contre et cliquez sur <strong>Calculer &amp; Comparer</strong> pour voir les tarifs par compagnie.</p>
  </div>`;
}

/* ── CALCUL PRINCIPAL ── */
function calcFreight() {
  let chargeableW = 0, actualW = 0, volW = 0, qty = 1, qtyLabel = '';

  if (_fcalcType === 'box') {
    const L  = parseFloat(el('fcalc-L')?.value)  || 0;
    const W  = parseFloat(el('fcalc-W')?.value)  || 0;
    const H  = parseFloat(el('fcalc-H')?.value)  || 0;
    const kg = parseFloat(el('fcalc-weight')?.value) || 0;
    qty = parseInt(el('fcalc-qty')?.value) || 1;
    if (!kg) { fcalcShowError('Renseignez le poids du colis.'); return; }
    actualW     = kg * qty;
    volW        = (L && W && H) ? (L * W * H / 6000) * qty : 0;
    chargeableW = Math.max(actualW, volW || actualW);
    qtyLabel    = qty + ' colis';
  } else {
    const kg      = parseFloat(el('fcalc-pal-weight')?.value) || 0;
    const palType = el('fcalc-pal-type')?.value || 'PMC';
    qty = parseInt(el('fcalc-pal-qty')?.value) || 1;
    if (!kg) { fcalcShowError('Renseignez le poids par palette.'); return; }
    actualW     = kg * qty;
    chargeableW = actualW;
    volW        = 0;
    qtyLabel    = qty + ' palette(s) ' + palType;
  }

  const destSel   = el('fcalc-dest');
  const originSel = el('fcalc-origin');
  const dest      = destSel?.value   || 'CDG';
  const origin    = originSel?.value || 'CMN';
  const destLabel = destSel?.options[destSel.selectedIndex]?.text    || dest;
  const origLabel = originSel?.options[originSel.selectedIndex]?.text || origin;
  const wb        = fcalcGetWB(chargeableW);
  const transit   = FCALC_TRANSIT[dest] || 2;
  const destRates = FCALC_RATES[dest] || {};
  const usdToMad  = fcalcGetExchangeRate();

  const results = [];

  Object.entries(FCALC_AL).forEach(([code, al]) => {
    const marginRate = fcalcGetMargin(code) / 100;
    const fuelUsdPerKg = FCALC_FUEL[code] || 0.55;

    if (code === 'AT') {
      /* ── Royal Air Maroc : grille officielle en MAD/kg ── */
      const destData = AT_COST_MAD[dest];
      if (!destData) return;
      /* Priorité : override admin → grille officielle RAM */
      const adminRate    = fcalcGetAdminRate(dest, 'AT', origin, _fcalcDir, wb);
      const ratePerKgMad = adminRate !== null ? adminRate : destData[wb];
      if (!ratePerKgMad) return;
      const baseMad  = ratePerKgMad * chargeableW;
      const fuelMad  = fuelUsdPerKg * usdToMad * chargeableW;
      const minMad   = destData.MIN || 850;
      const costMad  = Math.max(baseMad + fuelMad, minMad);
      const sellMad  = Math.round(costMad * (1 + marginRate));
      results.push({
        code, al, ratePerKgMad, costMad: Math.round(costMad), sellMad,
        margin: marginRate * 100, transit, wb, chargeableW,
        isRAM: true, isOfficial: adminRate === null
      });
      return;
    }

    /* ── Autres compagnies : grille en USD → converti MAD ── */
    const adminRate    = fcalcGetAdminRate(dest, code, origin, _fcalcDir, wb);
    const ratePerKgUsd = adminRate !== null ? adminRate : destRates[code]?.[wb];
    if (!ratePerKgUsd) return;
    const ratePerKgMad = ratePerKgUsd * usdToMad;
    const baseMad  = ratePerKgMad * chargeableW;
    const fuelMad  = fuelUsdPerKg * usdToMad * chargeableW;
    const minMad   = 45 * usdToMad;
    const costMad  = Math.max(baseMad + fuelMad, minMad);
    const sellMad  = Math.round(costMad * (1 + marginRate));
    results.push({
      code, al, ratePerKgMad, costMad: Math.round(costMad), sellMad,
      margin: marginRate * 100, transit, wb, chargeableW,
      isRAM: false, isOfficial: false
    });
  });

  if (!results.length) {
    fcalcShowError(`Aucune compagnie desservant <strong>${dest}</strong> depuis <strong>${origin}</strong> dans notre base de données. Contactez-nous pour un devis personnalisé.`);
    return;
  }
  results.sort((a, b) => a.sellMad - b.sellMad);

  const volNote = (_fcalcType === 'box' && volW > 0)
    ? `Poids réel <strong>${actualW.toFixed(1)} kg</strong> — Poids vol. <strong>${volW.toFixed(1)} kg</strong> (÷6 000) — Facturable : <strong>${chargeableW.toFixed(1)} kg</strong>`
    : `Poids facturable : <strong>${chargeableW.toFixed(1)} kg</strong> (${qtyLabel})`;

  let html = `
  <div class="fret-res-header">
    <div class="fret-res-route">
      <span class="fret-res-airport">${origin}</span>
      <i class="fa-solid fa-arrow-right fret-res-arrow"></i>
      <span class="fret-res-airport">${dest}</span>
    </div>
    <div class="fret-res-summary">${origLabel} → ${destLabel}</div>
    <div class="fret-chargeW-note"><i class="fa-solid fa-scale-balanced"></i> ${volNote}</div>
    <div class="fret-wb-note">Tranche IATA appliquée : <span class="fret-wb-badge">${wb} kg</span></div>
  </div>
  <div class="fret-airline-list">`;

  results.forEach((r, i) => {
    const best    = i === 0;
    const sellStr = r.sellMad.toLocaleString('fr-MA');
    const costStr = r.costMad.toLocaleString('fr-MA');
    const rateStr = Math.round(r.ratePerKgMad);
    html += `
    <div class="fret-al-card ${best ? 'fret-al-best' : ''}">
      ${best ? '<div class="fret-al-best-badge"><i class="fa-solid fa-crown"></i> Meilleur prix</div>' : ''}
      ${r.isRAM ? `<div class="fret-ram-badge"><i class="fa-solid fa-certificate"></i> Tarif Officiel RAM${r.isOfficial ? '' : ' (modifié)'}</div>` : ''}
      <div class="fret-al-top">
        <div class="fret-al-logo-wrap">
          <img src="${r.al.logo}" alt="${r.al.name}" class="fret-al-logo"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <div class="fret-al-code-badge" style="background:${r.al.color};display:none">${r.code}</div>
        </div>
        <div class="fret-al-info">
          <div class="fret-al-name">${r.al.name}</div>
          <div class="fret-al-rate">${rateStr} <span>MAD/kg</span></div>
          ${!r.isRAM ? '<div class="fret-al-indicatif"><i class="fa-solid fa-chart-line"></i> Tarif indicatif</div>' : ''}
        </div>
        <div class="fret-al-total">
          <div class="fret-al-total-val">${sellStr} <span class="fret-currency-mad">MAD</span></div>
          <div class="fret-al-total-label">Prix de vente TTC</div>
        </div>
      </div>
      <div class="fret-al-breakdown">
        <span class="fret-al-cost"><i class="fa-solid fa-tag"></i> PA : ${costStr} MAD</span>
        <span class="fret-al-margin"><i class="fa-solid fa-percent"></i> Marge : ${r.margin.toFixed(0)}%</span>
        <span><i class="fa-solid fa-gas-pump"></i> Fuel inclus</span>
        <span><i class="fa-solid fa-clock"></i> Transit : J+${r.transit}</span>
      </div>
    </div>`;
  });

  const hasIndicatif = results.some(r => !r.isRAM);
  html += `</div>
  <p class="fret-res-disclaimer">
    <i class="fa-solid fa-circle-info"></i>
    Prix de vente en MAD incluant transport + surcharge fuel + marge commerciale. Hors AWB, sûreté, manutention et dédouanement.${hasIndicatif ? ' Les tarifs des compagnies partenaires sont indicatifs.' : ''}
  </p>
  <a href="#contact" class="btn btn-primary fret-quote-btn">
    <i class="fa-solid fa-envelope"></i> Demander un devis précis
  </a>`;

  el('fcalc-results').innerHTML = html;
}

function fcalcShowError(msg) {
  el('fcalc-results').innerHTML = `
    <div class="fret-res-error">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <p>${msg}</p>
    </div>`;
}

// showSim handles all tabs — defined earlier in this file.
