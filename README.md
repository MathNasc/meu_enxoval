# 🏠 Enxoval App — Versão Local (Next.js)

Rodando localmente **100% grátis** com scraping via Cheerio (sem API key).

---

## 🚀 Como rodar

### 1. Pré-requisito
Node.js instalado → https://nodejs.org (versão LTS)

### 2. Instale as dependências
```bash
npm install
```

### 3. Rode o projeto
```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 📁 Estrutura do projeto

```
enxoval/
├── app/
│   ├── api/
│   │   ├── extract-product/route.js   ← scraping de produto por link
│   │   ├── compare-prices/route.js    ← busca preços (Zoom + Buscapé)
│   │   └── complete-home/route.js     ← sugestões de itens por cômodo
│   ├── layout.js
│   └── page.js
├── src/
│   └── App.js                         ← frontend React completo
├── package.json
└── next.config.js
```

---

## ⚙️ Como funciona

### Auto-preenchimento por link (Adicionar Rápido)
- Faz scraping do HTML da URL colada
- Extrai nome via **Open Graph** (`og:title`) ou `<h1>`
- Extrai preço via meta tags + seletores CSS de cada loja
- Extrai imagem via `og:image`
- Detecta o cômodo pelo nome do produto
- Funciona com: **Amazon, Mercado Livre, Magalu, Casas Bahia, Americanas, Shopee, Leroy Merlin**

### Comparação de preços
- Busca no **Zoom.com.br** (agrega várias lojas brasileiras)
- Fallback para **Buscapé** se Zoom não retornar resultados
- Fallback para **Google Shopping** como último recurso
- Retorna até 6 ofertas ordenadas pelo menor preço

### Completar minha casa
- Lista curada de itens essenciais por cômodo com preços estimados
- Filtra o que você já tem na lista
- 100% local, sem internet necessária

---

## 🛠️ Troubleshooting

**Scraping não funciona para um site específico?**
Sites como Shopee usam JavaScript pesado e bloqueiam requests diretos.
Solução: instale Puppeteer para renderizar JS:
```bash
npm install puppeteer
```
E ajuste `/app/api/extract-product/route.js` para usar Puppeteer naquele domínio.

**Erro de CORS?**
As rotas de API rodam no servidor Next.js — não há problema de CORS.
Se aparecer CORS, verifique se está acessando via `http://localhost:3000` e não abrindo o HTML diretamente.

---

## 🌐 Deploy gratuito (Vercel)

```bash
npm install -g vercel
vercel
```

Ou arraste a pasta para https://vercel.com/new
