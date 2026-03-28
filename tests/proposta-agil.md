# Copasul Fidelidade
# Proposta Ágil


### Objetivo

O objetivo deste documento é traçar um plano para disponibilizar todo o ecossistema de fidelidade em um prazo reduzido, sem abrir mão da qualidade e da segurança que o projeto exige.

As principais estratégias são: paralelizar o desenvolvimento entre múltiplos streams independentes e incrementar o time com desenvolvedores adicionais a partir do início do projeto.

É fundamental salientar que paralelização de desenvolvimento não é uma equação matemática linear de horas por membro. A adição de pessoas aumenta a complexidade de coordenação, eleva o risco de impedimentos e demanda esforço significativo de alinhamento contínuo — especialmente em um projeto com forte acoplamento entre módulos. Este prazo, portanto, exige comprometimento excepcional de todas as partes, incluindo a disponibilidade para jornadas estendidas em momentos críticos do projeto.



### Premissas

As premissas abaixo são condições necessárias para que o prazo descrito seja atingido. O não cumprimento de qualquer uma delas impacta diretamente o cronograma.

#### Premissas técnicas e de processo

- **Iniciar o desenvolvimento com base nos protótipos da pré-análise.** Isso desbloqueia imediatamente o desenvolvimento do frontend, eliminando a dependência do design no primeiro momento. O Design atuará de forma paralela ao desenvolvimento, validando e orientando iterativamente. O tempo liberado para o design final será utilizado para refinamentos de UX e adequações que se façam necessárias.

- **Funcionalidades não impeditivas ficam em banco de risco.** Algumas funcionalidades podem ser entregues após o go-live do sistema sem prejuízo ao funcionamento pleno da plataforma. Quando necessário como último recurso, valores podem ser configurados de forma hardcoded diretamente no banco de dados, sendo substituídos pelas interfaces administrativas em uma janela de ajuste pós-entrega. Veja a seção "Banco de Risco" para a lista completa.

#### Premissas da Copasul

- **Disponibilizar as views e dados necessários no prazo máximo de 2 semanas** a partir da aprovação da proposta, assim como alinhar as estratégias de integração com o time Eureka.

- **Priorizar reuniões de análise**, que deverão ser concluídas no prazo de 1 mês. Isso pode exigir alta disponibilidade do time Copasul em um período concentrado.

- **Designar um comitê ou responsável técnico** para validar cada entrega parcial, uma vez que o desenvolvimento se iniciará com base nos protótipos da análise — o feedback ágil é indispensável para não gerar retrabalho.

- **Definir e provisionar o ambiente de storage** que será utilizado para upload de imagens (bucket OCI ou equivalente), incluindo separação dev/prod e credenciais de serviço.

- **Comunicar a aprovação da proposta com no mínimo uma semana de antecedência**, para que possamos mobilizar o time adicional e iniciar o onboarding sem perda de tempo.

- **Garantir resposta ágil a solicitações de acesso ou configurações** necessárias à conclusão do projeto. Bloqueios de infraestrutura ou acesso têm impacto direto e imediato no cronograma.

#### Premissas de ouro (escopo de integração)

O único ponto de integração com sistemas legados Copasul será:

- **Área produtiva (ha) por conta e grupo**, consumida via Oracle APEX via ETL.
- **Movimentos tipados** com informações suficientes para o cálculo de pontos, consumidos via ETL que alimenta as tabelas do DW (romaneio, fixação, RI, títulos AR contabilizados e pagos).
- As categorias de grãos e culturas já fazem parte do contexto Nexus e não representam integração adicional.

Qualquer integração fora deste escopo deve ser formalmente tratada como aditivo ao contrato.



### Banco de Risco

As funcionalidades abaixo não bloqueiam o funcionamento central da plataforma. Fazem parte de um banco de contingência: **o objetivo é entregá-las dentro do prazo**; contudo, caso o cronograma sofra pressão, estas são as primeiras candidatas a serem configuradas de forma paleativa (hardcoded ou simplificadas) para garantir o go-live, sendo concluídas em uma janela de ajuste imediatamente após a entrega.

