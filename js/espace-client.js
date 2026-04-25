/* ══════════════════════════════════════════════════════
   GO PLUS EXPRESS — Espace Client JS
   ══════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════
   SÉCURITÉ — Utilitaires globaux
   ══════════════════════════════════════════════════════ */

/**
 * Échappe les caractères HTML dangereux pour prévenir les attaques XSS.
 * À utiliser SYSTÉMATIQUEMENT avant toute injection dans innerHTML.
 */
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Hache un mot de passe avec SHA-256 via Web Crypto API (natif navigateur).
 * Le sel empêche les attaques par table arc-en-ciel.
 */
async function hashPass(password) {
  const SALT = 'GPE_$3cure_Salt_2025#!';
  const encoder = new TextEncoder();
  const data = encoder.encode(SALT + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Valide le format d'un email.
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/**
 * Valide et limite la longueur d'un champ texte.
 */
function sanitizeField(val, maxLen = 100) {
  return String(val || '').trim().substring(0, maxLen);
}

/* ══════════════════════════════════════════════════════
   AUTH — Rate limiting & Session
   ══════════════════════════════════════════════════════ */
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION   = 5 * 60 * 1000;   // 5 minutes
const SESSION_DURATION   = 8 * 60 * 60 * 1000; // 8 heures

function getRateLimit(email) {
  try {
    const key = 'ec_rl_' + btoa(email.toLowerCase());
    const data = JSON.parse(localStorage.getItem(key) || '{"count":0,"until":0}');
    if (Date.now() < data.until) {
      return { locked: true, remaining: Math.ceil((data.until - Date.now()) / 60000) };
    }
    return { locked: false, count: data.count || 0 };
  } catch(e) { return { locked: false, count: 0 }; }
}

function incrementRateLimit(email) {
  try {
    const key = 'ec_rl_' + btoa(email.toLowerCase());
    const data = JSON.parse(localStorage.getItem(key) || '{"count":0,"until":0}');
    data.count = (data.count || 0) + 1;
    if (data.count >= MAX_LOGIN_ATTEMPTS) {
      data.until = Date.now() + LOCKOUT_DURATION;
      data.count = 0;
    }
    localStorage.setItem(key, JSON.stringify(data));
  } catch(e) {}
}

function resetRateLimit(email) {
  try { localStorage.removeItem('ec_rl_' + btoa(email.toLowerCase())); } catch(e) {}
}

/* ── Auth ──────────────────────────────────────────── */
// Compte de démonstration — identifiants intentionnellement visibles pour la démo
const EC_DEMO = { email:'demo@goplusexpress.ma', passHash:'__DEMO__', first:'Demo', last:'GO PLUS', company:'GO PLUS EXPRESS' };

function ecInit(){
  const user = ecGetUser();
  if(user){ ecShowDashboard(user); } else { ecShowLogin(); }
  document.getElementById('inv-date').value = new Date().toISOString().slice(0,10);
  invCalc();
  simProCalc();
  codesInit();
  acRender();
  ecHsInit();
  expInitCountries();
  shpInit();
  ocrInitAiPanel();  // Restaure la clé API Claude si déjà enregistrée
}

function ecGetUser(){
  try{
    const session = JSON.parse(localStorage.getItem('ec_user'));
    if(!session) return null;
    // Vérification expiration de session (8h)
    if(session.expires && Date.now() > session.expires){
      ecClearUser();
      return null;
    }
    return session;
  }catch(e){ return null; }
}
function ecSetUser(u){
  // Ajouter horodatage d'expiration de session
  const session = { ...u, expires: Date.now() + SESSION_DURATION, createdAt: Date.now() };
  // Ne jamais stocker le mot de passe dans la session
  delete session.pass;
  delete session.passHash;
  localStorage.setItem('ec_user', JSON.stringify(session));
}
function ecClearUser(){ localStorage.removeItem('ec_user'); }

function ecShowLogin(){
  document.getElementById('ec-login-overlay').classList.remove('hidden');
  document.getElementById('ec-dashboard').classList.add('hidden');
}

function ecShowDashboard(user){
  document.getElementById('ec-login-overlay').classList.add('hidden');
  document.getElementById('ec-dashboard').classList.remove('hidden');
  const initials = (user.first[0]||'U') + (user.last[0]||'');
  const full = user.first + ' ' + user.last;
  ['ec-avatar-nav','ec-avatar-side'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent=initials; });
  const un = document.getElementById('ec-username-nav'); if(un) un.textContent = full;
  const fn = document.getElementById('ec-fullname-side'); if(fn) fn.textContent = full;
  const co = document.getElementById('ec-company-side'); if(co) co.textContent = user.company;
  const wm = document.getElementById('ec-welcome-msg'); if(wm) wm.textContent = 'Bienvenue, ' + user.first + ' ! Sélectionnez un module pour commencer.';
  const nav = document.getElementById('ec-user-nav'); if(nav) nav.classList.remove('hidden');
}

function ecShowTab(tab){
  document.querySelectorAll('.ec-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.ec-tab-panel').forEach(p=>p.classList.remove('active'));
  document.querySelector('.ec-tab-panel#ec-tab-'+tab).classList.add('active');
  document.querySelectorAll('.ec-tab')[tab==='login'?0:1].classList.add('active');
}

async function ecLogin(){
  const emailRaw = document.getElementById('ec-login-email').value.trim();
  const pass     = document.getElementById('ec-login-pass').value;
  const err      = document.getElementById('ec-login-error');
  const btn      = document.querySelector('#ec-tab-login .btn-primary');
  err.classList.add('hidden');

  // Validation basique
  if(!emailRaw || !pass){ err.textContent='Veuillez remplir tous les champs.'; err.classList.remove('hidden'); return; }
  if(!isValidEmail(emailRaw)){ err.textContent='Format d\'email invalide.'; err.classList.remove('hidden'); return; }

  const email = emailRaw.toLowerCase();

  // Vérification rate limiting
  const rl = getRateLimit(email);
  if(rl.locked){
    err.textContent = `Trop de tentatives. Compte bloqué ${rl.remaining} minute(s).`;
    err.classList.remove('hidden');
    return;
  }

  // Désactiver le bouton pendant la vérification
  if(btn){ btn.disabled = true; btn.textContent = '…'; }

  // Compte de démonstration
  if(email === EC_DEMO.email && pass === 'demo2024'){
    resetRateLimit(email);
    const user = {email, first:EC_DEMO.first, last:EC_DEMO.last, company:EC_DEMO.company};
    ecSetUser(user);
    ecShowDashboard(user);
    if(btn){ btn.disabled=false; btn.innerHTML='<i class="fa-solid fa-right-to-bracket"></i> Se connecter'; }
    return;
  }

  // Hacher le mot de passe et comparer avec les utilisateurs enregistrés
  const passHash = await hashPass(pass);
  const users = JSON.parse(localStorage.getItem('ec_users')||'[]');
  const found = users.find(u => u.email === email && u.passHash === passHash);

  if(btn){ btn.disabled=false; btn.innerHTML='<i class="fa-solid fa-right-to-bracket"></i> Se connecter'; }

  if(found){
    resetRateLimit(email);
    ecSetUser({email:found.email, first:found.first, last:found.last, company:found.company});
    ecShowDashboard(ecGetUser());
    return;
  }

  // Échec — incrémenter le compteur
  incrementRateLimit(email);
  const rlAfter = getRateLimit(email);
  const remaining = MAX_LOGIN_ATTEMPTS - (rlAfter.count || 0);
  if(rlAfter.locked){
    err.textContent = 'Compte bloqué 5 minutes après trop de tentatives.';
  } else {
    err.textContent = `Email ou mot de passe incorrect. (${remaining > 0 ? remaining : MAX_LOGIN_ATTEMPTS} tentative(s) restante(s))`;
  }
  err.classList.remove('hidden');
}

async function ecRegister(){
  const first   = sanitizeField(document.getElementById('ec-reg-first').value, 50);
  const last    = sanitizeField(document.getElementById('ec-reg-last').value, 50);
  const company = sanitizeField(document.getElementById('ec-reg-company').value, 100);
  const emailRaw= document.getElementById('ec-reg-email').value.trim().toLowerCase();
  const pass    = document.getElementById('ec-reg-pass').value;
  const err     = document.getElementById('ec-reg-error');
  const succ    = document.getElementById('ec-reg-success');
  err.classList.add('hidden'); succ.classList.add('hidden');

  // Validation des champs
  if(!first||!last||!emailRaw||!pass){
    err.textContent='Veuillez remplir tous les champs obligatoires.';
    err.classList.remove('hidden'); return;
  }
  if(!isValidEmail(emailRaw)){
    err.textContent='Format d\'email invalide (ex: nom@societe.ma).';
    err.classList.remove('hidden'); return;
  }
  if(pass.length < 8){
    err.textContent='Le mot de passe doit contenir au moins 8 caractères.';
    err.classList.remove('hidden'); return;
  }
  if(!/[A-Z]/.test(pass) || !/[0-9]/.test(pass)){
    err.textContent='Le mot de passe doit contenir au moins 1 majuscule et 1 chiffre.';
    err.classList.remove('hidden'); return;
  }
  if(emailRaw.length > 150){
    err.textContent='Email trop long.';
    err.classList.remove('hidden'); return;
  }

  const users = JSON.parse(localStorage.getItem('ec_users')||'[]');
  if(users.find(u=>u.email===emailRaw)){
    err.textContent='Cet email est déjà enregistré.';
    err.classList.remove('hidden'); return;
  }

  // Hacher le mot de passe avant stockage (jamais en clair)
  const passHash = await hashPass(pass);

  users.push({
    email:    emailRaw,
    passHash: passHash,   // ← hash SHA-256, jamais le mot de passe en clair
    first:    first,
    last:     last,
    company:  company || '—',
    createdAt: Date.now()
  });
  localStorage.setItem('ec_users', JSON.stringify(users));
  succ.textContent = 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.';
  succ.classList.remove('hidden');
  setTimeout(()=>ecShowTab('login'), 1800);
}

function ecLogout(){
  ecClearUser();
  ecShowLogin();
}

/* ── Module nav ─────────────────────────────────────── */
function ecShowModule(name){
  document.querySelectorAll('.ec-module').forEach(m=>m.classList.remove('active'));
  document.querySelectorAll('.ec-nav-item').forEach(n=>n.classList.remove('active'));
  const mod = document.getElementById('ecmod-'+name);
  const nav = document.getElementById('ecnav-'+name);
  if(mod) mod.classList.add('active');
  if(nav) nav.classList.add('active');
  window.scrollTo(0,0);
}

/* ── Invoice Calculator ──────────────────────────────── */
function fmt(n){ return n.toLocaleString('fr-MA',{minimumFractionDigits:2,maximumFractionDigits:2})+' MAD'; }

function invCalc(){
  const w     = parseFloat(document.getElementById('inv-weight').value)||0;
  const rate  = parseFloat(document.getElementById('inv-rate').value)||0;
  const extra = parseFloat(document.getElementById('inv-extra').value)||0;
  const tva   = parseFloat(document.getElementById('inv-tva').value)||20;
  const mode  = document.getElementById('inv-mode').value;
  const ref   = document.getElementById('inv-ref').value||'—';
  const num   = document.getElementById('inv-num').value||'GPE-2024-001';
  const date  = document.getElementById('inv-date').value||'—';

  const lineAmt = w * rate;
  const ht  = lineAmt + extra;
  const tvaAmt = ht * tva/100;
  const ttc = ht + tvaAmt;

  document.getElementById('inv-ht').textContent   = fmt(ht);
  document.getElementById('inv-tva-amt').textContent = fmt(tvaAmt);
  document.getElementById('inv-ttc').textContent  = fmt(ttc);

  // Preview update
  document.getElementById('idoc-num').textContent  = num;
  document.getElementById('idoc-date').textContent = date;
  document.getElementById('idoc-ref').textContent  = ref;
  document.getElementById('idoc-from-name').textContent = document.getElementById('inv-from-name').value||'—';
  document.getElementById('idoc-from-addr').textContent = document.getElementById('inv-from-addr').value||'';
  document.getElementById('idoc-to-name').textContent   = document.getElementById('inv-to-name').value||'—';
  document.getElementById('idoc-to-addr').textContent   = document.getElementById('inv-to-addr').value||'';
  document.getElementById('idoc-qty').textContent  = w+' kg';
  document.getElementById('idoc-pu').textContent   = fmt(rate);
  document.getElementById('idoc-line1').textContent= fmt(lineAmt);
  document.getElementById('idoc-extra').textContent= fmt(extra);
  document.getElementById('idoc-extra2').textContent= fmt(extra);
  document.getElementById('idoc-ht').textContent   = fmt(ht);
  document.getElementById('idoc-tva-lbl').textContent= 'TVA '+tva+'%';
  document.getElementById('idoc-tva').textContent  = fmt(tvaAmt);
  document.getElementById('idoc-ttc').textContent  = fmt(ttc);
  // Update lines table mode label
  const lines = document.getElementById('idoc-lines');
  if(lines) lines.querySelector('td:first-child').textContent = 'Frais de transport ('+mode+')';
}

function invPrint(){
  invCalc();
  // Utiliser un Blob URL au lieu de document.write pour éviter l'injection HTML
  const doc = document.getElementById('inv-doc');
  // Extraire uniquement le texte structuré, pas innerHTML brut
  const style = `<style>
    body{font-family:Arial,sans-serif;padding:20px;color:#222}
    table{width:100%;border-collapse:collapse}
    td,th{padding:8px;border:1px solid #ddd}
    th{background:#0f1e2e;color:#fff}
    .ttc{font-size:1.1rem;font-weight:800;color:#00a99d}
    .inv-head{display:flex;justify-content:space-between;margin-bottom:24px}
  </style>`;
  // Sérialiser le DOM de manière sécurisée via XMLSerializer
  const serializer = new XMLSerializer();
  const docContent = serializer.serializeToString(doc);
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Facture Transport — GO PLUS EXPRESS</title>${style}</head><body>${docContent}</body></html>`;
  const blob = new Blob([html], {type:'text/html;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if(win) {
    win.onload = () => { win.print(); URL.revokeObjectURL(url); };
  }
}

/* ── Codes Aéroports & Ports — base complète dans js/airports-ports-data.js ── */
const _AIRPORTS_OLD_UNUSED = [
  {code:'CMN',name:'Mohammed V International',city:'Casablanca',country:'Maroc',region:'AF',type:'airport'},
  {code:'RAK',name:'Marrakech-Ménara',city:'Marrakech',country:'Maroc',region:'AF',type:'airport'},
  {code:'AGA',name:'Al Massira',city:'Agadir',country:'Maroc',region:'AF',type:'airport'},
  {code:'TNG',name:'Ibn Batouta',city:'Tanger',country:'Maroc',region:'AF',type:'airport'},
  {code:'FEZ',name:'Saïs',city:'Fès',country:'Maroc',region:'AF',type:'airport'},
  {code:'OUD',name:'Angads',city:'Oujda',country:'Maroc',region:'AF',type:'airport'},
  {code:'NDB',name:'Nouadhibou',city:'Nouadhibou',country:'Mauritanie',region:'AF',type:'airport'},
  {code:'CDG',name:'Charles de Gaulle',city:'Paris',country:'France',region:'EU',type:'airport'},
  {code:'ORY',name:'Paris Orly',city:'Paris',country:'France',region:'EU',type:'airport'},
  {code:'LYS',name:'Saint-Exupéry',city:'Lyon',country:'France',region:'EU',type:'airport'},
  {code:'FRA',name:'Frankfurt am Main',city:'Frankfurt',country:'Allemagne',region:'EU',type:'airport'},
  {code:'MUC',name:'Munich',city:'Munich',country:'Allemagne',region:'EU',type:'airport'},
  {code:'AMS',name:'Amsterdam Schiphol',city:'Amsterdam',country:'Pays-Bas',region:'EU',type:'airport'},
  {code:'MAD',name:'Adolfo Suárez Barajas',city:'Madrid',country:'Espagne',region:'EU',type:'airport'},
  {code:'BCN',name:'El Prat',city:'Barcelone',country:'Espagne',region:'EU',type:'airport'},
  {code:'LHR',name:'Heathrow',city:'Londres',country:'Royaume-Uni',region:'EU',type:'airport'},
  {code:'BRU',name:'Brussels Airport',city:'Bruxelles',country:'Belgique',region:'EU',type:'airport'},
  {code:'MXP',name:'Malpensa',city:'Milan',country:'Italie',region:'EU',type:'airport'},
  {code:'FCO',name:'Leonardo da Vinci',city:'Rome',country:'Italie',region:'EU',type:'airport'},
  {code:'IST',name:'Istanbul Airport',city:'Istanbul',country:'Turquie',region:'AS',type:'airport'},
  {code:'DXB',name:'Dubai International',city:'Dubaï',country:'Émirats Arabes',region:'ME',type:'airport'},
  {code:'AUH',name:'Abu Dhabi International',city:'Abu Dhabi',country:'Émirats Arabes',region:'ME',type:'airport'},
  {code:'DOH',name:'Hamad International',city:'Doha',country:'Qatar',region:'ME',type:'airport'},
  {code:'RUH',name:'King Khalid International',city:'Riyad',country:'Arabie Saoudite',region:'ME',type:'airport'},
  {code:'JED',name:'King Abdulaziz',city:'Djeddah',country:'Arabie Saoudite',region:'ME',type:'airport'},
  {code:'CAI',name:'Cairo International',city:'Le Caire',country:'Égypte',region:'AF',type:'airport'},
  {code:'JNB',name:'O.R. Tambo International',city:'Johannesburg',country:'Afrique du Sud',region:'AF',type:'airport'},
  {code:'NBO',name:'Jomo Kenyatta',city:'Nairobi',country:'Kenya',region:'AF',type:'airport'},
  {code:'LAG',name:'Murtala Muhammed',city:'Lagos',country:'Nigéria',region:'AF',type:'airport'},
  {code:'DKR',name:'Blaise Diagne',city:'Dakar',country:'Sénégal',region:'AF',type:'airport'},
  {code:'PVG',name:'Pudong International',city:'Shanghai',country:'Chine',region:'AS',type:'airport'},
  {code:'PEK',name:'Capital International',city:'Pékin',country:'Chine',region:'AS',type:'airport'},
  {code:'HKG',name:'Hong Kong International',city:'Hong Kong',country:'Hong Kong',region:'AS',type:'airport'},
  {code:'ICN',name:'Incheon International',city:'Séoul',country:'Corée du Sud',region:'AS',type:'airport'},
  {code:'NRT',name:'Narita International',city:'Tokyo',country:'Japon',region:'AS',type:'airport'},
  {code:'SIN',name:'Changi Airport',city:'Singapour',country:'Singapour',region:'AS',type:'airport'},
  {code:'BOM',name:'Chhatrapati Shivaji',city:'Mumbai',country:'Inde',region:'AS',type:'airport'},
  {code:'DEL',name:'Indira Gandhi',city:'New Delhi',country:'Inde',region:'AS',type:'airport'},
  {code:'JFK',name:'John F. Kennedy',city:'New York',country:'États-Unis',region:'NA',type:'airport'},
  {code:'LAX',name:'Los Angeles',city:'Los Angeles',country:'États-Unis',region:'NA',type:'airport'},
  {code:'ORD',name:"O'Hare International",city:'Chicago',country:'États-Unis',region:'NA',type:'airport'},
  {code:'MIA',name:'Miami International',city:'Miami',country:'États-Unis',region:'NA',type:'airport'},
  {code:'YUL',name:'Pierre-Elliott-Trudeau',city:'Montréal',country:'Canada',region:'NA',type:'airport'},
  {code:'GRU',name:'Guarulhos',city:'São Paulo',country:'Brésil',region:'SA',type:'airport'},
  {code:'EZE',name:'Ministro Pistarini',city:'Buenos Aires',country:'Argentine',region:'SA',type:'airport'},
  {code:'SYD',name:'Kingsford Smith',city:'Sydney',country:'Australie',region:'OC',type:'airport'},
];

const _PORTS_OLD_UNUSED = [
  {code:'MAAGP',name:'Agadir',city:'Agadir',country:'Maroc',region:'AF',type:'port'},
  {code:'MACAS',name:'Casablanca',city:'Casablanca',country:'Maroc',region:'AF',type:'port'},
  {code:'MATAN',name:'Tanger Med',city:'Tanger',country:'Maroc',region:'AF',type:'port'},
  {code:'MANDR',name:'Nador',city:'Nador',country:'Maroc',region:'AF',type:'port'},
  {code:'MAASL',name:'Laâyoune',city:'Laâyoune',country:'Maroc',region:'AF',type:'port'},
  {code:'MADKH',name:'Dakhla',city:'Dakhla',country:'Maroc',region:'AF',type:'port'},
  {code:'ESSAG',name:'Algésiras',city:'Algésiras',country:'Espagne',region:'EU',type:'port'},
  {code:'ESVLC',name:'Valencia',city:'Valencia',country:'Espagne',region:'EU',type:'port'},
  {code:'ESBCN',name:'Barcelone',city:'Barcelone',country:'Espagne',region:'EU',type:'port'},
  {code:'FRMRS',name:'Marseille',city:'Marseille',country:'France',region:'EU',type:'port'},
  {code:'FRLEH',name:'Le Havre',city:'Le Havre',country:'France',region:'EU',type:'port'},
  {code:'NLRTM',name:'Rotterdam',city:'Rotterdam',country:'Pays-Bas',region:'EU',type:'port'},
  {code:'DEHAM',name:'Hambourg',city:'Hambourg',country:'Allemagne',region:'EU',type:'port'},
  {code:'BEANT',name:'Anvers',city:'Anvers',country:'Belgique',region:'EU',type:'port'},
  {code:'GBFEL',name:'Felixstowe',city:'Felixstowe',country:'Royaume-Uni',region:'EU',type:'port'},
  {code:'ITGOA',name:'Gênes',city:'Gênes',country:'Italie',region:'EU',type:'port'},
  {code:'GBSOU',name:'Southampton',city:'Southampton',country:'Royaume-Uni',region:'EU',type:'port'},
  {code:'AEDXB',name:'Port Jebel Ali',city:'Dubaï',country:'Émirats Arabes',region:'ME',type:'port'},
  {code:'AEAUH',name:'Port de Khalifa',city:'Abu Dhabi',country:'Émirats Arabes',region:'ME',type:'port'},
  {code:'SAJED',name:'Jeddah Islamic Port',city:'Djeddah',country:'Arabie Saoudite',region:'ME',type:'port'},
  {code:'EGPSD',name:'Port Saïd Est',city:'Port Saïd',country:'Égypte',region:'AF',type:'port'},
  {code:'EGALY',name:'Alexandrie',city:'Alexandrie',country:'Égypte',region:'AF',type:'port'},
  {code:'TZDAR',name:'Dar es Salaam',city:'Dar es Salaam',country:'Tanzanie',region:'AF',type:'port'},
  {code:'ZAGQJ',name:'Durban',city:'Durban',country:'Afrique du Sud',region:'AF',type:'port'},
  {code:'SNGEA',name:'Port de Singapour',city:'Singapour',country:'Singapour',region:'AS',type:'port'},
  {code:'CNSHA',name:'Shanghai Yangshan',city:'Shanghai',country:'Chine',region:'AS',type:'port'},
  {code:'CNNGB',name:'Ningbo-Zhoushan',city:'Ningbo',country:'Chine',region:'AS',type:'port'},
  {code:'CNSZX',name:'Shenzhen Yantian',city:'Shenzhen',country:'Chine',region:'AS',type:'port'},
  {code:'HKHKG',name:'Port de Hong Kong',city:'Hong Kong',country:'Hong Kong',region:'AS',type:'port'},
  {code:'JPNGO',name:'Nagoya',city:'Nagoya',country:'Japon',region:'AS',type:'port'},
  {code:'KRPUS',name:'Busan',city:'Busan',country:'Corée du Sud',region:'AS',type:'port'},
  {code:'INNSA',name:'Nhava Sheva (JNPT)',city:'Mumbai',country:'Inde',region:'AS',type:'port'},
  {code:'USNYK',name:'New York / New Jersey',city:'New York',country:'États-Unis',region:'NA',type:'port'},
  {code:'USLAX',name:'Los Angeles / Long Beach',city:'Los Angeles',country:'États-Unis',region:'NA',type:'port'},
  {code:'USMIA',name:'Miami',city:'Miami',country:'États-Unis',region:'NA',type:'port'},
  {code:'BRSAO',name:'Santos',city:'São Paulo',country:'Brésil',region:'SA',type:'port'},
  {code:'AUSYD',name:'Sydney',city:'Sydney',country:'Australie',region:'OC',type:'port'},
];
// NOTE: _AIRPORTS_OLD_UNUSED et PORTS_OLD_UNUSED ignorés — vraies données dans airports-ports-data.js

let currentCodesTab = 'airports';

function codesInit(){
  codesSwitchTab('airports');
}

function codesSwitchTab(tab){
  currentCodesTab = tab;
  document.querySelectorAll('.codes-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('ctab-'+tab).classList.add('active');
  document.getElementById('codes-search').value = '';
  document.getElementById('codes-region').value = '';
  codesSearch();
}

function codesSearch(){
  const q = document.getElementById('codes-search').value.toLowerCase();
  const region = document.getElementById('codes-region').value;
  const data = currentCodesTab === 'airports' ? AIRPORTS : PORTS;

  const filtered = data.filter(d => {
    const match = !q || d.code.toLowerCase().includes(q) || d.name.toLowerCase().includes(q) || d.city.toLowerCase().includes(q) || d.country.toLowerCase().includes(q);
    const reg = !region || d.region === region;
    return match && reg;
  });

  const thead = document.getElementById('codes-thead');
  const tbody = document.getElementById('codes-tbody');

  if(currentCodesTab === 'airports'){
    thead.innerHTML = '<tr><th>Code IATA</th><th>Aéroport</th><th>Ville</th><th>Pays</th></tr>';
    tbody.innerHTML = filtered.map(d=>`
      <tr>
        <td><span class="code-badge">${escapeHTML(d.code)}</span></td>
        <td>${escapeHTML(d.name)}</td>
        <td>${escapeHTML(d.city)}</td>
        <td>${escapeHTML(d.country)}</td>
      </tr>`).join('');
  } else {
    thead.innerHTML = '<tr><th>Code LOCODE</th><th>Port</th><th>Ville</th><th>Pays</th></tr>';
    tbody.innerHTML = filtered.map(d=>`
      <tr>
        <td><span class="code-badge">${escapeHTML(d.code)}</span></td>
        <td>${escapeHTML(d.name)}</td>
        <td>${escapeHTML(d.city)}</td>
        <td>${escapeHTML(d.country)}</td>
      </tr>`).join('');
  }
  document.getElementById('codes-count').textContent = filtered.length + ' résultat(s)';
}

/* ── Simulation Pro ──────────────────────────────────── */
const SIMPR_RATES = {
  express: { base:450, perKg:85,  fuel:0.22, zones:{FR:1,DE:1.1,ES:0.9,IT:1.05,UK:1.2,CN:2.1,US:2.4,AE:1.6,TR:1.3,BE:1,NL:1}, transit:{FR:'J+2 à J+3',DE:'J+2 à J+4',ES:'J+2 à J+3',IT:'J+3 à J+4',UK:'J+3 à J+5',CN:'J+3 à J+5',US:'J+4 à J+6',AE:'J+3 à J+4',TR:'J+3 à J+5',BE:'J+2 à J+3',NL:'J+2 à J+3'} },
  air:     { base:600, perKg:35,  fuel:0.28, zones:{FR:1,DE:1.05,ES:0.95,IT:1,UK:1.1,CN:1.8,US:2.2,AE:1.4,TR:1.2,BE:1,NL:1}, transit:{FR:'J+3 à J+5',DE:'J+3 à J+5',ES:'J+3 à J+5',IT:'J+4 à J+6',UK:'J+4 à J+6',CN:'J+5 à J+8',US:'J+6 à J+9',AE:'J+4 à J+6',TR:'J+4 à J+6',BE:'J+3 à J+5',NL:'J+3 à J+5'} },
  sea_fcl: { base:3200,perKg:0,   fuel:0.12, zones:{FR:1,DE:1.1,ES:0.9,IT:1,UK:1.15,CN:1.6,US:2,AE:1.4,TR:1,BE:1,NL:1},      transit:{FR:'12-15j',DE:'14-18j',ES:'10-14j',IT:'12-16j',UK:'15-18j',CN:'22-30j',US:'28-35j',AE:'18-22j',TR:'10-14j',BE:'13-16j',NL:'12-15j'} },
  sea_lcl: { base:800, perKg:2.5, fuel:0.15, zones:{FR:1,DE:1.1,ES:0.9,IT:1,UK:1.15,CN:1.7,US:2.1,AE:1.4,TR:1,BE:1,NL:1},    transit:{FR:'14-18j',DE:'16-20j',ES:'12-16j',IT:'14-18j',UK:'16-20j',CN:'24-32j',US:'30-38j',AE:'20-25j',TR:'12-16j',BE:'15-18j',NL:'14-18j'} },
  road:    { base:900, perKg:3.2, fuel:0.18, zones:{FR:1,DE:1.15,ES:0.85,IT:1.1,UK:1.3,CN:0,US:0,AE:0,TR:1.2,BE:1.05,NL:1.05}, transit:{FR:'4-6j',DE:'5-7j',ES:'3-5j',IT:'5-7j',UK:'6-8j',CN:'N/D',US:'N/D',AE:'N/D',TR:'8-12j',BE:'4-6j',NL:'4-6j'} },
};

function simProCalc(){
  const mode  = document.getElementById('simpr-mode').value;
  const from  = document.getElementById('simpr-from').value;
  const weight= parseFloat(document.getElementById('simpr-weight').value)||0;
  const L     = parseFloat(document.getElementById('simpr-l').value)||0;
  const W     = parseFloat(document.getElementById('simpr-w').value)||0;
  const H     = parseFloat(document.getElementById('simpr-h').value)||0;
  const value = parseFloat(document.getElementById('simpr-value').value)||0;
  const ins   = document.getElementById('simpr-ins').checked;
  const cust  = document.getElementById('simpr-cust').checked;

  const R = SIMPR_RATES[mode];
  const zmult = R.zones[from] || 1;

  // Volumetric weight
  const div = (mode==='express'||mode==='air') ? 6000 : 1000;
  const volW = (L*W*H)/div;
  const billW = Math.max(weight, volW);

  let base = R.base * zmult;
  let freight = mode==='sea_fcl' ? base : base + billW * R.perKg * zmult;
  let fuel = freight * R.fuel;
  let insAmt = ins ? value * 0.008 : 0;
  let custAmt = cust ? 850 : 0;
  let total = freight + fuel + insAmt + custAmt;

  const transit = R.transit[from] || '—';

  // Utiliser textContent pour les données variables (escapeHTML via DOM API)
  const modeText = escapeHTML(document.getElementById('simpr-mode').options[document.getElementById('simpr-mode').selectedIndex].text);
  const fromText = escapeHTML(document.getElementById('simpr-from').options[document.getElementById('simpr-from').selectedIndex].text);

  const lines = document.getElementById('simpr-lines');
  lines.innerHTML = [
    { label: 'Fret ' + modeText, val: fmt(freight) },
    { label: 'Surcharge carburant (' + Math.round(R.fuel*100) + '%)', val: fmt(fuel) },
    ins  ? { label: 'Assurance marchandise (0.8%)', val: fmt(insAmt) } : null,
    cust ? { label: 'Dédouanement MAD', val: fmt(custAmt) }           : null,
    volW > weight ? { label: `Poids volumétrique utilisé (${billW.toFixed(1)} kg)`, val: '' } : null,
  ].filter(Boolean).map(l=>`<div class="simpr-line"><span class="sl-label">${escapeHTML(l.label)}</span><span class="sl-val">${escapeHTML(l.val)}</span></div>`).join('');

  document.getElementById('simpr-total-val').textContent = fmt(total);
  // Transit : données statiques + textContent pour la partie variable
  const transitEl = document.getElementById('simpr-transit');
  transitEl.innerHTML = `<i class="fa-solid fa-clock"></i> Délai estimé depuis <strong>${fromText}</strong> : <strong>${escapeHTML(transit)}</strong>`;
}

/* ── VesselFinder zone switcher ─────────────────────── */
function vesselZone(lat,lon,zoom,btn){
  const iframe = document.getElementById('vessel-iframe');
  if(iframe) iframe.src = `https://www.vesselfinder.com/aismap?zoom=${zoom}&lat=${lat}&lon=${lon}&names=true&maptype=1&fleet=&mmsi=`;
  document.querySelectorAll('.vessel-zone-btn').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
}

/* ── Guide / Switch panels ───────────────────────────── */
function guideSwitch(name){
  document.querySelectorAll('.guide-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.guide-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('gtab-'+name).classList.add('active');
  document.getElementById('gpanel-'+name).classList.add('active');
}
function avionSwitch(name){
  const mod = document.getElementById('ecmod-avion');
  mod.querySelectorAll('.guide-tab').forEach(t=>t.classList.remove('active'));
  mod.querySelectorAll('.guide-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('atab-'+name).classList.add('active');
  document.getElementById('apanel-'+name).classList.add('active');
}

/* ── Aircraft data & render ──────────────────────────── */
const AIRCRAFT = [
  {model:'Boeing 747-400F',maker:'Boeing',type:'full',maxPayload:113000,volume:858,range:8230,uld:'30× LD3 + 30× MD11',engines:'4× PW4062',notes:'Avion cargo le plus répandu sur les long-courriers'},
  {model:'Boeing 747-8F',maker:'Boeing',type:'full',maxPayload:133000,volume:858,range:8130,uld:'34× LD3 + 30× MD11',engines:'4× GEnx-2B67',notes:'Version améliorée 747-400F, -16% carburant'},
  {model:'Boeing 777F',maker:'Boeing',type:'full',maxPayload:102000,volume:653,range:9200,uld:'27× LD3 + 10× MD11',engines:'2× GE90-110B',notes:'Standard mondial fret intercontinental'},
  {model:'Boeing 767-300F',maker:'Boeing',type:'full',maxPayload:52700,volume:438,range:6025,uld:'18× LD2 + 5× 463L',engines:'2× CF6-80C2',notes:'Fret moyen-courrier, Europe-Maroc-Afrique'},
  {model:'Airbus A330-200F',maker:'Airbus',type:'full',maxPayload:70000,volume:475,range:7400,uld:'23× LD3 + 10× PMC',engines:'2× CF6-80E1',notes:'Standard fret Europe-Afrique-Moyen-Orient'},
  {model:'Airbus A350F',maker:'Airbus',type:'full',maxPayload:109000,volume:678,range:8700,uld:'30× LD3 + 12× PMC',engines:'2× Rolls-Royce Trent XWB',notes:'Nouvelle génération — entrée en service 2026'},
  {model:'Boeing 737-800BCF',maker:'Boeing',type:'full',maxPayload:22500,volume:215,range:3765,uld:'12× LD2',engines:'2× CFM56-7B',notes:'Cargo court/moyen-courrier, lignes régionales Maroc'},
  {model:'ATR 72-600F',maker:'ATR',type:'full',maxPayload:7500,volume:68,range:1528,uld:'Non standard',engines:'2× PW127M',notes:'Fret régional Maroc + Afrique de l\'Ouest'},
  {model:'Boeing 777-300ER',maker:'Boeing',type:'belly',maxPayload:20000,volume:178,range:13650,uld:'44× LD3',engines:'2× GE90-115B',notes:'Soute passagers — RAM, Air France, Emirates…'},
  {model:'Airbus A330-300',maker:'Airbus',type:'belly',maxPayload:17000,volume:154,range:11750,uld:'36× LD3',engines:'2× Trent 700',notes:'Soute passagers — RAM, Air Arabia, Turkish…'},
  {model:'Boeing 737-800',maker:'Boeing',type:'belly',maxPayload:4500,volume:45,range:5765,uld:'Non standard',engines:'2× CFM56-7B',notes:'Court/moyen-courrier — soute 45 m³'},
  {model:'Airbus A320neo',maker:'Airbus',type:'belly',maxPayload:3900,volume:38,range:6300,uld:'Non standard',engines:'2× CFM LEAP-1A',notes:'Soute passagers — court/moyen-courrier'},
  {model:'Antonov AN-124',maker:'Antonov',type:'full',maxPayload:150000,volume:1013,range:5400,uld:'Non standard / outsize',engines:'4× D-18T',notes:'Charges hors-gabarit — machines, équipements industriels'},
  {model:'Ilyushin IL-76TD',maker:'Ilyushin',type:'full',maxPayload:50000,volume:400,range:4800,uld:'Non standard',engines:'4× D-30KP',notes:'Cargo charter Afrique + Moyen-Orient'},
];

let acData = [...AIRCRAFT];

function acFilter(){
  const q = (document.getElementById('ac-search').value||'').toLowerCase();
  const type = document.getElementById('ac-type').value;
  acData = AIRCRAFT.filter(a=>{
    const matchQ = !q || a.model.toLowerCase().includes(q) || a.maker.toLowerCase().includes(q) || (a.notes||'').toLowerCase().includes(q);
    const matchT = !type || a.type === type;
    return matchQ && matchT;
  });
  acRender();
}

function acRender(){
  const grid = document.getElementById('ac-grid');
  if(!grid) return;
  const typeLabel = {full:'Full Freighter',combi:'Combi',belly:'Belly (soute passagers)'};
  grid.innerHTML = acData.map(a=>`
    <div class="ac-card">
      <div class="ac-header">
        <strong>${escapeHTML(a.model)}</strong>
        <span>${escapeHTML(a.maker)}</span>
        <span class="ac-badge ${escapeHTML(a.type)}">${escapeHTML(typeLabel[a.type])}</span>
      </div>
      <div class="ac-specs">
        <div class="ac-spec"><div class="ac-spec-label">Charge utile max</div><div class="ac-spec-val">${(a.maxPayload/1000).toFixed(0)} t</div></div>
        <div class="ac-spec"><div class="ac-spec-label">Volume soute</div><div class="ac-spec-val">${a.volume} m³</div></div>
        <div class="ac-spec"><div class="ac-spec-label">Rayon d'action</div><div class="ac-spec-val">${a.range.toLocaleString()} km</div></div>
        <div class="ac-spec"><div class="ac-spec-label">Moteurs</div><div class="ac-spec-val" style="font-size:.75rem">${escapeHTML(a.engines)}</div></div>
        <div class="ac-spec" style="grid-column:1/-1"><div class="ac-spec-label">ULD / Conteneurs</div><div class="ac-spec-val" style="font-size:.75rem">${escapeHTML(a.uld)}</div></div>
        <div class="ac-spec" style="grid-column:1/-1"><div class="ac-spec-label">Remarques</div><div class="ac-spec-val" style="font-size:.75rem;font-weight:400">${escapeHTML(a.notes)}</div></div>
      </div>
    </div>`).join('');
}

/* ── HS Search in EC page ────────────────────────────── */
function ecHsInit(){
  document.addEventListener('click', e=>{
    if(!e.target.closest('.hs-search-wrap')){
      const d = document.getElementById('ec-hsDropdown');
      if(d) d.classList.add('hidden');
    }
  });
}

function ecHSInput(val){
  const q = val.trim().toLowerCase();
  const dropdown = document.getElementById('ec-hsDropdown');
  if(!q || q.length < 2){ dropdown.classList.add('hidden'); return; }
  if(typeof HS_CODES === 'undefined'){ dropdown.innerHTML='<div class="hs-item">Données non chargées.</div>'; dropdown.classList.remove('hidden'); return; }

  let results = [];
  if(/^\d+$/.test(q)){
    results = HS_CODES.filter(c=>c.sh.startsWith(q)).slice(0,25);
  } else if(/[\u0600-\u06FF]/.test(q)||/[\u4E00-\u9FFF]/.test(q)){
    for(const [pattern,chapters] of Object.entries(AI_KEYWORDS||{})){
      if(new RegExp(pattern,'iu').test(q)){
        results = HS_CODES.filter(c=>chapters.split('|').some(ch=>c.sh.startsWith(ch))).slice(0,25);
        break;
      }
    }
  } else {
    const tokens = q.split(/\s+/);
    results = HS_CODES.filter(c=>{ const h=c.sh+' '+c.desc.toLowerCase(); return tokens.every(t=>h.includes(t)); }).slice(0,25);
    if(results.length<3){
      for(const [pattern,chapters] of Object.entries(AI_KEYWORDS||{})){
        if(new RegExp(pattern,'i').test(q)){
          const extra = HS_CODES.filter(c=>chapters.split('|').some(ch=>c.sh.startsWith(ch))).slice(0,15);
          results = [...results,...extra].slice(0,25);
          break;
        }
      }
    }
  }

  if(!results.length){ dropdown.innerHTML='<div class="hs-item"><span>Aucun résultat</span></div>'; dropdown.classList.remove('hidden'); return; }
  dropdown.innerHTML = results.map(r=>`
    <div class="hs-item" onclick="ecSelectHS('${escapeHTML(r.sh)}','${escapeHTML(r.desc)}',${parseFloat(r.di)||0})">
      <strong>${escapeHTML(r.sh)} <span class="hs-rate">${parseFloat(r.di)||0}%</span></strong>
      <span>${escapeHTML(r.desc)}</span>
    </div>`).join('');
  dropdown.classList.remove('hidden');
  const sb = document.querySelector('#ecmod-hscode .ai-search-box');
  if(sb) dropdown.style.top = (sb.offsetHeight+4)+'px';
}

/* ══════════════════════════════════════════════════════════════════
   MODULE CODES SH/HS — Interface style ADIL (douane.gov.ma/adil)
   4 onglets : Tarif & Droits · Documents · Normes · Accords
   ══════════════════════════════════════════════════════════════════ */

function ecSelectHS(code, desc, di) {
  // Ferme le dropdown
  document.getElementById('ec-hsDropdown').classList.add('hidden');
  document.getElementById('ec-hsSearchInput').value = '';

  // En-tête
  document.getElementById('ec-hs-code').textContent = code;
  document.getElementById('ec-hs-desc').textContent = desc;

  // Récupère les données depuis maroc-authorizations.js
  const tarif    = (typeof getTarifBase   === 'function') ? getTarifBase(code)    : null;
  const allAuths = (typeof getAuthorizations === 'function') ? getAuthorizations(code) : [];

  // Sépare Documents requis vs Normes (IMANOR)
  const normeAuthorities = ['IMANOR','ONSSA','MIN. EMPLOI','IMANOR / MIN. EMPLOI'];
  const docs   = allAuths.filter(a => !normeAuthorities.some(n => a.authority.includes(n.split('/')[0].trim())));
  const normes = allAuths.filter(a =>  normeAuthorities.some(n => a.authority.includes(n.split('/')[0].trim())));

  // Badges compteurs
  document.getElementById('adil-badge-docs').textContent   = docs.length   || '✓';
  document.getElementById('adil-badge-normes').textContent = normes.length  || '✓';
  document.getElementById('adil-badge-docs').style.background   = docs.some(d=>d.badge==='danger') ? '#dc3545' : docs.length ? '#fd7e14' : '#28a745';
  document.getElementById('adil-badge-normes').style.background = normes.length ? '#0dcaf0' : '#28a745';

  // Affiche le panneau & revient sur onglet Tarif
  document.getElementById('ec-hs-panel').style.display = 'block';
  adilSwitchTab('tarif');

  // ── Onglet Tarif ──────────────────────────────────────────────
  const diVal  = tarif ? tarif.di  : di;
  const tpiVal = tarif ? tarif.tpi : 0;
  const tvaVal = tarif ? tarif.tva : 20;
  const fds    = tarif ? tarif.fds : false;
  const tvaBase = 100 + diVal + tpiVal + (fds ? 0.25 : 0);

  document.getElementById('adil-tarif-grid').innerHTML = `
    <div class="adil-tariff-card adil-tc-blue">
      <div class="adil-tc-label"><i class="fa-solid fa-percent"></i> Droit d'Importation (DI)</div>
      <div class="adil-tc-value">${diVal}%</div>
      <div class="adil-tc-note">Taux de base — tarif NPF</div>
    </div>
    <div class="adil-tariff-card adil-tc-orange">
      <div class="adil-tc-label"><i class="fa-solid fa-receipt"></i> Taxe Parafiscale (TPI)</div>
      <div class="adil-tc-value">${tpiVal}%</div>
      <div class="adil-tc-note">Taxe parafiscale à l'importation</div>
    </div>
    <div class="adil-tariff-card adil-tc-purple">
      <div class="adil-tc-label"><i class="fa-solid fa-building-columns"></i> TVA</div>
      <div class="adil-tc-value">${tvaVal}%</div>
      <div class="adil-tc-note">Appliquée sur (CIF + DI + TPI${fds ? ' + FDS' : ''})</div>
    </div>
    <div class="adil-tariff-card ${fds ? 'adil-tc-red' : 'adil-tc-green'}">
      <div class="adil-tc-label"><i class="fa-solid fa-flask"></i> Redevance FDS</div>
      <div class="adil-tc-value">${fds ? '0,25%' : 'N/A'}</div>
      <div class="adil-tc-note">${fds ? 'Fonds de Développement et de Sauvegarde' : 'Non applicable à ce chapitre'}</div>
    </div>
    <div class="adil-tariff-card adil-tc-dark" style="grid-column:1/-1">
      <div class="adil-tc-label"><i class="fa-solid fa-sigma"></i> Charge fiscale totale estimée</div>
      <div class="adil-tc-value" style="font-size:1.8rem">${(diVal + tpiVal + (tvaVal * tvaBase / 100)).toFixed(1)}%</div>
      <div class="adil-tc-note">sur valeur CIF · DI ${diVal}%${tpiVal > 0 ? ` · TPI ${tpiVal}%` : ''} + TVA ${tvaVal}% sur base ${tvaBase.toFixed(2)} = charge effective${fds ? ' + FDS 0,25%' : ''}</div>
    </div>`;

  document.getElementById('adil-tarif-calc').innerHTML = `
    <div class="adil-calc-box">
      <div class="adil-calc-title"><i class="fa-solid fa-calculator"></i> Simulateur rapide</div>
      <div class="adil-calc-row">
        <label>Valeur CIF (MAD)</label>
        <input type="number" id="adil-cif-input" placeholder="ex: 50 000" min="0" step="100"
          oninput="adilCalcTaxes('${escapeHTML(code)}',${diVal},${tpiVal},${tvaVal},${fds})"/>
      </div>
      <div id="adil-calc-result"></div>
    </div>`;

  // ── Onglet Documents ──────────────────────────────────────────
  let docsHtml = '';
  if (!docs.length) {
    docsHtml = `<div class="adil-ok-row"><i class="fa-solid fa-circle-check"></i> Aucune restriction spéciale détectée — documents douaniers standard suffisent.</div>`;
  }
  // Toujours : documents standard
  docsHtml += `
    <div class="adil-std-docs">
      <div class="adil-std-title"><i class="fa-solid fa-folder-open"></i> Documents douaniers standards (tous imports)</div>
      <div class="adil-std-grid">
        ${['Facture commerciale (originale + copie)','Liste de colisage (Packing List)','Document de transport (B/L, AWB, CMR)','Déclaration unique des marchandises (DUM)','Bon de commande ou contrat commercial'].map(d=>`
          <div class="adil-std-item"><i class="fa-regular fa-file-lines"></i> ${escapeHTML(d)}</div>`).join('')}
      </div>
    </div>`;

  if (docs.length) {
    docsHtml += `<div class="adil-section-sep"><i class="fa-solid fa-triangle-exclamation"></i> Documents spécifiques requis pour ce code SH</div>`;
    docs.forEach(auth => {
      const badgeColors = { danger:'#dc3545', warning:'#fd7e14', info:'#0dcaf0', success:'#28a745' };
      const typeLabels  = { PROHIBE:'🚫 PROHIBÉ', RESTREINT:'⚠️ RESTREINT', CONDITIONNEL:'⚡ CONDITIONNEL', DOCUMENT:'📄 DOCUMENT REQUIS' };
      docsHtml += `
        <div class="adil-doc-card adil-doc-${auth.badge}">
          <div class="adil-doc-head">
            <span class="adil-doc-type-badge" style="background:${badgeColors[auth.badge]||'#6c757d'}">${typeLabels[auth.type]||auth.type}</span>
            <span class="adil-doc-authority">${escapeHTML(auth.authority)}</span>
            ${auth.delay ? `<span class="adil-doc-delay"><i class="fa-regular fa-clock"></i> ~${auth.delay}j</span>` : ''}
          </div>
          <div class="adil-doc-name">${escapeHTML(auth.document)}</div>
          <div class="adil-doc-fullname">${escapeHTML(auth.fullname)}</div>
          <div class="adil-doc-note">${escapeHTML(auth.note)}</div>
          <div class="adil-doc-ref"><i class="fa-solid fa-scale-balanced"></i> ${escapeHTML(auth.reference)}</div>
          <a href="${escapeHTML(auth.url)}" target="_blank" rel="noopener noreferrer" class="adil-doc-link">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Site officiel
          </a>
        </div>`;
    });
  }
  document.getElementById('adil-docs-content').innerHTML = docsHtml;

  // ── Onglet Normes ─────────────────────────────────────────────
  let normesHtml = '';
  if (!normes.length) {
    normesHtml = `<div class="adil-ok-row"><i class="fa-solid fa-circle-check"></i> Aucune norme technique obligatoire spécifique identifiée pour ce code SH.</div>
      <div class="adil-normes-info">
        <i class="fa-solid fa-circle-info"></i>
        Les produits restent soumis aux règles générales de conformité (étiquetage bilingue fr/ar, sécurité produit).
        Consultez <a href="https://www.imanor.gov.ma" target="_blank" rel="noopener noreferrer">IMANOR</a> pour la liste complète des normes NM applicables.
      </div>`;
  } else {
    normesHtml += `<div class="adil-section-sep"><i class="fa-solid fa-certificate"></i> Normes et certifications obligatoires</div>`;
    normes.forEach(nrm => {
      normesHtml += `
        <div class="adil-norme-card">
          <div class="adil-norme-head">
            <span class="adil-norme-logo">${nrm.authority.includes('IMANOR') ? '🏛️' : nrm.authority.includes('ONSSA') ? '🌿' : '✅'}</span>
            <div>
              <div class="adil-norme-authority">${escapeHTML(nrm.authority)}</div>
              <div class="adil-norme-fullname">${escapeHTML(nrm.fullname)}</div>
            </div>
            ${nrm.delay ? `<span class="adil-doc-delay" style="margin-left:auto"><i class="fa-regular fa-clock"></i> ~${nrm.delay}j</span>` : ''}
          </div>
          <div class="adil-norme-title">${escapeHTML(nrm.document)}</div>
          <div class="adil-norme-ref"><i class="fa-solid fa-bookmark"></i> ${escapeHTML(nrm.reference)}</div>
          <div class="adil-doc-note">${escapeHTML(nrm.note)}</div>
          <a href="${escapeHTML(nrm.url)}" target="_blank" rel="noopener noreferrer" class="adil-doc-link">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Site officiel
          </a>
        </div>`;
    });
  }
  document.getElementById('adil-normes-content').innerHTML = normesHtml;

  // ── Onglet Accords & Conventions ───────────────────────────────
  const ACCORDS_PAYS = (typeof MAROC_ACCORDS_PAYS !== 'undefined') ? MAROC_ACCORDS_PAYS : [];
  const drcTpi = tpiVal; // Taux Droit Commun TPI pour ce chapitre (affiché pour les (*))

  let accordsHtml = `
    <div class="adil-accords-intro">
      <i class="fa-solid fa-circle-info"></i>
      Les accords préférentiels s'appliquent selon le <strong>pays d'origine</strong> de la marchandise.
      Présentez le certificat d'origine correspondant pour bénéficier du taux réduit.
      Taux de base (sans accord) : DI&nbsp;${diVal}% · TPI&nbsp;${drcTpi}%
    </div>`;

  if(ACCORDS_PAYS.length){
    accordsHtml += `
    <div class="adil-pays-table-wrap">
      <table class="adil-pays-table">
        <thead>
          <tr>
            <th colspan="2" style="text-align:left;padding-left:16px">Accords</th>
            <th>Liste</th>
            <th>DI<br><small>(en %)</small></th>
            <th>TPI<br><small>(en %)</small></th>
          </tr>
        </thead>
        <tbody>`;
    ACCORDS_PAYS.forEach(p => {
      const tpiDisp = p.tpi === null
        ? `<span class="adil-pays-star" title="Taux du Régime du Droit Commun : ${drcTpi}%">(*)</span>`
        : p.tpi;
      accordsHtml += `
          <tr class="adil-pays-row" title="Certificat requis : ${escapeHTML(p.cert)}">
            <td class="adil-pays-flag">${p.flag}</td>
            <td class="adil-pays-name">${escapeHTML(p.name)}</td>
            <td class="adil-pays-liste">${escapeHTML(p.liste)}</td>
            <td class="adil-pays-di">${p.di}</td>
            <td class="adil-pays-tpi">${tpiDisp}</td>
          </tr>`;
    });
    accordsHtml += `
        </tbody>
      </table>
      <div class="adil-pays-legend"><i class="fa-solid fa-circle-info"></i> (*) Taux du Régime du Droit Commun (${drcTpi}%)</div>
    </div>`;
  }

  // Détail des accords (certificats) — cards compactes
  const ACCORDS = (typeof MAROC_ACCORDS !== 'undefined') ? MAROC_ACCORDS : [];
  if(ACCORDS.length){
    accordsHtml += `<div class="adil-section-sep" style="margin-top:20px"><i class="fa-solid fa-file-signature"></i> Certificats d'origine — détail par accord</div>
    <div class="adil-accords-grid">`;
    ACCORDS.forEach(acc => {
      accordsHtml += `
      <div class="adil-accord-card">
        <div class="adil-accord-head">
          <span class="adil-accord-code">${escapeHTML(acc.code)}</span>
          <div class="adil-accord-name">${escapeHTML(acc.name)}</div>
        </div>
        <div class="adil-accord-body">
          <div class="adil-accord-row">
            <span class="adil-accord-lbl"><i class="fa-solid fa-file-signature"></i> Certificat</span>
            <span class="adil-accord-val">${escapeHTML(acc.document)}</span>
          </div>
          <div class="adil-accord-row">
            <span class="adil-accord-lbl"><i class="fa-solid fa-tags"></i> Réduction</span>
            <span class="adil-accord-val adil-accord-rate">${escapeHTML(acc.reduction)}</span>
          </div>
          <div class="adil-accord-countries">
            ${acc.countries.slice(0,8).map(c=>`<span class="adil-country-pill">${escapeHTML(c)}</span>`).join('')}
            ${acc.countries.length > 8 ? `<span class="adil-country-pill adil-country-more">+${acc.countries.length - 8}</span>` : ''}
          </div>
          <div class="adil-accord-note">${escapeHTML(acc.note)}</div>
        </div>
        <a href="${escapeHTML(acc.url)}" target="_blank" rel="noopener noreferrer" class="adil-doc-link" style="margin:12px 16px 14px">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Détails accord
        </a>
      </div>`;
    });
    accordsHtml += `</div>`;
  }
  document.getElementById('adil-accords-content').innerHTML = accordsHtml;

  // Scroll vers le panneau
  document.getElementById('ec-hs-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Basculer onglet ── */
function adilSwitchTab(tab) {
  ['tarif','docs','normes','accords'].forEach(t => {
    document.getElementById(`adil-${t}-panel`).style.display   = (t === tab) ? 'block' : 'none';
    document.getElementById(`adil-btn-${t}`).classList.toggle('active', t === tab);
  });
}

/* ── Fermer le panneau ── */
function ecHSClose() {
  document.getElementById('ec-hs-panel').style.display = 'none';
  document.getElementById('ec-hsSearchInput').value = '';
}

/* ══════════════════════════════════════════════════════════════════
   MODULE PHOTO → HS CODE (Claude Vision AI)
   Identifie l'article depuis une photo et retourne le code NGP Maroc
   ══════════════════════════════════════════════════════════════════ */

/** Drag-over sur la zone photo */
function hsDragOver(e){
  e.preventDefault();
  document.getElementById('hs-photo-zone').classList.add('hs-photo-drag');
}
/** Drop d'un fichier image */
function hsDrop(e){
  e.preventDefault();
  document.getElementById('hs-photo-zone').classList.remove('hs-photo-drag');
  const file = e.dataTransfer.files[0];
  if(file && file.type.startsWith('image/')) hsPhotoAnalyze(file);
}

/** Analyse une image via Claude Vision → retourne code SH + taux douaniers */
async function hsPhotoAnalyze(file){
  if(!file) return;

  // Vérifier clé API
  const apiKey = typeof ocrGetApiKey === 'function' ? ocrGetApiKey() : '';
  const noteEl = document.getElementById('hs-photo-api-note');
  if(!apiKey || !apiKey.startsWith('sk-ant')){
    if(noteEl) noteEl.style.display = 'flex';
    return;
  }
  if(noteEl) noteEl.style.display = 'none';

  // Afficher preview + spinner
  const resultEl  = document.getElementById('hs-photo-result');
  const statusEl  = document.getElementById('hs-photo-status');
  const infoEl    = document.getElementById('hs-photo-info');
  const previewEl = document.getElementById('hs-photo-preview');

  resultEl.style.display = 'block';
  infoEl.style.display   = 'none';
  statusEl.innerHTML = `<div class="hs-photo-loading"><i class="fa-solid fa-spinner fa-spin"></i><span>Analyse en cours — Claude Vision identifie l'article…</span></div>`;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUrl  = e.target.result;
    const base64   = dataUrl.split(',')[1];
    const mimeType = file.type || 'image/jpeg';

    previewEl.src = dataUrl;

    const prompt = `Tu es un expert en classification douanière marocaine (Nomenclature Générale des Produits / SH — Tarif douanier 2024).
Analyse attentivement cette photo de produit commercial et identifie-le avec précision.

Réponds UNIQUEMENT dans ce format exact (une valeur par ligne, rien d'autre) :
PRODUIT: [description courte et précise du produit en français, ex: "Écouteurs Bluetooth avec traduction simultanée"]
CODE_SH: [code SH marocain à 10 chiffres, ex: 8518300000]
CONFIANCE: [nombre entier de 0 à 100]
RAISON: [explication courte du choix du code, 1-2 phrases max]`;

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
              { type: 'text',  text: prompt }
            ]
          }]
        })
      });

      if(!resp.ok){
        const err = await resp.json().catch(()=>({}));
        throw new Error(err.error?.message || `HTTP ${resp.status}`);
      }
      const data = await resp.json();
      const text = data?.content?.[0]?.text || '';

      // Parser la réponse
      const produit  = (text.match(/PRODUIT:\s*(.+)/i)||[])[1]?.trim() || 'Produit non identifié';
      const codeSH   = (text.match(/CODE_SH:\s*(\d{6,10})/i)||[])[1]?.trim() || null;
      const conf     = parseInt((text.match(/CONFIANCE:\s*(\d+)/i)||[])[1]||'0');
      const raison   = (text.match(/RAISON:\s*(.+)/i)||[])[1]?.trim() || '';

      statusEl.innerHTML = '';

      if(codeSH){
        const tarif = typeof getTarifBase === 'function' ? getTarifBase(codeSH) : null;
        const di    = tarif ? tarif.di    : '—';
        const tpi   = tarif ? (tarif.tpi||0) : '—';
        const tva   = tarif ? tarif.tva   : '—';
        const fds   = tarif ? tarif.fds   : false;
        const confColor = conf >= 80 ? '#16a34a' : conf >= 50 ? '#d97706' : '#dc2626';
        const totalTaxEst = tarif
          ? (di + tpi + (tva * (1 + di/100 + tpi/100) / 100) * 100 + (fds ? 0.25 : 0)).toFixed(1)
          : '—';

        infoEl.innerHTML = `
          <div class="hs-photo-product"><i class="fa-solid fa-box"></i> ${escapeHTML(produit)}</div>

          <div class="hs-photo-code-row">
            <span class="hs-photo-code-badge">${escapeHTML(codeSH)}</span>
            <span class="hs-photo-conf" style="color:${confColor}">
              <i class="fa-solid fa-gauge-high"></i> Confiance : ${conf}%
            </span>
            ${tarif ? `<span class="hs-photo-chapter-note">${escapeHTML(tarif.note||'')}</span>` : ''}
          </div>

          ${raison ? `<div class="hs-photo-reason"><i class="fa-solid fa-circle-info"></i> ${escapeHTML(raison)}</div>` : ''}

          ${tarif ? `
          <div class="hs-photo-rates-grid">
            <div class="hs-photo-rate hs-rate-blue">
              <div class="hs-rate-label">DI</div>
              <div class="hs-rate-value">${di}%</div>
              <div class="hs-rate-sub">Droit Importation</div>
            </div>
            <div class="hs-photo-rate hs-rate-orange">
              <div class="hs-rate-label">TPI</div>
              <div class="hs-rate-value">${tpi}%</div>
              <div class="hs-rate-sub">Taxe Parafiscale</div>
            </div>
            <div class="hs-photo-rate hs-rate-purple">
              <div class="hs-rate-label">TVA</div>
              <div class="hs-rate-value">${tva}%</div>
              <div class="hs-rate-sub">Valeur Ajoutée</div>
            </div>
            ${fds ? `
            <div class="hs-photo-rate hs-rate-red">
              <div class="hs-rate-label">FDS</div>
              <div class="hs-rate-value">0.25%</div>
              <div class="hs-rate-sub">Fonds Sauvegarde</div>
            </div>` : ''}
          </div>

          <div class="hs-photo-cta-row">
            <button class="hs-photo-btn-primary" onclick="ecSelectHS('${escapeHTML(codeSH)}','${escapeHTML(produit)}',${di||0})">
              <i class="fa-solid fa-magnifying-glass-plus"></i> Fiche complète ADIL (Documents · Normes · Accords)
            </button>
            <button class="hs-photo-btn-secondary" onclick="document.getElementById('hs-photo-result').style.display='none';document.getElementById('hs-photo-zone').style.display='block';document.getElementById('hs-photo-input').value=''">
              <i class="fa-solid fa-rotate-left"></i> Nouvelle photo
            </button>
          </div>` : `
          <div class="hs-photo-notarif">
            <i class="fa-solid fa-triangle-exclamation"></i>
            Code SH détecté mais taux non disponibles localement —
            consultez <a href="https://www.douane.gov.ma/adil/" target="_blank" rel="noopener">ADIL douane.gov.ma</a>
          </div>`}
        `;
      } else {
        infoEl.innerHTML = `
          <div class="hs-photo-error-box">
            <i class="fa-solid fa-circle-exclamation"></i>
            <div>
              <strong>Produit non identifié</strong>
              <div>Essayez une photo plus nette, mieux éclairée, ou utilisez la recherche textuelle.</div>
            </div>
          </div>`;
      }
      infoEl.style.display = 'block';

    } catch(err){
      statusEl.innerHTML = `
        <div class="hs-photo-error-box">
          <i class="fa-solid fa-wifi"></i>
          <div><strong>Erreur API</strong><div>${escapeHTML(String(err.message||err))}</div></div>
        </div>`;
    }
  };
  reader.readAsDataURL(file);
}

