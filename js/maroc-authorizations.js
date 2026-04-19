/* ═══════════════════════════════════════════════════════════════════
   GO PLUS EXPRESS — Base de données Autorisations Import Maroc
   Sources: Douane Maroc (ADIL), ANRT, DMP, ONSSA, IMANOR
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Échappe les caractères HTML dangereux.
 * Défini ici en fallback — la version principale est dans espace-client.js.
 */
function escapeAuthHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;')
    .replace(/\//g, '&#x2F;');
}

// Utiliser escapeHTML de espace-client.js s'il est disponible, sinon le fallback local
const _esc = typeof escapeHTML === 'function' ? escapeHTML : escapeAuthHTML;

/**
 * MAROC_AUTH_DB — Tableau des autorisations d'importation marocaines
 * Chaque entrée contient :
 *   prefixes  : tableau de préfixes HS (2 à 8 chiffres)
 *   authority : organisme émetteur
 *   fullname  : nom complet de l'organisme
 *   type      : PROHIBE | RESTREINT | CONDITIONNEL | DOCUMENT
 *   document  : intitulé du document requis
 *   reference : base légale (dahir, arrêté…)
 *   note      : précision pratique
 *   url       : site officiel
 *   badge     : danger | warning | info | success
 *   delay     : délai estimé d'obtention (jours)
 */
