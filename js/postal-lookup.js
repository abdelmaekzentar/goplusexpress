/* ═══════════════════════════════════════════════════════════════
   GO PLUS EXPRESS — Postal Code Lookup & City Autocomplete
   • Maroc     : base embarquée (~200 entrées) — offline, instantané
   • 60+ pays  : API Zippopotam.us (gratuite, sans clé API)
   • Pays      : liste ISO 3166-1 complète (200+ pays, noms français)
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ══════════════════════════════════════════════════════════════
   1. LISTE COMPLÈTE DES PAYS (ISO 3166-1 alpha-2 + noms français)
   ══════════════════════════════════════════════════════════════ */
const COUNTRIES_ALL = [
  {c:"AF",n:"Afghanistan",f:"🇦🇫"},
  {c:"ZA",n:"Afrique du Sud",f:"🇿🇦"},
  {c:"AL",n:"Albanie",f:"🇦🇱"},
  {c:"DZ",n:"Algérie",f:"🇩🇿"},
  {c:"DE",n:"Allemagne",f:"🇩🇪"},
  {c:"AD",n:"Andorre",f:"🇦🇩"},
  {c:"AO",n:"Angola",f:"🇦🇴"},
  {c:"AG",n:"Antigua-et-Barbuda",f:"🇦🇬"},
  {c:"SA",n:"Arabie Saoudite",f:"🇸🇦"},
  {c:"AR",n:"Argentine",f:"🇦🇷"},
  {c:"AM",n:"Arménie",f:"🇦🇲"},
  {c:"AU",n:"Australie",f:"🇦🇺"},
  {c:"AT",n:"Autriche",f:"🇦🇹"},
  {c:"AZ",n:"Azerbaïdjan",f:"🇦🇿"},
  {c:"BS",n:"Bahamas",f:"🇧🇸"},
  {c:"BH",n:"Bahreïn",f:"🇧🇭"},
  {c:"BD",n:"Bangladesh",f:"🇧🇩"},
  {c:"BB",n:"Barbade",f:"🇧🇧"},
  {c:"BE",n:"Belgique",f:"🇧🇪"},
  {c:"BZ",n:"Belize",f:"🇧🇿"},
  {c:"BJ",n:"Bénin",f:"🇧🇯"},
  {c:"BT",n:"Bhoutan",f:"🇧🇹"},
  {c:"BY",n:"Biélorussie",f:"🇧🇾"},
  {c:"MM",n:"Birmanie (Myanmar)",f:"🇲🇲"},
  {c:"BO",n:"Bolivie",f:"🇧🇴"},
  {c:"BA",n:"Bosnie-Herzégovine",f:"🇧🇦"},
  {c:"BW",n:"Botswana",f:"🇧🇼"},
  {c:"BR",n:"Brésil",f:"🇧🇷"},
  {c:"BN",n:"Brunei",f:"🇧🇳"},
  {c:"BG",n:"Bulgarie",f:"🇧🇬"},
  {c:"BF",n:"Burkina Faso",f:"🇧🇫"},
  {c:"BI",n:"Burundi",f:"🇧🇮"},
  {c:"KH",n:"Cambodge",f:"🇰🇭"},
  {c:"CM",n:"Cameroun",f:"🇨🇲"},
  {c:"CA",n:"Canada",f:"🇨🇦"},
  {c:"CV",n:"Cap-Vert",f:"🇨🇻"},
  {c:"CF",n:"Centrafrique",f:"🇨🇫"},
  {c:"CL",n:"Chili",f:"🇨🇱"},
  {c:"CN",n:"Chine",f:"🇨🇳"},
  {c:"CY",n:"Chypre",f:"🇨🇾"},
  {c:"CO",n:"Colombie",f:"🇨🇴"},
  {c:"KM",n:"Comores",f:"🇰🇲"},
  {c:"CG",n:"Congo",f:"🇨🇬"},
  {c:"CD",n:"Congo (RDC)",f:"🇨🇩"},
  {c:"KP",n:"Corée du Nord",f:"🇰🇵"},
  {c:"KR",n:"Corée du Sud",f:"🇰🇷"},
  {c:"CR",n:"Costa Rica",f:"🇨🇷"},
  {c:"CI",n:"Côte d'Ivoire",f:"🇨🇮"},
  {c:"HR",n:"Croatie",f:"🇭🇷"},
  {c:"CU",n:"Cuba",f:"🇨🇺"},
  {c:"DK",n:"Danemark",f:"🇩🇰"},
  {c:"DJ",n:"Djibouti",f:"🇩🇯"},
  {c:"DM",n:"Dominique",f:"🇩🇲"},
  {c:"DO",n:"République Dominicaine",f:"🇩🇴"},
  {c:"EG",n:"Égypte",f:"🇪🇬"},
  {c:"AE",n:"Émirats Arabes Unis",f:"🇦🇪"},
  {c:"EC",n:"Équateur",f:"🇪🇨"},
  {c:"ER",n:"Érythrée",f:"🇪🇷"},
  {c:"ES",n:"Espagne",f:"🇪🇸"},
  {c:"EE",n:"Estonie",f:"🇪🇪"},
  {c:"SZ",n:"Eswatini",f:"🇸🇿"},
  {c:"ET",n:"Éthiopie",f:"🇪🇹"},
  {c:"FJ",n:"Fidji",f:"🇫🇯"},
  {c:"FI",n:"Finlande",f:"🇫🇮"},
  {c:"FR",n:"France",f:"🇫🇷"},
  {c:"GA",n:"Gabon",f:"🇬🇦"},
  {c:"GM",n:"Gambie",f:"🇬🇲"},
  {c:"GE",n:"Géorgie",f:"🇬🇪"},
  {c:"GH",n:"Ghana",f:"🇬🇭"},
  {c:"GR",n:"Grèce",f:"🇬🇷"},
  {c:"GD",n:"Grenade",f:"🇬🇩"},
  {c:"GT",n:"Guatemala",f:"🇬🇹"},
  {c:"GN",n:"Guinée",f:"🇬🇳"},
  {c:"GW",n:"Guinée-Bissau",f:"🇬🇼"},
  {c:"GQ",n:"Guinée équatoriale",f:"🇬🇶"},
  {c:"GY",n:"Guyana",f:"🇬🇾"},
  {c:"HT",n:"Haïti",f:"🇭🇹"},
  {c:"HN",n:"Honduras",f:"🇭🇳"},
  {c:"HU",n:"Hongrie",f:"🇭🇺"},
  {c:"IN",n:"Inde",f:"🇮🇳"},
  {c:"ID",n:"Indonésie",f:"🇮🇩"},
  {c:"IQ",n:"Irak",f:"🇮🇶"},
  {c:"IR",n:"Iran",f:"🇮🇷"},
  {c:"IE",n:"Irlande",f:"🇮🇪"},
  {c:"IS",n:"Islande",f:"🇮🇸"},
  {c:"IL",n:"Israël",f:"🇮🇱"},
  {c:"IT",n:"Italie",f:"🇮🇹"},
  {c:"JM",n:"Jamaïque",f:"🇯🇲"},
  {c:"JP",n:"Japon",f:"🇯🇵"},
  {c:"JO",n:"Jordanie",f:"🇯🇴"},
  {c:"KZ",n:"Kazakhstan",f:"🇰🇿"},
  {c:"KE",n:"Kenya",f:"🇰🇪"},
  {c:"KG",n:"Kirghizistan",f:"🇰🇬"},
  {c:"KI",n:"Kiribati",f:"🇰🇮"},
  {c:"KW",n:"Koweït",f:"🇰🇼"},
  {c:"LA",n:"Laos",f:"🇱🇦"},
  {c:"LS",n:"Lesotho",f:"🇱🇸"},
  {c:"LV",n:"Lettonie",f:"🇱🇻"},
  {c:"LB",n:"Liban",f:"🇱🇧"},
  {c:"LR",n:"Libéria",f:"🇱🇷"},
  {c:"LY",n:"Libye",f:"🇱🇾"},
  {c:"LI",n:"Liechtenstein",f:"🇱🇮"},
  {c:"LT",n:"Lituanie",f:"🇱🇹"},
  {c:"LU",n:"Luxembourg",f:"🇱🇺"},
  {c:"MG",n:"Madagascar",f:"🇲🇬"},
  {c:"MY",n:"Malaisie",f:"🇲🇾"},
  {c:"MW",n:"Malawi",f:"🇲🇼"},
  {c:"MV",n:"Maldives",f:"🇲🇻"},
  {c:"ML",n:"Mali",f:"🇲🇱"},
  {c:"MT",n:"Malte",f:"🇲🇹"},
  {c:"MA",n:"Maroc",f:"🇲🇦"},
  {c:"MH",n:"Marshall",f:"🇲🇭"},
  {c:"MU",n:"Maurice",f:"🇲🇺"},
  {c:"MR",n:"Mauritanie",f:"🇲🇷"},
  {c:"MX",n:"Mexique",f:"🇲🇽"},
  {c:"FM",n:"Micronésie",f:"🇫🇲"},
  {c:"MD",n:"Moldavie",f:"🇲🇩"},
  {c:"MC",n:"Monaco",f:"🇲🇨"},
  {c:"MN",n:"Mongolie",f:"🇲🇳"},
  {c:"ME",n:"Monténégro",f:"🇲🇪"},
  {c:"MZ",n:"Mozambique",f:"🇲🇿"},
  {c:"NA",n:"Namibie",f:"🇳🇦"},
  {c:"NR",n:"Nauru",f:"🇳🇷"},
  {c:"NP",n:"Népal",f:"🇳🇵"},
  {c:"NI",n:"Nicaragua",f:"🇳🇮"},
  {c:"NE",n:"Niger",f:"🇳🇪"},
  {c:"NG",n:"Nigéria",f:"🇳🇬"},
  {c:"NO",n:"Norvège",f:"🇳🇴"},
  {c:"NZ",n:"Nouvelle-Zélande",f:"🇳🇿"},
  {c:"OM",n:"Oman",f:"🇴🇲"},
  {c:"UG",n:"Ouganda",f:"🇺🇬"},
  {c:"UZ",n:"Ouzbékistan",f:"🇺🇿"},
  {c:"PK",n:"Pakistan",f:"🇵🇰"},
  {c:"PW",n:"Palaos",f:"🇵🇼"},
  {c:"PA",n:"Panama",f:"🇵🇦"},
  {c:"PG",n:"Papouasie-Nouvelle-Guinée",f:"🇵🇬"},
  {c:"PY",n:"Paraguay",f:"🇵🇾"},
  {c:"NL",n:"Pays-Bas",f:"🇳🇱"},
  {c:"PE",n:"Pérou",f:"🇵🇪"},
  {c:"PH",n:"Philippines",f:"🇵🇭"},
  {c:"PL",n:"Pologne",f:"🇵🇱"},
  {c:"PT",n:"Portugal",f:"🇵🇹"},
  {c:"QA",n:"Qatar",f:"🇶🇦"},
  {c:"RO",n:"Roumanie",f:"🇷🇴"},
  {c:"GB",n:"Royaume-Uni",f:"🇬🇧"},
  {c:"RU",n:"Russie",f:"🇷🇺"},
  {c:"RW",n:"Rwanda",f:"🇷🇼"},
  {c:"KN",n:"Saint-Kitts-et-Nevis",f:"🇰🇳"},
  {c:"SM",n:"Saint-Marin",f:"🇸🇲"},
  {c:"VC",n:"Saint-Vincent-et-les-Grenadines",f:"🇻🇨"},
  {c:"LC",n:"Sainte-Lucie",f:"🇱🇨"},
  {c:"WS",n:"Samoa",f:"🇼🇸"},
  {c:"ST",n:"São Tomé-et-Príncipe",f:"🇸🇹"},
  {c:"SN",n:"Sénégal",f:"🇸🇳"},
  {c:"RS",n:"Serbie",f:"🇷🇸"},
  {c:"SC",n:"Seychelles",f:"🇸🇨"},
  {c:"SL",n:"Sierra Leone",f:"🇸🇱"},
  {c:"SG",n:"Singapour",f:"🇸🇬"},
  {c:"SK",n:"Slovaquie",f:"🇸🇰"},
  {c:"SI",n:"Slovénie",f:"🇸🇮"},
  {c:"SO",n:"Somalie",f:"🇸🇴"},
  {c:"SD",n:"Soudan",f:"🇸🇩"},
  {c:"SS",n:"Soudan du Sud",f:"🇸🇸"},
  {c:"LK",n:"Sri Lanka",f:"🇱🇰"},
  {c:"SE",n:"Suède",f:"🇸🇪"},
  {c:"CH",n:"Suisse",f:"🇨🇭"},
  {c:"SR",n:"Suriname",f:"🇸🇷"},
  {c:"SY",n:"Syrie",f:"🇸🇾"},
  {c:"TJ",n:"Tadjikistan",f:"🇹🇯"},
  {c:"TZ",n:"Tanzanie",f:"🇹🇿"},
  {c:"TD",n:"Tchad",f:"🇹🇩"},
  {c:"CZ",n:"Tchéquie",f:"🇨🇿"},
  {c:"TH",n:"Thaïlande",f:"🇹🇭"},
  {c:"TL",n:"Timor oriental",f:"🇹🇱"},
  {c:"TG",n:"Togo",f:"🇹🇬"},
  {c:"TO",n:"Tonga",f:"🇹🇴"},
  {c:"TT",n:"Trinité-et-Tobago",f:"🇹🇹"},
  {c:"TN",n:"Tunisie",f:"🇹🇳"},
  {c:"TM",n:"Turkménistan",f:"🇹🇲"},
  {c:"TR",n:"Turquie",f:"🇹🇷"},
  {c:"TV",n:"Tuvalu",f:"🇹🇻"},
  {c:"UA",n:"Ukraine",f:"🇺🇦"},
  {c:"US",n:"États-Unis",f:"🇺🇸"},
  {c:"UY",n:"Uruguay",f:"🇺🇾"},
  {c:"VU",n:"Vanuatu",f:"🇻🇺"},
  {c:"VE",n:"Venezuela",f:"🇻🇪"},
  {c:"VN",n:"Viêt Nam",f:"🇻🇳"},
  {c:"YE",n:"Yémen",f:"🇾🇪"},
  {c:"ZM",n:"Zambie",f:"🇿🇲"},
  {c:"ZW",n:"Zimbabwe",f:"🇿🇼"},
];

