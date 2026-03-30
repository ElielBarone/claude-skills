<!-- cover start -->
## Migração do App Mobile para Módulo Nexus
Proposta para pré-análise
<!-- cover end -->

# Pré-análise

## 1) Contexto
A Copasul está consolidando seus sistemas na arquitetura Nexus para centralizar módulos de inteligência, padronizar integrações e reduzir complexidade operacional. Hoje, o aplicativo mobile ainda opera com arquitetura paralela, com dependências de dados e autenticação parcialmente desacopladas do Nexus.

## 2) Objetivo do documento
Definir o direcionamento inicial para migrar o app mobile ao Nexus, alinhando:
- objetivo de negócio;
- premissas técnicas;
- escopo de pré-análise;
- principais decisões esperadas.

## 3) Base lógica da iniciativa (por que migrar)
A migração do app mobile para o Nexus se sustenta em quatro pilares:

1. **Consistência de dados**  
   Unificar o consumo de dados no DW como fonte única de verdade reduz divergências entre sistemas e melhora a confiabilidade das informações para cooperados e colaboradores.

2. **Eficiência de evolução**  
   Manter app e Nexus em arquiteturas separadas aumenta retrabalho em manutenção, integração e governança. Com o app no Nexus, a evolução passa a seguir padrões únicos de desenvolvimento e operação.

3. **Segurança e governança de acesso**  
   A centralização de autenticação com SSO (colaborador e cooperado) simplifica o controle de acesso, reduz risco operacional e melhora rastreabilidade.

4. **Escalabilidade do ecossistema Copasul**  
   O Nexus passa a operar como plataforma de módulos, permitindo crescimento do produto com menor custo de integração e maior reaproveitamento técnico.

## 4) Premissas
- DW como SSoT (Single Source of Truth);
- módulos organizados e separados por domínio;
- autenticação centralizada via SSO para colaboradores e cooperados;
- reaproveitamento de tecnologias e pacotes compartilhados do Nexus.

## 5) Escopo da pré-análise
1. **Conciliação de dados**
   - mapear tabelas consumidas pelo app e pelo Nexus (safra, cultura, grupos, contas, propriedades e correlatas);
   - identificar sobreposições, conflitos de modelagem e regras de negócio divergentes;
   - propor estratégia de unificação no DW sem perda de desempenho.

2. **Migração do Admin do app**
   - redesenhar o Admin com stack e padrões do Nexus;
   - integrar autenticação via SSO de colaborador;
   - alinhar pacotes compartilhados e governança técnica.

3. **Criação do módulo Nexus para o mobile**
   - estruturar módulo dedicado para servir APIs ao app mobile;
   - integrar autenticação via SSO do cooperado;
   - padronizar observabilidade, versionamento e contratos de integração.

4. **Avaliação opcional de UX/UI**
   - analisar esforço para adequação visual do app ao branding institucional Copasul;
   - decidir inclusão no sizing como iniciativa complementar.

## 6) Desafios e pontos de atenção
- conciliar dados sem comprometer o conceito de fonte única de verdade;
- revisar estratégias atuais de redução de volume (ex.: filtros restritos ao módulo de insumos), preservando desempenho sem sacrificar consistência;
- garantir transição com risco controlado para operação e usuários;
- coordenar decisões técnicas com apoio do time Copasul durante a pré-análise.

## 7) Fora do escopo
O SSO do cooperado será entregue pelo programa de fidelidade. Portanto, este trabalho não contempla reimplementação do SSO, apenas a adequação do app para consumo do SSO existente.

## 8) Decisões a validar
- Estamos alinhados com o objetivo da migração e com os ganhos esperados?
- A refatoração de UX/UI entra no sizing desta iniciativa ou fica como fase posterior?
- Podemos iniciar imediatamente a pré-análise de dados com participação do time Copasul?

## 9) Próximos passos sugeridos
1. realizar workshop técnico-funcional de mapeamento de dados;
2. definir modelo alvo de tabelas e estratégia de transição;
3. estimar esforço por frente (dados, admin, módulo mobile, UX opcional);
4. consolidar roadmap com marcos, riscos e dependências.