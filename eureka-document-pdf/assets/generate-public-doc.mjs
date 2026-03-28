import puppeteer from 'puppeteer-core';
import { marked } from 'marked';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─── System / feature mapping ────────────────────────────────────────────────

const SYSTEMS = [
  {
    name: 'SSO Cooperados',
    description:
      'Autenticação centralizada para cooperados: login por formulário, recuperação de senha e acesso transparente via token compartilhado com o App Mobile.',
    docs: ['login'],
  },
  {
    name: 'Nexus-Fidelidade',
    description:
      'Painel de gestão interno da Copasul para administração completa do programa CopaCash: campanhas, adesões, extrato de pontos, itens do marketplace, níveis, vouchers e configurações.',
    docs: [
      'campanha',
      'adesao',
      'extrato',
      'item',
      'nivel',
      'compra',
      'parametro',
      'voucher',
      'cultura-graos',
      'prazo-retirada',
    ],
  },
  {
    name: 'Loja do Produtor',
    description:
      'Portal web acessado pelo cooperado para consultar o catálogo de itens, resgatar pontos CopaCash, acompanhar pedidos e transferir pontos entre produtores.',
    docs: ['loja', 'transferencia', 'endereco'],
  },
  {
    name: 'Nexus-Marketing',
    description:
      'Gestão de banners e conteúdo editorial exibidos no App Mobile para divulgação de campanhas de fidelidade CopaCash.',
    docs: ['banner-campanhas'],
  },
  {
    name: 'Infraestrutura Compartilhada',
    description:
      'Serviços de suporte compartilhados entre todos os sistemas: armazenamento seguro de imagens via Oracle OCI Object Storage.',
    docs: ['images'],
  },
];

// ─── Supplement data extracted from meetings 17–19/03/2026 ───────────────────