/* ══════════════════════════════════════════════════════════════
   2. BASE CODES POSTAUX MAROC (embarquée ~200 entrées)
      Format: { z: code_postal, c: ville, r: région }
   ══════════════════════════════════════════════════════════════ */
const MA_PC = [
  // ── Rabat-Salé-Kénitra ────────────────────────────────────────
  {z:"10000",c:"Rabat",r:"Rabat-Salé-Kénitra"},
  {z:"10010",c:"Rabat (Agdal)",r:"Rabat-Salé-Kénitra"},
  {z:"10020",c:"Rabat (Hassan)",r:"Rabat-Salé-Kénitra"},
  {z:"10050",c:"Rabat (Souissi)",r:"Rabat-Salé-Kénitra"},
  {z:"10080",c:"Rabat (Hay Riad)",r:"Rabat-Salé-Kénitra"},
  {z:"10090",c:"Rabat (Ryad)",r:"Rabat-Salé-Kénitra"},
  {z:"10100",c:"Salé",r:"Rabat-Salé-Kénitra"},
  {z:"10150",c:"Salé (Tabriquet)",r:"Rabat-Salé-Kénitra"},
  {z:"10200",c:"Salé (El Bettana)",r:"Rabat-Salé-Kénitra"},
  {z:"10300",c:"Témara",r:"Rabat-Salé-Kénitra"},
  {z:"10340",c:"Témara (Akreuch)",r:"Rabat-Salé-Kénitra"},
  {z:"10400",c:"Skhirat",r:"Rabat-Salé-Kénitra"},
  {z:"10500",c:"Tiflet",r:"Rabat-Salé-Kénitra"},
  {z:"11000",c:"Kénitra",r:"Rabat-Salé-Kénitra"},
  {z:"11020",c:"Kénitra (Saknia)",r:"Rabat-Salé-Kénitra"},
  {z:"11050",c:"Kénitra (Bir Rami)",r:"Rabat-Salé-Kénitra"},
  {z:"11100",c:"Sidi Kacem",r:"Rabat-Salé-Kénitra"},
  {z:"11200",c:"Sidi Slimane",r:"Rabat-Salé-Kénitra"},
  {z:"11300",c:"Sidi Yahia El Gharb",r:"Rabat-Salé-Kénitra"},
  {z:"11400",c:"Mechraa Bel Ksiri",r:"Rabat-Salé-Kénitra"},
  {z:"11500",c:"Souk El Arbaa",r:"Rabat-Salé-Kénitra"},
  {z:"12000",c:"Sidi Allal Tazi",r:"Rabat-Salé-Kénitra"},
  {z:"13000",c:"Khémisset",r:"Rabat-Salé-Kénitra"},
  // ── Casablanca-Settat ─────────────────────────────────────────
  {z:"20000",c:"Casablanca",r:"Casablanca-Settat"},
  {z:"20020",c:"Casablanca (Hay Mohammadi)",r:"Casablanca-Settat"},
  {z:"20050",c:"Casablanca (Maarif)",r:"Casablanca-Settat"},
  {z:"20100",c:"Casablanca (Ain Chock)",r:"Casablanca-Settat"},
  {z:"20150",c:"Casablanca (Ain Sebaa)",r:"Casablanca-Settat"},
  {z:"20200",c:"Casablanca (Sidi Bernoussi)",r:"Casablanca-Settat"},
  {z:"20250",c:"Casablanca (Ben M'Sik)",r:"Casablanca-Settat"},
  {z:"20300",c:"Casablanca (Sbata)",r:"Casablanca-Settat"},
  {z:"20380",c:"Casablanca (Bouskoura)",r:"Casablanca-Settat"},
  {z:"20400",c:"Casablanca (Hay Hassani)",r:"Casablanca-Settat"},
  {z:"20450",c:"Casablanca (Anfa)",r:"Casablanca-Settat"},
  {z:"20500",c:"Casablanca (Aïn Diab)",r:"Casablanca-Settat"},
  {z:"20600",c:"Casablanca (Oulfa)",r:"Casablanca-Settat"},
  {z:"20700",c:"Casablanca (Médiouna)",r:"Casablanca-Settat"},
  {z:"20800",c:"Ain Harrouda",r:"Casablanca-Settat"},
  {z:"20900",c:"Bouskoura",r:"Casablanca-Settat"},
  {z:"22000",c:"Mohammedia",r:"Casablanca-Settat"},
  {z:"22050",c:"Mohammedia (Ben Yakhlef)",r:"Casablanca-Settat"},
  {z:"24000",c:"El Jadida",r:"Casablanca-Settat"},
  {z:"24100",c:"Azemmour",r:"Casablanca-Settat"},
  {z:"24200",c:"Sidi Bennour",r:"Casablanca-Settat"},
  {z:"25000",c:"Khouribga",r:"Béni Mellal-Khénifra"},
  {z:"25100",c:"Oued Zem",r:"Béni Mellal-Khénifra"},
  {z:"25200",c:"Bejaad",r:"Béni Mellal-Khénifra"},
  {z:"26000",c:"Settat",r:"Casablanca-Settat"},
  {z:"26100",c:"Ben Ahmed",r:"Casablanca-Settat"},
  {z:"27000",c:"Berrechid",r:"Casablanca-Settat"},
  {z:"27100",c:"Ben Slimane",r:"Casablanca-Settat"},
  // ── Fès-Meknès ────────────────────────────────────────────────
  {z:"30000",c:"Fès",r:"Fès-Meknès"},
  {z:"30010",c:"Fès (Médina)",r:"Fès-Meknès"},
  {z:"30020",c:"Fès (Ville Nouvelle)",r:"Fès-Meknès"},
  {z:"30050",c:"Fès (Agdal)",r:"Fès-Meknès"},
  {z:"30100",c:"Fès (Route Immouzer)",r:"Fès-Meknès"},
  {z:"30200",c:"Fès (Aïn Chkef)",r:"Fès-Meknès"},
  {z:"31000",c:"Meknès",r:"Fès-Meknès"},
  {z:"31050",c:"Meknès (Hamria)",r:"Fès-Meknès"},
  {z:"31100",c:"Meknès (Ismailia)",r:"Fès-Meknès"},
  {z:"31200",c:"Meknès (Zitoune)",r:"Fès-Meknès"},
  {z:"32000",c:"Taza",r:"Fès-Meknès"},
  {z:"33000",c:"Sefrou",r:"Fès-Meknès"},
  {z:"34000",c:"Boulmane",r:"Fès-Meknès"},
  {z:"35000",c:"El Hajeb",r:"Fès-Meknès"},
  {z:"36000",c:"Taounate",r:"Fès-Meknès"},
  {z:"37000",c:"Guercif",r:"Fès-Meknès"},
  {z:"38000",c:"Ifrane",r:"Fès-Meknès"},
  {z:"38200",c:"Azrou",r:"Fès-Meknès"},
  {z:"38900",c:"Khénifra",r:"Béni Mellal-Khénifra"},
  // ── Marrakech-Safi ────────────────────────────────────────────
  {z:"40000",c:"Marrakech",r:"Marrakech-Safi"},
  {z:"40010",c:"Marrakech (Médina)",r:"Marrakech-Safi"},
  {z:"40050",c:"Marrakech (Guéliz)",r:"Marrakech-Safi"},
  {z:"40100",c:"Marrakech (Hivernage)",r:"Marrakech-Safi"},
  {z:"40200",c:"Marrakech (Ménara)",r:"Marrakech-Safi"},
  {z:"40300",c:"Marrakech (Massira)",r:"Marrakech-Safi"},
  {z:"40400",c:"Marrakech (Syba Sidi Youssf)",r:"Marrakech-Safi"},
  {z:"41000",c:"El Kelaa des Sraghna",r:"Marrakech-Safi"},
  {z:"42000",c:"Youssoufia",r:"Marrakech-Safi"},
  {z:"43000",c:"Chichaoua",r:"Marrakech-Safi"},
  {z:"44000",c:"Essaouira",r:"Marrakech-Safi"},
  {z:"45000",c:"Safi",r:"Marrakech-Safi"},
  {z:"46000",c:"Safi (Hay Salam)",r:"Marrakech-Safi"},
  {z:"47000",c:"Ben Guerir",r:"Marrakech-Safi"},
  // ── Béni Mellal-Khénifra ──────────────────────────────────────
  {z:"23000",c:"Béni Mellal",r:"Béni Mellal-Khénifra"},
  {z:"23050",c:"Béni Mellal (Al Kasba)",r:"Béni Mellal-Khénifra"},
  {z:"23200",c:"Fquih Ben Salah",r:"Béni Mellal-Khénifra"},
  {z:"23400",c:"Azilal",r:"Béni Mellal-Khénifra"},
  // ── Oriental ──────────────────────────────────────────────────
  {z:"60000",c:"Oujda",r:"Oriental"},
  {z:"60020",c:"Oujda (Lazaret)",r:"Oriental"},
  {z:"60050",c:"Oujda (Hay Qods)",r:"Oriental"},
  {z:"61000",c:"Berkane",r:"Oriental"},
  {z:"62000",c:"Nador",r:"Oriental"},
  {z:"62050",c:"Nador (Bni Ansar)",r:"Oriental"},
  {z:"63000",c:"Taourirt",r:"Oriental"},
  {z:"64000",c:"Jerada",r:"Oriental"},
  {z:"65000",c:"Bouarfa",r:"Oriental"},
  {z:"66000",c:"Figuig",r:"Oriental"},
  // ── Drâa-Tafilalet ────────────────────────────────────────────
  {z:"45200",c:"Ouarzazate",r:"Drâa-Tafilalet"},
  {z:"45300",c:"Boumalne-Dadès",r:"Drâa-Tafilalet"},
  {z:"47900",c:"Zagora",r:"Drâa-Tafilalet"},
  {z:"52000",c:"Errachidia",r:"Drâa-Tafilalet"},
  {z:"52100",c:"Erfoud",r:"Drâa-Tafilalet"},
  {z:"52200",c:"Rissani",r:"Drâa-Tafilalet"},
  {z:"53000",c:"Midelt",r:"Drâa-Tafilalet"},
  {z:"54000",c:"Tinghir",r:"Drâa-Tafilalet"},
  // ── Souss-Massa ───────────────────────────────────────────────
  {z:"80000",c:"Agadir",r:"Souss-Massa"},
  {z:"80020",c:"Agadir (Talborjt)",r:"Souss-Massa"},
  {z:"80050",c:"Agadir (Cité Suisse)",r:"Souss-Massa"},
  {z:"80100",c:"Inezgane",r:"Souss-Massa"},
  {z:"80150",c:"Dcheira El Jihadia",r:"Souss-Massa"},
  {z:"80200",c:"Ait Melloul",r:"Souss-Massa"},
  {z:"81000",c:"Tiznit",r:"Souss-Massa"},
  {z:"82000",c:"Taroudant",r:"Souss-Massa"},
  {z:"82100",c:"Tata",r:"Souss-Massa"},
  // ── Guelmim-Oued Noun ─────────────────────────────────────────
  {z:"86000",c:"Guelmim",r:"Guelmim-Oued Noun"},
  {z:"87000",c:"Sidi Ifni",r:"Guelmim-Oued Noun"},
  {z:"88000",c:"Tan-Tan",r:"Guelmim-Oued Noun"},
  // ── Tanger-Tétouan-Al Hoceïma ─────────────────────────────────
  {z:"90000",c:"Tanger",r:"Tanger-Tétouan-Al Hoceïma"},
  {z:"90010",c:"Tanger (Médina)",r:"Tanger-Tétouan-Al Hoceïma"},
  {z:"90020",c:"Tanger (Malabata)",r:"Tanger-Tétouan-Al Hoceïma"},
  {z:"90050",c:"Tanger (Mghogha)",r:"Tanger-Tétouan-Al Hoceïma"},
  {z:"90100",c:"Asilah",r:"Tanger-Tétouan-Al Hoceïma"},
  {z:"91000",c:"Tétouan",r:"Tanger-Tétouan-Al Hoceïma"},
  {z:"91050",c:"Tétouan (Médina)",r:"Tanger-Tétouan-Al Hoceïma"},
  {z:"91100",c:"Mdiq",r:"Tanger-Tétouan-Al Hoceïma"},
  {z:"91200",c:"Martil",r:"Tanger-Tétouan-Al Hoceïma"},
  {z:"91300",c:"Fnideq",r:"Tanger-Tétouan-Al Hoceïma"},
  {z:"92000",c:"Chefchaouen",r:"Tanger-Tétouan-Al Hoceïma"},
  {z:"93000",c:"Larache",r:"Tanger-Tétouan-Al Hoceïma"},
  {z:"93100",c:"Ksar El Kébir",r:"Tanger-Tétouan-Al Hoceïma"},
  {z:"94000",c:"Al Hoceïma",r:"Tanger-Tétouan-Al Hoceïma"},
  {z:"94100",c:"Imzouren",r:"Tanger-Tétouan-Al Hoceïma"},
  // ── Laâyoune-Sakia El Hamra ───────────────────────────────────
  {z:"70000",c:"Laâyoune",r:"Laâyoune-Sakia El Hamra"},
  {z:"71000",c:"Boujdour",r:"Laâyoune-Sakia El Hamra"},
  {z:"72000",c:"Smara",r:"Laâyoune-Sakia El Hamra"},
  // ── Dakhla-Oued Ed-Dahab ──────────────────────────────────────
  {z:"73000",c:"Dakhla",r:"Dakhla-Oued Ed-Dahab"},
  {z:"74000",c:"Aousserd",r:"Dakhla-Oued Ed-Dahab"},
];

