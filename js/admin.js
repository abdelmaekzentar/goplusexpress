/* ═══════════════════════════════════════════════════════════════
   GO PLUS EXPRESS — Administration Backend (localStorage-based)
   Gestion tarifaire & visualisation expéditions/simulations
   ═══════════════════════════════════════════════════════════════ */

/* ── Clés localStorage ── */
const ADM_K = {
  fuel:        'gpe_fuel',
  margins:     'gpe_express_margins',
  maritime:    'gpe_maritime',
  cargo:       'gpe_cargo',
  routier:     'gpe_routier',
  groupage:    'gpe_groupage',
  expeditions: 'gpe_expeditions',
  simulations: 'gpe_simulations',
  cms:         'gpe_cms'
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
    // Export (Maroc → Monde)
    dhl:        { 1:10, 2:10, 3:10, 4:10, 5:10, 6:10, 7:10, 8:10, 9:10 },
    fedex:      { A:10, B:10, C:10, D:10, E:10, F:10, G:10, H:10, I:10 },
    aramex:     { 1:10, 2:10, 3:10, 4:10, 5:10, 6:10 },
    // Import (Monde → Maroc) — mêmes zones, marges distinctes
    dhl_imp:    { 1:12, 2:12, 3:12, 4:12, 5:12, 6:12, 7:12, 8:12, 9:12 },
    fedex_imp:  { A:12, B:12, C:12, D:12, E:12, F:12, G:12, H:12, I:12 },
    aramex_imp: { 1:12, 2:12, 3:12, 4:12, 5:12, 6:12 }
  },
  maritime: {
    // Ports d'origine (Maroc)
    originPorts: [
      { code:'CAS', label:'Casablanca (APMC)',     flag:'🇲🇦' },
      { code:'TNG', label:'Tanger Med',            flag:'🇲🇦' },
      { code:'AGD', label:'Agadir',                flag:'🇲🇦' },
      { code:'NDR', label:'Nador West Med',        flag:'🇲🇦' },
      { code:'SAF', label:'Safi',                  flag:'🇲🇦' },
      { code:'LAY', label:'Laâyoune',              flag:'🇲🇦' }
    ],
    // Pays de destination avec leurs ports
    destinations: [
      { country:'Espagne', code:'ES', flag:'🇪🇸', ports:[
        { code:'ALG', label:'Algésiras',    transit:3  },
        { code:'BCN', label:'Barcelone',    transit:4  },
        { code:'VAL', label:'Valencia',     transit:4  },
        { code:'BIL', label:'Bilbao',       transit:4  }
      ]},
      { country:'France', code:'FR', flag:'🇫🇷', ports:[
        { code:'MRS', label:'Marseille',    transit:5  },
        { code:'LHV', label:'Le Havre',     transit:8  },
        { code:'STE', label:'Sète',         transit:5  },
        { code:'FOS', label:'Fos-sur-Mer',  transit:5  }
      ]},
      { country:'Italie', code:'IT', flag:'🇮🇹', ports:[
        { code:'GEN', label:'Gênes',        transit:7  },
        { code:'LIV', label:'Livourne',     transit:7  },
        { code:'NAP', label:'Naples',       transit:8  },
        { code:'GIO', label:'Gioia Tauro',  transit:7  }
      ]},
      { country:'Belgique', code:'BE', flag:'🇧🇪', ports:[
        { code:'ANT', label:'Anvers',       transit:9  }
      ]},
      { country:'Pays-Bas', code:'NL', flag:'🇳🇱', ports:[
        { code:'RTM', label:'Rotterdam',    transit:9  }
      ]},
      { country:'Allemagne', code:'DE', flag:'🇩🇪', ports:[
        { code:'HAM', label:'Hambourg',     transit:11 },
        { code:'BRE', label:'Brême',        transit:11 }
      ]},
      { country:'Royaume-Uni', code:'GB', flag:'🇬🇧', ports:[
        { code:'FEL', label:'Felixstowe',   transit:11 },
        { code:'SOT', label:'Southampton',  transit:11 },
        { code:'LIV2',label:'Liverpool',    transit:12 }
      ]},
      { country:'Portugal', code:'PT', flag:'🇵🇹', ports:[
        { code:'LIS', label:'Lisbonne (Setúbal)', transit:4 },
        { code:'SIN', label:'Sines',        transit:4  }
      ]},
      { country:'USA', code:'US', flag:'🇺🇸', ports:[
        { code:'NYC', label:'New York',     transit:18 },
        { code:'SAV', label:'Savannah',     transit:19 },
        { code:'LAX', label:'Los Angeles',  transit:22 },
        { code:'MIA', label:'Miami',        transit:18 }
      ]},
      { country:'Canada', code:'CA', flag:'🇨🇦', ports:[
        { code:'MTR', label:'Montréal',     transit:19 },
        { code:'VAN', label:'Vancouver',    transit:25 }
      ]},
      { country:'Chine', code:'CN', flag:'🇨🇳', ports:[
        { code:'SHA', label:'Shanghai',     transit:30 },
        { code:'NGB', label:'Ningbo',       transit:30 },
        { code:'QIN', label:'Qingdao',      transit:32 },
        { code:'GZH', label:'Guangzhou',    transit:32 }
      ]},
      { country:'EAU', code:'AE', flag:'🇦🇪', ports:[
        { code:'JBA', label:'Jebel Ali (Dubai)', transit:20 },
        { code:'ABD', label:'Abu Dhabi',    transit:20 }
      ]},
      { country:'Arabie Saoudite', code:'SA', flag:'🇸🇦', ports:[
        { code:'JED', label:'Jeddah',       transit:20 },
        { code:'DAM', label:'Dammam',       transit:22 }
      ]},
      { country:'Turquie', code:'TR', flag:'🇹🇷', ports:[
        { code:'IST', label:'Istanbul (Ambarli)', transit:8 },
        { code:'MER', label:'Mersin',       transit:8  }
      ]},
      { country:'Inde', code:'IN', flag:'🇮🇳', ports:[
        { code:'NHV', label:'Nhava Sheva (Mumbai)', transit:22 },
        { code:'CHN2',label:'Chennai',      transit:23 }
      ]},
      { country:'Brésil', code:'BR', flag:'🇧🇷', ports:[
        { code:'SNT', label:'Santos',       transit:21 },
        { code:'ITA', label:'Itajaí',       transit:22 }
      ]},
      { country:'Singapour', code:'SG', flag:'🇸🇬', ports:[
        { code:'SGP', label:'Singapour PSA',transit:25 }
      ]},
      { country:'Afrique du Sud', code:'ZA', flag:'🇿🇦', ports:[
        { code:'CPT', label:'Le Cap',       transit:18 },
        { code:'DBN', label:'Durban',       transit:18 }
      ]},
      { country:'Sénégal', code:'SN', flag:'🇸🇳', ports:[
        { code:'DKR', label:'Dakar',        transit:7  }
      ]},
      { country:'Côte d\'Ivoire', code:'CI', flag:'🇨🇮', ports:[
        { code:'ABJ', label:'Abidjan',      transit:8  }
      ]}
    ],
    // Types de conteneurs
    containers: [
      { code:'20GP', label:"20' GP — Standard",     unit:'USD' },
      { code:'40GP', label:"40' GP — Standard",     unit:'USD' },
      { code:'40HC', label:"40' HC — High Cube",    unit:'USD' },
      { code:'45HC', label:"45' HC — High Cube",    unit:'USD' },
      { code:'LCL',  label:'LCL — par CBM (m³)',    unit:'USD' }
    ],
    // Grille tarifaire: rates[originPort][destPort][containerCode] = USD
    rates: {
      CAS: {
        ALG:{ '20GP':900,  '40GP':1400, '40HC':1600, '45HC':1800, LCL:60  },
        MRS:{ '20GP':1100, '40GP':1700, '40HC':1950, '45HC':2200, LCL:75  },
        LHV:{ '20GP':1400, '40GP':2100, '40HC':2400, '45HC':2700, LCL:90  },
        ANT:{ '20GP':1300, '40GP':2000, '40HC':2300, '45HC':2600, LCL:85  },
        RTM:{ '20GP':1350, '40GP':2050, '40HC':2350, '45HC':2650, LCL:88  },
        HAM:{ '20GP':1500, '40GP':2200, '40HC':2500, '45HC':2800, LCL:95  },
        NYC:{ '20GP':2200, '40GP':3500, '40HC':3900, '45HC':4300, LCL:140 },
        JBA:{ '20GP':1800, '40GP':2900, '40HC':3200, '45HC':3600, LCL:120 },
        SHA:{ '20GP':2800, '40GP':4500, '40HC':5000, '45HC':5600, LCL:180 }
      },
      TNG: {
        ALG:{ '20GP':700,  '40GP':1100, '40HC':1300, '45HC':1500, LCL:50  },
        MRS:{ '20GP':900,  '40GP':1400, '40HC':1650, '45HC':1900, LCL:65  },
        ANT:{ '20GP':1100, '40GP':1700, '40HC':2000, '45HC':2300, LCL:75  },
        RTM:{ '20GP':1150, '40GP':1750, '40HC':2050, '45HC':2350, LCL:78  },
        NYC:{ '20GP':2000, '40GP':3200, '40HC':3600, '45HC':4000, LCL:130 }
      }
    },
    // Surcharges
    surcharges: [
      { code:'BAF',  label:'Surcharge carburant (BAF)',  amount:150, unit:'par conteneur' },
      { code:'CAF',  label:'Surcharge change (CAF)',     amount:50,  unit:'par conteneur' },
      { code:'THC',  label:'Frais portuaires (THC)',     amount:120, unit:'par conteneur' },
      { code:'BL',   label:'Connaissement (B/L)',        amount:85,  unit:'par BL'        },
      { code:'ISPS', label:'Sécurité ISPS',              amount:25,  unit:'par conteneur' },
      { code:'IMO',  label:'Surcharge IMO 2020',         amount:75,  unit:'par conteneur' }
    ]
  },
  cargo: {
    airlines: [
      { code:'AT',  name:'Royal Air Maroc',      logo:'https://pics.avs.io/200/200/AT.png',  color:'#C8102E', awb:'147' },
      { code:'AF',  name:'Air France Cargo',     logo:'https://pics.avs.io/200/200/AF.png',  color:'#002395', awb:'057' },
      { code:'EK',  name:'Emirates SkyCargo',    logo:'https://pics.avs.io/200/200/EK.png',  color:'#C8A951', awb:'098' },
      { code:'TK',  name:'Turkish Cargo',        logo:'https://pics.avs.io/200/200/TK.png',  color:'#E30A17', awb:'235' },
      { code:'LH',  name:'Lufthansa Cargo',      logo:'https://pics.avs.io/200/200/LH.png',  color:'#05164D', awb:'020' },
      { code:'QR',  name:'Qatar Airways Cargo',  logo:'https://pics.avs.io/200/200/QR.png',  color:'#5C0632', awb:'157' },
      { code:'EY',  name:'Etihad Cargo',         logo:'https://pics.avs.io/200/200/EY.png',  color:'#C8963C', awb:'607' },
      { code:'MS',  name:'EgyptAir Cargo',       logo:'https://pics.avs.io/200/200/MS.png',  color:'#0D2C6E', awb:'077' },
      { code:'SV',  name:'Saudia Cargo',         logo:'https://pics.avs.io/200/200/SV.png',  color:'#006400', awb:'116' },
      { code:'DL',  name:'Delta Air Lines',       logo:'https://pics.avs.io/200/200/DL.png',  color:'#003366', awb:'006' },
      { code:'AC',  name:'Air Canada Cargo',      logo:'https://pics.avs.io/200/200/AC.png',  color:'#D62B1F', awb:'014' },
      { code:'KL',  name:'KLM Cargo',             logo:'https://pics.avs.io/200/200/KL.png',  color:'#009FDF', awb:'074' },
      { code:'IB',  name:'Iberia Cargo',          logo:'https://pics.avs.io/200/200/IB.png',  color:'#D82027', awb:'075' },
      { code:'CX',  name:'Cathay Cargo',          logo:'https://pics.avs.io/200/200/CX.png',  color:'#006564', awb:'160' },
    ],
    origins: [
      { code:'CMN', label:'Casablanca Mohammed V', flag:'🇲🇦' },
      { code:'RAK', label:'Marrakech Ménara',      flag:'🇲🇦' },
      { code:'AGA', label:'Agadir Al Massira',     flag:'🇲🇦' },
      { code:'TNG', label:'Tanger Ibn Battouta',   flag:'🇲🇦' },
      { code:'FEZ', label:'Fès Saïss',             flag:'🇲🇦' },
    ],
    weightBreaks: [
      { code:'N',     label:'< 45 kg',   minKg:0    },
      { code:'+45',   label:'+ 45 kg',   minKg:45   },
      { code:'+100',  label:'+ 100 kg',  minKg:100  },
      { code:'+250',  label:'+ 250 kg',  minKg:250  },
      { code:'+500',  label:'+ 500 kg',  minKg:500  },
      { code:'+1000', label:'+ 1000 kg', minKg:1000 },
    ],
    exportDests: [
      { country:'France',         code:'FR', flag:'🇫🇷', airports:[
        { code:'CDG', label:'Paris Charles de Gaulle', transit:1 },
        { code:'LYS', label:'Lyon Saint-Exupéry',      transit:2 },
        { code:'MRS', label:'Marseille Provence',       transit:2 },
      ]},
      { country:'Espagne',        code:'ES', flag:'🇪🇸', airports:[
        { code:'MAD', label:'Madrid Barajas',           transit:1 },
        { code:'BCN', label:'Barcelone El Prat',        transit:1 },
      ]},
      { country:'Allemagne',      code:'DE', flag:'🇩🇪', airports:[
        { code:'FRA', label:'Frankfurt am Main',        transit:2 },
        { code:'MUC', label:'Munich',                   transit:2 },
      ]},
      { country:'Royaume-Uni',    code:'GB', flag:'🇬🇧', airports:[
        { code:'LHR', label:'Londres Heathrow',         transit:2 },
        { code:'STN', label:'Londres Stansted',         transit:2 },
      ]},
      { country:'Pays-Bas',       code:'NL', flag:'🇳🇱', airports:[
        { code:'AMS', label:'Amsterdam Schiphol',       transit:2 },
        { code:'LGG', label:'Liège (Cargo)',             transit:2 },
      ]},
      { country:'Belgique',       code:'BE', flag:'🇧🇪', airports:[
        { code:'BRU', label:'Bruxelles Zaventem',       transit:2 },
      ]},
      { country:'Italie',         code:'IT', flag:'🇮🇹', airports:[
        { code:'FCO', label:'Rome Fiumicino',           transit:2 },
        { code:'MXP', label:'Milan Malpensa',           transit:2 },
      ]},
      { country:'Portugal',       code:'PT', flag:'🇵🇹', airports:[
        { code:'LIS', label:'Lisbonne',                 transit:1 },
      ]},
      { country:'Turquie',        code:'TR', flag:'🇹🇷', airports:[
        { code:'IST', label:'Istanbul',                 transit:1 },
      ]},
      { country:'EAU',            code:'AE', flag:'🇦🇪', airports:[
        { code:'DXB', label:'Dubaï International',      transit:1 },
        { code:'AUH', label:'Abu Dhabi',                transit:1 },
        { code:'SHJ', label:'Sharjah (Cargo)',           transit:1 },
      ]},
      { country:'Qatar',          code:'QA', flag:'🇶🇦', airports:[
        { code:'DOH', label:'Doha Hamad',               transit:1 },
      ]},
      { country:'Arabie Saoudite',code:'SA', flag:'🇸🇦', airports:[
        { code:'RUH', label:'Riyad',                    transit:2 },
        { code:'JED', label:'Jeddah',                   transit:2 },
      ]},
      { country:'Chine',          code:'CN', flag:'🇨🇳', airports:[
        { code:'PVG', label:'Shanghai Pudong',          transit:2 },
        { code:'PEK', label:'Pékin Capital',            transit:2 },
        { code:'CAN', label:'Guangzhou Baiyun',         transit:2 },
      ]},
      { country:'Hong Kong',      code:'HK', flag:'🇭🇰', airports:[
        { code:'HKG', label:'Hong Kong International',  transit:2 },
      ]},
      { country:'Singapour',      code:'SG', flag:'🇸🇬', airports:[
        { code:'SIN', label:'Singapour Changi',         transit:2 },
      ]},
      { country:'Inde',           code:'IN', flag:'🇮🇳', airports:[
        { code:'BOM', label:'Mumbai',                   transit:2 },
        { code:'DEL', label:'Delhi',                    transit:2 },
      ]},
      { country:'USA',            code:'US', flag:'🇺🇸', airports:[
        { code:'JFK', label:'New York JFK',             transit:2 },
        { code:'LAX', label:'Los Angeles',              transit:2 },
        { code:'MIA', label:'Miami',                    transit:2 },
        { code:'ORD', label:"Chicago O'Hare",           transit:2 },
      ]},
      { country:'Canada',         code:'CA', flag:'🇨🇦', airports:[
        { code:'YUL', label:'Montréal Trudeau',         transit:2 },
        { code:'YYZ', label:'Toronto Pearson',          transit:2 },
      ]},
      { country:'Égypte',         code:'EG', flag:'🇪🇬', airports:[
        { code:'CAI', label:'Le Caire',                 transit:1 },
      ]},
      { country:'Sénégal',        code:'SN', flag:'🇸🇳', airports:[
        { code:'DKR', label:'Dakar',                    transit:1 },
      ]},
      { country:"Côte d'Ivoire",  code:'CI', flag:'🇨🇮', airports:[
        { code:'ABJ', label:'Abidjan',                  transit:1 },
      ]},
      { country:'Afrique du Sud', code:'ZA', flag:'🇿🇦', airports:[
        { code:'JNB', label:'Johannesburg',             transit:2 },
      ]},
      { country:'Kenya',          code:'KE', flag:'🇰🇪', airports:[
        { code:'NBO', label:'Nairobi',                  transit:2 },
      ]},
    ],
    exportRates: {},
    importRates: {},
    surcharges: [
      { code:'FSC',  label:'Surcharge carburant (FSC)',   amount:0.45, unit:'USD/kg' },
      { code:'SSC',  label:'Surcharge sécurité (SSC)',    amount:0.10, unit:'USD/kg' },
      { code:'AWB',  label:'Frais LTA (AWB fee)',         amount:30,   unit:'USD/LTA' },
      { code:'XRAY', label:'Screening / Rayon X',         amount:0.08, unit:'USD/kg' },
      { code:'CAO',  label:'Cargo Avion seulement (CAO)', amount:0.15, unit:'USD/kg' },
    ]
  },
  routier: {
    // Export : Maroc → Europe
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
    routeRates: {},
    // Import : Europe → Maroc
    importRoutes: [
      { id:'ri-es', from:'Espagne',      to:'Maroc', transit:2, currency:'EUR' },
      { id:'ri-pt', from:'Portugal',     to:'Maroc', transit:3, currency:'EUR' },
      { id:'ri-fr', from:'France',       to:'Maroc', transit:4, currency:'EUR' },
      { id:'ri-be', from:'Belgique',     to:'Maroc', transit:5, currency:'EUR' },
      { id:'ri-nl', from:'Pays-Bas',     to:'Maroc', transit:5, currency:'EUR' },
      { id:'ri-de', from:'Allemagne',    to:'Maroc', transit:5, currency:'EUR' },
      { id:'ri-it', from:'Italie',       to:'Maroc', transit:6, currency:'EUR' },
      { id:'ri-uk', from:'Royaume-Uni',  to:'Maroc', transit:7, currency:'EUR' },
      { id:'ri-tr', from:'Turquie',      to:'Maroc', transit:8, currency:'EUR' },
      { id:'ri-cn', from:'Chine',        to:'Maroc', transit:30, currency:'USD'},
      { id:'ri-ae', from:'EAU (Dubaï)',  to:'Maroc', transit:12, currency:'USD'},
      { id:'ri-us', from:'USA',          to:'Maroc', transit:15, currency:'USD'}
    ],
    importRouteRates: {}
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
  },
  cms: {}   // objet vide par défaut (clés = data-i18n ou data-cms-key)
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
let _admUserRole   = 'client';

