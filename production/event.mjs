import { media } from './media.generated.mjs';

export const event = {
  slug: 'saberes-franca-brasil-2026',
  title: 'A circulação das ideias e saberes franceses na ciência jurídica brasileira',
  eyebrow: '11 a 13 de novembro de 2026 · CCJ/UFSC',
  year: 2026,
  type: 'evento',
  summary: 'Três dias de encontros sobre história, direito e cultura: os caminhos das ideias francesas e sua recepção no Brasil. Aberto à comunidade acadêmica e ao público em geral.',
  body: ['De 11 a 13 de novembro de 2026, a UFSC recebe professores, pesquisadores e estudantes para discutir a circulação do pensamento jurídico francês e a formação das doutrinas brasileiras.'],
  tags: ['França', 'Brasil', 'história do direito', 'comunidade'],
  sourceUrl: 'https://inscricoes.ufsc.br/saberes-franca-brasil-2026',
  sourceLabel: 'Inscrições oficiais · UFSC',
  featured: true
};
export const eventPath = `/arquivo/${event.slug}`;
const assetPath = '/saberes-franca-brasil-2026';
const people = [
  ['Arno Dal Ri Jr.', 'UFSC'], ['Diego Nunes', 'UFSC'], ['Caetano Dias Corrêa', 'UFSC'],
  ['Fernando Nagib Coelho', 'UFSC'], ['Cristiane Derani', 'UFSC'], ['Luana Renostro Heinen', 'UFSC'],
  ['Paula Pimenta Velloso', 'UFSC'], ['Andrey José Taffner Fraga', 'Unidavi'], ['Marja Mangili', 'UniCesusc'],
  ['Márlio Aguiar', 'UFSC'], ['Daniel Kincheski', 'UFSC'], ['Luiz Henrique Debastiani', 'UFSC'],
  ['Ana Vitória Vanzin Mendes', 'UFSC'], ['Bruna Santiago Franchini', 'UFSC'],
  ['Serge Dauchy', 'CNRS/Université de Lille'], ['Farid Lékéal', 'Université de Lille'], ['Victor Simon', 'Université de Lille'],
  ['Georges Martyn', 'Universiteit Gent'], ['Hugo Beuvant', 'Université de Lille'], ['Bruno Dubois', 'Université de Lille'],
  ['Dante Fedele', 'CNRS/Université de Lille'], ['Tiziana Faitini', 'Università di Trento'], ['Amber Gardeyn', 'Universiteit Gent'],
  ['Lucie Ranchoux', 'Université de Lille'], ['Hugo Neuhauser', 'Université de Lille'], ['Louis-Joachin Scalbert', 'Université de Lille']
];
const dates = '<time datetime="2026-11-11">11</time> a <time datetime="2026-11-13">13 de novembro de 2026</time>';
const registration = `<a class="sf-button sf-button-primary" href="${event.sourceUrl}">Inscreva-se na UFSC <span aria-hidden="true">↗</span></a>`;

