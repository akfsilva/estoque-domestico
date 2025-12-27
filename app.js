const KEY = "vault_stock_final_v25";

// Persistência de dados
if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist();
}

// A SUA LISTA REAL - EXATAMENTE COMO PASSADA
const baseItems = [
  {name:"Arroz", cat:"ALIMENTOS", unit:"KG", qty:16, goal:48, cons:0.100, note:""},
  {name:"Feijão", cat:"ALIMENTOS", unit:"KG", qty:4, goal:24, cons:0.150, note:""},
  {name:"Macarrão parafuso", cat:"ALIMENTOS", unit:"KG", qty:2, goal:24, cons:0.050, note:""},
  {name:"Sal", cat:"ALIMENTOS", unit:"KG", qty:1, goal:2, cons:0.005, note:""},
  {name:"Açúcar cristal", cat:"ALIMENTOS", unit:"KG", qty:4.5, goal:12, cons:0.100, note:""},
  {name:"Óleo de soja", cat:"ALIMENTOS", unit:"L", qty:3, goal:12, cons:0.030, note:""},
  {name:"Óleo misto", cat:"ALIMENTOS", unit:"L", qty:1, goal:4, cons:0.010, note:""},
  {name:"Molho de tomate", cat:"ALIMENTOS", unit:"SACHÊ", qty:3, goal:24, cons:0.050, note:""},
  {name:"Sardinha", cat:"ALIMENTOS", unit:"UN", qty:2, goal:24, cons:0.040, note:""},
  {name:"Capuccino", cat:"ALIMENTOS", unit:"G", qty:200, goal:1000, cons:10, note:""},
  {name:"Geleia de framboesa", cat:"ALIMENTOS", unit:"UN", qty:1, goal:4, cons:0.010, note:""},
  {name:"Café descafeinado", cat:"ALIMENTOS", unit:"G", qty:250, goal:1000, cons:10, note:""},
  {name:"Sabonete antibacteriano", cat:"HIGIENE", unit:"UN", qty:14, goal:48, cons:0.100, note:""},
  {name:"Sabonete normal", cat:"HIGIENE", unit:"UN", qty:7, goal:24, cons:0.100, note:""},
  {name:"Desodorante antibacteriano", cat:"HIGIENE", unit:"UN", qty:1, goal:12, cons:0.030, note:""},
  {name:"Desodorante normal", cat:"HIGIENE", unit:"UN", qty:1, goal:12, cons:0.030, note:""},
  {name:"Pasta de dente (sensíveis)", cat:"HIGIENE", unit:"UN", qty:2, goal:12, cons:0.050, note:""},
  {name:"Pasta de dente normal", cat:"HIGIENE", unit:"UN", qty:3, goal:12, cons:0.050, note:""},
  {name:"Bucha (pacote c/ 4)", cat:"LIMPEZA", unit:"UN", qty:2, goal:12, cons:0.030, note:""},
  {name:"Sabão caseiro", cat:"LIMPEZA", unit:"BARRA", qty:10, goal:50, cons:0.100, note:""},
  {name:"Papel toalha (pacote c/ 2)", cat:"LIMPEZA", unit:"UN", qty:1, goal:12, cons:0.050, note:""}
];

let items = JSON.parse(localStorage.getItem(KEY)) || baseItems.map(i => ({...i, id: Date.now() + Math.random()}));

function save(){ 
    items.forEach(i => {
        i.cat = String(i.cat).trim().toUpperCase();
        i.unit = String(i.unit).trim().toUpperCase();
        i.name = String(i.name).trim().toUpperCase();
    });
    localStorage.setItem(KEY, JSON.stringify(items)); 
}

function calculateGoal(dailyCons) {
    const p = +document.getElementById('calc_pessoas').value || 1;
    const m = +document.getElementById('calc_meses').value || 1;
    return Math.round(dailyCons * p * (m * 30.41));
}

