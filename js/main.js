const $ = s => document.querySelector(s);
const P = Store.products().map(x => ({ ...x, t: tier(x.p) }));

/* AOS (animaciones al hacer scroll) */
window.AOS && AOS.init({ duration: 800, once: true, offset: 60 });

/* Menú móvil */
const burger = $("#burger"), links = $("#links");
burger.onclick = () => { const o = links.classList.toggle("open"); burger.setAttribute("aria-expanded", o); };
links.addEventListener("click", e => { if (e.target.closest("a")) { links.classList.remove("open"); burger.setAttribute("aria-expanded", false); } });

/* ===== CATÁLOGO ===== */
function art(c) {
  const r = {
    Anillos: '<circle cx="50" cy="62" r="26" fill="none" stroke="url(#g)" stroke-width="7"/><use href="#gemsvg" x="30" y="6" width="40" height="40"/>',
    Manillas: '<ellipse cx="50" cy="50" rx="38" ry="22" fill="none" stroke="url(#g)" stroke-width="8"/><use href="#gemsvg" x="36" y="22" width="28" height="28"/>',
    Collares: '<path d="M10 15Q50 95 90 15" fill="none" stroke="url(#g)" stroke-width="3"/><use href="#gemsvg" x="33" y="52" width="34" height="34"/>',
    Dijes: '<circle cx="50" cy="12" r="5" fill="none" stroke="url(#g)" stroke-width="3"/><use href="#gemsvg" x="25" y="20" width="50" height="60"/>'
  };
  return '<svg viewBox="0 0 100 100">' + (r[c] || r.Dijes) + '</svg>';
}
let fav = new Set(read("jo_fav", [])), cat = "Todos";
const CATS = ["Todos", "Anillos", "Manillas", "Collares", "Dijes"];

function chips() {
  $("#chips").innerHTML = CATS.map(c => `<button class="chip ${c == cat ? "on" : ""}" data-c="${c}">${c}</button>`).join("");
}
function grid() {
  const list = P.filter(x => cat == "Todos" || x.c == cat);
  $("#grid").innerHTML = list.map(x => `
    <div class="prod">
      <button class="fav ${fav.has(x.id) ? "on" : ""}" data-f="${esc(x.id)}" aria-label="Favorito">♥</button>
      <div class="art">${x.img ? `<img src="${esc(x.img)}" alt="${esc(x.n)}" loading="lazy">` : art(x.c)}</div>
      <div class="tag">${esc(x.tag)}</div>
      <h3>${esc(x.n)}</h3>
      <div style="color:var(--mut);font-size:13px">${esc(x.m)}</div>
      <div class="price">${cop(x.p)}</div>
      <a class="btn wa" target="_blank" rel="noopener" href="${wa("Hola, me interesa: " + x.n + " (" + cop(x.p) + ")")}">Cotizar por WhatsApp</a>
    </div>`).join("") || '<p class="sub">No hay piezas en esta categoría.</p>';
  $("#favc").textContent = fav.size;
}
document.addEventListener("click", e => {
  const c = e.target.closest("[data-c]"), f = e.target.closest("[data-f]");
  if (c) { cat = c.dataset.c; chips(); grid(); }
  if (f) {
    const id = f.dataset.f;
    fav.has(id) ? fav.delete(id) : fav.add(id);
    localStorage.setItem("jo_fav", JSON.stringify([...fav]));
    grid();
  }
});
chips(); grid();

/* ===== ASESOR IA (recomendador) ===== */
const Q = [
  { k: "o", q: "1. ¿Cuál es la ocasión?", a: [["boda", "Boda / compromiso"], ["diario", "Uso diario"], ["grado", "Grado / logro"], ["regalo", "Regalo sorpresa"]] },
  { k: "w", q: "2. ¿Para quién es?", a: [["yo", "Para mí"], ["ella", "Para ella"], ["el", "Para él"]] },
  { k: "t", q: "3. ¿Tu presupuesto?", a: [[1, "Hasta $500.000"], [2, "$500.000 – $1.500.000"], [3, "Más de $1.500.000"]] }
];
let st = 0, ans = {};
function adv() {
  const el = $("#adv");
  const bar = '<div class="steps">' + Q.map((_, i) => `<i class="${i <= st ? "on" : ""}"></i>`).join("") + "</div>";
  if (st < Q.length) {
    const q = Q[st];
    el.innerHTML = bar + `<h3 style="text-align:center;font-size:26px">${q.q}</h3><div class="opts">${q.a.map(a => `<button class="opt" data-a="${a[0]}">${a[1]}</button>`).join("")}</div>`;
    return;
  }
  const best = P.map(x => ({
    x, s:
      (x.o.includes(ans.o) ? 3 : 0) + (x.t == ans.t ? 2 : 0) - Math.abs(x.t - ans.t)
      + (ans.w == "el" && x.c == "Manillas" ? 1 : 0)
      + (ans.w == "ella" && /Collares|Dijes/.test(x.c) ? 1 : 0)
  })).sort((a, b) => b.s - a.s)[0].x;
  el.innerHTML = bar + `<div class="rec">
    ${best.img ? `<img class="rec-img" src="${esc(best.img)}" alt="${esc(best.n)}" width="140" height="140">` : `<svg viewBox="0 0 100 100" width="140">${art(best.c).replace(/<\/?svg[^>]*>/g, "")}</svg>`}
    <div><div class="tag">Recomendación personalizada</div>
    <h3 style="font-size:30px">${esc(best.n)}</h3>
    <p style="color:var(--mut)">${esc(best.m)} · ${cop(best.p)}. Encaja con tu ocasión y tu presupuesto, y refleja la tradición esmeraldera de Boyacá.</p>
    <a class="btn fill wa" target="_blank" rel="noopener" href="${wa("Hola, el asesor me recomendó: " + best.n)}">Cotizar por WhatsApp</a>
    <button class="btn" id="again">Empezar de nuevo</button></div></div>`;
  $("#again").onclick = () => { st = 0; ans = {}; adv(); };
}
$("#adv").addEventListener("click", e => {
  const b = e.target.closest("[data-a]"); if (!b) return;
  ans[Q[st].k] = isNaN(b.dataset.a) ? b.dataset.a : +b.dataset.a; st++; adv();
});
adv();

