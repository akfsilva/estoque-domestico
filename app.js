const KEY = "vault_stock_final_v25";

const baseItems = [
  {name:"ARROZ", cat:"ALIMENTOS", unit:"KG", qty:16, goal:48, cons:0.100, persons:1, note:""},
  {name:"FEIJÃO", cat:"ALIMENTOS", unit:"KG", qty:4, goal:24, cons:0.150, persons:1, note:""},
  {name:"MACARRÃO PARAFUSO", cat:"ALIMENTOS", unit:"KG", qty:2, goal:24, cons:0.050, persons:1, note:""},
  {name:"SAL", cat:"ALIMENTOS", unit:"KG", qty:1, goal:2, cons:0.005, persons:1, note:""},
  {name:"AÇÚCAR CRISTAL", cat:"ALIMENTOS", unit:"KG", qty:4.5, goal:12, cons:0.100, persons:1, note:""},
  {name:"ÓLEO DE SOJA", cat:"ALIMENTOS", unit:"L", qty:3, goal:12, cons:0.030, persons:1, note:""},
  {name:"ÓLEO MISTO", cat:"ALIMENTOS", unit:"L", qty:1, goal:4, cons:0.010, persons:1, note:""},
  {name:"MOLHO DE TOMATE", cat:"ALIMENTOS", unit:"SACHÊ", qty:3, goal:24, cons:0.050, persons:1, note:""},
  {name:"SARDINHA", cat:"ALIMENTOS", unit:"UN", qty:2, goal:24, cons:0.040, persons:1, note:""},
  {name:"CAPUCCINO", cat:"ALIMENTOS", unit:"KG", qty:0.2, goal:1, cons:0.010, persons:1, note:""},
  {name:"GELEIA DE FRAMBOESA", cat:"ALIMENTOS", unit:"UN", qty:1, goal:4, cons:0.010, persons:1, note:""},
  {name:"CAFÉ DESCAFEINADO", cat:"ALIMENTOS", unit:"KG", qty:0.25, goal:1, cons:0.010, persons:1, note:""},
  {name:"SABONETE ANTIBACTERIANO", cat:"HIGIENE", unit:"UN", qty:14, goal:48, cons:0.100, persons:1, note:""},
  {name:"SABONETE NORMAL", cat:"HIGIENE", unit:"UN", qty:7, goal:24, cons:0.100, persons:1, note:""},
  {name:"DESODORANTE ANTIBACTERIANO", cat:"HIGIENE", unit:"UN", qty:1, goal:12, cons:0.030, persons:1, note:""},
  {name:"DESODORANTE NORMAL", cat:"HIGIENE", unit:"UN", qty:1, goal:12, cons:0.030, persons:1, note:""},
  {name:"PASTA DE DENTE (SENSÍVEIS)", cat:"HIGIENE", unit:"UN", qty:2, goal:12, cons:0.050, persons:1, note:""},
  {name:"PASTA DE DENTE NORMAL", cat:"HIGIENE", unit:"UN", qty:3, goal:12, cons:0.050, persons:1, note:""},
  {name:"BUCHA (PACOTE C/ 4)", cat:"LIMPEZA", unit:"UN", qty:2, goal:12, cons:0.030, persons:1, note:""},
  {name:"SABÃO CASEIRO", cat:"LIMPEZA", unit:"BARRA", qty:10, goal:50, cons:0.100, persons:1, note:""},
  {name:"PAPEL TOALHA (PACOTE C/ 2)", cat:"LIMPEZA", unit:"UN", qty:1, goal:12, cons:0.050, persons:1, note:""}
];

let items = JSON.parse(localStorage.getItem(KEY)) || baseItems.map(i => ({...i, id: Date.now() + Math.random()}));

function save(){ 
    localStorage.setItem(KEY, JSON.stringify(items)); 
}

function calculateGoal(dailyCons, itemPersons) {
    const m = +document.getElementById('calc_meses').value || 1;
    const p = itemPersons || 1;
    return Math.round(dailyCons * p * (m * 30.41));
}

window.add = function(){
    const n = document.getElementById('n').value.trim();
    if(!n) return;
    const consVal = +document.getElementById('cons').value || 0;
    const pVal = +document.getElementById('p_item').value || 1;
    items.push({
        id: Date.now() + Math.random(),
        name: n.toUpperCase(), 
        cat: (document.getElementById('c').value || "GERAL").toUpperCase(),
        unit: (document.getElementById('u').value || "UN").toUpperCase(),
        qty: +document.getElementById('q').value || 0,
        cons: consVal,
        persons: pVal,
        note: document.getElementById('obs').value || "",
        goal: calculateGoal(consVal, pVal) || 1
    });
    save(); render();
    ["n","c","u","q","cons","p_item","obs"].forEach(id => document.getElementById(id).value = id === "p_item" ? "1" : "");
};

window.upd = function(id, key, val){
    const item = items.find(i => i.id === id);
    if(item) { 
        item[key] = (key === 'cat' || key === 'unit' || key === 'note' || key === 'name') ? val.toUpperCase() : parseFloat(val) || 0; 
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

window.render = function(){
    const out = document.getElementById("estoque");
    out.innerHTML = "";
    const cats = [...new Set(items.map(i => i.cat.toUpperCase()))].sort();
    
    cats.forEach(cat => {
        const catItems = items.filter(i => i.cat === cat);
        const html = catItems.map(i => {
            const suggested = calculateGoal(i.cons || 0, i.persons || 1);
            const p = i.goal ? Math.min(100, (i.qty / i.goal) * 100) : 0;
            return `
                <div class="item">
                    <div class="item-info"><span>> ${i.name}</span> <span>${i.qty} ${i.unit} (${p.toFixed(0)}%)</span></div>
                    <div class="suggested-box">
                        <span>SUGESTÃO (${i.persons || 1} PES.): ${suggested} ${i.unit}</span>
                        <button style="width:auto; padding:5px 10px; font-size:9px" onclick="applyMeta(${i.id}, ${suggested})">APLICAR</button>
                    </div>
                    <div class="controls">
                        <div><label>ESTOQUE</label><input type="number" step="0.01" value="${i.qty}" onchange="upd(${i.id},'qty',this.value)"></div>
                        <div><label>META</label><input type="number" step="1" value="${Math.round(i.goal)}" onchange="upd(${i.id},'goal',this.value)"></div>
                        <div><label>PESSOAS</label><input type="number" value="${i.persons || 1}" onchange="upd(${i.id},'persons',this.value)"></div>
                        <div><label>UNID</label><input type="text" value="${i.unit}" onchange="upd(${i.id},'unit',this.value)"></div>
                    </div>
                    <div class="progress ${p < 30 ? 'low' : ''}"><div class="bar" style="width:${p}%"></div></div>
                    <input type="text" style="font-size:11px; background:transparent; border:1px dashed var(--green); color:var(--green); width:100%; padding:5px; outline:none;" value="${i.note || ''}" placeholder="NOTAS" onchange="upd(${i.id},'note',this.value)">
                    <button class="danger" onclick="del(${i.id})">DELETAR</button>
                </div>`;
        }).join("");
        
        const div = document.createElement("div");
        div.className = "category";
        div.innerHTML = `<div class="cat-header">${cat}</div><div>${html}</div>`;
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
