/* ═══════════════════════════════════════════════════
   GO PLUS EXPRESS — i18n Engine
   Languages: FR (default), AR, EN, ZH
   ═══════════════════════════════════════════════════ */

const TRANSLATIONS = {
fr:{
  nav_services:"Services", nav_sim:"Simulateurs", nav_track:"Tracking", nav_contact:"Contact", nav_ec:"Espace Client",
  hero_badge:"Logistics · Douane · Express · Maritime",
  hero_title:"Votre partenaire logistique<br/><span>vers le Maroc & le monde</span>",
  hero_sub:"Transport aérien, maritime, routier, express et dédouanement — tout en un seul portail intelligent.",
  hero_btn1:"Simuler un tarif", hero_btn2:"Tracker un envoi",
  stat1:"Pays desservis", stat2:"Ans d'expérience", stat3:"Support client", stat4:"Codes SH intégrés",
  svc_label:"NOS SERVICES", svc_title:"Solutions logistiques complètes",
  svc_sub:"De l'expéditeur au destinataire, nous gérons chaque étape de votre chaîne logistique.",
  svc1_title:"Transport Aérien", svc1_desc:"Express et fret général, départ Casablanca, Paris CDG, Amsterdam, Francfort.",
  svc1_f1:"✓ AWB door-to-door", svc1_f2:"✓ Consolidation & groupage", svc1_f3:"✓ Tracking temps réel",
  svc2_title:"Fret Maritime", svc2_desc:"FCL (20'/40') et LCL groupage — ports Casablanca, Tanger Med, Agadir.",
  svc2_f1:"✓ FCL 20' & 40'", svc2_f2:"✓ LCL groupage hebdo", svc2_f3:"✓ BL électronique",
  svc3_title:"Transport Routier", svc3_desc:"Groupage et complet (FTL) depuis toute l'Europe vers le Maroc.",
  svc3_f1:"✓ FTL & LTL", svc3_f2:"✓ Espagne, France, Italie, Benelux…", svc3_f3:"✓ TIR & CMR",
  svc4_title:"Express International", svc4_desc:"DHL, FedEx, Aramex — documents et colis partout dans le monde.",
  svc4_f1:"✓ Livraison J+1 à J+5", svc4_f2:"✓ Suivi temps réel", svc4_f3:"✓ Import & Export",
  svc5_title:"Entreposage & MEAD", svc5_desc:"Entrepôt sous douane (MEAD), stockage, préparation commandes.",
  svc5_f1:"✓ MEAD agréé", svc5_f2:"✓ WMS en ligne", svc5_f3:"✓ Cross-docking",
  svc6_title:"Dédouanement", svc6_desc:"Déclarations BADR, liquidation, régimes économiques, ATA Carnet.",
  svc6_f1:"✓ Import / Export / Transit", svc6_f2:"✓ Régimes suspensifs", svc6_f3:"✓ 13 135 codes SH maîtrisés",
  certif_iata:"Agent IATA Agréé", certif_iata_sub:"Licence IATA officielle",
  certif_express:"Expressiste Agréé", certif_express_sub:"Licence postale officielle",
  certif_mead:"Entrepôt MEAD", certif_mead_sub:"Sous douane agréé",
  certif_badr:"BADR Déclarant", certif_badr_sub:"Commissionnaire agréé",
  certif_oea:"Opérateur Agréé OEA", certif_oea_sub:"Opérateur Économique Agréé",
  certif_reseau:"Réseau International", certif_reseau_sub:"50+ pays — Partenaires certifiés",
  ecom_label:"E-COMMERCE TRANSFRONTALIER", ecom_title:"Solutions Cross-Border pour E-commercants",
  ecom_sub:"Nous gérons l'intégralité de la chaîne logistique internationale pour vos boutiques en ligne.",
  ecom1_t:"Import Express B2C", ecom1_d:"Réception de vos colis e-commerce import (Shein, Amazon, Alibaba…) avec dédouanement inclus.",
  ecom2_t:"Export International", ecom2_d:"Expédiez vos produits marocains vers l'Europe, les USA et l'Asie via nos partenaires express.",
  ecom3_t:"Dédouanement E-com", ecom3_d:"Traitement rapide des petits envois e-commerce avec valeur déclarée optimisée.",
  ecom4_t:"Fulfillment & Stockage", ecom4_d:"Réception, stockage, préparation et expédition de vos commandes depuis notre entrepôt.",
  ecom5_t:"API & Intégration", ecom5_d:"Connectez votre boutique (Shopify, WooCommerce…) à notre système de dispatch automatique.",
  ecom6_t:"Suivi Multi-Transporteur", ecom6_d:"Tableau de bord unifié pour suivre tous vos envois en temps réel.",
  sim_label:"SIMULATEURS INTELLIGENTS", sim_title:"Calculez vos coûts en temps réel",
  tab_customs:"🔏 Droits de Douane", tab_express:"✈ Express", tab_maritime:"🚢 Maritime FCL", tab_road:"🚛 Groupage Routier",
  cus_title:"Simulateur Droits & Taxes Import Maroc",
  cus_desc:"Recherchez par code SH (10 chiffres) ou décrivez votre produit — l'IA identifie le code correspondant.",
  hs_placeholder:"Ex: télévision 55 pouces LED, ou code 8528720000",
  btn_ai_search:"Recherche IA",
  lbl_hs:"Code SH sélectionné", lbl_cif:"Valeur CIF (MAD)", lbl_qty:"Quantité / Unité",
  lbl_di_rate:"Droit d'Importation (%)", lbl_vat:"TVA (%)", lbl_tic:"TIC (MAD/unité)",
  lbl_fds:"Taxe FDS (004801)", lbl_para:"Taxe Parafiscale (%)",
  res_title:"Liquidation estimée", res_cif:"Valeur CIF", res_di:"Droit d'Importation",
  res_tic:"TIC", res_fds:"Taxe FDS (004801)", res_para:"Parafiscale",
  res_vat_base:"Base TVA", res_vat:"TVA", res_total:"TOTAL TAXES", res_grand:"COÛT TOTAL IMPORT",
  tax_note:"⚠ Estimation indicative. Les taux réels peuvent varier selon l'origine et les accords de libre-échange.",
  fds_alert:"Ce produit est soumis à la taxe FDS (Code 004801 — Fonds de Développement Durable).",
  restricted_alert:"Attention : ce produit peut être soumis à des restrictions ou autorisations préalables au Maroc.",
  btn_print:"Télécharger le devis",
  exp_title:"Simulateur Express International",
  exp_desc:"Estimez le tarif DHL, FedEx ou Aramex pour vos envois documents et colis.",
  lbl_carrier:"Transporteur", lbl_ship_type:"Type d'envoi", lbl_service:"Service",
  lbl_origin:"Origine", lbl_dest:"Destination", lbl_weight:"Poids réel (kg)", lbl_dims:"Dimensions (cm) L × l × H",
  opt_doc:"Document", opt_parcel:"Colis", opt_express_svc:"Express (J+1/2)", opt_economy:"Economy (J+3/5)",
  exp_res_title:"Estimation Tarifaire",
  exp_real_w:"Poids réel", exp_vol_w:"Poids volumétrique", exp_taxable:"Poids taxable",
  exp_zone:"Zone tarifaire", exp_base:"Tarif de base", exp_fuel:"Surcharge carburant", exp_total:"TOTAL ESTIMÉ",
  exp_note:"Tarif indicatif HT. Surcharges variables. Contactez-nous pour un tarif contractuel.",
  mar_title:"Simulateur Maritime FCL",
  mar_desc:"Estimez le coût d'un conteneur 20' ou 40' vers les ports marocains.",
  lbl_pol:"Port de chargement (POL)", lbl_pod:"Port de déchargement (POD)", lbl_ctr:"Type de conteneur",
  lbl_cargo_val:"Valeur marchandise (USD)", lbl_inco:"Incoterm", lbl_cargo_type:"Type de marchandise",
  mar_res_title:"Estimation Maritime FCL",
  mar_ocean:"Fret Océan", mar_baf:"BAF (Surcharge carburant)", mar_thc_pol:"THC départ",
  mar_thc_pod:"THC arrivée", mar_doc:"Frais documentaires", mar_insurance:"Assurance (0.3%)",
  mar_total:"TOTAL ESTIMÉ", mar_transit:"Transit estimé",
  mar_note:"Tarif spot indicatif. Prix contractuels disponibles sur demande.",
  road_title:"Simulateur Groupage Routier Europe → Maroc",
  road_desc:"Estimez le tarif de groupage ou plein (FTL) depuis l'Europe vers le Maroc.",
  lbl_country_origin:"Pays d'origine", lbl_city_dest:"Ville de destination (Maroc)",
  lbl_road_type:"Type de transport", lbl_cbm:"Volume (m³)", lbl_road_weight:"Poids (kg)",
  lbl_road_goods:"Nature des marchandises",
  road_res_title:"Estimation Routier",
  road_base:"Tarif de base", road_customs_ma:"Formalités Douane Maroc",
  road_fuel:"Surcharge carburant", road_tir:"TIR / CMR", road_total:"TOTAL ESTIMÉ", road_transit:"Délai de transit",
  road_note:"Tarif indicatif. Inclut traversée ferry. Hors taxes marocaines à l'import.",
  track_label:"TRACKING TEMPS RÉEL", track_title:"Suivez votre envoi",
  track_sub:"AWB aérien, BL maritime, numéro express DHL / FedEx / Aramex",
  opt_auto:"Détection auto", track_placeholder:"Ex: 1234567890, JD0000123456...",
  btn_track:"Tracker",
  flight_track_title:"Tracking vols en temps réel",
  flight_track_desc:"Suivez le vol de votre fret aérien. Entrez le numéro de vol.",
  btn_flight:"Suivre le vol",
  contact_label:"CONTACT", contact_title:"Obtenez un devis",
  lbl_phone:"Téléphone", lbl_name:"Nom complet", lbl_company:"Société",
  lbl_service_req:"Service requis", lbl_message:"Message",
  opt_air:"Transport Aérien", opt_sea:"Transport Maritime", opt_road2:"Transport Routier",
  opt_express2:"Express", opt_customs2:"Dédouanement", opt_warehouse:"Entreposage",
  btn_send:"Envoyer la demande",
  footer_tagline:"Votre partenaire logistique global depuis le Maroc",
  footer_services:"Services", footer_tools:"Outils", footer_rights:"Tous droits réservés",
  nav_ecom:"E-commerce", nav_guides:"Guides",
  tab_export:"📤 Export Express", tab_packing:"📦 Chargement", tab_aircraft:"✈ Fret Cargo",
  ecom1_title:"Livraison Mondiale", ecom1_desc:"Expédiez vos commandes vers plus de 220 pays avec DHL, FedEx et Aramex. Délais J+1 à J+5 pour l'Europe.",
  ecom2_title:"Fulfillment & Préparation", ecom2_desc:"Stockage, picking, packing depuis notre entrepôt MEAD agréé à Casablanca.",
  ecom3_title:"Dédouanement E-commerce", ecom3_desc:"Déclarations BADR simplifiées, gestion des minimis, TVA import et taxes parafiscales.",
  ecom4_title:"Intégrations Plateformes", ecom4_desc:"API compatible Shopify, WooCommerce, PrestaShop, Magento.",
  ecom5_title:"Conformité & Réglementation", ecom5_desc:"Gestion de la conformité douanière et des restrictions produits par pays.",
  ecom6_title:"Gestion des Retours", ecom6_desc:"Reverse logistics : retour client, contrôle qualité, remise en stock.",
  ecom_cta_title:"Prêt à lancer votre e-commerce transfrontalier ?",
  ecom_cta_sub:"Bénéficiez de notre licence Expressiste et de notre agrément IATA.",
  ecom_cta_btn:"Démarrer maintenant",
  pack_title:"Calculateur de Chargement", pack_desc:"Calculez le nombre de palettes et de conteneurs/camions pour votre packing list.",
  aircraft_title:"Avions Cargo — Caractéristiques Techniques", aircraft_desc:"Référence technique des principaux appareils cargo utilisés sur les routes internationales.",
  trackDisclaimer:"Données à titre indicatif. Consultez le site officiel du transporteur pour un suivi en temps réel.",
  trackSearching:"Recherche en cours…", trackNotFound:"Envoi introuvable.",
  trackUnknown:"Numéro non reconnu. Vérifiez le format.", trackVerify:"Vérifier sur le site officiel",
  formRequired:"Veuillez remplir tous les champs obligatoires.", formEmailInvalid:"Adresse email invalide.", formSent:"Message envoyé avec succès !",
},

en:{
  nav_services:"Services", nav_sim:"Simulators", nav_track:"Tracking", nav_contact:"Contact", nav_ec:"Client Area",
  hero_badge:"Logistics · Customs · Express · Maritime",
  hero_title:"Your logistics partner<br/><span>to Morocco & worldwide</span>",
  hero_sub:"Air, sea, road, express freight and customs clearance — all in one smart portal.",
  hero_btn1:"Get a quote", hero_btn2:"Track a shipment",
  stat1:"Countries served", stat2:"Years of experience", stat3:"Customer support", stat4:"HS codes integrated",
  svc_label:"OUR SERVICES", svc_title:"Complete logistics solutions",
  svc_sub:"From shipper to consignee, we manage every step of your supply chain.",
  svc1_title:"Air Freight", svc1_desc:"Express and general cargo from Casablanca, Paris CDG, Amsterdam, Frankfurt.",
  svc1_f1:"✓ AWB door-to-door", svc1_f2:"✓ Consolidation & groupage", svc1_f3:"✓ Real-time tracking",
  svc2_title:"Sea Freight", svc2_desc:"FCL (20'/40') and LCL — Casablanca, Tanger Med, Agadir.",
  svc2_f1:"✓ FCL 20' & 40'", svc2_f2:"✓ Weekly LCL groupage", svc2_f3:"✓ Electronic BL",
  svc3_title:"Road Transport", svc3_desc:"LTL groupage and FTL from all Europe to Morocco.",
  svc3_f1:"✓ FTL & LTL", svc3_f2:"✓ Spain, France, Italy, Benelux…", svc3_f3:"✓ TIR & CMR",
  svc4_title:"International Express", svc4_desc:"DHL, FedEx, Aramex — documents and parcels worldwide.",
  svc4_f1:"✓ Delivery D+1 to D+5", svc4_f2:"✓ Real-time tracking", svc4_f3:"✓ Import & Export",
  svc5_title:"Warehousing & MEAD", svc5_desc:"Bonded warehouse (MEAD), storage, order preparation.",
  svc5_f1:"✓ Approved MEAD", svc5_f2:"✓ Online WMS", svc5_f3:"✓ Cross-docking",
  svc6_title:"Customs Clearance", svc6_desc:"BADR declarations, liquidation, economic regimes, ATA Carnet.",
  svc6_f1:"✓ Import / Export / Transit", svc6_f2:"✓ Suspensive regimes", svc6_f3:"✓ 13,135 HS codes mastered",
  certif_iata:"IATA Approved Agent", certif_iata_sub:"Official IATA license",
  certif_express:"Approved Expressiste", certif_express_sub:"Official postal license",
  certif_mead:"MEAD Warehouse", certif_mead_sub:"Approved bonded warehouse",
  certif_badr:"BADR Declarant", certif_badr_sub:"Approved customs broker",
  certif_oea:"AEO Approved Operator", certif_oea_sub:"Authorized Economic Operator",
  certif_reseau:"International Network", certif_reseau_sub:"50+ countries — Certified partners",
  ecom_label:"CROSS-BORDER E-COMMERCE", ecom_title:"Solutions for E-commerce Merchants",
  ecom_sub:"We manage the entire international logistics chain for your online stores.",
  ecom1_t:"B2C Express Import", ecom1_d:"Reception of your e-commerce import parcels with customs clearance included.",
  ecom2_t:"International Export", ecom2_d:"Ship your Moroccan products to Europe, USA and Asia.",
  ecom3_t:"E-com Customs Clearance", ecom3_d:"Fast processing of small e-commerce shipments.",
  ecom4_t:"Fulfillment & Storage", ecom4_d:"Reception, storage, preparation and dispatch from our warehouse.",
  ecom5_t:"API & Integration", ecom5_d:"Connect your store (Shopify, WooCommerce…) to our dispatch system.",
  ecom6_t:"Multi-Carrier Tracking", ecom6_d:"Unified dashboard to track all your shipments in real time.",
  sim_label:"SMART SIMULATORS", sim_title:"Calculate your costs in real time",
  tab_customs:"🔏 Customs Duties", tab_express:"✈ Express", tab_maritime:"🚢 Maritime FCL", tab_road:"🚛 Road Groupage",
  cus_title:"Morocco Import Duties & Taxes Simulator",
  cus_desc:"Search by HS code (10 digits) or describe your product — AI identifies the corresponding code.",
  hs_placeholder:"E.g: 55-inch LED TV, or code 8528720000",
  btn_ai_search:"AI Search",
  lbl_hs:"Selected HS Code", lbl_cif:"CIF Value (MAD)", lbl_qty:"Quantity / Unit",
  lbl_di_rate:"Import Duty (%)", lbl_vat:"VAT (%)", lbl_tic:"TIC (MAD/unit)",
  lbl_fds:"FDS Tax (004801)", lbl_para:"Parafiscal Tax (%)",
  res_title:"Estimated Liquidation", res_cif:"CIF Value", res_di:"Import Duty",
  res_tic:"TIC", res_fds:"FDS Tax (004801)", res_para:"Parafiscal",
  res_vat_base:"VAT Base", res_vat:"VAT", res_total:"TOTAL TAXES", res_grand:"TOTAL IMPORT COST",
  tax_note:"⚠ Indicative estimate. Actual rates may vary depending on origin and free trade agreements.",
  fds_alert:"This product is subject to the FDS tax (Code 004801 — Sustainable Development Fund).",
  restricted_alert:"Warning: this product may be subject to restrictions or prior authorizations in Morocco.",
  btn_print:"Download quote",
  exp_title:"International Express Simulator",
  exp_desc:"Estimate DHL, FedEx or Aramex rates for your document and parcel shipments.",
  lbl_carrier:"Carrier", lbl_ship_type:"Shipment type", lbl_service:"Service",
  lbl_origin:"Origin", lbl_dest:"Destination", lbl_weight:"Actual weight (kg)", lbl_dims:"Dimensions (cm) L × W × H",
  opt_doc:"Document", opt_parcel:"Parcel", opt_express_svc:"Express (D+1/2)", opt_economy:"Economy (D+3/5)",
  exp_res_title:"Rate Estimate",
  exp_real_w:"Actual weight", exp_vol_w:"Volumetric weight", exp_taxable:"Chargeable weight",
  exp_zone:"Rate zone", exp_base:"Base rate", exp_fuel:"Fuel surcharge", exp_total:"ESTIMATED TOTAL",
  exp_note:"Indicative rate excl. tax. Variable surcharges. Contact us for contract rates.",
  mar_title:"Maritime FCL Simulator",
  mar_desc:"Estimate the cost of a 20' or 40' container to Moroccan ports.",
  lbl_pol:"Port of loading (POL)", lbl_pod:"Port of discharge (POD)", lbl_ctr:"Container type",
  lbl_cargo_val:"Cargo value (USD)", lbl_inco:"Incoterm", lbl_cargo_type:"Cargo type",
  mar_res_title:"Maritime FCL Estimate",
  mar_ocean:"Ocean freight", mar_baf:"BAF (Fuel surcharge)", mar_thc_pol:"Origin THC",
  mar_thc_pod:"Destination THC", mar_doc:"Documentation fees", mar_insurance:"Insurance (0.3%)",
  mar_total:"ESTIMATED TOTAL", mar_transit:"Estimated transit",
  mar_note:"Indicative spot rate. Contract rates available on request.",
  road_title:"Road Groupage Simulator Europe → Morocco",
  road_desc:"Estimate groupage or FTL rates from Europe to Morocco.",
  lbl_country_origin:"Country of origin", lbl_city_dest:"Destination city (Morocco)",
  lbl_road_type:"Transport type", lbl_cbm:"Volume (m³)", lbl_road_weight:"Weight (kg)",
  lbl_road_goods:"Cargo nature",
  road_res_title:"Road Estimate",
  road_base:"Base rate", road_customs_ma:"Morocco Customs fees",
  road_fuel:"Fuel surcharge", road_tir:"TIR / CMR", road_total:"ESTIMATED TOTAL", road_transit:"Transit time",
  road_note:"Indicative rate. Includes ferry crossing. Excludes Moroccan import duties.",
  track_label:"REAL-TIME TRACKING", track_title:"Track your shipment",
  track_sub:"Air AWB, Sea BL, Express tracking: DHL / FedEx / Aramex",
  opt_auto:"Auto detect", track_placeholder:"E.g: 1234567890, JD0000123456...",
  btn_track:"Track",
  flight_track_title:"Real-time flight tracking",
  flight_track_desc:"Track your air cargo flight. Enter the flight number.",
  btn_flight:"Track flight",
  contact_label:"CONTACT", contact_title:"Get a quote",
  lbl_phone:"Phone", lbl_name:"Full name", lbl_company:"Company",
  lbl_service_req:"Service required", lbl_message:"Message",
  btn_send:"Send request",
  footer_tagline:"Your global logistics partner from Morocco",
  footer_services:"Services", footer_tools:"Tools", footer_rights:"All rights reserved",
  nav_ecom:"E-commerce", nav_guides:"Guides",
  tab_export:"📤 Export Express", tab_packing:"📦 Loading", tab_aircraft:"✈ Air Freight",
  ecom1_title:"Worldwide Delivery", ecom1_desc:"Ship your orders to 220+ countries with DHL, FedEx and Aramex. D+1 to D+5 for Europe.",
  ecom2_title:"Fulfillment & Preparation", ecom2_desc:"Storage, picking, packing from our approved MEAD warehouse in Casablanca.",
  ecom3_title:"E-commerce Customs", ecom3_desc:"Simplified BADR declarations, de minimis management, import VAT and parafiscal taxes.",
  ecom4_title:"Platform Integrations", ecom4_desc:"API compatible with Shopify, WooCommerce, PrestaShop, Magento.",
  ecom5_title:"Compliance & Regulations", ecom5_desc:"Customs compliance management and product restrictions per destination country.",
  ecom6_title:"Returns Management", ecom6_desc:"Reverse logistics: returns, quality control, restocking.",
  ecom_cta_title:"Ready to launch your cross-border e-commerce?",
  ecom_cta_sub:"Benefit from our Expressiste license and IATA approval.",
  ecom_cta_btn:"Get started now",
  pack_title:"Loading Calculator", pack_desc:"Calculate the number of pallets and containers/trucks needed for your packing list.",
  aircraft_title:"Cargo Aircraft — Technical Specifications", aircraft_desc:"Technical reference for the main cargo aircraft used on international routes.",
  trackDisclaimer:"Indicative data only. Check the official carrier website for real-time tracking.",
  trackSearching:"Searching…", trackNotFound:"Shipment not found.",
  trackUnknown:"Unrecognized number. Please check the format.", trackVerify:"Verify on official website",
  formRequired:"Please fill in all required fields.", formEmailInvalid:"Invalid email address.", formSent:"Message sent successfully!",
},

ar:{
  nav_services:"الخدمات", nav_sim:"المحاكيات", nav_track:"التتبع", nav_contact:"اتصل بنا", nav_ec:"فضاء العميل",
  hero_badge:"لوجستيك · جمارك · إكسبريس · بحري",
  hero_title:"شريككم اللوجستي<br/><span>نحو المغرب والعالم</span>",
  hero_sub:"شحن جوي، بحري، بري، إكسبريس وتخليص جمركي — كل ذلك في منصة ذكية واحدة.",
  hero_btn1:"احسب التعرفة", hero_btn2:"تتبع شحنتك",
  stat1:"دولة نخدمها", stat2:"سنوات خبرة", stat3:"دعم على مدار الساعة", stat4:"رمز جمركي مدمج",
  svc_label:"خدماتنا", svc_title:"حلول لوجستية متكاملة",
  svc_sub:"من المرسل إلى المستلم، ندير كل خطوة في سلسلة التوريد الخاصة بكم.",
  svc1_title:"الشحن الجوي", svc1_desc:"إكسبريس وشحن عام من الدار البيضاء وباريس وأمستردام وفرانكفورت.",
  svc1_f1:"✓ AWB من الباب إلى الباب", svc1_f2:"✓ توحيد الشحنات", svc1_f3:"✓ تتبع فوري",
  svc2_title:"الشحن البحري", svc2_desc:"FCL (20'/40') و LCL — الدار البيضاء، طنجة ميد، أكادير.",
  svc2_f1:"✓ FCL 20' و 40'", svc2_f2:"✓ LCL أسبوعي", svc2_f3:"✓ بوليصة إلكترونية",
  svc3_title:"الشحن البري", svc3_desc:"تجميع وشحن كامل من أوروبا إلى المغرب.",
  svc3_f1:"✓ FTL و LTL", svc3_f2:"✓ إسبانيا، فرنسا، إيطاليا، بنيلوكس...", svc3_f3:"✓ TIR و CMR",
  svc4_title:"الإكسبريس الدولي", svc4_desc:"DHL، FedEx، Aramex — وثائق وطرود في كل أنحاء العالم.",
  svc4_f1:"✓ تسليم من يوم إلى 5 أيام", svc4_f2:"✓ تتبع في الوقت الفعلي", svc4_f3:"✓ استيراد وتصدير",
  svc5_title:"التخزين والمستودع الجمركي", svc5_desc:"مستودع جمركي (MEAD)، تخزين، تحضير الطلبيات.",
  svc5_f1:"✓ MEAD معتمد", svc5_f2:"✓ WMS إلكتروني", svc5_f3:"✓ Cross-docking",
  svc6_title:"التخليص الجمركي", svc6_desc:"تصاريح BADR، التصفية، الأنظمة الاقتصادية، ATA Carnet.",
  svc6_f1:"✓ استيراد / تصدير / عبور", svc6_f2:"✓ أنظمة تعليق الرسوم", svc6_f3:"✓ إتقان 13,135 رمز جمركي",
  certif_iata:"وكيل IATA معتمد", certif_iata_sub:"ترخيص IATA رسمي",
  certif_express:"Expressiste معتمد", certif_express_sub:"ترخيص بريدي رسمي",
  certif_mead:"مستودع MEAD", certif_mead_sub:"مستودع جمركي معتمد",
  certif_badr:"مصرح BADR", certif_badr_sub:"وكيل جمركي معتمد",
  certif_oea:"مشغل اقتصادي معتمد", certif_oea_sub:"OEA — مشغل اقتصادي معتمد",
  certif_reseau:"شبكة دولية", certif_reseau_sub:"50+ دولة — شركاء معتمدون",
  ecom_label:"التجارة الإلكترونية العابرة للحدود", ecom_title:"حلول للتجارة الإلكترونية الدولية",
  ecom_sub:"ندير سلسلة اللوجستيك الدولية بالكامل لمتاجركم الإلكترونية.",
  ecom1_t:"استيراد إكسبريس B2C", ecom1_d:"استقبال طرود التجارة الإلكترونية مع التخليص الجمركي.",
  ecom2_t:"تصدير دولي", ecom2_d:"شحن منتجاتكم المغربية إلى أوروبا وأمريكا وآسيا.",
  ecom3_t:"تخليص جمركي إلكتروني", ecom3_d:"معالجة سريعة للطرود الصغيرة.",
  ecom4_t:"التخزين والتوزيع", ecom4_d:"استقبال، تخزين، تحضير وإرسال طلباتكم.",
  ecom5_t:"API والتكامل", ecom5_d:"ربط متجركم بنظام التوزيع التلقائي.",
  ecom6_t:"تتبع متعدد الناقلين", ecom6_d:"لوحة قيادة موحدة لتتبع جميع شحناتكم.",
  sim_label:"محاكيات ذكية", sim_title:"احسب تكاليفك في الوقت الفعلي",
  tab_customs:"🔏 الرسوم الجمركية", tab_express:"✈ إكسبريس", tab_maritime:"🚢 بحري FCL", tab_road:"🚛 شحن بري جماعي",
  cus_title:"محاكي الرسوم والضرائب الجمركية - الاستيراد إلى المغرب",
  cus_desc:"ابحث برمز HS (10 أرقام) أو صف منتجك — الذكاء الاصطناعي يحدد الرمز المناسب.",
  hs_placeholder:"مثال: تلفزيون 55 بوصة LED، أو رمز 8528720000",
  btn_ai_search:"بحث ذكي",
  lbl_hs:"رمز HS المحدد", lbl_cif:"القيمة CIF (درهم)", lbl_qty:"الكمية / الوحدة",
  lbl_di_rate:"رسم الاستيراد (%)", lbl_vat:"ضريبة القيمة المضافة (%)", lbl_tic:"TIC (درهم/وحدة)",
  lbl_fds:"ضريبة FDS (004801)", lbl_para:"الضريبة الشبه جبائية (%)",
  res_title:"التصفية التقديرية", res_cif:"القيمة CIF", res_di:"رسم الاستيراد",
  res_tic:"TIC", res_fds:"ضريبة FDS (004801)", res_para:"شبه جبائية",
  res_vat_base:"وعاء الضريبة", res_vat:"ضريبة القيمة المضافة", res_total:"مجموع الضرائب", res_grand:"التكلفة الإجمالية للاستيراد",
  tax_note:"⚠ تقدير إرشادي. قد تختلف المعدلات الفعلية حسب بلد المنشأ واتفاقيات التبادل الحر.",
  btn_print:"تحميل العرض",
  track_label:"التتبع في الوقت الفعلي", track_title:"تتبع شحنتك",
  track_sub:"AWB جوي، BL بحري، رقم إكسبريس DHL / FedEx / Aramex",
  opt_auto:"اكتشاف تلقائي", track_placeholder:"مثال: 1234567890...",
  btn_track:"تتبع",
  contact_label:"اتصل بنا", contact_title:"احصل على عرض سعر",
  lbl_phone:"الهاتف", lbl_name:"الاسم الكامل", lbl_company:"الشركة",
  lbl_service_req:"الخدمة المطلوبة", lbl_message:"الرسالة",
  btn_send:"إرسال الطلب",
  footer_tagline:"شريككم اللوجستي العالمي من المغرب",
  footer_services:"الخدمات", footer_tools:"الأدوات", footer_rights:"جميع الحقوق محفوظة",
  nav_ecom:"التجارة الإلكترونية", nav_guides:"الأدلة",
  tab_export:"📤 تصدير إكسبريس", tab_packing:"📦 التحميل", tab_aircraft:"✈ شحن جوي",
  ecom1_title:"التوصيل العالمي", ecom1_desc:"أرسل طلباتك إلى أكثر من 220 دولة عبر DHL وFedEx وAramex.",
  ecom2_title:"التخزين والتحضير", ecom2_desc:"تخزين، تقطيع وتعبئة من مستودعنا المعتمد MEAD بالدار البيضاء.",
  ecom3_title:"الجمارك الإلكترونية", ecom3_desc:"تصاريح BADR مبسطة، إدارة الحد الأدنى، ضريبة الاستيراد.",
  ecom4_title:"تكامل المنصات", ecom4_desc:"API متوافق مع Shopify وWooCommerce وPrestaShop وMagento.",
  ecom5_title:"الامتثال والتنظيم", ecom5_desc:"إدارة الامتثال الجمركي وقيود المنتجات لكل دولة.",
  ecom6_title:"إدارة المرتجعات", ecom6_desc:"لوجستيك عكسي: مرتجعات العملاء، مراقبة الجودة، إعادة التخزين.",
  ecom_cta_title:"هل أنتم مستعدون لإطلاق تجارتكم الإلكترونية العابرة للحدود؟",
  ecom_cta_sub:"استفيدوا من ترخيص Expressiste واعتماد IATA لدينا.",
  ecom_cta_btn:"ابدأ الآن",
  pack_title:"حاسبة التحميل", pack_desc:"احسب عدد المنصات والحاويات/الشاحنات اللازمة لقائمة التعبئة.",
  aircraft_title:"طائرات الشحن — المواصفات التقنية", aircraft_desc:"مرجع تقني لأبرز طائرات الشحن المستخدمة في الرحلات الدولية.",
  trackDisclaimer:"بيانات إرشادية فقط. تحقق من الموقع الرسمي للناقل للتتبع الفوري.",
  trackSearching:"جارٍ البحث…", trackNotFound:"الشحنة غير موجودة.",
  trackUnknown:"رقم غير معروف. يرجى التحقق من الصيغة.", trackVerify:"التحقق من الموقع الرسمي",
  formRequired:"يرجى ملء جميع الحقول المطلوبة.", formEmailInvalid:"بريد إلكتروني غير صالح.", formSent:"تم إرسال الرسالة بنجاح!",
},

zh:{
  nav_services:"服务", nav_sim:"模拟器", nav_track:"追踪", nav_contact:"联系我们", nav_ec:"客户空间",
  hero_badge:"物流 · 清关 · 快递 · 海运",
  hero_title:"您的物流合作伙伴<br/><span>通往摩洛哥及全球</span>",
  hero_sub:"空运、海运、陆运、快递及清关服务 — 尽在一个智能平台。",
  hero_btn1:"获取报价", hero_btn2:"追踪货物",
  stat1:"服务国家", stat2:"年经验", stat3:"全天候支持", stat4:"个HS编码",
  svc_label:"我们的服务", svc_title:"完整的物流解决方案",
  svc_sub:"从发货方到收货方，我们管理您供应链的每个环节。",
  svc1_title:"空运", svc1_desc:"快递及普通货运，从卡萨布兰卡、巴黎CDG、阿姆斯特丹、法兰克福出发。",
  svc1_f1:"✓ AWB门到门", svc1_f2:"✓ 拼箱整合", svc1_f3:"✓ 实时追踪",
  svc2_title:"海运", svc2_desc:"FCL（20'/40'）和LCL拼箱 — 卡萨布兰卡、丹吉尔Med、阿加迪尔。",
  svc2_f1:"✓ FCL 20' & 40'", svc2_f2:"✓ 每周LCL拼箱", svc2_f3:"✓ 电子提单",
  svc3_title:"陆运", svc3_desc:"从欧洲各地到摩洛哥的拼箱和整车运输。",
  svc3_f1:"✓ FTL & LTL", svc3_f2:"✓ 西班牙、法国、意大利、比荷卢...", svc3_f3:"✓ TIR & CMR",
  svc4_title:"国际快递", svc4_desc:"DHL、FedEx、Aramex — 文件和包裹全球配送。",
  svc4_f1:"✓ 1-5天送达", svc4_f2:"✓ 实时追踪", svc4_f3:"✓ 进出口",
  svc5_title:"仓储与MEAD", svc5_desc:"保税仓库（MEAD）、存储、订单准备。",
  svc5_f1:"✓ 获批MEAD", svc5_f2:"✓ 在线WMS", svc5_f3:"✓ 越库操作",
  svc6_title:"清关", svc6_desc:"BADR申报、清算、经济制度、ATA单证册。",
  svc6_f1:"✓ 进口/出口/过境", svc6_f2:"✓ 暂停制度", svc6_f3:"✓ 掌握13,135个HS编码",
  certif_iata:"IATA认证代理", certif_iata_sub:"官方IATA许可证",
  certif_express:"认证快递商", certif_express_sub:"官方邮政许可证",
  certif_mead:"MEAD仓库", certif_mead_sub:"已批准保税仓库",
  certif_badr:"BADR申报人", certif_badr_sub:"认证报关行",
  certif_oea:"AEO认证运营商", certif_oea_sub:"授权经济运营商",
  certif_reseau:"国际网络", certif_reseau_sub:"50+国家 — 认证合作伙伴",
  ecom_label:"跨境电商", ecom_title:"跨境电商物流解决方案",
  ecom_sub:"我们为您的网上商店管理完整的国际物流链。",
  ecom1_t:"B2C快递进口", ecom1_d:"接收您的电商进口包裹，含清关服务。",
  ecom2_t:"国际出口", ecom2_d:"将您的摩洛哥产品运往欧洲、美国和亚洲。",
  ecom3_t:"电商清关", ecom3_d:"快速处理小批量电商货物。",
  ecom4_t:"仓储与配送", ecom4_d:"接收、存储、准备和发货服务。",
  ecom5_t:"API集成", ecom5_d:"连接您的商店（Shopify、WooCommerce…）到我们的配送系统。",
  ecom6_t:"多承运商追踪", ecom6_d:"统一仪表板实时追踪所有货物。",
  sim_label:"智能模拟器", sim_title:"实时计算您的费用",
  tab_customs:"🔏 关税", tab_express:"✈ 快递", tab_maritime:"🚢 整箱海运", tab_road:"🚛 公路拼箱",
  cus_title:"摩洛哥进口关税及税费模拟器",
  cus_desc:"按HS编码（10位）搜索或描述您的产品 — AI识别对应编码。",
  hs_placeholder:"例如：55英寸LED电视，或编码 8528720000",
  btn_ai_search:"AI搜索",
  lbl_hs:"已选HS编码", lbl_cif:"CIF价值（迪拉姆）", lbl_qty:"数量/单位",
  lbl_di_rate:"进口税率（%）", lbl_vat:"增值税（%）", lbl_tic:"TIC（迪拉姆/单位）",
  lbl_fds:"FDS税（004801）", lbl_para:"准财政税（%）",
  res_title:"预估清算", res_cif:"CIF价值", res_di:"进口税",
  res_tic:"TIC", res_fds:"FDS税（004801）", res_para:"准财政税",
  res_vat_base:"增值税基数", res_vat:"增值税", res_total:"税费总计", res_grand:"进口总成本",
  tax_note:"⚠ 仅供参考。实际税率可能因原产地和自由贸易协定而有所不同。",
  btn_print:"下载报价单",
  exp_title:"国际快递模拟器",
  exp_desc:"估算DHL、FedEx或Aramex的文件和包裹运费。",
  lbl_carrier:"承运商", lbl_ship_type:"货物类型", lbl_service:"服务",
  lbl_origin:"出发地", lbl_dest:"目的地", lbl_weight:"实际重量（kg）", lbl_dims:"尺寸（cm）长×宽×高",
  opt_doc:"文件", opt_parcel:"包裹", opt_express_svc:"快递（D+1/2）", opt_economy:"经济（D+3/5）",
  exp_res_title:"运费估算",
  exp_real_w:"实际重量", exp_vol_w:"体积重量", exp_taxable:"计费重量",
  exp_zone:"价格区域", exp_base:"基本运费", exp_fuel:"燃油附加费", exp_total:"预估总计",
  exp_note:"含税参考价。附加费用变动。请联系我们获取合同价格。",
  mar_title:"整箱海运模拟器", mar_desc:"估算20'或40'集装箱到摩洛哥港口的费用。",
  lbl_pol:"装货港（POL）", lbl_pod:"卸货港（POD）", lbl_ctr:"集装箱类型",
  lbl_cargo_val:"货物价值（美元）", lbl_inco:"贸易术语", lbl_cargo_type:"货物类型",
  mar_res_title:"整箱海运估算",
  mar_ocean:"海运费", mar_baf:"BAF（燃油附加费）", mar_thc_pol:"起运港THC",
  mar_thc_pod:"目的港THC", mar_doc:"单证费", mar_insurance:"保险（0.3%）",
  mar_total:"预估总计", mar_transit:"预计运输时间",
  mar_note:"现货参考价格。合同价格需询价。",
  road_title:"欧洲→摩洛哥公路拼箱模拟器",
  road_desc:"估算从欧洲到摩洛哥的拼箱或整车运费。",
  lbl_country_origin:"原产国", lbl_city_dest:"目的城市（摩洛哥）",
  lbl_road_type:"运输类型", lbl_cbm:"体积（m³）", lbl_road_weight:"重量（kg）",
  lbl_road_goods:"货物性质",
  road_res_title:"公路运费估算",
  road_base:"基本运费", road_customs_ma:"摩洛哥海关手续费",
  road_fuel:"燃油附加费", road_tir:"TIR / CMR", road_total:"预估总计", road_transit:"运输时间",
  road_note:"参考价格，包含渡轮。不含摩洛哥进口税。",
  track_label:"实时追踪", track_title:"追踪您的货物",
  track_sub:"空运AWB、海运BL、快递号DHL / FedEx / Aramex",
  opt_auto:"自动识别", track_placeholder:"例如：1234567890...",
  btn_track:"追踪",
  flight_track_title:"实时航班追踪",
  flight_track_desc:"追踪您的空运航班。输入航班号。",
  btn_flight:"追踪航班",
  contact_label:"联系我们", contact_title:"获取报价",
  lbl_phone:"电话", lbl_name:"全名", lbl_company:"公司",
  lbl_service_req:"所需服务", lbl_message:"留言",
  btn_send:"发送请求",
  footer_tagline:"您在摩洛哥的全球物流合作伙伴",
  footer_services:"服务", footer_tools:"工具", footer_rights:"保留所有权利",
  nav_ecom:"跨境电商", nav_guides:"指南",
  tab_export:"📤 出口快递", tab_packing:"📦 装载计算", tab_aircraft:"✈ 航空货运",
  ecom1_title:"全球配送", ecom1_desc:"通过DHL、FedEx和Aramex向220多个国家发货，欧洲D+1至D+5。",
  ecom2_title:"仓储与备货", ecom2_desc:"在卡萨布兰卡的MEAD认证仓库进行存储、拣货和包装。",
  ecom3_title:"电商清关", ecom3_desc:"简化BADR申报，管理起征点、进口增值税和准财政税。",
  ecom4_title:"平台集成", ecom4_desc:"API兼容Shopify、WooCommerce、PrestaShop、Magento。",
  ecom5_title:"合规与法规", ecom5_desc:"管理每个目的地国家的海关合规和产品限制。",
  ecom6_title:"退货管理", ecom6_desc:"逆向物流：客户退货、质量控制、重新入库。",
  ecom_cta_title:"准备好启动您的跨境电商了吗？",
  ecom_cta_sub:"享受我们的Expressiste许可证和IATA资质。",
  ecom_cta_btn:"立即开始",
  pack_title:"装载计算器", pack_desc:"计算您的装箱单所需托盘和集装箱/卡车数量。",
  aircraft_title:"货运飞机 — 技术规格", aircraft_desc:"国际航线主要货运飞机技术参考。",
  trackDisclaimer:"仅供参考数据。请访问承运商官方网站进行实时追踪。",
  trackSearching:"搜索中…", trackNotFound:"未找到货物。",
  trackUnknown:"号码无法识别，请检查格式。", trackVerify:"在官网验证",
  formRequired:"请填写所有必填字段。", formEmailInvalid:"电子邮件地址无效。", formSent:"消息发送成功！",
}
};

