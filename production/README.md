# Divulgação Saberes França–Brasil — 21/10/2026

## Recuperação e pipeline — 28/10/2026

A publicação correta de 27/10 foi substituída por Workers Builds após o merge da PR #5. O comando sem configuração `npx wrangler deploy`, executado na raiz, detectou um site estático e removeu o roteador. O log registrou upload de arquivos de desenvolvimento, inclusive `.git`; isso não comprova vazamento de credenciais.

Em 28/10 às 20:07:57 UTC, a versão `68fdf213-c1f7-4f87-8257-0d4f3ef51d81` foi restaurada em 100% (deployment `52a665eb-e733-4287-987b-4891701b876c`). Evento e homepage voltaram nos domínios apex e www. Os caminhos `/.git/HEAD` e `/production/baseline.mjs` exibiram a página 404 institucional.

### Configuração de produção

- Worker `ius-gentium`; branch `main`; root `/production`.
- Build: `node build.mjs && node verify.mjs`.
- Deploy: `node deploy.mjs`. Não usar autodetecção nem assets da raiz.
- O script envia os três módulos compilados e um manifesto explícito dos assets públicos. Usa o token já provisionado pelo Workers Builds; não cria nem imprime credenciais.
- `public-assets/` contém **31 arquivos, 136.205 bytes** recuperados da prévia imutável da versão boa `68fdf213-c1f7-4f87-8257-0d4f3ef51d81` e comparados byte a byte com o domínio público: sete assets gerais e 24 assets do semestre referenciados pelo HTML. Os CSS foram inspecionados por `url()` e `@import`; não acrescentaram dependências locais. `assets-manifest.json` registra caminhos, tipos, tamanhos e hashes SHA-256 completos.
- A sessão oficial de assets recebe apenas esse manifesto. Cada bucket solicitado é enviado em base64 com seu MIME; o JWT de conclusão é usado somente em memória em `metadata.assets.jwt`. Não se usa `keep_assets`: ele herda o último upload, inclusive após um rollback, e o teste real `fbceb008-cad6-4bda-969d-4b688bb2ac2f` bloqueou essa herança incorreta sem alterar produção.
- Os identificadores de upload seguem o [exemplo oficial TypeScript](https://github.com/cloudflare/cloudflare-typescript/blob/main/examples/workers/script-with-assets-upload.ts): SHA-256 de `base64(bytes) + extensão sem ponto`, truncado a 32 caracteres hexadecimais. O SHA-256 completo dos bytes é verificado separadamente para integridade. Wrangler usa BLAKE3 para seus identificadores; não dependemos da deduplicação com uploads antigos.
- Preserva `ASSETS` e Worker-first; rejeita arquivos fora da lista, symlinks, conteúdo/tipo/tamanho incorretos, mudanças de runtime/bindings, previews de versão desativados, builds antigos e produção alterada durante a validação. Compara o snapshot à produção antes dos uploads, testa a versão candidata por preview e só então promove 100%.
- Após a promoção, lê o deployment e testa os dois domínios: páginas institucionais, evento, busca, 31 assets preservados, três assets do evento e exclusão dos fontes.
- O repositório preserva o bundle e os assets públicos necessários, mas não todos os fontes TypeScript originais. Alterações intencionais de assets exigem atualizar e revisar o snapshot; divergências com a produção bloqueiam o deploy.
- A verificação de concorrência não é atômica; manter um único processo de publicação.
- Previews automáticos usam root `/production` e build validado, mas a publicação permanece fail-closed até validar um fluxo preview-only seguro.
- Testes sem rede/credenciais, após build: `node verify.mjs`, `node --test deploy.test.mjs` e `node deploy.mjs --dry-run`. O dry-run nunca inicia sessão nem contém JWT.
- Writes são sequenciais, sem repetição automática. Em falha ou resultado incerto, conferir versões/deployments/build antes de tentar outra publicação. Falha após promoção exige inspeção; não se faz rollback cego sobre uma eventual alteração concorrente.
- Conferir o teste real em Workers Builds; configuração salva e mocks aprovados não equivalem a deploy concluído.

Fontes: [retenção de assets](https://developers.cloudflare.com/workers/static-assets/direct-upload/) e [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

## Histórico da publicação

**Publicado em 27/10/2026 às 00h15 (Brasília).** A conexão autorizada permitiu criar e implantar a versão `68fdf213-c1f7-4f87-8257-0d4f3ef51d81` em 100% do tráfego; deployment `e8eea9e6-38cc-400e-8f4e-22aced09bd7f`. O pacote corresponde ao commit `7e2e8686e72c2a3ad155ba45bc96ea23a9b4a43e`. A versão anterior era `80b328d3-a4f9-4a06-b575-dcf3081cf052`. Rotas e DNS não foram modificados; assets foram mantidos com `keep_assets` e binding ASSETS.

**Rollback:** no Cloudflare, Workers & Pages → `ius-gentium` → Deployments, implantar a versão anterior `80b328d3-a4f9-4a06-b575-dcf3081cf052` em 100% do tráfego. Pela API, criar deployment com `strategy: percentage` e `versions: [{"version_id":"80b328d3-a4f9-4a06-b575-dcf3081cf052","percentage":100}]`. Conferir antes se essa continua sendo a versão de rollback adequada e depois validar o domínio e assets. Não usar `force` para ignorar bloqueios.

O domínio público `grupoiusgentium.com.br` e o domínio `www` são atendidos pelo Cloudflare Worker **ius-gentium**. A produção consultada em 21/10/2026 usa a versão `80b328d3-a4f9-4a06-b575-dcf3081cf052`, publicada em 04/10/2026. Ela é diferente dos HTML antigos da raiz. A inspeção antecedeu o trigger Workers Builds criado em 21/10 às 17:29 UTC; consulte a recuperação acima. Os workflows GitHub Pages da raiz não atualizam essa produção.

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

## Procedimento de deploy

1. Reabrir esta branch e reconferir a versão em produção. Se tiver mudado, atualizar a base antes de publicar.
2. Reconectar Cloudflare com escrita em Workers. Gerar os três módulos com `build.mjs`.
3. Executar `node deploy.mjs` exclusivamente pelo Workers Builds de main. O script registra o manifesto na sessão oficial de assets, envia apenas os buckets solicitados e cria a versão com `metadata.assets.jwt`, `main_module: worker.generated.mjs`, `compatibility_date: 2026-08-08` e binding `{name: ASSETS, type: assets}`. Preserva configuração de assets (`html_handling: none`, `not_found_handling: none`, Worker primeiro) e não modifica configurações do Worker, rotas ou DNS.
4. Validar a URL de preview e as pendências visuais. Integrar a PR apenas quando o pacote estiver pronto para publicação no Worker; o merge isolado não publica no domínio.
5. Publicar a versão aprovada em 100% do tráfego e conferir domínio apex e www, inicial, Anúncios, evento, inscrição, cartazes, busca e assets anteriores.
6. Registrar commit, ID da nova versão e resultado. Rollback: versão `80b328d3-a4f9-4a06-b575-dcf3081cf052`, desde que ainda seja a base anterior correta.

Não substituir a produção pelos HTML legados nem apontar o domínio para GitHub Pages.