export const eventCss = `
.sf-event{--sf-ink:#0f1a24;--sf-paper:#fcfbfa;--sf-gold:#bfa37a;color:var(--sf-ink);font-family:Inter,Arial,sans-serif}
.sf-event *{box-sizing:border-box}.sf-event a:focus-visible,.sf-event summary:focus-visible{outline:3px solid #185a91;outline-offset:5px}
.sf-event h1,.sf-event h2,.sf-event h3{font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;letter-spacing:-.025em;line-height:1.08}
.sf-callout{padding:clamp(24px,5vw,64px) clamp(20px,6vw,96px);border-bottom:1px solid #bfa37a;background:#f1ede7;display:grid;grid-template-columns:minmax(0,1fr) minmax(160px,240px);gap:clamp(24px,5vw,72px);align-items:center}
.sf-callout h2{font-size:clamp(2.1rem,4.3vw,4rem);max-width:22ch;margin:12px 0 20px}.sf-kicker{font-size:.76rem;font-weight:600;letter-spacing:.11em;text-transform:uppercase;margin:0 0 14px;line-height:1.6}
.sf-callout p:not(.sf-kicker){max-width:64ch;line-height:1.7;margin:12px 0}.sf-callout img{width:100%;height:auto;display:block;border:1px solid #d5cec3}
.sf-actions{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:24px 0 0}.sf-button{display:inline-flex;align-items:center;justify-content:center;gap:18px;min-height:48px;padding:14px 20px;border:1px solid #0f1a24;font-size:.9rem;font-weight:600;text-decoration:none!important;line-height:1.4;text-align:center}
.sf-button-primary{background:#0f1a24;color:#fcfbfa!important}.sf-button-secondary{background:transparent;color:#0f1a24!important}.sf-button:hover{box-shadow:0 3px 0 #bfa37a}
.sf-page{padding:clamp(24px,6vw,90px) clamp(20px,6vw,96px);max-width:1600px;margin:auto}.sf-back{display:inline-block;margin:0 0 36px;text-decoration:underline;text-underline-offset:4px;min-height:28px;color:#0f1a24}
.sf-hero{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(240px,.65fr);gap:clamp(28px,6vw,80px);align-items:start}.sf-hero h1{font-size:clamp(2.7rem,5.2vw,5.5rem);margin:0 0 28px}.sf-lead{font-size:1.1rem;line-height:1.8;max-width:64ch}
.sf-facts{display:flex;flex-wrap:wrap;gap:20px 40px;padding:24px 0;margin:28px 0;border-top:1px solid #d5cec3;border-bottom:1px solid #d5cec3}.sf-facts dt{font-size:.76rem;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;font-weight:600}.sf-facts dd{margin:0;line-height:1.6}
.sf-figure{margin:0}.sf-figure img{display:block;width:100%;height:auto;border:1px solid #d5cec3}.sf-figure figcaption{font-size:.82rem;line-height:1.6;margin-top:12px}.sf-figure a{color:#0f1a24;text-decoration:underline;text-underline-offset:3px}
.sf-section{margin-top:clamp(48px,7vw,96px)}.sf-section h2{font-size:clamp(2rem,3.3vw,3.1rem);margin:0 0 24px}.sf-section p{line-height:1.8;max-width:80ch}.sf-days{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.sf-day{border-top:2px solid #bfa37a;padding:24px;background:#f1ede7}.sf-day h3{font-size:1.9rem;margin:8px 0 20px}.sf-day p{margin:0;line-height:1.75}
.sf-people{columns:2;column-gap:40px;list-style:none;padding:0;margin:0}.sf-people li{break-inside:avoid;padding:10px 0;border-bottom:1px solid #ddd8d1;line-height:1.6}.sf-people small{display:block;font-size:.83rem}.sf-credits{border-top:1px solid #d5cec3;padding-top:28px}.sf-credits p{font-size:.94rem}.sf-final{background:#0f1a24;color:#fcfbfa;padding:32px;margin-top:48px}.sf-final h2{color:inherit}.sf-final .sf-button{background:#fcfbfa;color:#0f1a24!important;border-color:#fcfbfa}
@media(max-width:700px){.sf-callout{grid-template-columns:1fr}.sf-callout>.sf-poster-link{display:none}.sf-hero{grid-template-columns:1fr}.sf-hero>.sf-figure{max-width:420px;margin:auto}.sf-days{grid-template-columns:1fr}.sf-people{columns:1}.sf-actions{align-items:stretch}.sf-button{flex:1 1 210px}.sf-page{padding-top:28px}.sf-facts{display:grid;grid-template-columns:1fr}.sf-callout h2{max-width:none}}
@media(prefers-reduced-motion:reduce){.sf-event *{scroll-behavior:auto;animation:none!important;transition:none!important}}
`;

export const callout = `<section class="sf-event sf-callout" aria-labelledby="sf-callout-title">
<div><p class="sf-kicker">Encontro internacional · ${dates}</p><h2 id="sf-callout-title">${event.title}</h2>
<p>Como as ideias atravessam o Atlântico e transformam o direito? Venha conhecer e debater os caminhos do pensamento jurídico francês no Brasil.</p>
<p><strong>CCJ/UFSC · Aberto à comunidade acadêmica e ao público em geral.</strong></p>
<div class="sf-actions">${registration}<a class="sf-button sf-button-secondary" href="${eventPath}">Conheça o evento <span aria-hidden="true">→</span></a></div></div>
<a class="sf-poster-link" href="${eventPath}" aria-label="Conheça o evento e consulte o cartaz"><img src="${assetPath}/cartaz-final.webp" width="1024" height="1536" alt="Cartaz do encontro A circulação das ideias e saberes franceses na ciência jurídica brasileira" decoding="async"></a></section>`;