const MAROC_AUTH_DB = [

  /* ═══════════════════════════════════════════════════════
     ANRT — AGENCE NATIONALE DE RÉGLEMENTATION DES TÉLÉCOMS
     Équipements terminaux, radioélectriques, TIC
     ═══════════════════════════════════════════════════════ */
  {
    prefixes: ['8517'],
    authority: 'ANRT',
    fullname: "Agence Nationale de Réglementation des Télécommunications",
    type: 'RESTREINT',
    document: "Agrément / Homologation ANRT",
    reference: "Loi 24-96 relative à la poste et aux télécommunications, modifiée par Loi 55-01 ; Décision ANRT DGSN/DIR/001",
    note: "Téléphones mobiles, smartphones, terminaux IP, routeurs, modems, commutateurs. L'équipement doit être homologué avant toute commercialisation ou importation commerciale.",
    url: "https://www.anrt.ma",
    badge: 'warning',
    delay: 30
  },
  {
    prefixes: ['8518','8519','8527'],
    authority: 'ANRT',
    fullname: "Agence Nationale de Réglementation des Télécommunications",
    type: 'CONDITIONNEL',
    document: "Homologation ANRT (si usage radioélectrique)",
    reference: "Loi 24-96, Décision ANRT — homologation des équipements terminaux",
    note: "Microphones, enceintes, récepteurs radio, appareils Hi-Fi avec fonction sans fil (Bluetooth, Wi-Fi) : homologation requise.",
    url: "https://www.anrt.ma",
    badge: 'info',
    delay: 20
  },
  {
    prefixes: ['8525','8526'],
    authority: 'ANRT',
    fullname: "Agence Nationale de Réglementation des Télécommunications",
    type: 'RESTREINT',
    document: "Autorisation d'importation ANRT + Homologation",
    reference: "Loi 24-96 art. 22 ; Décret 2-97-1025",
    note: "Émetteurs-récepteurs, stations de base, équipements de radiodiffusion. Autorisation spéciale du Chef du Gouvernement requise pour certaines fréquences.",
    url: "https://www.anrt.ma",
    badge: 'warning',
    delay: 45
  },
  {
    prefixes: ['8528'],
    authority: 'ANRT',
    fullname: "Agence Nationale de Réglementation des Télécommunications",
    type: 'CONDITIONNEL',
    document: "Homologation ANRT (décodeurs, récepteurs satellite)",
    reference: "Loi 24-96 ; Décision ANRT relative aux terminaux",
    note: "Téléviseurs connectés, décodeurs TNT/satellite doivent être homologués si intègrent une interface réseau.",
    url: "https://www.anrt.ma",
    badge: 'info',
    delay: 20
  },
  {
    prefixes: ['8529'],
    authority: 'ANRT',
    fullname: "Agence Nationale de Réglementation des Télécommunications",
    type: 'CONDITIONNEL',
    document: "Homologation ANRT (pièces pour équipements radioélectriques)",
    reference: "Loi 24-96",
    note: "Pièces et accessoires pour appareils des positions 8525-8528. Homologation si l'ensemble final nécessite une fréquence radio.",
    url: "https://www.anrt.ma",
    badge: 'info',
    delay: 15
  },
  {
    prefixes: ['8543'],
    authority: 'ANRT',
    fullname: "Agence Nationale de Réglementation des Télécommunications",
    type: 'CONDITIONNEL',
    document: "Homologation ANRT (machines électriques diverses)",
    reference: "Loi 24-96",
    note: "Brouilleurs, amplificateurs de signal, répéteurs GSM — soumis à autorisation spéciale.",
    url: "https://www.anrt.ma",
    badge: 'warning',
    delay: 30
  },

  /* ═══════════════════════════════════════════════════════
     DMP — DIRECTION DU MÉDICAMENT ET DE LA PHARMACIE
     Médicaments, dispositifs médicaux
     ═══════════════════════════════════════════════════════ */
  {
    prefixes: ['3001','3002','3003','3004','3005','3006'],
    authority: 'DMP',
    fullname: "Direction du Médicament et de la Pharmacie — Ministère de la Santé",
    type: 'RESTREINT',
    document: "Autorisation de Mise sur le Marché (AMM) + Autorisation d'importation DMP",
    reference: "Dahir n° 1-59-382 du 27 joumada I 1379 formant code du médicament et de la pharmacie, modifié et complété",
    note: "Tout médicament, vaccin, sérum, préparation pharmaceutique doit disposer d'une AMM délivrée par la DMP avant toute importation. Le représentant local doit être un pharmacien autorisé.",
    url: "https://www.sante.gov.ma",
    badge: 'danger',
    delay: 60
  },
  {
    prefixes: ['9018','9019','9020','9021','9022'],
    authority: 'DMP',
    fullname: "Direction du Médicament et de la Pharmacie — Ministère de la Santé",
    type: 'RESTREINT',
    document: "Enregistrement dispositif médical DMP + Autorisation d'importation",
    reference: "Loi 84-12 sur les dispositifs médicaux ; Circulaire DMP",
    note: "Instruments chirurgicaux, appareils de diagnostic, implants, équipements de radiologie. Enregistrement obligatoire à la DMP.",
    url: "https://www.sante.gov.ma",
    badge: 'warning',
    delay: 45
  },
  {
    prefixes: ['2941'],
    authority: 'DMP',
    fullname: "Direction du Médicament et de la Pharmacie — Ministère de la Santé",
    type: 'RESTREINT',
    document: "Autorisation d'importation DMP (antibiotiques)",
    reference: "Code du médicament ; Arrêté du Ministre de la Santé",
    note: "Antibiotiques (pénicillines, céphalosporines, etc.) : importation réservée aux laboratoires autorisés ou grossistes répartiteurs.",
    url: "https://www.sante.gov.ma",
    badge: 'danger',
    delay: 30
  },
  {
    prefixes: ['3822','3826'],
    authority: 'DMP',
    fullname: "Direction du Médicament et de la Pharmacie — Ministère de la Santé",
    type: 'CONDITIONNEL',
    document: "Autorisation DMP (réactifs de laboratoire médicaux)",
    reference: "Loi 84-12 sur les dispositifs médicaux",
    note: "Réactifs diagnostiques in vitro, milieux de culture biologiques à usage médical.",
    url: "https://www.sante.gov.ma",
    badge: 'info',
    delay: 30
  },

  /* ═══════════════════════════════════════════════════════
     ONSSA — OFFICE NATIONAL DE SÉCURITÉ SANITAIRE DES PRODUITS ALIMENTAIRES
     Produits alimentaires, végétaux, animaux
     ═══════════════════════════════════════════════════════ */
  {
    prefixes: ['01'],
    authority: 'ONSSA',
    fullname: "Office National de Sécurité Sanitaire des Produits Alimentaires",
    type: 'RESTREINT',
    document: "Permis sanitaire d'importation (PSI) + Certificat sanitaire pays d'origine",
    reference: "Loi 34-09 relative à la santé animale et végétale ; Arrêté 1786-12",
    note: "Animaux vivants : bétail, chevaux, volailles, etc. Le PSI doit être obtenu auprès de l'ONSSA avant l'expédition. Inspection vétérinaire au point d'entrée.",
    url: "https://www.onssa.gov.ma",
    badge: 'danger',
    delay: 15
  },
  {
    prefixes: ['02','0301','0302','0303','0304','0305','0306','0307','0308'],
    authority: 'ONSSA',
    fullname: "Office National de Sécurité Sanitaire des Produits Alimentaires",
    type: 'RESTREINT',
    document: "Certificat sanitaire d'exportation (pays d'origine) + Inspection ONSSA",
    reference: "Loi 34-09 ; Décret 2-12-682 ; Circulaire ONSSA",
    note: "Viandes fraîches/congelées, poissons, crustacés, mollusques. Certificat sanitaire du pays exportateur obligatoire. Inspection à l'arrivée. Produits halal : certificat halal requis.",
    url: "https://www.onssa.gov.ma",
    badge: 'danger',
    delay: 10
  },
  {
    prefixes: ['04'],
    authority: 'ONSSA',
    fullname: "Office National de Sécurité Sanitaire des Produits Alimentaires",
    type: 'RESTREINT',
    document: "Certificat sanitaire + Déclaration de conformité (produits laitiers)",
    reference: "Loi 34-09 ; Arrêté 2958-14 sur les produits laitiers",
    note: "Lait, produits laitiers, œufs, miel. Certificat sanitaire du pays d'origine exigé. Produits soumis aux normes NM marocaines.",
    url: "https://www.onssa.gov.ma",
    badge: 'warning',
    delay: 10
  },
  {
    prefixes: ['05'],
    authority: 'ONSSA',
    fullname: "Office National de Sécurité Sanitaire des Produits Alimentaires",
    type: 'CONDITIONNEL',
    document: "Certificat sanitaire d'exportation (si d'origine animale)",
    reference: "Loi 34-09",
    note: "Autres produits d'origine animale (boyaux, plumes, os, etc.) soumis à contrôle vétérinaire.",
    url: "https://www.onssa.gov.ma",
    badge: 'info',
    delay: 10
  },
  {
    prefixes: ['06','07','08','09','10','11','12','13','14'],
    authority: 'ONSSA',
    fullname: "Office National de Sécurité Sanitaire des Produits Alimentaires",
    type: 'CONDITIONNEL',
    document: "Certificat phytosanitaire du pays d'origine + Inspection ONSSA",
    reference: "Loi 34-09 ; Arrêté 2617-12 sur la protection des végétaux",
    note: "Plantes vivantes, fleurs, légumes, fruits, céréales, graines : certificat phytosanitaire exigé. Traitement phytosanitaire possible à l'entrée.",
    url: "https://www.onssa.gov.ma",
    badge: 'warning',
    delay: 7
  },
  {
    prefixes: ['15','16','17','18','19','20','21','22','23'],
    authority: 'ONSSA',
    fullname: "Office National de Sécurité Sanitaire des Produits Alimentaires",
    type: 'DOCUMENT',
    document: "Déclaration de conformité aux normes NM + Étiquetage bilingue (FR/AR) exigé",
    reference: "Loi 28-07 relative à la sécurité sanitaire des aliments ; Décret 2-12-389",
    note: "Huiles, conserves, sucres, boissons, préparations alimentaires : étiquetage obligatoire en français et arabe avec date de péremption, valeur nutritive, composition. Conformité aux normes ONSSA/NM.",
    url: "https://www.onssa.gov.ma",
    badge: 'info',
    delay: 5
  },
  {
    prefixes: ['24'],
    authority: 'ONSSA',
    fullname: "Office National de Sécurité Sanitaire des Produits Alimentaires",
    type: 'RESTREINT',
    document: "Autorisation d'importation (tabacs) + Agrément grossiste",
    reference: "Loi 04-08 relative à la commercialisation des tabacs ; Décret 2-07-642",
    note: "Tabacs manufacturés : importation soumise à autorisation de l'Administration des Douanes et du Ministère de l'Économie. Monopole partiel.",
    url: "https://www.onssa.gov.ma",
    badge: 'warning',
    delay: 20
  },

  /* ═══════════════════════════════════════════════════════
     IMANOR / COC — CERTIFICAT DE CONFORMITÉ (MARQUAGE NM)
     Produits industriels soumis aux normes marocaines
     ═══════════════════════════════════════════════════════ */
  {
    prefixes: ['2523'],
    authority: 'IMANOR',
    fullname: "Institut Marocain de Normalisation (IMANOR) — Certificat de Conformité NM",
    type: 'DOCUMENT',
    document: "Certificat de Conformité NM 10.1.007 (ciments)",
    reference: "Arrêté n° 1778-14 ; NM 10.1.007",
    note: "Tous les ciments importés doivent être conformes à la norme marocaine NM 10.1.007 et disposer d'un certificat de conformité IMANOR ou d'un organisme accrédité équivalent.",
    url: "https://www.imanor.gov.ma",
    badge: 'info',
    delay: 15
  },
  {
    prefixes: ['6810'],
    authority: 'IMANOR',
    fullname: "Institut Marocain de Normalisation (IMANOR)",
    type: 'DOCUMENT',
    document: "Certificat de Conformité (ouvrages en ciment/béton)",
    reference: "Arrêté portant sur les matériaux de construction",
    note: "Dalles, hourdis, parpaings, éléments préfabriqués en béton : conformité aux normes NM de construction.",
    url: "https://www.imanor.gov.ma",
    badge: 'info',
    delay: 15
  },
  {
    prefixes: ['7213','7214','7215','7216','7217','7221','7222','7223','7224','7225','7226','7227','7228','7229'],
    authority: 'IMANOR',
    fullname: "Institut Marocain de Normalisation (IMANOR)",
    type: 'DOCUMENT',
    document: "Certificat de Conformité NM (aciers de construction)",
    reference: "Arrêté n° 1778-14 ; NM 01.4.096 ; NM 01.4.097",
    note: "Barres et fils en acier pour béton armé : marquage NM obligatoire. Inspection par IMANOR ou organisme accrédité au chargement.",
    url: "https://www.imanor.gov.ma",
    badge: 'warning',
    delay: 15
  },
  {
    prefixes: ['8501','8502'],
    authority: 'IMANOR',
    fullname: "Institut Marocain de Normalisation (IMANOR)",
    type: 'DOCUMENT',
    document: "Certificat de Conformité NM (moteurs, générateurs électriques)",
    reference: "Arrêté du MCINET portant normes obligatoires",
    note: "Moteurs électriques et alternateurs de puissance < 37,5 kW soumis à certification NM.",
    url: "https://www.imanor.gov.ma",
    badge: 'info',
    delay: 20
  },
  {
    prefixes: ['8516'],
    authority: 'IMANOR',
    fullname: "Institut Marocain de Normalisation (IMANOR)",
    type: 'DOCUMENT',
    document: "Certificat de Conformité NM (appareils électrodomestiques)",
    reference: "Arrêté MCINET — normes sécurité électrique",
    note: "Chauffe-eau électriques, chauffe-bains, fours, réchauds : certification NM sécurité obligatoire.",
    url: "https://www.imanor.gov.ma",
    badge: 'info',
    delay: 20
  },
  {
    prefixes: ['8539','8541','8544'],
    authority: 'IMANOR',
    fullname: "Institut Marocain de Normalisation (IMANOR)",
    type: 'DOCUMENT',
    document: "Certificat de Conformité NM (câbles et fils électriques)",
    reference: "NM 22.1.011 ; Arrêté MCINET",
    note: "Câbles électriques basse tension, fils isolés, lampes : certification NM obligatoire pour tous les produits mis sur le marché marocain.",
    url: "https://www.imanor.gov.ma",
    badge: 'warning',
    delay: 20
  },
  {
    prefixes: ['9401','9403'],
    authority: 'IMANOR',
    fullname: "Institut Marocain de Normalisation (IMANOR)",
    type: 'DOCUMENT',
    document: "Certificat de Conformité (meubles — émissions formaldéhyde)",
    reference: "NM 10.6.019",
    note: "Meubles en panneaux de bois : conformité aux normes d'émissions de composés organiques volatils (NM 10.6.019).",
    url: "https://www.imanor.gov.ma",
    badge: 'info',
    delay: 15
  },
  {
    prefixes: ['9503','9504','9505'],
    authority: 'IMANOR',
    fullname: "Institut Marocain de Normalisation (IMANOR)",
    type: 'DOCUMENT',
    document: "Certificat de Conformité NM (jouets — sécurité)",
    reference: "NM 03.6.001 ; Arrêté jouets 2014",
    note: "Jouets pour enfants : certification sécurité obligatoire. Absence de substances dangereuses (plomb, phtalates), résistance mécanique, flammabilité.",
    url: "https://www.imanor.gov.ma",
    badge: 'warning',
    delay: 20
  },
  {
    prefixes: ['4011','4012','4013'],
    authority: 'IMANOR',
    fullname: "Institut Marocain de Normalisation (IMANOR)",
    type: 'DOCUMENT',
    document: "Certificat de Conformité NM (pneumatiques)",
    reference: "NM 57.0.010 ; Arrêté 2012 sur pneumatiques",
    note: "Pneumatiques neufs et rechapés : homologation type obligatoire. Marquage NM. Interdiction d'importation de pneus de récupération.",
    url: "https://www.imanor.gov.ma",
    badge: 'warning',
    delay: 25
  },

  /* ═══════════════════════════════════════════════════════
     MINISTÈRE DE L'INTÉRIEUR / DGSN — ARMES ET MUNITIONS
     ═══════════════════════════════════════════════════════ */
  {
    prefixes: ['9301','9302','9303','9304','9305','9306','9307'],
    authority: 'MIN. INTÉRIEUR',
    fullname: "Ministère de l'Intérieur — Direction Générale de la Sûreté Nationale (DGSN)",
    type: 'PROHIBE',
    document: "Autorisation exceptionnelle du Ministre de l'Intérieur",
    reference: "Dahir n° 1-74-383 du 15 joumada II 1394 relatif aux armes et munitions ; Décret 2-71-400",
    note: "Armes à feu, pistolets, fusils, munitions, explosifs : importation quasi-prohibée pour les particuliers. Réservée aux Forces Armées Royales et services de sécurité autorisés. Peine d'emprisonnement pour importation illicite.",
    url: "https://www.interieur.gov.ma",
    badge: 'danger',
    delay: 180
  },

  /* ═══════════════════════════════════════════════════════
     MINISTÈRE DE L'AGRICULTURE — PRODUITS AGRICOLES SPÉCIAUX
     ═══════════════════════════════════════════════════════ */
  {
    prefixes: ['3808'],
    authority: 'MAAFC',
    fullname: "Ministère de l'Agriculture — Direction de la Protection des Végétaux",
    type: 'RESTREINT',
    document: "Homologation phytosanitaire + Autorisation d'importation",
    reference: "Dahir 1-73-255 portant loi relative à la protection des végétaux ; Loi 42-95",
    note: "Pesticides, insecticides, herbicides, fongicides : homologation préalable obligatoire. Substances actives répertoriées dans la liste marocaine. Certains produits interdits (POPs).",
    url: "https://www.agriculture.gov.ma",
    badge: 'danger',
    delay: 90
  },
  {
    prefixes: ['3101','3102','3103','3104','3105'],
    authority: 'MAAFC',
    fullname: "Ministère de l'Agriculture (Division Engrais)",
    type: 'DOCUMENT',
    document: "Certificat de conformité engrais + Autorisation de mise en marché",
    reference: "Dahir 1-73-255 ; Loi 42-95 engrais",
    note: "Engrais chimiques et organiques : autorisation de commercialisation au Maroc. Étiquetage en arabe et français obligatoire.",
    url: "https://www.agriculture.gov.ma",
    badge: 'info',
    delay: 30
  },

  /* ═══════════════════════════════════════════════════════
     HAUT COMMISSARIAT AUX EAUX ET FORÊTS — CITES
     Espèces protégées / Convention de Washington
     ═══════════════════════════════════════════════════════ */
  {
    prefixes: ['0101','0102','0103','0104','0105','0106'],
    authority: 'HCEFLCD / CITES',
    fullname: "Haut Commissariat aux Eaux et Forêts — Convention CITES",
    type: 'CONDITIONNEL',
    document: "Permis CITES (si espèce Annexe I, II ou III)",
    reference: "Convention de Washington CITES ; Dahir 1-73-255",
    note: "Animaux vivants ou parties d'animaux : vérifier si l'espèce est inscrite en Annexe CITES. Permis d'exportation du pays d'origine + permis d'importation marocain requis pour Annexes I et II.",
    url: "https://www.eauxetforets.gov.ma",
    badge: 'warning',
    delay: 30
  },

  /* ═══════════════════════════════════════════════════════
     MINISTÈRE DE L'ÉNERGIE — PRODUITS PÉTROLIERS & CHIMIQUES
     ═══════════════════════════════════════════════════════ */
  {
    prefixes: ['2709','2710','2711','2712','2713','2714','2715'],
    authority: 'MIN. ÉNERGIE',
    fullname: "Ministère de l'Énergie, des Mines et de l'Environnement — ONHYM",
    type: 'RESTREINT',
    document: "Autorisation d'importation produits pétroliers + Agrément stockage",
    reference: "Loi 01-00 portant organisation du secteur pétrolier ; Décret 2-00-368",
    note: "Pétrole brut, carburants, gaz naturel liquéfié, huiles minérales : importation soumise à autorisation ANPP (Autorité Nationale des Produits Pétroliers). Réservée aux opérateurs agréés.",
    url: "https://www.mem.gov.ma",
    badge: 'warning',
    delay: 30
  },
  {
    prefixes: ['2716'],
    authority: 'MIN. ÉNERGIE',
    fullname: "Ministère de l'Énergie — ONEE",
    type: 'RESTREINT',
    document: "Autorisation ONEE (énergie électrique)",
    reference: "Loi 13-09 relative aux énergies renouvelables",
    note: "Énergie électrique : importation via l'ONEE (Office National de l'Électricité). Producteurs indépendants soumis à autorisation ou concession.",
    url: "https://www.one.org.ma",
    badge: 'warning',
    delay: 60
  },
  {
    prefixes: ['2844','2845'],
    authority: 'AIEA / MIN. ÉNERGIE',
    fullname: "Agence Marocaine de Sûreté et de Sécurité Nucléaires et Radiologiques (AMSSNuR)",
    type: 'PROHIBE',
    document: "Autorisation AMSSNuR (matières radioactives)",
    reference: "Loi 142-12 sur la sécurité nucléaire et radiologique",
    note: "Matières radioactives et fissiles : importation sous strict contrôle de l'AMSSNuR. Usage civil médical ou industriel uniquement avec autorisation spéciale.",
    url: "https://www.amssunr.gov.ma",
    badge: 'danger',
    delay: 120
  },

  /* ═══════════════════════════════════════════════════════
     STUPÉFIANTS / PSYCHOTROPES — MINISTÈRE DE LA SANTÉ
     ═══════════════════════════════════════════════════════ */
  {
    prefixes: ['2939','2933','2934'],
    authority: 'MIN. SANTÉ (Stupéfiants)',
    fullname: "Ministère de la Santé — Service Stupéfiants et Psychotropes",
    type: 'RESTREINT',
    document: "Autorisation spéciale importation stupéfiants/psychotropes",
    reference: "Dahir 1-73-282 sur les stupéfiants ; Convention internationale de Vienne 1971",
    note: "Alcaloïdes (opium, cocaïne, morphine) et psychotropes : importation réservée aux établissements pharmaceutiques autorisés par le Ministère de la Santé. Quota annuel.",
    url: "https://www.sante.gov.ma",
    badge: 'danger',
    delay: 60
  },

  /* ═══════════════════════════════════════════════════════
     PRODUITS CHIMIQUES DANGEREUX / OCP
     ═══════════════════════════════════════════════════════ */
  {
    prefixes: ['2801','2802','2803','2804','2805','2806','2807','2808','2809','2810',
               '2811','2812','2813','2814','2815','2816','2817','2818','2819','2820'],
    authority: 'MIN. INDUSTRIE',
    fullname: "Ministère de l'Industrie et du Commerce — Division Produits Chimiques",
    type: 'DOCUMENT',
    document: "Fiche de Données de Sécurité (FDS) en français/arabe + Déclaration douanière spéciale",
    reference: "Loi 55-03 relative à l'élimination des déchets ; Convention de Rotterdam",
    note: "Produits chimiques inorganiques (acides, bases, halogènes) : FDS conforme au règlement REACH (adaptée Maroc) obligatoire. Emballage homologué GHS/SGH.",
    url: "https://www.mcinet.gov.ma",
    badge: 'info',
    delay: 10
  },
  {
    prefixes: ['2901','2902','2903','2904','2905','2906','2907','2908','2909','2910'],
    authority: 'MIN. INDUSTRIE',
    fullname: "Ministère de l'Industrie — Division Produits Chimiques",
    type: 'DOCUMENT',
    document: "FDS obligatoire (hydrocarbures, solvants, phénols)",
    reference: "Convention de Stockholm sur les POPs ; Loi 55-03",
    note: "Hydrocarbures acycliques, cycliques, halogénés, phénols : certaines substances listées comme POPs sont prohibées (PCB, dioxines). FDS obligatoire pour les autres.",
    url: "https://www.mcinet.gov.ma",
    badge: 'info',
    delay: 10
  },

  /* ═══════════════════════════════════════════════════════
     PRODUITS COSMÉTIQUES / DÉTERGENTS — ONSSA / MIN. SANTÉ
     ═══════════════════════════════════════════════════════ */
  {
    prefixes: ['3301','3302','3303','3304','3305','3306','3307'],
    authority: 'MIN. SANTÉ (Cosmétiques)',
    fullname: "Ministère de la Santé — Division Cosmétiques",
    type: 'DOCUMENT',
    document: "Notification cosmétique (CPNP-Maroc) + Étiquetage bilingue FR/AR",
    reference: "Décret 2-09-285 relatif aux produits cosmétiques ; Loi n° 17-04",
    note: "Parfums, crèmes, shampoings, produits de soin : déclaration préalable au Ministère de la Santé. Composition conforme à la liste positive/négative. Étiquetage en français et arabe obligatoire.",
    url: "https://www.sante.gov.ma",
    badge: 'info',
    delay: 15
  },
  {
    prefixes: ['3401','3402','3403','3404','3405'],
    authority: 'MIN. SANTÉ / ONSSA',
    fullname: "Ministère de la Santé + ONSSA",
    type: 'DOCUMENT',
    document: "Conformité aux normes NM (détergents, savons)",
    reference: "NM 03.0.100 et suivantes ; Décret 2-12-389",
    note: "Savons, détergents ménagers : conformité aux normes NM. Étiquetage bilingue obligatoire. Teneur en phosphates limitée.",
    url: "https://www.onssa.gov.ma",
    badge: 'info',
    delay: 10
  },

  /* ═══════════════════════════════════════════════════════
     VÉHICULES AUTOMOBILES — DTRF / MIN. TRANSPORT
     ═══════════════════════════════════════════════════════ */
  {
    prefixes: ['8701','8702','8703','8704','8705','8706','8707','8708','8709','8710','8711'],
    authority: 'MIN. TRANSPORT',
    fullname: "Ministère du Transport et de la Logistique — DTRF",
    type: 'DOCUMENT',
    document: "Homologation véhicule (DTRF) + Certificat de conformité constructeur",
    reference: "Loi 52-05 formant Code de la Route ; Arrêté 2200-15 DTRF",
    note: "Véhicules à moteur : homologation par réception technique (type ou individuelle) auprès de la DTRF. Âge limite à l'importation : 5 ans pour véhicules de tourisme neufs + 3 ans pour occasions. Normes antipollution Euro 4 minimum.",
    url: "https://www.transport.gov.ma",
    badge: 'warning',
    delay: 30
  },
  {
    prefixes: ['8712'],
    authority: 'MIN. TRANSPORT',
    fullname: "Ministère du Transport — DTRF (Cycles)",
    type: 'DOCUMENT',
    document: "Conformité NM (bicyclettes et vélos électriques)",
    reference: "NM 52.1.003",
    note: "Bicyclettes, vélos à assistance électrique : conformité NM. Les trottinettes électriques > 250W soumises à homologation DTRF.",
    url: "https://www.transport.gov.ma",
    badge: 'info',
    delay: 15
  },

  /* ═══════════════════════════════════════════════════════
     MATIÈRES PREMIÈRES TEXTILES — CERTIFICAT D'ORIGINE
     ═══════════════════════════════════════════════════════ */
  {
    prefixes: ['50','51','52','53','54','55','56','57','58','59','60','61','62','63'],
    authority: 'ADII / ASMEX',
    fullname: "Administration des Douanes et Impôts Indirects — Certificat d'origine",
    type: 'DOCUMENT',
    document: "Certificat EUR.1 (si origine UE) ou Certificat d'origine Form A (GSP)",
    reference: "Accord d'Association Maroc-UE (2000) ; ALE Maroc-USA (2006) ; Accord Agadir",
    note: "Textiles et vêtements : le certificat d'origine détermine le taux de droit d'importation applicable. EUR.1 pour l'UE, Form A pour pays GSP. Sans certificat : taux plein (25-30%).",
    url: "https://www.douane.gov.ma",
    badge: 'info',
    delay: 5
  },

  /* ═══════════════════════════════════════════════════════
     ŒUVRES D'ART / BIENS CULTURELS — MIN. CULTURE
     ═══════════════════════════════════════════════════════ */
  {
    prefixes: ['97'],
    authority: 'MIN. CULTURE',
    fullname: "Ministère de la Culture — Service du Patrimoine",
    type: 'CONDITIONNEL',
    document: "Autorisation d'exportation culturelle (pays d'origine) + Déclaration CEDOC",
    reference: "Convention UNESCO 1970 sur les biens culturels ; Dahir 1-80-341",
    note: "Œuvres d'art, antiquités, pièces archéologiques : vérifier si le pays d'origine requiert une autorisation d'exportation. Au Maroc, l'exportation du patrimoine national est prohibée.",
    url: "https://www.minculture.gov.ma",
    badge: 'warning',
    delay: 30
  },

  /* ═══════════════════════════════════════════════════════
     DÉCHETS — PROHIBÉ (Convention de Bâle)
     ═══════════════════════════════════════════════════════ */
  {
    prefixes: ['3915','3916','3917','3918','3919','3920','3921','3922','3923','3924','3925','3926'],
    authority: 'MIN. ENVIRONNEMENT',
    fullname: "Ministère de la Transition Énergétique et du Développement Durable",
    type: 'CONDITIONNEL',
    document: "Déclaration conformité (déchets plastiques — Convention de Bâle)",
    reference: "Convention de Bâle ; Loi 28-00 relative à la gestion des déchets",
    note: "Articles en plastique recyclé/déchets : les importations de déchets plastiques sont soumises à la Convention de Bâle. Déchets dangereux : importation prohibée au Maroc.",
    url: "https://www.environnement.gov.ma",
    badge: 'info',
    delay: 10
  },

  /* ═══════════════════════════════════════════════════════
     PIÈCES DÉTACHÉES MOTEURS / ÉQUIPEMENTS INDUSTRIELS
     ═══════════════════════════════════════════════════════ */
  {
    prefixes: ['8407','8408','8409','8412','8413','8414','8415','8418','8419','8420',
               '8421','8422','8423','8424','8425','8426','8427','8428','8429','8430'],
    authority: 'ADII',
    fullname: "Administration des Douanes et Impôts Indirects",
    type: 'DOCUMENT',
    document: "Facture commerciale + Liste de colisage + Document de transport",
    reference: "Code des Douanes (Loi 02-97) ; Instruction générale des Douanes",
    note: "Machines et équipements industriels : documents douaniers standards. Vérifier si l'équipement contient des composants radioélectriques (nécessite homologation ANRT) ou relève de la réglementation DTRF.",
    url: "https://www.douane.gov.ma",
    badge: 'success',
    delay: 0
  },

  /* ═══════════════════════════════════════════════════════
     MATÉRIAUX DE CONSTRUCTION — CONFORMITÉ NM
     ═══════════════════════════════════════════════════════ */
  {
    prefixes: ['6901','6902','6903','6904','6905','6906','6907','6908'],
    authority: 'IMANOR',
    fullname: "Institut Marocain de Normalisation (IMANOR) — Matériaux de construction",
    type: 'DOCUMENT',
    document: "Certificat de Conformité NM (céramiques, briques réfractaires)",
    reference: "NM 10.8.001 et suivantes ; Arrêté MCINET",
    note: "Tuiles, briques, carreaux céramiques de construction : conformité aux normes NM pour les produits mis sur le marché.",
    url: "https://www.imanor.gov.ma",
    badge: 'info',
    delay: 15
  },

  /* ═══════════════════════════════════════════════════════
     ÉQUIPEMENTS DE PROTECTION INDIVIDUELLE (EPI)
     ═══════════════════════════════════════════════════════ */
  {
    prefixes: ['6211','6216','6217','6506'],
    authority: 'IMANOR / MIN. EMPLOI',
    fullname: "IMANOR + Ministère de l'Emploi (EPI)",
    type: 'DOCUMENT',
    document: "Certificat de conformité EPI (EN 397 / ISO 3873 pour casques)",
    reference: "Code du Travail Maroc (Loi 65-99) — art. protection des travailleurs",
    note: "Équipements de protection individuelle professionnels : conformité aux normes européennes EN ou normes NM équivalentes.",
    url: "https://www.emploi.gov.ma",
    badge: 'info',
    delay: 15
  },

];

