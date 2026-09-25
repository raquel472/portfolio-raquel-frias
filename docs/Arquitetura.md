# Portfólio Raquel Frias — Arquitetura v1

Destino final: **Framer**. Este protótipo em HTML/CSS/JS valida direção de arte, templates e modelo de conteúdo. Nada de conteúdo fica no código: tudo vem de `/data`.

## 1. Arquitetura

```
Portfolio.dc.html      App (rotas + templates de página)
Media.dc.html          Componente de mídia (imagem · vídeo · embed · placeholder)
/data
  projects.json        Coleção PROJETOS + taxonomia (categorias de filtro)
  profile.json         Singleton PERFIL: hero, manifesto, números, contato, CV
  testimonials.json    Coleção DEPOIMENTOS
  media.json           Caixa de entrada de mídia (reels a classificar)
/assets                (a criar) photos/ · projects/<slug>/ · cv/raquel-frias-cv.pdf
/docs                  Este documento
```

Rotas (hash): `#/` Home · `#/projetos` · `#/projetos/<slug>` Case · `#/curriculo` · `#/depoimentos` e `#/contato` (âncoras). Contato é rodapé fixo de todas as páginas.

Narrativa: **Entrar** (Hero) → **Descobrir** (Manifesto) → **Explorar** (Números → Projetos → Em movimento) → **Entender** (Case) → **Confiar** (Depoimentos · CV) → **Contato**.

## 2. Conceito visual — "publicação independente"

- **Paleta:** Off-white `#F4EFE6` (papel) · Grafite `#292824` (tinta) · Vinho `#6D263D` (voz/ênfase) · Caramelo `#D7A66D` (acento sobre escuro). Texto caramelo sobre papel usa `#B07F45` só para separadores decorativos.
- **Tipo:** Instrument Serif (títulos, números, itálicos de ênfase) + Schibsted Grotesk (texto, navegação, microtipografia em caixa alta com tracking largo). Sans com raiz jornalística = ponte com a formação da Raquel.
- **Ritmo:** hairlines de 1px, numeração `(01)`, legendas "Fig.", grids assimétricos via flex com pesos diferentes (sem media queries — reflui sozinho), blocos de cor inteiros (vinho no manifesto/contato, grafite no vídeo).
- **Movimento:** reveal (fade + 28px) por IntersectionObserver, parallax de 4% na foto do Hero, zoom 3,5% em hover de mídia. Tudo desligado com `prefers-reduced-motion` ou prop `motion=false`. Sem scroll hijacking.

## 3. CMS — coleções e campos

### PROJETOS (`projects.json → projects[]`)
| Campo | Tipo Framer | Obrig. |
|---|---|---|
| slug | Slug | ✓ |
| order | Number | ✓ |
| status | Option: publicado / rascunho / oculto | ✓ |
| featured | Toggle (destaque na Home) | ✓ |
| layout | Option: wide / split / splitR (vazio = automático) | |
| title, subtitle | Text | ✓ / |
| year, client, type | Text | ✓ |
| categories | Text (lista) | ✓ |
| filters | Multi-reference → Categorias | |
| summary | Text (1 frase) | ✓ |
| context, objective, audience | Formatted text | |
| concept.quote / concept.text | Text | |
| strategy.text / strategy.items[] | Text + lista {title, text} | |
| role.tags[] / role.text | Text | ✓ |
| body[] | Blocos (ver abaixo) | |
| results.stats[] {value,label} · notes[] · learnings[] | | |
| cover {src, alt, label, tone} | Image | ✓ |
| gallery[] {src, alt, label, size, ratio, tone} | Gallery / Image | |
| video {src \| embed, label} | File / Link | |
| link | Link | |

**Regra de renderização:** toda seção do case só existe se houver dado. Sem vídeo → não há bloco de vídeo. Sem galeria → sem espaço vazio. A numeração das seções se recalcula.

**Blocos de desenvolvimento (`body[]`):** `text` · `list` · `image` · `pair` · `quote` · (`gallery`, `video` via campos próprios). No Framer, mapear para: um campo Formatted Text (texto + imagens inline) **ou** slots fixos opcionais (`dev_texto_1`, `dev_imagem_1`, `dev_par_1`…) com visibilidade condicional. Recomendo slots — mantêm a direção de arte.

### DEPOIMENTOS (`testimonials.json`)
name · role · company · photo · linkedin · quote · highlight (trecho real usado como título) · size (large/small) · order. Composição alterna grande → pequenos automaticamente pelo `size`.

### PERFIL (singleton `profile.json`)
Hero, manifesto (linhas com itálico), números da Home (referenciam slugs), contato, CV completo (experience, education, specializations, courses, skills, tools, languages).

### MÍDIA — caixa de entrada (`media.json`)
Todo vídeo/imagem novo entra aqui com `status: "a classificar"` e `project: null`. **Curadoria antes de encaixar:** só depois de decidir a que projeto pertence (e se merece entrar) o item migra para `gallery`/`video`/`body` daquele projeto. Evita cases inchados e sem hierarquia.

## 4. Componentes

`Header/Nav` (desktop + menu mobile) · `Media` (imagem/vídeo/embed lazy com clique/placeholder rotulado) · `SectionHeader` (número + título + hairline) · `ProjectFeature` (wide/split/splitR) · `ProjectCard` (mosaico) · `ProjectRow` (índice) · `CaseInfo` (ficha técnica) · `CaseSection` + blocos (`Text`, `Quote`, `List`, `Tags`, `Stats`, `Notes`, `Image`, `Pair`, `Gallery`, `Video`) · `PrevNext` · `Timeline` · `Testimonial` (large/small) · `Contact`.

## 5. Editor (decisão: sem Framer)

Site = este protótipo publicado (Netlify/Vercel) a partir do GitHub. Raquel edita em `Editor.dc.html`.

- `data/schema.json` é a fonte única das regras: campos, limites de caracteres, obrigatórios, quantidade máxima de itens, opções. O editor é gerado a partir dele — adicionar um campo = editar o schema.
- Rascunho salvo automaticamente no navegador; prévia ao vivo do site real (`Portfolio.dc.html?preview=1`) ao lado, desktop/celular.
- Publicar valida obrigatórios e endereços repetidos (rascunhos não bloqueiam).
- **Hoje simulado:** publicação e upload. Imagens enviadas são otimizadas (1600px, JPEG) e ficam no rascunho.
- **Para produção:** login (GitHub OAuth ou Netlify Identity) + função que faz commit dos JSON e das imagens em `/assets` via API do GitHub → deploy automático.

## 6. Pendências de conteúdo

- Fotos da Raquel (Hero vertical, foto horizontal para o CV) e imagens de cada projeto.
- Links dos vídeos (abertura Outubro Rosa, institucional Sempre Perto, YouTube Novembro Azul).
- Curadoria dos 6 reels: a que projeto pertencem?
- PDF do CV em `assets/cv/raquel-frias-cv.pdf`.
- Lista de ferramentas; período da Revista Vagalume; Instagram (se for publicar).
- Resultados do projeto Mondelez; fotos dos depoimentos.
- Categoria "Posts e Redes Sociais" aguarda material.
