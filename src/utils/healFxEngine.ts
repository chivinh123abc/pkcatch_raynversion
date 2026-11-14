// @ts-nocheck
// Visual routines ported from the archived app.5a63acc466.js.
import { nativeFxRuntime as t } from "./nativeFxRuntime";
const Gn={now:()=>performance.now()};
const Jn=fn=>requestAnimationFrame(fn);
const Va=(fn,ms)=>setTimeout(fn,ms);
const ks=(fn,ms)=>setInterval(fn,ms);
const e=(text,values={})=>text.replace(/\{(\w+)\}/g,(_,key)=>values[key]||"");
export const HealFX = function () {
    const a = "#ff8fb1";
    async function f(d, { fx: ne, allies: B, count: ft, slots: I, title: K, msg: Pe, speed: Ve = () => 1, onHeal: Ye = () => { } }) {
        const { $: r, $$: re, h: U, sleep: $t } = t.UI, w = t.CaptureFX, s = N => N / Ve(), xt = N => $t(N / Ve()), ie = N => { const fe = N.getBoundingClientRect(), oe = d.getBoundingClientRect(); return { x: fe.left - oe.left + fe.width / 2, y: fe.top - oe.top + fe.height / 2 }; }, te = d.appendChild(U(`<div class="heal-fx"><i class="lk-sky"></i>
        <div class="hm-stage">
          <div class="hm-title">${K}</div>
          <div class="hm-machine">
            <canvas class="hm-pads"></canvas>
            <div class="hm-tray">${Array.from({ length: I }, (N, fe) => `<span class="hm-slot">${fe < ft ? '<img src="assets/items/poke-ball.png" alt="">' : ""}</span>`).join("")}</div>
          </div>
          <div class="hm-msg">${Pe}</div>
        </div>
        <div class="hm-fx"></div>
      </div>`)), Qe = r(".hm-fx", te), De = re(".hm-slot img", te), Ce = r(".hm-machine", te), tt = t.UI.skippable(te), lt = N => { const fe = N.getBoundingClientRect(), oe = te.getBoundingClientRect(); return { x: fe.left - oe.left + fe.width / 2, y: fe.top - oe.top + fe.height / 2 }; }, ve = w.pix(Qe, 1), Se = ve.PAL.of(a), M = ve.PAL.heal, Y = ve.PAL.glow, me = w.pix(ne), V = () => De[Math.random() * De.length | 0];
        De.forEach(N => { N.style.opacity = 0; });
        const st = r(".hm-pads", Ce), Re = st.getContext("2d"), ce = 2, Me = re(".hm-slot", te);
        let Oe = !0, Le = !1, Ie = 0;
        const rt = (N, fe, oe, j = 1) => { N = Math.round(N), fe = Math.round(fe), !(j < 1 && (j <= 0 || (N + fe & 3) / 4 >= j * 1.2 && (N ^ fe) % 2)) && (Re.fillStyle = oe, Re.fillRect(N, fe, 1, 1)); }, It = (N, fe, oe, j, je, E = 1, A = 0) => { for (let $ = -Math.ceil(j); $ <= j; $++)
            for (let P = -Math.ceil(oe); P <= oe; P++) {
                const T = P * P / (oe * oe) + $ * $ / (j * j);
                T <= 1 && T >= A * A && rt(N + P, fe + $, je, E);
            } }, ut = ["#2a2440", "#1a1628", "#0d0b16"];
        (function N(fe) { if (!Oe)
            return; Jn(N); const oe = Ce.getBoundingClientRect(); st.width !== Math.ceil(oe.width / ce) && (st.width = Math.ceil(oe.width / ce), st.height = Math.ceil(oe.height / ce)), Re.clearRect(0, 0, st.width, st.height); const j = .5 + .5 * Math.sin(fe / (Le ? 90 : 300)); Me.forEach(je => { const E = je.getBoundingClientRect(), A = -new DOMMatrix(getComputedStyle(je).transform).f, $ = Math.round((E.left + E.width / 2 - oe.left) / ce), P = Math.round((E.bottom - E.height * .16 - oe.top) / ce), T = Math.round(E.width * .4 / ce), ue = Math.max(3, Math.round(T * .3)), c = je.classList.contains("on") && (Le || Ie), O = Se; if (Ce.style.opacity !== "0" && !0) {
            It($, P + ue + 6 + A / ce, T * (.8 - A * .015), ue * .6, "#000", .45), It($, P + 2, T, ue, ut[2]), It($, P + 1, T, ue, ut[1]), It($, P, T, ue, c ? O[4] : ut[0]), It($, P, T, ue, c ? O[Le ? 1 : 2] : "#5d6788", 1, .82), c && (It($, P, T * (.5 + .08 * j), ue * (.5 + .08 * j), O[3], Le ? .9 : .5), (Le || Ie) && It($, P, T * .25, ue * .25, O[1], .8));
            for (let se = -T * .55; se <= T * .55; se++)
                rt($ + se, P - ue * Math.sqrt(1 - (se / T) ** 2), c ? O[0] : "#c9d2e6");
        } }); })(Gn.now()), te.style.opacity = 0;
        const ee = r(".hm-title", te);
        ee.style.opacity = 0, Ce.style.opacity = 0;
        const W = B ? re(".ally .wrap", B) : [];
        let Z = [];
        try {
            t.Sfx.whoosh();
            for (const $ of W) {
                const P = r("img", $);
                if (P) {
                    const T = ie(P);
                    me.dissolve(P, T.x, T.y + P.getBoundingClientRect().height * .3, s(320));
                }
            }
            Z = W.map($ => $.animate([{ transform: "scale(1)", filter: "none", opacity: 1 }, { transform: "scale(1.1, .9)", filter: "brightness(0) invert(1)", opacity: 1, offset: .35 }, { transform: "scale(0)", filter: "brightness(0) invert(1)", opacity: 0 }], { duration: s(320), easing: "ease-in", fill: "forwards" })), await Promise.all(Z.map($ => $.finished)), B && (B.style.visibility = "hidden"), await te.animate([{ opacity: 0 }, { opacity: 1 }], { duration: s(280), fill: "forwards" }).finished, ee.animate([{ transform: "translateY(-14px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], { duration: s(300), easing: "ease-out", fill: "both" }), ee.style.opacity = "";
            const N = Ce.animate([{ transform: "translateY(30px) scale(.7, .4)", opacity: 0 }, { transform: "translateY(-4px) scale(1.04, .97)", opacity: 1, offset: .6 }, { transform: "none", opacity: 1 }], { duration: s(340), easing: "ease-out" });
            Ce.style.opacity = "", Me.forEach(($, P) => $.animate([{ transform: "scale(0, 0)" }, { transform: "scale(1.35, .55)", offset: .5 }, { transform: "scale(.88, 1.18)", offset: .75 }, { transform: "none" }], { duration: s(380), delay: s(P * 50), easing: "ease-out", fill: "backwards" })), await N.finished, await xt(s(Me.length * 50));
            const fe = ($, P) => { const T = lt($); $.parentElement.animate([{ transform: "none" }, { transform: `scale(${1 + .2 * P}, ${1 - .25 * P})` }, { transform: "none" }], { duration: s(220), easing: "ease-out" }), ve.burst(T.x, T.y + 18, Math.round(4 * P), 1.2 * P, { grav: .06, size: 1 }); };
            await Promise.all(De.map(async ($, P) => { await xt(s(P * 70 + Math.random() * 160)), $.style.opacity = ""; const T = s(620 + Math.random() * 140); [.42, .7, .88].forEach((c, O) => Va(() => { fe($, [1, .5, .25][O]), O || (t.Sfx.shut(), $.parentElement.classList.add("on")); }, T * c)), await $.animate([{ transform: "translateY(-320%) rotate(-40deg) scale(.9, 1.15)", opacity: 1, easing: "cubic-bezier(.5,0,1,.6)" }, { transform: "translateY(0) rotate(0) scale(1.3, .7)", offset: .42, easing: "ease-out" }, { transform: "translateY(-36%) rotate(8deg) scale(.92, 1.08)", offset: .56, easing: "ease-in" }, { transform: "translateY(0) scale(1.15, .85)", offset: .7, easing: "ease-out" }, { transform: "translateY(-12%) rotate(-3deg)", offset: .79, easing: "ease-in" }, { transform: "translateY(0) scale(1.06, .94)", offset: .88 }, { transform: "none" }], { duration: T }).finished; })), await xt(s(160)), t.Sfx.center(), te.classList.add("running"), Le = !0;
            let oe = !0;
            (async () => { for (; oe && te.isConnected;) {
                if (Math.random() < .7) {
                    const $ = lt(V());
                    ve.heal($.x + (Math.random() - .5) * 70, $.y - 4 - Math.random() * 46, Math.random() < .35 ? 2 : 1, M);
                }
                if (Math.random() < .45) {
                    const $ = lt(V());
                    ve.twinkle($.x + (Math.random() - .5) * 80, $.y + 10 - Math.random() * 56);
                }
                if (Math.random() < .2) {
                    const $ = lt(V());
                    ve.burst($.x + (Math.random() - .5) * 40, $.y + 18, 1, .3, { pal: Y, grav: -.03, drag: .95, max: 500, size: 1 });
                }
                await new Promise($ => Va($, s(110)));
            } })();
            let j = 0;
            const je = ks(() => { const $ = De[j++ % De.length]; if (!$)
                return; const P = lt($); ve.ring(P.x, P.y + 20, 48, 520, Y, .35), $.animate([{ transform: "none" }, { transform: "scale(1.08, .94)" }, { transform: "none" }], { duration: s(200), easing: "ease-out" }); }, s(200));
            await Promise.all(De.map(($, P) => $.animate([{ filter: "none" }, { filter: `brightness(1.6) drop-shadow(0 0 4px ${a})` }, { filter: "none" }], { duration: s(520), delay: s(P * 60), iterations: 2, easing: "steps(3)" }).finished)), oe = !1, Le = !1, clearInterval(je), te.classList.remove("running"), t.Sfx.heal(), Ie = 1, Ce.animate([{ filter: "brightness(2.2)" }, { filter: "none" }], { duration: s(380), easing: "ease-out" });
            const E = lt(Ce);
            ve.ring(E.x, E.y, Ce.offsetWidth * .6, 650, Y, .45), De.forEach(($, P) => { const T = s(P * 50 + Math.random() * 80); $.animate([{ transform: "none" }, { transform: "translateY(-22%) scale(.95, 1.06)", offset: .4 }, { transform: "scale(1.1, .9)", offset: .8 }, { transform: "none" }], { duration: s(360), delay: T, easing: "ease-out" }); const ue = lt($); Va(() => { ve.heal(ue.x, ue.y - 30, 2, M, { vy: -.3, max: 1e3 }); for (let c = 0; c < 3; c++)
                ve.twinkle(ue.x + (Math.random() - .5) * 56, ue.y - 10 - Math.random() * 36, Y, { wait: c * 90 + Math.random() * 60 }); }, T); });
            const A = r(".hm-msg", te);
            A.style.visibility = "visible", A.animate([{ transform: "scale(.4)", opacity: 0 }, { transform: "scale(1.12)", opacity: 1, offset: .6 }, { transform: "none", opacity: 1 }], { duration: s(360), easing: "ease-out" }), tt.hide(), await xt(1100), await te.animate([{ opacity: 1 }, { opacity: 0 }], { duration: s(300), fill: "forwards" }).finished;
        }
        finally {
            Oe = !1, tt.end(), te.remove();
        }
        Ye(), t.Sfx.open();
        const at = B ? re(".ally .wrap", B) : [], St = at.map((N, fe) => N.animate([{ transform: "scale(0)", filter: "brightness(0) invert(1)", opacity: 1 }, { transform: "scale(1.15, .9)", filter: "brightness(0) invert(1)", opacity: 1, offset: .5 }, { transform: "none", filter: "none", opacity: 1 }], { duration: s(380), delay: s(fe * 70), easing: "ease-out", fill: "backwards" }));
        Z.forEach(N => N.cancel()), B && (B.style.visibility = ""), at.forEach((N, fe) => { const oe = r("img", N), j = ie(oe || N), je = (oe || N).getBoundingClientRect().height * .5; Va(() => { oe && me.gather(oe, j.x, j.y + 20, s(260)), me.heal(j.x, j.y - je + 6, 2, M, { vy: -.3, wait: 220, max: 900 }); for (let E = 0; E < 2; E++)
            me.twinkle(j.x + (Math.random() - .5) * 60, j.y - je * Math.random(), Y, { wait: 300 + E * 140 }); }, s(fe * 70)); }), await Promise.all(St.map(N => N.finished)), await xt(250);
    }
    return { play: f };
}();