/* ── Active language ── */
let currentLang = 'fr';

function setLang(lang){
  currentLang = lang;
  const isRTL = (lang === 'ar');
  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.body.style.fontFamily = isRTL ? "'Cairo',sans-serif" : "'Inter',sans-serif";

  // update active button
  ['fr','ar','en','zh'].forEach(l=>{
    const btn = document.getElementById('btn-'+l);
    if(btn) btn.classList.toggle('active', l===lang);
  });

  // apply translations
  const T = TRANSLATIONS[lang] || TRANSLATIONS['fr'];
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(T[key] !== undefined) el.innerHTML = T[key];
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
    const key = el.getAttribute('data-i18n-ph');
    if(T[key] !== undefined) el.placeholder = T[key];
  });

  // update HS search placeholder
  const hsInput = document.getElementById('hsSearchInput');
  if(hsInput && T['hs_placeholder']) hsInput.placeholder = T['hs_placeholder'];

  // Re-appliquer les surcharges CMS après chaque changement de langue
  if(typeof window.cmsApply === 'function') setTimeout(window.cmsApply, 50);
}

function t(key){
  const T = TRANSLATIONS[currentLang] || TRANSLATIONS['fr'];
  return T[key] || TRANSLATIONS['fr'][key] || key;
}

/* ── AI-powered HS description search ── */
// Uses multilingual keywords to match HS descriptions
const AI_KEYWORDS = {
  // ── Électronique / Electronics ──
  'tv|télé|television|تلفزيون|تلفاز|شاشة تلفزيون': '8528',
  'téléphone|phone|mobile|smartphone|هاتف|جوال|موبايل|هاتف ذكي': '8517',
  'ordinateur|computer|laptop|حاسوب|كمبيوتر|لابتوب|حاسب': '8471',
  'tablette|tablet|تابلت|لوح إلكتروني': '8471',
  'écouteur|casque audio|headphone|سماعة|سماعات': '8518',
  'imprimante|printer|طابعة': '8443',
  'appareil photo|camera|كاميرا|آلة تصوير': '8525',
  'réfrigérateur|frigo|ثلاجة|براد': '8418',
  'machine à laver|lave-linge|غسالة|آلة غسيل': '8450',
  'climatiseur|clim|air conditionné|مكيف|تكييف': '8415',
  'four|microonde|micro-onde|فرن|ميكروويف': '8516',
  'aspirateur|مكنسة كهربائية': '8508',
  'batterie|pile|battery|بطارية|مراكم': '8507',
  'panneau solaire|solar panel|لوح شمسي|طاقة شمسية': '8541',
  // ── Vêtements / Clothing ──
  'pantalon|بنطال|بنطلون|سروال': '6103|6104|6203|6204',
  'chemise|shirt|قميص|كيميزة': '6205|6206',
  'robe|فستان|ثوب نسائي': '6104|6204',
  'veste|jacket|جاكيت|سترة': '6101|6102|6201|6202',
  'manteau|coat|معطف|جلابة': '6201|6202',
  'sous-vêtement|lingerie|ملابس داخلية': '6107|6108|6212',
  'pull|tricot|chandail|بلوزة|سويتر': '6110',
  'tshirt|t-shirt|تيشيرت|تيشرت': '6109',
  'jean|جينز|بنطال جينز': '6203',
  'vêtement|habit|clothing|ملابس|لباس|أثواب': '61|62|63',
  'chaussure|shoe|footwear|حذاء|أحذية|صندل': '6401|6402|6403|6404|6405',
  // ── Alimentation / Food ──
  'viande|meat|لحم|لحوم': '0201|0202|0203|0204|0207',
  'poisson|fish|سمك|أسماك': '0301|0302|0303|0304|0305',
  'lait|milk|حليب|ألبان': '0401|0402|0403|0404',
  'fromage|cheese|جبن|جبنة': '0406',
  'farine|flour|دقيق|طحين': '1101|1102|1103',
  'sucre|sugar|سكر': '1701|1702',
  'huile|oil|زيت|زيوت': '1507|1508|1509|1510|1511|1512|1513|1514|1515',
  'café|coffee|قهوة': '0901',
  'thé|tea|شاي': '0902',
  'épice|spice|بهار|توابل': '0904|0905|0906|0907|0908|0909|0910',
  'chocolat|chocolate|شوكولاتة|شوكولا': '1801|1802|1803|1804|1805|1806',
  'biscuit|gâteau|حلوى|بسكويت|كيك': '1905',
  'conserve|canned|معلبات|مواد معلبة': '1601|1602|2001|2002',
  'eau|water|ماء|مياه': '2201|2202',
  'jus|juice|عصير': '2009',
  'aliment|food|غذاء|مواد غذائية': '02|03|04|07|08|09|10|11|16|17|18|19|20|21',
  // ── Automobile / Auto ──
  'voiture|car|automobile|سيارة|عربة': '8703',
  'pièce voiture|auto part|قطعة سيارة|قطع غيار': '8708',
  'pneu|tyre|tire|إطار|إطارات|كاوتشو': '4011|4012',
  'moteur|engine|محرك|موتور': '8407|8408',
  // ── Cosmétiques / Beauty ──
  'parfum|perfume|عطر|عطور|بخور': '3303',
  'crème|cream|كريم|مرهم': '3304',
  'shampoing|shampoo|شامبو': '3305',
  'maquillage|makeup|cosmétique|مكياج|مستحضرات تجميل': '3303|3304|3305|3306',
  'savon|soap|صابون': '3401',
  // ── Matériaux / Materials ──
  'acier|steel|fer|حديد|صلب|فولاذ': '7201|7208|7209|7210|7213|7214|7216',
  'aluminium|aluminum|ألومنيوم': '7601|7602|7604|7605|7606|7607|7608|7610',
  'bois|wood|خشب|أخشاب': '4407|4408|4409|4410|4418',
  'verre|glass|زجاج|كريستال': '7005|7006|7007',
  'plastique|plastic|بلاستيك|مواد بلاستيكية': '3901|3916|3917|3918|3919|3920|3921|3922|3923|3924|3925|3926',
  'ciment|cement|إسمنت|أسمنت': '2523',
  'marbre|marble|رخام': '2515',
  // ── Mobilier / Furniture ──
  'meuble|furniture|أثاث|أثاثات': '9401|9402|9403|9404',
  'matelas|mattress|مرتبة|فرشة': '9404',
  'canapé|sofa|أريكة|كنبة': '9401',
  'chaise|chair|كرسي': '9401',
  'table|طاولة|منضدة': '9403',
  // ── Jouets / Toys ──
  'jouet|toy|لعبة|ألعاب': '9501|9502|9503|9504|9505',
  // ── Médicaments / Pharma ──
  'médicament|medicine|pharmaceutical|دواء|أدوية|علاج': '3001|3002|3003|3004',
  'masque|mask|كمامة|قناع': '6307|9020',
  // ── Divers ──
  'bijou|jewel|مجوهرات|ذهب|فضة': '7113|7114|7115|7116',
  'montre|watch|ساعة|ساعات': '9101|9102|9103',
  'livre|book|كتاب|كتب': '4901|4902|4903|4904',
  'tissu|fabric|textile|قماش|نسيج': '50|51|52|53|54|55|56|57|58|59|60',
  'sac|bag|حقيبة|شنطة': '4202',
  'valise|suitcase|حقيبة سفر': '4202',
  'jouet|toy|لعبة|ألعاب': '9503',
  'cigarette|tabac|سيجارة|تبغ': '2401|2402|2403',
  'engrais|fertilisant|سماد|أسمدة': '3101|3102|3103|3104|3105',
  'peinture|paint|دهان|طلاء': '3208|3209|3210',
};

