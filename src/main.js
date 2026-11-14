const STORAGE_KEY = "camade3d-pieces-v1";
const starterPieces = [
  {id:"p1",name:"Suporte de headset",category:"Organização",price:24.90,material:"PLA",description:"Suporte compacto para deixar seu headset organizado na mesa.",image:""},
  {id:"p2",name:"Vaso geométrico",category:"Decoração",price:32.00,material:"PLA",description:"Peça decorativa com linhas geométricas e visual minimalista.",image:""},
  {id:"p3",name:"Organizador de cabos",category:"Acessórios",price:8.50,material:"PLA",description:"Mantenha os cabos da sua mesa no lugar.",image:""},
  {id:"p4",name:"Gancho multiuso",category:"Utilidades",price:12.00,material:"PETG",description:"Gancho versátil para pequenos objetos do dia a dia.",image:""},
  {id:"p5",name:"Suporte para celular",category:"Acessórios",price:18.90,material:"PLA",description:"Ângulo confortável para apoiar o celular na mesa.",image:""},
  {id:"p6",name:"Porta-canetas modular",category:"Organização",price:21.50,material:"PLA",description:"Organize canetas e acessórios com um design simples.",image:""}
];
const $ = (selector) => document.querySelector(selector);
const grid = $("#product-grid");
const modal = $("#admin-modal");
let pieces = loadPieces();
let activeCategory = "Todas";
let searchTerm = "";

