(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var SVG_MENU='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu w-5 h-5"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>';
var SVG_X='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-5 h-5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';
var SVG_PAUSE='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause w-3.5 h-3.5"><rect x="14" y="4" width="4" height="16" rx="1"></rect><rect x="6" y="4" width="4" height="16" rx="1"></rect></svg>';
var SVG_PLAY='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play w-3.5 h-3.5"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>';
var BOOK_URL="https://booksy.com/en-us/dl/show-business/621339";

/* analytics parity with the original site (gtag events) */
$$('a[href^="https://booksy.com"]').forEach(function(a){a.addEventListener('click',function(){try{window.gtag&&window.gtag('event','book_clicked');}catch(e){}});});

/* ---- Navbar: shrink on scroll + mobile menu ---- */
var header=$('[data-header]');
function onScroll(){ if(!header) return; var s=window.scrollY>20; header.classList.toggle('py-3',s); header.classList.toggle('py-5',!s); }
window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
var toggle=$('[data-menu-toggle]'), menu=null;
var NAV=[['Home','#home'],['Services','#services'],['Barbers','#barbers'],['Gallery','#gallery'],['About Rich','#about'],['Reviews','#reviews'],['Contact','#contact']];
function closeMenu(){ if(menu){menu.remove();menu=null;} if(toggle){toggle.innerHTML=SVG_MENU;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open menu');} }
function openMenu(){
  menu=document.createElement('div'); menu.className='md:hidden bg-black border-t border-gold/20 mt-3';
  var inner=document.createElement('div'); inner.className='px-5 py-4 flex flex-col gap-1';
  NAV.forEach(function(l){ var a=document.createElement('a'); a.href=l[1]; a.setAttribute('data-nav',''); a.className='text-left px-4 py-3 text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-primary transition-colors font-medium'; a.textContent=l[0]; a.addEventListener('click',function(ev){ev.preventDefault();closeMenu();scrollToHash(l[1]);}); inner.appendChild(a); });
  var b=document.createElement('a'); b.href=BOOK_URL; b.target='_blank'; b.rel='noopener noreferrer'; b.className='mt-2 px-4 py-3 bg-primary text-primary-foreground font-semibold text-xs uppercase tracking-[0.15em] inline-flex items-center justify-center text-center'; b.textContent='Book an Appointment'; b.addEventListener('click',closeMenu); inner.appendChild(b);
  menu.appendChild(inner); header.appendChild(menu);
  toggle.innerHTML=SVG_X; toggle.setAttribute('aria-expanded','true'); toggle.setAttribute('aria-label','Close menu');
}
if(toggle) toggle.addEventListener('click',function(){ menu?closeMenu():openMenu(); });

/* ---- smooth in-page scrolling (same as original scrollIntoView) ---- */
function scrollToHash(h){ var el=document.querySelector(h); if(el) el.scrollIntoView({behavior:'smooth'}); }
$$('a[data-nav]').forEach(function(a){ a.addEventListener('click',function(ev){ var h=a.getAttribute('href'); if(h&&h.charAt(0)==='#'&&document.querySelector(h)){ ev.preventDefault(); closeMenu(); scrollToHash(h); } }); });

/* ---- Hero carousel (6 s, pause on hover) ---- */
(function(){
  var root=$('[data-hero]'); if(!root) return;
  var slides=$$('[data-hero-slide]',root), dots=$$('[data-hero-dot]',root), i=0, t=null, paused=false;
  function show(n){ i=(n+slides.length)%slides.length;
    slides.forEach(function(s,k){ var on=k===i; s.classList.toggle('opacity-100',on); s.classList.toggle('opacity-0',!on); s.setAttribute('aria-hidden',on?'false':'true'); });
    dots.forEach(function(d,k){ var on=k===i; d.className='h-1 transition-all duration-300 '+(on?'w-10 bg-primary':'w-4 bg-white/40 hover:bg-white/70'); });
  }
  function start(){ stop(); if(!paused) t=setInterval(function(){show(i+1);},6000); }
  function stop(){ if(t){clearInterval(t);t=null;} }
  dots.forEach(function(d,k){ d.addEventListener('click',function(){show(k);start();}); });
  root.addEventListener('mouseenter',function(){paused=true;stop();}); root.addEventListener('mouseleave',function(){paused=false;start();});
  show(0); start();
})();

/* ---- Gallery slideshow ---- */
(function(){
  var root=$('[data-gallery]'); if(!root) return;
  var slides=$$('[data-gslide]',root), dots=$$('[data-gdot]',root), thumbs=$$('[data-gthumb]',root), count=slides.length;
  var num=$('[data-gnum]',root), cnt=$('[data-gcount]',root), prog=$('[data-gprogress]',root), pauseBtn=$('[data-gpause]',root);
  var i=0, timer=null, paused=false, hover=false;
  var ring=root.querySelector('[data-gthumb] span'); if(!ring){ ring=document.createElement('span'); ring.className='absolute inset-0 ring-1 ring-inset ring-primary'; }
  function pad(n){ return String(n).padStart(2,'0'); }
  function render(){
    slides.forEach(function(s,k){ var on=k===i; var im=s.querySelector('img'); if(im&&!im.getAttribute('src')&&(k===i||k===(i+1)%count)) im.setAttribute('src',im.getAttribute('data-src')); s.style.opacity=on?'1':'0'; s.setAttribute('aria-hidden',on?'false':'true'); });
    dots.forEach(function(d,k){ d.className='h-1.5 transition-all duration-300 '+(k===i?'w-8 bg-primary':'w-4 bg-muted hover:bg-primary/50'); });
    thumbs.forEach(function(b,k){ b.className='relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden border transition-all duration-300 '+(k===i?'border-primary opacity-100':'border-transparent opacity-50 hover:opacity-90'); if(k===i) b.appendChild(ring); });
    if(num) num.textContent=pad(i+1); if(cnt) cnt.textContent=pad(i+1);
    if(prog){ var p=prog.cloneNode(false); p.className='gallery-progress h-full bg-primary'+((paused||hover)?' paused':''); prog.parentNode.replaceChild(p,prog); prog=p; }
    if(pauseBtn){ pauseBtn.innerHTML=(paused?SVG_PLAY:SVG_PAUSE)+(paused?'Play':'Pause'); }
  }
  function schedule(){ if(timer){clearTimeout(timer);timer=null;} if(paused||hover) return; timer=setTimeout(function(){go(1);},6000); }
  function go(d){ i=(i+d+count)%count; render(); schedule(); }
  function set(n){ i=n; render(); schedule(); }
  $('[data-gprev]',root).addEventListener('click',function(){go(-1);});
  $('[data-gnext]',root).addEventListener('click',function(){go(1);});
  dots.forEach(function(d,k){ d.addEventListener('click',function(){set(k);}); });
  thumbs.forEach(function(b,k){ b.addEventListener('click',function(){set(k);}); });
  if(pauseBtn) pauseBtn.addEventListener('click',function(){ paused=!paused; render(); schedule(); });
  root.addEventListener('mouseenter',function(){hover=true; if(prog) prog.classList.add('paused'); if(timer){clearTimeout(timer);timer=null;} });
  root.addEventListener('mouseleave',function(){hover=false; if(prog) prog.classList.remove('paused'); schedule(); });
  render(); schedule();
})();

/* ---- Reviews carousel (5.5 s, arrows, dots, swipe) ---- */
(function(){
  var track=$('[data-rtrack]'); if(!track) return;
  var section=track.closest('section'), dots=$$('[data-rdot]'), count=track.children.length, i=0, t=null, paused=false, dragX=0, swiping=false, sx=null, sy=null;
  var wrap=$('[data-rtouch]');
  function render(){
    track.className='flex'+(swiping?'':' transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]');
    track.style.transform='translateX(calc(-'+(i*100)+'% + '+dragX+'px))';
    dots.forEach(function(d,k){ d.className='h-2 transition-all duration-300 '+(k===i?'w-7 bg-gold':'w-2 bg-gold/25 hover:bg-gold/50'); });
  }
  function go(d){ i=(i+d+count)%count; render(); }
  function start(){ stop(); if(!paused) t=setInterval(function(){go(1);},5500); }
  function stop(){ if(t){clearInterval(t);t=null;} }
  $('[data-rprev]').addEventListener('click',function(){go(-1);});
  $('[data-rnext]').addEventListener('click',function(){go(1);});
  dots.forEach(function(d,k){ d.addEventListener('click',function(){i=k;render();}); });
  var hoverZone=wrap?wrap.parentNode.parentNode:null;
  if(hoverZone){ hoverZone.addEventListener('mouseenter',function(){paused=true;stop();}); hoverZone.addEventListener('mouseleave',function(){paused=false;start();}); }
  if(wrap){
    wrap.addEventListener('touchstart',function(e){ sx=e.touches[0].clientX; sy=e.touches[0].clientY; paused=true; stop(); },{passive:true});
    wrap.addEventListener('touchmove',function(e){ if(sx===null) return; var dx=e.touches[0].clientX-sx, dy=e.touches[0].clientY-sy; if(Math.abs(dx)>Math.abs(dy)){ dragX=dx; swiping=true; render(); } },{passive:true});
    wrap.addEventListener('touchend',function(){ if(Math.abs(dragX)>50){ i=(i+(dragX>0?-1:1)+count)%count; } dragX=0; swiping=false; sx=sy=null; render(); setTimeout(function(){paused=false;start();},200); });
  }
  render(); start();
})();

/* ---- Barber photo lightbox ---- */
(function(){
  var open=null;
  function close(){ if(!open) return; var el=open; open=null; el.className=el.className.replace('animate-[lightboxFadeIn_0.18s_ease-out]','animate-[lightboxFadeOut_0.15s_ease-in_forwards]'); setTimeout(function(){ el.remove(); document.body.style.overflow=''; },150); }
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') close(); });
  $$('[data-lightbox]').forEach(function(btn){
    btn.addEventListener('click',function(){
      if(open) return;
      var src=btn.getAttribute('data-lightbox'), name=btn.getAttribute('data-lb-name'), sub=btn.getAttribute('data-lb-sub');
      var box=document.createElement('div'); box.className='fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-[lightboxFadeIn_0.18s_ease-out]';
      box.innerHTML='<button aria-label="Close" class="absolute top-5 right-5 w-11 h-11 flex items-center justify-center border border-gold/30 text-gold hover:bg-gold/10 transition-colors">'+SVG_X+'</button>'+
        '<div class="relative max-w-lg w-full animate-[lightboxScaleIn_0.22s_cubic-bezier(0.22,1,0.36,1)]"><div class="w-full aspect-[3/4] bg-background border border-gold/30 overflow-hidden"><img src="'+src+'" alt="'+name+' — '+sub+' at Diamond Kutz Barbershop" class="w-full h-full object-contain" style="object-position:50% 20%"></div>'+
        '<div class="mt-4 text-center"><div class="font-heading text-foreground text-2xl font-bold">'+name+'</div><div class="text-gold text-[10px] uppercase tracking-[0.25em] mt-1">'+sub+'</div></div></div>';
      box.addEventListener('click',function(e){ if(e.target.closest('.max-w-lg')&&!e.target.closest('button')) return; close(); });
      document.body.appendChild(box); document.body.style.overflow='hidden'; open=box;
    });
  });
})();

/* footer year, as on the original */
$$('footer div').forEach(function(d){ if(d.children.length===0&&/^© \d{4} Diamond Kutz/.test(d.textContent)) d.textContent=d.textContent.replace(/\d{4}/,String(new Date().getFullYear())); });
})();