window.add = function(){
    const n = document.getElementById('n').value.trim();
    if(!n) return;
    const consVal = +document.getElementById('cons').value || 0;
    const catFinal = (document.getElementById('c').value.trim() || "GERAL").toUpperCase();
    const unitFinal = (document.getElementById('u').value.trim() || "UN").toUpperCase();

    items.push({
        id: Date.now() + Math.random(),
        name: n.toUpperCase(), 
        cat: catFinal,
        unit: unitFinal,
        qty: +document.getElementById('q').value || 0,
        cons: consVal,
        note: document.getElementById('obs').value || "",
        goal: calculateGoal(consVal) || 1
    });
    save(); render();
    ["n","c","u","q","cons","obs"].forEach(id => document.getElementById(id).value = "");
};

window.upd = function(id, key, val){
    const item = items.find(i => i.id === id);
    if(item) { 
        if(key === 'cat' || key === 'unit' || key === 'name') val = String(val).trim().toUpperCase();
        item[key] = (key === 'cat' || key === 'unit' || key === 'note' || key === 'name') ? val : parseFloat(val) || 0; 
        save(); render(); 
    }
};

window.applyMeta = function(id, val) {
    const item = items.find(i => i.id === id);
    if(item) { item.goal = Math.round(val); save(); render(); }
};

window.del = function(id){
    if(confirm("REMOVER ITEM?")){ items = items.filter(i => i.id !== id); save(); render(); }
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
    const cats = [...new Set(items.map(i => i.cat.trim().toUpperCase()))].sort();
    
    cats.forEach(cat => {
        const cid = "cat_" + cat.replace(/[^A-Z0-9]/g, "");
        const catItems = items.filter(i => i.cat.trim().toUpperCase() === cat);
        const html = catItems.map(i => {
            const suggested = calculateGoal(i.cons || 0);
            const p = i.goal ? Math.min(100, (i.qty / i.goal) * 100) : 0;
            return `
                <div class="item">
                    <div class="item-info"><b>> ${i.name}</b> <span>${i.qty} ${i.unit} (${p.toFixed(0)}%)</span></div>
                    <div class="suggested-box">
                        <span>SUGESTÃO: ${suggested} ${i.unit}</span>
                        <button style="width:auto; padding:2px 8px; font-size:9px" onclick="applyMeta(${i.id}, ${suggested})">APLICAR</button>
                    </div>
                    <div class="controls">
                        <div><label>ESTOQUE (${i.unit})</label><input type="number" step="0.01" value="${i.qty}" onchange="upd(${i.id},'qty',this.value)"></div>
                        <div><label>META (${i.unit})</label><input type="number" step="1" value="${Math.round(i.goal)}" onchange="upd(${i.id},'goal',this.value)"></div>
                    </div>
                    <div class="progress ${p < 30 ? 'low' : ''}"><div class="bar" style="width:${p}%"></div></div>
                    <div style="margin-top:10px">
                        <label>NOTAS TÉCNICAS</label>
                        <input type="text" class="note-input" value="${i.note || ''}" placeholder="..." onchange="upd(${i.id},'note',this.value)">
                    </div>
                    <button class="danger" onclick="del(${i.id})">REMOVER</button>
                </div>`;
        }).join("");
        
        const div = document.createElement("div");
        div.className = "category";
        div.innerHTML = `<div class="cat-header" onclick="toggle('${cid}')">${cat} [-]</div><div id="${cid}" style="display:block;">${html}</div>`;
        out.appendChild(div);
    });
}

window.exportData = function() {
    const blob = new Blob([JSON.stringify(items, null, 2)], {type: "application/json"});
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.download = `vault_backup.json`; link.click();
};

window.importData = function(event) {
    const reader = new FileReader();
    reader.onload = (e) => { items = JSON.parse(e.target.result); save(); render(); };
    reader.readAsText(event.target.files[0]);
};

save();
render();