/* ── Simulateur rapide DI+TVA ── */
function adilCalcTaxes(code, di, tpi, tva, fds) {
  const cifEl = document.getElementById('adil-cif-input');
  const resEl = document.getElementById('adil-calc-result');
  if (!cifEl || !resEl) return;
  const cif = parseFloat(cifEl.value) || 0;
  if (!cif) { resEl.innerHTML = ''; return; }

  const diAmt  = cif * di / 100;
  const tpiAmt = cif * tpi / 100;
  const fdsAmt = fds ? cif * 0.25 / 100 : 0;
  const base   = cif + diAmt + tpiAmt + fdsAmt;
  const tvaAmt = base * tva / 100;
  const total  = cif + diAmt + tpiAmt + fdsAmt + tvaAmt;
  const fmt    = n => n.toLocaleString('fr-MA', { minimumFractionDigits:2, maximumFractionDigits:2 }) + ' MAD';

  resEl.innerHTML = `
    <div class="adil-calc-result">
      <div class="adil-calc-line"><span>Valeur CIF</span><strong>${fmt(cif)}</strong></div>
      <div class="adil-calc-line"><span>DI (${di}%)</span><strong>${fmt(diAmt)}</strong></div>
      ${tpi >= 0 ? `<div class="adil-calc-line"><span>TPI (${tpi}%)</span><strong>${fmt(tpiAmt)}</strong></div>` : ''}
      ${fds ? `<div class="adil-calc-line"><span>FDS (0,25%)</span><strong>${fmt(fdsAmt)}</strong></div>` : ''}
      <div class="adil-calc-line"><span>Base TVA</span><strong>${fmt(base)}</strong></div>
      <div class="adil-calc-line"><span>TVA (${tva}%)</span><strong>${fmt(tvaAmt)}</strong></div>
      <div class="adil-calc-total"><span>Total à acquitter</span><strong>${fmt(total)}</strong></div>
    </div>`;
}