/* ═══════════════════════════════════════════════════════════════════
   ACCORDS PRÉFÉRENTIELS MAROC
   Certificats d'origine selon la destination/origine
   ═══════════════════════════════════════════════════════════════════ */
const MAROC_ACCORDS = [
  {
    code: 'EUR.1',
    name: 'Accord d'Association Maroc — Union Européenne',
    countries: ['France','Espagne','Allemagne','Italie','Belgique','Pays-Bas','Portugal','Grèce','Autriche','Suède','Finlande','Danemark','Irlande','Luxembourg','Pologne','République Tchèque','Hongrie','Slovaquie','Slovénie','Estonie','Lettonie','Lituanie','Bulgarie','Roumanie','Croatie','Malte','Chypre'],
    document: 'Certificat EUR.1',
    reduction: 'Taux préférentiel (0% ou réduit)',
    note: 'Accord en vigueur depuis 2000. Règles d\'origine cumulatives UE.',
    url: 'https://www.douane.gov.ma'
  },
  {
    code: 'ALE-USA',
    name: 'Accord de Libre-Échange Maroc — États-Unis',
    countries: ['États-Unis'],
    document: 'Déclaration d\'origine sur facture',
    reduction: 'Réduction progressive → 0% (2023)',
    note: 'ALE en vigueur depuis 2006. Règles d\'origine strictes.',
    url: 'https://www.commerce.gov.ma'
  },
  {
    code: 'AGADIR',
    name: 'Accord Agadir (Maroc, Tunisie, Égypte, Jordanie)',
    countries: ['Tunisie','Égypte','Jordanie'],
    document: 'Certificat EUR.1 ou Formulaire A',
    reduction: 'Taux 0% entre pays membres',
    note: 'Accord de libre-échange entre pays arabes méditerranéens.',
    url: 'https://www.agadiragreement.org'
  },
  {
    code: 'TURQUIE',
    name: 'Accord de Libre-Échange Maroc — Turquie',
    countries: ['Turquie'],
    document: 'Certificat de circulation A.TR ou EUR.1',
    reduction: 'Réductions tarifaires sur produits industriels',
    note: 'ALE en vigueur depuis 2006.',
    url: 'https://www.douane.gov.ma'
  },
  {
    code: 'EMIRATS',
    name: 'Accord de Libre-Échange Maroc — Émirats Arabes Unis',
    countries: ['Émirats Arabes','Émirats Arabes Unis','UAE'],
    document: 'Certificat d\'origine arabe',
    reduction: 'Réduction 0% sur produits industriels',
    note: 'ALE en vigueur depuis 2001.',
    url: 'https://www.douane.gov.ma'
  },
  {
    code: 'ZLECAF',
    name: 'Zone de Libre-Échange Continentale Africaine (ZLECAf)',
    countries: ['Nigéria','Ghana','Côte d\'Ivoire','Sénégal','Kenya','Afrique du Sud','Éthiopie','Tanzanie'],
    document: 'Certificat d\'origine ZLECAf (en cours de déploiement)',
    reduction: 'Réduction progressive sur 5-13 ans',
    note: 'Accord en cours d\'implémentation depuis 2020.',
    url: 'https://au-afcfta.org'
  }
];