/* Onglets réservés admin uniquement */
const ADM_ADMIN_ONLY_TABS = ['fuel','express','maritime','cargo','routier','groupage','cms','users'];

function admInit(role) {
  // ── GARDE DE SÉCURITÉ : bloquer tout accès non autorisé ──
  // ecHasRole est défini dans espace-client.js (chargé avant admin.js)
  if (typeof ecHasRole === 'function' && !ecHasRole('admin', 'backend')) {
    // Cacher le module admin au cas où il serait visible
    const mod = document.getElementById('ecmod-admin');
    if (mod) mod.classList.remove('active');
    // Retourner à l'accueil
    if (typeof ecShowModule === 'function') ecShowModule('accueil');
    return;
  }

  _admUserRole = role || 'client';

  // Masquer/afficher les onglets selon le rôle
  ADM_ADMIN_ONLY_TABS.forEach(t => {
    const el = document.getElementById('adm-tab-' + t);
    if (el) el.style.display = (_admUserRole === 'admin') ? '' : 'none';
  });

  // Onglet par défaut selon le rôle
  const startTab = (_admUserRole === 'admin') ? 'fuel' : 'expeditions';
  admTab(startTab);
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
  if (name === 'cargo')       admRenderCargo();
  if (name === 'routier')     admRenderRoutier();
  if (name === 'groupage')    admRenderGroupage();
  if (name === 'expeditions') admRenderExpeditions();
  if (name === 'simulations') admRenderSimulations();
  if (name === 'cms')         admRenderCMS();
  if (name === 'users')       admRenderUsers();
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
  const fuel    = admLoad('fuel');
  const carriers = ['dhl','fedex','aramex'];

  // ── helper : construit la grille de marges pour un sens ─────
  function buildExpressMarginPanel(direction) {
    const isImport = (direction === 'import');
    const suffix   = isImport ? '_imp' : '';
    const dirId    = isImport ? 'imp' : 'exp';
    let h = `
    <div class="adm-maritime-dir-badge ${isImport ? 'adm-badge-import' : 'adm-badge-export'}" style="margin-bottom:14px">
      <i class="fa-solid fa-${isImport ? 'arrow-down-to-bracket' : 'arrow-up-from-bracket'}"></i>
      ${isImport ? 'IMPORT — Envois entrants vers le Maroc (de partout dans le monde)' : 'EXPORT — Envois sortants depuis le Maroc (vers le monde entier)'}
    </div>
    <div class="adm-carrier-tabs">
      <button class="adm-ctab active" id="adm-ctab-${dirId}-dhl"    onclick="admExpressCarrierTab('dhl','${dirId}')">
        <span style="color:#d40511;font-weight:800">DHL</span>
      </button>
      <button class="adm-ctab" id="adm-ctab-${dirId}-fedex"  onclick="admExpressCarrierTab('fedex','${dirId}')">
        <span style="color:#4d148c;font-weight:800">FedEx</span>
      </button>
      <button class="adm-ctab" id="adm-ctab-${dirId}-aramex" onclick="admExpressCarrierTab('aramex','${dirId}')">
        <span style="color:#ef4123;font-weight:800">Aramex</span>
      </button>
    </div>`;

    carriers.forEach(c => {
      const key     = c + suffix;
      const fuelPct = (fuel[c] && fuel[c].pct != null) ? fuel[c].pct : ADM_DEF.fuel[c].pct;
      const zones   = ADM_ZONE_LABELS[c];
      const defObj  = ADM_DEF.margins[key] || ADM_DEF.margins[c];
      h += `<div class="adm-carrier-panel ${c==='dhl'?'active':''}" id="adm-cpanel-${dirId}-${c}">
        <div class="adm-carrier-header">
          <span class="adm-carrier-badge adm-carrier-${c}">${c.toUpperCase()}</span>
          <span class="adm-fuel-badge"><i class="fa-solid fa-gas-pump"></i> Fuel actuel : <strong>${fuelPct}%</strong></span>
        </div>
        <table class="adm-table adm-margins-table">
          <thead>
            <tr>
              <th>Zone</th><th>Description</th>
              <th style="width:120px">Marge (%)</th>
              <th style="width:160px">Exemple (base 500 MAD)</th>
            </tr>
          </thead>
          <tbody>`;
      Object.entries(zones).forEach(([z, desc]) => {
        const m  = (margins[key] && margins[key][z] != null) ? margins[key][z] : (defObj[z] ?? 10);
        const ex = (500 * (1 + fuelPct/100) * (1 + m/100)).toFixed(0);
        h += `<tr>
          <td><span class="adm-zone-pill">${z}</span></td>
          <td style="font-size:.82rem">${desc}</td>
          <td>
            <div class="adm-input-row-sm">
              <input type="number" class="adm-input adm-input-sm"
                data-carrier="${key}" data-zone="${z}"
                value="${m}" min="-50" max="500" step="0.5"
                onchange="admUpdateMarginPreview(this,${fuelPct},'${dirId}')"/>
              <span>%</span>
            </div>
          </td>
          <td class="adm-preview-cell" id="adm-prev-${dirId}-${key}-${z}">${ex} MAD</td>
        </tr>`;
      });
      h += `</tbody></table></div>`;
    });

    h += `<div class="adm-actions">
      <button class="adm-btn adm-btn-primary" onclick="admSaveMargins()">
        <i class="fa-solid fa-floppy-disk"></i> Enregistrer les marges ${isImport ? 'import' : 'export'}
      </button>
    </div>`;
    return h;
  }

  const html = `
  <div class="adm-section-intro">
    <i class="fa-solid fa-percent adm-intro-icon"></i>
    <div>
      <strong>Marges commerciales Express — DHL · FedEx · Aramex</strong>
      <span>Export (Maroc → Monde) et Import (Monde → Maroc) — Prix final = Base × (1 + Fuel%) × (1 + Marge%)</span>
    </div>
  </div>

  <div class="adm-sub-tabs">
    <button class="adm-stab active" id="adm-stab-express-export" onclick="admSubTab('express','export')">
      <i class="fa-solid fa-arrow-up-from-bracket"></i> Export (Maroc → Monde)
    </button>
    <button class="adm-stab" id="adm-stab-express-import" onclick="admSubTab('express','import')">
      <i class="fa-solid fa-arrow-down-to-bracket"></i> Import (Monde → Maroc)
    </button>
  </div>

  <div class="adm-sub-panel active" id="adm-sub-express-export">
    ${buildExpressMarginPanel('export')}
  </div>

  <div class="adm-sub-panel" id="adm-sub-express-import">
    ${buildExpressMarginPanel('import')}
  </div>`;

  document.getElementById('adm-panel-express').innerHTML = html;
}

function admExpressCarrierTab(carrier, dirId) {
  // Scope dans le bon panneau de direction
  const prefix = dirId ? `adm-ctab-${dirId}-` : 'adm-ctab-';
  const panelPrefix = dirId ? `adm-cpanel-${dirId}-` : 'adm-cpanel-';
  const scope = dirId
    ? document.getElementById(`adm-sub-express-${dirId === 'imp' ? 'import' : 'export'}`)
    : document;
  if (!scope) return;
  scope.querySelectorAll('.adm-ctab').forEach(t => t.classList.remove('active'));
  scope.querySelectorAll('.adm-carrier-panel').forEach(p => p.classList.remove('active'));
  const t = document.getElementById(prefix + carrier);
  const p = document.getElementById(panelPrefix + carrier);
  if (t) t.classList.add('active');
  if (p) p.classList.add('active');
}

function admUpdateMarginPreview(inp, fuelPct, dirId) {
  const m       = parseFloat(inp.value) || 0;
  const carrier = inp.dataset.carrier;
  const zone    = inp.dataset.zone;
  const id      = dirId
    ? `adm-prev-${dirId}-${carrier}-${zone}`
    : `adm-prev-${carrier}-${zone}`;
  const prev = document.getElementById(id);
  if (prev) prev.textContent = (500 * (1 + fuelPct/100) * (1 + m/100)).toFixed(0) + ' MAD';
}