/* ══════════════════════════════════════════════════════════════════
   OCR — FACTURE COMMERCIALE
   Interface identique HSCodeFinder : Incoterm, CIF, fret, assurance,
   accordion articles, DI/TVA/Landed Cost, accords, alertes ANRT/DMP…
   ══════════════════════════════════════════════════════════════════ */

/* Taux de change → MAD (approximatifs 2025) */
const FX_TO_MAD = {
  MAD:1, EUR:10.80, USD:9.95, GBP:12.50, CNY:1.38,
  AED:2.71, SAR:2.65, TRY:0.31, JPY:0.067, CHF:11.20,
  CAD:7.30, DKK:1.45, NOK:0.92, SEK:0.92
};

/* État global OCR */
let ocrData     = {};
let ocrArticles = [];
let ocrDone     = false;

/* ── Incoterm UI ─────────────────────────────────────────────── */
function ocrUpdateHint(){
  // no-op for now (local processing only)
}
function ocrUpdateIncoterm(){
  const inc = document.getElementById('ocr-incoterm').value;
  const fretSection = document.getElementById('ocr-fret-section');
  const formula = document.getElementById('ocr-cif-formula');
  const needsFret = ['FOB','EXW','FCA'].includes(inc);
  if(fretSection) fretSection.style.display = needsFret ? 'block' : 'none';
  const formulaText = {
    CIF: 'CIF = Facture (droits déjà inclus)',
    FOB: 'CIF = Facture + Fret + Assurance',
    EXW: 'CIF = Facture + Transport local + Fret + Assurance',
    DAP: 'CIF = Facture + Fret partiel + Assurance',
    DDP: 'DDP : droits déjà payés par l\'expéditeur',
    FCA: 'CIF = Facture + Fret + Assurance',
    CPT: 'CIF = Facture + Fret (payé par vendeur) + Assurance',
    CFR: 'CIF = Facture + Fret (inclus) + Assurance',
  };
  if(formula) formula.textContent = formulaText[inc] || 'CIF = Facture + Fret + Assurance';
  if(ocrDone) ocrRecalculate();
}
function ocrRecalcIfDone(){ if(ocrDone) ocrRecalculate(); }

/* ── Calcul CIF par article ──────────────────────────────────── */
function ocrCalcCIF(artTotalPrice, totalInvoiceValue, currency){
  const incoterm  = (document.getElementById('ocr-incoterm')||{}).value || 'FOB';
  const fretTotal = parseFloat((document.getElementById('ocr-fret-cost')||{}).value) || 0;
  const insTotal  = parseFloat((document.getElementById('ocr-insurance')||{}).value) || 0;
  const cur       = currency || (document.getElementById('ocr-currency')||{}).value || 'USD';
  const rate      = FX_TO_MAD[cur] || 9.95;

  const priceMAD = artTotalPrice * rate;

  // Proportion de cet article dans la facture totale
  const ratio = totalInvoiceValue > 0 ? artTotalPrice / totalInvoiceValue : 1;

  let cifMAD = priceMAD;
  if(['FOB','EXW','FCA'].includes(incoterm)){
    const fretMAD = fretTotal * rate * ratio;
    const insMAD  = insTotal > 0
      ? insTotal * rate * ratio
      : (priceMAD + fretMAD) * 0.005; // 0.5% auto
    cifMAD = priceMAD + fretMAD + insMAD;
  } else if(incoterm === 'CIF' || incoterm === 'CFR' || incoterm === 'CPT'){
    // CIF déjà inclus dans le prix facture
    const insMAD = insTotal > 0 ? insTotal * rate * ratio : priceMAD * 0.005;
    cifMAD = priceMAD + insMAD;
  } else if(incoterm === 'DAP'){
    // DAP = vendeur paie tout jusqu'à destination → fret 100% inclus
    const fretMAD = fretTotal * rate * ratio;
    const insMAD  = insTotal > 0 ? insTotal * rate * ratio : (priceMAD + fretMAD) * 0.005;
    cifMAD = priceMAD + fretMAD + insMAD;
  } else if(incoterm === 'DDP'){
    cifMAD = priceMAD; // droits déjà payés
  } else {
    const fretMAD = fretTotal * rate * ratio;
    const insMAD  = insTotal > 0 ? insTotal * rate * ratio : (priceMAD + fretMAD) * 0.005;
    cifMAD = priceMAD + fretMAD + insMAD;
  }
  return { cifMAD, priceMAD, rate, incoterm };
}

/* ── Calcul droits & taxes par article ───────────────────────── */
function ocrCalcDuty(hsCode, cifMAD, currency){
  const tarif = typeof getTarifBase === 'function' ? getTarifBase(hsCode) : null;
  if(!tarif) return null;
  const incoterm = (document.getElementById('ocr-incoterm')||{}).value || 'FOB';

  const diRate   = tarif.di / 100;
  const tpiRate  = (tarif.tpi || 0) / 100;
  const diAmount = cifMAD * diRate;
  const tpiAmount= cifMAD * tpiRate;
  const fdsAmount= tarif.fds ? 200 : 0; // MAD

  // TVA sur valeur imposable = CIF + DI + TPI + FDS
  const tvaBase   = cifMAD + diAmount + tpiAmount + fdsAmount;
  const tvaAmount = tvaBase * (tarif.tva / 100);

  // Frais de recouvrement (6% des droits et taxes)
  const recouv    = (diAmount + tpiAmount + fdsAmount + tvaAmount) * 0.06;
  const totalTaxes= diAmount + tpiAmount + fdsAmount + tvaAmount + recouv;
  const landedCost= cifMAD + totalTaxes;

  // Accord commercial (si pays d'origine connu)
  let accordInfo = null;
  if(typeof getAccord === 'function'){
    // will be filled per article below
  }

  return {
    diRate:     tarif.di,
    tpiRate:    tarif.tpi || 0,
    tvaRate:    tarif.tva,
    diAmount:   Math.round(diAmount * 100)/100,
    tpiAmount:  Math.round(tpiAmount * 100)/100,
    fdsAmount,
    tvaAmount:  Math.round(tvaAmount * 100)/100,
    recouv:     Math.round(recouv * 100)/100,
    totalTaxes: Math.round(totalTaxes * 100)/100,
    landedCost: Math.round(landedCost * 100)/100,
    cifMAD:     Math.round(cifMAD * 100)/100,
    fdsApplicable: tarif.fds,
    note:       tarif.note,
  };
}