const SUPPLEMENT = {
  intro:
    'Esta seção reúne decisões e definições globais alinhadas nas reuniões de 17, 18 e 19 de março de 2026 que complementam os documentos de feature individuais.',
  sections: [
    {
      title: 'Nomenclatura e Moeda CopaCash',
      items: [
        '<strong>CopaCash</strong> é o nome correto da moeda de pontos do programa (grafia com "SH"; não CopaCach nem Copa Cash).',
        'O valor da moeda CopaCash é atrelado ao EBITDA da cooperativa, variando anualmente com o orçamento. O fator de conversão é <strong>global</strong> — não há diferenciação por categoria de item.',
        'O fator de conversão (R$ por CopaCash) é configurável na tela de Parâmetro. O sistema registra quem alterou e quando, mas não versiona historicamente os valores.',
      ],
    },
    {
      title: 'Terminologia do Agronegócio',
      items: [
        '<strong>"Insumo"</strong> sempre se refere à <em>venda</em> do cooperado para a cooperativa (compra de defensivos, fertilizantes, sementes, inoculantes, etc.).',
        '<strong>"Grãos"</strong> sempre se refere à <em>compra</em> que a cooperativa faz do cooperado (soja, milho, sorgo, mandioca entregues via romaneio).',
        'Usa-se <strong>"cooperado"</strong> (não cliente); <strong>"safra"</strong> (não temporada); <strong>"unidade / posto de atendimento"</strong> (não loja); <strong>"campanha"</strong> (não promoção).',
      ],
    },
    {
      title: 'Regras de Negócio e Configuração',
      items: [
        'As regras de negócio — percentuais de nível, taxas de pontuação, valor base — são configuradas no <strong>módulo Nexus-Fidelidade</strong>, nunca no ERP. Isso evita perda de configurações em caso de substituição do ERP.',
        'A parametrização de valores de pontuação deve ser feita pelo <strong>próprio negócio (área)</strong>, não pela TI. Todos os parâmetros críticos são editáveis diretamente na interface.',
        'A <strong>pontuação por categorias diferenciadas de insumos</strong> (ex: fertilizantes com peso diferente dos demais) foi <strong>removida / simplificada</strong> para reduzir complexidade e aumentar a credibilidade do sistema. Poderá ser negociada para uma fase futura.',
        'A configuração da campanha foi simplificada para <strong>2 passos</strong>: (1) dados gerais + expectativas de insumo e grãos; (2) definição dos níveis e fator de pontuação por nível.',
      ],
    },
    {
      title: 'Estrutura de Pontos e Níveis',
      items: [
        'Os pontos são vinculados ao <strong>grupo do cooperado</strong>, mas os movimentos são registrados sempre por CPF/produtor para rastreabilidade individual.',
        'O <strong>depósito de grãos (romaneio)</strong> não gera pontos diretamente; ele atua como separador de nível — o produtor sobe de nível conforme realiza entregas à cooperativa.',
        'O processamento de níveis ocorre <strong>uma vez por dia, durante a madrugada (~2h)</strong>, com base nas movimentações do dia anterior (D-1). O cooperado verá o novo status/nível no dia seguinte.',
        'Em caso de cancelamento de insumos que impacte o percentual de fidelização, o sistema <strong>reprocessará</strong> e o cooperado poderá ser <strong>rebaixado de nível</strong>.',
        'O <strong>saldo total de CopaCash é global</strong> — permite resgate na loja independente da safra de origem. Metas, faturamento e nível são específicos por campanha.',
        'Ao consumir pontos (resgate na loja), o sistema debita <strong>primeiro da campanha com data de expiração mais próxima</strong>.',
        'O produtor que pertence a mais de um grupo deve <strong>selecionar o grupo</strong> para visualizar o extrato de pontos.',
      ],
    },
    {
      title: 'Adesão ao Programa',
      items: [
        'A adesão completa ao programa ocorre no <strong>Nexus</strong>, tanto manual (pelo operador) quanto online (pelo cooperado via app ou portal). Isso permite a adesão mesmo para cooperados sem o aplicativo instalado.',
        'A adesão é realizada por grupo: o <strong>aceite por um membro do grupo</strong> é suficiente para efetivar a participação de todos (existe procuração que valida a decisão para o grupo inteiro).',
        'O termo de adesão inclui a <strong>área total do produtor</strong> para que o cooperado possa verificar a consistência dos dados cadastrados no sistema.',
      ],
    },
    {
      title: 'Loja e Fluxo de Estoque',
      items: [
        'O fluxo de estoque da loja exige que os itens sejam <strong>requisitados do estoque próprio (EBS) para um inventário separado do Programa Fidelidade</strong>. A compra do cooperado gera uma ordem de venda no EBS para emissão de nota fiscal e baixa do estoque.',
        'O <strong>resgate de vouchers gera um aviso de crédito</strong> (nota de crédito) no sistema financeiro do produtor no EBS.',
        'O <strong>preço do item (em CopaCash) é fixado no momento da disponibilização</strong>. Novas precificações aplicam-se apenas a itens recém-disponibilizados, sem afetar itens já cadastrados.',
        'Uma <strong>baixa manual de estoque</strong> é necessária para remover itens obsoletos ou transferir o estoque de volta ao inventário geral do EBS.',
        'Na <strong>fase 1, a plataforma não aceita pagamento em dinheiro real</strong> (Pix, cartão). Toda transação é exclusivamente em CopaCash.',
        'O <strong>cálculo de frete não está no escopo da fase 1</strong>. O cooperado sempre escolhe uma unidade Copasul para retirada do pedido.',
        'Vouchers e itens físicos são exibidos em <strong>seções separadas na loja</strong> para facilitar a navegação e filtragem.',
      ],
    },
    {
      title: 'Integrações e Arquitetura',
      items: [
        '<strong>Nexus nunca se comunica diretamente com o ERP.</strong> Leituras: via ETL que carrega dados do EBS nas tabelas DW; Nexus lê apenas o DW. Escritas: via Gateway que invoca procedures Oracle no EBS.',
        '<strong>Posto de combustível e Cooperate</strong> (ERP legado da cooperativa) não fazem parte do escopo da fase 1, mas o sistema deve ter flexibilidade arquitetural para integração futura.',
        'O acesso à loja e ao portal do produtor <strong>não é público</strong>. O cooperado deve estar autenticado via App Mobile (token transparente) ou via site da Copasul (login direto).',
        'O mecanismo de <strong>confirmação de entrega de itens físicos e vouchers</strong> (QR Code, página web, app) ainda está em definição e <strong>não faz parte do escopo da fase 1</strong>.',
      ],
    },
    {
      title: 'Itens em Aberto (ainda não definidos)',
      items: [
        '<strong>Estorno de movimentações</strong> geradas automaticamente pelo motor de pontuação — processo e tela ainda não especificados.',
        '<strong>Papéis de acesso e permissões</strong> ao sistema serão definidos em análise futura.',
        '<strong>Definição de contas versus grupos</strong> para gestão e transferência de pontos: a ser confirmado com a área.',
        '<strong>Bandeira no EBS</strong> para distinguir cancelamento de acerto de contas versus acerto total: a ser verificado pela equipe técnica.',
        '<strong>Logística de entrega e cálculo de frete</strong>: a ser definido pela área para fases futuras.',
      ],
    },
  ],
};

