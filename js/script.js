/* ════════════════════════════════════════════
   LOADER — once per session
════════════════════════════════════════════ */
(function(){
  const loader = document.getElementById('loader');
  if(sessionStorage.getItem('huda_loaded')){
    loader.style.display='none';
    document.body.style.overflow='';
    startPage(); return;
  }
  document.body.style.overflow='hidden';

  // Set dash offsets so each element is "invisible" ready to draw
  const ids=['l-r1','l-r2','l-r3','l-r4','l-r5','l-ln1','l-ln2','l-ln3','l-ln4'];
  ids.forEach(id=>{
    const el=document.getElementById(id);
    if(el){const len=el.getTotalLength?.()||200;el.style.strokeDasharray=len;el.style.strokeDashoffset=len;}
  });
  // Also petal ellipses (get by DOM)
  document.querySelectorAll('#l-petals-out ellipse,#l-petals-in ellipse').forEach(el=>{
    try{const l=el.getTotalLength();el.style.strokeDasharray=l;el.style.strokeDashoffset=l;}catch(e){}
  });

  const tl=gsap.timeline({
    onComplete(){
      sessionStorage.setItem('huda_loaded','1');
      gsap.to(loader,{opacity:0,duration:.8,ease:'power2.inOut',onComplete(){
        loader.style.display='none';
        document.body.style.overflow='';
        startPage();
      }});
    }
  });

  // Draw rings from inside out
  tl.to('#l-r5',{strokeDashoffset:0,duration:.5,ease:'power2.inOut'})
    .to('#l-r4',{strokeDashoffset:0,duration:.6,ease:'power2.inOut'},'-=.1')
    .to('#l-r3',{strokeDashoffset:0,duration:.7,ease:'power2.inOut'},'-=.1')
    .to('#l-r2',{strokeDashoffset:0,duration:.8,ease:'power2.inOut'},'-=.12')
    .to('#l-r1',{strokeDashoffset:0,duration:.9,ease:'power2.inOut'},'-=.14')
    // Lines
    .to(['#l-ln1','#l-ln2'],{strokeDashoffset:0,duration:.5,ease:'power2.inOut',stagger:.08},'-=.3')
    .to(['#l-ln3','#l-ln4'],{strokeDashoffset:0,duration:.5,ease:'power2.inOut',stagger:.08},'-=.15')
    // Outer petals
    .to('#l-petals-out ellipse',{strokeDashoffset:0,duration:.4,ease:'power2.inOut',stagger:.04},'-=.1')
    // Inner petals
    .to('#l-petals-in ellipse',{strokeDashoffset:0,duration:.35,ease:'power2.inOut',stagger:.03},'-=.05')
    // Center dot
    .to('#l-dot',{opacity:1,scale:1.4,transformOrigin:'center',duration:.28,ease:'back.out(3)'})
    .to('#l-dot',{scale:1,duration:.18})
    // Name + sub
    .to('#loader-name',{opacity:1,y:0,duration:.7,ease:'power3.out'},'-=.1')
    .to('#loader-sub', {opacity:1,duration:.5,ease:'power2.out'},'-=.3')
    .to({},{duration:.6});
})();

/* ════════════════════════════════════════════
   PAGE INIT
════════════════════════════════════════════ */
function startPage(){
  gsap.registerPlugin(ScrollTrigger);

  /* AOS */
  AOS.init({once:true,offset:80,easing:'ease-out-cubic'});

  /* Lenis smooth scroll */
  const lenis=new Lenis({duration:1.4,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smooth:true});
  function raf(t){lenis.raf(t);requestAnimationFrame(raf);}
  requestAnimationFrame(raf);
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);

  /* Progress bar */
  lenis.on('scroll',({progress})=>{
    document.getElementById('progress-bar').style.width=(progress*100)+'%';
  });

  /* ── CURSOR (brown, mix-blend-mode:multiply) ── */
  // const cur=document.getElementById('cursor');
  // const ring=document.getElementById('cursorRing');
  // let mx=window.innerWidth/2,my=window.innerHeight/2,rx=mx,ry=my;
  // document.addEventListener('mousemove',e=>{
  //   mx=e.clientX;my=e.clientY;
  //   gsap.to(cur,{x:mx,y:my,duration:.08,overwrite:true});
  // });
  // (function animRing(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animRing);})();
  // document.querySelectorAll('a,button,.service-card,.gallery-item,.slide-card,.masonry-item,.collab-card').forEach(el=>{
  //   el.addEventListener('mouseenter',()=>gsap.to(cur,{scale:2.5,duration:.3}));
  //   el.addEventListener('mouseleave',()=>gsap.to(cur,{scale:1,duration:.3}));
  // });

  // ══════════════════════════════════════
//  CUSTOM CURSOR  (brown dot + mix-blend-difference)
// ══════════════════════════════════════
  const cursorEl = document.getElementById('cursor');