/* ── Classification HS depuis la base locale ─────────────────── */
/* ── Dictionnaire anglais/chinois → code SH (pour factures importées) ── */
const OCR_EN_KEYWORDS = [
  // Audio
  [/earphone|earbud|earpiece|tws|headphone|headset|casque\s*audio|écouteur|inear|in-ear|bluetooth\s*audio|wireless\s*audio|translation\s*ear/i, '851830'],
  [/speaker|enceinte|haut.parleur|soundbar|subwoofer/i, '851840'],
  [/microphone|micro\b/i, '851810'],
  // Téléphonie & mobile
  [/smartphone|mobile\s*phone|cellphone|téléphone\s*portable|iphone|android\s*phone/i, '851712'],
  [/phone\s*case|coque\s*téléphone|phone\s*cover/i, '392690'],
  [/charger|chargeur|power\s*adapter|adaptateur/i, '850440'],
  [/power\s*bank|batterie\s*externe|portable\s*battery/i, '850720'],
  [/cable|câble|usb\s*cable|charging\s*cable/i, '854430'],
  // Informatique
  [/laptop|notebook|ordinateur\s*portable/i, '847130'],
  [/tablet|tablette\s*numérique/i, '847190'],
  [/keyboard|clavier/i, '847330'],
  [/mouse|souris\s*informatique/i, '847160'],
  [/hard\s*disk|ssd|disque\s*dur/i, '847170'],
  [/monitor|écran\s*pc/i, '852852'],
  [/printer|imprimante/i, '844351'],
  [/router|modem|wifi\s*router/i, '851762'],
  // Textile & vêtements
  [/t.?shirt|polo|tee.shirt/i, '610910'],
  [/jeans|denim\s*trouser/i, '620342'],
  [/jacket|veste|blouson/i, '620190'],
  [/shoes|sneakers|chaussures/i, '640299'],
  [/socks|chaussettes/i, '611592'],
  [/underwear|sous.vêtement/i, '620711'],
  // Jouets & sport
  [/toy|jouet/i, '950390'],
  [/bicycle|vélo|bike\b/i, '871200'],
  [/scooter\s*electr|trottinette/i, '871160'],
  // Beauté & cosmétique
  [/lipstick|rouge\s*à\s*lèvres/i, '330410'],
  [/perfume|parfum/i, '330300'],
  [/shampoo|shampooing/i, '330510'],
  [/cream|crème\s*soin/i, '330499'],
  // Alimentaire
  [/olive\s*oil|huile\s*d.olive/i, '150910'],
  [/argan\s*oil|huile\s*d.argan/i, '151590'],
  [/date\s*palm|datte/i, '080410'],
  // Maison
  [/carpet|tapis/i, '570110'],
  [/ceramic\s*tile|carrelage/i, '690721'],
  [/led\s*lamp|led\s*light|ampoule\s*led/i, '940540'],
  // Médical
  [/mask|masque\s*chirurgical|face\s*mask/i, '630790'],
  [/glove|gant\s*médical/i, '401511'],
  // Véhicules & pièces
  [/car\s*part|auto\s*part|spare\s*part\s*auto|pièce\s*automobile/i, '870899'],
  [/tire|tyre|pneu\b/i, '401110'],
  // Autres électroniques
  [/smartwatch|montre\s*connect|smart\s*watch/i, '910219'],
  [/drone\b|quadcopter/i, '880211'],
  [/camera|appareil\s*photo|webcam/i, '852580'],
  [/led\s*strip|ruban\s*led/i, '854140'],
  [/electric\s*kettle|bouilloire/i, '851610'],
  [/air\s*fryer|friteuse\s*sans/i, '851640'],
  [/solar\s*panel|panneau\s*solaire/i, '854140'],
  [/watch|montre\b(?!\s*connect)/i, '910211'],
];

/* ══════════════════════════════════════════════════════
   MOTEUR IA MULTILINGUE — Claude API
   ══════════════════════════════════════════════════════ */

/** Récupère la clé API depuis localStorage */
function ocrGetApiKey(){
  try { return localStorage.getItem('gpe_claude_api_key') || ''; } catch(e){ return ''; }
}

/** Enregistre la clé API dans localStorage et met à jour l'UI */
function ocrSaveApiKey(){
  const input = document.getElementById('ocr-api-key-input');
  if(!input) return;
  const key = (input.value || '').trim();
  try { localStorage.setItem('gpe_claude_api_key', key); } catch(e){}
  const statusEl = document.getElementById('ocr-ai-key-status');
  const dotEl    = document.getElementById('ocr-ai-status-dot');
  if(key && key.startsWith('sk-ant')){
    if(statusEl){ statusEl.textContent = '✓ Clé enregistrée'; statusEl.className = 'ocr-ai-key-status ok'; }
    if(dotEl){ dotEl.className = 'ocr-ai-dot ocr-ai-dot-on'; dotEl.title = 'IA active'; }
  } else if(key){
    if(statusEl){ statusEl.textContent = '⚠ Format invalide (doit commencer par sk-ant)'; statusEl.className = 'ocr-ai-key-status err'; }
    if(dotEl){ dotEl.className = 'ocr-ai-dot ocr-ai-dot-off'; dotEl.title = 'Clé invalide'; }
  } else {
    if(statusEl){ statusEl.textContent = 'Clé supprimée'; statusEl.className = 'ocr-ai-key-status'; }
    if(dotEl){ dotEl.className = 'ocr-ai-dot ocr-ai-dot-off'; dotEl.title = 'IA non configurée'; }
  }
}

/** Réaction instantanée lors de la saisie de la clé */
function ocrApiKeyChanged(){
  const statusEl = document.getElementById('ocr-ai-key-status');
  if(statusEl){ statusEl.textContent = ''; }
}

/** Ouvre/ferme le panneau IA */
function ocrToggleAiPanel(){
  const body    = document.getElementById('ocr-ai-body');
  const chevron = document.getElementById('ocr-ai-chevron');
  if(!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  if(chevron) chevron.style.transform = open ? '' : 'rotate(180deg)';
}

/** Initialise le panneau IA au chargement (restaure la clé) */
function ocrInitAiPanel(){
  const key    = ocrGetApiKey();
  const input  = document.getElementById('ocr-api-key-input');
  const dotEl  = document.getElementById('ocr-ai-status-dot');
  const status = document.getElementById('ocr-ai-key-status');
  if(input && key) input.value = key;
  if(key && key.startsWith('sk-ant')){
    if(dotEl)  { dotEl.className  = 'ocr-ai-dot ocr-ai-dot-on'; dotEl.title = 'IA active'; }
    if(status) { status.textContent = '✓ Clé configurée'; status.className = 'ocr-ai-key-status ok'; }
  }
}

/**
 * Appelle Claude Haiku pour classer un produit multilingue en code NGP marocain.
 * Retourne {code, confidence, method, desc} ou null si échec.
 */
async function aiClassifyHSWithClaude(description){
  const apiKey = ocrGetApiKey();
  if(!apiKey || !apiKey.startsWith('sk-ant')) return null;
  if(!(document.getElementById('ocr-ai-enabled')?.checked !== false)) return null;

  // Cache sessionStorage pour éviter les appels répétés
  const cacheKey = 'hs_ai_' + description.substring(0,80).toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_\u4e00-\u9fff\u0600-\u06ff]/g,'');
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if(cached) return JSON.parse(cached);
  } catch(e){}

  // Construire liste des 30 premiers chapitres SH pertinents depuis HS_CODES
  let contextCodes = '';
  if(typeof HS_CODES !== 'undefined'){
    const q = description.toLowerCase();
    const scored = HS_CODES
      .map(c => {
        const d = (c.desc||'').toLowerCase();
        const score = q.split(/\s+/).filter(t=>t.length>2 && d.includes(t)).length;
        return { sh: c.sh, desc: c.desc, score };
      })
      .filter(c => c.score > 0)
      .sort((a,b) => b.score - a.score)
      .slice(0, 20);
    contextCodes = scored.length
      ? '\nCodes ADIL candidats:\n' + scored.map(c=>`${c.sh} — ${c.desc}`).join('\n')
      : '';
  }

  const prompt =
`Tu es un expert en nomenclature douanière marocaine NGP/SH (système harmonisé).
Le produit décrit peut être en anglais, arabe, français ou chinois.
Produit: "${description}"${contextCodes}

Identifie le code NGP marocain à 10 chiffres le plus précis et sa désignation officielle en français.
Réponds UNIQUEMENT au format (une seule ligne, rien d'autre):
CODE_10_CHIFFRES|DÉSIGNATION_FRANÇAISE_COURTE
Exemple: 8518300000|Écouteurs et casques d'écoute`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-20240307',
        max_tokens: 60,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if(!resp.ok) throw new Error('API ' + resp.status);
    const data = await resp.json();
    const text = (data.content?.[0]?.text || '').trim();
    const parts = text.split('|');
    const code  = (parts[0]||'').replace(/\D/g,'').substring(0,10);
    const desc  = (parts[1]||'').trim();
    if(code.length >= 6){
      const result = { code, confidence: 92, method: 'AI_CLAUDE', desc };
      try { sessionStorage.setItem(cacheKey, JSON.stringify(result)); } catch(e){}
      return result;
    }
    return null;
  } catch(err){
    console.warn('[IA-NGP] Erreur Claude:', err.message);
    return null;
  }
}

/**
 * Enrichit progressivement les articles dont le code NGP n'a pas été trouvé.
 * Met à jour l'UI article par article sans bloquer le rendu initial.
 */
async function ocrEnrichWithAI(articles){
  const apiKey = ocrGetApiKey();
  if(!apiKey || !apiKey.startsWith('sk-ant')) return;
  if(!(document.getElementById('ocr-ai-enabled')?.checked !== false)) return;

  // Mettre le dot en mode busy
  const dotEl = document.getElementById('ocr-ai-status-dot');
  if(dotEl) dotEl.className = 'ocr-ai-dot ocr-ai-dot-busy';

  let enriched = 0;
  for(let idx = 0; idx < articles.length; idx++){
    const a = articles[idx];
    // Enrichir si : code non trouvé OU confiance faible (< 80) et méthode non DECLARED
    if(a.classification_method === 'DECLARED') continue;
    if(a.ngp_code_maroc && a.classification_confidence >= 80) continue;

    // Indiquer "en cours" sur la carte
    const card = document.getElementById('art-card-' + idx);
    if(card){
      const ngpEl = card.querySelector('.ocr2-ngp-code');
      if(ngpEl) ngpEl.innerHTML = '<span class="ocr-ai-enriching"><i class="fa-solid fa-microchip"></i> IA…</span>';
    }

    const result = await aiClassifyHSWithClaude(a.description);

    if(result && result.code){
      // Mettre à jour l'objet article
      a.ngp_code_maroc = result.code;
      a.classification_confidence = result.confidence;
      a.classification_method = result.method;
      a.clf_desc = result.desc || a.clf_desc;

      // Recalculer les droits si possible
      const calcDuties = document.getElementById('ocr-calc-duties')?.checked !== false;
      if(calcDuties && typeof ocrCalcCIF === 'function' && typeof ocrCalcDuty === 'function'){
        const cif = ocrCalcCIF(a._rawPrice || 0, articles.reduce((s,x)=>s+(x._rawPrice||0),0)||1, a.currency||'USD');
        const duty = ocrCalcDuty(result.code, cif.cifMAD, a.currency||'USD');
        const accord = typeof getAccord === 'function' ? getAccord(a.origin_country) : null;
        a.duty_calc = duty ? { ...duty, accord } : null;
      }
      if(typeof getAuthorizations === 'function'){
        a.authorizations = getAuthorizations(result.code);
      }

      // Re-rendre la carte article dans le DOM
      if(card) card.outerHTML = ocrRenderArticleRow(a, idx);
      enriched++;
    } else {
      // Marquer "non trouvé par IA"
      if(card){
        const ngpEl = card.querySelector('.ocr2-ngp-code');
        if(ngpEl) ngpEl.innerHTML = '<span class="ocr-ai-fail"><i class="fa-solid fa-xmark"></i> Non trouvé</span>';
      }
    }

    // Petite pause pour ne pas saturer l'API
    await new Promise(r => setTimeout(r, 300));
  }

  // Mettre à jour le résumé taxes si des articles ont été enrichis
  if(enriched > 0 && typeof ocrRenderResults === 'function'){
    // Re-rendre uniquement le résumé taxes
    const totalTaxes  = articles.reduce((s,a2)=>s+((a2.duty_calc||{}).totalTaxes||0),0);
    const totalLanded = articles.reduce((s,a2)=>s+((a2.duty_calc||{}).landedCost||0),0);
    const totalCIF    = articles.reduce((s,a2)=>s+((a2.duty_calc||{}).cifMAD||0),0);
    const hasDuty     = articles.some(a2=>a2.duty_calc);
    const summaryGrid = document.getElementById('ocr-summary-grid');
    if(hasDuty && summaryGrid){
      summaryGrid.innerHTML = [
        {label:'Valeur CIF totale (MAD)',  value:totalCIF.toFixed(2)+' MAD',    cls:'ocr2-sum-blue'},
        {label:'Taxes totales estimées',   value:totalTaxes.toFixed(2)+' MAD',  cls:'ocr2-sum-orange'},
        {label:'Landed Cost total (MAD)',  value:totalLanded.toFixed(2)+' MAD', cls:'ocr2-sum-green'},
      ].map(c=>`<div class="ocr2-sum-card ${c.cls}">
        <div class="ocr2-sum-label">${c.label}</div>
        <div class="ocr2-sum-value">${c.value}</div>
      </div>`).join('');
      summaryGrid.style.display = 'grid';
    }
  }

  // Dot final
  if(dotEl) dotEl.className = 'ocr-ai-dot ocr-ai-dot-on';
}

/* ── Classification NGP locale ─────────────────────────────── */
function ocrClassifyHS(description, declaredHS){
  if(declaredHS && /^\d{4,10}$/.test(declaredHS.replace(/[\.\-]/g,''))){
    return { code: declaredHS.replace(/[\.\-]/g,''), confidence: 100, method: 'DECLARED' };
  }
  if(typeof HS_CODES === 'undefined') return { code: null, confidence: 0, method: 'NOT_FOUND' };

  const q = (description || '').toLowerCase();

  // ── Priorité 1 : dictionnaire anglais/multilingue intégré ──
  for(const [re, sh] of OCR_EN_KEYWORDS){
    if(re.test(q)){
      // Chercher le code complet à 10 chiffres dans HS_CODES depuis le préfixe 6 chiffres
      const match    = HS_CODES.find(c => c.sh && c.sh.replace(/\D/g,'').startsWith(sh.substring(0,6)));
      const fullCode = match ? match.sh.replace(/\D/g,'') : sh.padEnd(10, '0');
      const desc     = match ? match.desc : sh;
      return { code: fullCode, confidence: 88, method: 'EN_KEYWORDS', desc };
    }
  }

  // ── Priorité 2 : recherche dans descriptions françaises HS_CODES ──
  const tokens = q.split(/\s+/).filter(t => t.length > 3);
  if(tokens.length > 0){
    let best = null, bestScore = 0;
    for(const c of HS_CODES){
      const desc = (c.desc || '').toLowerCase();
      const score = tokens.filter(t => desc.includes(t)).length / tokens.length;
      if(score > bestScore){ bestScore = score; best = c; }
    }
    if(best && bestScore >= 0.35){
      return { code: best.sh, confidence: Math.round(bestScore * 80), method: 'TEXT_SEARCH', desc: best.desc };
    }
  }

  // ── Priorité 3 : AI_KEYWORDS ──
  if(typeof AI_KEYWORDS !== 'undefined'){
    for(const [pattern, chapters] of Object.entries(AI_KEYWORDS)){
      if(new RegExp(pattern, 'iu').test(q)){
        const matches = HS_CODES.filter(c => chapters.split('|').some(ch => c.sh.startsWith(ch)));
        if(matches.length > 0){
          return { code: matches[0].sh, confidence: 60, method: 'AI_KEYWORDS', desc: matches[0].desc };
        }
      }
    }
  }
  return { code: null, confidence: 0, method: 'NOT_FOUND' };
}

/* ── Chargement fichier ─────────────────────────────────────── */
function ocrLoadFile(input){
  const file = input.files[0];
  if(!file) return;
  ocrDone = false;
  document.getElementById('ocr-results').style.display = 'none';

  const lbl  = document.getElementById('ocr-drop-label');
  const sub  = document.getElementById('ocr-drop-sub');
  const prog = document.getElementById('ocr-progress');
  const bar  = document.getElementById('ocr-progress-bar');
  if(lbl) lbl.textContent = 'Analyse en cours via Tesseract OCR…';
  if(sub) sub.textContent = 'Extraction du texte · Classification NGP · Calcul taxes';
  if(prog){ prog.style.display = 'block'; bar.style.width = '5%'; }

  const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if(isPDF){
    // ── PDF : extraction texte directe via PDF.js (toutes les pages) ──
    if(sub) sub.textContent = 'Chargement PDF.js…';

    const arrayBufReader = new FileReader();
    arrayBufReader.onload = async (e) => {
      try {
        // ── 1. Charger PDF.js dynamiquement ──
        if(!window.pdfjsLib){
          await new Promise((res) => {
            // Essai ESM moderne
            import('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js')
              .then(mod => {
                // build UMD : import() réussit mais retourne un module vide ;
                // la vraie lib est dans le global window['pdfjs-dist/build/pdf']
                window.pdfjsLib = (mod && typeof mod.getDocument === 'function')
                  ? mod
                  : (window['pdfjs-dist/build/pdf'] || mod);
                res();
              })
              .catch(() => {
                // Fallback UMD classique
                const s = document.createElement('script');
                s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                s.onload = () => {
                  window.pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
                  res();
                };
                s.onerror = () => res(); // continue même si échec
                document.head.appendChild(s);
              });
          });
        }
        // Configurer le worker
        if(window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions){
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        if(bar) bar.style.width = '20%';
        if(sub) sub.textContent = 'Lecture du PDF…';

        const pdf = await window.pdfjsLib.getDocument({ data: e.target.result }).promise;
        const numPages = Math.min(pdf.numPages, 5); // max 5 pages

        // ── 2. Extraire le texte de toutes les pages ──
        if(bar) bar.style.width = '35%';
        if(sub) sub.textContent = `Extraction texte (${numPages} page${numPages>1?'s':''})…`;

        const allLines = [];
        for(let p = 1; p <= numPages; p++){
          const page    = await pdf.getPage(p);
          const content = await page.getTextContent();
          // Grouper les items par ligne Y (±5px)
          const byY = {};
          content.items.forEach(it => {
            if(!it.str || !it.str.trim()) return;
            if(!it.transform || it.transform.length < 6) return;
            const y = Math.round(it.transform[5] / 5) * 5;
            if(!byY[y]) byY[y] = [];
            byY[y].push(it.str.trim());
          });
          // Trier Y décroissant (haut de page = Y grand en PDF)
          Object.keys(byY).sort((a,b)=>b-a).forEach(y => {
            const line = byY[y].join(' ').replace(/\s+/g,' ').trim();
            if(line) allLines.push(line);
          });
          if(p < numPages) allLines.push(''); // séparateur de page
        }
        const extractedText = allLines.join('\n');

        // ── 3. Afficher preview (rendu page 1) ──
        if(bar) bar.style.width = '60%';
        if(sub) sub.textContent = 'Aperçu PDF…';
        try {
          const page1    = await pdf.getPage(1);
          const viewport = page1.getViewport({ scale: 1.5 });
          const canvas   = document.createElement('canvas');
          canvas.width   = viewport.width;
          canvas.height  = viewport.height;
          await page1.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
          const img = document.getElementById('ocr-preview-img');
          if(img){ img.src = canvas.toDataURL('image/jpeg', 0.8); img.style.display = 'block'; }
        } catch(previewErr){ /* preview non critique */ }

        if(bar) bar.style.width = '80%';
        if(sub) sub.textContent = 'Analyse de la facture…';

        // ── 4. Parser le texte extrait ──
        if(extractedText.trim().length > 20){
          try { ocrParseInvoice(extractedText, file.name); }
          catch(parseErr){
            console.error('Parse error (non-bloquant):', parseErr);
            try { ocrParseInvoice('', file.name); } catch(e2){ /* ignore */ }
          }
        } else {
          // ── 5. Fallback OCR Tesseract si PDF scanné (pas de texte) ──
          if(sub) sub.textContent = 'PDF scanné — OCR en cours…';
          const page1    = await pdf.getPage(1);
          const viewport = page1.getViewport({ scale: 2.5 });
          const canvas   = document.createElement('canvas');
          canvas.width   = viewport.width;
          canvas.height  = viewport.height;
          await page1.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
          const dataUrl  = canvas.toDataURL('image/png');
          if(!window.Tesseract){
            const s = document.createElement('script');
            s.src   = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
            s.onload = () => ocrRun(dataUrl, file);
            document.head.appendChild(s);
          } else {
            ocrRun(dataUrl, file);
          }
          return; // ocrRun appellera ocrParseInvoice
        }

      } catch(err){
        console.error('PDF error:', err);
        if(lbl) lbl.textContent = '⚠️ Impossible de lire ce PDF. Essaie une image JPG/PNG.';
        if(sub) sub.textContent = '';
        if(prog) prog.style.display = 'none';
        return;
      }
      // Restore drop zone
      if(lbl) lbl.textContent = 'Glissez une autre facture pour analyser';
      if(sub) sub.textContent = 'PDF, JPG, PNG — max 15 MB';
      if(bar) bar.style.width = '100%';
      setTimeout(()=>{ const p=document.getElementById('ocr-progress'); if(p) p.style.display='none'; }, 800);
    };
    arrayBufReader.readAsArrayBuffer(file);

  } else {
    // ── Image (JPG / PNG) : traitement direct ──
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.getElementById('ocr-preview-img');
      if(img){ img.src = e.target.result; img.style.display = 'block'; }
      if(!window.Tesseract){
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        s.onload = () => ocrRun(e.target.result, file);
        document.head.appendChild(s);
      } else {
        ocrRun(e.target.result, file);
      }
    };
    reader.readAsDataURL(file);
  }
}

/* ── OCR Engine (Tesseract) ─────────────────────────────────── */
async function ocrRun(dataUrl, file){
  const bar  = document.getElementById('ocr-progress-bar');
  const lbl  = document.getElementById('ocr-drop-label');
  const sub  = document.getElementById('ocr-drop-sub');
  try {
    const { data:{ text } } = await Tesseract.recognize(dataUrl,'fra+eng+ara',{
      logger: m => {
        if(m.status==='recognizing text'){
          const pct = Math.round(m.progress*100);
          if(bar) bar.style.width = pct+'%';
          if(sub) sub.textContent = `Reconnaissance OCR : ${pct}%`;
        } else if(m.status==='loading language traineddata'){
          if(bar) bar.style.width='15%';
          if(sub) sub.textContent = 'Chargement des modèles linguistiques…';
        }
      }
    });
    ocrParseInvoice(text, file.name);
  } catch(err){
    console.error('OCR error:', err);
    ocrParseInvoice('', file.name);
  }
  // Restore drop zone labels
  if(lbl) lbl.textContent = 'Glissez une autre facture pour analyser';
  if(sub) sub.textContent = 'PDF, JPG, PNG — max 15 MB';
  if(bar) bar.style.width = '100%';
  setTimeout(()=>{ const p=document.getElementById('ocr-progress'); if(p) p.style.display='none'; }, 800);
}

