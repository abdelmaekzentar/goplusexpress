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

/* ── Codes Aéroports & Ports ─────────────────────────── */
const AIRPORTS = [
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

const PORTS = [
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

/* ── Guide / Switch panels ───────────────────────────── */
function guideSwitch(name){
  document.querySelectorAll('.guide-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.guide-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('gtab-'+name).classList.add('active');
  document.getElementById('gpanel-'+name).classList.add('active');
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
  const ACCORDS = (typeof MAROC_ACCORDS !== 'undefined') ? MAROC_ACCORDS : [];
  let accordsHtml = `
    <div class="adil-accords-intro">
      <i class="fa-solid fa-circle-info"></i>
      Les accords préférentiels s'appliquent selon le <strong>pays d'origine</strong> de la marchandise.
      Présentez le certificat d'origine correspondant pour bénéficier du taux réduit.
    </div>
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
    const fretMAD = fretTotal * rate * ratio;
    const insMAD  = insTotal > 0 ? insTotal * rate * ratio : (priceMAD + fretMAD) * 0.005;
    cifMAD = priceMAD + fretMAD * 0.5 + insMAD;
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
function ocrClassifyHS(description, declaredHS){
  if(declaredHS && /^\d{4,10}$/.test(declaredHS.replace(/[\.\-]/g,''))){
    return { code: declaredHS.replace(/[\.\-]/g,''), confidence: 100, method: 'DECLARED' };
  }
  if(typeof HS_CODES === 'undefined') return { code: null, confidence: 0, method: 'NOT_FOUND' };

  const q = (description || '').toLowerCase();
  // Recherche directe dans les descriptions françaises
  const tokens = q.split(/\s+/).filter(t => t.length > 3);
  if(tokens.length > 0){
    let best = null, bestScore = 0;
    for(const c of HS_CODES){
      const desc = (c.desc || '').toLowerCase();
      const score = tokens.filter(t => desc.includes(t)).length / tokens.length;
      if(score > bestScore){ bestScore = score; best = c; }
    }
    if(best && bestScore >= 0.5){
      return { code: best.sh, confidence: Math.round(bestScore * 85), method: 'TEXT_SEARCH', desc: best.desc };
    }
  }
  // Recherche via AI_KEYWORDS
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
    // ── PDF : convertir page 1 en image via PDF.js avant Tesseract ──
    if(sub) sub.textContent = 'Conversion PDF → image…';
    const loadPdfJs = (cb) => {
      if(window.pdfjsLib){ cb(); return; }
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4/build/pdf.min.mjs';
      s.type = 'module';
      // fallback non-module
      s.onerror = () => {
        const s2 = document.createElement('script');
        s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs';
        s2.type = 'module';
        s2.onload = cb;
        document.head.appendChild(s2);
      };
      s.onload = cb;
      document.head.appendChild(s);
    };

    const arrayBufReader = new FileReader();
    arrayBufReader.onload = async (e) => {
      try {
        // Chargement PDF.js dynamique si besoin
        if(!window.pdfjsLib){
          await new Promise((res, rej) => {
            // Utiliser importmap-compatible CDN
            import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4/build/pdf.min.mjs').then(mod => {
              window.pdfjsLib = mod;
              window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdn.jsdelivr.net/npm/pdfjs-dist@4/build/pdf.worker.min.mjs';
              res();
            }).catch(async () => {
              // Fallback: version UMD
              await new Promise((r2, rej2) => {
                const s = document.createElement('script');
                s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                s.onload = () => {
                  window.pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
                  if(window.pdfjsLib) window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                  r2();
                };
                s.onerror = rej2;
                document.head.appendChild(s);
              });
              res();
            });
          });
        }

        if(bar) bar.style.width = '20%';
        if(sub) sub.textContent = 'Rendu PDF page 1…';

        const pdf  = await window.pdfjsLib.getDocument({ data: e.target.result }).promise;
        const page = await pdf.getPage(1);
        const scale    = 2.5; // haute résolution pour meilleur OCR
        const viewport = page.getViewport({ scale });
        const canvas   = document.createElement('canvas');
        canvas.width   = viewport.width;
        canvas.height  = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        const dataUrl = canvas.toDataURL('image/png');

        // Afficher preview
        const img = document.getElementById('ocr-preview-img');
        if(img){ img.src = dataUrl; img.style.display = 'block'; }

        if(bar) bar.style.width = '35%';
        if(sub) sub.textContent = 'Reconnaissance OCR en cours…';

        if(!window.Tesseract){
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
          s.onload = () => ocrRun(dataUrl, file);
          document.head.appendChild(s);
        } else {
          ocrRun(dataUrl, file);
        }
      } catch(err){
        console.error('PDF render error:', err);
        if(lbl) lbl.textContent = '⚠️ Impossible de lire ce PDF. Essaie une image JPG/PNG.';
        if(sub) sub.textContent = '';
        if(prog) prog.style.display = 'none';
      }
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

  // Afficher les résultats
  ocrRenderResults(info, articles, filename, currency, totalInvoiceValue);
}

/* ── Extraction articles du texte brut ──────────────────────── */
function ocrExtractArticles(text, globalCountry, currency){
  const lines = text.split('\n').map(l=>l.trim()).filter(l=>l.length>3);
  const arts  = [];
  const hsRe  = /\b(\d{6,10})\b/;
  const wRe   = /(\d[\d,.']*)\s*(?:kg|kgs)/i;
  const SKIP  = /^(total|subtotal|tva|tax|shipping|freight|discount|remise|description|article|qty|price|amount|date|invoice|facture|from|to|tel|fax|email|page|bank|swift|iban)/i;

  for(const line of lines){
    const nums = line.match(/\d[\d,.']{0,}/g)||[];
    if(nums.length < 2 || line.length < 10 || line.length > 250) continue;
    const descM = line.match(/^((?:[A-Za-zÀ-ÿ\u4E00-\u9FFF\u0600-\u06FF\s\-\/,\.&%°]{3,})+)/);
    if(!descM) continue;
    const desc = descM[1].trim().replace(/\s+/g,' ').substring(0,100);
    if(desc.length < 4 || SKIP.test(desc)) continue;

    const hs  = (line.match(hsRe)||[])[1] || null;
    const wg  = (line.match(wRe)||[])[1] || null;
    const numV= nums.map(n=>parseFloat(n.replace(/[,\s]/g,'.'))).filter(v=>v>0&&v<1e9);

    arts.push({
      description:   desc,
      quantity:      numV[0] != null ? String(numV[0]) : '—',
      unitPrice:     numV[1] != null ? numV[1].toFixed(2)+' '+currency : '—',
      totalPrice:    numV[2] != null ? numV[2].toFixed(2)+' '+currency : (numV[1] != null ? numV[1].toFixed(2)+' '+currency : '—'),
      _rawPrice:     numV[2] != null ? numV[2] : (numV[1] != null ? numV[1] : 0),
      weight:        wg ? wg+' kg' : '—',
      _rawHS:        hs,
      originCountry: globalCountry || '—',
    });
  }

  const seen = new Set();
  return arts.filter(a=>{
    const k=a.description.substring(0,18).toLowerCase();
    if(seen.has(k)) return false; seen.add(k); return true;
  }).slice(0,20);
}

/* ── Render résultats style HSCodeFinder ────────────────────── */
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

  // Résumé taxes (si calcul activé)
  const summaryGrid = document.getElementById('ocr-summary-grid');
  const totalTaxes  = articles.reduce((s,a)=>s+((a.duty_calc||{}).totalTaxes||0),0);
  const totalLanded = articles.reduce((s,a)=>s+((a.duty_calc||{}).landedCost||0),0);
  const totalCIF    = articles.reduce((s,a)=>s+((a.duty_calc||{}).cifMAD||0),0);
  const hasDuty     = articles.some(a=>a.duty_calc);

  if(hasDuty && summaryGrid){
    summaryGrid.innerHTML = [
      {label:'Valeur CIF totale (MAD)',    value:totalCIF.toFixed(2)+' MAD',    cls:'ocr2-sum-blue'},
      {label:'Taxes totales estimées',     value:totalTaxes.toFixed(2)+' MAD',  cls:'ocr2-sum-orange'},
      {label:'Landed Cost total (MAD)',    value:totalLanded.toFixed(2)+' MAD', cls:'ocr2-sum-green'},
    ].map(c=>`<div class="ocr2-sum-card ${c.cls}">
      <div class="ocr2-sum-label">${c.label}</div>
      <div class="ocr2-sum-value">${c.value}</div>
    </div>`).join('');
    summaryGrid.style.display = 'grid';
  } else if(summaryGrid){
    summaryGrid.style.display = 'none';
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
        </div>` : `
        <div class="ocr2-noduty" style="grid-column:2/-1">
          <i class="fa-solid fa-circle-info"></i> Calcul de droits non disponible${noCode ? ' (code SH non détecté)' : ''}
        </div>`}
      </div>
      ${duty&&duty.fdsApplicable ? `<div class="ocr2-alert ocr2-alert-warn"><i class="fa-solid fa-circle-exclamation"></i> Soumis à la taxe FDS 004801 (protection de l'environnement)</div>` : ''}
      ${a.authorizations&&a.authorizations.length>0 ? `
      <div class="ocr2-alert ocr2-alert-info">
        <i class="fa-solid fa-shield-halved"></i>
        <strong>Autorisations requises :</strong>
        ${a.authorizations.map(au=>`<span class="ocr2-auth-chip ocr2-auth-${au.badge}">${escapeHTML(au.authority)} — ${escapeHTML(au.type)}</span>`).join(' ')}
      </div>` : ''}
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
    body.innerHTML = renderAuthPanel(artList);
  } else {
    body.innerHTML = '<p style="color:#888">Module autorisations non chargé.</p>';
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