/* ===== TALLER PERSONALIZADO ===== */
const sel = { metal: "Oro amarillo 18k", stone: "Esmeralda colombiana" };
function opts(id, key, list) {
  $(id).innerHTML = list.map(v => `<button class="opt ${sel[key] == v ? "sel" : ""}" data-k="${key}" data-v="${v}">${v}</button>`).join("");
}
function taller() {
  opts("#o-metal", "metal", ["Oro amarillo 18k", "Oro blanco", "Oro rosa", "Plata ley 925"]);
  opts("#o-stone", "stone", ["Esmeralda colombiana", "Diamante", "Zafiro", "Sin gema"]);
  $("#sum").textContent = "Tu diseño: " + sel.metal + " con " + sel.stone.toLowerCase() + ".";
  $("#wa-custom").href = wa("Hola, quiero una joya personalizada. Metal: " + sel.metal + ". Piedra: " + sel.stone + ". Idea: " + ($("#idea").value || "(te la cuento por aquí)"));
}
document.addEventListener("click", e => { const o = e.target.closest("[data-k]"); if (o) { sel[o.dataset.k] = o.dataset.v; taller(); } });
$("#idea").oninput = taller; taller();

/* ===== TALLER / VIDEOS ===== */
const V = [
  ["El tallado de esmeralda", "Un toque de precisión", "Con buril y lupa, el maestro da forma a cada detalle del diseño de tu piedra.", "assets/img/tallado.jpeg"],
  ["El modelado personalizado", "Tu diseño hecho realidad", "Modelamos tu diseño, asegurándonos de que sea exactamente como tu imaginaste.", "assets/img/modelado.jpeg"],
  ["Engastado de la esmeralda", "Brillo y tradición", "Cada esmeralda se asegura a mano garra por garra, sin prisa.", "assets/img/engastado.jpeg"]
];
$("#craft").innerHTML = V.map(v => `<div class="vid" data-aos="fade-up"><div class="scr"><img src="${esc(v[3])}" alt="${esc(v[0])}" loading="lazy"></div><div class="t"><h3 style="font-size:22px">${v[0]}</h3><div class="tag">${v[1]}</div><p>${v[2]}</p></div></div>`).join("");
$("#craft").onclick = e => { const v = e.target.closest(".vid"); if (v) v.classList.toggle("go"); };

/* ===== SEDES ===== */
const S = [
  { n: "Medellín", d: "Por ahora solo hay punto fisico en Chiquinquira", h: "Redes sociales, 24 horas" },
  { n: "Chiquinquirá", d: "Carrera 7a # 2-41 Los Sauces", h: "Lun–Sáb 9:00 – 18:00" }
];
function sede(i) {
  $("#sede").innerHTML = `<h3 style="font-size:30px">Sede ${S[i].n}</h3><p>📍 ${S[i].d}<br>🕒 ${S[i].h}</p>${i !== 0 ? `<a class="btn fill wa" target="_blank" rel="noopener" href="${wa("Hola, quiero agendar una cita en la sede de " + S[i].n)}">Agendar cita presencial</a>` : ""}`;
  document.querySelectorAll(".tabs .chip").forEach((b, j) => b.classList.toggle("on", j == i));
}
$(".tabs").onclick = e => { const b = e.target.closest("[data-s]"); if (b) sede(+b.dataset.s); };
sede(0);