function admSaveMargins() {
  const margins = admLoad('margins');
  // Récupère TOUS les inputs (export + import) — data-carrier contient déjà le bon suffixe
  document.querySelectorAll('[data-carrier][data-zone]').forEach(inp => {
    const c = inp.dataset.carrier;  // ex: 'dhl', 'dhl_imp'
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
/* ── Variable pour garder le port d'origine sélectionné ── */
let _admMaritimeOrigin     = null;
let _admMaritimeImportDest = null;

function admRenderMaritime() {
  const data = admLoad('maritime');
  // Migration: si ancienne structure, utiliser les defaults
  if (!data.originPorts)   data.originPorts   = JSON.parse(JSON.stringify(ADM_DEF.maritime.originPorts));
  if (!data.destinations)  data.destinations  = JSON.parse(JSON.stringify(ADM_DEF.maritime.destinations));
  if (!data.containers)    data.containers    = JSON.parse(JSON.stringify(ADM_DEF.maritime.containers));
  if (!data.rates)         data.rates         = JSON.parse(JSON.stringify(ADM_DEF.maritime.rates));
  if (!data.surcharges)    data.surcharges    = JSON.parse(JSON.stringify(ADM_DEF.maritime.surcharges));
  if (!data.importRates)   data.importRates   = {};

  if (!_admMaritimeOrigin || !data.originPorts.find(p => p.code === _admMaritimeOrigin)) {
    _admMaritimeOrigin = data.originPorts[0]?.code || 'CAS';
  }
  if (!_admMaritimeImportDest || !data.originPorts.find(p => p.code === _admMaritimeImportDest)) {
    _admMaritimeImportDest = data.originPorts[0]?.code || 'CAS';
  }

  let html = `
  <div class="adm-section-intro">
    <i class="fa-solid fa-ship adm-intro-icon"></i>
    <div>
      <strong>Tarifs fret maritime — Grille par Port · Pays · Type de conteneur</strong>
      <span>Export : Maroc → Monde | Import : Monde → Maroc</span>
    </div>
  </div>

  <div class="adm-sub-tabs">
    <button class="adm-stab active" id="adm-stab-maritime-grid" onclick="admSubTab('maritime','grid')">
      <i class="fa-solid fa-arrow-up-from-bracket"></i> Export (Maroc → Monde)
    </button>
    <button class="adm-stab" id="adm-stab-maritime-import" onclick="admSubTab('maritime','import');admRenderImportGrid()">
      <i class="fa-solid fa-arrow-down-to-bracket"></i> Import (Monde → Maroc)
    </button>
    <button class="adm-stab" id="adm-stab-maritime-containers" onclick="admSubTab('maritime','containers')">
      <i class="fa-solid fa-boxes-stacked"></i> Types de conteneurs
    </button>
    <button class="adm-stab" id="adm-stab-maritime-ports" onclick="admSubTab('maritime','ports')">
      <i class="fa-solid fa-anchor"></i> Ports & Pays
    </button>
    <button class="adm-stab" id="adm-stab-maritime-surcharges" onclick="admSubTab('maritime','surcharges')">
      <i class="fa-solid fa-plus-circle"></i> Surcharges
    </button>
  </div>

  <!-- ═══ GRILLE EXPORT ═══ -->
  <div class="adm-sub-panel active" id="adm-sub-maritime-grid">

    <div class="adm-maritime-dir-badge adm-badge-export">
      <i class="fa-solid fa-arrow-up-from-bracket"></i>
      EXPORT — Départ depuis un port marocain vers les ports du monde
    </div>

    <div class="adm-maritime-origin-bar">
      <label><i class="fa-solid fa-anchor"></i> Port d'origine (Maroc) :</label>
      <div class="adm-origin-pills">
        ${data.originPorts.map(p => `
          <button class="adm-origin-pill ${p.code===_admMaritimeOrigin?'active':''}"
            onclick="admSetMaritimeOrigin('${p.code}')">
            ${p.flag||'🇲🇦'} ${p.label}
          </button>`).join('')}
      </div>
    </div>

    <div style="overflow-x:auto" id="adm-maritime-grid-wrap">
      ${admBuildRatesGrid(data, _admMaritimeOrigin)}
    </div>

    <div class="adm-actions">
      <button class="adm-btn adm-btn-primary" onclick="admSaveMaritimeRates()">
        <i class="fa-solid fa-floppy-disk"></i> Enregistrer les tarifs export
      </button>
      <button class="adm-btn adm-btn-ghost" onclick="admCopyRatesFromPort()">
        <i class="fa-solid fa-copy"></i> Copier depuis…
      </button>
      <span style="font-size:.78rem;color:#94a3b8;margin-left:4px">
        <i class="fa-solid fa-circle-info"></i> Laisser vide = pas de tarif pour cette route
      </span>
    </div>
  </div>

  <!-- ═══ GRILLE IMPORT ═══ -->
  <div class="adm-sub-panel" id="adm-sub-maritime-import">

    <div class="adm-maritime-dir-badge adm-badge-import">
      <i class="fa-solid fa-arrow-down-to-bracket"></i>
      IMPORT — Arrivée vers un port marocain depuis les ports du monde
    </div>

    <div class="adm-maritime-origin-bar">
      <label><i class="fa-solid fa-anchor"></i> Port de destination (Maroc) :</label>
      <div class="adm-origin-pills" id="adm-import-dest-pills">
        ${data.originPorts.map(p => `
          <button class="adm-origin-pill ${p.code===_admMaritimeImportDest?'active':''}"
            onclick="admSetMaritimeImportDest('${p.code}')">
            ${p.flag||'🇲🇦'} ${p.label}
          </button>`).join('')}
      </div>
    </div>

    <div style="overflow-x:auto" id="adm-maritime-import-grid-wrap">
      <div class="adm-inline-info"><i class="fa-solid fa-circle-info"></i> Cliquez sur l'onglet Import pour charger la grille.</div>
    </div>

    <div class="adm-actions">
      <button class="adm-btn adm-btn-primary" onclick="admSaveMaritimeImportRates()">
        <i class="fa-solid fa-floppy-disk"></i> Enregistrer les tarifs import
      </button>
      <span style="font-size:.78rem;color:#94a3b8;margin-left:4px">
        <i class="fa-solid fa-circle-info"></i> Laisser vide = pas de tarif pour cette route
      </span>
    </div>
  </div>

  <!-- ═══ TYPES DE CONTENEURS ═══ -->
  <div class="adm-sub-panel" id="adm-sub-maritime-containers">
    <h4 class="adm-sub-title">Types de conteneurs — libellés et unités</h4>
    <table class="adm-table" style="max-width:600px">
      <thead><tr><th>Code</th><th>Libellé</th><th>Unité</th></tr></thead>
      <tbody>
        ${data.containers.map((c,i) => `<tr>
          <td><span class="adm-zone-pill">${c.code}</span></td>
          <td><input type="text" class="adm-input" data-cont-label="${i}" value="${c.label}" style="max-width:260px"/></td>
          <td><input type="text" class="adm-input" data-cont-unit="${i}" value="${c.unit||'USD'}" style="max-width:80px"/></td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div class="adm-actions">
      <button class="adm-btn adm-btn-primary" onclick="admSaveMaritimeContainers()">
        <i class="fa-solid fa-floppy-disk"></i> Enregistrer
      </button>
    </div>
  </div>

  <!-- ═══ PORTS & PAYS ═══ -->
  <div class="adm-sub-panel" id="adm-sub-maritime-ports">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">

      <div>
        <h4 class="adm-sub-title"><i class="fa-solid fa-anchor" style="color:var(--teal)"></i> Ports d'origine (Maroc)</h4>
        <table class="adm-table" style="font-size:.82rem">
          <thead><tr><th>Code</th><th>Nom du port</th><th>Flag</th></tr></thead>
          <tbody>
            ${data.originPorts.map((p,i) => `<tr>
              <td><input type="text" class="adm-input adm-input-sm" data-orig-code="${i}" value="${p.code}" style="width:65px;text-transform:uppercase"/></td>
              <td><input type="text" class="adm-input" data-orig-label="${i}" value="${p.label}" style="max-width:200px"/></td>
              <td><input type="text" class="adm-input adm-input-sm" data-orig-flag="${i}" value="${p.flag||'🇲🇦'}" style="width:50px"/></td>
            </tr>`).join('')}
          </tbody>
        </table>
        <div class="adm-actions">
          <button class="adm-btn adm-btn-primary" onclick="admSaveOriginPorts()">
            <i class="fa-solid fa-floppy-disk"></i> Enregistrer
          </button>
        </div>
      </div>

      <div>
        <h4 class="adm-sub-title"><i class="fa-solid fa-globe" style="color:var(--teal)"></i> Pays & Ports de destination</h4>
        <div style="max-height:480px;overflow-y:auto">
          ${data.destinations.map((dest, di) => `
          <div class="adm-dest-country">
            <div class="adm-dest-header">
              ${dest.flag} <strong>${dest.country}</strong>
              <span class="adm-badge adm-badge-blue" style="margin-left:6px">${dest.ports.length} port(s)</span>
            </div>
            <table class="adm-table" style="font-size:.79rem;margin-bottom:0">
              <thead><tr><th>Code</th><th>Nom du port</th><th>Transit (j)</th></tr></thead>
              <tbody>
                ${dest.ports.map((port, pi) => `<tr>
                  <td><input type="text" class="adm-input adm-input-sm" data-dest-pcode="${di}-${pi}" value="${port.code}" style="width:60px;text-transform:uppercase"/></td>
                  <td><input type="text" class="adm-input" data-dest-plabel="${di}-${pi}" value="${port.label}" style="max-width:180px"/></td>
                  <td><input type="number" class="adm-input adm-input-sm" data-dest-transit="${di}-${pi}" value="${port.transit||7}" min="1" style="width:55px"/></td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>`).join('')}
        </div>
        <div class="adm-actions">
          <button class="adm-btn adm-btn-primary" onclick="admSaveDestPorts()">
            <i class="fa-solid fa-floppy-disk"></i> Enregistrer les ports
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- ═══ SURCHARGES ═══ -->
  <div class="adm-sub-panel" id="adm-sub-maritime-surcharges">
    <h4 class="adm-sub-title">Surcharges maritimes (USD / par conteneur sauf mention)</h4>
    <table class="adm-table" style="max-width:580px">
      <thead><tr><th>Code</th><th>Libellé</th><th>Montant</th><th>Unité</th></tr></thead>
      <tbody>
        ${data.surcharges.map((s,i) => `<tr>
          <td><span class="adm-zone-pill" style="font-size:.7rem">${s.code}</span></td>
          <td><input type="text" class="adm-input" data-surch-label="${i}" value="${s.label}" style="max-width:240px"/></td>
          <td><input type="number" class="adm-input adm-input-sm" data-surch-amt="${i}" value="${s.amount}" min="0" style="width:90px"/></td>
          <td><input type="text" class="adm-input" data-surch-unit="${i}" value="${s.unit}" style="max-width:130px"/></td>
        </tr>`).join('')}
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

/* ── Construit la grille tarifaire pour un port d'origine ── */
function admBuildRatesGrid(data, originCode) {
  const conts = data.containers || ADM_DEF.maritime.containers;
  const rates = (data.rates && data.rates[originCode]) || {};
  const dests  = data.destinations || ADM_DEF.maritime.destinations;

  let html = `
  <table class="adm-table adm-maritime-grid" style="min-width:750px">
    <thead>
      <tr>
        <th style="min-width:80px">Pays</th>
        <th style="min-width:140px">Port de destination</th>
        <th style="min-width:65px">Transit</th>
        ${conts.map(c => `<th style="min-width:100px;text-align:center">
          <span class="adm-zone-pill">${c.code}</span><br>
          <span style="font-size:.7rem;font-weight:400">${c.unit||'USD'}</span>
        </th>`).join('')}
      </tr>
    </thead>
    <tbody>`;

  dests.forEach(dest => {
    dest.ports.forEach((port, pi) => {
      const portRates = rates[port.code] || {};
      html += `
      <tr class="adm-grid-row">
        ${pi === 0 ? `<td rowspan="${dest.ports.length}" class="adm-country-cell">
          <span style="font-size:1.2rem">${dest.flag}</span><br>
          <strong style="font-size:.82rem">${dest.country}</strong>
        </td>` : ''}
        <td style="font-size:.83rem;font-weight:600">${port.label}</td>
        <td style="text-align:center">
          <input type="number" class="adm-input adm-input-sm"
            data-mt-transit="${originCode}|${port.code}"
            value="${port.transit||7}" min="1" style="width:50px;text-align:center"/>j
        </td>
        ${conts.map(c => `
          <td>
            <input type="number" class="adm-input adm-input-sm adm-rate-inp"
              data-mt-rate="${originCode}|${port.code}|${c.code}"
              value="${portRates[c.code]||''}" min="0" step="10"
              placeholder="—" style="width:88px;text-align:right"/>
          </td>`).join('')}
      </tr>`;
    });
  });

  html += `</tbody></table>`;
  return html;
}

/* ── Construit la grille IMPORT pour un port marocain de destination ── */
function admBuildImportGrid(data, marocPortCode) {
  const conts = data.containers || ADM_DEF.maritime.containers;
  const importRates = (data.importRates && data.importRates[marocPortCode]) || {};
  const dests = data.destinations || ADM_DEF.maritime.destinations;

  let html = `
  <table class="adm-table adm-maritime-grid" style="min-width:750px">
    <thead>
      <tr>
        <th style="min-width:80px">Pays d'origine</th>
        <th style="min-width:140px">Port d'origine</th>
        <th style="min-width:65px">Transit</th>
        ${conts.map(c => `<th style="min-width:100px;text-align:center">
          <span class="adm-zone-pill">${c.code}</span><br>
          <span style="font-size:.7rem;font-weight:400">${c.unit||'USD'}</span>
        </th>`).join('')}
      </tr>
    </thead>
    <tbody>`;

  dests.forEach(dest => {
    dest.ports.forEach((port, pi) => {
      const portRates = importRates[port.code] || {};
      html += `
      <tr class="adm-grid-row">
        ${pi === 0 ? `<td rowspan="${dest.ports.length}" class="adm-country-cell">
          <span style="font-size:1.2rem">${dest.flag}</span><br>
          <strong style="font-size:.82rem">${dest.country}</strong>
        </td>` : ''}
        <td style="font-size:.83rem;font-weight:600">${port.label}</td>
        <td style="text-align:center">
          <input type="number" class="adm-input adm-input-sm"
            data-mt-imp-transit="${marocPortCode}|${port.code}"
            value="${port.transit||7}" min="1" style="width:50px;text-align:center"/>j
        </td>
        ${conts.map(c => `
          <td>
            <input type="number" class="adm-input adm-input-sm adm-rate-inp"
              data-mt-imp-rate="${marocPortCode}|${port.code}|${c.code}"
              value="${portRates[c.code]||''}" min="0" step="10"
              placeholder="—" style="width:88px;text-align:right"/>
          </td>`).join('')}
      </tr>`;
    });
  });

  html += `</tbody></table>`;
  return html;
}

/* ── Rendu asynchrone de la grille import (appelé quand l'onglet s'ouvre) ── */
function admRenderImportGrid() {
  const data = admLoad('maritime');
  if (!data.importRates) data.importRates = {};
  const wrap = document.getElementById('adm-maritime-import-grid-wrap');
  if (wrap) wrap.innerHTML = admBuildImportGrid(data, _admMaritimeImportDest);
}

/* ── Changer le port de destination import sélectionné ── */
function admSetMaritimeImportDest(code) {
  admCollectMaritimeImportRates();
  _admMaritimeImportDest = code;

  // Mettre à jour les pills du panneau import
  const pillsBar = document.getElementById('adm-import-dest-pills');
  if (pillsBar) {
    pillsBar.querySelectorAll('.adm-origin-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(`'${code}'`));
    });
  }

  // Recharger la grille import
  const data = admLoad('maritime');
  const wrap = document.getElementById('adm-maritime-import-grid-wrap');
  if (wrap) wrap.innerHTML = admBuildImportGrid(data, code);
}

/* ── Collecter les rates import depuis le DOM ── */
function admCollectMaritimeImportRates() {
  const inputs = document.querySelectorAll('[data-mt-imp-rate]');
  if (!inputs.length) return;

  const data = admLoad('maritime');
  if (!data.importRates) data.importRates = {};

  inputs.forEach(inp => {
    const [marocPort, worldPort, cont] = inp.dataset.mtImpRate.split('|');
    const val = inp.value.trim();
    if (!data.importRates[marocPort]) data.importRates[marocPort] = {};
    if (!data.importRates[marocPort][worldPort]) data.importRates[marocPort][worldPort] = {};
    if (val === '' || val === '0') {
      delete data.importRates[marocPort][worldPort][cont];
    } else {
      data.importRates[marocPort][worldPort][cont] = parseFloat(val) || 0;
    }
  });

  admSave('maritime', data);
  return data;
}

/* ── Sauvegarder les rates import ── */
function admSaveMaritimeImportRates() {
  admCollectMaritimeImportRates();
  admToast('✅ Tarifs import maritimes enregistrés !');
}

/* ── Changer le port d'origine sélectionné (EXPORT) ── */
function admSetMaritimeOrigin(code) {
  // Sauvegarder d'abord les valeurs en cours
  admCollectMaritimeRates();
  _admMaritimeOrigin = code;

  // Mettre à jour les pills
  document.querySelectorAll('#adm-sub-maritime-grid .adm-origin-pill').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(`'${code}'`));
  });

  // Recharger la grille
  const data = admLoad('maritime');
  const wrap = document.getElementById('adm-maritime-grid-wrap');
  if (wrap) wrap.innerHTML = admBuildRatesGrid(data, code);
}

/* ── Collecter les rates depuis le DOM ── */
function admCollectMaritimeRates() {
  const data = admLoad('maritime');
  if (!data.rates) data.rates = {};

  document.querySelectorAll('[data-mt-rate]').forEach(inp => {
    const [orig, dest, cont] = inp.dataset.mtRate.split('|');
    const val = inp.value.trim();
    if (!data.rates[orig]) data.rates[orig] = {};
    if (!data.rates[orig][dest]) data.rates[orig][dest] = {};
    if (val === '' || val === '0') {
      delete data.rates[orig][dest][cont];
    } else {
      data.rates[orig][dest][cont] = parseFloat(val) || 0;
    }
  });

  // Transit times
  document.querySelectorAll('[data-mt-transit]').forEach(inp => {
    const [orig, dest] = inp.dataset.mtTransit.split('|');
    const days = parseInt(inp.value) || 7;
    // Mettre à jour le transit dans les destinations
    if (data.destinations) {
      data.destinations.forEach(country => {
        const port = country.ports.find(p => p.code === dest);
        if (port) port.transit = days;
      });
    }
  });

  admSave('maritime', data);
  return data;
}

/* ── Sauvegarder les rates ── */
function admSaveMaritimeRates() {
  admCollectMaritimeRates();
  admToast('✅ Tarifs maritimes enregistrés !');
}

/* ── Copy rates from another origin port ── */
function admCopyRatesFromPort() {
  const data = admLoad('maritime');
  const origins = data.originPorts || [];
  const others  = origins.filter(p => p.code !== _admMaritimeOrigin);
  if (!others.length) { admToast('Aucun autre port à copier.', false); return; }
  const opts   = others.map(p => p.code + ' — ' + p.label).join('\n');
  const choice = prompt(`Copier les tarifs de quel port ?\n\n${opts}\n\n(Entrez le code, ex: CAS)`);
  if (!choice) return;
  const src = others.find(p => p.code.toLowerCase() === choice.trim().toUpperCase());
  if (!src) { admToast('Code port invalide.', false); return; }
  if (!data.rates) data.rates = {};
  data.rates[_admMaritimeOrigin] = JSON.parse(JSON.stringify(data.rates[src.code] || {}));
  admSave('maritime', data);
  const wrap = document.getElementById('adm-maritime-grid-wrap');
  if (wrap) wrap.innerHTML = admBuildRatesGrid(data, _admMaritimeOrigin);
  admToast(`✅ Tarifs copiés depuis ${src.code} vers ${_admMaritimeOrigin} !`);
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

function admSaveOriginPorts() {
  const data = admLoad('maritime');
  if (!data.originPorts) data.originPorts = JSON.parse(JSON.stringify(ADM_DEF.maritime.originPorts));
  document.querySelectorAll('[data-orig-code]').forEach(inp => {
    const i = parseInt(inp.dataset.origCode);
    if (data.originPorts[i]) data.originPorts[i].code = inp.value.toUpperCase().trim();
  });
  document.querySelectorAll('[data-orig-label]').forEach(inp => {
    const i = parseInt(inp.dataset.origLabel);
    if (data.originPorts[i]) data.originPorts[i].label = inp.value;
  });
  document.querySelectorAll('[data-orig-flag]').forEach(inp => {
    const i = parseInt(inp.dataset.origFlag);
    if (data.originPorts[i]) data.originPorts[i].flag = inp.value;
  });
  admSave('maritime', data);
  admToast('✅ Ports d\'origine enregistrés !');
}

function admSaveDestPorts() {
  const data = admLoad('maritime');
  if (!data.destinations) data.destinations = JSON.parse(JSON.stringify(ADM_DEF.maritime.destinations));
  document.querySelectorAll('[data-dest-pcode]').forEach(inp => {
    const [di, pi] = inp.dataset.destPcode.split('-').map(Number);
    if (data.destinations[di]?.ports[pi]) data.destinations[di].ports[pi].code = inp.value.toUpperCase().trim();
  });
  document.querySelectorAll('[data-dest-plabel]').forEach(inp => {
    const [di, pi] = inp.dataset.destPlabel.split('-').map(Number);
    if (data.destinations[di]?.ports[pi]) data.destinations[di].ports[pi].label = inp.value;
  });
  document.querySelectorAll('[data-dest-transit]').forEach(inp => {
    const [di, pi] = inp.dataset.destTransit.split('-').map(Number);
    if (data.destinations[di]?.ports[pi]) data.destinations[di].ports[pi].transit = parseInt(inp.value) || 7;
  });
  admSave('maritime', data);
  admToast('✅ Ports de destination enregistrés !');
}

function admSaveMaritimeSurcharges() {
  const data = admLoad('maritime');
  if (!data.surcharges) data.surcharges = JSON.parse(JSON.stringify(ADM_DEF.maritime.surcharges));
  const labels  = [...document.querySelectorAll('[data-surch-label]')];
  const amounts = [...document.querySelectorAll('[data-surch-amt]')];
  const units   = [...document.querySelectorAll('[data-surch-unit]')];
  data.surcharges = labels.map((l, i) => ({
    code:   data.surcharges[i]?.code || String(i),
    label:  l.value,
    amount: parseFloat(amounts[i]?.value) || 0,
    unit:   units[i]?.value || ''
  }));
  admSave('maritime', data);
  admToast('✅ Surcharges maritimes enregistrées !');
}

/* ══════════════════════════════════════════════
   PANEL 3B — FRET CARGO AÉRIEN
══════════════════════════════════════════════ */
let _admCargoOrigin  = null;
let _admCargoAirline = null;
let _admCargoDir     = 'export'; // 'export' | 'import'

// ── Helper : affiche le logo ou un badge coloré ───────────────
function admCargoLogoHtml(al, size=36) {
  if (al.logo) {
    return `<img src="${al.logo}" alt="${al.code}" style="height:${size}px;max-width:${size*2.5}px;object-fit:contain"
      onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex'">
      <span class="cargo-airline-code-badge" style="display:none;background:${al.color||'#334155'}">${al.code}</span>`;
  }
  return `<span class="cargo-airline-code-badge" style="background:${al.color||'#334155'}">${al.code}</span>`;
}

function admRenderCargo() {
  const data = admLoad('cargo');
  if (!data.airlines)     data.airlines     = JSON.parse(JSON.stringify(ADM_DEF.cargo.airlines));
  if (!data.origins)      data.origins      = JSON.parse(JSON.stringify(ADM_DEF.cargo.origins));
  if (!data.weightBreaks) data.weightBreaks = JSON.parse(JSON.stringify(ADM_DEF.cargo.weightBreaks));
  if (!data.exportDests)  data.exportDests  = JSON.parse(JSON.stringify(ADM_DEF.cargo.exportDests));
  if (!data.exportRates)  data.exportRates  = {};
  if (!data.importRates)  data.importRates  = {};
  if (!data.surcharges)   data.surcharges   = JSON.parse(JSON.stringify(ADM_DEF.cargo.surcharges));

  if (!_admCargoOrigin  || !data.origins.find(o=>o.code===_admCargoOrigin))
    _admCargoOrigin  = data.origins[0]?.code || 'CMN';
  if (!_admCargoAirline || !data.airlines.find(a=>a.code===_admCargoAirline))
    _admCargoAirline = data.airlines[0]?.code || 'AT';

  const html = `
  <div class="adm-section-intro">
    <i class="fa-solid fa-plane-departure adm-intro-icon"></i>
    <div>
      <strong>Tarifs Fret Cargo Aérien — par Compagnie · Destination · Tranche de poids</strong>
      <span>Export (Maroc → Monde) · Import (Monde → Maroc) · Prix en USD/kg selon tranches IATA</span>
    </div>
  </div>

  <div class="adm-sub-tabs">
    <button class="adm-stab active" id="adm-stab-cargo-export" onclick="admSubTab('cargo','export');admRenderCargoGrid()">
      <i class="fa-solid fa-arrow-up-from-bracket"></i> Export (Maroc → Monde)
    </button>
    <button class="adm-stab" id="adm-stab-cargo-import" onclick="admSubTab('cargo','import');_admCargoDir='import';admRenderCargoGrid()">
      <i class="fa-solid fa-arrow-down-to-bracket"></i> Import (Monde → Maroc)
    </button>
    <button class="adm-stab" id="adm-stab-cargo-airlines" onclick="admSubTab('cargo','airlines')">
      <i class="fa-solid fa-plane-circle-check"></i> Compagnies Aériennes
    </button>
    <button class="adm-stab" id="adm-stab-cargo-airports" onclick="admSubTab('cargo','airports')">
      <i class="fa-solid fa-location-dot"></i> Aéroports
    </button>
    <button class="adm-stab" id="adm-stab-cargo-surcharges" onclick="admSubTab('cargo','surcharges')">
      <i class="fa-solid fa-plus-circle"></i> Surcharges
    </button>
    <button class="adm-stab" id="adm-stab-cargo-margins" onclick="admSubTab('cargo','margins')">
      <i class="fa-solid fa-percent"></i> Marges & Tarification
    </button>
  </div>

  <!-- ═══ GRILLE EXPORT ═══ -->
  <div class="adm-sub-panel active" id="adm-sub-cargo-export">
    ${admBuildCargoGridPanel(data, 'export')}
  </div>

  <!-- ═══ GRILLE IMPORT ═══ -->
  <div class="adm-sub-panel" id="adm-sub-cargo-import">
    <div class="adm-inline-info"><i class="fa-solid fa-circle-info"></i> Cliquez sur l'onglet Import pour charger la grille.</div>
  </div>

  <!-- ═══ COMPAGNIES AÉRIENNES ═══ -->
  <div class="adm-sub-panel" id="adm-sub-cargo-airlines">
    ${admBuildCargoAirlinesPanel(data)}
  </div>

  <!-- ═══ AÉROPORTS ═══ -->
  <div class="adm-sub-panel" id="adm-sub-cargo-airports">
    ${admBuildCargoAirportsPanel(data)}
  </div>

  <!-- ═══ SURCHARGES ═══ -->
  <div class="adm-sub-panel" id="adm-sub-cargo-surcharges">
    ${admBuildCargoSurchargesPanel(data)}
  </div>

  <!-- ═══ MARGES & TARIFICATION ═══ -->
  <div class="adm-sub-panel" id="adm-sub-cargo-margins">
    ${admBuildCargoMarginsPanel(data)}
  </div>`;

  document.getElementById('adm-panel-cargo').innerHTML = html;
  // On initialise l'état
  _admCargoDir = 'export';
}

// ── Construit le panneau grille (export ou import) ────────────
function admBuildCargoGridPanel(data, dir) {
  const airlines = data.airlines || [];
  const origins  = data.origins  || [];
  const selAl = airlines.find(a=>a.code===_admCargoAirline) || airlines[0];
  const selOr = _admCargoOrigin;

  return `
    <div class="adm-maritime-dir-badge ${dir==='export'?'adm-badge-export':'adm-badge-import'}">
      <i class="fa-solid fa-${dir==='export'?'arrow-up-from-bracket':'arrow-down-to-bracket'}"></i>
      ${dir==='export'
        ? 'EXPORT — Départ depuis un aéroport marocain vers le monde'
        : 'IMPORT — Arrivée vers un aéroport marocain depuis le monde'}
    </div>

    <!-- Sélection airline -->
    <div class="cargo-airline-selector">
      <div class="cargo-al-label"><i class="fa-solid fa-plane-up"></i> Compagnie aérienne :</div>
      <div class="cargo-al-cards" id="cargo-al-cards-${dir}">
        ${airlines.map(al=>`
          <button class="cargo-al-card ${al.code===_admCargoAirline?'active':''}"
            onclick="admSetCargoAirline('${al.code}','${dir}')"
            title="${al.name}">
            ${admCargoLogoHtml(al, 32)}
            <span class="cargo-al-card-name">${al.name}</span>
          </button>`).join('')}
      </div>
    </div>

    <!-- Sélection origine -->
    <div class="adm-maritime-origin-bar">
      <label><i class="fa-solid fa-location-dot"></i> ${dir==='export'?'Aéroport d\'origine':'Aéroport de destination'} (Maroc) :</label>
      <div class="adm-origin-pills" id="cargo-origin-pills-${dir}">
        ${origins.map(o=>`
          <button class="adm-origin-pill ${o.code===selOr?'active':''}"
            onclick="admSetCargoOrigin('${o.code}','${dir}')">
            ${o.flag} ${o.label}
          </button>`).join('')}
      </div>
    </div>

    <!-- Grille tarifaire -->
    <div style="overflow-x:auto" id="cargo-grid-wrap-${dir}">
      ${admBuildCargoRatesTable(data, dir, _admCargoOrigin, _admCargoAirline)}
    </div>

    <div class="adm-actions">
      <button class="adm-btn adm-btn-primary" onclick="admSaveCargoRates('${dir}')">
        <i class="fa-solid fa-floppy-disk"></i> Enregistrer les tarifs ${dir==='export'?'export':'import'}
      </button>
      <span style="font-size:.77rem;color:#94a3b8;margin-left:8px">
        <i class="fa-solid fa-circle-info"></i> Prix en USD/kg · Laisser vide = non desservi
      </span>
    </div>`;
}

// ── Construit la table de tarifs ──────────────────────────────
function admBuildCargoRatesTable(data, dir, originCode, airlineCode) {
  const wbs   = data.weightBreaks || ADM_DEF.cargo.weightBreaks;
  const dests = data.exportDests  || ADM_DEF.cargo.exportDests;
  const ratesStore = dir==='export' ? (data.exportRates||{}) : (data.importRates||{});
  const airlineRates = (ratesStore[originCode]?.[airlineCode]) || {};

  let html = `
  <table class="adm-table cargo-rates-table" style="min-width:700px">
    <thead>
      <tr>
        <th style="min-width:80px">Pays</th>
        <th style="min-width:150px">Aéroport</th>
        <th style="min-width:55px">Transit</th>
        ${wbs.map(wb=>`<th style="min-width:90px;text-align:center">
          <span class="adm-zone-pill cargo-wb-pill">${wb.code}</span><br>
          <span style="font-size:.68rem;font-weight:400;color:#94a3b8">${wb.label}</span>
        </th>`).join('')}
        <th style="min-width:90px;text-align:center">
          <span class="adm-zone-pill" style="background:#f59e0b;color:#fff">MIN CHG</span><br>
          <span style="font-size:.68rem;font-weight:400;color:#94a3b8">USD/LTA</span>
        </th>
      </tr>
    </thead>
    <tbody>`;

  dests.forEach(dest => {
    dest.airports.forEach((ap, pi) => {
      const apRates = airlineRates[ap.code] || {};
      html += `
      <tr class="adm-grid-row">
        ${pi===0 ? `<td rowspan="${dest.airports.length}" class="adm-country-cell">
          <span style="font-size:1.1rem">${dest.flag}</span><br>
          <strong style="font-size:.79rem">${dest.country}</strong>
        </td>` : ''}
        <td style="font-size:.82rem;font-weight:600">
          <span class="cargo-ap-code">${ap.code}</span> ${ap.label}
        </td>
        <td style="text-align:center">
          <input type="number" class="adm-input adm-input-sm"
            data-cg-transit="${dir}|${originCode}|${airlineCode}|${ap.code}"
            value="${ap.transit||1}" min="1" style="width:45px;text-align:center"/>j
        </td>
        ${wbs.map(wb=>`
          <td>
            <input type="number" class="adm-input adm-input-sm cargo-rate-inp"
              data-cg-rate="${dir}|${originCode}|${airlineCode}|${ap.code}|${wb.code}"
              value="${apRates[wb.code]||''}" min="0" step="0.05"
              placeholder="—" style="width:80px;text-align:right"/>
          </td>`).join('')}
        <td>
          <input type="number" class="adm-input adm-input-sm"
            data-cg-min="${dir}|${originCode}|${airlineCode}|${ap.code}"
            value="${apRates['MIN']||''}" min="0" step="5"
            placeholder="—" style="width:80px;text-align:right"/>
        </td>
      </tr>`;
    });
  });

  html += `</tbody></table>`;
  return html;
}

// ── Panel gestion des compagnies ──────────────────────────────
function admBuildCargoAirlinesPanel(data) {
  const airlines = data.airlines || [];
  let html = `
  <h4 class="adm-sub-title">Compagnies aériennes — Logos, codes IATA et préfixes AWB</h4>
  <div class="cargo-airlines-grid" id="cargo-airlines-list">
    ${airlines.map((al,i) => admBuildAirlineRow(al, i)).join('')}
  </div>
  <div class="adm-actions">
    <button class="adm-btn adm-btn-secondary" onclick="admAddCargoAirline()">
      <i class="fa-solid fa-plus"></i> Ajouter une compagnie
    </button>
    <button class="adm-btn adm-btn-primary" onclick="admSaveCargoAirlines()">
      <i class="fa-solid fa-floppy-disk"></i> Enregistrer
    </button>
  </div>`;
  return html;
}

function admBuildAirlineRow(al, i) {
  return `
  <div class="cargo-airline-row" id="cargo-al-row-${i}">
    <div class="cargo-al-logo-preview">
      ${al.logo
        ? `<img src="${al.logo}" alt="${al.code}" style="height:36px;max-width:90px;object-fit:contain" onerror="this.src=''">`
        : `<span class="cargo-airline-code-badge" style="background:${al.color||'#334155'}">${al.code}</span>`}
    </div>
    <div class="cargo-al-fields">
      <div class="cargo-al-field-row">
        <div>
          <label class="cargo-field-lbl">Code IATA</label>
          <input type="text" class="adm-input adm-input-sm" data-al-code="${i}"
            value="${al.code}" maxlength="3" style="width:65px;text-transform:uppercase;font-weight:700"/>
        </div>
        <div>
          <label class="cargo-field-lbl">Préfixe AWB</label>
          <input type="text" class="adm-input adm-input-sm" data-al-awb="${i}"
            value="${al.awb||''}" maxlength="3" style="width:65px"/>
        </div>
        <div>
          <label class="cargo-field-lbl">Couleur</label>
          <input type="color" class="adm-input" data-al-color="${i}"
            value="${al.color||'#334155'}" style="width:50px;height:36px;padding:2px;cursor:pointer"/>
        </div>
        <div style="margin-left:auto;align-self:flex-end">
          <button class="adm-btn adm-btn-ghost" style="color:#ef4444;padding:7px 12px"
            onclick="admDeleteCargoAirline(${i})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
      <div>
        <label class="cargo-field-lbl">Nom complet</label>
        <input type="text" class="adm-input" data-al-name="${i}"
          value="${al.name}" style="width:100%"/>
      </div>
      <div>
        <label class="cargo-field-lbl">URL du logo <span style="font-weight:400;color:#94a3b8">(PNG/SVG — coller l'URL directe)</span></label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="url" class="adm-input" data-al-logo="${i}"
            value="${al.logo||''}" placeholder="https://..." style="flex:1"
            oninput="admPreviewCargoLogo(this,${i})"/>
          <button class="adm-btn adm-btn-ghost" style="padding:8px 12px;white-space:nowrap"
            onclick="admPreviewCargoLogo(document.querySelector('[data-al-logo=\\'${i}\\']'),${i})">
            <i class="fa-solid fa-eye"></i>
          </button>
        </div>
      </div>
    </div>
  </div>`;
}

// ── Panel aéroports ───────────────────────────────────────────
function admBuildCargoAirportsPanel(data) {
  const origins  = data.origins     || ADM_DEF.cargo.origins;
  const dests    = data.exportDests || ADM_DEF.cargo.exportDests;
  return `
  <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:24px">
    <div>
      <h4 class="adm-sub-title"><i class="fa-solid fa-anchor" style="color:var(--teal)"></i> Aéroports d'origine (Maroc)</h4>
      <table class="adm-table" style="font-size:.82rem">
        <thead><tr><th>Code</th><th>Nom</th><th>Flag</th></tr></thead>
        <tbody>
          ${origins.map((o,i)=>`<tr>
            <td><input type="text" class="adm-input adm-input-sm" data-cg-or-code="${i}" value="${o.code}" style="width:60px;text-transform:uppercase"/></td>
            <td><input type="text" class="adm-input" data-cg-or-label="${i}" value="${o.label}" style="max-width:200px"/></td>
            <td><input type="text" class="adm-input adm-input-sm" data-cg-or-flag="${i}" value="${o.flag||'🇲🇦'}" style="width:50px"/></td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div class="adm-actions">
        <button class="adm-btn adm-btn-primary" onclick="admSaveCargoOrigins()">
          <i class="fa-solid fa-floppy-disk"></i> Enregistrer
        </button>
      </div>
    </div>
    <div>
      <h4 class="adm-sub-title"><i class="fa-solid fa-globe" style="color:var(--teal)"></i> Destinations mondiales</h4>
      <div style="max-height:500px;overflow-y:auto">
        ${dests.map((dest,di)=>`
        <div class="adm-dest-country">
          <div class="adm-dest-header">
            ${dest.flag} <strong>${dest.country}</strong>
            <span class="adm-badge adm-badge-blue" style="margin-left:6px">${dest.airports.length} aéroport(s)</span>
          </div>
          <table class="adm-table" style="font-size:.78rem;margin-bottom:0">
            <thead><tr><th>Code</th><th>Aéroport</th><th>Transit (j)</th></tr></thead>
            <tbody>
              ${dest.airports.map((ap,pi)=>`<tr>
                <td><input type="text" class="adm-input adm-input-sm" data-cg-ap-code="${di}-${pi}" value="${ap.code}" style="width:55px;text-transform:uppercase"/></td>
                <td><input type="text" class="adm-input" data-cg-ap-label="${di}-${pi}" value="${ap.label}" style="max-width:170px"/></td>
                <td><input type="number" class="adm-input adm-input-sm" data-cg-ap-transit="${di}-${pi}" value="${ap.transit||1}" min="1" style="width:50px"/></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>`).join('')}
      </div>
      <div class="adm-actions">
        <button class="adm-btn adm-btn-primary" onclick="admSaveCargoAirports()">
          <i class="fa-solid fa-floppy-disk"></i> Enregistrer les aéroports
        </button>
      </div>
    </div>
  </div>`;
}

// ── Panel surcharges ──────────────────────────────────────────
function admBuildCargoSurchargesPanel(data) {
  const surcharges = data.surcharges || ADM_DEF.cargo.surcharges;
  return `
  <h4 class="adm-sub-title">Surcharges cargo aérien — s'ajoutent au tarif de base</h4>
  <table class="adm-table" style="max-width:600px">
    <thead><tr><th>Code</th><th>Libellé</th><th>Montant</th><th>Unité</th></tr></thead>
    <tbody>
      ${surcharges.map((s,i)=>`<tr>
        <td><span class="adm-zone-pill" style="font-size:.7rem">${s.code}</span></td>
        <td><input type="text" class="adm-input" data-cg-surch-label="${i}" value="${s.label}" style="max-width:240px"/></td>
        <td><input type="number" class="adm-input adm-input-sm" data-cg-surch-amt="${i}" value="${s.amount}" min="0" step="0.01" style="width:90px"/></td>
        <td><input type="text" class="adm-input" data-cg-surch-unit="${i}" value="${s.unit}" style="max-width:110px"/></td>
      </tr>`).join('')}
    </tbody>
  </table>
  <div class="adm-actions">
    <button class="adm-btn adm-btn-primary" onclick="admSaveCargoSurcharges()">
      <i class="fa-solid fa-floppy-disk"></i> Enregistrer les surcharges
    </button>
  </div>`;
}

// ── Panel Marges & Tarification ──────────────────────────────
function admBuildCargoMarginsPanel(data) {
  const airlines  = data.airlines || ADM_DEF.cargo.airlines;
  const margins   = data.margins  || {};
  const usdToMad  = data.usdToMad || 10;

  const rows = airlines.map(al => {
    const margin = margins[al.code] !== undefined ? margins[al.code] : 30;
    const isRam  = al.code === 'AT';
    return `
    <tr class="cargo-margin-row${isRam ? ' cargo-margin-row-ram' : ''}">
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <img src="${al.logo}" alt="${al.code}" style="height:28px;max-width:70px;object-fit:contain"
            onerror="this.style.display='none'">
          <span class="cargo-airline-code-badge" style="background:${al.color||'#334155'}">${al.code}</span>
        </div>
      </td>
      <td style="font-weight:600;color:#1e293b">${al.name}</td>
      <td>${isRam ? '<span class="adm-badge adm-badge-green">MAD/kg</span>' : '<span class="adm-badge adm-badge-blue">USD/kg → MAD</span>'}</td>
      <td>
        <div style="display:flex;align-items:center;gap:6px">
          <input type="number" class="adm-input adm-input-sm cargo-margin-inp"
            data-airline="${al.code}" value="${margin}" min="0" max="200" step="0.5"
            style="width:70px" oninput="admPreviewCargoMargin(this,'${al.code}')">
          <span style="color:#64748b;font-size:.82rem">%</span>
        </div>
      </td>
      <td id="cargo-margin-preview-${al.code}" class="cargo-margin-preview">
        —
      </td>
    </tr>`;
  }).join('');

  return `
  <div class="adm-section-intro" style="margin-bottom:16px">
    <i class="fa-solid fa-sliders adm-intro-icon"></i>
    <div>
      <strong>Marges commerciales & Paramètres de tarification</strong>
      <span>Définissez la marge par compagnie. Le calculateur affichera le prix d'achat × (1 + marge%) au client.</span>
    </div>
  </div>

  <!-- Taux de change -->
  <div class="cargo-exchange-box">
    <div class="cargo-exchange-label">
      <i class="fa-solid fa-arrows-rotate" style="color:var(--teal)"></i>
      <strong>Taux de change USD → MAD</strong>
      <span style="color:#64748b;font-size:.82rem">(utilisé pour convertir les tarifs partenaires en MAD)</span>
    </div>
    <div style="display:flex;align-items:center;gap:10px">
      <span style="font-weight:600;color:#64748b">1 USD =</span>
      <input type="number" id="cargo-usd-mad" class="adm-input adm-input-sm"
        value="${usdToMad}" min="1" max="50" step="0.01" style="width:90px">
      <span style="font-weight:700;color:#1e293b">MAD</span>
    </div>
  </div>

  <!-- Tableau des marges -->
  <table class="adm-table cargo-margins-table">
    <thead>
      <tr>
        <th>Logo</th>
        <th>Compagnie</th>
        <th>Devise tarifs</th>
        <th>Marge (%)</th>
        <th>Aperçu (ex. 100 kg CDG)</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="adm-actions">
    <button class="adm-btn adm-btn-primary" onclick="admSaveCargoMargins()">
      <i class="fa-solid fa-floppy-disk"></i> Enregistrer les marges
    </button>
    <button class="adm-btn" onclick="admPreviewAllCargoMargins()">
      <i class="fa-solid fa-eye"></i> Actualiser les aperçus
    </button>
  </div>

  <div class="cargo-margin-info-box">
    <i class="fa-solid fa-circle-info" style="color:var(--teal)"></i>
    <div>
      <strong>Comment ça fonctionne :</strong>
      <ul style="margin:6px 0 0 16px;font-size:.82rem;color:#475569;line-height:1.7">
        <li><strong>Royal Air Maroc (AT)</strong> : tarifs officiels en MAD/kg (grille Ex Maroc Prepaid) + surcharge fuel + votre marge = Prix de vente affiché au client.</li>
        <li><strong>Compagnies partenaires</strong> : tarifs indicatifs en USD/kg × taux USD→MAD + fuel + votre marge = Prix de vente affiché.</li>
        <li>Les tarifs dans les onglets Export/Import permettent de personnaliser les prix d'achat par destination.</li>
      </ul>
    </div>
  </div>`;
}

function admSaveCargoMargins() {
  const data = admLoad('cargo');
  if (!data.margins) data.margins = {};

  document.querySelectorAll('.cargo-margin-inp').forEach(inp => {
    const code = inp.dataset.airline;
    const val  = parseFloat(inp.value);
    if (!isNaN(val)) data.margins[code] = val;
  });

  const usdMadInp = document.getElementById('cargo-usd-mad');
  if (usdMadInp) {
    const v = parseFloat(usdMadInp.value);
    if (!isNaN(v) && v > 0) data.usdToMad = v;
  }

  admSave('cargo', data);
  admToast('✅ Marges et taux de change enregistrés !');
}

function admPreviewCargoMargin(inp, code) {
  const margin   = parseFloat(inp.value) || 0;
  const data     = admLoad('cargo');
  const usdToMad = parseFloat(document.getElementById('cargo-usd-mad')?.value) || data.usdToMad || 10;
  const preview  = document.getElementById('cargo-margin-preview-' + code);
  if (!preview) return;

  /* Exemple : 100 kg vers CDG */
  let costMad = 0;
  if (code === 'AT') {
    const rate = 13; /* AT_COST_MAD CDG +100 */
    const fuel = 0.55 * usdToMad;
    costMad = Math.max(rate * 100 + fuel * 100, 850);
  } else {
    const rateUsd = FCALC_RATES_PREVIEW[code] || 3.80;
    costMad = Math.max((rateUsd + 0.55) * usdToMad * 100, 45 * usdToMad);
  }
  const sellMad = Math.round(costMad * (1 + margin / 100));
  preview.innerHTML = `<span style="color:#64748b;font-size:.78rem">PA ${Math.round(costMad).toLocaleString('fr-MA')} MAD</span>
    <i class="fa-solid fa-arrow-right" style="color:#94a3b8;font-size:.7rem"></i>
    <strong style="color:var(--teal)">${sellMad.toLocaleString('fr-MA')} MAD</strong>`;
}

/* Référence rapide pour les aperçus (rate USD/kg CDG +100) */
const FCALC_RATES_PREVIEW = {
  AF:3.50, EK:4.10, TK:3.35, LH:3.65, QR:3.65,
  EY:3.50, MS:2.55, SV:3.80, KL:3.60, IB:3.45,
  DL:3.55, AC:3.65, CX:4.20
};

function admPreviewAllCargoMargins() {
  document.querySelectorAll('.cargo-margin-inp').forEach(inp => {
    admPreviewCargoMargin(inp, inp.dataset.airline);
  });
}

// ── Changer airline sélectionnée ──────────────────────────────
function admSetCargoAirline(code, dir) {
  admCollectCargoRates(dir);
  _admCargoAirline = code;
  const cards = document.getElementById('cargo-al-cards-' + dir);
  if (cards) cards.querySelectorAll('.cargo-al-card').forEach(c => {
    c.classList.toggle('active', c.getAttribute('onclick')?.includes(`'${code}'`));
  });
  _admCargoDir = dir;
  const data = admLoad('cargo');
  const wrap = document.getElementById('cargo-grid-wrap-' + dir);
  if (wrap) wrap.innerHTML = admBuildCargoRatesTable(data, dir, _admCargoOrigin, code);
}

// ── Changer origine sélectionnée ──────────────────────────────
function admSetCargoOrigin(code, dir) {
  admCollectCargoRates(dir);
  _admCargoOrigin = code;
  const pills = document.getElementById('cargo-origin-pills-' + dir);
  if (pills) pills.querySelectorAll('.adm-origin-pill').forEach(p => {
    p.classList.toggle('active', p.getAttribute('onclick')?.includes(`'${code}'`));
  });
  _admCargoDir = dir;
  const data = admLoad('cargo');
  const wrap = document.getElementById('cargo-grid-wrap-' + dir);
  if (wrap) wrap.innerHTML = admBuildCargoRatesTable(data, dir, code, _admCargoAirline);
}

// ── Render grille import quand l'onglet s'ouvre ───────────────
function admRenderCargoGrid() {
  const panel = document.getElementById('adm-sub-cargo-import');
  if (!panel || panel.innerHTML.trim() === '' || panel.querySelector('.adm-inline-info')) {
    const data = admLoad('cargo');
    if (!data.airlines) data.airlines = JSON.parse(JSON.stringify(ADM_DEF.cargo.airlines));
    if (!data.origins)  data.origins  = JSON.parse(JSON.stringify(ADM_DEF.cargo.origins));
    if (panel) panel.innerHTML = admBuildCargoGridPanel(data, 'import');
  }
  _admCargoDir = 'import';
}

// ── Collecter les rates du DOM ────────────────────────────────
function admCollectCargoRates(dir) {
  const inputs = document.querySelectorAll(`[data-cg-rate^="${dir}|"]`);
  if (!inputs.length) return;
  const data = admLoad('cargo');
  const store = dir==='export' ? 'exportRates' : 'importRates';
  if (!data[store]) data[store] = {};

  inputs.forEach(inp => {
    const [d, orig, al, ap, wb] = inp.dataset.cgRate.split('|');
    const val = inp.value.trim();
    if (!data[store][orig]) data[store][orig] = {};
    if (!data[store][orig][al]) data[store][orig][al] = {};
    if (!data[store][orig][al][ap]) data[store][orig][al][ap] = {};
    if (val===''||val==='0') delete data[store][orig][al][ap][wb];
    else data[store][orig][al][ap][wb] = parseFloat(val)||0;
  });

  document.querySelectorAll(`[data-cg-min^="${dir}|"]`).forEach(inp => {
    const [d, orig, al, ap] = inp.dataset.cgMin.split('|');
    const val = inp.value.trim();
    if (!data[store][orig]?.[al]?.[ap]) return;
    if (val===''||val==='0') delete data[store][orig][al][ap]['MIN'];
    else data[store][orig][al][ap]['MIN'] = parseFloat(val)||0;
  });

  admSave('cargo', data);
  return data;
}

// ── Sauvegarder ──────────────────────────────────────────────
function admSaveCargoRates(dir) {
  admCollectCargoRates(dir || _admCargoDir);
  admToast(`✅ Tarifs cargo ${dir==='export'?'export':'import'} enregistrés !`);
}

// ── Airlines ─────────────────────────────────────────────────
function admPreviewCargoLogo(inp, idx) {
  const row = document.getElementById('cargo-al-row-' + idx);
  if (!row) return;
  const preview = row.querySelector('.cargo-al-logo-preview');
  const url = inp ? inp.value.trim() : '';
  const codeEl = row.querySelector('[data-al-code]');
  const colorEl = row.querySelector('[data-al-color]');
  const code = codeEl ? codeEl.value.toUpperCase() : '??';
  const color = colorEl ? colorEl.value : '#334155';
  if (url) {
    preview.innerHTML = `<img src="${url}" alt="${code}" style="height:36px;max-width:90px;object-fit:contain" onerror="this.parentElement.innerHTML='<span class=\\'cargo-airline-code-badge\\' style=\\'background:${color}\\'>${code}</span>'">`;
  } else {
    preview.innerHTML = `<span class="cargo-airline-code-badge" style="background:${color}">${code}</span>`;
  }
}

function admSaveCargoAirlines() {
  const data = admLoad('cargo');
  if (!data.airlines) data.airlines = [];
  document.querySelectorAll('[data-al-code]').forEach(inp => {
    const i = parseInt(inp.dataset.alCode);
    if (!data.airlines[i]) data.airlines[i] = {};
    data.airlines[i].code = inp.value.toUpperCase().trim();
  });
  document.querySelectorAll('[data-al-name]').forEach(inp => {
    const i = parseInt(inp.dataset.alName);
    if (data.airlines[i]) data.airlines[i].name = inp.value;
  });
  document.querySelectorAll('[data-al-logo]').forEach(inp => {
    const i = parseInt(inp.dataset.alLogo);
    if (data.airlines[i]) data.airlines[i].logo = inp.value.trim();
  });
  document.querySelectorAll('[data-al-color]').forEach(inp => {
    const i = parseInt(inp.dataset.alColor);
    if (data.airlines[i]) data.airlines[i].color = inp.value;
  });
  document.querySelectorAll('[data-al-awb]').forEach(inp => {
    const i = parseInt(inp.dataset.alAwb);
    if (data.airlines[i]) data.airlines[i].awb = inp.value.trim();
  });
  admSave('cargo', data);
  admToast('✅ Compagnies aériennes enregistrées !');
}

function admAddCargoAirline() {
  const data = admLoad('cargo');
  if (!data.airlines) data.airlines = [];
  const newAl = { code:'NEW', name:'Nouvelle compagnie', logo:'', color:'#334155', awb:'' };
  data.airlines.push(newAl);
  admSave('cargo', data);
  const list = document.getElementById('cargo-airlines-list');
  if (list) list.innerHTML += admBuildAirlineRow(newAl, data.airlines.length-1);
  admToast('✅ Compagnie ajoutée — remplissez les champs et enregistrez.');
}

function admDeleteCargoAirline(idx) {
  if (!confirm('Supprimer cette compagnie ? Les tarifs associés seront conservés en mémoire.')) return;
  const data = admLoad('cargo');
  if (data.airlines && data.airlines[idx]) {
    data.airlines.splice(idx, 1);
    admSave('cargo', data);
    admRenderCargo(); // re-render complet
  }
}

function admSaveCargoOrigins() {
  const data = admLoad('cargo');
  if (!data.origins) data.origins = JSON.parse(JSON.stringify(ADM_DEF.cargo.origins));
  document.querySelectorAll('[data-cg-or-code]').forEach(inp => {
    const i = parseInt(inp.dataset.cgOrCode);
    if (data.origins[i]) data.origins[i].code = inp.value.toUpperCase().trim();
  });
  document.querySelectorAll('[data-cg-or-label]').forEach(inp => {
    const i = parseInt(inp.dataset.cgOrLabel);
    if (data.origins[i]) data.origins[i].label = inp.value;
  });
  document.querySelectorAll('[data-cg-or-flag]').forEach(inp => {
    const i = parseInt(inp.dataset.cgOrFlag);
    if (data.origins[i]) data.origins[i].flag = inp.value;
  });
  admSave('cargo', data);
  admToast('✅ Aéroports d\'origine enregistrés !');
}

function admSaveCargoAirports() {
  const data = admLoad('cargo');
  if (!data.exportDests) data.exportDests = JSON.parse(JSON.stringify(ADM_DEF.cargo.exportDests));
  document.querySelectorAll('[data-cg-ap-code]').forEach(inp => {
    const [di,pi] = inp.dataset.cgApCode.split('-').map(Number);
    if (data.exportDests[di]?.airports[pi]) data.exportDests[di].airports[pi].code = inp.value.toUpperCase().trim();
  });
  document.querySelectorAll('[data-cg-ap-label]').forEach(inp => {
    const [di,pi] = inp.dataset.cgApLabel.split('-').map(Number);
    if (data.exportDests[di]?.airports[pi]) data.exportDests[di].airports[pi].label = inp.value;
  });
  document.querySelectorAll('[data-cg-ap-transit]').forEach(inp => {
    const [di,pi] = inp.dataset.cgApTransit.split('-').map(Number);
    if (data.exportDests[di]?.airports[pi]) data.exportDests[di].airports[pi].transit = parseInt(inp.value)||1;
  });
  admSave('cargo', data);
  admToast('✅ Aéroports de destination enregistrés !');
}

function admSaveCargoSurcharges() {
  const data = admLoad('cargo');
  if (!data.surcharges) data.surcharges = JSON.parse(JSON.stringify(ADM_DEF.cargo.surcharges));
  document.querySelectorAll('[data-cg-surch-label]').forEach(inp => {
    const i = parseInt(inp.dataset.cgSurchLabel);
    if (data.surcharges[i]) data.surcharges[i].label = inp.value;
  });
  document.querySelectorAll('[data-cg-surch-amt]').forEach(inp => {
    const i = parseInt(inp.dataset.cgSurchAmt);
    if (data.surcharges[i]) data.surcharges[i].amount = parseFloat(inp.value)||0;
  });
  document.querySelectorAll('[data-cg-surch-unit]').forEach(inp => {
    const i = parseInt(inp.dataset.cgSurchUnit);
    if (data.surcharges[i]) data.surcharges[i].unit = inp.value;
  });
  admSave('cargo', data);
  admToast('✅ Surcharges cargo enregistrées !');
}

/* ══════════════════════════════════════════════
   PANEL 4 — TARIFS ROUTIER & REMORQUES
══════════════════════════════════════════════ */
function admRenderRoutier() {
  const data = admLoad('routier');
  if (!data.routes)            data.routes            = JSON.parse(JSON.stringify(ADM_DEF.routier.routes));
  if (!data.vehicles)          data.vehicles          = JSON.parse(JSON.stringify(ADM_DEF.routier.vehicles));
  if (!data.routeRates)        data.routeRates        = {};
  if (!data.importRoutes)      data.importRoutes      = JSON.parse(JSON.stringify(ADM_DEF.routier.importRoutes));
  if (!data.importRouteRates)  data.importRouteRates  = {};

  // ── helper : grille tarifaire par route ─────────────────────
  function buildRoutesGrid(routes, ratesObj, transitAttr, rateAttr) {
    return `
    <div style="overflow-x:auto">
    <table class="adm-table adm-routes-table">
      <thead>
        <tr>
          <th>Route</th><th>Transit</th>
          ${data.vehicles.map(v => `<th style="min-width:90px">${v.code}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${routes.map((r, ri) => {
          const rates = ratesObj[r.id] || {};
          return `<tr>
            <td style="min-width:180px;font-weight:600;font-size:.85rem">${r.from} → ${r.to}</td>
            <td>
              <input type="number" class="adm-input adm-input-sm"
                data-${transitAttr}="${ri}" value="${r.transit}" min="1" style="width:55px"/> j
            </td>
            ${data.vehicles.map(v => `
              <td>
                <input type="number" class="adm-input adm-input-sm"
                  data-${rateAttr}="${r.id}" data-veh="${v.code}"
                  value="${rates[v.code]||''}" min="0" step="50" placeholder="${v.rate}"/>
              </td>`).join('')}
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>`;
  }

  let html = `
  <div class="adm-section-intro">
    <i class="fa-solid fa-truck-moving adm-intro-icon"></i>
    <div>
      <strong>Tarifs fret routier & remorques — Export et Import</strong>
      <span>Export (Maroc → Europe) · Import (Europe → Maroc) · Laisser vide = tarif de base du véhicule</span>
    </div>
  </div>

  <div class="adm-sub-tabs">
    <button class="adm-stab active" onclick="admSubTab('routier','vehicles')" id="adm-stab-routier-vehicles">
      <i class="fa-solid fa-truck"></i> Types de véhicules
    </button>
    <button class="adm-stab" onclick="admSubTab('routier','export')" id="adm-stab-routier-export">
      <i class="fa-solid fa-arrow-up-from-bracket"></i> Export (Maroc → Monde)
    </button>
    <button class="adm-stab" onclick="admSubTab('routier','import')" id="adm-stab-routier-import">
      <i class="fa-solid fa-arrow-down-to-bracket"></i> Import (Monde → Maroc)
    </button>
  </div>

  <!-- ═══ TYPES DE VÉHICULES (commun) ═══ -->
  <div class="adm-sub-panel active" id="adm-sub-routier-vehicles">
    <h4 class="adm-sub-title">Types de véhicules/équipements — Tarif de base (EUR) — commun Export & Import</h4>
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
        <i class="fa-solid fa-floppy-disk"></i> Enregistrer les véhicules
      </button>
    </div>
  </div>

  <!-- ═══ EXPORT : Maroc → Monde ═══ -->
  <div class="adm-sub-panel" id="adm-sub-routier-export">
    <div class="adm-maritime-dir-badge adm-badge-export">
      <i class="fa-solid fa-arrow-up-from-bracket"></i>
      EXPORT — Départ depuis le Maroc vers l'Europe et le reste du monde
    </div>
    ${buildRoutesGrid(data.routes, data.routeRates, 'ro-transit', 'ro-rate')}
    <div class="adm-actions">
      <button class="adm-btn adm-btn-primary" onclick="admSaveRoutierRoutes()">
        <i class="fa-solid fa-floppy-disk"></i> Enregistrer les tarifs export
      </button>
    </div>
  </div>

  <!-- ═══ IMPORT : Monde → Maroc ═══ -->
  <div class="adm-sub-panel" id="adm-sub-routier-import">
    <div class="adm-maritime-dir-badge adm-badge-import">
      <i class="fa-solid fa-arrow-down-to-bracket"></i>
      IMPORT — Arrivée vers le Maroc depuis l'Europe et le reste du monde
    </div>
    ${buildRoutesGrid(data.importRoutes, data.importRouteRates, 'ri-transit', 'ri-rate')}
    <div class="adm-actions">
      <button class="adm-btn adm-btn-primary" onclick="admSaveRoutierImportRoutes()">
        <i class="fa-solid fa-floppy-disk"></i> Enregistrer les tarifs import
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
  admToast('✅ Tarifs export enregistrés !');
}

function admSaveRoutierImportRoutes() {
  const data = admLoad('routier');
  if (!data.importRouteRates) data.importRouteRates = {};
  if (!data.importRoutes) data.importRoutes = JSON.parse(JSON.stringify(ADM_DEF.routier.importRoutes));
  document.querySelectorAll('[data-ri-transit]').forEach(inp => {
    const i = parseInt(inp.dataset.riTransit);
    if (data.importRoutes[i]) data.importRoutes[i].transit = parseInt(inp.value) || 1;
  });
  document.querySelectorAll('[data-ri-rate]').forEach(inp => {
    const routeId = inp.dataset.riRate;
    const veh     = inp.dataset.veh;
    const val     = inp.value.trim();
    if (!data.importRouteRates[routeId]) data.importRouteRates[routeId] = {};
    if (val === '') delete data.importRouteRates[routeId][veh];
    else data.importRouteRates[routeId][veh] = parseFloat(val) || 0;
  });
  admSave('routier', data);
  admToast('✅ Tarifs import enregistrés !');
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
   PANEL 8 — GESTION UTILISATEURS
══════════════════════════════════════════════ */
const ROLE_META = {
  admin:   { label:'Administrateur', color:'#dc2626', bg:'#fee2e2', icon:'fa-shield-halved' },
  backend: { label:'Opérateur',      color:'#7c3aed', bg:'#f3e8ff', icon:'fa-eye' },
  client:  { label:'Client',         color:'#0284c7', bg:'#dbeafe', icon:'fa-user' }
};
const STATUS_META = {
  pending:  { label:'En attente', color:'#92400e', bg:'#fef3c7' },
  active:   { label:'Actif',      color:'#166534', bg:'#dcfce7' },
  inactive: { label:'Inactif',    color:'#6b7280', bg:'#f1f5f9' }
};

function admGetUsers() {
  try { return JSON.parse(localStorage.getItem('ec_users') || '[]'); }
  catch(e) { return []; }
}
function admSetUsers(users) {
  try { localStorage.setItem('ec_users', JSON.stringify(users)); } catch(e) {}
}

function admRenderUsers() {
  const users = admGetUsers();
  const pending  = users.filter(u => u.status === 'pending');
  const active   = users.filter(u => u.status === 'active');
  const inactive = users.filter(u => u.status === 'inactive');

  let html = `
  <div class="adm-section-intro">
    <i class="fa-solid fa-users-gear adm-intro-icon"></i>
    <div>
      <strong>Gestion des utilisateurs</strong>
      <span>Validez les demandes d'accès, assignez les rôles et gérez les accès</span>
    </div>
  </div>

  <!-- Stats -->
  <div class="adm-stats-row" style="margin-bottom:24px">
    <div class="adm-stat-chip" style="border-color:#f59e0b">
      <span class="adm-stat-num" style="color:#f59e0b">${pending.length}</span>
      <span class="adm-stat-lbl">En attente</span>
    </div>
    <div class="adm-stat-chip" style="border-color:#22c55e">
      <span class="adm-stat-num" style="color:#22c55e">${active.length}</span>
      <span class="adm-stat-lbl">Actifs</span>
    </div>
    <div class="adm-stat-chip">
      <span class="adm-stat-num" style="color:#94a3b8">${inactive.length}</span>
      <span class="adm-stat-lbl">Inactifs</span>
    </div>
    <div class="adm-stat-chip adm-stat-total">
      <span class="adm-stat-num">${users.length}</span>
      <span class="adm-stat-lbl">Total</span>
    </div>
  </div>

  <div class="adm-sub-tabs">
    <button class="adm-stab active" onclick="admSubTab('users','pending')" id="adm-stab-users-pending">
      <i class="fa-solid fa-clock" style="color:#f59e0b"></i> En attente (${pending.length})
    </button>
    <button class="adm-stab" onclick="admSubTab('users','active')" id="adm-stab-users-active">
      <i class="fa-solid fa-circle-check" style="color:#22c55e"></i> Actifs (${active.length})
    </button>
    <button class="adm-stab" onclick="admSubTab('users','inactive')" id="adm-stab-users-inactive">
      <i class="fa-solid fa-ban" style="color:#94a3b8"></i> Inactifs (${inactive.length})
    </button>
  </div>

  <!-- Pending users -->
  <div class="adm-sub-panel active" id="adm-sub-users-pending">`;

  if (!pending.length) {
    html += `<div class="adm-empty"><i class="fa-solid fa-inbox"></i><p>Aucune demande en attente.</p></div>`;
  } else {
    html += `<div class="adm-users-list">`;
    pending.forEach(u => {
      const date = u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-MA') : '—';
      html += `
      <div class="adm-user-card adm-user-pending" id="adm-ucard-${btoa(u.email)}">
        <div class="adm-user-avatar" style="background:#fef3c7;color:#92400e">
          ${(u.first[0]||'?').toUpperCase()}${(u.last[0]||'').toUpperCase()}
        </div>
        <div class="adm-user-info">
          <div class="adm-user-name">${escapeHTML(u.first + ' ' + u.last)}</div>
          <div class="adm-user-email">${escapeHTML(u.email)}</div>
          <div class="adm-user-meta">
            <span>${escapeHTML(u.company||'—')}</span>
            <span>Inscription : ${date}</span>
          </div>
        </div>
        <div class="adm-user-actions">
          <div class="adm-approve-row">
            <label style="font-size:.75rem;font-weight:600;color:#64748b">Rôle à attribuer :</label>
            <select class="adm-input adm-select-sm" id="adm-role-sel-${btoa(u.email)}">
              <option value="client">👤 Client</option>
              <option value="backend">👁️ Opérateur</option>
              <option value="admin">🛡️ Administrateur</option>
            </select>
          </div>
          <div class="adm-approve-btns">
            <button class="adm-btn adm-btn-primary" onclick="admApproveUser('${u.email}')">
              <i class="fa-solid fa-check"></i> Approuver
            </button>
            <button class="adm-btn adm-btn-danger" onclick="admRejectUser('${u.email}')">
              <i class="fa-solid fa-xmark"></i> Refuser
            </button>
          </div>
        </div>
      </div>`;
    });
    html += `</div>`;
  }
  html += `</div>`;

  // Active users
  html += `<div class="adm-sub-panel" id="adm-sub-users-active">`;
  if (!active.length) {
    html += `<div class="adm-empty"><i class="fa-solid fa-user-slash"></i><p>Aucun utilisateur actif.</p></div>`;
  } else {
    html += `<table class="adm-table adm-data-table"><thead><tr>
      <th>Utilisateur</th><th>Email</th><th>Société</th><th>Rôle</th><th>Depuis</th><th>Actions</th>
    </tr></thead><tbody>`;
    active.forEach(u => {
      const date = u.approvedAt ? new Date(u.approvedAt).toLocaleDateString('fr-MA') : '—';
      const rm   = ROLE_META[u.role || 'client'] || ROLE_META.client;
      html += `<tr>
        <td><strong>${escapeHTML(u.first + ' ' + u.last)}</strong></td>
        <td style="font-size:.8rem">${escapeHTML(u.email)}</td>
        <td style="font-size:.8rem">${escapeHTML(u.company||'—')}</td>
        <td>
          <select class="adm-input adm-select-sm" onchange="admChangeRole('${u.email}', this.value)">
            <option value="client"  ${(u.role||'client')==='client'  ?'selected':''}>👤 Client</option>
            <option value="backend" ${(u.role||'client')==='backend' ?'selected':''}>👁️ Opérateur</option>
            <option value="admin"   ${(u.role||'client')==='admin'   ?'selected':''}>🛡️ Admin</option>
          </select>
        </td>
        <td style="font-size:.8rem">${date}</td>
        <td>
          <button class="adm-btn adm-btn-ghost" onclick="admDeactivateUser('${u.email}')" title="Désactiver">
            <i class="fa-solid fa-user-slash"></i> Désactiver
          </button>
        </td>
      </tr>`;
    });
    html += `</tbody></table>`;
  }
  html += `</div>`;

  // Inactive users
  html += `<div class="adm-sub-panel" id="adm-sub-users-inactive">`;
  if (!inactive.length) {
    html += `<div class="adm-empty"><i class="fa-solid fa-check-circle"></i><p>Aucun utilisateur inactif.</p></div>`;
  } else {
    html += `<table class="adm-table adm-data-table"><thead><tr>
      <th>Utilisateur</th><th>Email</th><th>Société</th><th>Actions</th>
    </tr></thead><tbody>`;
    inactive.forEach(u => {
      html += `<tr style="opacity:.6">
        <td>${escapeHTML(u.first + ' ' + u.last)}</td>
        <td style="font-size:.8rem">${escapeHTML(u.email)}</td>
        <td style="font-size:.8rem">${escapeHTML(u.company||'—')}</td>
        <td>
          <button class="adm-btn adm-btn-secondary" onclick="admReactivateUser('${u.email}')">
            <i class="fa-solid fa-user-check"></i> Réactiver
          </button>
          <button class="adm-btn adm-btn-danger" onclick="admDeleteUser('${u.email}')" style="margin-left:6px">
            <i class="fa-solid fa-trash"></i> Supprimer
          </button>
        </td>
      </tr>`;
    });
    html += `</tbody></table>`;
  }
  html += `</div>

  <!-- Comptes système (non modifiables) -->
  <div style="margin-top:28px;padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0">
    <h4 style="font-size:.85rem;font-weight:700;color:#334155;margin-bottom:12px">
      <i class="fa-solid fa-lock" style="color:#64748b"></i> Comptes système (non modifiables)
    </h4>
    <table class="adm-table" style="font-size:.8rem">
      <thead><tr><th>Email</th><th>Rôle</th><th>Description</th></tr></thead>
      <tbody>
        <tr>
          <td><code>admin@goplusexpress.ma</code></td>
          <td><span class="adm-badge" style="background:#fee2e2;color:#dc2626">🛡️ Admin</span></td>
          <td>Compte administrateur principal — accès total</td>
        </tr>
        <tr>
          <td><code>demo@goplusexpress.com</code></td>
          <td><span class="adm-badge adm-badge-blue">👤 Client</span></td>
          <td>Compte de démonstration — accès outils uniquement</td>
        </tr>
      </tbody>
    </table>
  </div>`;

  document.getElementById('adm-panel-users').innerHTML = html;
}

function admApproveUser(email) {
  const users = admGetUsers();
  const idx = users.findIndex(u => u.email === email);
  if (idx < 0) return;
  const selId = 'adm-role-sel-' + btoa(email);
  const sel = document.getElementById(selId);
  const role = sel ? sel.value : 'client';
  users[idx].status     = 'active';
  users[idx].role       = role;
  users[idx].approvedAt = Date.now();
  admSetUsers(users);
  admToast(`✅ ${email} approuvé comme ${role} !`);
  admRenderUsers();
  admSubTab('users', 'active');
}

function admRejectUser(email) {
  if (!confirm(`Refuser et supprimer la demande de ${email} ?`)) return;
  const users = admGetUsers().filter(u => u.email !== email);
  admSetUsers(users);
  admToast(`Demande de ${email} refusée.`);
  admRenderUsers();
}

function admChangeRole(email, newRole) {
  const users = admGetUsers();
  const u = users.find(x => x.email === email);
  if (!u) return;
  u.role = newRole;
  admSetUsers(users);
  admToast(`✅ Rôle de ${email} mis à jour : ${newRole}`);
}

function admDeactivateUser(email) {
  if (!confirm(`Désactiver le compte ${email} ? L'utilisateur ne pourra plus se connecter.`)) return;
  const users = admGetUsers();
  const u = users.find(x => x.email === email);
  if (!u) return;
  u.status = 'inactive';
  admSetUsers(users);
  admToast(`Compte ${email} désactivé.`);
  admRenderUsers();
}

function admReactivateUser(email) {
  const users = admGetUsers();
  const u = users.find(x => x.email === email);
  if (!u) return;
  u.status = 'active';
  admSetUsers(users);
  admToast(`✅ Compte ${email} réactivé.`);
  admRenderUsers();
}

function admDeleteUser(email) {
  if (!confirm(`SUPPRIMER définitivement le compte ${email} ? Cette action est irréversible.`)) return;
  const users = admGetUsers().filter(u => u.email !== email);
  admSetUsers(users);
  admToast(`Compte ${email} supprimé.`);
  admRenderUsers();
}

/* ══════════════════════════════════════════════════════════════
   CMS — Éditeur de contenu du site
   Stockage : localStorage['gpe_cms'] = { key: value, ... }
   Les clés correspondent aux data-i18n OU data-cms-key des pages
══════════════════════════════════════════════════════════════ */

/* Définition de tous les champs éditables par page/section */
const CMS_PAGES = [
  {
    id: 'accueil', label: '🏠 Page Accueil', url: 'index.html',
    sections: [
      {
        id: 'hero', label: '🎯 Hero — Titre & Accroche',
        fields: [
          { key:'hero_badge',  label:'Badge',              type:'text',     def:'Logistics · Douane · Express · Maritime' },
          { key:'hero_title',  label:'Titre principal',    type:'html',     def:'Votre partenaire logistique<br/><span>vers le Maroc &amp; le monde</span>' },
          { key:'hero_sub',    label:'Sous-titre',         type:'textarea', def:'Transport aérien, maritime, routier, express et dédouanement — tout en un seul portail intelligent.' },
          { key:'hero_btn1',   label:'Bouton 1 (Simuler)', type:'text',     def:'Simuler un tarif' },
          { key:'hero_btn2',   label:'Bouton 2 (Tracker)', type:'text',     def:'Tracker un envoi' },
          { key:'stat1_val',   label:'Stat 1 — Valeur',   type:'text',     def:'220+',    cmsCss:true },
          { key:'stat1',       label:'Stat 1 — Label',    type:'text',     def:'Pays desservis' },
          { key:'stat2_val',   label:'Stat 2 — Valeur',   type:'text',     def:'24/7',    cmsCss:true },
          { key:'stat3',       label:'Stat 2 — Label',    type:'text',     def:'Support client' },
          { key:'stat3_val',   label:'Stat 3 — Valeur',   type:'text',     def:'13 135',  cmsCss:true },
          { key:'stat4',       label:'Stat 3 — Label',    type:'text',     def:'Codes SH intégrés' },
        ]
      },
      {
        id: 'services', label: '🚚 Services',
        fields: [
          { key:'svc_label', label:'Étiquette section',   type:'text',     def:'NOS SERVICES' },
          { key:'svc_title', label:'Titre section',       type:'text',     def:'Solutions logistiques complètes' },
          { key:'svc_sub',   label:'Sous-titre section',  type:'textarea', def:"De l'expéditeur au destinataire, nous gérons chaque étape de votre chaîne logistique." },
          { key:'svc1_title',label:'Service 1 — Titre',   type:'text',     def:'Transport Aérien' },
          { key:'svc1_desc', label:'Service 1 — Desc.',   type:'textarea', def:'Express et fret général, départ Casablanca, Paris CDG, Amsterdam, Francfort et plus.' },
          { key:'svc2_title',label:'Service 2 — Titre',   type:'text',     def:'Fret Maritime' },
          { key:'svc2_desc', label:'Service 2 — Desc.',   type:'textarea', def:"FCL (20' / 40') et LCL groupage, ports : Casablanca, Tanger Med, Agadir, Nador." },
          { key:'svc3_title',label:'Service 3 — Titre',   type:'text',     def:'Transport Routier' },
          { key:'svc3_desc', label:'Service 3 — Desc.',   type:'textarea', def:'Groupage et complet (FTL) depuis toute l\'Europe vers le Maroc — départs hebdomadaires.' },
          { key:'svc4_title',label:'Service 4 — Titre',   type:'text',     def:'Express International' },
          { key:'svc4_desc', label:'Service 4 — Desc.',   type:'textarea', def:'DHL, FedEx, Aramex — documents et colis express partout dans le monde.' },
          { key:'svc5_title',label:'Service 5 — Titre',   type:'text',     def:'Entreposage & MEAD' },
          { key:'svc5_desc', label:'Service 5 — Desc.',   type:'textarea', def:'Entrepôt sous douane (MEAD), stockage, préparation commandes, picking & packing.' },
          { key:'svc6_title',label:'Service 6 — Titre',   type:'text',     def:'Dédouanement' },
          { key:'svc6_desc', label:'Service 6 — Desc.',   type:'textarea', def:'Déclarations BADR, liquidation, régimes économiques, ATA Carnet et transit.' },
        ]
      },
      {
        id: 'ecom', label: '🛒 E-Commerce Transfrontalier',
        fields: [
          { key:'ecom_label', label:'Étiquette section',   type:'text',     def:'E-COMMERCE TRANSFRONTALIER' },
          { key:'ecom_title', label:'Titre section',       type:'text',     def:'Vendez à l\'international depuis le Maroc' },
          { key:'ecom_sub',   label:'Sous-titre section',  type:'textarea', def:'GO PLUS EXPRESS est votre partenaire logistique officiel pour l\'e-commerce transfrontalier.' },
          { key:'ecom1_title',label:'Carte 1 — Titre',     type:'text',     def:'Livraison Mondiale' },
          { key:'ecom1_desc', label:'Carte 1 — Desc.',     type:'textarea', def:'Expédiez vos commandes e-commerce vers plus de 220 pays et territoires avec DHL, FedEx et Aramex.' },
          { key:'ecom2_title',label:'Carte 2 — Titre',     type:'text',     def:'Fulfillment & Préparation' },
          { key:'ecom2_desc', label:'Carte 2 — Desc.',     type:'textarea', def:'Stockage, picking, packing depuis notre entrepôt MEAD agréé à Casablanca.' },
          { key:'ecom3_title',label:'Carte 3 — Titre',     type:'text',     def:'Dédouanement E-commerce' },
          { key:'ecom3_desc', label:'Carte 3 — Desc.',     type:'textarea', def:'Déclarations BADR simplifiées, gestion des minimis, TVA import et taxes parafiscales.' },
          { key:'ecom4_title',label:'Carte 4 — Titre',     type:'text',     def:'Intégrations Plateformes' },
          { key:'ecom4_desc', label:'Carte 4 — Desc.',     type:'textarea', def:'Connectez votre boutique en ligne à notre système logistique via API. Compatible Shopify, WooCommerce, PrestaShop, Magento.' },
          { key:'ecom5_title',label:'Carte 5 — Titre',     type:'text',     def:'Conformité & Réglementation' },
          { key:'ecom5_desc', label:'Carte 5 — Desc.',     type:'textarea', def:'Gestion de la conformité douanière et des restrictions produits par pays.' },
          { key:'ecom6_title',label:'Carte 6 — Titre',     type:'text',     def:'Gestion des Retours' },
          { key:'ecom6_desc', label:'Carte 6 — Desc.',     type:'textarea', def:'Reverse logistics : retour client, contrôle qualité, remise en stock.' },
        ]
      },
      {
        id: 'contact', label: '📞 Coordonnées & Contact',
        fields: [
          { key:'contact_title',    label:'Titre section', type:'text', def:'Obtenez un devis' },
          { key:'contact_phone',    label:'Téléphone',     type:'text', def:'+212(0)5 22 53 63 02', cmsCss:true },
          { key:'contact_email',    label:'Email',         type:'text', def:'contact@goplusexpress.ma', cmsCss:true },
          { key:'contact_whatsapp', label:'WhatsApp',      type:'text', def:'+212 6 69 14 22 11', cmsCss:true },
        ]
      },
    ]
  },
  {
    id: 'emballage', label: '📦 Guide Emballage', url: 'guide-emballage.html',
    sections: [
      {
        id: 'intro', label: '📋 Introduction',
        fields: [
          { key:'ge_title',   label:'Titre page',      type:'text',     def:'Guide d\'Emballage International', cmsCss:true },
          { key:'ge_sub',     label:'Sous-titre',      type:'textarea', def:'Règles et bonnes pratiques pour un emballage conforme aux standards DHL, FedEx et Aramex.', cmsCss:true },
        ]
      },
    ]
  },
  {
    id: 'espace', label: '👤 Espace Client', url: 'espace-client.html',
    sections: [
      {
        id: 'dashboard', label: '🏠 Tableau de bord',
        fields: [
          { key:'ec_dash_title',       label:'Titre du tableau de bord',   type:'text', def:'Tableau de bord', cmsCss:true },
          { key:'ec_card_ocr_title',   label:'Carte OCR — Titre',          type:'text', def:'OCR Facture Commerciale', cmsCss:true },
          { key:'ec_card_ocr_sub',     label:'Carte OCR — Description',    type:'text', def:'Extraire automatiquement les données d\'une facture', cmsCss:true },
          { key:'ec_card_sim_title',   label:'Carte Simulation — Titre',   type:'text', def:'Simulation de Prix', cmsCss:true },
          { key:'ec_card_sim_sub',     label:'Carte Simulation — Desc.',   type:'text', def:'Tarifs express, maritime, routier en temps réel', cmsCss:true },
          { key:'ec_card_codes_title', label:'Carte Codes — Titre',        type:'text', def:'Codes Aéroports & Ports', cmsCss:true },
          { key:'ec_card_codes_sub',   label:'Carte Codes — Description',  type:'text', def:'Base mondiale IATA + codes ports ONU', cmsCss:true },
          { key:'ec_card_ctn_title',   label:'Carte Conteneurs — Titre',   type:'text', def:'Guide Conteneurs & Remorques', cmsCss:true },
          { key:'ec_card_ctn_sub',     label:'Carte Conteneurs — Desc.',   type:'text', def:'Dimensions, capacités, types standardisés', cmsCss:true },
          { key:'ec_card_avion_title', label:'Carte Appareils — Titre',    type:'text', def:'Appareils Cargo', cmsCss:true },
          { key:'ec_card_avion_sub',   label:'Carte Appareils — Desc.',    type:'text', def:'Référentiel technique avions cargo mondiaux', cmsCss:true },
          { key:'ec_card_hs_title',    label:'Carte Codes SH — Titre',     type:'text', def:'Codes SH / HS', cmsCss:true },
          { key:'ec_card_hs_sub',      label:'Carte Codes SH — Desc.',     type:'text', def:'13 135 codes douaniers · Droits · TPI · TVA Maroc', cmsCss:true },
          { key:'ec_card_exp_title',   label:'Carte Tarifs Express — Titre', type:'text', def:'Tarifs Express', cmsCss:true },
          { key:'ec_card_exp_sub',     label:'Carte Tarifs Express — Desc.', type:'text', def:'DHL · FedEx · Aramex — tarifs en temps réel', cmsCss:true },
          { key:'ec_card_shp_title',   label:'Carte Expédition — Titre',   type:'text', def:'Nouvelle Expédition', cmsCss:true },
          { key:'ec_card_shp_sub',     label:'Carte Expédition — Desc.',   type:'text', def:'Créer et gérer vos expéditions', cmsCss:true },
          { key:'ec_card_clock_title', label:'Carte Horloge — Titre',      type:'text', def:'Horloge Mondiale', cmsCss:true },
          { key:'ec_card_clock_sub',   label:'Carte Horloge — Desc.',      type:'text', def:'Heures locales · Capitales du commerce mondial', cmsCss:true },
        ]
      },
    ]
  },
];

/* État courant de la page CMS sélectionnée */
let _cmsCurrentPage = 'accueil';
let _cmsOpenSections = {};

/* ── Rendu principal ──────────────────────────────── */
function admRenderCMS() {
  const panel = document.getElementById('adm-panel-cms');
  if (!panel) return;

  const cms = admLoad('cms') || {};
  const totalOverrides = Object.keys(cms).length;

  panel.innerHTML = `
    <div class="adm-section-intro">
      <div class="adm-intro-icon"><i class="fa-solid fa-pencil"></i></div>
      <div>
        <strong>Éditeur de Contenu (CMS)</strong>
        <span>Modifiez directement le texte de vos pages. Les changements sont appliqués instantanément sur le site sans redéploiement.</span>
      </div>
    </div>

    ${totalOverrides > 0 ? `
    <div class="cms-global-bar">
      <span class="cms-override-count"><i class="fa-solid fa-circle-check"></i> ${totalOverrides} champ(s) personnalisé(s)</span>
      <a href="index.html" target="_blank" class="adm-btn adm-btn-secondary" style="font-size:.78rem;padding:6px 12px">
        <i class="fa-solid fa-arrow-up-right-from-square"></i> Voir le site
      </a>
      <button class="adm-btn adm-btn-danger" onclick="admResetAllCMS()" style="font-size:.78rem;padding:6px 12px">
        <i class="fa-solid fa-rotate-left"></i> Réinitialiser tout
      </button>
    </div>` : `
    <div class="cms-global-bar">
      <span style="font-size:.82rem;color:#64748b"><i class="fa-solid fa-info-circle"></i> Aucune personnalisation — contenu par défaut affiché</span>
      <a href="index.html" target="_blank" class="adm-btn adm-btn-secondary" style="font-size:.78rem;padding:6px 12px">
        <i class="fa-solid fa-arrow-up-right-from-square"></i> Voir le site
      </a>
    </div>`}

    <!-- Sélecteur de page -->
    <div class="cms-page-tabs">
      ${CMS_PAGES.map(p => `
        <button class="cms-ptab ${p.id === _cmsCurrentPage ? 'active' : ''}" onclick="admCMSSelectPage('${p.id}')">
          ${p.label}
        </button>
      `).join('')}
    </div>

    <!-- Contenu de la page sélectionnée -->
    <div id="cms-page-content">
      ${admBuildCMSPage(_cmsCurrentPage, cms)}
    </div>
  `;
}

/* ── Construction du contenu d'une page CMS ──────── */
function admBuildCMSPage(pageId, cms) {
  const page = CMS_PAGES.find(p => p.id === pageId);
  if (!page) return '';

  return page.sections.map(sec => {
    const isOpen = _cmsOpenSections[sec.id] !== false; // ouvert par défaut
    const modifiedCount = sec.fields.filter(f => cms[f.key] !== undefined && cms[f.key] !== '').length;

    return `
    <div class="cms-section">
      <div class="cms-section-header" onclick="admCMSToggleSection('${sec.id}')">
        <div class="cms-section-title">
          <i class="fa-solid fa-chevron-${isOpen ? 'down' : 'right'} cms-chevron"></i>
          <span>${sec.label}</span>
          ${modifiedCount > 0 ? `<span class="cms-mod-badge">${modifiedCount} modifié${modifiedCount>1?'s':''}</span>` : ''}
        </div>
        <button class="adm-btn adm-btn-primary" style="font-size:.78rem;padding:6px 14px"
          onclick="event.stopPropagation();admSaveCMSSection('${sec.id}')">
          <i class="fa-solid fa-floppy-disk"></i> Enregistrer
        </button>
      </div>
      ${isOpen ? `
      <div class="cms-section-body">
        ${sec.fields.map(f => admBuildCMSField(f, cms[f.key])).join('')}
      </div>` : ''}
    </div>`;
  }).join('');
}

/* ── Construction d'un champ CMS ─────────────────── */
function admBuildCMSField(field, currentVal) {
  const hasOverride = currentVal !== undefined && currentVal !== '';
  const displayVal  = hasOverride ? currentVal : '';

  let inputHtml;
  if (field.type === 'text') {
    inputHtml = `<input type="text" class="adm-input cms-field-input"
      id="cms-inp-${field.key}"
      placeholder="${escapeHTML(field.def)}"
      value="${escapeHTML(displayVal)}">`;
  } else if (field.type === 'textarea' || field.type === 'html') {
    inputHtml = `<textarea class="adm-input cms-field-input cms-textarea"
      id="cms-inp-${field.key}"
      placeholder="${escapeHTML(field.def)}"
      rows="${field.type === 'html' ? 4 : 3}">${escapeHTML(displayVal)}</textarea>`;
  }

  return `
  <div class="cms-field-row ${hasOverride ? 'cms-field-modified' : ''}">
    <div class="cms-field-meta">
      <span class="cms-field-label">${field.label}</span>
      <span class="cms-field-key">clé : ${field.key}</span>
    </div>
    <div class="cms-field-inputs">
      ${inputHtml}
      <div class="cms-field-actions">
        ${hasOverride ? `
          <span class="cms-modified-indicator"><i class="fa-solid fa-circle" style="font-size:.5rem"></i> Modifié</span>
          <button class="adm-btn-icon" title="Réinitialiser au défaut" onclick="admResetCMSField('${field.key}')">
            <i class="fa-solid fa-rotate-left"></i>
          </button>` : `<span class="cms-default-indicator">Défaut</span>`}
      </div>
    </div>
    ${field.type === 'html' ? `<div class="cms-html-note"><i class="fa-solid fa-code"></i> Champ HTML — balises autorisées : &lt;br&gt; &lt;span&gt; &lt;strong&gt; &lt;em&gt;</div>` : ''}
  </div>`;
}

/* ── Sélectionner une page ───────────────────────── */
function admCMSSelectPage(pageId) {
  _cmsCurrentPage = pageId;
  admRenderCMS();
}

/* ── Ouvrir/fermer une section ───────────────────── */
function admCMSToggleSection(sectionId) {
  _cmsOpenSections[sectionId] = !(_cmsOpenSections[sectionId] !== false);
  const cms = admLoad('cms') || {};
  document.getElementById('cms-page-content').innerHTML = admBuildCMSPage(_cmsCurrentPage, cms);
}

/* ── Sauvegarder une section ─────────────────────── */
function admSaveCMSSection(sectionId) {
  const page = CMS_PAGES.find(p => p.id === _cmsCurrentPage);
  if (!page) return;
  const sec = page.sections.find(s => s.id === sectionId);
  if (!sec) return;

  const cms = admLoad('cms') || {};
  let changed = 0;

  sec.fields.forEach(f => {
    const inp = document.getElementById('cms-inp-' + f.key);
    if (!inp) return;
    const val = inp.value.trim();
    if (val === '') {
      delete cms[f.key];
    } else {
      cms[f.key] = val;
      changed++;
    }
  });

  admSave('cms', cms);
  admToast(`✅ Section "${sec.label}" sauvegardée (${changed} champ(s))`, 'ok');

  // Re-render pour mettre à jour les indicateurs
  setTimeout(() => admRenderCMS(), 400);
}

/* ── Réinitialiser un champ ──────────────────────── */
function admResetCMSField(key) {
  const cms = admLoad('cms') || {};
  delete cms[key];
  admSave('cms', cms);
  admToast('🔄 Champ réinitialisé au défaut', 'ok');
  setTimeout(() => admRenderCMS(), 300);
}

/* ── Réinitialiser tout ──────────────────────────── */
function admResetAllCMS() {
  if (!confirm('Réinitialiser TOUT le contenu aux valeurs par défaut ? Cette action est irréversible.')) return;
  localStorage.removeItem(ADM_K.cms);
  admToast('🔄 Tout le contenu réinitialisé', 'ok');
  setTimeout(() => admRenderCMS(), 300);
}

/* ── Preview live dans le même onglet ────────────── */
function admCMSPreview() {
  window.open('index.html', '_blank');
}

/* ══════════════════════════════════════════════
   PUBLIC API — pour les simulateurs
══════════════════════════════════════════════ */
window.admGetFuelPct    = admGetFuelPct;
window.admGetMargin     = admGetMargin;
window.admLogSim        = admLogSim;
window.admLogExpedition = admLogExpedition;
window.admLoad          = admLoad;
