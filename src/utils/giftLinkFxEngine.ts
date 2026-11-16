// @ts-nocheck
// Isolated native visual routine; build b05c8cc201. Regenerate: node scripts/extract-gift-effects.mjs
export function createLinkFx({a,e,Ut,nn,Ys}) { return (function () {
    const { h: s, esc: h } = a.UI, m = () => a.CaptureFX, Q = me => new Promise(ne => Ut(ne, me)), H = "assets/items/poke-ball.png", Sa = new Map;
    function z(me) { for (const ne of me.querySelectorAll("img")) {
        const We = () => { const ca = ne.naturalWidth, va = ne.naturalHeight; if (!ca)
            return; let J = Sa.get(ne.src); if (!J) {
            try {
                const le = document.createElement("canvas");
                le.width = ca, le.height = va;
                const X = le.getContext("2d");
                X.drawImage(ne, 0, 0);
                const _e = X.getImageData(0, 0, ca, va).data;
                let T = ca, L = -1, q = -1;
                for (let re = 0; re < va; re++)
                    for (let ce = 0; ce < ca; ce++)
                        _e[(re * ca + ce) * 4 + 3] > 40 && (ce < T && (T = ce), ce > L && (L = ce), re > q && (q = re));
                J = L < 0 ? null : { dx: ca / 2 - (T + L + 1) / 2, dy: va - 1 - q };
            }
            catch {
                J = null;
            }
            Sa.set(ne.src, J);
        } if (!J)
            return; const te = ne.getBoundingClientRect().width / ca || 1; ne.style.translate = `${Math.round(J.dx * te)}px ${Math.round(J.dy * te)}px`; };
        ne.complete && ne.naturalWidth ? We() : ne.addEventListener("load", We, { once: !0 });
    } }
    const se = 2, ya = ["#ffffff", "#d4f4ff", "#8fdcff", "#45a6f2", "#2160c2", "#112f6c"], Be = ["#ffffff", "#fff6c2", "#ffe066", "#ffb02e", "#d9701c", "#7a3416"], Je = ["#ffffff", "#f2ffc4", "#d8f77a", "#b5e04a", "#7fbf2e", "#3f7a17"], Ie = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5], v = (me, ne, We) => We >= 1 || We > 0 && Ie[(ne & 3) * 4 + (me & 3)] < We * 16, B = me => 1 - (1 - me) ** 3, Aa = me => { if (!me)
        return ya; const [ne, We, ca] = me.split(",").map(Number), va = (J, te) => Math.round(te > 0 ? J + (255 - J) * te : J * (1 + te)); return [1, .7, .35, 0, -.4, -.7].map(J => J === 1 ? "#ffffff" : `rgb(${va(ne, J)}, ${va(We, J)}, ${va(ca, J)})`); };
    function Oe(me) { const ne = document.createElement("canvas"), We = ne.getContext("2d"); ne.className = "lk-cv"; const ca = () => { ne.width = Math.ceil(innerWidth / se), ne.height = Math.ceil(innerHeight / se), ne.style.width = ne.width * se + "px", ne.style.height = ne.height * se + "px"; }; ca(); let va = [], J = [], te = [], le = 0, X = Ys.now(), _e = !0; const T = (Se, Xe, wa, ja = 1) => { Se = Math.round(Se), Xe = Math.round(Xe), v(Se, Xe, ja) && (We.fillStyle = wa, We.fillRect(Se, Xe, 1, 1)); }, L = (Se, Xe, wa, ja, ut = 1) => { We.fillStyle = ja, Se = Math.round(Se), Xe = Math.round(Xe); const ht = Math.ceil(wa); for (let Za = -ht; Za <= ht; Za++)
        for (let lt = -ht; lt <= ht; lt++)
            lt * lt + Za * Za <= wa * wa && v(Se + lt, Xe + Za, ut) && We.fillRect(Se + lt, Xe + Za, 1, 1); }, q = (Se, Xe, wa, ja, ut, ht = 1, Za = 0) => { if (wa < .5 || ja < .5)
        return; We.fillStyle = ut, Se = Math.round(Se), Xe = Math.round(Xe); const lt = Math.ceil(wa), Vt = Math.ceil(ja); for (let ds = -Vt; ds <= Vt; ds++)
        for (let it = -lt; it <= lt; it++) {
            const C = it * it / (wa * wa) + ds * ds / (ja * ja);
            C <= 1 && C >= Za * Za && v(Se + it, Xe + ds, ht) && We.fillRect(Se + it, Xe + ds, 1, 1);
        } }, re = (Se, Xe, wa, ja, ut = 1) => { Se = Math.round(Se), Xe = Math.round(Xe); for (let ht = -wa; ht <= wa; ht++)
        T(Se + ht, Xe, ja, ut), T(Se, Xe + ht, ja, ut); if (wa > 2)
        for (const [ht, Za] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
            T(Se + ht, Xe + Za, ja, ut); T(Se, Xe, "#fff", ut); }, ce = Se => { const Xe = Se.getBoundingClientRect(); return { x: Xe.left / se, y: Xe.top / se, w: Xe.width / se, h: Xe.height / se, cx: (Xe.left + Xe.width / 2) / se, cy: (Xe.top + Xe.height / 2) / se, a: +getComputedStyle(Se).opacity }; }, ha = (Se, Xe, wa = {}) => va.push({ x: Se, y: Xe, vx: 0, vy: 0, life: 0, wait: 0, max: 400, size: 1, heat: 0, grav: .02, drag: .96, pal: ya, ...wa }), p = (Se, Xe, wa, ja, ut = {}) => { for (let ht = 0; ht < wa; ht++) {
        const Za = Math.random() * 6.283, lt = ja * 1.5 * (.4 + Math.random() * .8);
        ha(Se, Xe, { vx: Math.cos(Za) * lt, vy: Math.sin(Za) * lt, max: 300 + Math.random() * 300, size: 1 + (Math.random() * 2 | 0), ...ut });
    } }, ge = (Se, Xe, wa, ja = 460, ut = 1, ht = ya) => J.push({ x: Se, y: Xe, r: wa, dur: ja, flat: ut, pal: ht, t0: le }); function b(Se) { const Xe = ce(Se.pad); if (Xe.a <= 0 || Xe.w < 2)
        return; const wa = Se.lit, ja = wa || ya, { cx: ut, cy: ht } = Xe, Za = Xe.a * .85 * (Se.dim ? .45 : 1), lt = Xe.w / 2, Vt = Xe.h / 2, ds = .5 + .5 * Math.sin(le / (wa ? 200 : 320)); q(ut, ht + 1, lt, Vt, ya[5], Za), q(ut, ht, lt, Vt, ja[wa ? 3 : 4], Za, .9), q(ut, ht, lt * (.5 + .06 * ds), Vt * (.5 + .06 * ds), ja[4], Za * (wa ? .8 : .5)), wa && q(ut, ht, lt * (.28 + .06 * ds), Vt * (.28 + .06 * ds), ja[3], Za * .7); for (let it = -lt * .6; it <= lt * .6; it++)
        T(ut + it, ht - Vt * Math.sqrt(1 - (it / lt) ** 2) + 1, ja[2], Za); Math.random() < (wa ? .3 : .05) * Za && ha(ut + (Math.random() - .5) * lt * 1.2, ht - 1, { vy: -.3 - Math.random() * .3, max: 700, grav: 0, drag: 1, heat: .3, pal: ja }); } const D = ["#ffffff", "#c9d2e6", "#8f9bba", "#5d6788", "#383f5c", "#1a1d2e"]; function we(Se, Xe) { const wa = Se.a, ja = 2, ut = Math.round(Xe ? Se.y : Se.x), ht = Math.round(Xe ? Se.y + Se.h : Se.x + Se.w), Za = Math.round(Xe ? Se.cx : Se.cy), lt = (Le, la, ma) => Xe ? T(Za + la, Le, ma, wa) : T(Le, Za + la, ma, wa); for (let Le = ut; Le <= ht; Le++)
        for (let la = -ja - 1; la <= ja + 1; la++)
            lt(Le, la, Math.abs(la) > ja ? D[5] : la === -ja ? D[1] : la < 0 ? D[2] : D[3]); if (!Xe || Se.h < 4)
        return; const Vt = 9, ds = 12, it = Za - (Vt >> 1), C = ht - 2; for (let Le = -1; Le <= Vt; Le++)
        for (let la = -1; la <= ds; la++)
            T(it + Le, C + la, Le < 0 || Le === Vt || la < 0 || la === ds ? D[5] : Le < 2 ? D[1] : Le > Vt - 3 ? D[4] : la > ds - 3 ? D[3] : D[2], wa); const A = .6 + .4 * Math.sin(le / 140); for (let Le = 1; Le < Vt - 1; Le += 2)
        T(it + Le, C + ds + 1, ya[1], wa), T(it + Le, C + ds + 2, ya[3], wa * A); } function Ee(Se) { const Xe = Se.ax / se, wa = Se.bx / se, ja = Math.round(Se.y / se), ut = (Xe + wa) / 2, ht = 2, Za = 7, lt = 11, Vt = Math.max(0, (ut - Xe - Za - 1) * Math.min(1, Se.k)), ds = (C, A) => { for (let Le = Math.round(Math.min(C, A)); Le <= Math.round(Math.max(C, A)); Le++)
        for (let la = -ht - 1; la <= ht + 1; la++)
            T(Le, ja + la, Math.abs(la) > ht ? D[5] : la === -ht ? D[1] : la < 0 ? D[2] : D[3]); }, it = (C, A) => { C = Math.round(C); const Le = A > 0 ? C : C - Za, la = ja - (lt >> 1); for (let Ue = -1; Ue <= Za; Ue++)
        for (let Qe = -1; Qe <= lt; Qe++)
            T(Le + Ue, la + Qe, Ue < 0 || Ue === Za || Qe < 0 || Qe === lt ? D[5] : Qe < 2 ? D[1] : Qe > lt - 3 ? D[4] : D[2]); const ma = Se.k >= 1 ? 1 : .5 + .5 * Math.sin(le / 120); for (let Ue = 1; Ue < lt - 1; Ue += 2)
        T(A > 0 ? Le + Za + 1 : Le - 2, la + Ue, ya[Se.k >= 1 ? 1 : 3], ma); }; ds(Xe, Xe + Vt), it(Xe + Vt, 1), ds(wa, wa - Vt), it(wa - Vt, -1); } const ee = Se => { const Xe = Se.getBoundingClientRect(); return { x: Xe.left + Xe.width / 2, y: Xe.bottom + 14 * se }; }; function Ne() { te = te.filter(Se => { const Xe = (le - Se.t0) / Se.dur; if (Xe >= 1)
        return !1; const wa = B(Xe), ja = Se.y0 + (Se.y1 - Se.y0) * wa, ut = Se.rx * (1 - .45 * wa), ht = Math.max(1.5, ut * .22), Za = Xe < .7 ? 1 : 1 - (Xe - .7) / .3, lt = Math.ceil(ut * 7); for (let Vt = 0; Vt < lt; Vt++) {
        const ds = Vt / lt * 6.283, it = Math.sin(ds) > 0;
        T(Se.x + Math.cos(ds) * ut, ja + Math.sin(ds) * ht, it ? Se.pal[1] : Se.pal[3], Za * (it ? 1 : .5));
    } return !0; }); } function ga() { J = J.filter(Se => { const Xe = (le - Se.t0) / Se.dur; if (Xe >= 1)
        return !1; const wa = Math.max(1, B(Xe) * Se.r), ja = wa * Se.flat, ut = Math.max(1, 3 * (1 - Xe)), ht = Xe < .55 ? 1 : 1 - (Xe - .55) / .45, Za = Math.ceil(wa), lt = Math.ceil(ja), Vt = Math.round(Se.x), ds = Math.round(Se.y); for (let it = -lt; it <= lt; it++)
        for (let C = -Za; C <= Za; C++) {
            const A = Math.sqrt(C * C + (it / Se.flat) ** 2);
            A > wa || A <= wa - ut || T(Vt + C, ds + it, A > wa - ut / 2 ? Se.pal[3] : Se.pal[1], ht);
        } return !0; }); } function na(Se) { const Xe = Se / 16; va = va.filter(wa => { if (wa.life += Se, wa.life > wa.max + wa.wait || wa.to && wa.life > wa.wait && (wa.vx += (wa.to.x - wa.x) * .03 * Xe, wa.vy += (wa.to.y - wa.y) * .03 * Xe, Math.abs(wa.to.x - wa.x) + Math.abs(wa.to.y - wa.y) < 3))
        return !1; wa.life > wa.wait && (wa.vx *= wa.drag ** Xe, wa.vy = wa.vy * wa.drag ** Xe + wa.grav * Xe, wa.x += wa.vx * Xe, wa.y += wa.vy * Xe); const ja = Math.max(0, wa.life - wa.wait) / wa.max, ut = wa.pal, ht = Math.min(5, Math.floor(wa.heat * 2 + ja * 4.4)); if (ja > .7 && Math.round(wa.x) + Math.round(wa.y) & 1)
        return !0; if (wa.star)
        re(wa.x, wa.y, Math.max(1, Math.round(wa.size * (1 - ja))), ut[Math.min(3, ht)]);
    else if (wa.round) {
        const Za = wa.size * (.6 + ja * .6);
        L(wa.x, wa.y, Za, ut[Math.min(5, ht + 1)]), ht < 3 && L(wa.x - Za * .2, wa.y - Za * .2, Za * .5, ut[ht]);
    }
    else {
        We.fillStyle = ut[ht];
        const Za = Math.max(1, Math.round(wa.size * (1 - ja * .5)));
        We.fillRect(Math.round(wa.x - Za / 2), Math.round(wa.y - Za / 2), Za, Za);
    } return !0; }); } const Ze = Se => { if (!_e)
        return; const Xe = Math.min(50, Se - X); X = Se, le += Xe, ne.width !== Math.ceil(innerWidth / se) && ca(), We.clearRect(0, 0, ne.width, ne.height); for (const ja of me.views || me.slots)
        b(ja); const wa = ce(me.tube); wa.a > 0 && wa.w > 1 && we(wa, !1); for (const ja of me.slots) {
        const ut = ce(ja.beam);
        ut.h > 1 && we(ut, !0);
    } me.link && Ee(me.link), Ne(), ga(), na(Xe), nn(Ze); }; nn(Ze); const Ea = Se => Se / se; return { cv: ne, tip: ee, stop: () => { _e = !1; }, emit: (Se, Xe, wa) => ha(Ea(Se), Ea(Xe), wa), burst: (Se, Xe, wa, ja, ut) => p(Ea(Se), Ea(Xe), wa, ja, ut), ring: (Se, Xe, wa, ja, ut, ht) => ge(Ea(Se), Ea(Xe), Ea(wa), ja, ut, ht), halo: (Se, Xe, wa, ja, ut = 700, ht = ya) => te.push({ x: Ea(Se), y0: Ea(Xe), y1: Ea(wa), rx: Ea(ja), dur: ut, pal: ht, t0: le }), dissolve(Se, Xe) { const wa = Se.getBoundingClientRect(), ja = Math.max(1, Math.round(wa.width / se)), ut = Math.max(1, Math.round(wa.height / se)), ht = document.createElement("canvas"); ht.width = ja, ht.height = ut; let Za; try {
            const C = ht.getContext("2d");
            C.drawImage(Se, 0, 0, ja, ut), Za = C.getImageData(0, 0, ja, ut).data;
        }
        catch {
            return;
        } const lt = wa.left / se, Vt = wa.top / se, ds = Ea(Xe.x), it = { x: ds, y: Ea(Xe.y) }; for (let C = 0; C < ut; C++)
            for (let A = 0; A < ja; A++)
                Za[(C * ja + A) * 4 + 3] < 120 || ha(lt + A, Vt + C, { to: it, wait: C / ut * 200 + Math.random() * 60, vx: (Math.random() - .5) * .6, vy: -.2 - Math.random() * .3, grav: 0, drag: .82, max: 420 + Math.random() * 200, heat: Math.random() < .5 ? 0 : .25, size: 1 }); } }; }
    function d({ cls: me = "", title: ne, face: We = "", slots: ca = 1 }) {
        const va = document.body.appendChild(s(`<div class="rc-fx lk-fx ${me}">
      <i class="lk-sky"></i>
      <div class="rc-title lk-title">${ne}</div>
      <div class="lk-stage">
        <i class="lk-tube"><b class="lk-portal a"></b><b class="lk-portal b"></b></i>
        ${'<div class="lk-slot"><span class="lk-pad"></span><div class="lk-mon"></div></div>'.repeat(ca)}
      </div>
      <div class="lk-box">${We}<p class="lk-say">&nbsp;</p><i class="lk-more">▼</i></div>
      <div class="lk-msg"></div>
      <div class="rc-tap">${e("Touche pour continuer")}</div>
      ${'<i class="lk-beam"></i>'.repeat(ca)}
      <div class="hm-fx"></div></div>`));
        ca > 1 && va.classList.add("multi");
        const J = _e => va.querySelector(_e), te = va.querySelectorAll(".lk-beam"), le = [...va.querySelectorAll(".lk-slot")].map((_e, T) => ({ node: _e, pad: _e.querySelector(".lk-pad"), mon: _e.querySelector(".lk-mon"), beam: te[T] })), X = { el: va, slots: le, ...le[0], fx: J(".hm-fx"), stage: J(".lk-stage"), tube: J(".lk-tube"), title: J(".lk-title"), box: J(".lk-box"), text: J(".lk-say"), more: J(".lk-more"), msg: J(".lk-msg"), tap: J(".rc-tap") };
        X.px = Oe(X), J(".lk-sky").after(X.px.cv), X.skip = a.UI.skippable(va), X.pause = _e => X.skip.skipped ? Promise.resolve() : Q(_e), X.T = _e => X.skip.skipped ? 1 : _e, X.at = _e => { const T = _e.getBoundingClientRect(), L = va.getBoundingClientRect(); return { x: T.left - L.left + T.width / 2, y: T.top - L.top + T.height / 2 }; };
        for (const _e of [X.title, X.box, X.tap, X.more, X.msg, X.tube, ...le.flatMap(T => [T.pad, T.mon, T.beam])])
            _e.style.opacity = 0;
        return X.views = le.map(_e => Object.assign(Object.create(X), _e)), X;
    }
    async function i(me) { const ne = "cubic-bezier(.2,1.4,.4,1)"; a.Sfx.whoosh?.(); const We = [me.el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, fill: "forwards" }), me.title.animate([{ transform: "translateY(-18px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 320, delay: 120, easing: "ease-out", fill: "both" }), ...me.slots.map((ca, va) => ca.pad.animate([{ transform: "scale(0, 0)", opacity: 0 }, { transform: "scale(1.25, .7)", opacity: 1, offset: .6 }, { transform: "scale(.92, 1.12)", offset: .8 }, { transform: "none", opacity: 1 }], { duration: me.T(480), delay: 160 + va * 90, easing: "ease-out", fill: "both" })), me.box.animate([{ transform: "translateY(14px) scale(.9, 1.1)", opacity: 0 }, { transform: "translateY(-3px) scale(1.03, .96)", opacity: 1, offset: .6 }, { transform: "none", opacity: 1 }], { duration: me.T(360), delay: 240, easing: ne, fill: "both" })]; for (const ca of [me.title, me.box, ...me.slots.map(va => va.pad)])
        ca.style.opacity = ""; await Promise.all(We.map(ca => ca.finished)); }
    async function P(me, ne) { const We = me.sayId = (me.sayId || 0) + 1; me.more.style.opacity = 0, me.text.innerHTML = ne; const ca = [], va = J => J.nodeType === 3 ? ca.push([J, J.textContent]) : J.childNodes.forEach(va); if (va(me.text), !me.skip.skipped) {
        ca.forEach(([J]) => { J.textContent = ""; });
        for (const [J, te] of ca)
            for (let le = 1; le <= te.length && !me.skip.skipped; le++) {
                if (me.sayId !== We)
                    return;
                J.textContent = te.slice(0, le), te[le - 1] !== " " && await me.pause(22);
            }
        if (me.sayId !== We)
            return;
        ca.forEach(([J, te]) => { J.textContent = te; });
    } me.more.style.opacity = ""; }
    const Ke = (me, ne, We) => { const ca = me.fx.appendChild(s(`<img class="tx-ball" src="${H}" alt="">`)); return Object.assign(ca.style, { left: ne + "px", top: We + "px" }), ca; }, Me = (me, ne = .6) => { const We = me.fx.appendChild(s('<span class="rc-flash"></span>')); We.animate([{ opacity: ne }, { opacity: 0 }], { duration: 380, easing: "ease-out", fill: "both" }).finished.then(() => We.remove()); }, qe = me => { const ne = me.at(me.pad); return { x: ne.x, y: ne.y }; }, aa = me => { const ne = qe(me); return Object.assign(me.beam.style, { left: ne.x + "px", height: Math.max(20, ne.y - (me.gap || 190)) + "px", transformOrigin: "50% 0" }), me.beam.style.opacity = "", ne; }, ae = (me, ne = 1) => me.beam.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1.06)", offset: .8 }, { transform: "scaleY(.98)", offset: .9 }, { transform: "none" }], { duration: me.T(650 * ne), easing: "ease-out", fill: "forwards" }).finished, Fe = me => me.beam.animate([{ transform: "none" }, { transform: "scaleY(1.05)", offset: .2 }, { transform: "scaleY(0)" }], { duration: me.T(420), easing: "ease-in", fill: "forwards" }).finished, be = (me, ne = 1) => { const We = qe(me); me.pad.animate([{ transform: "none" }, { transform: `scale(${1 + .25 * ne}, ${1 - .3 * ne})` }, { transform: "scale(.95, 1.08)" }, { transform: "none" }], { duration: me.T(320), easing: "ease-out" }), me.px.ring(We.x, We.y, 90 * ne, 460, .3), me.px.burst(We.x, We.y, Math.round(10 * ne), 1.6, { grav: .06, heat: .2 }); };
    async function Ce(me, ne = qe(me), { above: We = !1 } = {}) { const ca = me.mon.querySelector("img"), va = ca && me.at(ca).y - ca.getBoundingClientRect().height / 2, J = We && ca ? va - 28 : ne.y - 16, te = Ke(me, ne.x, J); return me.px.ring(ne.x, J, 40, 300), await te.animate([{ transform: "translate(-50%, -50%) scale(0)" }, { transform: "translate(-50%, -50%) scale(1.35, .7)", offset: .6 }, { transform: "translate(-50%, -50%) scale(.9, 1.1)", offset: .8 }, { transform: "translate(-50%, -50%)" }], { duration: me.T(320), easing: "ease-out", fill: "forwards" }).finished, await me.mon.animate([{ transform: "none", filter: "none" }, { transform: "scale(1.2, .8)", filter: "brightness(0) invert(1)", offset: .5 }, { transform: "scale(1.3, .7)", filter: "brightness(0) invert(1)" }], { duration: me.T(340), easing: "ease-in", fill: "forwards" }).finished, a.Sfx.open?.(), await me.mon.animate([{ transform: "scale(1.3, .7)" }, { transform: "scale(.7, 1.3)" }], { duration: me.T(120), easing: "ease-out", fill: "forwards" }).finished, me.skip.skipped || me.px.dissolve(me.mon.querySelector("img"), { x: ne.x, y: J }), me.mon.getAnimations().forEach(le => le.cancel()), me.mon.style.opacity = 0, te.animate([{ filter: "brightness(1)" }, { filter: "brightness(1.8)" }, { filter: "brightness(1)" }], { duration: me.T(700), easing: "steps(6)" }), await me.pause(700), Me(me, .3), me.px.ring(ne.x, J, 50, 340), be(me, .6), await te.animate([{ transform: "translate(-50%, -50%)" }, { transform: "translate(-50%, -50%) scale(1.3, .75)", offset: .4 }, { transform: "translate(-50%, -50%) scale(.92, 1.08)", offset: .75 }, { transform: "translate(-50%, -50%)" }], { duration: me.T(300), easing: "ease-out", fill: "forwards" }).finished, { b: te, by: J }; }
    async function ie(me) { const ne = aa(me); me.beam.getAnimations().forEach(te => te.cancel()), await ae(me), a.Sfx.heal?.(); const { b: We, by: ca } = await Ce(me, ne); await me.pause(150); const va = me.px.tip(me.beam), J = ca - va.y; return a.Sfx.whoosh?.(), await We.animate([{ transform: "translate(-50%, -50%)" }, { transform: "translate(-50%, calc(-50% + 4px)) scale(1.35, .65)", offset: .3 }, { transform: `translate(-50%, calc(-50% - ${J * .6}px)) scale(.6, 1.6)`, offset: .75 }, { transform: `translate(-50%, calc(-50% - ${J}px)) scale(.2, .6)` }], { duration: me.T(480), easing: "cubic-bezier(.5,0,.7,1)", fill: "forwards" }).finished, We.remove(), me.px.ring(va.x, va.y, 30, 300), me.px.burst(va.x, va.y, 8, 1.2, { grav: 0, heat: .2 }), me.beam.animate([{ transform: "none" }, { transform: "scaleY(.94)" }, { transform: "none" }], { duration: me.T(180) }), await me.pause(220), await Fe(me), me.mon.getAnimations().forEach(te => te.cancel()), me.mon.style.opacity = 0, ne; }
    async function E(me, ne) { me.pad.animate([{ transform: "none", opacity: 1 }, { transform: "scale(1.3, 0)", opacity: 0 }], { duration: me.T(240), easing: "ease-in", fill: "forwards" }), me.tube.style.opacity = "", await me.tube.animate([{ transform: "scaleX(0) scaleY(.2)" }, { transform: "scaleX(1.04) scaleY(1.4)", offset: .7 }, { transform: "none" }], { duration: me.T(420), easing: "ease-out", fill: "both" }).finished, a.Sfx.heal?.(); const [We, ca] = [...me.tube.querySelectorAll(".lk-portal")].map(me.at); me.px.ring(We.x, We.y, 36, 300), me.px.ring(ca.x, ca.y, 36, 300); const va = Ke(me, We.x, We.y), J = Ke(me, ca.x, ca.y), te = ca.x - We.x, le = (q, re) => q.animate([{ transform: "translate(-50%, -50%) scale(0)" }, { transform: "translate(-50%, -50%) scale(.7, 1.3)", offset: .08 }, { transform: `translate(calc(-50% + ${re * te * .1}px), -50%) scale(1.5, .7) rotate(${re * 180}deg)`, offset: .2 }, { transform: `translate(calc(-50% + ${re * te * .5}px), -50%) scale(1.8, .6) rotate(${re * 720}deg)`, offset: .5 }, { transform: `translate(calc(-50% + ${re * te * .9}px), -50%) scale(1.5, .7) rotate(${re * 1260}deg)`, offset: .85 }, { transform: `translate(calc(-50% + ${re * te}px), -50%) scale(.6, 1.3) rotate(${re * 1440}deg)`, offset: .94 }, { transform: `translate(calc(-50% + ${re * te}px), -50%) scale(0) rotate(${re * 1440}deg)` }], { duration: me.T(1600), easing: "cubic-bezier(.45,0,.55,1)", fill: "forwards" }), X = le(va, 1), _e = le(J, -1), T = (async () => { for (let q = 0; q < 26 && !me.skip.skipped; q++) {
        for (const [re, ce] of [[va, -1], [J, 1]]) {
            const ha = me.at(re);
            me.px.emit(ha.x, ha.y, { vx: ce * .5, vy: (Math.random() - .5) * .2, size: 1, heat: .2, max: 220, grav: 0 });
        }
        await me.pause(60);
    } })(); await me.pause(800); const L = me.at(me.tube); Me(me, .55), me.px.ring(L.x, L.y, 90, 480, 1, Be), me.px.ring(L.x, L.y, 55, 380), me.px.burst(L.x, L.y, 26, 2.6, { pal: Be, round: !0, grav: .03, heat: .1 }), me.px.burst(L.x, L.y, 8, 1.8, { pal: Be, star: !0, size: 3, grav: 0, drag: .93, max: 520 }), m().shake(me.stage, 5, 200), me.tube.animate([{ transform: "none" }, { transform: "scaleY(1.8)" }, { transform: "scaleY(.8)" }, { transform: "none" }], { duration: me.T(300) }), ne?.(), await Promise.all([X.finished, _e.finished, T]), me.px.ring(We.x, We.y, 40, 320), me.px.ring(ca.x, ca.y, 40, 320), va.remove(), J.remove(), await me.tube.animate([{ transform: "none", opacity: 1 }, { transform: "scaleX(1.05) scaleY(0)", opacity: 0 }], { duration: me.T(260), easing: "ease-in", fill: "forwards" }).finished, me.pad.getAnimations().forEach(q => q.cancel()), await me.pad.animate([{ transform: "scale(0, 0)" }, { transform: "scale(1.25, .7)", offset: .6 }, { transform: "none" }], { duration: me.T(360), easing: "ease-out", fill: "both" }).finished; }
    async function F(me, ne) { await ve(me, await ye(me, ne)); }
    async function ye(me, { sp: ne = 1, onTouch: We, cable: ca = !0 } = {}) { const va = X => me.T(X * ne), J = ca ? aa(me) : qe(me); let te = J.y - 16 + 40; const le = Ke(me, J.x, J.y - 16); if (ca) {
        me.beam.getAnimations().forEach(_e => _e.cancel()), le.style.opacity = 0, await ae(me, ne), a.Sfx.heal?.();
        const X = me.px.tip(me.beam);
        te = J.y - 16 - X.y, le.style.opacity = "", me.px.ring(X.x, X.y, 30, 300), await le.animate([{ transform: `translate(-50%, calc(-50% - ${te}px)) scale(0)` }, { transform: `translate(-50%, calc(-50% - ${te}px)) scale(1.3, .7)`, offset: .6 }, { transform: `translate(-50%, calc(-50% - ${te}px)) scale(.8, 1.25)` }], { duration: va(200), easing: "ease-out", fill: "forwards" }).finished;
    }
    else
        a.Sfx.whoosh?.(); await le.animate([{ transform: `translate(-50%, calc(-50% - ${te}px)) scale(.8, 1.25) rotate(0)` }, { transform: "translate(-50%, calc(-50% - 16px)) scale(.75, 1.35) rotate(900deg)", offset: .9 }, { transform: "translate(-50%, calc(-50% + 6px)) scale(1.5, .55) rotate(1080deg)" }], { duration: va(600), easing: "cubic-bezier(.5,0,.9,.6)", fill: "forwards" }).finished, be(me), We?.(), ca && Fe(me), m().shake(me.stage, 3, 160); for (const [X, _e, T] of [[48, 420, .6], [16, 260, .3]])
        await le.animate([{ transform: "translate(-50%, calc(-50% + 6px)) scale(1.5, .55) rotate(1080deg)" }, { transform: `translate(-50%, calc(-50% - ${X * .7}px)) scale(.85, 1.2) rotate(1080deg)`, offset: .3 }, { transform: `translate(-50%, calc(-50% - ${X}px)) scale(1, 1) rotate(1080deg)`, offset: .5 }, { transform: `translate(-50%, calc(-50% - ${X * .4}px)) scale(.88, 1.15) rotate(1080deg)`, offset: .82 }, { transform: `translate(-50%, calc(-50% + ${T * 8}px)) scale(${1 + T * .7}, ${1 - T * .6}) rotate(1080deg)` }], { duration: va(_e), easing: "linear", fill: "forwards" }).finished, be(me, T); return await le.animate([{ transform: "translate(-50%, calc(-50% + 3px)) scale(1.2, .82) rotate(1080deg)" }, { transform: "translate(-50%, -50%) rotate(1080deg)" }], { duration: va(160), easing: "ease-out", fill: "forwards" }).finished, le; }
    async function ve(me, ne, { quick: We = !1 } = {}) { const ca = qe(me); for (const [va, J] of We ? [[24, 200]] : [[18, 340], [24, 260], [30, 190]])
        await ne.animate([{ transform: "translate(-50%, -50%) rotate(0)" }, { transform: `translate(-50%, -50%) rotate(${-va}deg) scale(1.1, .9)` }, { transform: `translate(-50%, -50%) rotate(${va}deg) scale(1.1, .9)` }, { transform: "translate(-50%, -50%) rotate(0)" }], { duration: me.T(J), easing: "ease-in-out" }).finished, await me.pause(90); await ne.animate([{ transform: "translate(-50%, -50%)", filter: "none" }, { transform: "translate(-50%, -50%) scale(1.3, .75)", filter: "brightness(2)" }], { duration: me.T(180), fill: "forwards" }).finished, ne.remove(), a.Sfx.open?.(), Me(me), be(me, 1.2), me.px.ring(ca.x, ca.y - 12, 70, 420, 1, Be), me.px.burst(ca.x, ca.y - 12, 30, 2.4, { pal: Be, round: !0, grav: .04 }), me.px.burst(ca.x, ca.y - 12, 8, 1.6, { pal: Be, star: !0, size: 3, grav: 0, drag: .93, max: 560 }); }
    async function xe(me, ne, We) { me.mon.getAnimations().forEach(J => J.cancel()), me.mon.innerHTML = ne, z(me.mon); const ca = me.mon.querySelector("img"); ca.style.filter = "brightness(0) invert(1)", me.mon.style.opacity = "", await me.mon.animate([{ transform: "translateY(0) scale(.2)", opacity: 0 }, { transform: "translateY(-60px) scale(.85, 1.2)", opacity: 1, offset: .4 }, { transform: "translateY(0) scale(1.3, .75)", offset: .65 }, { transform: "translateY(-14px) scale(.94, 1.08)", offset: .82 }, { transform: "none", opacity: 1 }], { duration: me.T(760), easing: "ease-out", fill: "both" }).finished, ca.style.filter = ""; const va = me.at(me.mon); Me(me, .25), me.px.burst(va.x, va.y, 14, 1.8, { pal: Be, grav: .05 }), me.px.burst(va.x, va.y - 10, 6, 1.2, { pal: Be, star: !0, size: 2, grav: 0, drag: .93, max: 600 }), We && m().shinySparkle(me.fx, me.mon), a.Sfx.caught?.(), me.mon.animate([{ transform: "none" }, { transform: "scale(1.12, .88)", offset: .12 }, { transform: "translateY(-12px) scale(.92, 1.1)", offset: .3 }, { transform: "scale(1.1, .9)", offset: .5 }, { transform: "translateY(-9px) scale(.94, 1.07)", offset: .7 }, { transform: "scale(1.06, .94)", offset: .88 }, { transform: "none" }], { duration: 760, delay: 150 }); }
    async function ea({ title: me, choices: ne, level: We, onEscape: ca }) { const { artImg: va, types: J, setArtAnim: te, spriteGlow: le } = a.UI, X = a.Game, _e = d({ cls: "lk-choice", title: me, slots: ne.length }); _e.gap = 150; const T = await Promise.all(ne.map(Ee => new Promise(ee => { const Ne = new Image; Ne.onload = () => ee(Math.max(Ne.naturalWidth, Ne.naturalHeight)), Ne.onerror = () => ee(0), Ne.src = a.UI.artSrc(Ee, !1, !0); }))), L = Math.max(1, Math.min(2, Math.floor(160 / Math.max(1, ...T)))), q = _e.views, re = Ee => va(Ee, !1, { still: !0, k: L }), ce = Aa, ha = await Promise.all(ne.map(Ee => le(a.UI.monSrc(Ee)).catch(() => null))), p = s(`<button class="btn primary lg lk-go" disabled>${e("Choisis un Pokémon")}</button>`); let ge = null, b, D = new Promise(Ee => { b = Ee; }), we = null; try {
        await i(_e), P(_e, e("Choisis un Pokémon !"));
        const Ee = [];
        await new Promise(Ea => { let Se = q.length; const Xe = (wa, ja) => { ha[wa] && q[wa].node.style.setProperty("--g", ha[wa]), Ee.push(ye(q[wa], { sp: ja, cable: !1, onTouch: () => { wa + 1 < q.length && Xe(wa + 1, ja * .8); } }).then(ut => ve(q[wa], ut, { quick: !0 })).then(() => xe(q[wa], re(ne[wa]), !1))), --Se || Ea(); }; Xe(0, .85); }), await Promise.all(Ee), _e.skip.end(), _e.tap.replaceWith(p), p.animate([{ transform: "scale(.85)", opacity: 0 }, { transform: "scale(1.05)", opacity: 1, offset: .6 }, { transform: "none", opacity: 1 }], { duration: 260, easing: "ease-out", fill: "both" });
        const ee = Ea => { if (ge === ne[Ea])
            return; ge != null && te(q[ne.indexOf(ge)].mon.querySelector("img"), ge, !1, !1), ge = ne[Ea], q.forEach((wa, ja) => { wa.node.classList.toggle("on", ja === Ea), wa.node.classList.toggle("off", ja !== Ea), wa.lit = ja === Ea && ha[Ea] ? ce(ha[Ea]) : ja === Ea ? ya : null, wa.dim = ja !== Ea; }); const Se = q[Ea], Xe = Se.mon.querySelector("img"); te(Xe, ge, !1, !0), a.Sfx.click?.(), Se.mon.animate([{ transform: "none" }, { transform: "scale(1.15, .85)", offset: .2 }, { transform: "translateY(-16px) scale(.9, 1.12)", offset: .5 }, { transform: "scale(1.08, .92)", offset: .8 }, { transform: "none" }], { duration: 420, easing: "ease-out" }), Se.pad.animate([{ transform: "none" }, { transform: "scale(1.15, .85)" }, { transform: "none" }], { duration: 300, easing: "ease-out" }), _e.px.ring(_e.at(Se.pad).x, _e.at(Se.pad).y, 70, 420, .3, Se.lit), P(_e, `<b>${h(X.DEX[ge].name)}</b> ${J(ge, !0)} <small>${e("Nv. {n}", { n: We })}</small>`), p.disabled = !1, p.textContent = e("Choisir {name}", { name: X.DEX[ge].name }); };
        q.forEach((Ea, Se) => { Ea.node.classList.add("pick"), Ea.node.onclick = () => ee(Se); }), p.onclick = () => { ge != null && b(ge); }, ca && (we = Ea => { Ea.key === "Escape" && (Ea.preventDefault(), b("escape")); }, document.addEventListener("keydown", we));
        const Ne = await D;
        if (we && document.removeEventListener("keydown", we), q.forEach(Ea => { Ea.node.onclick = null, Ea.node.classList.remove("pick"); }), p.disabled = !0, Ne === "escape") {
            const Ea = ca(), Se = q[q.length >> 1];
            return p.replaceWith(_e.tap), _e.tap.style.opacity = 0, q.forEach(Xe => { Xe.lit = null, Xe.dim = !1, Xe.node.classList.remove("on", "off"), Xe.mon.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" }); }), q.filter(Xe => Xe !== Se).forEach(Xe => Xe.pad.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: "forwards" })), _e.title.textContent = Ea.title, P(_e, "…"), await Q(400), Se.mon.getAnimations().forEach(Xe => Xe.cancel()), await F(Se, { cable: !1 }), await xe(Se, va(Ea.id, !1, { k: 2, fit: 128 }), !1), await P(_e, e("Tu reçois <b>{name}</b> Nv. {n} !", { name: h(X.DEX[Ea.id].name), n: We })), _e.tap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: "both" }), _e.tap.style.opacity = "", await new Promise(Xe => _e.el.addEventListener("pointerdown", Xe, { once: !0 })), Ea.id;
        }
        const ga = ne.indexOf(Ne), na = q[ga];
        p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" }), q.forEach((Ea, Se) => { Se !== ga && (Ea.mon.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(.6) translateY(20px)" }], { duration: 300, easing: "ease-in", fill: "forwards" }), Ea.pad.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: "forwards" })); }), await P(_e, e("Tu choisis <b>{name}</b> !", { name: h(X.DEX[Ne].name) })), na.lit = na.lit || ya;
        const { b: Ze } = await Ce(na, void 0, { above: !0 });
        return await Q(200), a.Sfx.whoosh?.(), await Ze.animate([{ transform: "translate(-50%, -50%)", opacity: 1 }, { transform: "translate(-50%, calc(-50% + 4px)) scale(1.3, .7)", offset: .25 }, { transform: "translate(-50%, calc(-50% - 40px)) scale(2.2, 2.6)", opacity: 1, offset: .7 }, { transform: "translate(-50%, calc(-50% - 20px)) scale(4)", opacity: 0 }], { duration: 520, easing: "ease-in", fill: "forwards" }).finished, Ze.remove(), Me(_e, .5), await Q(200), Ne;
    }
    finally {
        we && document.removeEventListener("keydown", we), await $a(_e);
    } }
    async function Pe({ from: me, to: ne, shiny: We, onEvolve: ca, duplicate: va }) { const { artImg: J, artSrc: te, setArtAnim: le, spriteGlow: X } = a.UI, _e = a.Game, T = h(_e.DEX[me].name), L = h(_e.DEX[ne].name), q = d({ cls: "lk-evo", title: e("Évolution") }), re = q.mon, ce = re.cloneNode(); re.after(ce), re.innerHTML = J(me, We, { still: !0, k: 3, fit: 220 }), ce.innerHTML = J(ne, We, { still: !0, k: 3, fit: 220 }), z(re), z(ce), ce.style.opacity = 0; const [ha, p] = await Promise.all([X(te(me, We, !0)), X(te(ne, We, !0))].map(we => we.catch(() => null))), ge = We ? Be : null; q.views[0].dim = !0; const b = we => `brightness(0) invert(1) drop-shadow(0 0 ${2 + we * .6}px rgba(255,255,255,.9)) drop-shadow(0 0 ${6 + we * 1.4}px rgba(${ha || "255,255,255"}, .5))`; let D = !1; try {
        await i(q), re.style.opacity = "", await re.animate([{ transform: "translateY(-80px) scale(.8, 1.25)", opacity: 0 }, { transform: "translateY(0) scale(1.3, .72)", opacity: 1, offset: .55 }, { transform: "translateY(-12px) scale(.94, 1.08)", offset: .78 }, { transform: "none", opacity: 1 }], { duration: q.T(520), easing: "ease-in", fill: "both" }).finished, be(q, .6), a.Sfx.evolve?.(), await P(q, e("Hein ? <b>{name}</b> évolue !", { name: T })), await q.pause(300), Me(q, .3), re.querySelector("img").style.filter = b(0), D = !0, (async () => { for (; D && !q.skip.skipped;) {
            const Se = q.at(re.style.opacity === "0" ? ce : re);
            m().particles(q.fx, Se.x + (Math.random() - .5) * 180, Se.y + 60, { n: 1, colors: We ? ["#ffe066", "#fff6d8"] : ["#fff", "#fff6d8"], size: 6, spread: 6, up: 120, dur: 900, gravity: -40 }), await Q(70);
        } })();
        let we = 0;
        const Ee = We ? Be : Aa(ha), ee = ["#ffffff", "#ffffff", "#fff6d8", "#ffe9b8", "#e8d6a8", "#b8a888"];
        (async () => { let Se = 0; for (; D && !q.skip.skipped;) {
            const Xe = re.style.opacity === "0" ? ce : re, wa = Xe.querySelector("img").getBoundingClientRect(), ja = q.el.getBoundingClientRect(), ut = wa.left - ja.left + wa.width / 2, ht = wa.top - ja.top + wa.height * .55, Za = wa.bottom - ja.top, lt = wa.top - ja.top;
            for (let Vt = 1 + Math.round(we * 2); Vt--;) {
                const ds = Math.random() * 6.283, it = 110 + Math.random() * 60;
                q.px.emit(ut + Math.cos(ds) * it, ht + Math.sin(ds) * it * .8, { to: { x: ut / se, y: ht / se }, vx: -Math.sin(ds) * 1.2, vy: Math.cos(ds) * 1.2, drag: .9, grav: 0, round: Math.random() < .6, size: 1.5 + Math.random(), pal: Ee, heat: .1, max: 900 });
            }
            Se % Math.max(2, 7 - Math.round(we * 5)) === 0 && q.px.halo(ut, Za - 4, lt + 10, wa.width * .55, 650 - we * 250, Math.random() < .5 ? Ee : ee), Math.random() < .3 + we * .4 && q.px.emit(wa.left - ja.left + Math.random() * wa.width, wa.top - ja.top + Math.random() * wa.height, { star: !0, size: 2 + (Math.random() < .3), pal: ee, grav: 0, drag: 1, max: 380 }), Se++, await Q(60);
        } })();
        const Ne = 15;
        ce.querySelector("img").style.filter = b(0);
        let ga = 460;
        for (let Se = 0; Se < Ne; Se++) {
            const [Xe, wa] = Se % 2 ? [ce, re] : [re, ce];
            wa.querySelector("img").style.filter = b(Se), Xe.animate([{ transform: "none", opacity: 1 }, { transform: "scale(1.25, .55)", opacity: 0 }], { duration: q.T(ga), easing: "ease-in", fill: "forwards" }), await wa.animate([{ transform: "scale(.55, 1.45)", opacity: 0 }, { transform: "scale(.9, 1.15)", opacity: 1, offset: .55 }, { transform: "scale(1.06, .95)", opacity: 1, offset: .85 }, { transform: "none", opacity: 1 }], { duration: q.T(ga), easing: "ease-out", fill: "forwards" }).finished, ga *= (70 / 460) ** (1 / (Ne - 1)), we = (Se + 1) / Ne;
        }
        D = !1, re.getAnimations().forEach(Se => Se.cancel()), re.style.opacity = 0, await ce.animate([{ transform: "none" }, { transform: "scale(1.3, .72)", offset: .45, easing: "ease-in" }, { transform: "scale(.85, 1.35)", offset: .8 }, { transform: "scale(1.25)" }], { duration: q.T(520), fill: "forwards" }).finished, ca?.();
        const na = q.at(ce), Ze = ge || Aa(p), Ea = ce.querySelector("img");
        Me(q, .8), a.Sfx.open?.(), m().shake(q.stage, 6, 300), q.px.ring(na.x, na.y, 170, 620, 1, Be), q.px.ring(na.x, na.y, 110, 500, 1, Ze), Ut(() => q.px.ring(na.x, na.y, 230, 800), 120), q.px.burst(na.x, na.y, 34, 3, { pal: Ze, round: !0, grav: .04, heat: .1 }), q.px.burst(na.x, na.y, 12, 2.2, { pal: Be, star: !0, size: 3, grav: 0, drag: .93, max: 700 }), Ea.style.filter = "", le(Ea, ne, We, !0), ce.style.opacity = "", ce.getAnimations().forEach(Se => Se.cancel()), await ce.animate([{ transform: "scale(1.25)", easing: "ease-in" }, { transform: "translateY(-30px) scale(.9, 1.12)", offset: .25, easing: "ease-in" }, { transform: "translateY(0) scale(1.4, .62)", offset: .5, easing: "ease-out" }, { transform: "translateY(-24px) scale(.9, 1.14)", offset: .7, easing: "ease-in" }, { transform: "translateY(0) scale(1.15, .86)", offset: .86 }, { transform: "none" }], { duration: q.T(900), fill: "both" }), await q.pause(450), be(q, 1), m().shake(q.stage, 3, 160), await q.pause(450), We ? m().shinySparkle(q.fx, ce, { waves: 3 }) : a.Sfx.caught?.(), ce.animate([{ transform: "none" }, { transform: "scale(1.12, .88)", offset: .12 }, { transform: "translateY(-26px) scale(.92, 1.1)", offset: .3 }, { transform: "scale(1.12, .88)", offset: .48 }, { transform: "translateY(-16px) scale(.95, 1.06)", offset: .66 }, { transform: "scale(1.06, .94)", offset: .84 }, { transform: "none" }], { duration: 900, delay: 200 }), q.skip.hide(), await P(q, e("Félicitations ! <b>{from}</b> a évolué en <b>{to}</b> !", { from: T, to: L })), va && (await P(q, e("Tu en as déjà un…")), q.mon = ce, await ue(q, va)), await he(q);
    }
    finally {
        D = !1, await $a(q);
    } }
    async function ue(me, ne) { await me.pause(900), a.Sfx.bonk?.(), me.mon.getAnimations().forEach(J => J.cancel()), await me.mon.animate([{ filter: "none", transform: "none" }, { filter: "brightness(0) invert(1)", transform: "scale(1.1)", offset: .35 }, { filter: "brightness(0) invert(1)", transform: "scale(0)" }], { duration: me.T(600), easing: "ease-in", fill: "forwards" }).finished; const We = me.slots[0].node, ca = We.appendChild(s(`<div class="lk-xp">${a.UI.xpIcon()}</div>`)), va = me.at(ca); me.px.burst(va.x, va.y, 14, 1.8, { pal: Je, star: !0, size: 2, grav: 0, drag: .93, max: 700 }), a.Sfx.caught?.(); for (let J = 0; J < 9; J++) {
        const te = We.appendChild(s('<div class="xp-ball lk-ball"></div>')), le = Math.PI * (1.1 + .8 * J / 8), X = 50 + Math.random() * 40;
        te.animate([{ transform: "translate(-50%, 50%) scale(.3)", opacity: 0 }, { transform: `translate(calc(-50% + ${Math.cos(le) * X}px), calc(50% + ${Math.sin(le) * X * .7}px)) scale(1.2)`, opacity: 1, offset: .35 }, { transform: `translate(calc(-50% + ${Math.cos(le) * X * 1.1}px), calc(50% + ${Math.sin(le) * X * .7 - 70}px)) scale(.6)`, opacity: 0 }], { duration: me.T(900 + Math.random() * 300), easing: "ease-out", fill: "forwards" }).finished.then(() => te.remove());
    } await ca.animate([{ transform: "scale(0)" }, { transform: "scale(1.3, .8)", offset: .6 }, { transform: "scale(.9, 1.1)", offset: .8 }, { transform: "none" }], { duration: me.T(520), easing: "ease-out", fill: "both" }).finished, be(me, .5), await P(me, ne.html); }
    async function ua({ id: me, shiny: ne, egg: We, eggSrc: ca, duplicate: va, ask: J }) { const { artImg: te, artSrc: le, spriteGlow: X } = a.UI, _e = a.Game, T = h(_e.DEX[me].name), L = d({ cls: "lk-hatch" + (ne ? " shiny" : ""), title: e("Éclosion") }); L.views[0].dim = !0; const q = L.slots[0].node, re = s(`<div class="hx-egg lk-egg">${We}</div>`), ce = [s(`<img class="hx-half lk-half top" src="${ca}" alt="">`), s(`<img class="hx-half lk-half bot" src="${ca}" alt="">`)]; q.append(re, ...ce), re.style.opacity = 0, L.mon.innerHTML = te(me, ne, { k: 3, fit: 220 }), z(L.mon); const ha = X(le(me, ne, !0)).catch(() => null), p = ["#ffffff", "#fbf8e6", "#f3efd8", "#cfe7b0", "#9fd27a", "#5e8f45"], ge = ["#ffffff", "#ffffff", "#fff6d8", "#ffe9b8", "#e8d6a8", "#b8a888"], b = () => L.at(re.querySelector(".hx-shell")); try {
        await i(L);
        const D = L.at(L.pad).y + 40;
        re.style.opacity = "", a.Sfx.whoosh?.();
        const we = re.animate([{ transform: `translateY(${-D}px) scale(.85, 1.2)`, easing: "cubic-bezier(.5,0,1,.6)" }, { transform: "translateY(0) scale(1.4, .65)", offset: .45, easing: "ease-out" }, { transform: "translateY(-44px) scale(.9, 1.12)", offset: .65, easing: "ease-in" }, { transform: "translateY(0) scale(1.18, .85)", offset: .8, easing: "ease-out" }, { transform: "translateY(-12px) scale(.97, 1.04)", offset: .9, easing: "ease-in" }, { transform: "none" }], { duration: L.T(950), fill: "both" });
        await L.pause(430), a.Sfx.thud?.(), be(L, .8), await L.pause(330), be(L, .35), await we.finished, await P(L, e("Oh ?")), await L.pause(300);
        for (const [Ze, Ea] of [[0, 10], [1, 18], [2, 28]]) {
            a.Sfx.shake?.(), re.style.setProperty("--gi", 1 + Ze * .6), await re.animate([{ transform: "rotate(0)" }, { transform: `rotate(${-Ea}deg) scale(1.04, .96)`, offset: .2 }, { transform: `rotate(${Ea}deg) scale(1.04, .96)`, offset: .45 }, { transform: `rotate(${-Ea / 2}deg)`, offset: .7 }, { transform: "rotate(0)" }], { duration: L.T(520 - Ze * 60), easing: "ease-in-out" }).finished;
            const Se = b();
            L.el.classList.add("crack" + (Ze + 1)), L.px.burst(Se.x, Se.y + 10, 4 + Ze * 4, 1.4 + Ze * .4, { pal: p, grav: .12, heat: 0, size: 2 }), L.px.halo(Se.x, Se.y + 50, Se.y - 40, 46 + Ze * 6, 600, Ze === 2 ? Be : ge), Ze && a.Sfx.bonk?.(), await L.pause([550, 420, 200][Ze]);
        }
        await re.animate([{ filter: "brightness(1)", transform: "none", easing: "ease-out" }, { filter: "brightness(1.5)", transform: "scale(1.3, .7)", offset: .4, easing: "ease-in" }, { filter: "brightness(0) invert(1)", transform: "scale(.82, 1.3)", offset: .75 }, { filter: "brightness(0) invert(1)", transform: "scale(1.35)" }], { duration: L.T(560), fill: "forwards" }).finished, a.Sfx.open?.();
        const Ee = b();
        re.style.opacity = 0, Me(L, .85), m().shake(L.stage, 8, 320), L.px.ring(Ee.x, Ee.y, 160, 600, 1, ne ? Be : ge), L.px.ring(Ee.x, Ee.y, 100, 480, 1, p), L.px.burst(Ee.x, Ee.y, 26, 3, { pal: p, grav: .14, heat: 0, size: 2 + (Math.random() < .5) }), L.px.burst(Ee.x, Ee.y, 12, 2.2, { pal: ne ? Be : ge, star: !0, size: 3, grav: 0, drag: .93, max: 700 }), ce[0].animate([{ opacity: 1, transform: "none" }, { opacity: 1, transform: "translate(-90px, -150px) rotate(-80deg)", offset: .5 }, { opacity: 0, transform: "translate(-130px, -60px) rotate(-140deg)" }], { duration: 900, easing: "cubic-bezier(.2,.8,.4,1)", fill: "forwards" }), ce[1].animate([{ opacity: 1, transform: "none" }, { opacity: 1, transform: "translate(90px, -60px) rotate(60deg)", offset: .45 }, { opacity: 0, transform: "translate(130px, 40px) rotate(120deg)" }], { duration: 900, easing: "cubic-bezier(.2,.8,.4,1)", fill: "forwards" });
        const ee = await ha;
        ee && L.mon.style.setProperty("--g", ee);
        const Ne = L.mon.querySelector("img");
        Ne.style.filter = "brightness(0) invert(1)", L.mon.style.opacity = "";
        const ga = L.mon.animate([{ transform: "translateY(30px) scale(.1)", opacity: 0, easing: "cubic-bezier(.2,.9,.4,1)" }, { transform: "translateY(-90px) scale(.75, 1.35)", opacity: 1, offset: .3, easing: "ease-in" }, { transform: "translateY(-110px) scale(.95, 1.05)", offset: .4, easing: "ease-in" }, { transform: "translateY(0) scale(1.45, .6)", offset: .62, easing: "ease-out" }, { transform: "translateY(-34px) scale(.88, 1.16)", offset: .76, easing: "ease-in" }, { transform: "translateY(0) scale(1.15, .86)", offset: .88, easing: "ease-out" }, { transform: "none", opacity: 1 }], { duration: L.T(1150), fill: "both" });
        await L.pause(1150 * .62), a.Sfx.thud?.(), be(L, 1), Ne.style.filter = "", Me(L, .25), await ga.finished;
        const na = L.at(L.mon);
        if (ne ? m().shinySparkle(L.fx, L.mon, { waves: 3 }) : a.Sfx.caught?.(), L.px.burst(na.x, na.y, 14, 1.8, { pal: ne ? Be : Aa(ee), grav: .05 }), L.px.burst(na.x, na.y - 10, 6, 1.2, { pal: Be, star: !0, size: 2, grav: 0, drag: .93, max: 600 }), L.mon.animate([{ transform: "none" }, { transform: "scale(1.12, .88)", offset: .12 }, { transform: "translateY(-26px) scale(.92, 1.1)", offset: .3 }, { transform: "scale(1.12, .88)", offset: .48 }, { transform: "translateY(-16px) scale(.95, 1.06)", offset: .66 }, { transform: "scale(1.06, .94)", offset: .84 }, { transform: "none" }], { duration: 900, delay: 200 }), J) {
            await P(L, J.html), L.more.style.opacity = 0;
            const Ze = s(`<div class="lk-ask"><button class="btn ghost">${J.no}</button><button class="btn">${e("Garder")}</button></div>`);
            L.tap.replaceWith(Ze), Ze.animate([{ transform: "scale(.85)", opacity: 0 }, { transform: "scale(1.05)", opacity: 1, offset: .6 }, { transform: "none", opacity: 1 }], { duration: 260, easing: "ease-out" });
            const Ea = await new Promise(Xe => { const [wa, ja] = Ze.querySelectorAll("button"); wa.onclick = () => Xe(!1), ja.onclick = () => Xe(!0); });
            Ze.replaceWith(L.tap);
            const Se = await J.pick(Ea);
            Se ? await ue(L, Se) : (a.Sfx.caught?.(), await P(L, e("<b>{name}</b> est né !", { name: T })));
        }
        else
            await P(L, va ? e("C'était un <b>{name}</b> ! Déjà dans ton PC…", { name: T }) : e("<b>{name}</b> est né !", { name: T }) + (ne ? " " + a.UI.shinyIc() : "")), va && await ue(L, va);
        L.skip.hide(), await he(L);
    }
    finally {
        await $a(L);
    } }
    async function He({ from: me, to: ne, fliers: We, total: ca, money: va }) { const J = d({ cls: "lk-rc", title: e("Connexion"), slots: 2 }), [te, le] = J.views; for (const [q, re] of [[te, me], [le, ne]])
        q.mon.innerHTML = `<div class="lk-pc"><b>${h(e(re.name))}</b><img src="assets/ui/box-link.png" alt=""></div>`, q.dim = !0; const X = s('<div class="lk-sum"><span><b class="n">0</b> Pokémon</span><span><b class="m">0</b> ₽</span></div>'); J.box.after(X), X.style.opacity = 0; const _e = X.querySelector(".n"), T = X.querySelector(".m"), L = q => J.at(q.mon.querySelector("img")); try {
        await i(J), a.Sfx.whoosh?.(), await Promise.all([te, le].map(async (Ee, ee) => { await J.pause(ee * 120), Ee.mon.style.opacity = "", await Ee.mon.animate([{ transform: "translateY(-90px) scale(.8, 1.25)", opacity: 0 }, { transform: "translateY(0) scale(1.3, .72)", opacity: 1, offset: .55 }, { transform: "translateY(-12px) scale(.94, 1.08)", offset: .78 }, { transform: "none", opacity: 1 }], { duration: J.T(520), easing: "ease-in", fill: "both" }).finished, be(Ee, .6); })), await P(J, e("Connexion avec <b>{name}</b>…", { name: h(me.name) }));
        const q = L(te), re = L(le), ce = { x: (q.x + re.x) / 2, y: q.y };
        J.link = { ax: q.x, bx: re.x, y: q.y, k: 0 };
        let ha = !0;
        (async () => { for (let Ee = 160; ha && !J.skip.skipped; Ee = Math.max(40, Ee * .85)) {
            const ee = q.x + (re.x - q.x) * Math.random();
            J.px.emit(ee, q.y, { vx: (Math.random() - .5) * 1.4, vy: (Math.random() - .5) * 1.4, size: 1 + (Math.random() < .3), heat: .1, grav: 0, drag: .9, max: 260 }), await Q(Ee);
        } })(), await new Promise(Ee => { const ee = Ys.now(), Ne = J.T(900), ga = na => { const Ze = Math.min(1, (na - ee) / Ne); J.link.k = 1 - (1 - Ze) ** 2, Ze < 1 && !J.skip.skipped ? nn(ga) : (J.link.k = 1, Ee()); }; nn(ga); }), ha = !1, a.Sfx.shut?.(), a.Sfx.heal?.(), Me(J, .55), m().shake(J.stage, 4, 180), J.px.ring(ce.x, ce.y, 140, 620), J.px.burst(ce.x, ce.y, 24, 2.4, { round: !0, grav: .03, heat: .1 }), [te, le].forEach(Ee => Ee.mon.querySelector("img").animate([{ filter: "none" }, { filter: "brightness(1.8)" }, { filter: "none" }], { duration: J.T(220), iterations: 3 }));
        for (const [Ee, ee] of [[q, re], [re, q]])
            for (let Ne = 0; Ne < 14; Ne++)
                J.px.emit(Ee.x + (ee.x - Ee.x) * Ne / 28, Ee.y, { wait: Ne * 18, vx: (ee.x - Ee.x) / 280, size: 2, heat: 0, grav: 0, drag: 1, max: 260, pal: Be });
        J.px.burst(ce.x, ce.y, 14, 2.6, { pal: Be, star: !0, size: 3, grav: 0, drag: .93, max: 600 }), P(J, e("Connexion rétablie avec <b>{name}</b> !", { name: h(me.name) })), X.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 300, fill: "both" }), X.style.opacity = "";
        let p = 0;
        const ge = We.map((Ee, ee) => (async () => { await J.pause(ee * Math.max(70, 260 - ee * 12)), te.mon.querySelector("img").animate([{ filter: "brightness(1.8)" }, { filter: "none" }], { duration: 200 }), J.px.burst(q.x, q.y - 10, 4, 1.2, { grav: 0, drag: .9, max: 260 }); const Ne = J.fx.appendChild(s(`<span class="rc-fly">${a.UI.sprBox(Ee.id, Ee.shiny, 2, 72)}</span>`)); Object.assign(Ne.style, { left: q.x + "px", top: q.y + "px" }); const ga = { playState: "running" }, na = new Promise(Ea => { let Se = q.x, Xe = q.y, wa = (re.x - q.x) / 60 * (.6 + Math.random() * .5), ja = -(3 + Math.random() * 4), ut = 0, ht = 0, Za = Ys.now(); const lt = (Math.random() - .5) * 6, Vt = Math.random() * 6, ds = it => { const C = Math.min(3, (it - Za) / 16); if (Za = it, ht += C, J.skip.skipped || ht > 90)
            return ga.playState = "finished", Ea(); const A = re.x - Se, Le = re.y - Xe, la = Math.hypot(A, Le), ma = Math.min(1, ht / 25) * .06; wa += (A * ma * .1 + Math.sin(ht / 7 + Vt) * .12) * C, ja += (Le * ma * .1 + .16 + Math.cos(ht / 9 + Vt) * .1) * C; const Ue = ht > 30 ? .9 : .97; if (wa *= Ue ** C, ja *= Ue ** C, Se += wa * C, Xe += ja * C, ht > 45) {
            const Zt = Math.min(1, (ht - 45) / 20) * .3 * C;
            Se += (re.x - Se) * Zt, Xe += (re.y - Xe) * Zt;
        } const Qe = Math.hypot(wa, ja), Da = Math.min(.35, Qe * .03), kt = Math.atan2(ja, wa) * 180 / Math.PI, Bt = ht < 8 ? .3 + ht / 8 * .8 : la < 40 ? Math.max(.5, la / 40) : 1.1; if (Ne.style.opacity = ht < 4 ? ht / 4 : 1, Ne.style.transform = `translate(calc(-50% + ${Se - q.x}px), calc(-50% + ${Xe - q.y}px)) rotate(${kt}deg) scale(${(1 + Da) * Bt}, ${(1 - Da) * Bt}) rotate(${ut - kt}deg)`, la < 12 && ht > 20)
            return ga.playState = "finished", Ea(); nn(ds); }; nn(ds); }), Ze = (async () => { for (; ga.playState === "running" && !J.skip.skipped;) {
            const Ea = J.at(Ne);
            J.px.emit(Ea.x, Ea.y, { size: 1, heat: .2, grav: 0, max: 240 }), await Q(50);
        } })(); if (await na, Ne.remove(), _e.textContent = ++p, le.mon.animate([{ transform: "scale(1.12, .9)" }, { transform: "none" }], { duration: 180 }), J.px.ring(re.x, re.y, 40, 300), a.Sfx.shut?.(), Ee.merge) {
            J.px.burst(re.x, re.y, 10, 1.6, { pal: Be, round: !0, grav: .04 });
            const Ea = J.fx.appendChild(s(`<span class="rc-lv">${Ee.merge.to > Ee.merge.from ? e("Nv. {from} → <b>{to}</b>", { from: Ee.merge.from, to: Ee.merge.to }) : e("Fusion !")}</span>`));
            Object.assign(Ea.style, { left: re.x + "px", top: re.y - 54 - ee % 3 * 18 + "px" }), Ea.animate([{ transform: "translate(-50%, 0)", opacity: 0 }, { transform: "translate(-50%, -14px)", opacity: 1, offset: .2 }, { transform: "translate(-50%, -40px)", opacity: 0 }], { duration: 1100, easing: "ease-out", fill: "both" }).finished.then(() => Ea.remove());
        } await Ze; })()), b = Ys.now(), D = Math.max(1200, We.length * 160), we = (async () => { for (;;) {
            const Ee = Math.min(1, (Ys.now() - b) / D);
            if (T.textContent = Math.round(va * Ee).toLocaleString(a.I18n?.lang || "fr"), Ee >= 1 || J.skip.skipped)
                break;
            await Q(40);
        } })();
        await Promise.all([...ge, we]), _e.textContent = ca, T.textContent = va.toLocaleString(a.I18n?.lang || "fr"), a.Sfx.buy?.(), J.skip.hide(), await he(J);
    }
    finally {
        await $a(J);
    } }
    async function he(me) { me.skip.hide(), me.tap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 300, fill: "both" }), me.tap.style.opacity = "", await me.skip.tap(me.el); }
    async function $a(me) { me.skip.end(), me.px.stop(), await me.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: "forwards" }).finished.catch(() => { }), me.el.remove(); }
    return { open: d, enter: i, say: P, send: ie, cross: E, land: F, reveal: xe, toCandy: ue, finish: he, close: $a, showMsg: (me, ne) => { ne && (me.msg.textContent = `« ${ne} »`, me.msg.animate([{ opacity: 0, transform: "translateY(6px) scale(.95, 1.05)" }, { opacity: 1, transform: "none" }], { duration: 280, delay: 200, easing: "cubic-bezier(.2,1.4,.4,1)", fill: "both" }), me.msg.style.opacity = ""); }, choose: ea, evolve: Pe, hatch: ua, reconnect: He, center: z, esc: h };
}()); }
