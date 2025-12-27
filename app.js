const KEY = "vault_stock_v6";

// Itens Iniciais com base no DIEESE (Consumo diário médio)
const baseItems = [
  {name:"ARROZ", cat:"ALIMENTOS", unit:"KG", qty:5, goal:36, cons:0.100},
  {name:"FEIJÃO", cat:"ALIMENTOS", unit:"KG", qty:3, goal:54, cons:0.150},
  {name:"AÇÚCAR", cat:"ALIMENTOS", unit:"KG", qty:2, goal:36, cons:0.100},
  {name:"CAFÉ", cat:"ALIMENTOS", unit:"KG", qty:0.5, goal:7.2, cons:0.020},
  {name:"ÓLEO", cat:"ALIMENTOS", unit:"L", qty:1, goal:10.8, cons:0.030},
  {name:"LEITE", cat:"ALIMENTOS", unit:"L", qty:6, goal:72, cons:0.200},
  {name:"ÁGUA POTÁVEL", cat:"ALIMENTOS", unit:"L", qty:20, goal:1080, cons:3.000}
];

let items = JSON.parse(localStorage.getItem(KEY)) || baseItems.map(i => ({...i, id: Date.now() + Math.random()}));

function save(){ localStorage.setItem(KEY, JSON.stringify(items)); }

window.add = function(){
  const n = document.getElementById('n').value.trim();
  const c = document.getElementById('c').value.trim().toUpperCase() || "GERAL";
  const u = document.getElementById('u').value.trim().toUpperCase() || "UN";
  const cons = +document.getElementById('cons').value || 0;
  
  if(n){
    const suggestedGoal = calculateGoal(cons);
    items.push({
      id: Date.now() + Math.random(),
      name: n.toUpperCase(), cat: c, unit: u, qty: +document.getElementById('q').value || 0,
      cons: cons, goal: suggestedGoal || 1
    });
    save(); render();
    // Limpar campos
    document.getElementById('n').value = ""; 
    document.getElementById('q').value = "0";
    document.getElementById('cons').value = "0";
  }
};

function calculateGoal(dailyCons) {
    const p = +document.getElementById('calc_pessoas').value || 1;
    const m = +document.getElementById('calc_meses').value || 1;
    return (dailyCons * p * (m * 30.41));
}

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
  if(confirm("DELETAR REGISTRO PERMANENTEMENTE?")){ items = items.filter(i => i.id !== id); save(); render(); }
};

window.toggle = function(id){
  const el = document.getElementById(id);
  if(el) el.style.display = (el.style.display === "none" || el.style.display === "") ? "block" : "none";
};

// Listener para recalcular sugestões em tempo real
document.addEventListener('input', (e) => {
    if(e.target.id === 'calc_pessoas' || e.target.id === 'calc_meses') render();
});

function render(){
  const out = document.getElementById("estoque");
  out.innerHTML = "";
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
            <b>> ${i.name} <span class="unit-label">(${i.unit})</span></b>
            <span>${p.toFixed(0)}%</span>
          </div>

          <div class="suggested-box">
             <span>SUGESTÃO DIEESE: ${suggested.toFixed(2)} ${i.unit}</span>
             <button style="width:auto; padding:4px 10px; font-size:10px;" onclick="applyMeta(${i.id}, ${suggested})">CALIBRAR</button>
          </div>

          <div class="controls">
            <div><label>ESTOQUE ATUAL</label><input type="number" step="0.01" value="${i.qty}" onchange="upd(${i.id},'qty',this.value)"></div>
            <div><label>OBJETIVO (META)</label><input type="number" step="0.01" value="${i.goal}" onchange="upd(${i.id},'goal',this.value)"></div>
          </div>

          <div class="progress ${p < 30 ? 'low' : ''}"><div class="bar" style="width:${p}%"></div></div>
          ${p < 30 ? '<div class="alert">ALERTA: ESTOQUE ABAIXO DA META</div>' : ''}

          <div class="input-row" style="margin-top:10px;">
             <div style="flex:2"><label>CONSUMO DIA/PESSOA</label><input type="number" step="0.001" value="${i.cons || 0}" onchange="upd(${i.id},'cons',this.value)"></div>
             <div style="flex:1"><label>UNIDADE</label><input type="text" value="${i.unit}" onchange="upd(${i.id},'unit',this.value)"></div>
          </div>

          <button class="danger" onclick="del(${i.id})">REMOVER ITEM</button>
        </div>`;
    }).join("");

    const div = document.createElement("div");
    div.className = "category";
    div.innerHTML = `<div class="cat-header" onclick="toggle('${cid}')">${cat}</div><div id="${cid}" style="display:none;">${html}</div>`;
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
