const estoquePadrao = [
  // ALIMENTOS
  { nome: "Arroz (kg)", categoria: "Alimentos", meta: 48, atual: 16 },
  { nome: "Feijão (kg)", categoria: "Alimentos", meta: 12, atual: 4 },
  { nome: "Macarrão parafuso (kg)", categoria: "Alimentos", meta: 12, atual: 2 },
  { nome: "Sal (kg)", categoria: "Alimentos", meta: 1, atual: 1 },
  { nome: "Açúcar cristal (kg)", categoria: "Alimentos", meta: 6, atual: 4.5 },
  { nome: "Óleo de soja (L)", categoria: "Alimentos", meta: 12, atual: 3 },
  { nome: "Óleo misto (L)", categoria: "Alimentos", meta: 6, atual: 1 },
  { nome: "Molho de tomate (sachê)", categoria: "Alimentos", meta: 24, atual: 3 },
  { nome: "Sardinha (lata)", categoria: "Alimentos", meta: 24, atual: 2 },
  { nome: "Cappuccino (g)", categoria: "Alimentos", meta: 1000, atual: 200 },
  { nome: "Geleia (un)", categoria: "Alimentos", meta: 6, atual: 1 },
  { nome: "Café descafeinado (g)", categoria: "Alimentos", meta: 2000, atual: 250 },

  // HIGIENE PESSOAL
  { nome: "Sabonete antibacteriano", categoria: "Higiene", meta: 48, atual: 14 },
  { nome: "Sabonete comum", categoria: "Higiene", meta: 48, atual: 7 },
  { nome: "Desodorante antibacteriano", categoria: "Higiene", meta: 12, atual: 1 },
  { nome: "Desodorante comum", categoria: "Higiene", meta: 12, atual: 1 },
  { nome: "Pasta dente sensível", categoria: "Higiene", meta: 12, atual: 2 },
  { nome: "Pasta dente comum", categoria: "Higiene", meta: 12, atual: 3 },

  // LIMPEZA
  { nome: "Bucha (pacote)", categoria: "Limpeza", meta: 12, atual: 2 },
  { nome: "Sabão caseiro (barra)", categoria: "Limpeza", meta: 24, atual: 10 },
  { nome: "Papel absorvente", categoria: "Limpeza", meta: 12, atual: 1 }
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
      .forEach((item, i) => {
        const box = document.createElement("div");
        box.className = "item";
        box.innerHTML = `
          <strong>${item.nome}</strong><br>
          Tenho:
          <input type="number" value="${item.atual}"
            onchange="atualizar(${i}, this.value)">
          / Meta: ${item.meta}
        `;
        div.appendChild(box);
      });
  });
}

function atualizar(i, valor) {
  itens[i].atual = Number(valor);
  salvar();
  render();
}

function adicionarItem() {
  const nome = document.getElementById("nome").value;
  const categoria = document.getElementById("categoria").value;
  const meta = Number(document.getElementById("meta").value);

  if (!nome || !categoria || !meta) return;

  itens.push({ nome, categoria, meta, atual: 0 });
  salvar();
  render();
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

salvar();
render();