/* ═══════════════════════════════════════════════════════════════════
   DROITS & TAXES DE BASE PAR CHAPITRE SH (Tarif Douanier Maroc 2024)
   Source: ADIL — douane.gov.ma/adil
   ═══════════════════════════════════════════════════════════════════ */
const MAROC_TARIF_BASE = {
  // Format: 'SH_PREFIX': { di: %, tpi: %, tva: 20|14|7|0, fds: bool, note }
  // TPI = Taxe Parafiscale à l'Importation : 0.25% sur la plupart des produits industriels
  // Produits alimentaires/pharma : exonérés (tpi: 0) — Textiles : 5%
  '01': { di: 2.5,  tpi: 0,    tva: 20, fds: false, note: 'Animaux vivants' },
  '02': { di: 25,   tpi: 0,    tva: 20, fds: false, note: 'Viandes' },
  '03': { di: 25,   tpi: 0,    tva: 7,  fds: false, note: 'Poissons' },
  '04': { di: 25,   tpi: 0,    tva: 20, fds: false, note: 'Produits laitiers' },
  '06': { di: 2.5,  tpi: 0,    tva: 20, fds: false, note: 'Plantes vivantes' },
  '07': { di: 25,   tpi: 0,    tva: 7,  fds: false, note: 'Légumes' },
  '08': { di: 25,   tpi: 0,    tva: 7,  fds: false, note: 'Fruits' },
  '09': { di: 25,   tpi: 0,    tva: 7,  fds: false, note: 'Café, thé, épices' },
  '10': { di: 2.5,  tpi: 0,    tva: 7,  fds: false, note: 'Céréales' },
  '11': { di: 25,   tpi: 0,    tva: 7,  fds: false, note: 'Produits minoterie' },
  '15': { di: 25,   tpi: 0,    tva: 7,  fds: false, note: 'Graisses et huiles' },
  '17': { di: 25,   tpi: 0,    tva: 7,  fds: false, note: 'Sucres' },
  '18': { di: 25,   tpi: 0,    tva: 7,  fds: false, note: 'Cacao' },
  '19': { di: 25,   tpi: 0,    tva: 7,  fds: false, note: 'Préparations céréales' },
  '20': { di: 40,   tpi: 0,    tva: 20, fds: false, note: 'Préparations légumes/fruits' },
  '22': { di: 40,   tpi: 0.25, tva: 20, fds: false, note: 'Boissons' },
  '24': { di: 40,   tpi: 0.25, tva: 20, fds: false, note: 'Tabacs' },
  '27': { di: 2.5,  tpi: 0.25, tva: 20, fds: false, note: 'Combustibles minéraux' },
  '28': { di: 2.5,  tpi: 0.25, tva: 20, fds: false, note: 'Produits chimiques inorganiques' },
  '29': { di: 2.5,  tpi: 0.25, tva: 20, fds: false, note: 'Produits chimiques organiques' },
  '30': { di: 2.5,  tpi: 0,    tva: 7,  fds: false, note: 'Produits pharmaceutiques' },
  '32': { di: 10,   tpi: 0.25, tva: 20, fds: false, note: 'Extraits tannants, peintures' },
  '33': { di: 25,   tpi: 0.25, tva: 20, fds: false, note: 'Cosmétiques, parfums' },
  '34': { di: 25,   tpi: 0.25, tva: 20, fds: false, note: 'Détergents, savons' },
  '38': { di: 2.5,  tpi: 0.25, tva: 20, fds: false, note: 'Produits chimiques divers' },
  '39': { di: 10,   tpi: 0.25, tva: 20, fds: false, note: 'Matières plastiques' },
  '40': { di: 10,   tpi: 0.25, tva: 20, fds: false, note: 'Caoutchouc' },
  '42': { di: 25,   tpi: 0.25, tva: 20, fds: false, note: 'Maroquinerie, bagages' },
  '44': { di: 10,   tpi: 0.25, tva: 20, fds: false, note: 'Bois et ouvrages en bois' },
  '48': { di: 10,   tpi: 0.25, tva: 20, fds: false, note: 'Papier et carton' },
  '50': { di: 17.5, tpi: 5,    tva: 20, fds: false, note: 'Soie' },
  '51': { di: 17.5, tpi: 5,    tva: 20, fds: false, note: 'Laine' },
  '52': { di: 17.5, tpi: 5,    tva: 20, fds: false, note: 'Coton' },
  '54': { di: 17.5, tpi: 5,    tva: 20, fds: false, note: 'Filaments synthétiques' },
  '55': { di: 17.5, tpi: 5,    tva: 20, fds: false, note: 'Fibres synthétiques' },
  '56': { di: 17.5, tpi: 5,    tva: 20, fds: false, note: 'Ouates, feutres, cordages' },
  '57': { di: 25,   tpi: 5,    tva: 20, fds: false, note: 'Tapis et tissus de sol' },
  '58': { di: 25,   tpi: 5,    tva: 20, fds: false, note: 'Tissus spéciaux' },
  '59': { di: 17.5, tpi: 5,    tva: 20, fds: false, note: 'Tissus imprégnés' },
  '60': { di: 17.5, tpi: 5,    tva: 20, fds: false, note: 'Étoffes de bonneterie' },
  '61': { di: 25,   tpi: 5,    tva: 20, fds: false, note: 'Vêtements en maille' },
  '62': { di: 25,   tpi: 5,    tva: 20, fds: false, note: 'Vêtements non en maille' },
  '63': { di: 25,   tpi: 5,    tva: 20, fds: false, note: 'Articles textiles confectionnés' },
  '64': { di: 25,   tpi: 0.25, tva: 20, fds: false, note: 'Chaussures' },
  '68': { di: 10,   tpi: 0.25, tva: 20, fds: false, note: 'Ouvrages en pierre, plâtre' },
  '69': { di: 25,   tpi: 0.25, tva: 20, fds: false, note: 'Produits céramiques' },
  '70': { di: 10,   tpi: 0.25, tva: 20, fds: false, note: 'Verre et ouvrages en verre' },
  '72': { di: 2.5,  tpi: 0.25, tva: 20, fds: false, note: 'Fonte, fer et acier' },
  '73': { di: 10,   tpi: 0.25, tva: 20, fds: false, note: 'Ouvrages en acier' },
  '74': { di: 10,   tpi: 0.25, tva: 20, fds: false, note: 'Cuivre et ouvrages en cuivre' },
  '76': { di: 10,   tpi: 0.25, tva: 20, fds: false, note: 'Aluminium et ouvrages en aluminium' },
  '84': { di: 2.5,  tpi: 0.25, tva: 20, fds: true,  note: 'Machines et équipements' },
  '85': { di: 2.5,  tpi: 0.25, tva: 20, fds: true,  note: 'Équipements électriques' },
  '86': { di: 2.5,  tpi: 0.25, tva: 20, fds: false, note: 'Véhicules et matériel ferroviaire' },
  '87': { di: 25,   tpi: 0.25, tva: 20, fds: true,  note: 'Véhicules automobiles' },
  '88': { di: 2.5,  tpi: 0.25, tva: 20, fds: false, note: 'Aéronefs' },
  '89': { di: 2.5,  tpi: 0.25, tva: 20, fds: false, note: 'Bateaux' },
  '90': { di: 2.5,  tpi: 0.25, tva: 20, fds: true,  note: 'Instruments de précision' },
  '91': { di: 25,   tpi: 0.25, tva: 20, fds: false, note: 'Horlogerie' },
  '92': { di: 25,   tpi: 0.25, tva: 20, fds: false, note: 'Instruments de musique' },
  '93': { di: 25,   tpi: 0.25, tva: 20, fds: false, note: 'Armes et munitions' },
  '94': { di: 25,   tpi: 0.25, tva: 20, fds: false, note: 'Meubles' },
  '95': { di: 25,   tpi: 0.25, tva: 20, fds: false, note: 'Jouets et articles de sport' },
  '96': { di: 25,   tpi: 0.25, tva: 20, fds: false, note: 'Ouvrages divers' },
};

