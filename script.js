/* ============ UBAH DI SINI ============ */
const CFG = {
  wa: "628889954847",              // nomor WhatsApp FarKop (format 62..., tanpa + dan spasi)
  waLabel: "+62 888-9954-847",     // tampilan nomor di footer
  addr: "Jl. Kenanga No. 12, Kota Anda"   // alamat warung
};
// jam buka per hari: [buka, tutup] dalam jam (24 = lewat tengah malam). Urutan: Minggu ... Sabtu
const HOURS = [[7,24],[7,23],[7,23],[7,23],[7,23],[7,24],[7,24]];
const DAYS = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

/* ============ FOTO ============
   Semua foto dari Wikimedia Commons (nama file = isi foto). Dipanggil lewat Special:FilePath. */
const F = (f,w=900) => `https://commons.wikimedia.org/wiki/Special:FilePath/${f}?width=${w}`;

/* ============ MENU ============
   Item yang punya `img` tampil sebagai kartu foto, sisanya masuk "papan menu".
   Untuk memberi foto ke item lain, tambahkan  img:"NamaFile.jpg"  (pastikan fotonya memang cocok). */
const ITEMS = [
  {id:"kh",c:"kopi",n:"Kopi Hitam",p:12000,d:"Kopi hitam manis ala warung, diseduh saat dipesan.",img:"Kopi_O.jpg",alt:"Kopi hitam manis dalam cangkir"},
  {id:"cap",c:"kopi",n:"Cappuccino",p:24000,d:"Espresso dengan susu panas dan busa tebal.",img:"Cappuccino_at_Sightglass_Coffee.jpg",alt:"Secangkir cappuccino"},
  {id:"tub",c:"kopi",n:"Kopi Tubruk",p:10000},
  {id:"ksu",c:"kopi",n:"Kopi Susu",p:15000},
  {id:"eks",c:"kopi",n:"Es Kopi Susu",p:18000},
  {id:"kje",c:"kopi",n:"Kopi Jahe",p:14000},
  {id:"tm",c:"non",n:"Teh Manis (panas / es)",p:8000},
  {id:"tt",c:"non",n:"Teh Tarik",p:14000},
  {id:"jp",c:"non",n:"Jeruk Peras",p:12000},
  {id:"sj",c:"non",n:"Susu Jahe",p:14000},
  {id:"ngs",c:"makan",n:"Nasi Goreng Spesial",p:28000,d:"Nasi goreng dengan telur, kerupuk, dan acar.",img:"Nasi_goreng_indonesia.jpg",alt:"Nasi goreng dengan telur, kerupuk, dan acar"},
  {id:"ngr",c:"makan",n:"Nasi Goreng Sarapan",p:26000,d:"Set sarapan nasi goreng, pas untuk pagi hari.",img:"Nasi_Goreng_Breakfast_Set_in_Solo.JPG",alt:"Set sarapan nasi goreng"},
  {id:"ngk",c:"makan",n:"Nasi Goreng Kambing",p:32000,d:"Nasi goreng daging kambing, dimasak di wajan besar.",img:"Nasi_Goreng_Kambing_Kebon_Sirih_Jakarta_1.jpg",alt:"Nasi goreng kambing yang dimasak di wajan besar"},
  {id:"mg",c:"makan",n:"Mie Goreng",p:25000,d:"Mie goreng manis gurih khas warung.",img:"Mie_Goreng_in_Bali.jpg",alt:"Mie goreng"},
  {id:"ie",c:"makan",n:"Indomie Telur",p:16000},
  {id:"nt",c:"makan",n:"Nasi Telur Dadar",p:16000},
  {id:"pg",c:"camil",n:"Pisang Goreng",p:15000,d:"Pisang goreng renyah, enak ditemani kopi hitam.",img:"Pisang_goreng_fried_banana.JPG",alt:"Pisang goreng"},
  {id:"sg",c:"camil",n:"Singkong Goreng",p:12000},
  {id:"ti",c:"camil",n:"Tahu Isi",p:10000},
  {id:"bw",c:"camil",n:"Bakwan",p:8000},
  {id:"rb",c:"camil",n:"Roti Bakar Cokelat Keju",p:18000}
];
const CATS = {kopi:"Kopi",non:"Non-kopi",makan:"Makanan",camil:"Camilan"};
const rp = n => "Rp" + n.toLocaleString("id-ID");
const $ = s => document.querySelector(s);
const by = id => ITEMS.find(i=>i.id===id);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- foto: pasang sumber, dan beri placeholder bila gagal muat ---- */
function loadImgs(root=document){
  root.querySelectorAll("img[data-f]").forEach(img=>{
    const box = img.closest(".ph,.dish-img,.story-ph"); if(box) box.dataset.name = img.alt;
    img.decoding="async"; img.src = F(img.dataset.f, +img.dataset.w||900);
  });
}
document.addEventListener("error",e=>{
  const img=e.target; if(img.tagName!=="IMG") return;
  const box = img.closest(".ph,.dish-img,.story-ph"); if(box) box.classList.add("noimg");
},true);