/* Index rapide code postal → entrée */
const MA_ZIP_IDX = {};
MA_PC.forEach(e => { MA_ZIP_IDX[e.z] = e; });

/* ══════════════════════════════════════════════════════════════
   3. BASE INTERNATIONALE EMBARQUÉE — principales villes
      Format: { z: code_postal, c: ville, r: région/état }
      Pays couverts: FR BE DE ES IT NL GB PT CH TR US CA AU CN JP
   ══════════════════════════════════════════════════════════════ */
const INTL_CITIES = {

  /* ── France ── */
  FR:[
    {z:"75001",c:"Paris 1er",r:"Île-de-France"},
    {z:"75002",c:"Paris 2ème",r:"Île-de-France"},
    {z:"75003",c:"Paris 3ème",r:"Île-de-France"},
    {z:"75004",c:"Paris 4ème",r:"Île-de-France"},
    {z:"75005",c:"Paris 5ème",r:"Île-de-France"},
    {z:"75006",c:"Paris 6ème",r:"Île-de-France"},
    {z:"75007",c:"Paris 7ème",r:"Île-de-France"},
    {z:"75008",c:"Paris 8ème",r:"Île-de-France"},
    {z:"75009",c:"Paris 9ème",r:"Île-de-France"},
    {z:"75010",c:"Paris 10ème",r:"Île-de-France"},
    {z:"75011",c:"Paris 11ème",r:"Île-de-France"},
    {z:"75012",c:"Paris 12ème",r:"Île-de-France"},
    {z:"75013",c:"Paris 13ème",r:"Île-de-France"},
    {z:"75014",c:"Paris 14ème",r:"Île-de-France"},
    {z:"75015",c:"Paris 15ème",r:"Île-de-France"},
    {z:"75016",c:"Paris 16ème",r:"Île-de-France"},
    {z:"75017",c:"Paris 17ème",r:"Île-de-France"},
    {z:"75018",c:"Paris 18ème",r:"Île-de-France"},
    {z:"75019",c:"Paris 19ème",r:"Île-de-France"},
    {z:"75020",c:"Paris 20ème",r:"Île-de-France"},
    {z:"92100",c:"Boulogne-Billancourt",r:"Île-de-France"},
    {z:"92200",c:"Neuilly-sur-Seine",r:"Île-de-France"},
    {z:"93100",c:"Montreuil",r:"Île-de-France"},
    {z:"93200",c:"Saint-Denis",r:"Île-de-France"},
    {z:"94000",c:"Créteil",r:"Île-de-France"},
    {z:"95100",c:"Argenteuil",r:"Île-de-France"},
    {z:"78000",c:"Versailles",r:"Île-de-France"},
    {z:"69001",c:"Lyon 1er",r:"Auvergne-Rhône-Alpes"},
    {z:"69002",c:"Lyon 2ème",r:"Auvergne-Rhône-Alpes"},
    {z:"69003",c:"Lyon 3ème",r:"Auvergne-Rhône-Alpes"},
    {z:"69006",c:"Lyon 6ème",r:"Auvergne-Rhône-Alpes"},
    {z:"69007",c:"Lyon 7ème",r:"Auvergne-Rhône-Alpes"},
    {z:"38000",c:"Grenoble",r:"Auvergne-Rhône-Alpes"},
    {z:"13001",c:"Marseille 1er",r:"PACA"},
    {z:"13002",c:"Marseille 2ème",r:"PACA"},
    {z:"13008",c:"Marseille 8ème",r:"PACA"},
    {z:"13013",c:"Marseille 13ème",r:"PACA"},
    {z:"13100",c:"Aix-en-Provence",r:"PACA"},
    {z:"83000",c:"Toulon",r:"PACA"},
    {z:"06000",c:"Nice",r:"PACA"},
    {z:"06400",c:"Cannes",r:"PACA"},
    {z:"33000",c:"Bordeaux",r:"Nouvelle-Aquitaine"},
    {z:"33100",c:"Bordeaux (Caudéran)",r:"Nouvelle-Aquitaine"},
    {z:"87000",c:"Limoges",r:"Nouvelle-Aquitaine"},
    {z:"64000",c:"Pau",r:"Nouvelle-Aquitaine"},
    {z:"31000",c:"Toulouse",r:"Occitanie"},
    {z:"31100",c:"Toulouse (Rangueil)",r:"Occitanie"},
    {z:"34000",c:"Montpellier",r:"Occitanie"},
    {z:"66000",c:"Perpignan",r:"Occitanie"},
    {z:"30000",c:"Nîmes",r:"Occitanie"},
    {z:"59000",c:"Lille",r:"Hauts-de-France"},
    {z:"59100",c:"Roubaix",r:"Hauts-de-France"},
    {z:"59200",c:"Tourcoing",r:"Hauts-de-France"},
    {z:"80000",c:"Amiens",r:"Hauts-de-France"},
    {z:"44000",c:"Nantes",r:"Pays de la Loire"},
    {z:"72000",c:"Le Mans",r:"Pays de la Loire"},
    {z:"49000",c:"Angers",r:"Pays de la Loire"},
    {z:"67000",c:"Strasbourg",r:"Grand Est"},
    {z:"68100",c:"Mulhouse",r:"Grand Est"},
    {z:"57000",c:"Metz",r:"Grand Est"},
    {z:"54000",c:"Nancy",r:"Grand Est"},
    {z:"51100",c:"Reims",r:"Grand Est"},
    {z:"35000",c:"Rennes",r:"Bretagne"},
    {z:"29200",c:"Brest",r:"Bretagne"},
    {z:"21000",c:"Dijon",r:"Bourgogne-Franche-Comté"},
    {z:"25000",c:"Besançon",r:"Bourgogne-Franche-Comté"},
    {z:"37000",c:"Tours",r:"Centre-Val de Loire"},
    {z:"45000",c:"Orléans",r:"Centre-Val de Loire"},
    {z:"14000",c:"Caen",r:"Normandie"},
    {z:"76600",c:"Le Havre",r:"Normandie"},
    {z:"76000",c:"Rouen",r:"Normandie"},
    {z:"63000",c:"Clermont-Ferrand",r:"Auvergne-Rhône-Alpes"},
  ],

  /* ── Belgique ── */
  BE:[
    {z:"1000",c:"Bruxelles",r:"Bruxelles-Capitale"},
    {z:"1020",c:"Bruxelles (Laeken)",r:"Bruxelles-Capitale"},
    {z:"1040",c:"Etterbeek",r:"Bruxelles-Capitale"},
    {z:"1050",c:"Ixelles",r:"Bruxelles-Capitale"},
    {z:"1060",c:"Saint-Gilles",r:"Bruxelles-Capitale"},
    {z:"1070",c:"Anderlecht",r:"Bruxelles-Capitale"},
    {z:"1080",c:"Molenbeek-Saint-Jean",r:"Bruxelles-Capitale"},
    {z:"2000",c:"Antwerpen",r:"Flandre"},
    {z:"2020",c:"Antwerpen (Hoboken)",r:"Flandre"},
    {z:"9000",c:"Gent",r:"Flandre"},
    {z:"8000",c:"Brugge",r:"Flandre"},
    {z:"3000",c:"Leuven",r:"Flandre"},
    {z:"2800",c:"Mechelen",r:"Flandre"},
    {z:"4000",c:"Liège",r:"Wallonie"},
    {z:"5000",c:"Namur",r:"Wallonie"},
    {z:"6000",c:"Charleroi",r:"Wallonie"},
    {z:"7000",c:"Mons",r:"Wallonie"},
    {z:"4700",c:"Eupen",r:"Wallonie"},
    {z:"1300",c:"Wavre",r:"Wallonie"},
  ],

  /* ── Allemagne ── */
  DE:[
    {z:"10115",c:"Berlin (Mitte)",r:"Berlin"},
    {z:"10178",c:"Berlin (Alexanderplatz)",r:"Berlin"},
    {z:"10247",c:"Berlin (Friedrichshain)",r:"Berlin"},
    {z:"10317",c:"Berlin (Lichtenberg)",r:"Berlin"},
    {z:"10783",c:"Berlin (Schöneberg)",r:"Berlin"},
    {z:"20095",c:"Hamburg",r:"Hamburg"},
    {z:"20099",c:"Hamburg (St. Georg)",r:"Hamburg"},
    {z:"20355",c:"Hamburg (Neustadt)",r:"Hamburg"},
    {z:"80331",c:"München (Altstadt)",r:"Bavière"},
    {z:"80333",c:"München (Maxvorstadt)",r:"Bavière"},
    {z:"80469",c:"München (Glockenbachviertel)",r:"Bavière"},
    {z:"60311",c:"Frankfurt am Main",r:"Hesse"},
    {z:"60329",c:"Frankfurt (Bahnhofsviertel)",r:"Hesse"},
    {z:"70173",c:"Stuttgart (Mitte)",r:"Bade-Wurtemberg"},
    {z:"70176",c:"Stuttgart (Westend)",r:"Bade-Wurtemberg"},
    {z:"79098",c:"Freiburg im Breisgau",r:"Bade-Wurtemberg"},
    {z:"69115",c:"Heidelberg",r:"Bade-Wurtemberg"},
    {z:"68159",c:"Mannheim",r:"Bade-Wurtemberg"},
    {z:"40210",c:"Düsseldorf",r:"Rhénanie-du-Nord"},
    {z:"40213",c:"Düsseldorf (Altstadt)",r:"Rhénanie-du-Nord"},
    {z:"50667",c:"Köln (Innenstadt)",r:"Rhénanie-du-Nord"},
    {z:"50672",c:"Köln (Neustadt)",r:"Rhénanie-du-Nord"},
    {z:"44135",c:"Dortmund",r:"Rhénanie-du-Nord"},
    {z:"44787",c:"Bochum",r:"Rhénanie-du-Nord"},
    {z:"45127",c:"Essen",r:"Rhénanie-du-Nord"},
    {z:"47051",c:"Duisburg",r:"Rhénanie-du-Nord"},
    {z:"01067",c:"Dresden",r:"Saxe"},
    {z:"04103",c:"Leipzig",r:"Saxe"},
    {z:"30159",c:"Hannover",r:"Basse-Saxe"},
    {z:"28195",c:"Bremen",r:"Brême"},
    {z:"90402",c:"Nürnberg",r:"Bavière"},
    {z:"89073",c:"Ulm",r:"Bade-Wurtemberg"},
  ],

  /* ── Espagne ── */
  ES:[
    {z:"28001",c:"Madrid (Retiro)",r:"Madrid"},
    {z:"28002",c:"Madrid (Salamanca)",r:"Madrid"},
    {z:"28010",c:"Madrid (Almagro)",r:"Madrid"},
    {z:"28013",c:"Madrid (Centro)",r:"Madrid"},
    {z:"28020",c:"Madrid (Tetuán)",r:"Madrid"},
    {z:"28045",c:"Madrid (Arganzuela)",r:"Madrid"},
    {z:"08001",c:"Barcelona (Barri Gòtic)",r:"Catalogne"},
    {z:"08002",c:"Barcelona (El Born)",r:"Catalogne"},
    {z:"08010",c:"Barcelona (Eixample)",r:"Catalogne"},
    {z:"08028",c:"Barcelona (Les Corts)",r:"Catalogne"},
    {z:"41001",c:"Sevilla",r:"Andalousie"},
    {z:"41010",c:"Sevilla (Triana)",r:"Andalousie"},
    {z:"29001",c:"Málaga",r:"Andalousie"},
    {z:"11001",c:"Cádiz",r:"Andalousie"},
    {z:"14001",c:"Córdoba",r:"Andalousie"},
    {z:"18001",c:"Granada",r:"Andalousie"},
    {z:"46001",c:"Valencia (Centro)",r:"Valence"},
    {z:"46021",c:"Valencia (Benimaclet)",r:"Valence"},
    {z:"03001",c:"Alicante",r:"Valence"},
    {z:"50001",c:"Zaragoza",r:"Aragon"},
    {z:"48001",c:"Bilbao",r:"Pays Basque"},
    {z:"20001",c:"San Sebastián",r:"Pays Basque"},
    {z:"47001",c:"Valladolid",r:"Castille-et-León"},
    {z:"37001",c:"Salamanca",r:"Castille-et-León"},
    {z:"30001",c:"Murcia",r:"Murcie"},
    {z:"33001",c:"Oviedo",r:"Asturies"},
    {z:"15001",c:"A Coruña",r:"Galice"},
    {z:"36201",c:"Vigo",r:"Galice"},
    {z:"07001",c:"Palma de Mallorca",r:"Baléares"},
    {z:"35001",c:"Las Palmas de Gran Canaria",r:"Canaries"},
  ],

  /* ── Italie ── */
  IT:[
    {z:"00185",c:"Roma (Centro)",r:"Latium"},
    {z:"00192",c:"Roma (Prati)",r:"Latium"},
    {z:"00198",c:"Roma (Parioli)",r:"Latium"},
    {z:"20121",c:"Milano (Centro)",r:"Lombardie"},
    {z:"20123",c:"Milano (Brera)",r:"Lombardie"},
    {z:"20129",c:"Milano (Porta Venezia)",r:"Lombardie"},
    {z:"80121",c:"Napoli (Chiaia)",r:"Campanie"},
    {z:"80133",c:"Napoli (Centro)",r:"Campanie"},
    {z:"10121",c:"Torino (Centro)",r:"Piémont"},
    {z:"10128",c:"Torino (Crocetta)",r:"Piémont"},
    {z:"16121",c:"Genova",r:"Ligurie"},
    {z:"40121",c:"Bologna",r:"Émilie-Romagne"},
    {z:"50121",c:"Firenze",r:"Toscane"},
    {z:"50122",c:"Firenze (Duomo)",r:"Toscane"},
    {z:"30121",c:"Venezia",r:"Vénétie"},
    {z:"37121",c:"Verona",r:"Vénétie"},
    {z:"25121",c:"Brescia",r:"Lombardie"},
    {z:"70121",c:"Bari",r:"Pouilles"},
    {z:"90121",c:"Palermo",r:"Sicile"},
    {z:"95121",c:"Catania",r:"Sicile"},
    {z:"09121",c:"Cagliari",r:"Sardaigne"},
  ],

  /* ── Pays-Bas ── */
  NL:[
    {z:"1011",c:"Amsterdam (Centrum)",r:"Hollande-Septentrionale"},
    {z:"1012",c:"Amsterdam (De Wallen)",r:"Hollande-Septentrionale"},
    {z:"1054",c:"Amsterdam (Oud-West)",r:"Hollande-Septentrionale"},
    {z:"1071",c:"Amsterdam (Museum Quarter)",r:"Hollande-Septentrionale"},
    {z:"3011",c:"Rotterdam (Centrum)",r:"Hollande-Méridionale"},
    {z:"3012",c:"Rotterdam (Cool)",r:"Hollande-Méridionale"},
    {z:"3062",c:"Rotterdam (Kralingen)",r:"Hollande-Méridionale"},
    {z:"2511",c:"Den Haag (Centrum)",r:"Hollande-Méridionale"},
    {z:"2518",c:"Den Haag (Scheveningen)",r:"Hollande-Méridionale"},
    {z:"3511",c:"Utrecht (Centrum)",r:"Utrecht"},
    {z:"5611",c:"Eindhoven",r:"Brabant-Septentrional"},
    {z:"9711",c:"Groningen",r:"Groningue"},
    {z:"6811",c:"Arnhem",r:"Gueldre"},
    {z:"7511",c:"Enschede",r:"Overijssel"},
    {z:"6221",c:"Maastricht",r:"Limbourg"},
    {z:"2301",c:"Leiden",r:"Hollande-Méridionale"},
    {z:"2011",c:"Haarlem",r:"Hollande-Septentrionale"},
  ],

  /* ── Royaume-Uni ── */
  GB:[
    {z:"EC1A",c:"London (City)",r:"England"},
    {z:"E1",c:"London (East End)",r:"England"},
    {z:"E14",c:"London (Canary Wharf)",r:"England"},
    {z:"N1",c:"London (Islington)",r:"England"},
    {z:"NW1",c:"London (Camden)",r:"England"},
    {z:"SE1",c:"London (Southwark)",r:"England"},
    {z:"SW1A",c:"London (Westminster)",r:"England"},
    {z:"SW3",c:"London (Chelsea)",r:"England"},
    {z:"W1A",c:"London (West End)",r:"England"},
    {z:"W1D",c:"London (Soho)",r:"England"},
    {z:"WC1",c:"London (Bloomsbury)",r:"England"},
    {z:"WC2",c:"London (Covent Garden)",r:"England"},
    {z:"M1",c:"Manchester",r:"England"},
    {z:"M60",c:"Manchester (City Centre)",r:"England"},
    {z:"B1",c:"Birmingham",r:"England"},
    {z:"B2",c:"Birmingham (City Centre)",r:"England"},
    {z:"LS1",c:"Leeds",r:"England"},
    {z:"L1",c:"Liverpool",r:"England"},
    {z:"S1",c:"Sheffield",r:"England"},
    {z:"BS1",c:"Bristol",r:"England"},
    {z:"NE1",c:"Newcastle upon Tyne",r:"England"},
    {z:"NG1",c:"Nottingham",r:"England"},
    {z:"OX1",c:"Oxford",r:"England"},
    {z:"CB1",c:"Cambridge",r:"England"},
    {z:"G1",c:"Glasgow",r:"Scotland"},
    {z:"G2",c:"Glasgow (City Centre)",r:"Scotland"},
    {z:"EH1",c:"Edinburgh",r:"Scotland"},
    {z:"CF10",c:"Cardiff",r:"Wales"},
    {z:"BT1",c:"Belfast",r:"Northern Ireland"},
  ],

  /* ── Portugal ── */
  PT:[
    {z:"1000",c:"Lisboa (Centro)",r:"Grande Lisboa"},
    {z:"1100",c:"Lisboa (Alfama)",r:"Grande Lisboa"},
    {z:"1150",c:"Lisboa (Mouraria)",r:"Grande Lisboa"},
    {z:"1200",c:"Lisboa (Chiado)",r:"Grande Lisboa"},
    {z:"1250",c:"Lisboa (Príncipe Real)",r:"Grande Lisboa"},
    {z:"1300",c:"Lisboa (Belém)",r:"Grande Lisboa"},
    {z:"1600",c:"Lisboa (Benfica)",r:"Grande Lisboa"},
    {z:"2750",c:"Cascais",r:"Grande Lisboa"},
    {z:"2710",c:"Sintra",r:"Grande Lisboa"},
    {z:"4000",c:"Porto (Centro)",r:"Grande Porto"},
    {z:"4050",c:"Porto (Bonfim)",r:"Grande Porto"},
    {z:"4100",c:"Porto (Foz do Douro)",r:"Grande Porto"},
    {z:"4200",c:"Porto (Campanhã)",r:"Grande Porto"},
    {z:"4430",c:"Vila Nova de Gaia",r:"Grande Porto"},
    {z:"3000",c:"Coimbra",r:"Centro"},
    {z:"4700",c:"Braga",r:"Minho"},
    {z:"3800",c:"Aveiro",r:"Centro"},
    {z:"2900",c:"Setúbal",r:"Alentejo"},
    {z:"8000",c:"Faro",r:"Algarve"},
    {z:"8500",c:"Portimão",r:"Algarve"},
    {z:"9000",c:"Funchal",r:"Madère"},
    {z:"9500",c:"Ponta Delgada",r:"Açores"},
  ],

  /* ── Suisse ── */
  CH:[
    {z:"8001",c:"Zürich (Altstadt)",r:"Zurich"},
    {z:"8002",c:"Zürich (Enge)",r:"Zurich"},
    {z:"8004",c:"Zürich (Aussersihl)",r:"Zurich"},
    {z:"8005",c:"Zürich (Zürich West)",r:"Zurich"},
    {z:"8008",c:"Zürich (Seefeld)",r:"Zurich"},
    {z:"4001",c:"Basel",r:"Bâle-Ville"},
    {z:"4051",c:"Basel (Grossbasel)",r:"Bâle-Ville"},
    {z:"3001",c:"Bern",r:"Berne"},
    {z:"3011",c:"Bern (Matte)",r:"Berne"},
    {z:"1201",c:"Genève",r:"Genève"},
    {z:"1204",c:"Genève (Vieille-Ville)",r:"Genève"},
    {z:"1003",c:"Lausanne",r:"Vaud"},
    {z:"1005",c:"Lausanne (Pontaise)",r:"Vaud"},
    {z:"1800",c:"Vevey",r:"Vaud"},
    {z:"1820",c:"Montreux",r:"Vaud"},
    {z:"6004",c:"Luzern",r:"Lucerne"},
    {z:"9000",c:"St. Gallen",r:"Saint-Gall"},
    {z:"6900",c:"Lugano",r:"Tessin"},
    {z:"7000",c:"Chur",r:"Grisons"},
    {z:"1950",c:"Sion",r:"Valais"},
    {z:"2000",c:"Neuchâtel",r:"Neuchâtel"},
    {z:"2500",c:"Biel/Bienne",r:"Berne"},
    {z:"3600",c:"Thun",r:"Berne"},
  ],

  /* ── Turquie ── */
  TR:[
    {z:"34000",c:"İstanbul (Fatih)",r:"İstanbul"},
    {z:"34100",c:"İstanbul (Bağcılar)",r:"İstanbul"},
    {z:"34330",c:"İstanbul (Beşiktaş)",r:"İstanbul"},
    {z:"34394",c:"İstanbul (Şişli)",r:"İstanbul"},
    {z:"34420",c:"İstanbul (Beyoğlu)",r:"İstanbul"},
    {z:"34732",c:"İstanbul (Kadıköy)",r:"İstanbul"},
    {z:"06100",c:"Ankara (Altındağ)",r:"Ankara"},
    {z:"06420",c:"Ankara (Çankaya)",r:"Ankara"},
    {z:"06500",c:"Ankara (Yenimahalle)",r:"Ankara"},
    {z:"35000",c:"İzmir (Konak)",r:"İzmir"},
    {z:"35210",c:"İzmir (Bornova)",r:"İzmir"},
    {z:"16000",c:"Bursa (Osmangazi)",r:"Bursa"},
    {z:"01000",c:"Adana",r:"Adana"},
    {z:"38000",c:"Kayseri",r:"Kayseri"},
    {z:"07000",c:"Antalya",r:"Antalya"},
    {z:"42000",c:"Konya",r:"Konya"},
    {z:"27000",c:"Gaziantep",r:"Gaziantep"},
  ],

  /* ── États-Unis ── */
  US:[
    {z:"10001",c:"New York (Midtown Manhattan)",r:"New York"},
    {z:"10002",c:"New York (Lower East Side)",r:"New York"},
    {z:"10014",c:"New York (Greenwich Village)",r:"New York"},
    {z:"10036",c:"New York (Times Square)",r:"New York"},
    {z:"11201",c:"Brooklyn",r:"New York"},
    {z:"11101",c:"Queens",r:"New York"},
    {z:"10451",c:"Bronx",r:"New York"},
    {z:"90001",c:"Los Angeles",r:"Californie"},
    {z:"90210",c:"Beverly Hills",r:"Californie"},
    {z:"94102",c:"San Francisco",r:"Californie"},
    {z:"95101",c:"San Jose",r:"Californie"},
    {z:"92101",c:"San Diego",r:"Californie"},
    {z:"60601",c:"Chicago",r:"Illinois"},
    {z:"77001",c:"Houston",r:"Texas"},
    {z:"75201",c:"Dallas",r:"Texas"},
    {z:"78201",c:"San Antonio",r:"Texas"},
    {z:"78701",c:"Austin",r:"Texas"},
    {z:"85001",c:"Phoenix",r:"Arizona"},
    {z:"19101",c:"Philadelphia",r:"Pennsylvanie"},
    {z:"32201",c:"Jacksonville",r:"Floride"},
    {z:"32801",c:"Orlando",r:"Floride"},
    {z:"33101",c:"Miami",r:"Floride"},
    {z:"30301",c:"Atlanta",r:"Géorgie"},
    {z:"98101",c:"Seattle",r:"Washington"},
    {z:"02101",c:"Boston",r:"Massachusetts"},
    {z:"80201",c:"Denver",r:"Colorado"},
    {z:"89101",c:"Las Vegas",r:"Nevada"},
  ],

  /* ── Canada ── */
  CA:[
    {z:"H2Y",c:"Montréal (Vieux-Montréal)",r:"Québec"},
    {z:"H3A",c:"Montréal (McGill)",r:"Québec"},
    {z:"H3B",c:"Montréal (Centre-Ville)",r:"Québec"},
    {z:"H3G",c:"Montréal (Westmount)",r:"Québec"},
    {z:"G1R",c:"Québec (Vieux-Québec)",r:"Québec"},
    {z:"K1A",c:"Ottawa",r:"Ontario"},
    {z:"K1P",c:"Ottawa (Centre-Ville)",r:"Ontario"},
    {z:"M5A",c:"Toronto (Distillery)",r:"Ontario"},
    {z:"M5G",c:"Toronto (Bay Street)",r:"Ontario"},
    {z:"M5V",c:"Toronto (Entertainment)",r:"Ontario"},
    {z:"V5K",c:"Vancouver",r:"Colombie-Britannique"},
    {z:"V6B",c:"Vancouver (Downtown)",r:"Colombie-Britannique"},
    {z:"T2P",c:"Calgary (Downtown)",r:"Alberta"},
    {z:"T5J",c:"Edmonton (Downtown)",r:"Alberta"},
  ],

  /* ── Australie ── */
  AU:[
    {z:"2000",c:"Sydney (CBD)",r:"Nouvelle-Galles du Sud"},
    {z:"2010",c:"Sydney (Surry Hills)",r:"Nouvelle-Galles du Sud"},
    {z:"2060",c:"Sydney (North Sydney)",r:"Nouvelle-Galles du Sud"},
    {z:"3000",c:"Melbourne (CBD)",r:"Victoria"},
    {z:"3004",c:"Melbourne (South Yarra)",r:"Victoria"},
    {z:"3008",c:"Melbourne (Docklands)",r:"Victoria"},
    {z:"4000",c:"Brisbane (CBD)",r:"Queensland"},
    {z:"4101",c:"Brisbane (South Brisbane)",r:"Queensland"},
    {z:"6000",c:"Perth (CBD)",r:"Australie-Occidentale"},
    {z:"5000",c:"Adelaide (CBD)",r:"Australie-Méridionale"},
    {z:"2600",c:"Canberra (City)",r:"Territoire de la capitale"},
    {z:"7000",c:"Hobart",r:"Tasmanie"},
  ],

  /* ── Chine ── */
  CN:[
    {z:"100000",c:"Beijing (Centre)",r:"Beijing"},
    {z:"100020",c:"Beijing (Chaoyang)",r:"Beijing"},
    {z:"200000",c:"Shanghai (Centre)",r:"Shanghai"},
    {z:"200120",c:"Shanghai (Pudong)",r:"Shanghai"},
    {z:"510000",c:"Guangzhou",r:"Guangdong"},
    {z:"518000",c:"Shenzhen",r:"Guangdong"},
    {z:"310000",c:"Hangzhou",r:"Zhejiang"},
    {z:"210000",c:"Nanjing",r:"Jiangsu"},
    {z:"430000",c:"Wuhan",r:"Hubei"},
    {z:"610000",c:"Chengdu",r:"Sichuan"},
  ],

  /* ── Japon ── */
  JP:[
    {z:"100-0001",c:"Tokyo (Chiyoda)",r:"Tokyo"},
    {z:"100-0005",c:"Tokyo (Marunouchi)",r:"Tokyo"},
    {z:"150-0001",c:"Tokyo (Shibuya)",r:"Tokyo"},
    {z:"160-0022",c:"Tokyo (Shinjuku)",r:"Tokyo"},
    {z:"106-0031",c:"Tokyo (Roppongi)",r:"Tokyo"},
    {z:"530-0001",c:"Osaka",r:"Osaka"},
    {z:"600-8001",c:"Kyoto",r:"Kyoto"},
    {z:"460-0001",c:"Nagoya",r:"Aichi"},
    {z:"220-0011",c:"Yokohama",r:"Kanagawa"},
    {z:"812-0011",c:"Fukuoka",r:"Fukuoka"},
  ],

  /* ── Tunisie ── */
  TN:[
    {z:"1000",c:"Tunis (Centre)",r:"Tunis"},
    {z:"1002",c:"Tunis (Bab Bnet)",r:"Tunis"},
    {z:"1004",c:"Tunis (El Menzah)",r:"Tunis"},
    {z:"2000",c:"Le Bardo",r:"Tunis"},
    {z:"2010",c:"Manouba",r:"Manouba"},
    {z:"2080",c:"Ariana",r:"Ariana"},
    {z:"3000",c:"Sfax",r:"Sfax"},
    {z:"4000",c:"Sousse",r:"Sousse"},
    {z:"5000",c:"Monastir",r:"Monastir"},
    {z:"6000",c:"Gabès",r:"Gabès"},
    {z:"7000",c:"Bizerte",r:"Bizerte"},
    {z:"8000",c:"Nabeul",r:"Nabeul"},
    {z:"9000",c:"Tataouine",r:"Tataouine"},
  ],

  /* ── Algérie ── */
  DZ:[
    {z:"16000",c:"Alger (Centre)",r:"Alger"},
    {z:"16001",c:"Alger (Bab El Oued)",r:"Alger"},
    {z:"16200",c:"Alger (Kouba)",r:"Alger"},
    {z:"31000",c:"Oran",r:"Oran"},
    {z:"25000",c:"Constantine",r:"Constantine"},
    {z:"09000",c:"Blida",r:"Blida"},
    {z:"13000",c:"Tlemcen",r:"Tlemcen"},
    {z:"06000",c:"Béjaïa",r:"Béjaïa"},
    {z:"15000",c:"Tizi Ouzou",r:"Tizi Ouzou"},
    {z:"19000",c:"Sétif",r:"Sétif"},
    {z:"07000",c:"Biskra",r:"Biskra"},
    {z:"30000",c:"Ouargla",r:"Ouargla"},
  ],
};

