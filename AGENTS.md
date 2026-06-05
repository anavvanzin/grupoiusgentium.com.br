# AGENTS.md (Ius Gentium Repo Rules)

Este arquivo fornece orientação local para o Codex ao trabalhar com este repositório do site do grupo Ius Gentium.

## Diretrizes de Conteúdo e Foco do Site
* **Foco no Coordenador:** O site deve focar exclusivamente no Prof. Dr. Arno Dal Ri Júnior por enquanto.
* **Membros Comentados:** Os cartões e referências aos membros Aline Beltrame de Moura, Lucas Carlos Lima, Caetano Dias Corrêa e Patrícia Noschang devem permanecer comentados nos arquivos `pessoas.html` e `projetos.html` (não os exclua definitivamente para que possam ser reativados no futuro).
* **Ausência de IA:** Nenhuma integração com IA deve ser incluída no frontend do site até instruções em contrário.

## Diretrizes de Design (Editorial Acadêmico Premium)
* **Paleta de Cores:**
  * Fundo: Off-white editorial (`#FCFBFA`) em vez de bege/creme antigo.
  * Cor Primária: Azul Abissal Imperial (`#0F1A24`) em vez do azul anterior.
  * Destaque: Ouro Champanhe Pálido (`#BFA37A`) em vez de dourado envelhecido escuro.
* **Tipografia:** Uso editorial e clássico de `Cormorant Garamond` (com ênfase em estilos itálicos e leves para cabeçalhos) combinado com a legibilidade limpa de `Inter` para o corpo de texto.
* **Cards e Tabelas:** Utilização de bordas translúcidas muito finas, sombras difusas e animações de hover baseadas em curvas de velocidade suaves (`cubic-bezier`).
* **Marcas d'Água:** É proibido reintroduzir qualquer marca d'água, comentários ou atribuições ao Perplexity ou Perplexity Computer nos arquivos HTML.

## Git e Configuração do Autor
* **Restrição de Privacidade de E-mail:** O GitHub rejeita pushes que exponham e-mails privados locais da UFSC. As configurações do Git local devem usar o e-mail noreply do GitHub da usuária: `anavvanzin@users.noreply.github.com`.
* **Commits:** Antes de commitar, execute uma varredura para garantir que segredos ou chaves de API não estejam vazando no repositório de forma indesejada.
