const estoquePadrao = [
  { nome: "Arroz (kg)", categoria: "Alimentos", atual: 16, meta: 48 },
  { nome: "Feijão (kg)", categoria: "Alimentos", atual: 4, meta: 12 },
  { nome: "Macarrão parafuso (kg)", categoria: "Alimentos", atual: 2, meta: 12 },
  { nome: "Sal (kg)", categoria: "Alimentos", atual: 1, meta: 1 },
  { nome: "Açúcar cristal (kg)", categoria: "Alimentos", atual: 4.5, meta: 6 },
  { nome: "Óleo de soja (L)", categoria: "Alimentos", atual: 3, meta: 12 },
  { nome: "Óleo misto (L)", categoria: "Alimentos", atual: 1, meta: 6 },
  { nome: "Molho de tomate (sachê)", categoria: "Alimentos", atual: 3, meta: 24 },
  { nome: "Sardinha (lata)", categoria: "Alimentos", atual: 2, meta: 24 },
  { nome: "Cappuccino (g)", categoria: "Alimentos", atual: 200, meta: 1000 },
  { nome: "Geleia (un)", categoria: "Alimentos", atual: 1, meta: 6 },
  { nome: "Café descafeinado (g)", categoria: "Alimentos", atual: 250, meta: 2000 },

  { nome: "Sabonete antibacteriano", categoria: "Higiene", atual: 14, meta: 48 },
  { nome: "Sabonete comum", categoria: "Higiene", atual: 7, meta: 48 },
  { nome: "Desodorante antibacteriano", categoria: "Higiene", atual: 1, meta: 12 },
  { nome: "Desodorante comum", categoria: "Higiene", atual: 1, meta: 12 },
  { nome: "Pasta dente sensível", categoria: "Higiene", atual: 2, meta: 12 },
  { nome: "Pasta dente comum", categoria: "Higiene", atual: 3, meta: 12 },

  { nome: "Bucha (pacote)", categoria: "Limpeza", atual: 2, meta: 12 },
  { nome: "Sabão caseiro (barra)", categoria: "Limpeza", atual: 10, meta: 24 },
  { nome: "Papel toalha", categoria: "Limpeza", atual: 1, meta: 12 }
];

let itens = JSON.parse(localStorage.getItem("estoque")) || estoquePadrao;

function salvar() {
  localStorage.setItem("estoque", JSON.stringify(itens));
}

function render() {
  const div = document.getElementById("estoque");
  div.innerHTML = "";

  const categorias = [...new Set(itens.map(i => i.categoria))];

  categorias.forEach(cat => {
    const h = document.createElement("h2");
    h.textContent = cat;
    div.appendChild(h);

    itens
      .filter(i => i.categoria === cat)
      .forEach((item, index) => {
        const box = document.createElement("div");
        box.className = "item";
        box.innerHTML = `
          <strong>${item.nome}</strong><br>
          Atual:
          <input type="number" value="${item.atual}"
            onchange="atualizarAtual(${index}, this.value)">
          Meta:
          <input type="number" value="${item.meta}"
            onchange="atualizarMeta(${index}, this.value)">
        `;
        div.appendChild(box);
      });
  });
}

function atualizarAtual(i, valor) {
  itens[i].atual = Number(valor);
  salvar();
}

function atualizarMeta(i, valor) {
  itens[i].meta = Number(valor);
  salvar();
}

function adicionarItem() {
  const nome = document.getElementById("nome").value;
  const categoria = document.getElementById("categoria").value;
  const atual = Number(document.getElementById("atual").value);
  const meta = Number(document.getElementById("meta").value);

  if (!nome || !categoria || isNaN(atual) || isNaN(meta)) return;

  itens.push({ nome, categoria, atual, meta });
  salvar();
  render();

  document.getElementById("nome").value = "";
  document.getElementById("categoria").value = "";
  document.getElementById("atual").value = "";
  document.getElementById("meta").value = "";
}

function gerarPlano() {
  const plano = itens
    .filter(i => i.atual < i.meta)
    .sort((a, b) => (a.meta - a.atual) - (b.meta - b.atual))
    .slice(0, 2);

  document.getElementById("plano").innerHTML =
    "<h2>Comprar este mês:</h2>" +
    plano.map(p => `<p>• ${p.nome}</p>`).join("");
}

render();
salvar();
