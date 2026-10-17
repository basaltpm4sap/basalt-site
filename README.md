# basalt.

Home estática (S-01), em HTML e CSS, sem etapa de build. A página é o `index.html` da raiz. Fontes, logotipo e imagem ficam em `assets/`.

## Importar o repositório na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new) e entre com a conta que vai publicar o site.
2. Escolha **Import Git Repository** e selecione este repositório.
3. Em **Framework Preset**, selecione **Other**.
4. Deixe **Build Command** vazio. Não há `package.json` nem etapa de compilação.
5. Deixe **Output Directory** vazio, ou informe `.`, para publicar a raiz do repositório.
6. Deixe **Install Command** vazio.
7. Confirme com **Deploy**. A Vercel serve o `index.html` da raiz e a pasta `assets/`.

O arquivo `vercel.json` só acrescenta cabeçalhos de segurança e cache longo para fontes e imagens. Não altera o modo de publicação.

O arquivo `.nojekyll` não é usado pela Vercel. Ele só evita que o GitHub Pages processe a pasta `assets/` com Jekyll, caso alguém publique por esse caminho.

## Textos provisórios

Os textos editáveis estão em `index.html`, nas seções marcadas com `data-provisorio`. Dá para trocar uma frase sem alterar o CSS.
