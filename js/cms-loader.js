/* ═══════════════════════════════════════════════════════
   GO PLUS EXPRESS — CMS Loader
   Applique les surcharges de contenu (localStorage gpe_cms)
   APRÈS i18n pour conserver la priorité CMS.
   ═══════════════════════════════════════════════════════ */
(function(){
  var CMS_STORAGE_KEY = 'gpe_cms';

  /* ── Applique les surcharges CMS ─────────────────────── */
  function applyOverrides(){
    try {
      var cms = JSON.parse(localStorage.getItem(CMS_STORAGE_KEY) || '{}');
      if(!cms || !Object.keys(cms).length) return;

      /* 1. Éléments avec data-i18n (mêmes clés que i18n) */
      document.querySelectorAll('[data-i18n]').forEach(function(el){
        var key = el.getAttribute('data-i18n');
        if(cms[key] !== undefined && cms[key] !== '')
          el.innerHTML = cms[key];
      });

      /* 2. Éléments avec data-cms-key (non-i18n : téléphone, email, valeurs stats…) */
      document.querySelectorAll('[data-cms-key]').forEach(function(el){
        var key = el.getAttribute('data-cms-key');
        if(cms[key] !== undefined && cms[key] !== '')
          el.innerHTML = cms[key];
      });

    } catch(e){}
  }

  /* ── Lancement après DOM + délai pour laisser i18n finir ── */
  function init(){
    setTimeout(applyOverrides, 250);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* API publique — appelée par i18n après chaque changement de langue */
  window.cmsApply = applyOverrides;

})();