function aiSearch(event){
  if(event) event.stopPropagation();
  const input = document.getElementById('hsSearchInput');
  const q = input ? input.value.trim() : '';
  if(q.length < 2){
    // show prompt if empty
    const dropdown = document.getElementById('hsDropdown');
    if(dropdown){
      dropdown.innerHTML = '<div class="hs-item" style="color:#718096;font-style:italic">Tapez un produit ou un code SH pour rechercher…</div>';
      dropdown.classList.remove('hidden');
      input && input.focus();
    }
    return;
  }
  onHSInput(q);
}

// Detect if text contains Arabic characters
function isArabic(str){ return /[\u0600-\u06FF]/.test(str); }
// Detect if text contains Chinese characters
function isChinese(str){ return /[\u4E00-\u9FFF]/.test(str); }

function onHSInput(val){
  const q = val.trim().toLowerCase();
  const dropdown = document.getElementById('hsDropdown');
  if(!q || q.length < 2){ dropdown.classList.add('hidden'); return; }

  let results = [];

  // pure digit search → match HS code prefix
  if(/^\d+$/.test(q)){
    results = HS_CODES.filter(c => c.sh.startsWith(q)).slice(0,25);
  } else if(isArabic(q) || isChinese(q)){
    // Non-Latin script: go straight to AI keyword mapping (descriptions are in French)
    for(const [pattern, chapters] of Object.entries(AI_KEYWORDS)){
      if(new RegExp(pattern,'iu').test(q)){
        const chapterList = chapters.split('|');
        results = HS_CODES.filter(c => chapterList.some(ch => c.sh.startsWith(ch))).slice(0,25);
        break;
      }
    }
  } else {
    // Latin text: search French descriptions first
    const tokens = q.split(/\s+/);
    results = HS_CODES.filter(c => {
      const hay = c.sh + ' ' + c.desc.toLowerCase();
      return tokens.every(tok => hay.includes(tok));
    }).slice(0,25);
    // Fallback to AI keywords if few results
    if(results.length < 3){
      for(const [pattern, chapters] of Object.entries(AI_KEYWORDS)){
        if(new RegExp(pattern,'i').test(q)){
          const chapterList = chapters.split('|');
          const extra = HS_CODES.filter(c => chapterList.some(ch => c.sh.startsWith(ch))).slice(0,15);
          results = [...results, ...extra].slice(0,25);
          break;
        }
      }
    }
  }

  if(!results.length){ dropdown.innerHTML='<div class="hs-item"><span>Aucun résultat / No results</span></div>'; dropdown.classList.remove('hidden'); return; }

  // Échappement HTML pour prévenir XSS — données issues de la base HS (défensif)
  const _e = typeof escapeHTML === 'function'
    ? escapeHTML
    : s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');

  dropdown.innerHTML = results.map(r=>`
    <div class="hs-item" onclick="selectHS('${_e(r.sh)}','${_e(r.desc)}',${parseFloat(r.di)||0})">
      <strong>${_e(r.sh)} <span class="hs-rate">${parseFloat(r.di)||0}%</span></strong>
      <span>${_e(r.desc)}</span>
    </div>`).join('');
  dropdown.classList.remove('hidden');
  // position below the search box inside .hs-search-wrap
  const searchBox = document.querySelector('.ai-search-box');
  if(searchBox) dropdown.style.top = (searchBox.offsetHeight + 4) + 'px';
}

function selectHS(code, desc, di){
  document.getElementById('hsCode').textContent = code;
  document.getElementById('hsDesc').textContent = desc;
  document.getElementById('diRate').value = di;
  document.getElementById('hsDropdown').classList.add('hidden');
  document.getElementById('hsSearchInput').value = '';

  // Check FDS applicability
  const fdsChapters = ['8507','8517','8523','8531','8539','8471','8414','8415','3923','3926','3824','3401','3402','3605','2806','7320','7007','6813','8708'];
  const isFDS = fdsChapters.some(ch => code.startsWith(ch));
  document.getElementById('fdsAlert').classList.toggle('hidden', !isFDS);
  if(isFDS) document.getElementById('fdsRate').value = '1';

  calcCustoms();
}

// Close dropdown on outside click
document.addEventListener('click', e=>{
  if(!e.target.closest('.ai-search-box') && !e.target.closest('.hs-dropdown')){
    const d = document.getElementById('hsDropdown');
    if(d) d.classList.add('hidden');
  }
});