/* ═══════════════════════════════════════════════════════════════════
   FONCTION PRINCIPALE : getAuthorizations(hsCode)
   Retourne la liste des autorisations requises pour un code SH donné
   ═══════════════════════════════════════════════════════════════════ */
function getAuthorizations(hsCode) {
  if (!hsCode || hsCode === '—') return [];
  const hs = String(hsCode).replace(/[\s\.\-]/g,'');
  const results = [];

  for (const entry of MAROC_AUTH_DB) {
    const matched = entry.prefixes.some(prefix => {
      const p = String(prefix).replace(/[\s\.\-]/g,'');
      return hs.startsWith(p) || p.startsWith(hs.substring(0, Math.min(p.length, hs.length)));
    });
    if (matched) results.push(entry);
  }
  return results;
}

/* ═══════════════════════════════════════════════════════════════════
   FONCTION : getTarifBase(hsCode)
   Retourne les droits et taxes de base pour un code SH
   ═══════════════════════════════════════════════════════════════════ */
function getTarifBase(hsCode) {
  if (!hsCode || hsCode === '—') return null;
  const hs = String(hsCode).replace(/[\s\.\-]/g,'');
  // Try longest match first (6, 4, 2 digits)
  for (const len of [6, 4, 2]) {
    const prefix = hs.substring(0, len);
    if (MAROC_TARIF_BASE[prefix]) return { prefix, ...MAROC_TARIF_BASE[prefix] };
  }
  // Fallback : TPI 0.25% s'applique par défaut sur les produits industriels non listés
  return { prefix: hs.substring(0,2), di: 0, tpi: 0.25, tva: 20, fds: false, note: 'Taux standard' };
}

