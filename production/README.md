# Divulgação Saberes França–Brasil — 21/10/2026

## Estado da publicação

**Publicado em 27/10/2026 às 00h15 (Brasília).** A conexão autorizada permitiu criar e implantar a versão `68fdf213-c1f7-4f87-8257-0d4f3ef51d81` em 100% do tráfego; deployment `e8eea9e6-38cc-400e-8f4e-22aced09bd7f`. O pacote corresponde ao commit `7e2e8686e72c2a3ad155ba45bc96ea23a9b4a43e`. A versão anterior era `80b328d3-a4f9-4a06-b575-dcf3081cf052`. Rotas e DNS não foram modificados; assets foram mantidos com `keep_assets` e binding ASSETS.

**Rollback:** no Cloudflare, Workers & Pages → `ius-gentium` → Deployments, implantar a versão anterior `80b328d3-a4f9-4a06-b575-dcf3081cf052` em 100% do tráfego. Pela API, criar deployment com `strategy: percentage` e `versions: [{"version_id":"80b328d3-a4f9-4a06-b575-dcf3081cf052","percentage":100}]`. Conferir antes se essa continua sendo a versão de rollback adequada e depois validar o domínio e assets. Não usar `force` para ignorar bloqueios.

O domínio público `grupoiusgentium.com.br` e o domínio `www` são atendidos pelo Cloudflare Worker **ius-gentium**. A produção consultada em 21/10/2026 usa a versão `80b328d3-a4f9-4a06-b575-dcf3081cf052`, publicada em 04/10/2026. Ela é diferente dos HTML antigos da raiz. Não há trigger de Workers Builds conectado a esse Worker. Os workflows GitHub Pages da raiz não atualizam essa produção.

`baseline.mjs` preserva o módulo compilado recuperado diretamente da produção. Os fontes TypeScript originais não estavam neste repositório; não foram reconstruídos por aproximação. SHA-256 do arquivo preservado: `aabdf608ca2cc33ee34bf5ac818297eeb0c66d2c829dde0d3cfcea8df755fdb7`.

## Alterações

- Chamada editorial na inicial e em Anúncios, com convite ao público externo e inscrição UFSC.
- Página `/arquivo/saberes-franca-brasil-2026`, integrada ao arquivo de eventos e à busca.
- `/eventos` e o endereço legado `/eventos.html` conduzem aos eventos do arquivo atual.
- Participantes e créditos em texto, além do cartaz; datas sem horário ou sala não confirmados.
- Artes finais convertidas para WebP, sem recorte ou alteração do conteúdo. Dimensões mantidas: 1024 × 1536.
- Chamadas equivalentes nos três HTML legados, para manter o repositório coerente. Os links para a nova página só estarão disponíveis após o deploy do Worker.
- CSS limitado às classes `sf-*`, com texto escuro sobre fundo claro, foco visível, botões de ao menos 48 px, imagem proporcional e coluna única abaixo de 700 px.

## Fontes e seleção de materiais

Página oficial conferida, HTTP 200: <https://inscricoes.ufsc.br/saberes-franca-brasil-2026>. Confirma 11–13/11/2026, público em geral e inscrições de 20/10 a 13/11. O título administrativo é mais longo; a divulgação usa o título integral pedido pela organizadora e constante no cartaz.

1. **French legal thought in Brazilian law.png**, versão corrigida de 19/10/2026, inspecionada visualmente. Contém Cristiane Derani após Fernando Nagib Coelho e antes de Luana Renostro Heinen, Paula Pimenta Velloso com dois L, e Ius Commune / UFSC-CNPq em preto. A lista de participantes da página segue esta versão, inclusive afiliações.
   - Original SHA-256: `34ddeb082f0338021a7c615f5351fcba23886c508ee4ed017843aa28f120690f`.
   - WebP: `media/cartaz-final.webp`, SHA-256 `a1b8e71f727b1157f2e6b8ea887db675e249dcd461e97307376c3eb5963944e6`.
2. **1(1).png**, cartaz de inscrições de 20/10/2026. Título e URL oficial conferidos visualmente.
   - Original SHA-256: `3ce631f7aa020b335940568abdd618191737f57d575e983360118f34fa4198f0`.
   - WebP: `media/inscricoes.webp`, SHA-256 `f1187abbeca6e5739bd76271cd298ad5fca95e0b321fbdda7e0bb71bc5076475`.
3. Programas de 11, 12 e 13/11 na pasta fornecida: usados apenas para o resumo dos temas por dia. Os nomes/afiliações seguem o cartaz principal posterior, corrigido.

O cartaz **French Ideas in Brazilian Legal Science-1.png** do Drive não foi usado: omite Cristiane e traz “Veloso”. O pacote `5.zip` estava incompleto (sem diretório central); não foi tratado como fonte final.

## Verificação e prévia

Node 22 ou superior, sem dependências adicionais:

```sh
node production/build.mjs
node production/verify.mjs
node production/preview.mjs
```

Abrir <http://127.0.0.1:4173/arquivo/saberes-franca-brasil-2026> no computador que executa a prévia. Ela utiliza os assets públicos existentes do site. Os dois cartazes e o CSS específico são servidos pelo módulo do evento.

Verificações concluídas: renderização do HTML, busca, redirecionamentos legados, respostas HEAD, preservação das páginas/rotas e dos handlers de assets atuais, nomes corrigidos e varredura de padrões de segredos. O link UFSC retornou HTTP 200 e exibiu a atividade correta.

**Validação de 27/10:** prévia Cloudflare conferida visualmente em desktop e largura 390 px; cartazes principal e de inscrições carregaram; console da página do evento sem erros observados. A inicial publicada foi conferida visualmente. Não foi concluída a matriz de 320, 768 e 1440 px, nem a auditoria completa de teclado e contraste computado.

## Procedimento original de deploy

1. Reabrir esta branch e reconferir a versão em produção. Se tiver mudado, atualizar a base antes de publicar.
2. Reconectar Cloudflare com escrita em Workers. Gerar os três módulos com `build.mjs`.
3. Criar uma versão em `/accounts/{account_id}/workers/scripts/ius-gentium/versions`, em multipart com `worker.generated.mjs`, `event.mjs` e `media.generated.mjs`. Usar `main_module: worker.generated.mjs`, `compatibility_date: 2026-08-08`, `keep_assets: true` e binding `{name: ASSETS, type: assets}`. Preservar configuração de assets (`html_handling: none`, `not_found_handling: none`, Worker primeiro), observabilidade e todas as rotas.
4. Validar a URL de preview e as pendências visuais. Integrar a PR apenas quando o pacote estiver pronto para publicação no Worker; o merge isolado não publica no domínio.
5. Publicar a versão aprovada em 100% do tráfego e conferir domínio apex e www, inicial, Anúncios, evento, inscrição, cartazes, busca e assets anteriores.
6. Registrar commit, ID da nova versão e resultado. Rollback: versão `80b328d3-a4f9-4a06-b575-dcf3081cf052`, desde que ainda seja a base anterior correta.

Não substituir a produção pelos HTML legados nem apontar o domínio para GitHub Pages.