/* ---- reveal saat scroll ---- */
const io = new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.12,rootMargin:"0px 0px -5% 0px"});

/* ---- render menu ---- */
let cur="all";
const dishes=$("#dishes"), board=$("#board");
function render(){
  const list = cur==="all" ? ITEMS : ITEMS.filter(i=>i.c===cur);
  const photo = list.filter(i=>i.img), plain = list.filter(i=>!i.img);
  dishes.hidden = !photo.length;
  dishes.innerHTML = photo.map(i=>`
    <article class="dish rv">
      <div class="dish-img"><img data-f="${i.img}" data-w="800" alt="${i.alt}" loading="lazy"></div>
      <div class="dish-b">
        <div class="dish-t"><h3>${i.n}</h3><span class="price">${rp(i.p)}</span></div>
        <p>${i.d}</p>
        <button class="add" data-id="${i.id}">Tambah</button>
      </div>
    </article>`).join("");
  board.hidden = !plain.length;
  board.innerHTML = Object.keys(CATS).map(k=>{
    const rows = plain.filter(i=>i.c===k); if(!rows.length) return "";
    return `<section><h3>${CATS[k]}</h3>${rows.map(i=>`<div class="row"><span class="nm">${i.n}</span><span class="dots"></span><span class="pr">${rp(i.p)}</span><button data-id="${i.id}" aria-label="Tambah ${i.n}">+</button></div>`).join("")}</section>`;
  }).join("");
  loadImgs(dishes);
  dishes.querySelectorAll(".dish").forEach((el,k)=>{el.style.transitionDelay=reduce?"0s":`${(k%3)*90}ms`;io.observe(el)});
}
$("#tabs").addEventListener("click",e=>{
  const b=e.target.closest("button"); if(!b||b.classList.contains("on")) return;
  document.querySelectorAll("#tabs button").forEach(x=>x.classList.toggle("on",x===b));
  cur=b.dataset.c;
  [dishes,board].forEach(x=>x.classList.add("swap","out"));
  setTimeout(()=>{render();[dishes,board].forEach(x=>x.classList.remove("out"))},reduce?0:240);
});