export const eventHtml = `<article class="sf-event sf-page">
<a class="sf-back" href="/arquivo?type=evento">← Todos os eventos</a>
<div class="sf-hero"><header><p class="sf-kicker">Encontro internacional · PPGD-UFSC</p>
<h1>${event.title}</h1><p class="sf-lead">Ideias viajam, ganham novos sentidos e participam da construção de instituições. Durante três dias, o encontro convida a olhar para esses percursos entre a França e o Brasil — e para o que eles revelam sobre o direito no presente.</p>
<dl class="sf-facts"><div><dt>Quando</dt><dd>${dates}</dd></div><div><dt>Onde</dt><dd>Centro de Ciências Jurídicas<br>Universidade Federal de Santa Catarina</dd></div><div><dt>Para quem</dt><dd>Comunidade acadêmica e público em geral</dd></div></dl>
${registration}<p>Inscrições pelo portal oficial da UFSC, de 20 de outubro a 13 de novembro de 2026.</p></header>
<figure class="sf-figure"><a href="${assetPath}/cartaz-final.webp"><img src="${assetPath}/cartaz-final.webp" width="1024" height="1536" alt="Cartaz com título, datas, participantes e créditos institucionais do encontro, também apresentados em texto nesta página." decoding="async"></a><figcaption><a href="${assetPath}/cartaz-final.webp">Abrir cartaz completo</a> · <a href="${assetPath}/inscricoes.webp">Cartaz de inscrições</a></figcaption></figure></div>
<section class="sf-section" aria-labelledby="sf-invitation"><h2 id="sf-invitation">Uma conversa aberta sobre história, direito e cultura</h2>
<p>Professores e pesquisadores da UFSC e de instituições europeias se encontram para discutir como os saberes jurídicos franceses foram recebidos, transformados e debatidos no Brasil. O diálogo aproxima experiências históricas, doutrinas e pesquisas sobre a formação da ciência jurídica brasileira.</p>
<p>Estudantes, docentes, profissionais e todas as pessoas interessadas no tema são bem-vindos. A participação do público externo integra o convite: venha ouvir, perguntar e compartilhar perspectivas.</p></section>
<section class="sf-section" aria-labelledby="sf-program"><h2 id="sf-program">Três dias de intercâmbio</h2><div class="sf-days">
<section class="sf-day"><p class="sf-kicker"><time datetime="2026-11-11">11 de novembro</time></p><h3>Abertura e debates</h3><p>Jean Bodin, Montesquieu, Adolphe Prins e Alphonse Boistel. O dia inclui o lançamento de livro.</p></section>
<section class="sf-day"><p class="sf-kicker"><time datetime="2026-11-12">12 de novembro</time></p><h3>Ideias em circulação</h3><p>Gaston Morin, Léon Duguit, Maurice Hauriou e Simone Weil conduzem os debates do segundo dia.</p></section>
<section class="sf-day"><p class="sf-kicker"><time datetime="2026-11-13">13 de novembro</time></p><h3>Pesquisas em diálogo</h3><p>Comunicações de doutorandos e mestrandos, com apresentação e discussão de pesquisas.</p></section>
</div></section>
<section class="sf-section" aria-labelledby="sf-people"><h2 id="sf-people">Participantes</h2><ul class="sf-people">${people.map(([name,institution])=>`<li>${name}<small>${institution}</small></li>`).join('')}</ul></section>
<section class="sf-section sf-credits" aria-labelledby="sf-credits"><h2 id="sf-credits">Créditos institucionais</h2><p>PPGD-UFSC · Ius Commune — UFSC/CNPq · Centre d’Histoire Judiciaire · CAPES · CNRS · Réseau Francophonie.</p></section>
<section class="sf-section sf-final" aria-labelledby="sf-register"><h2 id="sf-register">Participe do encontro</h2><p>De 11 a 13 de novembro, no CCJ/UFSC. Inscreva-se pelo sistema oficial da universidade.</p>${registration}</section>
</article>`;

export function installEvent({ app, archive, layout, jsx, raw }) {
  archive.unshift(event);
  app.on(['GET','HEAD'], '/eventos', (c) => c.redirect('/arquivo?type=evento', 302));
  app.on(['GET','HEAD'], '/eventos/saberes-franca-brasil-2026', (c) => c.redirect(eventPath, 302));
  app.on(['GET', 'HEAD'], `${assetPath}/event.css`, (c) => new Response(c.req.method === 'HEAD' ? null : eventCss, {headers: {'Content-Type':'text/css; charset=UTF-8','Cache-Control':'public, max-age=3600'}}));
  for (const [name, encoded] of Object.entries(media)) {
    app.on(['GET', 'HEAD'], `${assetPath}/${name}.webp`, (c) => {
      const data = c.req.method === 'HEAD' ? null : Uint8Array.from(atob(encoded), (ch) => ch.charCodeAt(0));
      return new Response(data, {headers: {'Content-Type':'image/webp','Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff'}});
    });
  }
  app.on(['GET','HEAD'], eventPath, (c) => {
    if(c.req.method === 'HEAD') return new Response(null, {headers:{'Content-Type':'text/html; charset=UTF-8'}});
    return c.html(jsx(layout(), { title:`${event.title} — Ius Gentium`, description:event.summary, path:eventPath, origin:new URL(c.req.url).origin, children:raw(eventHtml) }));
  });
}
