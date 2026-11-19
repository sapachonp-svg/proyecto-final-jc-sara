const $ = s => document.querySelector(s);

/* ⚠ Credenciales de demostración: cámbialas. Es un login del lado del cliente. */
const ADMIN = {user: "admin", pass: "Esmeralda2026"};

function show(){
  const ok = sessionStorage.getItem("jo_admin") === "1";
  $("#login").hidden = ok; $("#panel").hidden = !ok;
  if (ok) render();
}
$("#lf").onsubmit = e => {
  e.preventDefault();
  if ($("#u").value.trim() === ADMIN.user && $("#pw").value === ADMIN.pass) {
    sessionStorage.setItem("jo_admin", "1"); $("#err").textContent = ""; $("#lf").reset(); show();
  } else $("#err").textContent = "Usuario o contraseña incorrectos.";
};
$("#logout").onclick = () => { sessionStorage.removeItem("jo_admin"); show(); };

function render(){
  const reqs = Store.requests(), prods = Store.products();
  $("#s-req").textContent = reqs.length;
  $("#s-new").textContent = reqs.filter(r => !r.done).length;
  $("#s-prod").textContent = prods.length;

  $("#reqList").innerHTML = reqs.map(r => `
    <div class="item ${r.done?"done":""}">
      <div style="flex:1;min-width:220px">
        <b>${esc(r.name)}</b> · <small>${esc(r.type)} · ${esc(r.date)}</small><br>
        <small>✉ ${esc(r.email)} ${r.phone ? "· ☎ " + esc(r.phone) : ""}</small>
        <p style="margin:8px 0 0">${esc(r.msg)}</p>
      </div>
      <div class="acts">
        <button class="btn" data-act="done" data-id="${esc(r.id)}">${r.done ? "Reabrir" : "Marcar atendida"}</button>
        <button class="btn danger" data-act="delreq" data-id="${esc(r.id)}">Eliminar</button>
      </div>
    </div>`).join("") || '<p class="sub">Aún no hay solicitudes en este navegador.</p>';

  $("#prodList").innerHTML = prods.map(p => `
    <div class="item">
      <div style="flex:1;min-width:220px"><b>${esc(p.n)}</b><br>
        <small>${esc(p.c)} · ${esc(p.m)} · ${cop(p.p)} · ${esc(p.tag || "")}</small></div>
      <div class="acts"><button class="btn danger" data-act="delprod" data-id="${esc(p.id)}">Eliminar</button></div>
    </div>`).join("");
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]");
  if (b) {
    const id = b.dataset.id;
    if (b.dataset.act === "done") Store.saveRequests(Store.requests().map(r => r.id === id ? {...r, done: !r.done} : r));
    if (b.dataset.act === "delreq" && confirm("¿Eliminar esta solicitud?")) Store.saveRequests(Store.requests().filter(r => r.id !== id));
    if (b.dataset.act === "delprod" && confirm("¿Eliminar este producto?")) Store.saveProducts(Store.products().filter(p => p.id !== id));
    render();
  }
  const t = e.target.closest("[data-t]");
  if (t) {
    document.querySelectorAll(".tabs .chip").forEach(c => c.classList.toggle("on", c === t));
    $("#t-req").hidden = t.dataset.t !== "req"; $("#t-prod").hidden = t.dataset.t !== "prod";
  }
});

$("#pf").onsubmit = e => {
  e.preventDefault();
  const occ = [...document.querySelectorAll("#po input:checked")].map(i => i.value);
  const list = Store.products();
  list.push({id: "p" + Date.now().toString(36), n: $("#pn").value.trim(), c: $("#pc").value, m: $("#pm").value.trim(),
             p: +$("#pp").value, o: occ.length ? occ : ["regalo"], tag: $("#pt").value.trim() || "Nuevo"});
  Store.saveProducts(list); e.target.reset(); render();
};
$("#reset").onclick = () => { if (confirm("¿Restaurar el catálogo original?")) { Store.resetProducts(); render(); } };

show();