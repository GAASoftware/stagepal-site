/* hero: StagePal "plays" — beat lights run, the pad's keys are pressed, the app switches verse ↔ chorus */
import { pausable } from "/assets/ui/ui.js";
(() => {
  const root = document.querySelector(".lv"); if(!root) return;
  const $$ = s => [...root.querySelectorAll(s)];
  const keys = $$(".lv-k"), pads = $$(".lv-pk"), beats = $$(".lv-beats i"), secEl = root.querySelector(".lv-lcd__s");
  const names = (root.dataset.secs || "").split("|");
  const L = (k, l) => keys[k] && keys[k].querySelector('[data-l="' + l + '"]');
  const set = (el, cls, on) => el && el.classList.toggle(cls, on);
  let sec = 1, pend = 0;
  function lights(){
    set(L(0, "s"), "on", true);
    set(L(1, "s"), "on", sec === 1); set(L(1, "s"), "pend", pend === 1);
    set(L(2, "s"), "on", sec === 2); set(L(2, "s"), "pend", pend === 2);
    if(secEl) secEl.textContent = names[sec] || "";
  }
  function press(k){
    const p = pads[k], c = keys[k]; if(p) p.classList.add("down"); if(c) c.classList.add("hit");
    setTimeout(() => { if(p) p.classList.remove("down"); if(c) c.classList.remove("hit"); }, 230);
  }
  // reduced motion: one calm, readable state
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){ lights(); return; }
  const BEAT = 60000 / 92, plan = { length: 8 };
  let bar = 0, beat = -1, timer = 0, running = false;
  function tick(){
    beat++;
    if(beat === 4){ beat = 0; bar = (bar + 1) % plan.length;
      if(bar === 4){ sec = 2; pend = 0; } if(bar === 0){ sec = 1; pend = 0; }
      lights(); }
    beats.forEach((b, i) => b.classList.toggle("on", i === beat));
    if(beat === 2 && bar === 3){ press(2); pend = 2; lights(); }   // pedal: chorus next
    if(beat === 2 && bar === 7){ press(1); pend = 1; lights(); }   // pedal: back to the verse
    timer = setTimeout(tick, BEAT);
  }
  let paused = false;
  function start(){ if(running || paused || document.hidden) return; running = true; timer = setTimeout(tick, 0); }
  function stop(){ running = false; clearTimeout(timer); }
  lights();
  // on load: the start key is pressed, then the rhythm runs; only a hidden tab or the pause button rests it
  setTimeout(() => { press(0); setTimeout(start, 260); }, document.documentElement.classList.contains("has-intro") ? 2700 : 1100);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  pausable(root, { pause(){ paused = true; stop(); }, resume(){ paused = false; start(); } });
})();