/* ===== FORMULARIO DE CONTACTO ===== */
$("#cf").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target, d = Object.fromEntries(new FormData(f)), out = $("#cmsg");
  if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email) || d.msg.trim().length < 5) {
    out.textContent = "Revisa tu nombre, un correo válido y escribe tu mensaje."; return;
  }
  const r = {
    id: Date.now().toString(36), date: new Date().toLocaleString("es-CO"),
    name: d.name.trim(), email: d.email.trim(), phone: d.phone.trim(), type: d.type, msg: d.msg.trim(), done: false
  };
  Store.addRequest(r);
  if (FORMSPREE_URL) {
    try { await fetch(FORMSPREE_URL, { method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" }, body: JSON.stringify(r) }); } catch (_) { }
  }
  f.reset();
  out.textContent = "✓ ¡Gracias " + r.name.split(" ")[0] + "! Recibimos tu solicitud y te contactaremos pronto.";
});

/* ===== CHATBOT IA (preguntas frecuentes) ===== */
const FAQ = [
  { k: ["hola", "buenas", "buenos dias", "buenas tardes"], a: "¡Hola! Soy el asistente de Joyas Oro y Esmeralda. Pregúntame por envíos, precios, tallas, personalizados o sedes." },
  { k: ["envio", "domicilio", "despacho", "enviar"], a: "Hacemos envíos seguros y asegurados a todo el país. El tiempo depende de la ciudad; te lo confirmamos al cotizar por WhatsApp." },
  { k: ["oro 18", "18k", "pureza", "certificad", "autentic"], a: "Nuestras piezas en oro son de 18K y se entregan con certificado de pureza. Las esmeraldas son de origen colombiano (Boyacá)." },
  { k: ["esmeralda", "muzo", "piedra"], a: "Trabajamos esmeraldas naturales colombianas de Boyacá. Cada piedra se selecciona a mano y se engasta con técnica artesanal." },
  { k: ["precio", "costo", "cuanto", "valor", "barato"], a: "Tenemos piezas desde $220.000 COP hasta más de $4.000.000 COP. Prueba el Asesor IA de la página para ver una recomendación según tu presupuesto." },
  { k: ["talla", "medida", "tamano", "dedo"], a: "Te ayudamos con la talla por WhatsApp: puedes medir un anillo que ya uses o visitar una de nuestras sedes." },
  { k: ["personaliz", "grabado", "disen", "encargo", "medida"], a: "Hacemos joyas personalizadas: eliges metal, piedra y nos cuentas tu idea en la sección «Taller personalizado»." },
  { k: ["sede", "direccion", "horario", "ubicacion", "donde", "visitar", "cita"], a: "Tenemos sedes en Medellín (Lun–Sáb 10:00–19:00) y Chiquinquirá (Lun–Sáb 9:00–18:00). Puedes agendar cita en la sección Sedes." },
  { k: ["garantia", "devol", "cambio", "reclamo"], a: "Ofrecemos garantía de fabricación y políticas de cambio. Escríbenos por el formulario de contacto con tu número de pedido." },
  { k: ["cuidado", "limpiar", "limpieza", "mantenimiento"], a: "Evita perfumes y cloro, límpialas con un paño suave y guárdalas por separado. Ofrecemos limpieza en nuestras sedes." },
  { k: ["pago", "tarjeta", "transferencia", "nequi"], a: "Coordinamos el pago al cotizar por WhatsApp. Te indicamos los medios disponibles." },
  { k: ["sorteo", "rifa", "manilla laminada"], a: "Sigue nuestro Instagram y llena la encuesta rápida (al final de la página) para participar en el sorteo de la manilla laminada en oro." }
];
const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const msgs = $("#chatMsgs");
function say(t, who) { const d = document.createElement("div"); d.className = "msg " + who; d.textContent = t; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; }
function reply(q) {
  const t = norm(q);
  const hit = FAQ.find(f => f.k.some(w => t.includes(w)));
  say(hit ? hit.a : "No estoy seguro de eso. ¿Quieres hablar con un asesor humano por WhatsApp? Escríbenos desde el botón verde de cualquier pieza o usa el formulario de contacto.", "bot");
}
function ask(q) { say(q, "me"); setTimeout(() => reply(q), 350); }
$("#chatQuick").innerHTML = ["Envíos", "Precios", "Personalizados", "Sedes", "Cuidado"].map(x => `<button type="button">${x}</button>`).join("");
$("#chatQuick").onclick = e => { if (e.target.tagName == "BUTTON") ask(e.target.textContent); };
$("#chatFab").onclick = () => {
  const b = $("#chatBox"); b.hidden = !b.hidden;
  if (!b.hidden && !msgs.children.length) say("¡Hola! 👋 Soy el asistente de Joyas Oro y Esmeralda. ¿En qué te ayudo?", "bot");
};
$("#chatClose").onclick = () => $("#chatBox").hidden = true;
$("#chatForm").onsubmit = e => { e.preventDefault(); const i = $("#chatText"), v = i.value.trim(); if (v) { ask(v); i.value = ""; } };