// ─── Marked configuration ────────────────────────────────────────────────────

marked.use({
  renderer: {
    heading({ text, depth }) {
      const lvl = Math.min(depth + 2, 6);
      return `<h${lvl} class="doc-heading">${text}</h${lvl}>\n`;
    },
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDoc(docName) {
  const filePath = path.join(ROOT, 'resources', `${docName}.doc.md`);
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠ Missing doc: ${docName}.doc.md`);
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf-8');

  const titleMatch = raw.match(/^# (.+)$/m);
  const descMatch = raw.match(/^> (.+)$/m);

  // Extract Telas Relacionadas links
  const telasMatch = raw.match(/## Telas Relacionadas\n([\s\S]*?)(?=\n## |\n---)/);
  const screens = [];
  if (telasMatch) {
    const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
    let m;
    while ((m = linkRe.exec(telasMatch[1])) !== null) {
      const decodedPath = decodeURIComponent(m[2]);
      const absPath = path.resolve(path.join(ROOT, 'resources'), decodedPath);
      screens.push({ label: m[1], absPath });
    }
  }

  // Remove h1 title, blockquote, and Telas section before rendering
  let content = raw
    .replace(/^# .+\n/m, '')
    .replace(/^> .+\n/m, '')
    .replace(/## Telas Relacionadas\n[\s\S]*?(?=\n## |\n---\n)/, '');

  return {
    name: titleMatch?.[1] ?? docName,
    description: descMatch?.[1] ?? '',
    contentHtml: marked(content),
    screens,
  };
}

async function loadAsBase64(filePath, page) {
  if (!fs.existsSync(filePath)) {
    console.warn(`    ⚠ Not found: ${path.basename(filePath)}`);
    return null;
  }
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
    const buf = fs.readFileSync(filePath);
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${buf.toString('base64')}`;
  }

  if (ext === '.html') {
    const fileUrl = 'file://' + filePath;
    try {
      await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
      await page.goto(fileUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise((r) => setTimeout(r, 1200));
      const buf = await page.screenshot({ fullPage: true, type: 'jpeg', quality: 82 });
      return `data:image/jpeg;base64,${buf.toString('base64')}`;
    } catch (err) {
      console.warn(`    ⚠ Screenshot failed (${path.basename(path.dirname(filePath))}): ${err.message}`);
      return null;
    }
  }

  return null;
}

// ─── HTML builders ───────────────────────────────────────────────────────────

function coverHTML() {
  const today = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  return `
  <div class="cover">
    <div class="cover-inner">
      <div class="cover-badge">DOCUMENTAÇÃO DE ESCOPO</div>
      <div class="cover-title">CopaCash</div>
      <div class="cover-subtitle">Programa de Fidelidade Associado</div>
      <div class="cover-divider"></div>
      <div class="cover-meta">
        <div class="cover-meta-row"><span class="cover-meta-label">Cliente</span><span class="cover-meta-value">Copasul</span></div>
        <div class="cover-meta-row"><span class="cover-meta-label">Data</span><span class="cover-meta-value">${today}</span></div>
        <div class="cover-meta-row"><span class="cover-meta-label">Versão</span><span class="cover-meta-value">1.0 — Sizing</span></div>
      </div>
    </div>
  </div>`;
}

function tocHTML(systems) {
  const items = systems.map((s) => `<li class="toc-system">${s.name}</li>`).join('\n');
  return `
  <div class="toc page-break-before">
    <h2 class="toc-title">Índice</h2>
    <ol class="toc-list">
      ${items}
      <li class="toc-system">Definições e Decisões Globais</li>
    </ol>
  </div>`;
}

function systemHTML(system, docsData, screenshots) {
  let featureBlocks = '';

  for (const docName of system.docs) {
    const doc = docsData[docName];
    if (!doc) continue;

    let screensBlock = '';
    for (const s of doc.screens) {
      const img = screenshots[s.absPath];
      screensBlock += `
        <div class="screen-card">
          <div class="screen-label">${s.label}</div>
          ${img
            ? `<img src="${img}" class="screen-img" alt="${s.label}" />`
            : `<div class="screen-missing">Tela não disponível</div>`}
        </div>`;
    }

    featureBlocks += `
      <div class="feature">
        <h2 class="feature-title">${doc.name}</h2>
        <p class="feature-desc">${doc.description}</p>
        <div class="feature-content">${doc.contentHtml}</div>
        ${screensBlock ? `<h3 class="screens-heading">Telas</h3><div class="screens-grid">${screensBlock}</div>` : ''}
      </div>`;
  }

  return `
  <div class="system page-break-before">
    <div class="system-header">
      <h1 class="system-title">${system.name}</h1>
      <p class="system-desc">${system.description}</p>
    </div>
    ${featureBlocks}
  </div>`;
}

function supplementHTML() {
  const sections = SUPPLEMENT.sections
    .map(
      (sec) => `
    <div class="supplement-section">
      <h3 class="supplement-section-title">${sec.title}</h3>
      <ul class="supplement-list">
        ${sec.items.map((i) => `<li>${i}</li>`).join('\n')}
      </ul>
    </div>`
    )
    .join('');

  return `
  <div class="supplement page-break-before">
    <div class="system-header">
      <h1 class="system-title">Definições e Decisões Globais</h1>
      <p class="system-desc">${SUPPLEMENT.intro}</p>
    </div>
    ${sections}
  </div>`;
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1a1a1a;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Cover ── */
  .cover {
    width: 100%;
    min-height: 100vh;
    background: linear-gradient(145deg, #00893A 0%, #005e27 60%, #003d1a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    page-break-after: always;
  }
  .cover-inner {
    color: white;
    text-align: center;
    padding: 60px 40px;
    max-width: 500px;
  }
  .cover-badge {
    display: inline-block;
    font-size: 9pt;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    border: 1.5px solid rgba(255,255,255,0.5);
    border-radius: 20px;
    padding: 4px 16px;
    margin-bottom: 32px;
    color: rgba(255,255,255,0.85);
  }
  .cover-title {
    font-size: 52pt;
    font-weight: 700;
    letter-spacing: -1px;
    margin-bottom: 8px;
  }
  .cover-subtitle {
    font-size: 14pt;
    font-weight: 300;
    color: rgba(255,255,255,0.8);
    margin-bottom: 40px;
  }
  .cover-divider {
    width: 60px;
    height: 2px;
    background: rgba(255,255,255,0.4);
    margin: 0 auto 36px;
  }
  .cover-meta { text-align: left; }
  .cover-meta-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255,255,255,0.15);
    font-size: 10pt;
  }
  .cover-meta-label { color: rgba(255,255,255,0.6); font-weight: 500; }
  .cover-meta-value { color: rgba(255,255,255,0.95); font-weight: 600; }

  /* ── TOC ── */
  .toc { padding: 48px 0 32px; }
  .toc-title {
    font-size: 22pt;
    font-weight: 700;
    color: #00893A;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 2px solid #00893A;
  }
  .toc-list { list-style: decimal; padding-left: 24px; }
  .toc-system { font-size: 11pt; padding: 6px 0; color: #1a1a1a; }

  /* ── Page breaks ── */
  .page-break-before { page-break-before: always; }

  /* ── System ── */
  .system-header {
    background: #f0faf4;
    border-left: 5px solid #00893A;
    border-radius: 0 8px 8px 0;
    padding: 20px 24px;
    margin-bottom: 32px;
  }
  .system-title {
    font-size: 22pt;
    font-weight: 700;
    color: #00893A;
    margin-bottom: 8px;
  }
  .system-desc {
    font-size: 10.5pt;
    color: #444;
    line-height: 1.5;
  }

  /* ── Feature ── */
  .feature {
    margin-bottom: 48px;
    padding-bottom: 40px;
    border-bottom: 1px solid #e5e7eb;
  }
  .feature:last-child { border-bottom: none; }
  .feature-title {
    font-size: 16pt;
    font-weight: 700;
    color: #111;
    margin-bottom: 6px;
  }
  .feature-desc {
    font-size: 10.5pt;
    color: #555;
    font-style: italic;
    margin-bottom: 20px;
    padding: 10px 14px;
    background: #fafafa;
    border-left: 3px solid #00893A;
    border-radius: 0 4px 4px 0;
  }

  /* ── Feature content (rendered markdown) ── */
  .feature-content h3,
  .feature-content h4 {
    font-size: 11pt;
    font-weight: 600;
    color: #00893A;
    margin: 20px 0 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 9.5pt;
  }
  .feature-content ul, .feature-content ol {
    padding-left: 20px;
    margin-bottom: 12px;
  }
  .feature-content li {
    font-size: 10.5pt;
    line-height: 1.55;
    margin-bottom: 4px;
    color: #2d2d2d;
  }
  .feature-content hr {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 16px 0;
  }
  .feature-content p { margin-bottom: 8px; font-size: 10.5pt; }
  .feature-content strong { color: #111; }

  /* ── Screens ── */
  .screens-heading {
    font-size: 9.5pt;
    font-weight: 600;
    color: #00893A;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 24px 0 12px;
  }
  .screens-grid {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .screen-card { }
  .screen-label {
    font-size: 9pt;
    font-weight: 600;
    color: #666;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .screen-img {
    width: 100%;
    max-width: 100%;
    height: auto;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    display: block;
  }
  .screen-missing {
    width: 100%;
    height: 80px;
    background: #f9fafb;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 9pt;
  }

  /* ── Supplement ── */
  .supplement-section { margin-bottom: 28px; }
  .supplement-section-title {
    font-size: 12pt;
    font-weight: 600;
    color: #111;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e5e7eb;
  }
  .supplement-list {
    padding-left: 20px;
  }
  .supplement-list li {
    font-size: 10.5pt;
    line-height: 1.6;
    margin-bottom: 6px;
    color: #2d2d2d;
  }
`;

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Generating public-doc.pdf…\n');

  // 1. Parse all resource docs
  const allDocNames = [
    'login',
    'campanha', 'adesao', 'extrato', 'item', 'nivel', 'compra',
    'parametro', 'voucher', 'cultura-graos', 'prazo-retirada',
    'loja', 'transferencia', 'endereco',
    'banner-campanhas',
    'images',
  ];
  const docsData = {};
  for (const name of allDocNames) docsData[name] = parseDoc(name);

  // 2. Collect all unique screen paths
  const allPaths = new Set();
  for (const doc of Object.values(docsData)) {
    if (doc) doc.screens.forEach((s) => allPaths.add(s.absPath));
  }

  // 3. Launch browser and screenshot / load all screens
  console.log(`📸 Loading ${allPaths.size} screens…`);
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();

  const screenshots = {};
  let done = 0;
  for (const p of allPaths) {
    done++;
    process.stdout.write(`  [${done}/${allPaths.size}] ${path.basename(path.dirname(p))} … `);
    screenshots[p] = await loadAsBase64(p, page);
    console.log(screenshots[p] ? '✓' : '✗');
  }

  // 4. Build master HTML
  console.log('\n📝 Building HTML…');
  let systemBlocks = '';
  for (const sys of SYSTEMS) systemBlocks += systemHTML(sys, docsData, screenshots);

  const masterHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>${CSS}</style>
</head>
<body>
  ${coverHTML()}
  ${tocHTML(SYSTEMS)}
  ${systemBlocks}
  ${supplementHTML()}
</body>
</html>`;

  // 5. Render to PDF
  console.log('📄 Rendering PDF…');
  await page.setContent(masterHTML, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 3000)); // allow fonts to render
  const outPath = path.join(ROOT, 'public-doc.pdf');
  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' },
  });

  await browser.close();
  console.log(`\n✅ Done → ${outPath}`);
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