- **Cadastro de parâmetros via interface** (ex.: custo do ponto, taxa CopaCash) — pode ser configurado diretamente no código.
- **Parametrização de prazo de retirada por unidade** — pode operar com um prazo padrão único configurado no ambiente.
- **Dashboard de pontos a expirar** — o dado existe no extrato; a visualização agrupada pode ser entregue após o go-live.
- **Dashboard de itens a expirar** — exibição das faixas de vencimento de estoque pode ser consultada diretamente no banco de dados
- **Exportação CSV** nos relatórios de extrato e gestão de compras — funcionalidade de conveniência que não impede a operação.



### Pedido de Continuidade

Para viabilizar o prazo proposto, a Eureka precisará contratar novos desenvolvedores ou realocar pessoas de outros projetos e times. Esta é uma decisão que carrega um risco real para nós: o processo de onboarding e a contextualização no domínio da Copasul — agronegócio, estrutura cooperativa, sistemas Nexus, integração com EBS — representa um investimento significativo de tempo e energia. Um time assim formado leva semanas para atingir velocidade plena.

O risco concreto é este: ao encerrar o projeto de fidelidade, podemos nos encontrar com um time ampliado, especializado no contexto Copasul, sem demanda imediata para absorvê-lo.

Por isso, gostaríamos de fazer um pedido — não como cláusula contratual, mas como um gesto de parceria e transparência:

> **Pedimos que a Copasul, ao aprovar esta proposta acelerada, considere e planeje a continuidade da parceria**, seja através de novos módulos do ecossistema, evoluções do sistema de fidelidade, ou outros projetos em que o time Eureka — já contextualizado no domínio Copasul — possa contribuir diretamente.

Entendemos que este compromisso pode não ser possível de formalizar neste momento, e respeitamos isso. O que buscamos é que haja intenção e diálogo sobre o próximo passo, para que a Eureka possa tomar a decisão de expansão de time com mais segurança.

A Copasul também se beneficia diretamente: um time que já conhece profundamente os sistemas, a cultura cooperativa e os processos do negócio tem um valor de rampup muito superior ao de qualquer time novo que venha a ser contratado no futuro.



### Entregas Parciais por Mês

O projeto está organizado em 4 meses com carga decrescente — o esforço é maior no início, onde estão concentradas as fundações e o maior número de épicos em paralelo, e vai reduzindo à medida que os módulos são estabilizados.

| Mês | Épicos ativos |
|-----|---------------|
| 1 | Rampup, SSO do cooperado, DW/ETL, Infra/OCI, nx-marketing, nx-fidelidade, loja-cooperado, DevOps, Análise |
| 2 | nx-fidelidade, Motor de cálculo de pontos, Motor de cálculo de nível, loja-cooperado, DevOps, QA, Análise |
| 3 | nx-fidelidade, loja-cooperado, DevOps, QA, Análise |
| 4 | loja-cooperado, QA (fase intensiva), DevOps |



### Conclusão

Adotando estas premissas, reorganizando o time e investindo em estratégias de desenvolvimento paralelo, concluímos que é possível entregar todo o ecossistema de fidelidade em **4 meses**, com entregas e validações parciais ao longo do período.

Este prazo **não é confortável** — ele exige comprometimento excepcional do time Eureka, incluindo disponibilidade para jornadas estendidas em momentos de convergência crítica, além de resposta ágil e contínua da Copasul. Qualquer atraso nas premissas listadas acima tem efeito cascata direto no cronograma.

A liderança Eureka trabalhará com uma meta interna mais agressiva de **3 meses**, como objetivo de excelência operacional do time. Esta meta não é divulgada como compromisso porque não abriremos mão da qualidade e da segurança do projeto — ela serve como norte interno para manter a disciplina de execução e criar uma margem de segurança para imprevistos.

Estamos comprometidos com a entrega e cientes da responsabilidade que este prazo representa. Acreditamos que os prazos de entrega de software de qualidade continuarão a diminuir — novas tecnologias e ferramentas surgem continuamente, e a Eureka acompanha e incorpora ativamente essas evoluções para entregar cada vez mais, sem abrir mão da excelência.
