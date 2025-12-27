const KEY = "estoque_domestico_vfinal";

const baseItems = [
  {name:"Arroz",cat:"ALIMENTOS",qty:16,goal:48},
  {name:"Feijão",cat:"ALIMENTOS",qty:4,goal:24},
  {name:"Macarrão parafuso",cat:"ALIMENTOS",qty:2,goal:24},
  {name:"Sal",cat:"ALIMENTOS",qty:1,goal:2},
  {name:"Açúcar cristal",cat:"ALIMENTOS",qty:4.5,goal:12},
  {name:"Óleo de soja",cat:"ALIMENTOS",qty:3,goal:12},
  {name:"Óleo misto",cat:"ALIMENTOS",qty:1,goal:12},
  {name:"Molho de tomate",cat:"ALIMENTOS",qty:3,goal:24},
  {name:"Sardinha",cat:"ALIMENTOS",qty:2,goal:24},
  {name:"Capuccino",cat:"ALIMENTOS",qty:0.2,goal:1},
  {name:"Geleia de framboesa",cat:"ALIMENTOS",qty:1,goal:4},
  {name:"Café descafeinado",cat:"ALIMENTOS",qty:0.25,goal:2},
  {name:"Papel toalha",cat:"LIMPEZA",qty:1,goal:6},
  {name:"Bucha de cozinha",cat:"LIMPEZA",qty:8,goal:24},
  {name:"Sabão em barra",cat:"LIMPEZA",qty:10,goal:24},
  {name:"Sabonete antibacteriano",cat:"HIGIENE",qty:14,goal:48},
  {name:"Sabonete comum",cat:"HIGIENE",qty:7,goal:48},
  {name:"Desodorante antibacteriano",cat:"HIGIENE",qty:1,goal:12},
  {name:"Desodorante comum",cat:"HIGIENE",qty:1,goal:12},
  {name:"Pasta de dente sensível",cat:"HIGIENE",qty:2,goal:12},
  {name:"Pasta de dente comum",cat:"HIGIENE",qty:3,goal:12}
];

// Carrega e limpa IMEDIATAMENTE os dados para evitar duplicidade por erro de digitação
let items = JSON.parse(localStorage.getItem(KEY)) || baseItems.map(i => ({...i, id: Date.now() + Math.random()}));
items = items.map(i => ({...i, cat: i.cat.trim().toUpperCase()}));

function save(){ localStorage.setItem(KEY, JSON.stringify(items)); }

window.add = function(){
  const nome = document.getElementById('n').value.trim();
  // Força a categoria a ser sempre MAIÚSCULA e sem espaços
  const categoriaInput = document.getElementById('c').value.trim().toUpperCase() || "OUTROS";
  
  if(nome){
    items.push({
      id: Date.now() + Math.random(),
      name: nome,
      cat: categoriaInput,
      qty: +document.getElementById('q').value || 0,
      goal: +document.getElementById('g').value || 0
    });
    save(); render();
    document.getElementById('n').value = document.getElementById('c').value = "";
    document.getElementById('q').value = document.getElementById('g').value = "";
  }
};

window.del = function(id){
  if(confirm("DELETAR ITEM DO SISTEMA?")){
    items = items.filter(i => i.id !== id);
    save(); render();
  }
};

window.upd = function(id, key, val){
  const item = items.find(i => i.id === id);
  if(item) {
    item[key] = parseFloat(val) || 0;
    save();
    const container = document.querySelector(`[data-id="${id}"]`);
    if(container){
        const p = item.goal ? Math.min(100, (item.qty / item.goal) * 100) : 0;
        container.querySelector('.bar').style.width = p + "%";
        container.querySelector('.pct').innerText = p.toFixed(0) + "%";
        container.querySelector('.progress').className = `progress ${p < 30 ? 'low' : p < 60 ? 'mid' : ''}`;
    }
  }
};

window.toggle = function(id){
  const el = document.getElementById(id);
  if(el) {
    el.style.display = (el.style.display === "block") ? "none" : "block";
  }
};

window.exportData = function() {
    const dataStr = JSON.stringify(items, null, 2);
    const blob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vault_backup.json`;
    link.click();
};

window.importData = function(event) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            items = JSON.parse(e.target.result);
            // Limpa os dados importados também
            items = items.map(i => ({...i, cat: i.cat.trim().toUpperCase()}));
            save(); location.reload();
        } catch(err) { alert("ERRO NO ARQUIVO!"); }
    };
    reader.readAsText(event.target.files[0]);
};

function render(){
  const out = document.getElementById("estoque");
  if(!out) return;
  out.innerHTML = "";

  // Cria a lista de categorias únicas baseada nos itens atuais
  const uniqueCats = [...new Set(items.map(i => i.cat))].sort();

  uniqueCats.forEach(cat => {
    // Cria um ID seguro para o collapse (remove espaços e caracteres especiais)
    const cid = "cat_" + cat.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, "");
    
    const catDiv = document.createElement("div");
    catDiv.className = "category";
    
    const catItems = items.filter(i => i.cat === cat);
    
    const itemsHtml = catItems.map(i => {
      const p = i.goal ? Math.min(100, (i.qty / i.goal) * 100) : 0;
      const cls = p < 30 ? "low" : p < 60 ? "mid" : "";
      return `
        <div class="item" data-id="${i.id}">
          <div class="item-info"><b>> ${i.name}</b><span class="pct">${p.toFixed(0)}%</span></div>
          <div class="controls">
            <div><label>QTD</label><input type="number" step="0.01" value="${i.qty}" onchange="upd(${i.id},'qty',this.value)"></div>
            <div><label>META</label><input type="number" step="0.01" value="${i.goal}" onchange="upd(${i.id},'goal',this.value)"></div>
          </div>
          <div class="progress ${cls}"><div class="bar" style="width:${p}%"></div></div>
          ${p < 30 ? '<div class="alert" style="color:#ff3e3e; font-size:10px; margin:5px 0;">ALERTA: ESTOQUE BAIXO</div>' : ''}
          <button class="danger" onclick="del(${i.id})" style="margin-top:10px; background:rgba(255,0,0,0.1); border:1px solid #ff3e3e; color:#ff3e3e; width:100%; padding:5px; cursor:pointer;">REMOVER ITEM</button>
        </div>`;
    }).join("");

    catDiv.innerHTML = `
      <div class="cat-header" onclick="toggle('${cid}')" style="cursor:pointer; padding:10px; border:1px solid #00ff00; margin-top:10px; background:rgba(0,255,0,0.05)">
        ${cat}
      </div>
      <div class="cat-body" id="${cid}" style="display:none; padding:10px; border:1px solid #00ff00; border-top:none;">
        ${itemsHtml}
      </div>`;
    out.appendChild(catDiv);
  });
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
}

render();