/* ── Parse Invoice Text → articles enrichis ─────────────────── */
function ocrParseInvoice(text, filename){
  const pick = (patterns, t) => {
    for(const p of patterns){ const m=t.match(p); if(m&&m[1]) return m[1].trim(); }
    return null;
  };
  const t = text || '';

  // En-tête facture
  const info = {
    supplier:        pick([/(?:from|de|expéditeur|shipper|seller|vendeur)[:\s]+([^\n]{3,60})/i,
                            /(?:company|société|企业)[:\s]+([^\n]{3,60})/i], t),
    invoice_number:  pick([/(?:invoice\s*(?:no|n[o°#]?\.?)|facture\s*n[o°#]?\.?|ref(?:érence)?)[:\s#]*([A-Z0-9\-\/]{3,25})/i,
                            /\b([A-Z]{2,4}[\-\/]\d{4}[\-\/]\d{2,6})\b/], t),
    invoice_date:    pick([/(?:date|issued?)[:\s]*(\d{1,2}[\-\/\.]\d{1,2}[\-\/\.]\d{2,4})/i,
                            /(\d{1,2}[\-\/\.]\d{1,2}[\-\/\.]\d{4})/], t),
    incoterm:        pick([/\b(FOB|CIF|EXW|DAP|DDP|FCA|CPT|CFR|CIP|DAT|DPU|FAS)\b/], t),
    transport_mode:  pick([/\b(AIR(?:FREIGHT)?|SEA|OCEAN|ROAD|TRUCK|COURIER|MULTIMODAL)\b/i], t),
    currency:        pick([/\b(MAD|EUR|USD|GBP|CNY|JPY|AED|SAR|TRY)\b/], t),
    total_value:     pick([/(?:total|montant\s*total|grand\s*total|amount\s*due)[^\d]*([0-9][\d\s,.']{2,18})/i], t),
    origin_country:  pick([/(?:country\s*of\s*origin|pays\s*(?:d')?origine|origin)[:\s]+([A-Za-zÀ-ÿ\s]{2,30})/i], t),
    awb_bl:          pick([/(?:awb|airwaybill|b\/l|bill\s*of\s*lading)[:\s#]*([A-Z0-9\-\/]{6,20})/i], t),
    freight_cost:    pick([
      /(?:freight\s*cost|fret|transport\s*cost|shipping\s*cost|frais\s*(?:de\s*)?(?:fret|transport))[^\d$€£]*[\$€£]?\s*([\d,.']+)/i,
      /(?:freight|fret|transport)[^\d$€£\n]{0,20}[\$€£]\s*([\d,.']+)/i,
    ], t),
  };

  // Sync incoterm trouvé vers le sélecteur UI
  if(info.incoterm){
    const sel = document.getElementById('ocr-incoterm');
    if(sel){ sel.value = info.incoterm; ocrUpdateIncoterm(); }
  }
  if(info.currency){
    const sel = document.getElementById('ocr-currency');
    if(sel) sel.value = info.currency;
  }
  // Auto-remplir le champ fret si détecté dans la facture
  if(info.freight_cost){
    const fv = parseFloat(String(info.freight_cost).replace(/,/g,'').replace(/\s/g,''));
    if(fv > 0){
      const fretInput = document.getElementById('ocr-fret-cost');
      if(fretInput && (!fretInput.value || parseFloat(fretInput.value) === 0)){
        fretInput.value = fv.toFixed(2);
      }
    }
  }

  // Extraire articles
  const currency = info.currency || 'USD';
  const rawArts  = ocrExtractArticles(t, info.origin_country, currency);
  const totalInvoiceValue = rawArts.reduce((s,a)=>s+(a._rawPrice||0),0) || 1;

  // Enrichir chaque article : HS classification + duty calc
  const calcDuties = document.getElementById('ocr-calc-duties')?.checked !== false;
  const articles   = rawArts.map(a => {
    const clf = ocrClassifyHS(a.description, a._rawHS || null);
    const cif = ocrCalcCIF(a._rawPrice || 0, totalInvoiceValue, currency);
    const duty= calcDuties && clf.code ? ocrCalcDuty(clf.code, cif.cifMAD, currency) : null;
    const accord = clf.code && info.origin_country && typeof getAccord==='function'
      ? getAccord(info.origin_country) : null;
    const auths = clf.code && typeof getAuthorizations==='function'
      ? getAuthorizations(clf.code) : [];
    return {
      description:     a.description,
      quantity:        a.quantity,
      unit_price:      a.unitPrice,
      total_price:     a.totalPrice,
      _rawPrice:       a._rawPrice,
      weight_kg:       a.weight,
      origin_country:  a.originCountry || info.origin_country || '—',
      hs_code_declared: a._rawHS || null,
      ngp_code_maroc:  clf.code,
      classification_confidence: clf.confidence,
      classification_method:     clf.method,
      clf_desc:        clf.desc || '',
      duty_calc:       duty ? { ...duty, accord } : null,
      authorizations:  auths,
      currency,
    };
  });

  ocrData     = { filename, info, articles };
  ocrArticles = articles;
  ocrDone     = true;

  // Afficher les résultats (rendu initial local)
  ocrRenderResults(info, articles, filename, currency, totalInvoiceValue);

  // Enrichissement IA en arrière-plan (codes non trouvés ou confiance faible)
  ocrEnrichWithAI(articles);
}

/* ── Extraction articles du texte brut ──────────────────────── */
function ocrExtractArticles(text, globalCountry, currency){
  const lines = text.split('\n').map(l=>l.trim()).filter(l=>l.length>2);
  const arts  = [];
  const hsRe  = /\b(\d{6,10})\b/;
  const wRe   = /(\d[\d,.']*)\s*(?:kg|kgs)/i;

  // Mots-clés à ignorer en début de ligne (champs métadonnées facture)
  const SKIP = /^(total|subtotal|tva|vat|tax|shipping|freight|discount|remise|description|article|qty|quantity|price|amount|date|invoice|facture|from|to|tel|fax|email|page|bank|swift|iban|account|holder|address|contact|consignee|seller|importer|payment|packing|delivery|term|remark|note|product\s*image|product\s*name|unit|incoterm|currency|country|branch|routing|the\s*seller|bank\s*name|bank\s*location|bank\s*code|account\s*type|account\s*number|bank\s*address)/i;

  // Lignes complètes à ignorer (contenu bancaire, adresse, mentions légales)
  const SKIP_LINE = /(account\s*number|bank\s*name|bank\s*location|bank\s*address|swift|bic|iban|holder\s*name|branch\s*number|bank\s*code|tax\s*id|ice\s*:|payment\s*terms?|payment\s*upon|term\s*of\s*payment|packing\s*:|origin\s*&|delivery\s*time|immeuble|lotissement|casablanca|@[\w.-]+\.|0086-|road,|street,|district,|guangdong|zhongcun|hanxing|panyu|hong\s*kong|queen'?s\s*road|the\s*center|floor)/i;

  // ── Stratégie 1 : détecter le tableau produits par son en-tête ──
  // Mots-clés description (au moins 1 requis)
  const DESC_KW = ['product name','product image','désignation','designation',
    'description des marchandises','description','goods','commodity','item description',
    'item name','article','libellé','marchandise','model','specification','spec',
    'part no','reference','nature','détail','name of goods','goods name','item'];
  const QTY_KW  = ['quant','quantity','qty','price','unit price','unit cost','montant',
    'amount','total','prix','pcs','pieces','pièces','nbr','nbre','units',
    'u/p','fob price','unit fob','ctns','carton'];

  let tableStart = -1;
  for(let i=0; i<lines.length; i++){
    const l = lines[i].toLowerCase();
    const hasDesc = DESC_KW.some(k => l.includes(k));
    const hasQty  = QTY_KW.some(k  => l.includes(k));
    if(hasDesc && hasQty){ tableStart = i + 1; break; }
    // En-tête multi-lignes : fenêtre élargie à 6 lignes
    if(hasDesc && i < lines.length - 6){
      let last = -1;
      for(let j=i+1; j<=Math.min(i+6,lines.length-1); j++){
        if(QTY_KW.some(k=>lines[j].toLowerCase().includes(k))) last=j;
      }
      if(last !== -1){ tableStart = last + 1; break; }
    }
    if(/^\s*(no\.?|s\/n|item\s*no\.?|seq\.?|#)\s*$/i.test(lines[i]) && i < lines.length - 1){
      const next = lines[i+1].toLowerCase();
      if(DESC_KW.some(k=>next.includes(k)) || QTY_KW.some(k=>next.includes(k))){
        tableStart = i + 2; break;
      }
    }
  }

  if(tableStart !== -1){
    let pendingNumV = [], pendingHS = null, pendingWg = null;
    // firstNumV : PREMIER groupe de chiffres valide vu dans le tableau (≥2 chiffres)
    // Fallback quand pendingNumV a été écrasé par des sous-totaux avant la description produit
    let firstNumV = null, firstHS = null, firstWg = null;

    const pushArt = (desc, numV, hs, wg) => {
      const qty    = numV.find(v => Number.isInteger(v) || Math.abs(v - Math.round(v)) < 0.01);
      const qtyIdx = qty != null ? numV.indexOf(qty) : 0;
      const prices = numV.slice(qtyIdx + 1);
      arts.push({
        description:   desc.substring(0, 120),
        quantity:      qty!=null ? String(qty) : (numV[0]!=null ? String(numV[0]) : '—'),
        unitPrice:     prices[0]!=null ? prices[0].toFixed(2)+' '+currency : '—',
        totalPrice:    prices[1]!=null ? prices[1].toFixed(2)+' '+currency : (prices[0]!=null ? prices[0].toFixed(2)+' '+currency : '—'),
        _rawPrice:     prices[1]!=null ? prices[1] : (prices[0]!=null ? prices[0] : 0),
        weight:        wg ? wg+' kg' : '—',
        _rawHS:        hs,
        originCountry: globalCountry || '—',
      });
    };

    for(let i=tableStart; i<lines.length; i++){
      const line = lines[i];
      // Arrêter si des articles ont déjà été trouvés ET on atteint le pied de tableau
      if(arts.length > 0 && /^(total|subtotal|freight|grand\s*total|remarks?|notes?|term|bank\s*info)/i.test(line)) break;
      if(SKIP_LINE.test(line)) continue;
      if(line.length < 4) continue;

      const lineClean = line.replace(/^\s*\d{1,3}\.?\s+/, '');

      // Regex description : premier char = lettre OU chiffre-lettre (4G, 802.11ac…)
      const descM = lineClean.match(/^([A-Za-zÀ-ÿ\u4E00-\u9FFF\u0600-\u06FF\d][A-Za-zÀ-ÿ\u4E00-\u9FFF\u0600-\u06FF0-9\s\-\/,\.&%°\+\(\)]{3,120}?)(?=\s+[\d,.']+|\s*$)/);

      if(descM){
        const rawDesc = descM[1].trim().replace(/\s+/g,' ').replace(/\$\s*/g,'');
        const desc    = rawDesc.replace(/^\d{1,3}\.?\s+/, '').trim();
        const hasLetter = /[A-Za-zÀ-ÿ\u4E00-\u9FFF\u0600-\u06FF]/.test(desc);

        // Filtrer les noms de société AVANT toute consommation de firstNumV/pendingNumV
        // (ltd, corp, inc, gmbh… ne figurent jamais dans un nom de produit)
        if(/\b(ltd\.?|limited|corp\.?|inc\.|gmbh|sarl|sas|llc)\b/i.test(desc) ||
           /\bco\.?,?\s*ltd\.?\b/i.test(desc)) continue;

        if(!hasLetter || desc.length < 4 || SKIP.test(desc)){
          const nf = (lineClean.match(/[\d,.']+/g)||[]).map(n=>parseFloat(n.replace(/,/g,''))).filter(v=>v>0&&v<1e9);
          if(nf.length){
            pendingNumV=nf; pendingHS=(line.match(hsRe)||[])[1]||null; pendingWg=(line.match(wRe)||[])[1]||null;
            // Mémoriser aussi depuis ce chemin (lignes chiffres qui matchent descM par le 1er char digit)
            if(!firstNumV && nf.length >= 2){ firstNumV=nf; firstHS=pendingHS; firstWg=pendingWg; }
            // Cas "chiffres + description sur la même ligne" : ex. "3000 4 $12,000 4G MIFI-M10"
            // Chercher un segment avec lettre en fin de ligne (après les chiffres)
            const trailingM = lineClean.match(/(?:^|\s)((?:\d*[A-Za-z\u4E00-\u9FFF][A-Za-z0-9\u4E00-\u9FFF\s\-\/,\.&%°\+\(\)]{1,100}))$/);
            if(trailingM){
              const td = trailingM[1].trim().replace(/\s+/g,' ');
              const tdOk = td.length >= 3 && td.length <= 120
                && /[A-Za-z\u4E00-\u9FFF]/.test(td)
                && !SKIP.test(td)
                && !/^(total|subtotal|freight|fob|cif|dap|ddp|price|amount|cost|packing|term|bank|payment|origin|destination|delivery)/i.test(td)
                && !/\b(ltd\.?|limited|corp\.?|inc\.|gmbh|sarl|sas|llc)\b/i.test(td);
              if(tdOk){
                const hs3=(line.match(hsRe)||[])[1]||null, wg3=(line.match(wRe)||[])[1]||null;
                pushArt(td, nf, hs3, wg3);
                pendingNumV=[]; pendingHS=null; pendingWg=null;
              }
            }
          }
          continue;
        }

        // Chiffres depuis cette ligne ou depuis les lignes précédentes/suivantes
        const afterDesc = line.slice(line.indexOf(lineClean) + descM[0].length);
        let numV = [], useHS = null, useWg = null;

        if(/\d/.test(afterDesc)){
          numV = (afterDesc.match(/[\d,.']+/g)||[]).map(n=>parseFloat(n.replace(/,/g,''))).filter(v=>v>0&&v<1e9);
        } else if(pendingNumV.length >= 2){
          // Ligne de chiffres précédente avec ≥2 valeurs (probable ligne produit)
          numV=pendingNumV; useHS=pendingHS; useWg=pendingWg;
          pendingNumV=[]; pendingHS=null; pendingWg=null;
        } else if(firstNumV){
          // Fallback : premier groupe de chiffres valide vu dans le tableau
          // (cas PDF où la desc apparaît loin après les chiffres produit)
          numV=firstNumV; useHS=firstHS; useWg=firstWg;
          firstNumV=null;
        } else if(pendingNumV.length){
          numV=pendingNumV; useHS=pendingHS; useWg=pendingWg;
          pendingNumV=[]; pendingHS=null; pendingWg=null;
        } else {
          // Lookahead : 3 lignes suivantes
          for(let j=i+1; j<=Math.min(i+3,lines.length-1); j++){
            if(/[A-Za-z\u4E00-\u9FFF]{5,}/.test(lines[j])) break;
            if(/\d/.test(lines[j])){
              numV=(lines[j].match(/[\d,.']+/g)||[]).map(n=>parseFloat(n.replace(/,/g,''))).filter(v=>v>0&&v<1e9);
              break;
            }
          }
        }

        const hs = (line.match(hsRe)||[])[1] || useHS || null;
        const wg = (line.match(wRe)||[])[1]  || useWg || null;
        pushArt(desc, numV, hs, wg);
        pendingNumV=[]; pendingHS=null; pendingWg=null;

      } else {
        // Ligne sans description → mémoriser comme groupe de chiffres
        const nf = (lineClean.match(/[\d,.']+/g)||[]).map(n=>parseFloat(n.replace(/,/g,''))).filter(v=>v>0&&v<1e9);
        if(nf.length && !/[A-Za-z\u4E00-\u9FFF]{4,}/.test(lineClean)){
          const hs2=(line.match(hsRe)||[])[1]||null, wg2=(line.match(wRe)||[])[1]||null;
          pendingNumV=nf; pendingHS=hs2; pendingWg=wg2;
          // Mémoriser le PREMIER groupe ≥2 chiffres comme fallback
          if(!firstNumV && nf.length >= 2){ firstNumV=nf; firstHS=hs2; firstWg=wg2; }
        }
      }
    }
  }

  // ── Stratégie 2 : fallback ligne par ligne si tableau non trouvé ──
  if(arts.length === 0){
    // Chercher un bloc de lignes qui ressemblent à des articles
    // (texte + au moins 2 nombres dont l'un plausiblement > 1 = prix)
    for(const line of lines){
      if(SKIP_LINE.test(line)) continue;
      if(line.length < 6 || line.length > 300) continue;
      const nums = line.match(/[\d,.']+/g)||[];
      if(nums.length < 1) continue;
      const numV = nums.map(n=>parseFloat(n.replace(/,/g,''))).filter(v=>v>0&&v<1e8);
      if(numV.length < 1) continue;

      // Extraire la partie texte (description avant les chiffres)
      const lineS2 = line.replace(/^\s*\d{1,3}\.?\s+/, '');
      const descM = lineS2.match(/^([A-Za-zÀ-ÿ\u4E00-\u9FFF\u0600-\u06FF\d][A-Za-zÀ-ÿ\u4E00-\u9FFF\u0600-\u06FF0-9\s\-\/,\.&%°\+\(\)]{3,120}?)(?=\s+[\d,.']+|\s*$)/);
      if(!descM) continue;
      const desc = descM[1].trim().replace(/\s+/g,' ').replace(/^\d{1,3}\.?\s+/,'').substring(0,120);
      if(desc.length < 5 || SKIP.test(desc)) continue;
      if(!/[A-Za-zÀ-ÿ\u4E00-\u9FFF\u0600-\u06FF]/.test(desc)) continue;

      const hs = (line.match(hsRe)||[])[1]||null;
      const wg = (line.match(wRe)||[])[1]||null;

      arts.push({
        description:   desc,
        quantity:      numV[0]!=null ? String(numV[0]) : '—',
        unitPrice:     numV[1]!=null ? numV[1].toFixed(2)+' '+currency : '—',
        totalPrice:    numV[2]!=null ? numV[2].toFixed(2)+' '+currency : (numV[1]!=null ? numV[1].toFixed(2)+' '+currency : '—'),
        _rawPrice:     numV[numV.length-1] || 0,
        weight:        wg ? wg+' kg' : '—',
        _rawHS:        hs,
        originCountry: globalCountry || '—',
      });
    }
  }

  const seen = new Set();
  return arts.filter(a=>{
    const k=a.description.substring(0,18).toLowerCase();
    if(seen.has(k)) return false; seen.add(k); return true;
  }).slice(0,20);
}

/* ── Render résultats style HSCodeFinder ────────────────────── */
/**
 * Construit le tableau détaillé des taux ADIL par article :
 * DI, TPI, TVA, FDS, Recouvrement, Accord préférentiel
 */
function ocrBuildTarifTable(articles, currency){
  const rows = articles.filter(a => a.ngp_code_maroc).map((a, i) => {
    const tarif  = typeof getTarifBase     === 'function' ? getTarifBase(a.ngp_code_maroc)       : null;
    const accord = typeof getAccord        === 'function' ? getAccord(a.origin_country||'—')      : null;
    const auths  = typeof getAuthorizations === 'function' ? getAuthorizations(a.ngp_code_maroc)  : [];
    if(!tarif) return '';

    const di  = parseFloat(tarif.di)||0;
    const tpi = parseFloat(tarif.tpi)||0;
    const tva = parseFloat(tarif.tva)||20;
    const authBadges = auths.map(au => {
      const bc = au.badge==='danger'?'#dc2626':au.badge==='warning'?'#d97706':'#0891b2';
      return `<span style="background:${bc};color:#fff;border-radius:4px;padding:1px 7px;font-size:.68rem;font-weight:700;margin:1px">${escapeHTML(au.type)}</span>`;
    }).join('');

    return `<tr>
      <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:.82rem;font-weight:600">${escapeHTML(a.description.substring(0,45))}${a.description.length>45?'…':''}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-family:monospace;font-size:.8rem;color:#4f46e5">${escapeHTML(a.ngp_code_maroc)}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:.82rem;text-align:center;font-weight:700;color:#16a34a">${di}%</td>
      <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:.82rem;text-align:center">${tpi>0?tpi+'%':'—'}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:.82rem;text-align:center">${tva}%</td>
      <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:.82rem;text-align:center">${tarif.fds?'200 MAD':'—'}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:.78rem">
        ${accord ? `<span style="color:#1d4ed8;font-weight:600"><i class="fa-solid fa-handshake"></i> ${escapeHTML(accord.name)}</span><br><span style="color:#64748b;font-size:.72rem">${escapeHTML(accord.reduction||'')} · Doc: ${escapeHTML(accord.document||'')}</span>` : '<span style="color:#94a3b8">—</span>'}
      </td>
      <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9">${authBadges || '<span style="color:#16a34a;font-size:.78rem">✓ Libre</span>'}</td>
    </tr>`;
  }).filter(r=>r!=='').join('');

  if(!rows) return '';

  return `<div class="ocr2-tarif-table-wrap" style="grid-column:1/-1;margin-top:6px">
    <div style="font-size:.8rem;font-weight:700;color:#374151;margin-bottom:8px;display:flex;align-items:center;gap:6px">
      <i class="fa-solid fa-table" style="color:#4f46e5"></i>
      Taux ADIL par article — Source: Douane Maroc
      <span style="font-size:.72rem;color:#94a3b8;font-weight:400">Recouvrement 6% applicable sur l'ensemble des taxes</span>
    </div>
    <div style="overflow-x:auto;border-radius:8px;border:1px solid #e2e8f0">
      <table style="width:100%;border-collapse:collapse;min-width:700px">
        <thead>
          <tr style="background:#f8fafc">
            <th style="padding:8px 10px;text-align:left;font-size:.75rem;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0">Article</th>
            <th style="padding:8px 10px;text-align:left;font-size:.75rem;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0">Code NGP</th>
            <th style="padding:8px 10px;text-align:center;font-size:.75rem;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0">DI</th>
            <th style="padding:8px 10px;text-align:center;font-size:.75rem;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0">TPI</th>
            <th style="padding:8px 10px;text-align:center;font-size:.75rem;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0">TVA</th>
            <th style="padding:8px 10px;text-align:center;font-size:.75rem;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0">FDS</th>
            <th style="padding:8px 10px;text-align:left;font-size:.75rem;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0">Accord commercial</th>
            <th style="padding:8px 10px;text-align:left;font-size:.75rem;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0">Autorisations</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;
}

/* ── Résultats OCR ───────────────────────────────────────────── */
function ocrRenderResults(info, articles, filename, currency, totalValue){
  // En-tête facture
  const infoGrid = document.getElementById('ocr-info-grid');
  const fields = [
    {label:'Fournisseur',   value:info.supplier},
    {label:'N° Facture',    value:info.invoice_number},
    {label:'Date',          value:info.invoice_date},
    {label:'Incoterm',      value:info.incoterm},
    {label:'Transport',     value:info.transport_mode},
    {label:'Devise',        value:info.currency},
    {label:'Valeur déclarée', value:info.total_value ? info.total_value+' '+(info.currency||'') : null},
    {label:'Origine',       value:info.origin_country},
  ];
  infoGrid.innerHTML = fields.map(f=>`
    <div class="ocr2-info-item">
      <div class="ocr2-info-label">${escapeHTML(f.label)}</div>
      <div class="ocr2-info-value">${f.value ? escapeHTML(f.value) : '<span style="color:#aaa">—</span>'}</div>
    </div>`).join('');

  // ── Résumé droits & taxes ────────────────────────────────────
  const summaryGrid = document.getElementById('ocr-summary-grid');
  if(summaryGrid){
    const hasDutyCalc = articles.some(a => a.duty_calc);
    const hasAnyCode  = articles.some(a => a.ngp_code_maroc);

    if(hasDutyCalc){
      // ── Mode A : calcul CIF complet disponible ──
      const totalTaxes  = articles.reduce((s,a)=>s+((a.duty_calc||{}).totalTaxes||0),0);
      const totalLanded = articles.reduce((s,a)=>s+((a.duty_calc||{}).landedCost||0),0);
      const totalCIF    = articles.reduce((s,a)=>s+((a.duty_calc||{}).cifMAD||0),0);
      summaryGrid.innerHTML = [
        {label:'Valeur CIF (MAD)',       value:totalCIF.toFixed(2)+' MAD',    cls:'ocr2-sum-blue'},
        {label:'Taxes totales (MAD)',    value:totalTaxes.toFixed(2)+' MAD',  cls:'ocr2-sum-orange'},
        {label:'Landed Cost (MAD)',      value:totalLanded.toFixed(2)+' MAD', cls:'ocr2-sum-green'},
      ].map(c=>`<div class="ocr2-sum-card ${c.cls}">
        <div class="ocr2-sum-label">${c.label}</div>
        <div class="ocr2-sum-value">${c.value}</div>
      </div>`).join('') + ocrBuildTarifTable(articles, currency);
      summaryGrid.style.display = 'grid';

    } else if(hasAnyCode){
      // ── Mode B : codes détectés mais pas de calcul CIF (pas de fret saisi) ──
      // On estime à partir de la valeur déclarée en facture
      const cur      = currency || (document.getElementById('ocr-currency')||{}).value || 'USD';
      const rate     = FX_TO_MAD[cur] || 9.95;
      const invTotal = articles.reduce((s,a) => s + (a._rawPrice||0), 0);
      const invMAD   = invTotal * rate;
      // Assurance auto 0.5% + fret 0 (inconnu)
      const insMAD   = invMAD * 0.005;
      const estCIF   = invMAD + insMAD;
      // Calcul estimé agrégé depuis taux ADIL de chaque article
      // Fallback si HS inconnu : TVA 20% minimum (toujours appliquée sur imports)
      const DEFAULT_TARIF = { di: 0, tpi: 0, tva: 20, fds: false };
      let estDI=0, estTPI=0, estTVA=0, estFDS=0;
      articles.forEach(a => {
        const tarif = (typeof getTarifBase === 'function' && a.ngp_code_maroc)
          ? getTarifBase(a.ngp_code_maroc)
          : DEFAULT_TARIF;
        if(!tarif) return;
        const ratio   = invTotal > 0 && a._rawPrice > 0 ? a._rawPrice / invTotal : 1 / articles.length;
        const cifPart = estCIF * ratio;
        const di  = cifPart * (tarif.di  / 100);
        const tpi = cifPart * ((tarif.tpi||0) / 100);
        const fds = tarif.fds ? 200 : 0;
        const tva = (cifPart + di + tpi + fds) * (tarif.tva / 100);
        estDI  += di;
        estTPI += tpi;
        estFDS += fds;
        estTVA += tva;
      });
      const recouv    = (estDI + estTPI + estFDS + estTVA) * 0.06;
      const estTaxes  = estDI + estTPI + estFDS + estTVA + recouv;
      const estLanded = estCIF + estTaxes;
      const note = invTotal > 0
        ? `<div class="ocr2-sum-note"><i class="fa-solid fa-triangle-exclamation"></i> Estimation basée sur valeur facture ${invTotal.toFixed(2)} ${cur} — entrez le fret pour un calcul exact</div>`
        : `<div class="ocr2-sum-note"><i class="fa-solid fa-triangle-exclamation"></i> Valeur facture non extraite — renseignez le fret pour calculer</div>`;
      summaryGrid.innerHTML = [
        {label:'Valeur CIF estimée (MAD)', value: invTotal>0 ? estCIF.toFixed(2)+' MAD' : '—', cls:'ocr2-sum-blue'},
        {label:'Taxes estimées (MAD)',     value: invTotal>0 ? estTaxes.toFixed(2)+' MAD' : '—', cls:'ocr2-sum-orange'},
        {label:'Landed Cost estimé (MAD)', value: invTotal>0 ? estLanded.toFixed(2)+' MAD' : '—', cls:'ocr2-sum-green'},
      ].map(c=>`<div class="ocr2-sum-card ${c.cls}">
        <div class="ocr2-sum-label">${c.label}</div>
        <div class="ocr2-sum-value">${c.value}</div>
      </div>`).join('') + note + ocrBuildTarifTable(articles, currency);
      summaryGrid.style.display = 'grid';

    } else {
      summaryGrid.style.display = 'none';
    }
  }

  // Liste articles (accordion)
  const countEl = document.getElementById('ocr-art-count');
  if(countEl) countEl.textContent = articles.length;
  const artList = document.getElementById('ocr-articles-list');
  if(artList) artList.innerHTML = articles.map((a,i) => ocrRenderArticleRow(a,i)).join('');

  // Autorisations globales
  ocrRenderAuthPanel(articles, info);

  // Afficher la section résultats
  document.getElementById('ocr-results').style.display = 'block';
  setTimeout(()=>document.getElementById('ocr-results').scrollIntoView({behavior:'smooth',block:'start'}),200);
}

/* ── Render article row (accordion) ─────────────────────────── */
function ocrRenderArticleRow(a, idx){
  const code    = a.ngp_code_maroc;
  const noCode  = !code;
  const conf    = a.classification_confidence;
  const status  = noCode ? 'not-found' : (conf >= 80 ? 'found' : 'ai');
  const statusColors = {found:'#16a34a', ai:'#d97706', 'not-found':'#dc2626'};
  const statusLabel  = {found:'DÉCLARÉ/TROUVÉ', ai:'IA', 'not-found':'NON TROUVÉ'};
  const duty    = a.duty_calc;
  const hasDuty = !!duty;

  const borderColor = noCode ? '#fca5a5' : '#e2e8f0';

  return `
  <div class="ocr2-art-card" id="art-card-${idx}" style="border-color:${borderColor}">
    <button class="ocr2-art-header" onclick="ocrToggleArt(${idx})">
      <span class="ocr2-art-num">${idx+1}</span>
      <div class="ocr2-art-main">
        <div class="ocr2-art-desc">${escapeHTML(a.description)}</div>
        <div class="ocr2-art-meta">
          ${a.quantity!=='—' ? `<span>Qté: ${escapeHTML(a.quantity)}</span>` : ''}
          <span>${escapeHTML(a.total_price)}</span>
          ${a.origin_country&&a.origin_country!=='—' ? `<span>Origine: ${escapeHTML(a.origin_country)}</span>` : ''}
        </div>
      </div>
      <div class="ocr2-art-right">
        <span class="ocr2-ngp-code" style="color:${statusColors[status]}">${code ? escapeHTML(code) : 'Non trouvé'}</span>
        ${hasDuty ? `<span class="ocr2-taxes-chip">Taxes: ${duty.totalTaxes.toFixed(2)} MAD</span>` : ''}
        <i class="fa-solid fa-chevron-down ocr2-chevron" id="chevron-${idx}"></i>
      </div>
    </button>
    <div class="ocr2-art-detail" id="art-detail-${idx}" style="display:none">
      <div class="ocr2-art-detail-grid">
        <div>
          <div class="ocr2-dl">Code NGP Maroc</div>
          <div class="ocr2-dv" style="color:${statusColors[status]};font-weight:700">${code ? escapeHTML(code) : '—'}</div>
          <div class="ocr2-dl" style="margin-top:4px">Confiance</div>
          <div class="ocr2-dv">${conf > 0 ? conf+'%' : '—'} <span style="font-size:.72rem;color:#888">(${escapeHTML(a.classification_method||'')})</span></div>
          ${a.clf_desc ? `<div class="ocr2-dl" style="margin-top:4px">Désignation NGP</div><div class="ocr2-dv" style="font-size:.78rem">${escapeHTML(a.clf_desc.substring(0,80))}</div>` : ''}
        </div>
        ${hasDuty ? `
        <div>
          <div class="ocr2-dl">Base CIF (MAD)</div>
          <div class="ocr2-dv">${duty.cifMAD.toFixed(2)} MAD</div>
          <div class="ocr2-dl" style="margin-top:4px">DI (${duty.diRate}%)</div>
          <div class="ocr2-dv">${duty.diAmount.toFixed(2)} MAD</div>
          ${duty.tpiRate > 0 ? `<div class="ocr2-dl" style="margin-top:4px">TPI (${duty.tpiRate}%)</div><div class="ocr2-dv">${duty.tpiAmount.toFixed(2)} MAD</div>` : ''}
          ${duty.fdsApplicable ? `<div class="ocr2-dl" style="margin-top:4px">FDS (env.)</div><div class="ocr2-dv">200.00 MAD</div>` : ''}
        </div>
        <div>
          <div class="ocr2-dl">TVA (${duty.tvaRate}%)</div>
          <div class="ocr2-dv">${duty.tvaAmount.toFixed(2)} MAD</div>
          <div class="ocr2-dl" style="margin-top:4px">Recouvrement (6%)</div>
          <div class="ocr2-dv">${duty.recouv.toFixed(2)} MAD</div>
        </div>
        <div class="ocr2-landed-box">
          <div class="ocr2-dl">Landed Cost</div>
          <div class="ocr2-landed-val">${duty.landedCost.toFixed(2)} MAD</div>
          ${duty.accord ? `<div class="ocr2-accord">✓ ${escapeHTML(duty.accord.name)}</div>` : ''}
        </div>` : (() => {
          // Pas de calcul CIF mais on peut quand même afficher les taux ADIL si le code existe
          const tarif = code && typeof getTarifBase === 'function' ? getTarifBase(code) : null;
          const accord = tarif && a.origin_country && a.origin_country !== '—' && typeof getAccord === 'function' ? getAccord(a.origin_country) : null;
          if(tarif){
            return `
            <div>
              <div class="ocr2-dl">DI Maroc</div>
              <div class="ocr2-dv" style="color:#16a34a;font-weight:700">${parseFloat(tarif.di)||0}%</div>
              ${tarif.tpi>0?`<div class="ocr2-dl" style="margin-top:4px">TPI</div><div class="ocr2-dv">${parseFloat(tarif.tpi)||0}%</div>`:''}
              <div class="ocr2-dl" style="margin-top:4px">TVA</div>
              <div class="ocr2-dv">${parseFloat(tarif.tva)||20}%</div>
              ${tarif.fds?`<div class="ocr2-dl" style="margin-top:4px">FDS</div><div class="ocr2-dv">200 MAD</div>`:''}
              <div class="ocr2-dl" style="margin-top:4px">Recouvrement</div>
              <div class="ocr2-dv">6%</div>
            </div>
            <div class="ocr2-landed-box" style="grid-column:3/-1">
              <div class="ocr2-dl" style="font-size:.75rem;color:#94a3b8">Entrez le fret pour calculer le montant exact</div>
              <div style="font-size:.78rem;color:#64748b;margin-top:4px">${escapeHTML(tarif.note||'')}</div>
              ${accord ? `<div class="ocr2-accord" style="margin-top:8px">✓ Accord : ${escapeHTML(accord.name)} — ${escapeHTML(accord.reduction||'')}</div>` : ''}
            </div>`;
          }
          return `<div class="ocr2-noduty" style="grid-column:2/-1">
            <i class="fa-solid fa-circle-info"></i> ${noCode ? 'Code SH non détecté — calcul de droits impossible' : 'Entrez le coût fret pour calculer les droits (incoterm FOB/EXW)'}
          </div>`;
        })()}
      </div>
      ${duty&&duty.fdsApplicable ? `<div class="ocr2-alert ocr2-alert-warn"><i class="fa-solid fa-circle-exclamation"></i> Soumis à la taxe FDS 004801 (protection de l'environnement)</div>` : ''}
      ${!duty && code && typeof getTarifBase==='function' && getTarifBase(code)?.fds ? `<div class="ocr2-alert ocr2-alert-warn"><i class="fa-solid fa-circle-exclamation"></i> Soumis à la taxe FDS 004801 (protection de l'environnement)</div>` : ''}
      ${(()=>{
        const auths = a.authorizations && a.authorizations.length > 0 ? a.authorizations
          : (code && typeof getAuthorizations==='function' ? getAuthorizations(code) : []);
        return auths.length > 0 ? `
        <div class="ocr2-alert ocr2-alert-info">
          <i class="fa-solid fa-shield-halved"></i>
          <strong>Autorisations requises :</strong>
          ${auths.map(au=>`<span class="ocr2-auth-chip ocr2-auth-${escapeHTML(au.badge)}">${escapeHTML(au.authority)} — ${escapeHTML(au.type)}</span>`).join(' ')}
        </div>` : '';
      })()}
    </div>
  </div>`;
}

function ocrToggleArt(idx){
  const detail  = document.getElementById('art-detail-'+idx);
  const chevron = document.getElementById('chevron-'+idx);
  if(!detail) return;
  const open = detail.style.display !== 'none';
  detail.style.display = open ? 'none' : 'block';
  if(chevron) chevron.style.transform = open ? '' : 'rotate(180deg)';
}

/* ── Auth panel rapide ───────────────────────────────────────── */
function ocrRenderAuthPanel(articles, info){
  const panel = document.getElementById('ocr-auth-panel');
  const body  = document.getElementById('ocr-auth-body');
  if(!panel||!body) return;

  const artList = articles.map(a=>({
    description:   a.description,
    hsCode:        a.ngp_code_maroc || '—',
    originCountry: a.origin_country || '—',
    quantity:      a.quantity,
    unitPrice:     a.unit_price,
  }));

  if(!artList.length && info['HS Code global']){
    artList.push({description:'Article',hsCode:info['HS Code global'],originCountry:info.origin_country||'—',quantity:'—',unitPrice:'—'});
  }

  if(typeof renderAuthPanel === 'function'){
    // Utiliser le rendu complet du module maroc-authorizations.js
    body.innerHTML = renderAuthPanel(artList);
  } else {
    // ── Fallback inline : construit le panneau directement depuis les fonctions ADIL ──
    if(!artList.length){ panel.style.display='none'; return; }
    let html = '';
    artList.forEach((art, i) => {
      const hs     = art.hsCode && art.hsCode !== '—' ? art.hsCode : null;
      const auths  = hs && typeof getAuthorizations === 'function' ? getAuthorizations(hs) : [];
      const tarif  = hs && typeof getTarifBase     === 'function' ? getTarifBase(hs)       : null;
      const accord = art.originCountry !== '—' && typeof getAccord === 'function' ? getAccord(art.originCountry) : null;

      const hasDanger  = auths.some(a=>a.badge==='danger');
      const hasWarning = auths.some(a=>a.badge==='warning');
      const hColor     = hasDanger?'#dc3545':hasWarning?'#fd7e14':auths.length>0?'#0dcaf0':'#28a745';

      html += `<div style="border-radius:10px;border:1px solid #e2e8f0;margin-bottom:14px;overflow:hidden">
        <div style="border-left:4px solid ${hColor};padding:12px 16px;background:#f8fafc;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span style="background:#e2e8f0;border-radius:50%;width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:.82rem">${i+1}</span>
          <strong style="flex:1;font-size:.92rem">${escapeHTML(art.description)}</strong>
          ${hs ? `<span style="background:#1a202c;color:#fff;border-radius:6px;padding:2px 10px;font-size:.78rem;font-family:monospace">${escapeHTML(hs)}</span>` : ''}
          ${art.originCountry!=='—'?`<span style="color:#64748b;font-size:.8rem"><i class="fa-solid fa-globe"></i> ${escapeHTML(art.originCountry)}</span>`:''}
        </div>
        <div style="padding:12px 16px">
          ${auths.length === 0 ? `<div style="color:#16a34a;font-size:.87rem;display:flex;align-items:center;gap:7px"><i class="fa-solid fa-circle-check"></i> Aucune autorisation spéciale — importation libre sous documents standard</div>` : ''}
          ${auths.map(au=>{
            const bc = au.badge==='danger'?'#dc3545':au.badge==='warning'?'#fd7e14':au.badge==='info'?'#0dcaf0':'#6c757d';
            return `<div style="border:1px solid ${bc};border-radius:8px;padding:10px 14px;margin-bottom:8px">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:5px">
                <span style="background:${bc};color:#fff;border-radius:4px;padding:2px 8px;font-size:.72rem;font-weight:700">${escapeHTML(au.type)}</span>
                <strong style="font-size:.87rem">${escapeHTML(au.authority)}</strong>
                <span style="color:#64748b;font-size:.82rem">${escapeHTML(au.document||'')}</span>
                ${au.delay>0?`<span style="color:#94a3b8;font-size:.77rem"><i class="fa-regular fa-clock"></i> ~${parseInt(au.delay)||0} j</span>`:''}
              </div>
              <p style="margin:4px 0;font-size:.83rem;color:#475569">${escapeHTML(au.note||'')}</p>
              <p style="margin:4px 0;font-size:.77rem;color:#94a3b8"><i class="fa-solid fa-scale-balanced"></i> ${escapeHTML(au.reference||'')}</p>
            </div>`;
          }).join('')}
          ${tarif ? `
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 14px;margin-top:8px">
            <div style="font-size:.8rem;font-weight:700;color:#15803d;margin-bottom:8px"><i class="fa-solid fa-percent"></i> Droits &amp; Taxes ADIL — ${escapeHTML(tarif.note||'')}</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px">
              <div style="background:#fff;border-radius:6px;padding:6px 10px;font-size:.8rem"><span style="color:#64748b">DI</span><strong style="float:right">${parseFloat(tarif.di)||0}%</strong></div>
              ${tarif.tpi>0?`<div style="background:#fff;border-radius:6px;padding:6px 10px;font-size:.8rem"><span style="color:#64748b">TPI</span><strong style="float:right">${parseFloat(tarif.tpi)||0}%</strong></div>`:''}
              <div style="background:#fff;border-radius:6px;padding:6px 10px;font-size:.8rem"><span style="color:#64748b">TVA</span><strong style="float:right">${parseFloat(tarif.tva)||20}%</strong></div>
              ${tarif.fds?`<div style="background:#fff;border-radius:6px;padding:6px 10px;font-size:.8rem"><span style="color:#64748b">FDS</span><strong style="float:right">200 MAD</strong></div>`:''}
              <div style="background:#fff;border-radius:6px;padding:6px 10px;font-size:.8rem"><span style="color:#64748b">Recouvrement</span><strong style="float:right">6%</strong></div>
            </div>
            ${accord ? `<div style="margin-top:8px;padding:7px 10px;background:#eff6ff;border-radius:6px;font-size:.8rem;color:#1d4ed8">
              <i class="fa-solid fa-handshake"></i> <strong>Accord préférentiel :</strong> ${escapeHTML(accord.name)} — ${escapeHTML(accord.reduction||'')} — Doc: ${escapeHTML(accord.document||'')}
            </div>` : ''}
          </div>` : ''}
        </div>
      </div>`;
    });
    body.innerHTML = html || '<p style="color:#888">Aucun article à analyser.</p>';
  }
  panel.style.display = artList.length > 0 ? 'block' : 'none';
}

/* ── Recalculer après changement incoterm/fret/assurance ─────── */
function ocrRecalculate(){
  if(!ocrDone || !ocrData.articles) return;
  const currency = ocrData.info?.currency || 'USD';
  const totalValue = ocrData.articles.reduce((s,a)=>s+(a._rawPrice||0),0) || 1;
  const calcDuties = document.getElementById('ocr-calc-duties')?.checked !== false;
  const articles = ocrData.articles.map(a => {
    const cif  = ocrCalcCIF(a._rawPrice||0, totalValue, currency);
    const duty = calcDuties && a.ngp_code_maroc ? ocrCalcDuty(a.ngp_code_maroc, cif.cifMAD, currency) : null;
    const accord = a.ngp_code_maroc && a.origin_country && typeof getAccord==='function'
      ? getAccord(a.origin_country) : null;
    return { ...a, duty_calc: duty ? {...duty, accord} : null };
  });
  ocrArticles = articles;
  ocrData.articles = articles;
  ocrRenderResults(ocrData.info, articles, ocrData.filename, currency, totalValue);
}

/* ── Actions ─────────────────────────────────────────────────── */
function ocrCopyJSON(){
  navigator.clipboard.writeText(JSON.stringify(ocrData, null, 2)).then(()=>{
    const btn = event.currentTarget;
    const orig = btn.innerHTML;
    btn.innerHTML='<i class="fa-solid fa-check"></i> Copié !';
    setTimeout(()=>btn.innerHTML=orig,2000);
  });
}

function ocrExportCSV(){
  const info = ocrData.info || {};
  let lines = ['"Champ","Valeur"'];
  Object.entries(info).forEach(([k,v])=>{ if(v) lines.push(`"${k}","${String(v).replace(/"/g,'""')}"`); });
  lines.push('');
  lines.push('"#","Description","NGP Maroc","Confiance","Qté","Prix Total","CIF (MAD)","DI (MAD)","TVA (MAD)","Taxes Totales (MAD)","Landed Cost (MAD)","Pays Origine"');
  (ocrData.articles||[]).forEach((a,i)=>{
    const d = a.duty_calc||{};
    lines.push([i+1,a.description,a.ngp_code_maroc||'',a.classification_confidence+'%',
      a.quantity,a.total_price,d.cifMAD||'',d.diAmount||'',d.tvaAmount||'',
      d.totalTaxes||'',d.landedCost||'',a.origin_country
    ].map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(','));
  });
  const blob = new Blob(['\uFEFF'+lines.join('\n')],{type:'text/csv;charset=utf-8'});
  const url  = URL.createObjectURL(blob);
  const el   = document.createElement('a');
  el.href=url; el.download='facture-ocr-'+new Date().toISOString().slice(0,10)+'.csv';
  el.click(); URL.revokeObjectURL(url);
}

function ocrAddManualOpen(){
  const p = document.getElementById('ocr-manual-panel');
  if(p) p.style.display = p.style.display==='none' ? 'block' : 'none';
}

function ocrAddManualArticle(){
  const desc   = sanitizeField(document.getElementById('ocr-manual-desc').value, 120);
  const hsRaw  = document.getElementById('ocr-manual-hs').value.trim();
  const pays   = sanitizeField(document.getElementById('ocr-manual-pays').value, 50);
  const price  = parseFloat(document.getElementById('ocr-manual-price').value)||0;
  const currency = (document.getElementById('ocr-currency')||{}).value || 'USD';

  if(!desc && !hsRaw){ alert('Veuillez saisir une description ou un code SH.'); return; }

  const hsClean = /^[\d\.]{2,12}$/.test(hsRaw) ? hsRaw.replace(/\./g,'').substring(0,10) : null;
  if(hsRaw && !hsClean){ alert('Code SH invalide. Utilisez uniquement des chiffres (ex: 8517).'); return; }

  const clf  = ocrClassifyHS(desc, hsClean);
  const totalValue = Math.max((ocrData.articles||[]).reduce((s,a)=>s+(a._rawPrice||0),0),price) || price || 1;
  const cif  = ocrCalcCIF(price, totalValue, currency);
  const duty = clf.code ? ocrCalcDuty(clf.code, cif.cifMAD, currency) : null;
  const auths= clf.code && typeof getAuthorizations==='function' ? getAuthorizations(clf.code) : [];

  const art = {
    description:              desc||'Article manuel',
    quantity:                 '1',
    unit_price:               price.toFixed(2)+' '+currency,
    total_price:              price.toFixed(2)+' '+currency,
    _rawPrice:                price,
    weight_kg:                '—',
    origin_country:           pays||'—',
    hs_code_declared:         hsClean,
    ngp_code_maroc:           clf.code,
    classification_confidence:clf.confidence,
    classification_method:    clf.method,
    clf_desc:                 clf.desc||'',
    duty_calc:                duty ? {...duty, accord:null} : null,
    authorizations:           auths,
    currency,
  };

  if(!ocrData.articles) ocrData.articles = [];
  ocrData.articles.push(art);
  ocrArticles = ocrData.articles;
  ocrDone = true;

  if(!ocrData.info) ocrData.info={};
  document.getElementById('ocr-results').style.display='block';
  const artList = document.getElementById('ocr-articles-list');
  if(artList) artList.innerHTML += ocrRenderArticleRow(art, ocrData.articles.length-1);
  const countEl = document.getElementById('ocr-art-count');
  if(countEl) countEl.textContent = ocrData.articles.length;

  // Reset form
  ['ocr-manual-desc','ocr-manual-hs','ocr-manual-pays','ocr-manual-price'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  ocrRenderAuthPanel(ocrData.articles, ocrData.info||{});
}

function ocrReset(){
  ocrData={};ocrArticles=[];ocrDone=false;
  const res=document.getElementById('ocr-results');
  if(res) res.style.display='none';
  const lbl=document.getElementById('ocr-drop-label');
  const sub=document.getElementById('ocr-drop-sub');
  if(lbl) lbl.textContent='Glissez votre facture commerciale';
  if(sub) sub.textContent='PDF, JPG, PNG — max 15 MB';
  const prog=document.getElementById('ocr-progress');
  if(prog) prog.style.display='none';
  // Reset file input
  const fi=document.getElementById('ocr-file');
  if(fi) fi.value='';
}

/* ── Init on load ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', ecInit);

// Drag & drop on OCR zone
document.addEventListener('DOMContentLoaded', ()=>{
  const zone = document.getElementById('ocr-drop-zone');
  if(zone){
    zone.addEventListener('dragover', e=>{ e.preventDefault(); zone.style.borderColor='var(--teal)'; });
    zone.addEventListener('dragleave', ()=>zone.style.borderColor='');
    zone.addEventListener('drop', e=>{ e.preventDefault(); zone.style.borderColor=''; const f=e.dataTransfer.files[0]; if(f){ const fi=document.getElementById('ocr-file'); const dt=new DataTransfer(); dt.items.add(f); fi.files=dt.files; ocrLoadFile(fi); } });
  }
});

/* ══════════════════════════════════════════════════════════
   SIMULATEUR TARIFS EXPRESS — DHL / FedEx / Aramex
   ══════════════════════════════════════════════════════════ */

function expInitCountries(){
  const sel = document.getElementById('exp-country');
  if(!sel) return;
  // Liste de tous les pays du monde en français (triés)
  const countries = [
    "Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua",
    "Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan",
    "Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize",
    "Benin","Bermuda","Bolivia","Bosnia & Herzegovina","Botswana","Brazil",
    "Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon",
    "Canada","Canary Islands","Cape Verde","Cayman Islands","Central African Rep",
    "Chad","Chile","China","Colombia","Comoros","Congo","Cook Islands",
    "Costa Rica","Croatia","Cuba","Curacao","Cyprus","Czech Republic",
    "Denmark","Djibouti","Dominica","Dominican Rep","Ecuador","Egypt",
    "Estonia","Ethiopia","Fiji Islands","Finland","France","Gabon","Gambia",
    "Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Guadeloupe",
    "Guatemala","Guinea","Guinea Bissau","Guyana","Haiti","Honduras",
    "Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq",
    "Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan",
    "Kazakhstan","Kenya","Kosovo","Kuwait","Laos","Latvia","Lebanon",
    "Lesotho","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar",
    "Malawi","Malaysia","Maldives","Mali","Malta","Martinique","Mauritania",
    "Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Mozambique",
    "Namibia","Nepal","Netherlands","New Caledonia","New Zealand","Nicaragua",
    "Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama",
    "Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal",
    "Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","San Marino",
    "Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore",
    "Slovakia","Slovenia","Somalia","South Africa","South Korea","South Sudan",
    "Spain","Sri Lanka","Sudan","Sweden","Switzerland","Syria","Taiwan",
    "Tajikistan","Tanzania","Thailand","Togo","Trinidad and Tobago","Tunisia",
    "Turkey","Uganda","UAE","Ukraine","United Kingdom","USA","Uruguay",
    "Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
  ];
  countries.sort();
  countries.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
}

function expToggleDims(){
  const type = document.getElementById('exp-type').value;
  const dimsGroup = document.getElementById('exp-dims-group');
  if(dimsGroup) dimsGroup.style.display = (type === 'document') ? 'none' : '';
}

function runExpSim(){
  const direction = document.getElementById('exp-direction').value;
  const type = document.getElementById('exp-type').value;
  const country = document.getElementById('exp-country').value;
  const weightNet = parseFloat(document.getElementById('exp-weight').value) || 0;
  const l = parseFloat(document.getElementById('exp-l').value) || 0;
  const w = parseFloat(document.getElementById('exp-w').value) || 0;
  const h = parseFloat(document.getElementById('exp-h').value) || 0;

  if(!country){ alert('Veuillez sélectionner un pays.'); return; }
  if(!weightNet || weightNet <= 0){ alert('Veuillez saisir un poids valide.'); return; }

  const res = simExpress(direction, country, type, weightNet, l, w, h);
  renderExpResult(res, direction, country, type, weightNet, l, w, h);
}

function fmtExp(n){ return n ? n.toLocaleString('fr-FR') + ' MAD' : '—'; }

function renderExpResult(res, direction, country, type, weightNet, l, w, h){
  const wrap = document.getElementById('exp-result-wrap');
  if(!wrap) return;

  // Trier les transporteurs par total croissant
  const carriers = [];
  if(res.carriers.dhl)    carriers.push({name:'DHL',    ...res.carriers.dhl,    color:'#d40511', logoSrc:'assets/logos/dhl.png'});
  if(res.carriers.fedex)  carriers.push({name:'FedEx',  ...res.carriers.fedex,  color:'#4d148c', logoSrc:'assets/logos/fedex.png'});
  if(res.carriers.aramex) carriers.push({name:'Aramex', ...res.carriers.aramex, color:'#e87722', logoSrc:'assets/logos/aramex.png'});
  carriers.sort((a,b) => a.total - b.total);

  const volPoids = type !== 'document' ? Math.round(l*w*h/5000*100)/100 : '—';
  const dirLabel = direction === 'export' ? 'Export → ' + country : 'Import ← ' + country;
  const typeLabel = {document:'Document',colis:'Colis',palette:'Palette'}[type];
  const transitDays = res.transit;

  let rows = '';
  carriers.forEach((c, i) => {
    const isBest = i === 0;
    rows += `<tr class="${isBest ? 'exp-best' : ''}">
      <td>
        <div class="exp-carrier-logo">
          <img src="${c.logoSrc}" alt="${c.name}" style="height:32px;max-width:80px;object-fit:contain;border-radius:5px;vertical-align:middle">
          ${isBest ? '<span style="background:#00a99d;color:#fff;font-size:.7rem;padding:2px 7px;border-radius:10px;margin-left:8px">✓ Meilleur prix</span>' : ''}
        </div>
        <div style="margin-top:4px"><span class="exp-zone-badge">Zone ${c.zone}</span></div>
      </td>
      <td>
        <div class="exp-price-base">Base HT fuel : ${fmtExp(c.base)}</div>
        <div class="exp-price-fuel">Fuel (~${c.name==='DHL'?'46':c.name==='FedEx'?'48':'47'}%) : +${fmtExp(c.fuelAmt)}</div>
      </td>
      <td class="exp-price-total">${fmtExp(c.total)}</td>
      <td>
        <div class="exp-transit"><i class="fa-solid fa-clock" style="color:var(--teal)"></i> ${transitDays} j. ouvrés</div>
      </td>
    </tr>`;
  });

  if(carriers.length === 0){
    rows = `<tr><td colspan="4" style="text-align:center;padding:30px" class="exp-no-data">Aucun tarif disponible pour cette destination.</td></tr>`;
  }

  wrap.style.display = 'block';
  wrap.innerHTML = `
    <div class="exp-result-card">
      <div class="exp-result-header">
        <h3><i class="fa-solid fa-bolt"></i> Résultats</h3>
        <span class="exp-result-badge">${dirLabel}</span>
        <div class="exp-result-meta">
          <span><i class="fa-solid fa-box"></i> ${typeLabel}</span>
          <span><i class="fa-solid fa-weight-hanging"></i> Poids net: ${weightNet} kg</span>
          ${type !== 'document' ? `<span><i class="fa-solid fa-cube"></i> Vol: ${volPoids} kg</span>` : ''}
          <span style="color:var(--teal);font-weight:700"><i class="fa-solid fa-balance-scale"></i> Poids taxable: <strong>${res.weightTax} kg</strong></span>
        </div>
      </div>
      <div class="exp-table-wrap">
        <table class="exp-table">
          <thead>
            <tr>
              <th>Transporteur</th>
              <th>Détail tarif</th>
              <th>Total TTC Fuel</th>
              <th>Transit</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div style="padding:12px 20px;font-size:.75rem;color:#94a3b8;border-top:1px solid var(--ec-border)">
        <i class="fa-solid fa-circle-info"></i> Prix en MAD · Fuel inclus (DHL 46%, FedEx 48%, Aramex 47%) · Tarifs B2B hors taxes locales · Valides selon grilles 2025-2026
      </div>
    </div>`;
}

/* ══════════════════════════════════════════════════════════
   NOUVELLE EXPÉDITION — Label Generator
   ══════════════════════════════════════════════════════════ */

const SHP_COUNTRIES = {
  MA:'Maroc',FR:'France',ES:'Espagne',DE:'Allemagne',GB:'Royaume-Uni',
  BE:'Belgique',NL:'Pays-Bas',IT:'Italie',US:'USA',AE:'Émirats A.U.',
  SA:'Arabie Saoudite',CN:'Chine',JP:'Japon',CA:'Canada',AU:'Australie'
};

let shpCurrentStep = 1;
let shpSelectedCarrier = null;
let shpPackages = [];

/* Initialisation (appelée par ecInit) */
function shpInit(){
  // Ajouter un colis par défaut
  shpPackages = [];
  shpArticles = [];
  shpAddPackage(false);
  shpRenderPackages();
  // Date d'enlèvement par défaut = demain
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
  const dateEl = document.getElementById('shp-pickup-date');
  if(dateEl) dateEl.value = tomorrow.toISOString().slice(0,10);
  // Pré-remplir info facturation depuis session
  const user = ecGetUser();
  if(user){
    const bf = document.getElementById('shp-bill-firstname');
    const bl = document.getElementById('shp-bill-lastname');
    const be = document.getElementById('shp-bill-email');
    if(bf) bf.value = user.first||'';
    if(bl) bl.value = user.last||'';
    if(be) be.value = user.email||'';
  }
  // Surveiller le select "Autre pays"
  const toSel = document.getElementById('shp-to-country');
  if(toSel) toSel.addEventListener('change', function(){
    const wrap = document.getElementById('shp-to-country-other-wrap');
    if(wrap) wrap.style.display = this.value === 'OTHER' ? '' : 'none';
    shpUpdateSummary();
  });
}

/* Navigation */
function shpNext(from){
  if(!shpValidate(from)) return;
  shpSetStep(from + 1);
  if(from + 1 === 4) shpRenderCustomsArticles();
  if(from + 1 === 7) shpBuildConfirm();
}
function shpPrev(from){ shpSetStep(from - 1); }

function shpSetStep(n){
  shpCurrentStep = n;
  document.querySelectorAll('.shp-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('shp-panel-'+n);
  if(panel){ panel.classList.add('active'); panel.scrollIntoView({behavior:'smooth',block:'start'}); }
  document.querySelectorAll('.shp-step').forEach((dot,i) => {
    dot.classList.remove('active','done');
    if(i+1 < n) dot.classList.add('done');
    else if(i+1 === n) dot.classList.add('active');
  });
}

/* Validation par étape */
function shpValidate(step){
  const req = (id) => {
    const el = document.getElementById(id);
    const ok = el && el.value.trim() !== '';
    if(el) el.style.borderColor = ok ? '' : '#e74c3c';
    return ok;
  };
  if(step === 1){
    return req('shp-from-firstname') & req('shp-from-lastname') &
           req('shp-from-addr1') & req('shp-from-zip') &
           req('shp-from-city') & req('shp-from-email') & req('shp-from-phone');
  }
  if(step === 2){
    return req('shp-to-firstname') & req('shp-to-lastname') &
           req('shp-to-addr1') & req('shp-to-zip') &
           req('shp-to-city') & req('shp-to-email') & req('shp-to-phone');
  }
  if(step === 3){
    let ok = true;
    shpPackages.forEach((p,i)=>{
      if(!p.weight||p.weight<=0){ alert(`Colis ${i+1} : poids invalide`); ok=false; }
    });
    if(!v('shp-pickup-date')){ alert('Veuillez sélectionner une date d\'enlèvement.'); return false; }
    return ok;
  }
  if(step === 4){
    if(!req('shp-cust-from-id')){ alert('Veuillez saisir votre CIN/Passeport ou N° SIRET.'); return false; }
    const d1 = document.getElementById('shp-cust-decl1');
    const d2 = document.getElementById('shp-cust-decl2');
    if(!d1?.checked || !d2?.checked){ alert('Veuillez accepter les déclarations douanières.'); return false; }
    return true;
  }
  if(step === 5){
    if(!shpSelectedCarrier){ alert('Veuillez sélectionner un transporteur.'); return false; }
    return true;
  }
  if(step === 6){
    const mode = document.querySelector('input[name="shp-payment-mode"]:checked');
    if(!mode){ alert('Veuillez sélectionner un mode de paiement.'); return false; }
    if(mode.value === 'account' && !req('shp-account-number')){
      alert('Veuillez saisir votre numéro de compte client.'); return false;
    }
    if(!req('shp-bill-firstname') || !req('shp-bill-lastname') || !req('shp-bill-email')){
      alert('Veuillez remplir les informations de facturation.'); return false;
    }
    const cgv = document.getElementById('shp-cgv');
    if(!cgv?.checked){ alert('Veuillez accepter les conditions générales de vente.'); return false; }
    return true;
  }
  return true;
}

/* Gestion des colis */
function shpAddPackage(render=true){
  shpPackages.push({
    type:'colis', weight:1, length:30, width:20, height:15,
    content:'', value:0, quantity:1
  });
  if(render) shpRenderPackages();
}

function shpRemovePackage(idx){
  if(shpPackages.length <= 1){ alert('Au moins un colis est requis.'); return; }
  shpPackages.splice(idx,1);
  shpRenderPackages();
}

function shpRenderPackages(){
  const list = document.getElementById('shp-packages-list');
  if(!list) return;
  list.innerHTML = shpPackages.map((p,i) => `
    <div class="shp-pkg-card" id="shp-pkg-${i}">
      <div class="shp-pkg-header">
        <span><i class="fa-solid fa-box"></i> Colis ${i+1}</span>
        ${shpPackages.length > 1 ? `<button class="shp-pkg-remove" onclick="shpRemovePackage(${i})"><i class="fa-solid fa-trash"></i></button>` : ''}
      </div>
      <div class="shp-grid-3">
        <div class="shp-field">
          <label>Type</label>
          <select onchange="shpPkgUpdate(${i},'type',this.value)">
            <option value="document" ${p.type==='document'?'selected':''}>Document</option>
            <option value="colis" ${p.type==='colis'?'selected':''}>Colis</option>
            <option value="palette" ${p.type==='palette'?'selected':''}>Palette</option>
          </select>
        </div>
        <div class="shp-field">
          <label>Poids (kg) *</label>
          <input type="number" min="0.1" step="0.5" value="${p.weight}"
            onchange="shpPkgUpdate(${i},'weight',+this.value)">
        </div>
        <div class="shp-field">
          <label>Quantité</label>
          <input type="number" min="1" step="1" value="${p.quantity}"
            onchange="shpPkgUpdate(${i},'quantity',+this.value)">
        </div>
        ${p.type!=='document' ? `
        <div class="shp-field">
          <label>Long. (cm)</label>
          <input type="number" min="1" step="1" value="${p.length}"
            onchange="shpPkgUpdate(${i},'length',+this.value)">
        </div>
        <div class="shp-field">
          <label>Larg. (cm)</label>
          <input type="number" min="1" step="1" value="${p.width}"
            onchange="shpPkgUpdate(${i},'width',+this.value)">
        </div>
        <div class="shp-field">
          <label>Haut. (cm)</label>
          <input type="number" min="1" step="1" value="${p.height}"
            onchange="shpPkgUpdate(${i},'height',+this.value)">
        </div>
        ` : ''}
        <div class="shp-field span3">
          <label>Contenu / Description *</label>
          <input type="text" placeholder="ex: Vêtements, documents commerciaux..." value="${p.content}"
            onchange="shpPkgUpdate(${i},'content',this.value)">
        </div>
        <div class="shp-field">
          <label>Valeur déclarée (MAD)</label>
          <input type="number" min="0" step="10" value="${p.value}"
            onchange="shpPkgUpdate(${i},'value',+this.value)">
        </div>
        ${p.type!=='document' ? `<div class="shp-field" style="align-self:end;padding-bottom:4px">
          <span class="shp-vol-weight">
            <i class="fa-solid fa-cube"></i>
            Poids vol. : <strong>${((p.length*p.width*p.height)/5000).toFixed(2)} kg</strong>
            &nbsp;|&nbsp; Taxable : <strong>${Math.max(p.weight,(p.length*p.width*p.height)/5000).toFixed(2)} kg</strong>
          </span>
        </div>` : ''}
      </div>
    </div>`).join('');
  shpUpdateSummary();
}

function shpPkgUpdate(idx, field, value){
  shpPackages[idx][field] = value;
  shpRenderPackages();
}

/* Sélection du transporteur */
function shpSelectCarrier(code){
  shpSelectedCarrier = code;
  document.querySelectorAll('.shp-carrier-card').forEach(c => c.classList.remove('selected'));
  const card = document.getElementById('shp-carrier-'+code);
  if(card) card.classList.add('selected');
  shpUpdateSummary();
}

/* ── Customs Articles ── */
let shpArticles = [];

function shpRenderCustomsArticles(){
  // Pre-populate one article per package if empty
  if(shpArticles.length === 0){
    shpPackages.forEach(p => shpArticles.push({
      category:'other', hsCode:'', description:'', origin:'MA',
      qty:p.quantity||1, unitValue:p.value||0, unitWeight:p.weight||1
    }));
  }
  const wrap = document.getElementById('shp-customs-articles');
  if(!wrap) return;
  const cats = ['Vêtements','Électronique','Documents','Alimentation','Cosmétiques',
    'Meubles','Jouets','Médicaments','Outillage','Autre'];
  const countries = ['MA','FR','CN','DE','US','ES','IT','GB','BE','IN','TR','JP'];
  const cLabels = {MA:'Maroc',FR:'France',CN:'Chine',DE:'Allemagne',US:'USA',
    ES:'Espagne',IT:'Italie',GB:'Royaume-Uni',BE:'Belgique',IN:'Inde',TR:'Turquie',JP:'Japon'};
  wrap.innerHTML = shpArticles.map((a,i) => `
    <div class="shp-article-card">
      <div class="shp-pkg-header">
        <span><i class="fa-solid fa-tag"></i> Article ${i+1}</span>
        ${shpArticles.length > 1 ? `<button class="shp-pkg-remove" onclick="shpRemoveArticle(${i})"><i class="fa-solid fa-trash"></i></button>` : ''}
      </div>
      <div class="shp-grid-2">
        <div class="shp-field">
          <label>Catégorie de marchandise</label>
          <select onchange="shpArticleUpdate(${i},'category',this.value)">
            ${cats.map(c=>`<option value="${c}" ${a.category===c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="shp-field">
          <label>Code tarifaire SH (6 chiffres) *</label>
          <div style="display:flex;gap:6px">
            <input type="text" maxlength="10" placeholder="ex: 620342" value="${a.hsCode}"
              onchange="shpArticleUpdate(${i},'hsCode',this.value)"
              style="flex:1">
            <button onclick="ecShowModule('hscode')" title="Trouver mon code SH"
              style="padding:8px 10px;background:var(--teal);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:.8rem;white-space:nowrap">
              <i class="fa-solid fa-search"></i>
            </button>
          </div>
        </div>
        <div class="shp-field span2">
          <label>Description du contenu <strong>(en anglais)</strong> *</label>
          <input type="text" placeholder="ex: Men's cotton T-shirt, blue, size M" value="${a.description}"
            onchange="shpArticleUpdate(${i},'description',this.value)">
        </div>
        <div class="shp-field">
          <label>Pays de fabrication</label>
          <select onchange="shpArticleUpdate(${i},'origin',this.value)">
            ${countries.map(c=>`<option value="${c}" ${a.origin===c?'selected':''}>${cLabels[c]||c}</option>`).join('')}
          </select>
        </div>
        <div class="shp-field" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;align-items:end">
          <div>
            <label style="font-size:.7rem">Quantité</label>
            <input type="number" min="1" value="${a.qty}" onchange="shpArticleUpdate(${i},'qty',+this.value)">
          </div>
          <div>
            <label style="font-size:.7rem">Valeur unit. (MAD)</label>
            <input type="number" min="0" value="${a.unitValue}" onchange="shpArticleUpdate(${i},'unitValue',+this.value)">
          </div>
          <div>
            <label style="font-size:.7rem">Poids unit. (kg)</label>
            <input type="number" min="0.01" step="0.1" value="${a.unitWeight}" onchange="shpArticleUpdate(${i},'unitWeight',+this.value)">
          </div>
        </div>
      </div>
    </div>`).join('');
}

function shpAddArticle(){
  shpArticles.push({category:'Autre',hsCode:'',description:'',origin:'MA',qty:1,unitValue:0,unitWeight:1});
  shpRenderCustomsArticles();
}
function shpRemoveArticle(idx){
  shpArticles.splice(idx,1);
  shpRenderCustomsArticles();
}

/* ══════════════════════════════════════════════════════
   HORLOGE MONDIALE — Temps Réel
   ══════════════════════════════════════════════════════ */

const WORLD_CITIES = [
  /* ── Maroc ── */
  {city:'Casablanca',  country:'Maroc',              tz:'Africa/Casablanca',                   region:'AF', flag:'🇲🇦'},
  {city:'Rabat',       country:'Maroc',              tz:'Africa/Casablanca',                   region:'AF', flag:'🇲🇦'},
  {city:'Marrakech',   country:'Maroc',              tz:'Africa/Casablanca',                   region:'AF', flag:'🇲🇦'},
  {city:'Tanger',      country:'Maroc',              tz:'Africa/Casablanca',                   region:'AF', flag:'🇲🇦'},
  /* ── Afrique ── */
  {city:'Le Caire',    country:'Égypte',             tz:'Africa/Cairo',                        region:'AF', flag:'🇪🇬'},
  {city:'Tunis',       country:'Tunisie',            tz:'Africa/Tunis',                        region:'AF', flag:'🇹🇳'},
  {city:'Alger',       country:'Algérie',            tz:'Africa/Algiers',                      region:'AF', flag:'🇩🇿'},
  {city:'Dakar',       country:'Sénégal',            tz:'Africa/Dakar',                        region:'AF', flag:'🇸🇳'},
  {city:'Abidjan',     country:'Côte d\'Ivoire',     tz:'Africa/Abidjan',                      region:'AF', flag:'🇨🇮'},
  {city:'Lagos',       country:'Nigéria',            tz:'Africa/Lagos',                        region:'AF', flag:'🇳🇬'},
  {city:'Accra',       country:'Ghana',              tz:'Africa/Accra',                        region:'AF', flag:'🇬🇭'},
  {city:'Nairobi',     country:'Kenya',              tz:'Africa/Nairobi',                      region:'AF', flag:'🇰🇪'},
  {city:'Johannesburg',country:'Afrique du Sud',     tz:'Africa/Johannesburg',                 region:'AF', flag:'🇿🇦'},
  {city:'Addis-Abeba', country:'Éthiopie',           tz:'Africa/Addis_Ababa',                  region:'AF', flag:'🇪🇹'},
  {city:'Tripoli',     country:'Libye',              tz:'Africa/Tripoli',                      region:'AF', flag:'🇱🇾'},
  /* ── Europe ── */
  {city:'Londres',     country:'Royaume-Uni',        tz:'Europe/London',                       region:'EU', flag:'🇬🇧'},
  {city:'Paris',       country:'France',             tz:'Europe/Paris',                        region:'EU', flag:'🇫🇷'},
  {city:'Madrid',      country:'Espagne',            tz:'Europe/Madrid',                       region:'EU', flag:'🇪🇸'},
  {city:'Lisbonne',    country:'Portugal',           tz:'Europe/Lisbon',                       region:'EU', flag:'🇵🇹'},
  {city:'Amsterdam',   country:'Pays-Bas',           tz:'Europe/Amsterdam',                    region:'EU', flag:'🇳🇱'},
  {city:'Bruxelles',   country:'Belgique',           tz:'Europe/Brussels',                     region:'EU', flag:'🇧🇪'},
  {city:'Genève',      country:'Suisse',             tz:'Europe/Zurich',                       region:'EU', flag:'🇨🇭'},
  {city:'Frankfurt',   country:'Allemagne',          tz:'Europe/Berlin',                       region:'EU', flag:'🇩🇪'},
  {city:'Milan',       country:'Italie',             tz:'Europe/Rome',                         region:'EU', flag:'🇮🇹'},
  {city:'Barcelone',   country:'Espagne',            tz:'Europe/Madrid',                       region:'EU', flag:'🇪🇸'},
  {city:'Stockholm',   country:'Suède',              tz:'Europe/Stockholm',                    region:'EU', flag:'🇸🇪'},
  {city:'Varsovie',    country:'Pologne',            tz:'Europe/Warsaw',                       region:'EU', flag:'🇵🇱'},
  {city:'Istanbul',    country:'Turquie',            tz:'Europe/Istanbul',                     region:'EU', flag:'🇹🇷'},
  {city:'Moscou',      country:'Russie',             tz:'Europe/Moscow',                       region:'EU', flag:'🇷🇺'},
  {city:'Athènes',     country:'Grèce',              tz:'Europe/Athens',                       region:'EU', flag:'🇬🇷'},
  /* ── Moyen-Orient ── */
  {city:'Dubaï',       country:'Émirats Arabes Unis',tz:'Asia/Dubai',                          region:'ME', flag:'🇦🇪'},
  {city:'Abu Dhabi',   country:'Émirats Arabes Unis',tz:'Asia/Dubai',                          region:'ME', flag:'🇦🇪'},
  {city:'Riyad',       country:'Arabie Saoudite',    tz:'Asia/Riyadh',                         region:'ME', flag:'🇸🇦'},
  {city:'Doha',        country:'Qatar',              tz:'Asia/Qatar',                          region:'ME', flag:'🇶🇦'},
  {city:'Koweït',      country:'Koweït',             tz:'Asia/Kuwait',                         region:'ME', flag:'🇰🇼'},
  {city:'Manama',      country:'Bahreïn',            tz:'Asia/Bahrain',                        region:'ME', flag:'🇧🇭'},
  {city:'Muscat',      country:'Oman',               tz:'Asia/Muscat',                         region:'ME', flag:'🇴🇲'},
  {city:'Beyrouth',    country:'Liban',              tz:'Asia/Beirut',                         region:'ME', flag:'🇱🇧'},
  {city:'Amman',       country:'Jordanie',           tz:'Asia/Amman',                          region:'ME', flag:'🇯🇴'},
  {city:'Téhéran',     country:'Iran',               tz:'Asia/Tehran',                         region:'ME', flag:'🇮🇷'},
  /* ── Asie ── */
  {city:'Pékin',       country:'Chine',              tz:'Asia/Shanghai',                       region:'AS', flag:'🇨🇳'},
  {city:'Shanghai',    country:'Chine',              tz:'Asia/Shanghai',                       region:'AS', flag:'🇨🇳'},
  {city:'Guangzhou',   country:'Chine',              tz:'Asia/Shanghai',                       region:'AS', flag:'🇨🇳'},
  {city:'Shenzhen',    country:'Chine',              tz:'Asia/Shanghai',                       region:'AS', flag:'🇨🇳'},
  {city:'Hong Kong',   country:'Chine (RAS)',        tz:'Asia/Hong_Kong',                      region:'AS', flag:'🇭🇰'},
  {city:'Tokyo',       country:'Japon',              tz:'Asia/Tokyo',                          region:'AS', flag:'🇯🇵'},
  {city:'Séoul',       country:'Corée du Sud',       tz:'Asia/Seoul',                          region:'AS', flag:'🇰🇷'},
  {city:'Singapour',   country:'Singapour',          tz:'Asia/Singapore',                      region:'AS', flag:'🇸🇬'},
  {city:'Mumbai',      country:'Inde',               tz:'Asia/Kolkata',                        region:'AS', flag:'🇮🇳'},
  {city:'New Delhi',   country:'Inde',               tz:'Asia/Kolkata',                        region:'AS', flag:'🇮🇳'},
  {city:'Bangkok',     country:'Thaïlande',          tz:'Asia/Bangkok',                        region:'AS', flag:'🇹🇭'},
  {city:'Kuala Lumpur',country:'Malaisie',           tz:'Asia/Kuala_Lumpur',                   region:'AS', flag:'🇲🇾'},
  {city:'Jakarta',     country:'Indonésie',          tz:'Asia/Jakarta',                        region:'AS', flag:'🇮🇩'},
  {city:'Karachi',     country:'Pakistan',           tz:'Asia/Karachi',                        region:'AS', flag:'🇵🇰'},
  {city:'Tachkent',    country:'Ouzbékistan',        tz:'Asia/Tashkent',                       region:'AS', flag:'🇺🇿'},
  {city:'Taipei',      country:'Taïwan',             tz:'Asia/Taipei',                         region:'AS', flag:'🇹🇼'},
  {city:'Ho Chi Minh', country:'Viêt Nam',           tz:'Asia/Ho_Chi_Minh',                    region:'AS', flag:'🇻🇳'},
  {city:'Dhaka',       country:'Bangladesh',         tz:'Asia/Dhaka',                          region:'AS', flag:'🇧🇩'},
  /* ── Amérique du Nord ── */
  {city:'New York',    country:'États-Unis',         tz:'America/New_York',                    region:'NA', flag:'🇺🇸'},
  {city:'Los Angeles', country:'États-Unis',         tz:'America/Los_Angeles',                 region:'NA', flag:'🇺🇸'},
  {city:'Chicago',     country:'États-Unis',         tz:'America/Chicago',                     region:'NA', flag:'🇺🇸'},
  {city:'Miami',       country:'États-Unis',         tz:'America/New_York',                    region:'NA', flag:'🇺🇸'},
  {city:'Houston',     country:'États-Unis',         tz:'America/Chicago',                     region:'NA', flag:'🇺🇸'},
  {city:'Toronto',     country:'Canada',             tz:'America/Toronto',                     region:'NA', flag:'🇨🇦'},
  {city:'Montréal',    country:'Canada',             tz:'America/Montreal',                    region:'NA', flag:'🇨🇦'},
  {city:'Vancouver',   country:'Canada',             tz:'America/Vancouver',                   region:'NA', flag:'🇨🇦'},
  {city:'Mexico City', country:'Mexique',            tz:'America/Mexico_City',                 region:'NA', flag:'🇲🇽'},
  /* ── Amérique du Sud ── */
  {city:'São Paulo',   country:'Brésil',             tz:'America/Sao_Paulo',                   region:'SA', flag:'🇧🇷'},
  {city:'Rio de Janeiro',country:'Brésil',           tz:'America/Sao_Paulo',                   region:'SA', flag:'🇧🇷'},
  {city:'Buenos Aires',country:'Argentine',          tz:'America/Argentina/Buenos_Aires',      region:'SA', flag:'🇦🇷'},
  {city:'Santiago',    country:'Chili',              tz:'America/Santiago',                    region:'SA', flag:'🇨🇱'},
  {city:'Bogotá',      country:'Colombie',           tz:'America/Bogota',                      region:'SA', flag:'🇨🇴'},
  {city:'Lima',        country:'Pérou',              tz:'America/Lima',                        region:'SA', flag:'🇵🇪'},
  /* ── Océanie ── */
  {city:'Sydney',      country:'Australie',          tz:'Australia/Sydney',                    region:'OC', flag:'🇦🇺'},
  {city:'Melbourne',   country:'Australie',          tz:'Australia/Melbourne',                 region:'OC', flag:'🇦🇺'},
  {city:'Auckland',    country:'Nouvelle-Zélande',   tz:'Pacific/Auckland',                    region:'OC', flag:'🇳🇿'},
  {city:'Perth',       country:'Australie',          tz:'Australia/Perth',                     region:'OC', flag:'🇦🇺'},
];

let _wcActiveFilter = { q:'', region:'' };
let _wcInterval     = null;

/**
 * Construit le HTML pour toutes les villes filtrées et injecte dans #wc-grid.
 */
function wcRender(cities){
  const grid = document.getElementById('wc-grid');
  if(!grid) return;
  if(!cities.length){
    grid.innerHTML = '<p style="color:#94a3b8;font-style:italic;grid-column:1/-1;padding:20px 0">Aucune ville trouvée.</p>';
    return;
  }
  const now = new Date();
  grid.innerHTML = cities.map(c => {
    try {
      const timeFmt = new Intl.DateTimeFormat('fr-FR',{timeZone:c.tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
      const dateFmt = new Intl.DateTimeFormat('fr-FR',{timeZone:c.tz,weekday:'short',day:'numeric',month:'short'});
      const utcFmt  = new Intl.DateTimeFormat('en-GB',{timeZone:c.tz,timeZoneName:'shortOffset',hour:'2-digit',minute:'2-digit'});
      const utcStr  = utcFmt.format(now).split(' ').pop() || '';
      const cardId  = 'wc-' + c.city.replace(/[\s']/g,'_');
      return `<div class="wc-card" id="${cardId}">
        <div class="wc-flag">${c.flag}</div>
        <div class="wc-city">${escapeHTML(c.city)}</div>
        <div class="wc-country">${escapeHTML(c.country)}</div>
        <div class="wc-time">${timeFmt.format(now)}</div>
        <div class="wc-date">${dateFmt.format(now)}</div>
        <div class="wc-utc">${escapeHTML(utcStr)}</div>
      </div>`;
    } catch(e){ return ''; }
  }).join('');
}

/**
 * Filtre les villes selon la recherche et la région sélectionnée.
 */
function wcFilter(){
  _wcActiveFilter.q      = ((document.getElementById('wc-search')||{}).value||'').toLowerCase().trim();
  _wcActiveFilter.region = (document.getElementById('wc-region')||{}).value||'';
  const {q, region} = _wcActiveFilter;
  const filtered = WORLD_CITIES.filter(c => {
    if(region && c.region !== region) return false;
    if(q && !c.city.toLowerCase().includes(q) && !c.country.toLowerCase().includes(q)) return false;
    return true;
  });
  wcRender(filtered);
}

/**
 * Met à jour les heures toutes les secondes sans reconstruire le DOM.
 */
function wcTick(){
  const grid = document.getElementById('wc-grid');
  if(!grid || !grid.children.length) return;
  const {q, region} = _wcActiveFilter;
  const now = new Date();
  WORLD_CITIES.forEach(c => {
    if(region && c.region !== region) return;
    if(q && !c.city.toLowerCase().includes(q) && !c.country.toLowerCase().includes(q)) return;
    const cardId = 'wc-' + c.city.replace(/[\s']/g,'_');
    const card   = document.getElementById(cardId);
    if(!card) return;
    try {
      const timeFmt = new Intl.DateTimeFormat('fr-FR',{timeZone:c.tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
      const dateFmt = new Intl.DateTimeFormat('fr-FR',{timeZone:c.tz,weekday:'short',day:'numeric',month:'short'});
      const tEl = card.querySelector('.wc-time');
      const dEl = card.querySelector('.wc-date');
      if(tEl) tEl.textContent = timeFmt.format(now);
      if(dEl) dEl.textContent = dateFmt.format(now);
    } catch(e){}
  });
}

/* Démarrage automatique au chargement de la page */
document.addEventListener('DOMContentLoaded', function(){
  wcFilter();
  if(_wcInterval) clearInterval(_wcInterval);
  _wcInterval = setInterval(wcTick, 1000);
});
function shpArticleUpdate(idx,field,value){
  shpArticles[idx][field] = value;
}

/* ── Payment Mode ── */
function shpSelectPayment(mode){
  document.getElementById('shp-pay-card').checked = mode === 'card';
  document.getElementById('shp-pay-account').checked = mode === 'account';
  document.getElementById('shp-card-section').style.display = mode === 'card' ? '' : 'none';
  document.getElementById('shp-account-section').style.display = mode === 'account' ? '' : 'none';
  document.querySelectorAll('.shp-pay-option').forEach(o => o.classList.remove('selected'));
  const sel = document.getElementById('shp-pay-opt-'+mode);
  if(sel) sel.classList.add('selected');
}

function shpToggleBillingType(type){
  const cWrap = document.getElementById('shp-bill-company-wrap');
  const tWrap = document.getElementById('shp-bill-taxid-wrap');
  if(cWrap) cWrap.style.display = type === 'company' ? '' : 'none';
  if(tWrap) tWrap.style.display = type === 'company' ? '' : 'none';
}

function shpValidateAccountNumber(input){
  const statusEl = document.getElementById('shp-account-status');
  const val = input.value.trim().toUpperCase();
  if(!val){ if(statusEl) statusEl.innerHTML = ''; return; }
  // Simple format check: GPE-YYYY-XXXXX
  const ok = /^GPE-\d{4}-[A-Z0-9]{3,}$/.test(val);
  if(statusEl){
    statusEl.innerHTML = ok
      ? '<span style="color:green"><i class="fa-solid fa-circle-check"></i> Format valide</span>'
      : '<span style="color:#e74c3c"><i class="fa-solid fa-triangle-exclamation"></i> Format: GPE-AAAA-XXXXX</span>';
  }
}

function shpApplyPromo(){
  const code = v('shp-promo-code').toUpperCase().trim();
  const result = document.getElementById('shp-promo-result');
  if(!result) return;
  // Placeholder promo codes
  const promos = { 'GPE10': '10% de réduction appliquée', 'WELCOME': '50 MAD offerts' };
  if(promos[code]){
    result.innerHTML = `<span style="color:green"><i class="fa-solid fa-circle-check"></i> ${promos[code]}</span>`;
  } else if(code){
    result.innerHTML = `<span style="color:#e74c3c"><i class="fa-solid fa-x"></i> Code invalide ou expiré</span>`;
  }
}

/* Mise à jour du résumé latéral */
function shpUpdateSummary(){
  const el = document.getElementById('shp-summary-content');
  if(!el) return;
  const fc = v('shp-from-country'); const tc = v('shp-to-country');
  const fn = v('shp-from-firstname'); const ln = v('shp-from-lastname');
  const tc2 = v('shp-to-firstname'); const tl = v('shp-to-lastname');
  const fz = v('shp-from-zip'); const fcity = v('shp-from-city');
  const tz = v('shp-to-zip'); const tcity = v('shp-to-city');
  const totalW = shpPackages.reduce((s,p)=>s+p.weight*p.quantity,0);
  const totalPkgs = shpPackages.reduce((s,p)=>s+p.quantity,0);
  el.innerHTML = `
    ${fn||ln ? `<div class="shp-sum-block"><div class="shp-sum-label">DE</div>
      <div>${fn} ${ln}</div>
      <div style="color:#64748b;font-size:.82rem">${fz} ${fcity} · ${SHP_COUNTRIES[fc]||fc}</div>
    </div>` : '<div class="shp-summary-row muted">Expéditeur à remplir</div>'}
    ${tc2||tl ? `<div class="shp-sum-block"><div class="shp-sum-label">À</div>
      <div>${tc2} ${tl}</div>
      <div style="color:#64748b;font-size:.82rem">${tz} ${tcity} · ${SHP_COUNTRIES[tc]||tc}</div>
    </div>` : ''}
    <div class="shp-sum-block">
      <div class="shp-sum-label">COLIS</div>
      <div>${totalPkgs} colis · ${totalW.toFixed(1)} kg total</div>
    </div>
    ${shpSelectedCarrier ? `<div class="shp-sum-block">
      <div class="shp-sum-label">TRANSPORTEUR</div>
      <div style="font-weight:700">${shpSelectedCarrier}</div>
    </div>` : ''}`;
}

function v(id){ const el=document.getElementById(id); return el?el.value:''; }

/* Construction de l'écran de confirmation */
function shpBuildConfirm(){
  const body = document.getElementById('shp-confirm-body');
  if(!body) return;
  const fc = SHP_COUNTRIES[v('shp-from-country')]||v('shp-from-country');
  const tc = SHP_COUNTRIES[v('shp-to-country')]||v('shp-to-country');
  const svc = shpSelectedCarrier === 'DHL' ? v('shp-dhl-service') :
              shpSelectedCarrier === 'FEDEX' ? v('shp-fedex-service') :
              v('shp-aramex-service');
  const insurance = document.getElementById('shp-opt-insurance')?.checked;
  const signature = document.getElementById('shp-opt-signature')?.checked;
  const totalW = shpPackages.reduce((s,p)=>s+p.weight*p.quantity,0);
  const totalV = shpPackages.reduce((s,p)=>s+p.value*p.quantity,0);

  body.innerHTML = `
    <div class="shp-confirm-grid">
      <div class="shp-confirm-block">
        <div class="shp-confirm-label"><i class="fa-solid fa-location-dot"></i> Expéditeur</div>
        <div>${v('shp-from-firstname')} ${v('shp-from-lastname')}</div>
        ${v('shp-from-company') ? `<div>${v('shp-from-company')}</div>` : ''}
        <div>${v('shp-from-addr1')}</div>
        <div>${v('shp-from-zip')} ${v('shp-from-city')}, ${fc}</div>
        <div style="color:#64748b;margin-top:4px">${v('shp-from-email')} · ${v('shp-from-phone')}</div>
      </div>
      <div class="shp-confirm-block">
        <div class="shp-confirm-label"><i class="fa-solid fa-location-dot" style="color:var(--teal)"></i> Destinataire</div>
        <div>${v('shp-to-firstname')} ${v('shp-to-lastname')}</div>
        ${v('shp-to-company') ? `<div>${v('shp-to-company')}</div>` : ''}
        <div>${v('shp-to-addr1')}</div>
        ${v('shp-to-addr2') ? `<div>${v('shp-to-addr2')}</div>` : ''}
        <div>${v('shp-to-zip')} ${v('shp-to-city')}, ${tc}</div>
        <div style="color:#64748b;margin-top:4px">${v('shp-to-email')} · ${v('shp-to-phone')}</div>
      </div>
      <div class="shp-confirm-block">
        <div class="shp-confirm-label"><i class="fa-solid fa-boxes-stacked"></i> Colis</div>
        ${shpPackages.map((p,i)=>`
          <div class="shp-confirm-pkg">
            <strong>Colis ${i+1}</strong> (×${p.quantity}) : ${p.type} · ${p.weight} kg
            ${p.type!=='document' ? `· ${p.length}×${p.width}×${p.height} cm` : ''}
            ${p.content ? `<div style="color:#64748b;font-size:.82rem">${p.content}</div>` : ''}
          </div>`).join('')}
        <div style="margin-top:8px;font-weight:700">Total : ${totalW.toFixed(1)} kg · ${totalV > 0 ? totalV.toLocaleString('fr-FR')+' MAD déclarés' : 'Valeur non déclarée'}</div>
      </div>
      <div class="shp-confirm-block">
        <div class="shp-confirm-label"><i class="fa-solid fa-truck-fast"></i> Service</div>
        <div style="font-size:1.1rem;font-weight:800">${shpSelectedCarrier}</div>
        <div>${svc}</div>
        <div style="margin-top:8px;color:#64748b;font-size:.82rem">
          ${insurance ? '<i class="fa-solid fa-shield-check" style="color:green"></i> Assurance incluse · ' : ''}
          ${signature ? '<i class="fa-solid fa-pen-to-square" style="color:var(--teal)"></i> Signature requise' : ''}
        </div>
      </div>
    </div>
      <div class="shp-confirm-block">
        <div class="shp-confirm-label"><i class="fa-solid fa-stamp"></i> Douanes</div>
        ${shpArticles.map((a,i)=>`<div class="shp-confirm-pkg">
          Art.${i+1}: ${a.description||'—'} · Code SH: ${a.hsCode||'—'}
          <br><small style="color:#64748b">Qté: ${a.qty} · Val: ${a.unitValue} MAD · Fabrication: ${a.origin}</small>
        </div>`).join('')}
      </div>
      <div class="shp-confirm-block">
        <div class="shp-confirm-label"><i class="fa-solid fa-credit-card"></i> Paiement</div>
        ${(()=>{
          const m = document.querySelector('input[name="shp-payment-mode"]:checked');
          const mode = m ? m.value : '—';
          return mode === 'card'
            ? '<div><i class="fa-solid fa-credit-card" style="color:#1a56db"></i> Carte bancaire (en ligne)</div>'
            : mode === 'account'
            ? `<div><i class="fa-solid fa-building-columns" style="color:#0a8f85"></i> Compte client: <strong>${v('shp-account-number')}</strong></div>`
            : '<div>Mode de paiement non sélectionné</div>';
        })()}
        <div style="margin-top:6px;color:#64748b;font-size:.82rem">Facturé à: ${v('shp-bill-firstname')} ${v('shp-bill-lastname')} · ${v('shp-bill-email')}</div>
      </div>
    </div>
    <div class="shp-confirm-notice">
      <i class="fa-solid fa-circle-info"></i>
      En cliquant sur <strong>Confirmer &amp; Générer l'étiquette</strong>, la réservation sera créée via l'API ${shpSelectedCarrier||'du transporteur sélectionné'}.
      Assurez-vous que toutes les informations sont correctes avant de continuer.
    </div>`;
}

/* Génération de l'étiquette (placeholder API) */
function shpGenerateLabel(){
  const result = document.getElementById('shp-label-result');
  if(!result) return;

  // Collecter toutes les données du formulaire
  const shipmentData = {
    carrier: shpSelectedCarrier,
    service: shpSelectedCarrier==='DHL' ? v('shp-dhl-service') :
             shpSelectedCarrier==='FEDEX' ? v('shp-fedex-service') : v('shp-aramex-service'),
    sender: {
      country: v('shp-from-country'), zip: v('shp-from-zip'), city: v('shp-from-city'),
      firstName: v('shp-from-firstname'), lastName: v('shp-from-lastname'),
      company: v('shp-from-company'), address1: v('shp-from-addr1'),
      email: v('shp-from-email'), phone: v('shp-from-phone')
    },
    recipient: {
      country: v('shp-to-country'), zip: v('shp-to-zip'), city: v('shp-to-city'),
      firstName: v('shp-to-firstname'), lastName: v('shp-to-lastname'),
      company: v('shp-to-company'), address1: v('shp-to-addr1'), address2: v('shp-to-addr2'),
      email: v('shp-to-email'), phone: v('shp-to-phone')
    },
    packages: shpPackages,
    customs: {
      senderVatRegime: v('shp-cust-from-vat'),
      senderIdNumber: v('shp-cust-from-id'),
      exportReason: v('shp-cust-reason'),
      invoiceNumber: v('shp-cust-invoice'),
      recipientVatRegime: v('shp-cust-to-vat'),
      recipientTaxId: v('shp-cust-to-taxid'),
      eori: v('shp-cust-eori'),
      articles: shpArticles
    },
    pickup: {
      date: v('shp-pickup-date'),
      timeSlot: v('shp-pickup-time')
    },
    payment: {
      mode: document.querySelector('input[name="shp-payment-mode"]:checked')?.value || '—',
      accountNumber: v('shp-account-number'),
      billingName: v('shp-bill-firstname') + ' ' + v('shp-bill-lastname'),
      billingEmail: v('shp-bill-email'),
      billingAddress: v('shp-bill-address'),
      billingCompany: v('shp-bill-company'),
      promoCode: v('shp-promo-code')
    },
    options: {
      insurance: document.getElementById('shp-opt-insurance')?.checked,
      signature: document.getElementById('shp-opt-signature')?.checked,
      saturday:  document.getElementById('shp-opt-saturday')?.checked
    }
  };

  console.log('[GPE] Shipment data ready for API:', JSON.stringify(shipmentData, null, 2));

  // Afficher placeholder en attendant l'intégration API
  result.style.display = 'block';
  result.innerHTML = `
    <div class="shp-api-pending">
      <div class="shp-api-icon"><i class="fa-solid fa-clock" style="color:#f39c12;font-size:2rem"></i></div>
      <div>
        <h4 style="margin:0 0 8px">Intégration API en attente</h4>
        <p style="margin:0;color:#64748b">
          Les données de l'expédition sont collectées et prêtes.
          La génération de l'étiquette sera activée dès la réception
          de la documentation API <strong>${shpSelectedCarrier}</strong>.
        </p>
        <details style="margin-top:12px">
          <summary style="cursor:pointer;color:var(--teal);font-size:.85rem">
            <i class="fa-solid fa-code"></i> Voir les données prêtes pour l'API
          </summary>
          <pre class="shp-api-json">${JSON.stringify(shipmentData, null, 2)}</pre>
        </details>
      </div>
    </div>`;
}
