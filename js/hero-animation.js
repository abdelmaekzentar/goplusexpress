/* ============================================================
   GO PLUS EXPRESS — Hero Canvas Overlay
   Accurate Morocco + Western Sahara map (real coordinates),
   animated flight/sea routes, branded truck, cities.
   Runs ON TOP of the <video> background.
   ============================================================ */
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const C = {
    teal: '#00A99D', tealD: '#007d74', gold: '#F5C518',
    white: '#ffffff', air: '#4fc3f7', gulf: '#ffab40', asia: '#ff7043',
  };

  /* ── Resize ────────────────────────────────────────────── */
  let W, H;
  function resize() {
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.scale(DPR, DPR);
  }
  resize();
  window.addEventListener('resize', () => { ctx.setTransform(1,0,0,1,0,0); resize(); });

  /* ── Real Geography → Canvas normalised coords ─────────
     Bounding box: lon [-17.1, -1.0], lat [20.7, 35.9]
     canvas_x = 0.20 + (lon + 17.1) / 16.1 * 0.32
     canvas_y = 0.25 + (35.9 - lat) / 15.2 * 0.50
  ──────────────────────────────────────────────────────── */
  function geo(lon, lat) {
    return [0.20 + (lon + 17.1) / 16.1 * 0.32, 0.25 + (35.9 - lat) / 15.2 * 0.50];
  }

  /* ── Morocco + Western Sahara exact outline ─────────── */
  const MOROCCO = [
    // Mediterranean coast W→E
    geo(-5.36,35.89), geo(-5.10,35.75), geo(-4.60,35.72), geo(-4.00,35.60),
    geo(-3.50,35.25), geo(-2.90,35.27), geo(-2.35,35.09), geo(-1.73,35.01),
    // Algeria border N→S
    geo(-1.75,34.30), geo(-1.50,33.50), geo(-1.20,32.10), geo(-1.80,31.00),
    geo(-2.50,30.00), geo(-3.50,28.80), geo(-5.00,28.20), geo(-6.50,27.90),
    geo(-8.67,27.67),
    // Mauritania border (Western Sahara south) E→W
    geo(-10.0,26.50), geo(-12.0,25.00), geo(-13.8,23.80),
    geo(-16.0,21.50), geo(-17.06,20.77),
    // Atlantic coast S→N (Western Sahara + Morocco)
    geo(-17.05,21.50), geo(-17.10,22.50), geo(-17.00,23.70),
    geo(-16.30,24.10), geo(-15.97,24.50), geo(-15.40,25.50),
    geo(-14.50,26.30), geo(-13.20,27.15), geo(-12.50,27.90),
    geo(-11.50,28.30), geo(-10.50,28.70), geo(-9.85,29.50),
    geo(-9.50,30.20),  geo(-9.57,30.43), // Agadir
    geo(-9.85,31.50),  geo(-9.95,32.30), // Essaouira
    geo(-9.75,33.20),  geo(-8.60,33.60), // Safi → El Jadida
    geo(-7.60,33.60),  geo(-6.80,33.90), // Casablanca → Rabat
    geo(-6.40,34.50),  geo(-6.10,35.00), // Kenitra → Larache
    geo(-5.90,35.60),  geo(-5.80,35.78), // Tanger Atlantique
    geo(-5.60,35.85),  geo(-5.36,35.89), // Tanger Méditerranée
  ];

  /* ── Cities ─────────────────────────────────────────── */
  const CITIES = [
    { name:'Casablanca',  ...({ x:geo(-7.60,33.60)[0], y:geo(-7.60,33.60)[1] }), col:C.teal,  sz:5 },
    { name:'Tanger Med',  ...({ x:geo(-5.50,35.75)[0], y:geo(-5.50,35.75)[1] }), col:C.teal,  sz:4 },
    { name:'Agadir',      ...({ x:geo(-9.57,30.43)[0], y:geo(-9.57,30.43)[1] }), col:C.teal,  sz:3.5 },
    { name:'Laâyoune',    ...({ x:geo(-13.20,27.15)[0],y:geo(-13.20,27.15)[1]}), col:C.teal,  sz:3 },
    { name:'Dakhla',      ...({ x:geo(-15.93,23.72)[0],y:geo(-15.93,23.72)[1]}), col:C.teal,  sz:3 },
    { name:'Paris CDG',   ...({ x:geo(-2.55,49.01)[0], y:Math.max(0.05,geo(-2.55,49.01)[1]) }), col:C.air,  sz:4 },
    { name:'Frankfurt',   ...({ x:geo(8.57,50.03)[0],  y:Math.max(0.04,geo(8.57,50.03)[1])  }), col:C.air,  sz:3.5 },
    { name:'Barcelone',   ...({ x:geo(2.07,41.30)[0],  y:Math.max(0.08,geo(2.07,41.30)[1])  }), col:C.air,  sz:3 },
    { name:'Algésiras',   ...({ x:geo(-5.45,36.13)[0], y:geo(-5.45,36.13)[1] }), col:'#aaa',  sz:2.5 },
    { name:'Jebel Ali',   ...({ x:Math.min(0.98,geo(55.1,25.0)[0]), y:geo(55.1,25.0)[1] }), col:C.gulf, sz:4 },
    { name:'Shanghai',    ...({ x:Math.min(0.99,geo(121.47,31.23)[0]), y:geo(121.47,31.23)[1] }), col:C.asia, sz:4 },
    { name:'New York',    ...({ x:Math.max(0.01,geo(-74.0,40.7)[0]), y:geo(-74.0,40.7)[1] }), col:C.air,  sz:4 },
  ];

  // Override out-of-range cities with fixed positions for better layout
  CITIES.find(c=>c.name==='Paris CDG').x    = 0.455; CITIES.find(c=>c.name==='Paris CDG').y    = 0.075;
  CITIES.find(c=>c.name==='Frankfurt').x   = 0.510; CITIES.find(c=>c.name==='Frankfurt').y   = 0.058;
  CITIES.find(c=>c.name==='Barcelone').x   = 0.465; CITIES.find(c=>c.name==='Barcelone').y   = 0.110;
  CITIES.find(c=>c.name==='Jebel Ali').x   = 0.820; CITIES.find(c=>c.name==='Jebel Ali').y   = 0.440;
  CITIES.find(c=>c.name==='Shanghai').x    = 0.920; CITIES.find(c=>c.name==='Shanghai').y    = 0.300;
  CITIES.find(c=>c.name==='New York').x    = 0.040; CITIES.find(c=>c.name==='New York').y    = 0.170;

  const city = n => CITIES.find(c => c.name === n);

  /* ── Routes ─────────────────────────────────────────── */
  const ROUTES = [
    { from:city('Paris CDG'), to:city('Casablanca'),  type:'air',   col:C.air,  sp:0.00055, bend:-0.18 },
    { from:city('Frankfurt'), to:city('Casablanca'),  type:'air',   col:C.air,  sp:0.00045, bend:-0.16 },
    { from:city('Barcelone'), to:city('Casablanca'),  type:'air',   col:C.air,  sp:0.00070, bend:-0.12 },
    { from:city('New York'),  to:city('Casablanca'),  type:'air',   col:C.air,  sp:0.00028, bend:-0.20 },
    { from:city('Shanghai'),  to:city('Tanger Med'),  type:'sea',   col:C.asia, sp:0.00018, bend:-0.06 },
    { from:city('Jebel Ali'), to:city('Casablanca'),  type:'sea',   col:C.gulf, sp:0.00025, bend:-0.04 },
    { from:city('Frankfurt'), to:city('Agadir'),      type:'air',   col:C.air,  sp:0.00038, bend:-0.14 },
    { from:city('Algésiras'), to:city('Tanger Med'),  type:'ferry', col:'#80deea', sp:0.00200, bend: 0.01 },
  ];
  ROUTES.forEach((r, i) => { r.t = i / ROUTES.length; });

  /* ── Bezier helpers ─────────────────────────────────── */
  function ctrlPt(from, to, bend) {
    return { x:(from.x+to.x)/2, y:(from.y+to.y)/2+bend };
  }
  function bezPt(p0, cp, p1, t) {
    return {
      x:(1-t)**2*p0.x + 2*(1-t)*t*cp.x + t**2*p1.x,
      y:(1-t)**2*p0.y + 2*(1-t)*t*cp.y + t**2*p1.y,
    };
  }

  /* ── Drawing helpers ────────────────────────────────── */
  function glow(x, y, r, col, a) {
    const g = ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0, col+'cc'); g.addColorStop(1, col+'00');
    ctx.globalAlpha = a; ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
  }

  function drawPlane(x, y, angle, sz) {
    ctx.save(); ctx.translate(x,y); ctx.rotate(angle); ctx.globalAlpha=0.93;
    // exhaust trail
    const tr = ctx.createLinearGradient(-sz*5,0,0,0);
    tr.addColorStop(0,'transparent'); tr.addColorStop(1,C.air+'50');
    ctx.fillStyle=tr; ctx.fillRect(-sz*5,-sz*0.12,sz*5,sz*0.24);
    ctx.fillStyle=C.white;
    // body
    ctx.beginPath();
    ctx.moveTo(sz*2,0); ctx.lineTo(-sz*1.5,-sz*0.3); ctx.lineTo(-sz*2,0); ctx.lineTo(-sz*1.5,sz*0.3); ctx.closePath(); ctx.fill();
    // wings
    ctx.beginPath(); ctx.moveTo(sz*0.2,0); ctx.lineTo(-sz*0.6,-sz*1.5); ctx.lineTo(-sz*1.1,-sz*1.5); ctx.lineTo(-sz*0.3,0); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(sz*0.2,0); ctx.lineTo(-sz*0.6,sz*1.5); ctx.lineTo(-sz*1.1,sz*1.5); ctx.lineTo(-sz*0.3,0); ctx.closePath(); ctx.fill();
    // tail
    ctx.beginPath(); ctx.moveTo(-sz*1.4,0); ctx.lineTo(-sz*2.0,-sz*1.0); ctx.lineTo(-sz*2.3,-sz*1.0); ctx.lineTo(-sz*1.6,0); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawShip(x, y, sz) {
    ctx.save(); ctx.translate(x,y); ctx.globalAlpha=0.88;
    // wake
    const wk=ctx.createLinearGradient(sz*4,0,-sz*4,0); wk.addColorStop(0,C.teal+'00'); wk.addColorStop(1,C.teal+'30');
    ctx.fillStyle=wk; ctx.fillRect(-sz*6,sz*0.1,sz*6,sz*0.45);
    // hull
    ctx.fillStyle='#b0bec5';
    ctx.beginPath(); ctx.moveTo(-sz*3.5,sz*0.6); ctx.lineTo(-sz*3.5,sz*0.15); ctx.lineTo(sz*3.5,sz*0.15); ctx.lineTo(sz*4,sz*0.6); ctx.closePath(); ctx.fill();
    // containers
    [C.teal,C.gold,'#e53935','#1565c0','#2e7d32',C.teal].forEach((col,i)=>{
      ctx.fillStyle=col; ctx.fillRect(-sz*3.2+i*sz*1.05,-sz*0.55,sz*0.9,sz*0.68);
    });
    [[C.gold,C.teal,'#1565c0','#e53935',C.teal]].flat().forEach((col,i)=>{
      ctx.fillStyle=col; ctx.fillRect(-sz*2.6+i*sz*1.05,-sz*1.1,sz*0.9,sz*0.5);
    });
    // superstructure
    ctx.fillStyle='#eceff1'; ctx.fillRect(sz*1.5,-sz*1.4,sz*1.4,sz*1.55);
    ctx.restore();
  }

  function drawTruck(x, y, sz, alpha) {
    ctx.save(); ctx.translate(x,y); ctx.globalAlpha=alpha;
    // shadow
    ctx.fillStyle='rgba(0,0,0,0.15)';
    ctx.beginPath(); ctx.ellipse(0,sz*0.7,sz*3.5,sz*0.28,0,0,Math.PI*2); ctx.fill();
    // trailer
    ctx.fillStyle=C.teal; ctx.fillRect(-sz*4,-sz*1.1,sz*3.6,sz*1.3);
    // gold stripe
    ctx.fillStyle=C.gold; ctx.fillRect(-sz*4,-sz*0.3,sz*3.6,sz*0.14);
    // text
    ctx.fillStyle=C.white; ctx.font=`bold ${sz*0.4}px Inter,sans-serif`; ctx.textAlign='center';
    ctx.fillText('GO PLUS EXPRESS',-sz*2.2,-sz*0.5);
    ctx.fillStyle=C.gold; ctx.fillText('★',-sz*3.7,-sz*0.65);
    // cab
    ctx.fillStyle='#00887d';
    ctx.beginPath(); ctx.moveTo(-sz*0.4,-sz*1.1); ctx.lineTo(sz*0.9,-sz*1.1); ctx.lineTo(sz*1.1,-sz*0.65); ctx.lineTo(sz*1.1,sz*0.2); ctx.lineTo(-sz*0.4,sz*0.2); ctx.closePath(); ctx.fill();
    // windshield
    ctx.fillStyle='rgba(150,220,230,0.45)';
    ctx.beginPath(); ctx.moveTo(-sz*0.2,-sz*1.0); ctx.lineTo(sz*0.8,-sz*1.0); ctx.lineTo(sz*0.95,-sz*0.65); ctx.lineTo(-sz*0.2,-sz*0.65); ctx.closePath(); ctx.fill();
    // wheels
    [[-sz*3.2,sz*0.35],[-sz*2.0,sz*0.35],[-sz*0.9,sz*0.35],[sz*0.55,sz*0.35]].forEach(([wx,wy])=>{
      ctx.fillStyle='#212121'; ctx.beginPath(); ctx.arc(wx,wy,sz*0.32,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#555'; ctx.beginPath(); ctx.arc(wx,wy,sz*0.15,0,Math.PI*2); ctx.fill();
    });
    ctx.restore();
  }

  /* ── Starfield ───────────────────────────────────────── */
  const STARS = Array.from({length:120}, ()=>({
    x:Math.random(), y:Math.random()*0.60,
    r:Math.random()*1.3+0.3, a:Math.random()*0.6+0.15,
    ph:Math.random()*Math.PI*2, sp:Math.random()*0.8+0.3,
  }));

  /* ── Animation loop ──────────────────────────────────── */
  let ts = 0;

  function frame(now) {
    ts = now * 0.001;

    // Dark semi-transparent overlay on the video
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='rgba(5,13,26,0.55)';
    ctx.fillRect(0,0,W,H);

    // Stars (upper half only, subtle)
    for (const s of STARS) {
      const p = 0.5+0.5*Math.sin(ts*s.sp+s.ph);
      ctx.globalAlpha=s.a*p*0.6; ctx.fillStyle=C.white;
      ctx.beginPath(); ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;

    // Bottom gradient
    const bot=ctx.createLinearGradient(0,H*0.6,0,H);
    bot.addColorStop(0,'transparent'); bot.addColorStop(1,'rgba(5,13,26,0.7)');
    ctx.fillStyle=bot; ctx.fillRect(0,H*0.6,W,H*0.4);

    // Morocco + Western Sahara fill
    ctx.save();
    ctx.globalAlpha=0.18; ctx.fillStyle=C.teal;
    ctx.beginPath();
    MOROCCO.forEach(([nx,ny],i) => i===0 ? ctx.moveTo(nx*W,ny*H) : ctx.lineTo(nx*W,ny*H));
    ctx.closePath(); ctx.fill();
    // Outline with glow
    ctx.globalAlpha=0.65; ctx.strokeStyle=C.teal;
    ctx.lineWidth=1.8; ctx.shadowColor=C.teal; ctx.shadowBlur=10;
    ctx.stroke();
    ctx.restore();

    // "MAROC" label (center of Morocco proper)
    const [lx,ly] = geo(-6.5,32.5);
    ctx.globalAlpha=0.5; ctx.fillStyle=C.teal;
    ctx.font=`600 ${Math.max(9,W*0.011)}px Inter,sans-serif`; ctx.textAlign='center';
    ctx.fillText('MAROC',lx*W,ly*H);
    // "SAHARA OCCIDENTAL" label
    const [sx,sy] = geo(-13.5,24.5);
    ctx.font=`500 ${Math.max(7,W*0.008)}px Inter,sans-serif`;
    ctx.globalAlpha=0.35; ctx.fillText('SAHARA OCCIDENTAL',sx*W,sy*H);
    ctx.globalAlpha=1;

    // Routes (dashed arcs, animated)
    ROUTES.forEach(route => {
      const cp=ctrlPt(route.from,route.to,route.bend);
      ctx.save(); ctx.globalAlpha=0.28; ctx.strokeStyle=route.col;
      ctx.lineWidth=route.type==='ferry'?1.2:0.9;
      ctx.setLineDash([4,route.type==='sea'?10:7]);
      ctx.lineDashOffset=-ts*(route.type==='sea'?18:30);
      ctx.beginPath();
      ctx.moveTo(route.from.x*W,route.from.y*H);
      ctx.quadraticCurveTo(cp.x*W,cp.y*H,route.to.x*W,route.to.y*H);
      ctx.stroke(); ctx.restore();
    });

    // Vehicles along routes
    ROUTES.forEach(route => {
      route.t=(route.t+route.sp)%1;
      const cp=ctrlPt(route.from,route.to,route.bend);
      const pos=bezPt(route.from,cp,route.to,route.t);
      const pos2=bezPt(route.from,cp,route.to,Math.min(route.t+0.008,1));
      const px=pos.x*W, py=pos.y*H;
      const angle=Math.atan2((pos2.y-pos.y)*H,(pos2.x-pos.x)*W);

      glow(px,py,14,route.col,0.22);
      if(route.type==='air') drawPlane(px,py,angle,Math.max(5,W*0.006));
      else if(route.type==='sea') drawShip(px,py,Math.max(4,W*0.0045));
      else {
        ctx.save(); ctx.translate(px,py); ctx.globalAlpha=0.8;
        ctx.fillStyle='#80deea';
        ctx.beginPath(); ctx.moveTo(-9,-3); ctx.lineTo(9,-3); ctx.lineTo(11,3); ctx.lineTo(-9,3); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    });

    // Road truck (Atlantic coastal road)
    const tT=(ts*0.045)%1;
    const tA=tT<0.05?tT/0.05:tT>0.95?(1-tT)/0.05:1;
    drawTruck(W*(0.06+tT*0.35), H*0.682, Math.max(5,W*0.006), tA);

    // Cities
    CITIES.forEach(city => {
      const cx=city.x*W, cy=city.y*H;
      const p=0.55+0.45*Math.sin(ts*1.4+city.x*8);
      glow(cx,cy,city.sz*3.5,city.col,0.3*p);
      ctx.globalAlpha=0.9; ctx.fillStyle=city.col;
      ctx.beginPath(); ctx.arc(cx,cy,city.sz*0.7,0,Math.PI*2); ctx.fill();
      if(W>600){
        ctx.globalAlpha=0.65; ctx.fillStyle=C.white;
        ctx.font=`${Math.max(8,W*0.009)}px Inter,sans-serif`; ctx.textAlign='center';
        ctx.fillText(city.name,cx,cy-city.sz-3);
      }
    });
    ctx.globalAlpha=1;

    // Left gradient for text readability
    const lGrad=ctx.createLinearGradient(0,0,W*0.5,0);
    lGrad.addColorStop(0,'rgba(5,13,26,0.45)'); lGrad.addColorStop(1,'transparent');
    ctx.fillStyle=lGrad; ctx.fillRect(0,0,W,H);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
