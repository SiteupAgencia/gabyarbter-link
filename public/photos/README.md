# Fotos da landing

Substitua os arquivos placeholder por imagens reais (otimizadas em JPG ou WebP).

## Lista esperada

| Arquivo | Onde aparece | Dimensão ideal | Origem sugerida |
|---|---|---|---|
| `avatar.jpg` | Hero — círculo no topo | 600x600 (quadrada) | Drive **Gabi** (`grazis-*.JPG`) — escolher 1 retrato frontal |
| `turma-yoga.jpg` | Bloco "Yoga aqui é prática real" | 1200x900 (4:3) | Drive **Yoga** (`IMG_*.jpg`) — escolher 1 cena de aula coletiva |

## Como ativar no código

Em `app/page.tsx`, procurar pelos comentários `<!-- Quando tiver foto... -->` e
substituir o placeholder pelo `<Image>` do Next conforme indicado.

## Dicas
- Comprimir em https://squoosh.app antes (qualidade 75-80, WebP se possível)
- Manter arquivo < 200KB pra carregar rápido na rede mobile
- `avatar.jpg` precisa ter o rosto centralizado (vai recortar em círculo)
