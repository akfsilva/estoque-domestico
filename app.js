// Chave única para limpar o cache do navegador e forçar a nova lista completa
const KEY = "vault_stock_final_fixed_v12";

const baseItems = [
  // CATEGORIA: ALIMENTOS
  {name:"Arroz", cat:"ALIMENTOS", unit:"KG", qty:16, goal:48, cons:0.100},
  {name:"Feijão", cat:"ALIMENTOS", unit:"KG", qty:4, goal:24, cons:0.150},
  {name:"Macarrão parafuso", cat:"ALIMENTOS", unit:"KG", qty:2, goal:24, cons:0.050},
  {name:"Sal", cat:"ALIMENTOS", unit:"KG", qty:1, goal:2, cons:0.005},
  {name:"Açúcar cristal", cat:"ALIMENTOS", unit:"KG", qty:4.5, goal:12, cons:0.100},
  {name:"Óleo de soja", cat:"ALIMENTOS", unit:"L", qty:3, goal:12, cons:0.030},
  {name:"Molho de tomate", cat:"ALIMENTOS", unit:"UN", qty:3, goal:24, cons:0.050},
  {name:"Sardinha", cat:"ALIMENTOS", unit:"UN", qty:2, goal:24, cons:0.040},
  {name:"Capuccino", cat:"ALIMENTOS", unit:"UN", qty:0.2, goal:1, cons:0.010},
  {name:"Café", cat:"ALIMENTOS", unit:"KG", qty:0.5, goal:7.2, cons:0.020},
  {name:"Leite Longa Vida", cat:"ALIMENTOS", unit:"L", qty:6, goal:72, cons:0.200},
  {name:"Água Potável", cat:"ALIMENTOS", unit:"L", qty:20, goal:1080, cons:3.000},
  
  // CATEGORIA: HIGIENE
  {name:"Sabonete antibacteriano", cat:"HIGIENE", unit:"UN", qty:14, goal:48, cons:0.100},
  {name:"Pasta de dente comum", cat:"HIGIENE", unit:"UN", qty:3, goal:12, cons:0.050},
  {name:"Papel Higiênico", cat:"HIGIENE", unit:"UN", qty:8, goal:126, cons:0.350},

  // CATEGORIA: LIMPEZA (Forçando a exibição com dados)
  {name:"Sabão em Pó", cat:"LIMPEZA", unit:"KG", qty:2, goal:10, cons:0.030},
  {name:"Detergente", cat:"LIMPEZA", unit:"UN", qty:4, goal:20, cons:0.050},
  {name:"Água Sanitária", cat:"LIMPEZA", unit:"L", qty:5, goal:15, cons:0.040},
  {name:"Desinfetante", cat:"LIMPEZA", unit:"L", qty:2, goal:10, cons:0.020}
];

let items = JSON.parse(localStorage.getItem(KEY)) || baseItems.map(i => ({...i, id: Date.now() + Math.random()}));

function save(){ localStorage.setItem(KEY, JSON.stringify(items)); }

function calculateGoal(dailyCons) {
    const p = +document.getElementById('calc_pessoas').value || 1;
    const m = +document.getElementById('calc_meses').value || 1;
    return (dailyCons * p * (m * 30.41));
}

window.add = function(){
  const n = document.getElementById('n').value.trim();
  const c = document.getElementById('c').value.trim().toUpperCase() || "GERAL";
  const u = document.getElementById('u').value.trim().toUpperCase() || "UN";
  const cons = +document.getElementById('cons').value || 0;
  
  if(n){
    items.push({
      id: Date.now() + Math.random(),
      name: n, cat: c, unit: u, 
      qty: +document.getElementById('q').value || 0,
      cons: cons, goal: calculateGoal(cons) || 1
    });
    save(); render();
    document.getElementById('n').value = "";
  }
};

window.upd = function(id, key, val){
  const item = items.find(i => i.id === id);
  if(item) { 
    item[key] = (key === 'cat' || key === 'unit') ? val.toUpperCase() : parseFloat(val) || 0; 
    save(); render(); 
  }
};

window.applyMeta = function(id, val) {
    const item = items.find(i => i.id === id);
    if(item) { item.goal = val; save(); render(); }
};

window.del = function(id){
  if(confirm("REMOVER ITEM DEFINITIVAMENTE?")){ items = items.filter(i => i.id !== id); save(); render(); }
};

window.toggle = function(id){
  const el = document.getElementById(id);
  if(el) el.style.display = (el.style.display === "none") ? "block" : "none";
};

document.addEventListener('input', (e) => {
    if(e.target.id === 'calc_pessoas' || e.target.id === 'calc_meses') render();
});

function render(){
  const out = document.getElementById("estoque");
  out.innerHTML = "";
  // Pega todas as categorias únicas, incluindo LIMPEZA
  const cats = [...new Set(items.map(i => i.cat))].sort();

  cats.forEach(cat => {
    const cid = "cat_" + cat.replace(/[^a-zA-Z0-9]/g, "");
    const catItems = items.filter(i => i.cat === cat);
    
    const html = catItems.map(i => {
      const suggested = calculateGoal(i.cons || 0);
      const p = i.goal ? Math.min(100, (i.qty / i.goal) * 100) : 0;
      
      return `
        <div class="item">
          <div class="item-info">
            <b>> ${i.name.toUpperCase()}</b>
            <span>${p.toFixed(0)}%</span>
          </div>
          <div class="suggested-box">
             <span>OBJETIVO: ${suggested.toFixed(2)} ${i.unit}</span>
             <button style="width:auto; padding:2px 8px; font-size:9px;" onclick="applyMeta(${i.id}, ${suggested})">CALIBRAR</button>
          </div>
          <div class="controls">
            <div><label>ESTOQUE</label><input type="number" step="0.01" value="${i.qty}" onchange="upd(${i.id},'qty',this.value)"></div>
            <div><label>META</label><input type="number" step="0.01" value="${i.goal}" onchange="upd(${i.id},'goal',this.value)"></div>
          </div>
          <div class="progress ${p < 30 ? 'low' : ''}"><div class="bar" style="width:${p}%"></div></div>
          <div class="input-row" style="margin-top:10px;">
             <div style="flex:2"><label>CONS. DIA/PESSOA</label><input type="number" step="0.001" value="${i.cons || 0}" onchange="upd(${i.id},'cons',this.value)"></div>
             <div style="flex:1"><label>UNID</label><input type="text" value="${i.unit}" onchange="upd(${i.id},'unit',this.value)"></div>
          </div>
          <button class="danger" onclick="del(${i.id})">DELETAR</button>
        </div>`;
    }).join("");

    const div = document.createElement("div");
    div.className = "category";
    // Mudei para "display:block" para que as categorias já comecem abertas
    div.innerHTML = `<div class="cat-header" onclick="toggle('${cid}')">${cat} [-]</div><div id="${cid}" style="display:block;">${html}</div>`;
    out.appendChild(div);
  });
}

window.exportData = function() {
    const blob = new Blob([JSON.stringify(items, null, 2)], {type: "application/json"});
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.download = `vault_inventory.json`; link.click();
};

window.importData = function(event) {
    const reader = new FileReader();
    reader.onload = (e) => { items = JSON.parse(e.target.result); save(); render(); };
    reader.readAsText(event.target.files[0]);
};

render();