/* ---- pesanan ---- */
const cart = {};
const count = () => Object.values(cart).reduce((a,b)=>a+b,0);
const total = () => Object.entries(cart).reduce((s,[id,q])=>s+by(id).p*q,0);
function sync(){
  const n=count();
  $("#pillN").textContent=n; $("#pillT").textContent=rp(total()); $("#tot").textContent=rp(total());
  $("#pill").classList.toggle("on",n>0);
  $("#lines").innerHTML = n ? Object.entries(cart).map(([id,q])=>{const i=by(id);return `<li><div><div class="nm">${i.n}</div><small>${rp(i.p)}</small></div><div class="q"><button data-a="-" data-id="${id}" aria-label="Kurangi">−</button><span>${q}</span><button data-a="+" data-id="${id}" aria-label="Tambah">+</button></div></li>`}).join("") : `<li class="empty">Belum ada pesanan. Pilih dari menu dulu ya.</li>`;
}
function add(id,btn){
  cart[id]=(cart[id]||0)+1; sync();
  const p=$("#pill"); p.classList.remove("bump"); void p.offsetWidth; p.classList.add("bump");
  if(btn&&btn.classList.contains("add")){btn.textContent="Ditambah";btn.classList.add("ok");setTimeout(()=>{btn.textContent="Tambah";btn.classList.remove("ok")},1100)}
  else toast(by(id).n+" ditambahkan");
}
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-id]"); if(!b||b.closest("#lines")||!(b.classList.contains("add")||b.closest(".row"))) return;
  add(b.dataset.id,b);
});
$("#lines").addEventListener("click",e=>{
  const b=e.target.closest("button[data-a]"); if(!b) return;
  const id=b.dataset.id; cart[id]+= b.dataset.a==="+"?1:-1; if(cart[id]<1) delete cart[id];
  sync(); if(!count()) setSheet(false);
});
const sheet=$("#sheet"), scrim=$("#scrim");
function setSheet(on){sheet.classList.toggle("on",on);scrim.classList.toggle("on",on);document.body.style.overflow=on?"hidden":""}
$("#pill").onclick=()=>setSheet(true); $("#sheetX").onclick=scrim.onclick=()=>setSheet(false);
document.addEventListener("keydown",e=>e.key==="Escape"&&setSheet(false));
$("#send").onclick=()=>{
  if(!count()) return toast("Pilih menu dulu ya");
  const lines=Object.entries(cart).map(([id,q])=>`- ${by(id).n} x${q} (${rp(by(id).p*q)})`).join("\n");
  const who=$("#who").value.trim(), note=$("#note").value.trim();
  const msg=`Halo FarKop, saya mau pesan:\n\n${lines}\n\nTotal: ${rp(total())}\nAtas nama: ${who||"-"}\n${$("#mode").value}${note?`\nCatatan: ${note}`:""}`;
  window.open(`https://wa.me/${CFG.wa}?text=${encodeURIComponent(msg)}`,"_blank","noopener");
};
let tt; function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("on"),1900)}

/* ---- jam buka & status ---- */
const fmt = h => h===24 ? "00.00" : String(h).padStart(2,"0")+".00";
function hours(){
  const now=new Date(), d=now.getDay(), h=now.getHours()+now.getMinutes()/60, [o,c]=HOURS[d];
  const open = h>=o && h<c, st=$("#status");
  st.classList.toggle("closed",!open);
  st.querySelector("span").textContent = open ? `Buka sekarang, tutup jam ${fmt(c)}` : (h<o ? `Tutup, buka hari ini jam ${fmt(o)}` : `Tutup, buka lagi besok jam ${fmt(HOURS[(d+1)%7][0])}`);
  $("#htable").innerHTML = [1,2,3,4,5,6,0].map(i=>`<tr class="${i===d?"today":""}"><td>${DAYS[i]}</td><td>${fmt(HOURS[i][0])} – ${fmt(HOURS[i][1])}</td></tr>`).join("");
  $("#hnote").textContent = "Hari ini disorot. Libur hari besar, kami kabari lewat WhatsApp.";
}

/* ---- menu mobile, scroll, footer ---- */
const burger=$("#burger"), mm=$("#mmenu");
const setMenu=on=>{burger.setAttribute("aria-expanded",on);mm.classList.toggle("on",on)};
burger.onclick=()=>setMenu(burger.getAttribute("aria-expanded")!=="true");
mm.addEventListener("click",e=>e.target.closest("a")&&setMenu(false));
addEventListener("scroll",()=>$("#top").classList.toggle("sc",scrollY>8),{passive:true});
$("#faddr").textContent=CFG.addr; $("#fwa").href=`https://wa.me/${CFG.wa}`; $("#fwa").textContent=CFG.waLabel; $("#yr").textContent=new Date().getFullYear();
document.querySelectorAll(".story-ph,.story-t,.hours").forEach(el=>{el.classList.add("rv2");io.observe(el)});

loadImgs(); render(); sync(); hours(); setInterval(hours,60000);