/* Index ZIP → ville pour les pays internationaux */
const INTL_ZIP_IDX = {};
Object.entries(INTL_CITIES).forEach(([cc, list]) => {
  INTL_ZIP_IDX[cc] = {};
  list.forEach(e => { INTL_ZIP_IDX[cc][e.z] = e; });
});

/* ══════════════════════════════════════════════════════════════
   4. PAYS SANS CODES POSTAUX (lookup désactivé)
   ══════════════════════════════════════════════════════════════ */
const NO_POSTAL_COUNTRIES = new Set([
  'AE','AG','AO','AW','BB','BI','BJ','BO','BS','BW','BZ','CF','CG','CI',
  'CM','CO','CU','DJ','DM','ER','FJ','GD','GH','GM','GN','GQ','GW','GY',
  'HK','HT','IE','JM','KE','KI','KM','KN','LC','LR','LS','LY','MH','ML',
  'MR','MU','MW','MZ','NA','NG','NR','PG','PW','QA','RW','SB','SC','SL',
  'SO','SR','SS','ST','SY','TD','TG','TK','TL','TO','TV','TZ','UG','VC',
  'VU','WS','YE','ZM','ZW','ZR','RY'
]);

/* ══════════════════════════════════════════════════════════════
   4. DEBOUNCE & TIMERS
   ══════════════════════════════════════════════════════════════ */