/* ═══════════════════════════════════════════════════════════════════
   FONCTION : getAccord(countryName)
   Retourne l'accord préférentiel applicable pour un pays d'origine
   ═══════════════════════════════════════════════════════════════════ */
function getAccord(countryName) {
  if (!countryName || countryName === '—') return null;
  const c = countryName.toLowerCase();
  for (const acc of MAROC_ACCORDS) {
    if (acc.countries.some(country => c.includes(country.toLowerCase()) || country.toLowerCase().includes(c))) {
      return acc;
    }
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════════
   FONCTION : renderAuthBadge(type) → HTML du badge couleur
   ═══════════════════════════════════════════════════════════════════ */
function renderAuthBadge(type, badge) {
  const colors = {
    'PROHIBE':      { bg:'#dc3545', icon:'fa-ban',            label:'PROHIBÉ' },
    'RESTREINT':    { bg:'#fd7e14', icon:'fa-triangle-exclamation', label:'RESTREINT' },
    'CONDITIONNEL': { bg:'#ffc107', icon:'fa-circle-exclamation', label:'CONDITIONNEL', fg:'#333' },
    'DOCUMENT':     { bg:'#0dcaf0', icon:'fa-file-lines',     label:'DOCUMENT REQUIS', fg:'#333' },
  };
  const style = colors[type] || { bg:'#6c757d', icon:'fa-circle-info', label: type };
  return `<span class="auth-badge" style="background:${style.bg};color:${style.fg||'#fff'}">
    <i class="fa-solid ${style.icon}"></i> ${style.label}
  </span>`;
}

/* ═══════════════════════════════════════════════════════════════════
   FONCTION : renderAuthPanel(articles)
   Génère le HTML du panneau d'autorisations pour une liste d'articles
   articles = [{description, hsCode, originCountry, quantity, unitPrice}]
   ═══════════════════════════════════════════════════════════════════ */
function renderAuthPanel(articles) {
  if (!articles || articles.length === 0) {
    return `<p class="ocr-placeholder"><i class="fa-solid fa-circle-info"></i> Aucun article détecté. Chargez une facture commerciale.</p>`;
  }

  let html = '';

  articles.forEach((art, i) => {
    const auths = getAuthorizations(art.hsCode);
    const tarif = getTarifBase(art.hsCode);
    const accord = getAccord(art.originCountry);

    // Severity: max badge level
    const hasDanger = auths.some(a => a.badge === 'danger');
    const hasWarning = auths.some(a => a.badge === 'warning');
    const headerColor = hasDanger ? '#dc3545' : hasWarning ? '#fd7e14' : auths.length > 0 ? '#0dcaf0' : '#28a745';

    // SÉCURITÉ : _esc() appliqué à toutes les données utilisateur (description, hsCode, pays)
    // Les données auth.* (authority, note, reference, url) sont des constantes statiques internes
    html += `
    <div class="auth-article-card">
      <div class="auth-article-header" style="border-left:4px solid ${headerColor}">
        <div class="auth-article-title">
          <span class="auth-art-num">${i+1}</span>
          <strong>${_esc(art.description) || 'Article ' + (i+1)}</strong>
        </div>
        <div class="auth-article-meta">
          ${art.hsCode && art.hsCode !== '—' ? `<span class="auth-hs-chip"><i class="fa-solid fa-barcode"></i> HS ${_esc(art.hsCode)}</span>` : ''}
          ${art.originCountry && art.originCountry !== '—' ? `<span class="auth-country-chip"><i class="fa-solid fa-globe"></i> ${_esc(art.originCountry)}</span>` : ''}
          ${art.quantity && art.quantity !== '—' ? `<span class="auth-qty-chip">${_esc(art.quantity)}</span>` : ''}
        </div>
      </div>

      ${auths.length === 0 ? `
        <div class="auth-ok">
          <i class="fa-solid fa-circle-check" style="color:#28a745"></i>
          <span>Aucune autorisation spéciale détectée — importation libre sous documents standard</span>
        </div>` : ''
      }

      ${auths.map(auth => `
        <div class="auth-entry auth-${_esc(auth.badge)}">
          <div class="auth-entry-head">
            ${renderAuthBadge(auth.type)}
            <strong class="auth-authority">${_esc(auth.authority)}</strong>
            <span class="auth-doc-name">${_esc(auth.document)}</span>
            ${auth.delay > 0 ? `<span class="auth-delay"><i class="fa-regular fa-clock"></i> ~${parseInt(auth.delay)||0} jours</span>` : ''}
          </div>
          <p class="auth-fullname">${_esc(auth.fullname)}</p>
          <p class="auth-note">${_esc(auth.note)}</p>
          <div class="auth-ref">
            <i class="fa-solid fa-scale-balanced"></i>
            <em>${_esc(auth.reference)}</em>
            <a href="${_esc(auth.url)}" target="_blank" rel="noopener noreferrer" class="auth-link">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Site officiel
            </a>
          </div>
        </div>`).join('')
      }

      ${tarif ? `
        <div class="auth-tarif">
          <div class="auth-tarif-title"><i class="fa-solid fa-percent"></i> Droits &amp; Taxes estimés (ADIL Maroc)</div>
          <div class="auth-tarif-grid">
            <div class="auth-tarif-item"><span>Droit d'importation (DI)</span><strong>${parseFloat(tarif.di)||0}%</strong></div>
            ${tarif.tpi > 0 ? `<div class="auth-tarif-item"><span>TPI (protection industrie)</span><strong>${parseFloat(tarif.tpi)||0}%</strong></div>` : ''}
            <div class="auth-tarif-item"><span>TVA</span><strong>${parseFloat(tarif.tva)||20}%</strong></div>
            ${tarif.fds ? `<div class="auth-tarif-item"><span>FDS (frais douaniers)</span><strong>200 MAD</strong></div>` : ''}
            <div class="auth-tarif-item"><span>Frais de recouvrement</span><strong>6%</strong></div>
            <div class="auth-tarif-item auth-tarif-note"><span>Chapitre SH</span><strong>${_esc(tarif.note)}</strong></div>
          </div>
          ${accord ? `
            <div class="auth-accord">
              <i class="fa-solid fa-handshake"></i>
              <strong>Accord préférentiel applicable :</strong> ${_esc(accord.name)}
              — <em>${_esc(accord.reduction)}</em>
              — Document : <strong>${_esc(accord.document)}</strong>
            </div>` : ''
          }
        </div>` : ''
      }
    </div>`;
  });

  return html;
}