function loadPieces(){
  try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : starterPieces; }
  catch { return starterPieces; }
}
function persist(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(pieces)); }
function money(value){
  return Number(value || 0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
}
function safe(value=""){
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function imageMarkup(piece){
  if(piece.image){
    return `<img src="${safe(piece.image)}" alt="${safe(piece.name)}" loading="lazy" onerror="this.remove();this.parentElement.classList.add('no-image')">`;
  }
  return `<div class="placeholder-art"><span class="placeholder-ring"></span><span class="placeholder-shape">✳</span><small>CAMADÊ 3D</small></div>`;
}
function renderCatalog(){
  const filtered = pieces.filter(piece => (activeCategory==="Todas" || piece.category===activeCategory) &&
    [piece.name,piece.category,piece.description,piece.material].join(" ").toLowerCase().includes(searchTerm));
  $("#piece-count").textContent = pieces.length;
  grid.innerHTML = filtered.map(piece => `
    <article class="product-card">
      <div class="product-image ${piece.image ? "" : "no-image"}">${imageMarkup(piece)}<span class="category-tag">${safe(piece.category)}</span><button class="quick-view" data-view="${safe(piece.id)}" aria-label="Ver detalhes">↗</button></div>
      <div class="product-info"><div class="product-meta"><span>${safe(piece.material || "Material sob consulta")}</span><span class="made-dot">● SOB ENCOMENDA</span></div><h3>${safe(piece.name)}</h3><p>${safe(piece.description || "Peça disponível no catálogo Camadê 3D.")}</p><div class="product-bottom"><strong>${piece.price ? money(piece.price) : "Consulte"}</strong><button data-view="${safe(piece.id)}">Ver peça <span>→</span></button></div></div>
    </article>`).join("");
  $("#empty-state").classList.toggle("hidden",filtered.length!==0);
  grid.classList.toggle("hidden",filtered.length===0);
}
function renderAdmin(){
  $("#admin-count").textContent = `${pieces.length} ${pieces.length===1?"item":"itens"}`;
  $("#admin-list").innerHTML = pieces.length ? pieces.map(piece=>`
    <div class="admin-item"><div class="admin-thumb">${piece.image ? `<img src="${safe(piece.image)}" alt="">` : "✳"}</div><div class="admin-item-info"><b>${safe(piece.name)}</b><span>${safe(piece.category)} · ${piece.price ? money(piece.price) : "Sem preço"}</span></div><button data-edit="${safe(piece.id)}" aria-label="Editar ${safe(piece.name)}">✎</button><button class="delete-button" data-delete="${safe(piece.id)}" aria-label="Excluir ${safe(piece.name)}">×</button></div>`).join("") : '<p class="admin-empty">Nenhuma peça cadastrada ainda.</p>';
}
function showToast(message){
  const toast=$("#toast"); toast.textContent=message; toast.classList.remove("hidden");
  clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.add("hidden"),2600);
}
function resetForm(){
  $("#piece-form").reset(); $("#piece-id").value=""; $("#save-piece").innerHTML='Adicionar peça <span>＋</span>';
  $("#cancel-edit").classList.add("hidden");
}
function editPiece(id){
  const piece=pieces.find(item=>item.id===id); if(!piece)return;
  $("#piece-id").value=piece.id; $("#piece-name").value=piece.name; $("#piece-category").value=piece.category;
  $("#piece-price").value=piece.price || ""; $("#piece-material").value=piece.material || "";
  $("#piece-image").value=piece.image || ""; $("#piece-description").value=piece.description || "";
  $("#save-piece").textContent="Salvar alterações"; $("#cancel-edit").classList.remove("hidden");
  $("#piece-name").focus();
}
function openAdmin(){ modal.classList.remove("hidden"); document.body.classList.add("modal-open"); renderAdmin(); }
function closeAdmin(){ modal.classList.add("hidden"); document.body.classList.remove("modal-open"); resetForm(); }
function showDetails(id){
  const piece=pieces.find(item=>item.id===id); if(!piece)return;
  showToast(`${piece.name} · ${piece.price ? money(piece.price) : "Preço sob consulta"}`);
}

$("#search-input").addEventListener("input",event=>{searchTerm=event.target.value.trim().toLowerCase();renderCatalog();});
$("#search-focus").addEventListener("click",()=>{$("#search-input").focus();$("#catalogo").scrollIntoView({behavior:"smooth"});});
$("#category-filters").addEventListener("click",event=>{
  const button=event.target.closest("[data-category]"); if(!button)return;
  activeCategory=button.dataset.category;
  document.querySelectorAll(".filter").forEach(item=>item.classList.toggle("active",item===button));
  renderCatalog();
});
$("#clear-filters").addEventListener("click",()=>{activeCategory="Todas";searchTerm="";$("#search-input").value="";document.querySelectorAll(".filter").forEach(item=>item.classList.toggle("active",item.dataset.category==="Todas"));renderCatalog();});
$("#admin-open").addEventListener("click",openAdmin);
document.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",closeAdmin));
modal.addEventListener("click",event=>{if(event.target===modal)closeAdmin();});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!modal.classList.contains("hidden"))closeAdmin();});
$("#cancel-edit").addEventListener("click",resetForm);
$("#piece-form").addEventListener("submit",event=>{
  event.preventDefault();
  const id=$("#piece-id").value;
  const piece={id:id || `p-${Date.now()}`,name:$("#piece-name").value.trim(),category:$("#piece-category").value,
    price:Number($("#piece-price").value)||0,material:$("#piece-material").value.trim(),image:$("#piece-image").value.trim(),description:$("#piece-description").value.trim()};
  if(id){pieces=pieces.map(item=>item.id===id?piece:item);showToast("Peça atualizada!");}
  else{pieces.unshift(piece);showToast("Peça adicionada ao catálogo!");}
  persist();resetForm();renderCatalog();renderAdmin();
});
$("#admin-list").addEventListener("click",event=>{
  const edit=event.target.closest("[data-edit]"); const remove=event.target.closest("[data-delete]");
  if(edit)editPiece(edit.dataset.edit);
  if(remove){
    const piece=pieces.find(item=>item.id===remove.dataset.delete); if(!piece)return;
    if(confirm(`Excluir "${piece.name}" do catálogo?`)){pieces=pieces.filter(item=>item.id!==piece.id);persist();renderCatalog();renderAdmin();showToast("Peça removida.");}
  }
});
grid.addEventListener("click",event=>{const button=event.target.closest("[data-view]");if(button)showDetails(button.dataset.view);});
renderCatalog();