const _pcTimers = {};
function _pcDebounce(key, fn, delay) {
  clearTimeout(_pcTimers[key]);
  _pcTimers[key] = setTimeout(fn, delay);
}

/* ══════════════════════════════════════════════════════════════
   5. PEUPLER LES SÉLECTEURS DE PAYS
   ══════════════════════════════════════════════════════════════ */
function pcPopulateCountrySelects() {
  const configs = [
    { id: 'shp-from-country', default: 'MA' },
    { id: 'shp-to-country',   default: 'FR' },
  ];
  configs.forEach(({ id, default: def }) => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const sorted = [...COUNTRIES_ALL].sort((a, b) => a.n.localeCompare(b.n, 'fr'));
    sel.innerHTML = '';
    sorted.forEach(co => {
      const opt = document.createElement('option');
      opt.value = co.c;
      opt.textContent = co.f + ' ' + co.n;
      if (co.c === def) opt.selected = true;
      sel.appendChild(opt);
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   6. AUTOCOMPLETE DROPDOWN UI
   ══════════════════════════════════════════════════════════════ */
function _pcShowDrop(inputEl, items, onSelect) {
  _pcHideAllDrops();
  if (!items.length) return;

  const wrap = inputEl.closest('.shp-ac-wrap');
  if (!wrap) return;

  const drop = document.createElement('div');
  drop.className = 'pc-drop';

  items.slice(0, 8).forEach(item => {
    const div = document.createElement('div');
    div.className = 'pc-drop-item';
    div.innerHTML = `<span class="pc-drop-city">${item.label}</span><span class="pc-drop-zip">${item.zip}</span><span class="pc-drop-region">${item.region || ''}</span>`;
    div.addEventListener('mousedown', e => {
      e.preventDefault();
      onSelect(item);
      _pcHideAllDrops();
    });
    drop.appendChild(div);
  });

  wrap.appendChild(drop);
}

function _pcHideAllDrops() {
  document.querySelectorAll('.pc-drop').forEach(d => d.remove());
}

function _pcSetStatus(statusId, state) {
  const el = document.getElementById(statusId);
  if (!el) return;
  el.className = 'pc-zip-status pc-status-' + state;
  el.title = state === 'ok' ? 'Ville trouvée ✓' : state === 'loading' ? 'Recherche...' : state === 'error' ? 'Code postal introuvable' : '';
}

/* ══════════════════════════════════════════════════════════════
   7. LOOKUP CODE POSTAL → VILLE
   ══════════════════════════════════════════════════════════════ */
async function pcLookupZip(zipVal, countryCode, cityInputId, statusId) {
  const zip = zipVal.trim().toUpperCase();
  if (zip.length < 3) { _pcSetStatus(statusId, 'idle'); return; }
  _pcSetStatus(statusId, 'loading');

  /* ── Maroc : base locale ── */
  if (countryCode === 'MA') {
    const entry = MA_ZIP_IDX[zip] || MA_ZIP_IDX[zip.padStart(5, '0')];
    if (entry) {
      const cityEl = document.getElementById(cityInputId);
      if (cityEl && !cityEl.value) cityEl.value = entry.c;
      _pcSetStatus(statusId, 'ok');
      if (typeof shpUpdateSummary === 'function') shpUpdateSummary();
    } else {
      /* recherche partielle */
      const partial = MA_PC.filter(e => e.z.startsWith(zip));
      if (partial.length) {
        const cityEl = document.getElementById(cityInputId);
        if (cityEl && !cityEl.value) cityEl.value = partial[0].c;
        _pcSetStatus(statusId, 'ok');
        if (typeof shpUpdateSummary === 'function') shpUpdateSummary();
      } else {
        _pcSetStatus(statusId, 'error');
      }
    }
    return;
  }

  /* ── Pays sans codes postaux ── */
  if (NO_POSTAL_COUNTRIES.has(countryCode)) {
    _pcSetStatus(statusId, 'idle'); return;
  }

  /* ── Base internationale embarquée (lookup instantané) ── */
  const intlIdx = INTL_ZIP_IDX[countryCode];
  if (intlIdx) {
    // Cherche correspondance exacte puis partielle
    const entry = intlIdx[zip] || intlIdx[zip.replace(/\s/g,'')] ||
      Object.values(intlIdx).find(e => e.z.toUpperCase().startsWith(zip));
    if (entry) {
      const cityEl = document.getElementById(cityInputId);
      if (cityEl && !cityEl.value) cityEl.value = entry.c;
      _pcSetStatus(statusId, 'ok');
      if (typeof shpUpdateSummary === 'function') shpUpdateSummary();
      return;
    }
  }

  /* ── Fallback : Zippopotam.us API ── */
  try {
    const cc = countryCode.toLowerCase();
    const resp = await fetch(`https://api.zippopotam.us/${cc}/${encodeURIComponent(zip)}`);
    if (!resp.ok) throw new Error('not found');
    const data = await resp.json();
    if (data.places && data.places.length) {
      const place = data.places[0];
      const cityEl = document.getElementById(cityInputId);
      if (cityEl && !cityEl.value) cityEl.value = place['place name'];
      _pcSetStatus(statusId, 'ok');
      if (typeof shpUpdateSummary === 'function') shpUpdateSummary();
    } else {
      _pcSetStatus(statusId, 'error');
    }
  } catch {
    _pcSetStatus(statusId, 'error');
  }
}

/* ══════════════════════════════════════════════════════════════
   8. AUTOCOMPLETE VILLE → CODE POSTAL (Maroc + pays embarqués)
   ══════════════════════════════════════════════════════════════ */
function pcCityAutocomplete(cityInputEl, zipInputId, countryCode) {
  const query = cityInputEl.value.trim().toLowerCase();
  if (query.length < 2) { _pcHideAllDrops(); return; }

  let source = [];

  if (countryCode === 'MA') {
    source = MA_PC.filter(e =>
      e.c.toLowerCase().includes(query) || e.z.startsWith(query)
    );
  } else if (INTL_CITIES[countryCode]) {
    source = INTL_CITIES[countryCode].filter(e =>
      e.c.toLowerCase().includes(query) || e.z.toLowerCase().startsWith(query)
    );
  }

  if (!source.length) { _pcHideAllDrops(); return; }

  _pcShowDrop(cityInputEl, source.map(e => ({
    label: e.c, zip: e.z, region: e.r
  })), item => {
    cityInputEl.value = item.label;
    const zipEl = document.getElementById(zipInputId);
    if (zipEl) zipEl.value = item.zip;
    if (typeof shpUpdateSummary === 'function') shpUpdateSummary();
  });
}

/* ══════════════════════════════════════════════════════════════
   9. GESTIONNAIRES D'ÉVÉNEMENTS (appelés depuis le HTML)
   ══════════════════════════════════════════════════════════════ */
function pcZipInput(prefix) {
  const zipEl   = document.getElementById(`shp-${prefix}-zip`);
  const cityId  = `shp-${prefix}-city`;
  const statId  = `shp-${prefix}-zip-status`;
  const country = (document.getElementById(`shp-${prefix}-country`) || {}).value || 'MA';
  if (!zipEl) return;
  _pcDebounce(`zip-${prefix}`, () => {
    pcLookupZip(zipEl.value, country, cityId, statId);
  }, 450);
}

function pcCityInput(prefix) {
  const cityEl  = document.getElementById(`shp-${prefix}-city`);
  const zipId   = `shp-${prefix}-zip`;
  const country = (document.getElementById(`shp-${prefix}-country`) || {}).value || 'MA';
  if (!cityEl) return;
  _pcDebounce(`city-${prefix}`, () => {
    pcCityAutocomplete(cityEl, zipId, country);
  }, 300);
}

/* Fermer les dropdowns au clic extérieur */
document.addEventListener('click', e => {
  if (!e.target.closest('.shp-ac-wrap')) _pcHideAllDrops();
});

/* ══════════════════════════════════════════════════════════════
   10. INITIALISATION
   ══════════════════════════════════════════════════════════════ */
function initPostalLookup() {
  pcPopulateCountrySelects();
}

/* Lance automatiquement quand le DOM est prêt */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPostalLookup);
} else {
  initPostalLookup();
}
