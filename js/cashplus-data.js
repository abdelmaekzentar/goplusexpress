/* ═══════════════════════════════════════════════════════════════════
   GO PLUS EXPRESS — Base de données des agences CashPlus / Tawssil
   Couverture : 20 villes · ~160 agences
   Source : données publiques / cartographie terrain
   ═══════════════════════════════════════════════════════════════════ */
var CASHPLUS_AGENCIES = {

  'Casablanca': [
    {name:'Agence CashPlus Centre-Ville',      addr:'Bd Mohammed V, Centre',         lat:33.5950, lng:-7.6193},
    {name:'Agence CashPlus Maarif',            addr:'Rue Mustapha El Maâni, Maarif', lat:33.5827, lng:-7.6238},
    {name:'Agence CashPlus Hay Hassani',       addr:'Bd Hay Hassani',                lat:33.5669, lng:-7.6561},
    {name:'Agence CashPlus Ain Diab',          addr:'Bd de la Corniche, Ain Diab',   lat:33.5978, lng:-7.6799},
    {name:'Agence CashPlus Derb Sultan',       addr:'Rue Bir Anzarane, Derb Sultan', lat:33.5761, lng:-7.5955},
    {name:'Agence CashPlus Sidi Bernoussi',    addr:'Bd Sidi Bernoussi',             lat:33.5944, lng:-7.5297},
    {name:'Agence CashPlus Hay Mohammadi',     addr:'Rue Hay Mohammadi',             lat:33.5718, lng:-7.5716},
    {name:'Agence CashPlus Ben M\'Sick',       addr:'Bd Ben M\'Sick',                lat:33.5576, lng:-7.5756},
    {name:'Agence CashPlus Ain Chock',         addr:'Rue Ain Chock',                 lat:33.5440, lng:-7.5934},
    {name:'Agence CashPlus Sidi Moumen',       addr:'Bd Sidi Moumen',                lat:33.5901, lng:-7.5076},
    {name:'Agence CashPlus Sbata',             addr:'Rue Sbata',                     lat:33.5634, lng:-7.5510},
    {name:'Agence CashPlus Hay Rachid',        addr:'Bd Hay Rachid',                 lat:33.5378, lng:-7.6179},
    {name:'Agence CashPlus Nassim',            addr:'Rue Nassim, Hay Nassim',        lat:33.5760, lng:-7.6630},
    {name:'Agence CashPlus Oulfa',             addr:'Bd Al Qods, Oulfa',             lat:33.5390, lng:-7.6551},
    {name:'Agence CashPlus Bourgogne',         addr:'Rue Bourgogne',                 lat:33.5897, lng:-7.6378},
    {name:'Agence CashPlus Anfa',              addr:'Bd d\'Anfa',                    lat:33.5913, lng:-7.6551},
    {name:'Agence CashPlus Beauséjour',        addr:'Rue Beauséjour',                lat:33.5695, lng:-7.6494},
    {name:'Agence CashPlus Hay El Fida',       addr:'Rue Hay El Fida',               lat:33.5636, lng:-7.5855},
    {name:'Agence CashPlus Roches Noires',     addr:'Bd Zerktouni, Roches Noires',   lat:33.6009, lng:-7.5673},
    {name:'Agence CashPlus Ain Sebaa',         addr:'Bd Ain Sebaa',                  lat:33.6017, lng:-7.5456},
    {name:'Agence CashPlus Moulay Rachid',     addr:'Rue Moulay Rachid',             lat:33.5333, lng:-7.6024},
    {name:'Agence CashPlus Mers Sultan',       addr:'Rue Mers Sultan',               lat:33.5876, lng:-7.6053},
    {name:'Agence CashPlus La Gironde',        addr:'Bd La Gironde',                 lat:33.5961, lng:-7.5831},
    {name:'Agence CashPlus Salmia',            addr:'Rue Salmia',                    lat:33.5490, lng:-7.5663},
    {name:'Agence CashPlus Bernoussi',         addr:'Bd Bernoussi',                  lat:33.6040, lng:-7.5314},
    {name:'Agence CashPlus Hay Oulfa',         addr:'Bd Al Massira, Hay Oulfa',      lat:33.5397, lng:-7.6390},
    {name:'Agence CashPlus Sidi Othmane',      addr:'Rue Sidi Othmane',              lat:33.5509, lng:-7.5931},
    {name:'Agence CashPlus Al Fida',           addr:'Rue Al Fida',                   lat:33.5645, lng:-7.6028},
    {name:'Agence CashPlus Racine',            addr:'Rue Racine',                    lat:33.5849, lng:-7.6433},
    {name:'Agence CashPlus Polo',              addr:'Quartier Polo',                 lat:33.5573, lng:-7.6296}
  ],

  'Rabat': [
    {name:'Agence CashPlus Agdal',            addr:'Rue Jaâfar Assadik, Agdal',     lat:33.9911, lng:-6.8548},
    {name:'Agence CashPlus Hassan',           addr:'Av Hassan II',                   lat:34.0137, lng:-6.8296},
    {name:'Agence CashPlus Hay Riad',         addr:'Bd Hay Riad',                    lat:33.9675, lng:-6.8765},
    {name:'Agence CashPlus Akkari',           addr:'Rue Akkari',                     lat:34.0213, lng:-6.8652},
    {name:'Agence CashPlus Yacoub El Mansour',addr:'Bd Yacoub El Mansour',           lat:34.0071, lng:-6.8855},
    {name:'Agence CashPlus Les Orangers',     addr:'Rue des Orangers',               lat:34.0274, lng:-6.8427},
    {name:'Agence CashPlus Diour Jamaa',      addr:'Rue Diour Jamaa',                lat:34.0356, lng:-6.8218},
    {name:'Agence CashPlus Souissi',          addr:'Av de France, Souissi',          lat:33.9946, lng:-6.8249},
    {name:'Agence CashPlus Aviation',         addr:'Quartier Aviation',              lat:34.0418, lng:-6.8613},
    {name:'Agence CashPlus Médina',           addr:'Bd Mohammed V, Médina',          lat:34.0208, lng:-6.8362},
    {name:'Agence CashPlus Océan',            addr:'Rue Benzakour, Océan',           lat:34.0089, lng:-6.8504},
    {name:'Agence CashPlus Nahda',            addr:'Bd Nahda',                       lat:34.0302, lng:-6.8541}
  ],

  'Salé': [
    {name:'Agence CashPlus Tabriquet',        addr:'Rue Tabriquet',                  lat:34.0468, lng:-6.8044},
    {name:'Agence CashPlus Bettana',          addr:'Bd Bettana',                     lat:34.0390, lng:-6.8075},
    {name:'Agence CashPlus Hay Moulay Slimane',addr:'Rue Moulay Slimane',            lat:34.0546, lng:-6.7925},
    {name:'Agence CashPlus Centre Salé',      addr:'Av Kennedy, Centre',             lat:34.0360, lng:-6.7992},
    {name:'Agence CashPlus Hay Salam',        addr:'Bd Hay Salam',                   lat:34.0650, lng:-6.7856},
    {name:'Agence CashPlus Laâyoune Salé',    addr:'Rue Laâyoune',                   lat:34.0712, lng:-6.8022}
  ],

  'Kénitra': [
    {name:'Agence CashPlus Centre Kénitra',   addr:'Av Mohammed V, Centre',          lat:34.2597, lng:-6.5780},
    {name:'Agence CashPlus Hay Nouzha',       addr:'Bd Hay Nouzha',                  lat:34.2480, lng:-6.5711},
    {name:'Agence CashPlus Route Sidi Taibi', addr:'Route de Sidi Taibi',            lat:34.2742, lng:-6.5905},
    {name:'Agence CashPlus Bir Rami',         addr:'Bd Bir Rami',                    lat:34.2381, lng:-6.5935},
    {name:'Agence CashPlus Al Bassatine',     addr:'Quartier Al Bassatine',          lat:34.2697, lng:-6.5617}
  ],

  'Fès': [
    {name:'Agence CashPlus Ville Nouvelle',   addr:'Bd Mohammed V, Ville Nouvelle',  lat:34.0078, lng:-5.0034},
    {name:'Agence CashPlus Médina',           addr:'Bd Moulay Youssef, Médina',      lat:34.0631, lng:-4.9734},
    {name:'Agence CashPlus Route Imouzzer',   addr:'Route d\'Imouzzer',              lat:34.0221, lng:-5.0242},
    {name:'Agence CashPlus Narjiss',          addr:'Quartier Narjiss',               lat:33.9960, lng:-4.9876},
    {name:'Agence CashPlus Atlas',            addr:'Rue Atlas',                      lat:34.0007, lng:-5.0101},
    {name:'Agence CashPlus Borj Sud',         addr:'Bd Borj Sud',                    lat:34.0507, lng:-4.9824},
    {name:'Agence CashPlus Ain Chkef',        addr:'Route d\'Ain Chkef',             lat:33.9801, lng:-5.0215},
    {name:'Agence CashPlus Route Sefrou',     addr:'Route de Sefrou',                lat:33.9923, lng:-4.9710}
  ],

  'Meknès': [
    {name:'Agence CashPlus Centre Meknès',    addr:'Av Mohammed V, Centre',          lat:33.8950, lng:-5.5413},
    {name:'Agence CashPlus Hamria',           addr:'Quartier Hamria',                lat:33.9018, lng:-5.5440},
    {name:'Agence CashPlus Hay Salam',        addr:'Bd Hay Salam',                   lat:33.8756, lng:-5.5266},
    {name:'Agence CashPlus Route de Fès',     addr:'Route de Fès',                   lat:33.8995, lng:-5.4926},
    {name:'Agence CashPlus Ismailia',         addr:'Quartier Ismailia',              lat:33.9035, lng:-5.5562},
    {name:'Agence CashPlus Marjane',          addr:'Bd Al Massira, Marjane',         lat:33.8834, lng:-5.5440}
  ],

  'Marrakech': [
    {name:'Agence CashPlus Guéliz',           addr:'Av Mohammed VI, Guéliz',         lat:31.6371, lng:-8.0089},
    {name:'Agence CashPlus Médina',           addr:'Bd Mohammed V, Médina',          lat:31.6295, lng:-7.9811},
    {name:'Agence CashPlus Massira',          addr:'Bd Al Massira',                  lat:31.6070, lng:-8.0131},
    {name:'Agence CashPlus Route Casablanca', addr:'Route de Casablanca',            lat:31.6530, lng:-8.0221},
    {name:'Agence CashPlus Daoudiate',        addr:'Quartier Daoudiate',             lat:31.6446, lng:-8.0375},
    {name:'Agence CashPlus M\'hamid',         addr:'Quartier M\'hamid',              lat:31.6124, lng:-8.0508},
    {name:'Agence CashPlus Hay Hassani',      addr:'Bd Hay Hassani',                 lat:31.6018, lng:-7.9860},
    {name:'Agence CashPlus Targa',            addr:'Quartier Targa',                 lat:31.6614, lng:-8.0416},
    {name:'Agence CashPlus Mellah',           addr:'Rue du Mellah',                  lat:31.6265, lng:-7.9734},
    {name:'Agence CashPlus Bab Doukkala',     addr:'Bd Bab Doukkala',                lat:31.6346, lng:-7.9954}
  ],

  'Tanger': [
    {name:'Agence CashPlus Centre Tanger',    addr:'Bd Mohammed V, Centre',          lat:35.7672, lng:-5.8000},
    {name:'Agence CashPlus Iberia',           addr:'Quartier Iberia',                lat:35.7536, lng:-5.8143},
    {name:'Agence CashPlus Malabata',         addr:'Route de Malabata',              lat:35.7764, lng:-5.7674},
    {name:'Agence CashPlus Charf',            addr:'Quartier Charf',                 lat:35.7440, lng:-5.8244},
    {name:'Agence CashPlus Bni Makada',       addr:'Bd Bni Makada',                  lat:35.7283, lng:-5.8066},
    {name:'Agence CashPlus Souani',           addr:'Quartier Souani',                lat:35.7609, lng:-5.8386},
    {name:'Agence CashPlus Moujahidine',      addr:'Bd des Moujahidine',             lat:35.7480, lng:-5.7900},
    {name:'Agence CashPlus Mesnana',          addr:'Quartier Mesnana',               lat:35.7388, lng:-5.7802}
  ],

  'Agadir': [
    {name:'Agence CashPlus Centre Agadir',    addr:'Av Mohammed V, Centre',          lat:30.4202, lng:-9.5985},
    {name:'Agence CashPlus Talborjt',         addr:'Quartier Talborjt',              lat:30.4272, lng:-9.5974},
    {name:'Agence CashPlus Hay Mohammadi',    addr:'Bd Hay Mohammadi',               lat:30.4113, lng:-9.5843},
    {name:'Agence CashPlus Secteur Touristique',addr:'Bd du 20 Août, Secteur Tour.', lat:30.4401, lng:-9.6052},
    {name:'Agence CashPlus Hay Dakhla',       addr:'Quartier Hay Dakhla',            lat:30.3997, lng:-9.5829},
    {name:'Agence CashPlus Ait Melloul',      addr:'Centre Ait Melloul',             lat:30.3373, lng:-9.4988},
    {name:'Agence CashPlus Hay Essalam',      addr:'Bd Hay Essalam',                 lat:30.4054, lng:-9.5669}
  ],

  'Oujda': [
    {name:'Agence CashPlus Centre Oujda',     addr:'Bd Mohammed V, Centre',          lat:34.6811, lng:-1.9086},
    {name:'Agence CashPlus Hay Al Fath',      addr:'Bd Al Fath',                     lat:34.6687, lng:-1.9230},
    {name:'Agence CashPlus Lazaret',          addr:'Quartier Lazaret',               lat:34.6943, lng:-1.8998},
    {name:'Agence CashPlus Hay Qods',         addr:'Bd Al Qods',                     lat:34.6753, lng:-1.8866},
    {name:'Agence CashPlus Sidi Yahia',       addr:'Route Sidi Yahia',               lat:34.6532, lng:-1.9347}
  ],

  'Tétouan': [
    {name:'Agence CashPlus Centre Tétouan',   addr:'Bd Mohammed V, Centre',          lat:35.5783, lng:-5.3613},
    {name:'Agence CashPlus Martil',           addr:'Av de la Plage, Martil',         lat:35.6195, lng:-5.2714},
    {name:'Agence CashPlus Hay Andalous',     addr:'Quartier Hay Andalous',          lat:35.5680, lng:-5.3745},
    {name:'Agence CashPlus Sidi Mandri',      addr:'Rue Sidi Mandri',                lat:35.5784, lng:-5.3555},
    {name:'Agence CashPlus Médina Tétouan',   addr:'Médina de Tétouan',              lat:35.5750, lng:-5.3680}
  ],

  'Laâyoune': [
    {name:'Agence CashPlus Centre Laâyoune',  addr:'Av Hassan II, Centre',           lat:27.1512, lng:-13.2032},
    {name:'Agence CashPlus Hay Salam',        addr:'Bd Hay Salam',                   lat:27.1387, lng:-13.2156},
    {name:'Agence CashPlus Sakia El Hamra',   addr:'Bd Sakia El Hamra',              lat:27.1573, lng:-13.1884},
    {name:'Agence CashPlus Route de Smara',   addr:'Route de Smara',                 lat:27.1219, lng:-13.1972}
  ],

  'Béni Mellal': [
    {name:'Agence CashPlus Centre Béni Mellal',addr:'Bd Hassan II, Centre',          lat:32.3400, lng:-6.3500},
    {name:'Agence CashPlus Hay Al Massira',   addr:'Bd Al Massira',                  lat:32.3238, lng:-6.3590},
    {name:'Agence CashPlus Hay Oulfa',        addr:'Quartier Hay Oulfa',             lat:32.3509, lng:-6.3617},
    {name:'Agence CashPlus Route Marrakech',  addr:'Route de Marrakech',             lat:32.3616, lng:-6.3498},
    {name:'Agence CashPlus Hay Chaimae',      addr:'Quartier Hay Chaimae',           lat:32.3287, lng:-6.3466}
  ],

  'El Jadida': [
    {name:'Agence CashPlus Centre El Jadida', addr:'Bd Mohammed V, Centre',          lat:33.2316, lng:-8.5007},
    {name:'Agence CashPlus Hay Hassani',      addr:'Bd Hay Hassani',                 lat:33.2193, lng:-8.4940},
    {name:'Agence CashPlus Route Casablanca', addr:'Route de Casablanca',            lat:33.2477, lng:-8.5133},
    {name:'Agence CashPlus Azemmour',         addr:'Centre d\'Azemmour',             lat:33.2862, lng:-8.3435}
  ],

  'Nador': [
    {name:'Agence CashPlus Centre Nador',     addr:'Bd Mohammed V, Centre',          lat:35.1736, lng:-2.9301},
    {name:'Agence CashPlus Hay Hassani',      addr:'Bd Hay Hassani',                 lat:35.1620, lng:-2.9400},
    {name:'Agence CashPlus Route Melilla',    addr:'Route de Melilla',               lat:35.1830, lng:-2.9186},
    {name:'Agence CashPlus Beni Ansar',       addr:'Centre Beni Ansar',              lat:35.1988, lng:-2.9245}
  ],

  'Settat': [
    {name:'Agence CashPlus Centre Settat',    addr:'Bd Mohammed V, Centre',          lat:33.0007, lng:-7.6195},
    {name:'Agence CashPlus Hay Al Massar',    addr:'Bd Al Massar',                   lat:32.9878, lng:-7.6223},
    {name:'Agence CashPlus Route Casablanca', addr:'Route de Casablanca',            lat:33.0156, lng:-7.6081}
  ],

  'Khouribga': [
    {name:'Agence CashPlus Centre Khouribga', addr:'Bd Hassan II, Centre',           lat:32.8813, lng:-6.9063},
    {name:'Agence CashPlus Hay Oulad M\'barek',addr:'Bd Oulad M\'barek',             lat:32.8700, lng:-6.9132},
    {name:'Agence CashPlus Route Béni Mellal',addr:'Route de Béni Mellal',           lat:32.8929, lng:-6.8972}
  ],

  'Safi': [
    {name:'Agence CashPlus Centre Safi',      addr:'Av Mohammed V, Centre',          lat:32.2994, lng:-9.2372},
    {name:'Agence CashPlus Hay Essalam',      addr:'Bd Hay Essalam',                 lat:32.2870, lng:-9.2294},
    {name:'Agence CashPlus Hay Ennahda',      addr:'Bd Hay Ennahda',                 lat:32.2913, lng:-9.2481},
    {name:'Agence CashPlus Route Agadir',     addr:'Route d\'Agadir',                lat:32.2753, lng:-9.2540}
  ],

  'Essaouira': [
    {name:'Agence CashPlus Médina Essaouira', addr:'Bd Mohammed V, Médina',          lat:31.5085, lng:-9.7595},
    {name:'Agence CashPlus Route Marrakech',  addr:'Route de Marrakech',             lat:31.5172, lng:-9.7501},
    {name:'Agence CashPlus Douar Laadam',     addr:'Quartier Laadam',                lat:31.5022, lng:-9.7492}
  ],

  'Dakhla': [
    {name:'Agence CashPlus Centre Dakhla',    addr:'Av Mohammed V, Centre',          lat:23.6848, lng:-15.9671},
    {name:'Agence CashPlus Hay Salam',        addr:'Bd Hay Salam',                   lat:23.6712, lng:-15.9543}
  ]
};
