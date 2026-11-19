/* CONFIGURACIÓN  */
const NUM = "573223688590";     
const FORMSPREE_URL = "https://formspree.io/f/f/xrpqldbp";        

const wa = t => "https://wa.me/" + NUM + "?text=" + encodeURIComponent(t);
const cop = n => "$" + Number(n).toLocaleString("es-CO") + " COP";
const tier = p => p <= 500000 ? 1 : p <= 1500000 ? 2 : 3;
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* PRODUCTOS */
const DEFAULT_PRODUCTS = [
  {id:"p1",n:"Anillos con esmeralda elegantes y finos ",c:"Anillos",m:"Oro 18k",p:4200000,o:["boda"],tag:"Exclusivo",img:"assets/img/a1.jpeg"},
  {id:"p2",n:"Anillos con esmeralda hermosos en plata",c:"Anillos",m:"Plata 925",p:450000,o:["diario","regalo"],tag:"Esmeralda natural",img:"assets/img/a2.jpeg"},
  {id:"p3",n:"Anillos elegantes con deferentes piedras",c:"Anillos",m:"Oro 18k",p:1350000,o:["boda","grado"],tag:"Compromiso",img:"assets/img/a3.jpeg"},
  {id:"p4",n:"Manillas diferentes diseños en oro laminado",c:"Manillas",m:"Oro laminado",p:220000,o:["diario","regalo"],tag:"Más vendida",img:"assets/img/m1.jpeg"},
  {id:"p5",n:"Manillas Eslabón Real",c:"Manillas",m:"Oro 18k",p:2300000,o:["grado","regalo"],tag:"Alta joyería",img:"assets/img/m2.jpeg"},
  {id:"p6",n:"Collares en plata con esmeralda",c:"Collares",m:"Plata 925",p:890000,o:["regalo","diario"],tag:"Esmeralda natural",img:"assets/img/c1.jpeg"},
  {id:"p7",n:"Collares y cadenas en oro",c:"Collares",m:"Oro 18k",p:2900000,o:["boda","regalo"],tag:"Exclusivo",img:"assets/img/c2.jpeg"},
  {id:"p8",n:"Dijes Virgen de Chiquinquirá",c:"Dijes",m:"Plata 925",p:480000,o:["grado","diario"],tag:"Tradición",img:"assets/img/d2.jpeg"},
  {id:"p9",n:"Dije cruz",c:"Dijes",m:"Oro 18k",p:310000,o:["regalo","diario","grado"],tag:"Detalle ideal",img:"assets/img/d1.jpeg"}
];

/*  ALMACENAMIENTO (localStorage) */
const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } };
const Store = {
  products(){ const p = read("jo_products", null); return Array.isArray(p) && p.length ? p : DEFAULT_PRODUCTS; },
  saveProducts(p){ localStorage.setItem("jo_products", JSON.stringify(p)); },
  resetProducts(){ localStorage.removeItem("jo_products"); },
  requests(){ return read("jo_requests", []); },
  saveRequests(r){ localStorage.setItem("jo_requests", JSON.stringify(r)); },
  addRequest(r){ const a = Store.requests(); a.unshift(r); Store.saveRequests(a); }
};