const ringEl   = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  gsap.to(cursorEl, { x: mx, y: my, duration: .08 });
});
(function animRing() {
  rx += (mx - rx) * .1; ry += (my - ry) * .1;
  ringEl.style.left = rx + 'px'; ringEl.style.top = ry + 'px';
  requestAnimationFrame(animRing);
})();

// Cursor grow on interactive elements
document.querySelectorAll('a, button, .service-card, .gallery-item, .rw-card, .collab-card, .masonry-item').forEach(el => {
  el.addEventListener('mouseenter', () => {
    gsap.to(cursorEl, { scale: 2, duration: 0.3,});
      gsap.to(ringEl, { scale: 1.5, opacity: 0.3, duration: 0.3 });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(cursorEl, { scale: 1, duration: 0.3 });
      gsap.to(ringEl, { scale: 1, opacity: 0.6, duration: 0.3 });
  });
});


  /* NAV dark sections detection */
  // const nav=document.getElementById('main-nav');
  // const darkSections=['#pin-section','#testimonials','#recent-work','#collaborations','footer'];
  // function updateNav(){
  //   const sy=window.scrollY;
  //   sy>80?nav.classList.add('nav-scrolled'):nav.classList.remove('nav-scrolled');
  //   let inDark=false;
  //   darkSections.forEach(s=>{const el=document.querySelector(s);if(!el)return;const r=el.getBoundingClientRect();if(r.top<=80&&r.bottom>=80)inDark=true;});
  //   nav.classList.toggle('dark-nav',inDark);
  //   // cursor color matches
  //   [cur,ring].forEach(el=>el.classList.toggle('on-dark',inDark));
  // }
  // lenis.on('scroll',updateNav);updateNav();
  /* ── New NAV ── */
   const nav=document.getElementById('main-nav');
  const darkSections=['#pin-section','#testimonials','#recent-work', '#collaborations','footer'];
  function updateNav(){
    const sy=window.scrollY;
    const heroH=document.getElementById('hero').offsetHeight;
    if(sy>heroH*.03) nav.classList.add('nav-scrolled'); else nav.classList.remove('nav-scrolled');
    let inDark=false;
    darkSections.forEach(sel=>{
      const el=document.querySelector(sel);
      if(!el) return;
      const r=el.getBoundingClientRect();
      if(r.top<=80&&r.bottom>=80) inDark=true;
    });
    nav.classList.toggle('nav-dark',inDark);
  }
  lenis.on('scroll',updateNav);
  updateNav();

  /* Mobile nav */
  const navToggle = document.getElementById('nav-toggle');
const navMobile = document.getElementById('nav-mobile');
const navClose = document.getElementById('nav-close');
const mobLinks = document.querySelectorAll('.nav-mob-link');

// OPEN
navToggle.addEventListener('click', () => {
  navMobile.classList.add('open');
  document.body.classList.add('no-scroll'); // 🔥 lock scroll

  gsap.to(mobLinks, {
    opacity: 1,
    y: 0,
    stagger: .1,
    duration: .5,
    ease: 'power3.out',
    delay: .1
  });
});

// CLOSE (X BUTTON)
navClose.addEventListener('click', () => {
  navMobile.classList.remove('open');
  document.body.classList.remove('no-scroll'); // 🔥 unlock

  gsap.to(mobLinks, {
    opacity: 0,
    y: 20,
    duration: .3
  });
});

// CLOSE ON LINK CLICK
mobLinks.forEach(a => {
  a.addEventListener('click', () => {
    navMobile.classList.remove('open');
    document.body.classList.remove('no-scroll'); // 🔥 unlock

    gsap.to(mobLinks, {
      opacity: 0,
      y: 20,
      duration: .3
    });
  });
});

