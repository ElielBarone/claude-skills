<!-- capa inicio-->

# Eureka Document PDF

**Guia do usuário — Claude Cowork**

Crie PDFs com identidade visual Eureka a partir de arquivos Markdown.

---

*Eureka Document PDF*

<!-- capa fim-->

# Guia simples para quem vai usar

## O que esta skill faz

A skill `eureka-document-pdf` transforma um arquivo Markdown em um PDF com identidade visual Eureka.

Se você quiser, o PDF pode ter capa na primeira página.

## De onde vem esta skill

Baixe no projeto oficial de skills da Eureka no GitLab:

[https://gitlab.eurekalabs.com.br/ia/eureka-claude-skills](https://gitlab.eurekalabs.com.br/ia/eureka-claude-skills)

Use a pasta `eureka-document-pdf` completa, com:

- `SKILL.md`
- `assets/`

## Instalação no Claude Cowork

1. Copie a pasta `eureka-document-pdf` para a pasta de skills usada pelo Claude Cowork.
2. Confirme que `SKILL.md` e `assets/` estão juntos dentro dessa pasta.
3. Recarregue o ambiente, se necessário, para a skill aparecer.

## Como pedir um PDF no dia a dia

No Claude Cowork, peça em linguagem natural.

Exemplos:

- "Use a skill eureka-document-pdf e gere um PDF deste Markdown."
- "Crie um PDF Eureka de `meu-arquivo.md` e salve em `saida.pdf`."
- "Inclua capa e depois gere o PDF."

Seu Markdown original não deve ser alterado. A saída deve ser apenas um arquivo `.pdf`.

## Se precisar rodar pelo terminal

Pré-requisitos:

- Node.js instalado
- Google Chrome instalado

Instale as dependências na pasta da skill:

```bash
npm install --save-dev puppeteer-core marked pdf-lib
```

Gere o PDF:

```bash
node assets/generate-eureka-pdf.mjs "<INPUT_MD>" "<OUTPUT_PDF>"
```

Se o Chrome estiver em outro caminho:

```bash
EUREKA_CHROME_PATH="/usr/bin/google-chrome-stable" node assets/generate-eureka-pdf.mjs "<INPUT_MD>" "<OUTPUT_PDF>"
```

`OUTPUT_PDF` precisa terminar com `.pdf` e deve ser diferente de `INPUT_MD`.

Para detalhes técnicos e validação completa, consulte:

- `assets/eureka-document-pdf-dev.doc.md`
- `SKILL.md`

# Exemplos de conteúdo que funcionam bem no PDF

Use os blocos abaixo como referência para escrever seu documento.

## Títulos, texto e listas

```markdown
# Relatório mensal
## Resumo
Este é um parágrafo com **destaque** em negrito.

### Pontos principais
- Item 1
- Item 2
- Item 3

### Próximas ações
1. Revisar backlog
2. Alinhar prioridades
3. Publicar versão
```

## Tabela

```markdown
| Indicador | Meta | Resultado |
|-----------|------|-----------|
| Receita   | 100  | 108       |
| NPS       | 70   | 74        |
| SLA       | 95%  | 96%       |
```

## Código inline e bloco de código

````markdown
Use `npm run build` antes do deploy.

```bash
npm ci
npm run test
npm run build
```
````

## Citação, linha divisória e link

```markdown
> Entregamos valor em ciclos curtos e com qualidade.

---

Consulte o projeto em [GitLab Eureka Skills](https://gitlab.eurekalabs.com.br/ia/eureka-claude-skills).
```

## Capa no início do documento

Você pode usar um dos pares abaixo.

Delimitadores em inglês:

```text
<!-- cover start -->

# Titulo da capa
Subtitulo opcional

<!-- cover end -->
```

Delimitadores em português:

```text
<!-- capa inicio-->

# Titulo da capa
Subtitulo opcional

<!-- capa fim-->
```

Tudo que estiver dentro do bloco vira capa. O restante vira conteúdo normal.

## Opcional avançado: manter um bloco junto na mesma página

Se você usa HTML no Markdown, pode agrupar um trecho para evitar quebra ruim de página:

```html
<div class="euk-keep-together">
  <h2>Seção importante</h2>
  <p>Este bloco deve ficar junto no PDF.</p>
</div>
```

# Checklist rápido

| Etapa | Ação |
|-------|------|
| 1 | Baixar a skill em https://gitlab.eurekalabs.com.br/ia/eureka-claude-skills |
| 2 | Copiar a pasta `eureka-document-pdf` com `SKILL.md` e `assets/` |
| 3 | Pedir ao Claude Cowork para gerar o PDF |
| 4 | Opcional: usar capa com delimitadores |
| 5 | Opcional: rodar comando `node assets/generate-eureka-pdf.mjs` |