// INITIAL STATE
gsap.set(mobLinks, { opacity: 0, y: 20 });

  /* ── HERO: stagger letters ── */
  const letters=document.querySelectorAll('.hero-letter');
  const heroTl=gsap.timeline({defaults:{ease:'power3.out'}});
  heroTl.to('#hero-tag',{opacity:1,y:0,duration:.9,delay:.15});
  letters.forEach((l,i)=>{
    // Each letter starts when previous is ~65% through (overlap = 65% of 0.65s = 0.42s)
    heroTl.to(l,{opacity:1,y:0,duration:.65,ease:'back.out(1.5)'},i===0?'-=.1':'-=.42');
  });
  heroTl
    .to('#hero-sub', {opacity:1,y:0,duration:.8},'-=.2')
    .to('#hero-div', {opacity:1,duration:.6},'-=.3')
    .to('#hero-desc',{opacity:1,y:0,duration:.7},'-=.25')
    .to('#hero-cta', {opacity:1,y:0,duration:.6},'-=.25')
    .to('#scroll-ind',{opacity:1,duration:.5},'-=.2');

  gsap.to('.hero-mandala',{yPercent:28,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:true}});

  /* Reveal animations */
  gsap.utils.toArray('.reveal').forEach(el=>{
    gsap.to(el,{opacity:1,y:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',toggleActions:'play none none none'}});
  });
  gsap.utils.toArray('.reveal-left').forEach(el=>{
    gsap.to(el,{opacity:1,x:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 85%',toggleActions:'play none none none'}});
  });
  gsap.utils.toArray('.reveal-right').forEach(el=>{
    gsap.to(el,{opacity:1,x:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 85%',toggleActions:'play none none none'}});
  });
  gsap.utils.toArray('.reveal-scale').forEach((el,i)=>{
    gsap.to(el,{opacity:1,scale:1,duration:.9,ease:'power3.out',delay:i*.08,scrollTrigger:{trigger:el,start:'top 88%',toggleActions:'play none none none'}});
  });

  /* Counters */
  document.querySelectorAll('.stat-num').forEach(el=>{
    const target=parseInt(el.dataset.count);
    ScrollTrigger.create({trigger:el,start:'top 85%',onEnter:()=>{
      gsap.to({val:0},{val:target,duration:2,ease:'power2.out',onUpdate:function(){el.textContent=Math.round(this.targets()[0].val)+'+';} });
    }});
  });

  /* Horizontal pin scroll */
  const track=document.getElementById('horizontal-track');
  const cone=document.getElementById('floating-cone');
  const getTrackW=()=>track.scrollWidth-window.innerWidth;
  ScrollTrigger.create({
    trigger:'#pin-section',start:'top top',end:'bottom bottom',pin:'#pin-sticky',anticipatePin:1,
    onUpdate:self=>{
      const p=self.progress;
      gsap.set(track,{x:-getTrackW()*p});
      gsap.set(cone,{x:p*(window.innerWidth+250)-120,rotation:p*20-5});
    }
  });
  gsap.from('.h-item',{opacity:0,y:60,stagger:.12,duration:1,ease:'power3.out',scrollTrigger:{trigger:'#pin-section',start:'top 80%'}});

  /* ── INSTAGRAM SLIDER ── */
  const st=document.getElementById('slider-track');
  if(st){
    let drag=false,startX=0,baseX=0,curX=0,tarX=0;
    const maxScroll=()=>-(st.scrollWidth-st.parentElement.offsetWidth+120);
    const auto=gsap.to({},{duration:.016,repeat:-1,onRepeat(){
      if(!drag){tarX-=.55;if(tarX<maxScroll())tarX=0;}
      curX+=(tarX-curX)*.09;gsap.set(st,{x:curX});
    }});
    st.addEventListener('mousedown',e=>{drag=true;startX=e.clientX;baseX=curX;st.style.cursor='grabbing';});
    document.addEventListener('mousemove',e=>{if(!drag)return;tarX=Math.max(maxScroll(),Math.min(0,baseX+(e.clientX-startX)));});
    document.addEventListener('mouseup',()=>{drag=false;st.style.cursor='grab';});
    st.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;baseX=curX;},{passive:true});
    st.addEventListener('touchmove',e=>{tarX=Math.max(maxScroll(),Math.min(0,baseX+(e.touches[0].clientX-startX)));},{passive:true});
    st.parentElement.addEventListener('mouseenter',()=>auto.pause());
    st.parentElement.addEventListener('mouseleave',()=>auto.resume());
  }

  /* ── CONTACT FORM + TOAST ── */
  const form = document.getElementById("contact-form");
const messageBox = document.getElementById("formMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = form.querySelector(".btn-submit span");
  const originalText = btn.textContent;

  btn.textContent = "Sending...";
  messageBox.innerHTML = "";

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });

    const result = await res.json();

    if (result.success) {
      messageBox.innerHTML = `<div style="color:green;">✨ Form Submitted!','We\'ll get back to you within 24 hours.</div>`;
      form.reset();
    } else {
      messageBox.innerHTML = `<div style="color:red;">❌ Failed to send message</div>`;
    }

  } catch (err) {
    messageBox.innerHTML = `<div style="color:red;">❌ Error sending message</div>`;
  }

  btn.textContent = originalText;
});

// ✨ Form Submitted!','We\'ll get back to you within 24 hours.
  function showToast(title,msg){
    const w=document.getElementById('toast-wrap');
    const t=document.createElement('div');t.className='toast';
    t.innerHTML=`<div class="toast-title">${title}</div><div class="toast-msg">${msg}</div>`;
    w.appendChild(t);
    requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add('show')));
    setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),500);},4200);
  }

  /* Back to top */
  const btt=document.getElementById('back-to-top');
  lenis.on('scroll',({scroll})=>{scroll>400?btt.classList.add('visible'):btt.classList.remove('visible');});
  btt.addEventListener('click',()=>lenis.scrollTo(0,{duration:1.4}));

  /* Smooth nav links */
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const t=document.querySelector(a.getAttribute('href'));
      if(t){e.preventDefault();lenis.scrollTo(t,{offset:-80,duration:1.6});}
    });
  });
}