# Planilha de leads do Playbook SAP Activate

Este guia é para você publicar, na conta Google da basalt., o receptor dos e-mails do site. O site não grava nada sozinho. Ele só envia o cadastro para um endereço que você cria aqui.

Faça isso na conta Google da marca, não numa conta pessoal.

A documentação oficial usada para conferir os passos (consultada em 2 de novembro de 2026):

- [Web apps](https://developers.google.com/apps-script/guides/web) — publicar com **Deploy > New deployment**, tipo **Web app**, e a diferença entre executar como o dono do script ou como quem acessa.
- [Extend Google Sheets](https://developers.google.com/apps-script/guides/sheets) — script vinculado à planilha: **Extensions > Apps Script**.
- [Create and manage deployments](https://developers.google.com/apps-script/concepts/deployments) — para mudar o código sem trocar o endereço: **Deploy > Manage deployments**, editar e apontar para uma **New version**.
- [OAuth client verification](https://developers.google.com/apps-script/guides/client-verification) — a tela de app não verificado, e que dá para seguir depois de confirmar o risco.
- [Fazer o download de um arquivo](https://support.google.com/docs/answer/49114?hl=pt-BR) — **Arquivo > Baixar** e escolher o tipo.

No editor em português, os mesmos comandos aparecem como **Implantar**, **Nova implantação**, **App da Web**, **Executar como: Eu** e **Quem pode acessar: Qualquer pessoa**.

## O que vai ficar gravado

Cada linha da aba **Leads** tem cinco colunas:

| Coluna | O que é |
|---|---|
| Data/hora | Momento do envio, no fuso `America/Sao_Paulo`, no formato `aaaa-mm-dd hh:mm:ss` |
| E-mail | E-mail validado |
| Nome | Fica vazio. O texto do site não pede nome |
| Aceite | `sim` ou `não`. A caixa de conteúdos é opcional e começa desmarcada |
| Versão do aceite | Texto fixo do site, hoje `lgpd-v1-2026-11-02` |

O site não manda o playbook por e-mail. Quem cadastrou baixa na hora, na própria janela.

## 1. Criar a planilha

1. Entre na conta Google da basalt.
2. Abra o [Google Planilhas](https://sheets.google.com) e crie uma planilha em branco.
3. Dê um nome, por exemplo `basalt. leads do playbook`.
4. Deixe a primeira aba como está. O script cria uma aba chamada **Leads** se ela ainda não existir. Pode apagar o conteúdo de exemplo, se houver.

## 2. Abrir o Apps Script

Na planilha, no menu de cima: **Extensões > Apps Script**.

Isso abre o editor já ligado a esta planilha. É o caminho da documentação oficial (**Extensions > Apps Script**).

Se o projeto se chamar **Projeto sem título**, clique nesse nome e troque para `basalt. leads`. Assim a tela de permissão mostra um nome que você reconhece.

## 3. Colar o código

1. No editor, apague tudo o que estiver em `Código.gs` (o exemplo `function myFunction()`).
2. Abra o arquivo `apps-script/Code.gs` deste repositório, copie o conteúdo inteiro e cole no editor.
3. Não preencha `SPREADSHEET_ID`. Vazio significa “usar esta planilha”.
4. Clique no ícone de disquete, ou **Ctrl+S** / **Cmd+S**. O projeto precisa estar salvo antes de implantar.

## 4. Publicar o app da Web

No canto superior direito do editor:

1. Clique em **Implantar > Nova implantação**.
2. Ao lado de **Selecionar tipo**, clique na engrenagem (**Ativar tipos de implantação**) e escolha **App da Web**.
3. Preencha assim:
   - **Descrição:** `leads do playbook` (pode ser outra frase curta).
   - **Executar como:** **Eu**. O script usa a sua permissão. O visitante do site não entra na conta Google.
   - **Quem pode acessar:** **Qualquer pessoa**. Não escolha “qualquer pessoa com uma conta do Google”: o visitante do site não faz login.
4. Clique em **Implantar**.

Esses dois ajustes correspondem, na documentação em inglês, a executar o app como o dono (**Execute the app as me**) e liberar o endereço para quem não tem conta Google. Sem “Qualquer pessoa”, o site não consegue gravar a linha.

## 5. Autorizar

Na primeira implantação o Google pede permissão para a planilha.

1. Clique em **Autorizar acesso** (ou **Revisar permissões**).
2. Escolha a conta Google da basalt.
3. Se aparecer **O Google não verificou este app**, isso é a tela de app não verificado da documentação de OAuth. O script é seu e ainda não passou pelo processo de verificação do Google. Clique em **Avançado** e depois em **Acessar basalt. leads (não seguro)** — o nome é o do projeto.
4. Confira se a permissão é a da planilha e clique em **Permitir** / **Continuar**.

A verificação formal do Google não é necessária para este uso. A tela some para você depois que autoriza. O visitante do site não vê essa tela, porque o app executa como você.

## 6. Copiar a URL e enviar

1. Na janela **Nova implantação**, em **App da Web**, copie a URL.
2. Ela precisa terminar em `/exec`. Exemplo de formato: `https://script.google.com/macros/s/XXXX/exec`.
3. Não use o endereço que termina em `/dev`. Esse só abre para quem edita o script e não serve o site. A documentação chama esse endereço de implantação de teste.
4. Envie a URL `/exec` para quem publica o site. Ela entra na constante `APPS_SCRIPT_URL`, no arquivo `assets/js/lead-form.js`. Enquanto essa constante estiver vazia, o preview do site simula o cadastro e não grava nada.

## 7. Testar a implantação

1. Cole a URL `/exec` numa aba nova do navegador, com a mesma conta.
2. A página deve mostrar só isto: `{"ok":true,"service":"basalt-leads"}`. Isso não grava linha. Só confirma que o app está no ar.
3. Se o Google pedir autorização de novo, repita o passo 5.
4. Para testar uma linha de verdade, peça para quem publica o site colocar a URL e enviar o formulário do preview. Aba **Leads** da planilha: uma linha nova, com a hora de São Paulo, o e-mail, nome vazio, `não` se a caixa não foi marcada, e `lgpd-v1-2026-11-02`.
5. Um e-mail inválido não é gravado. Um envio com o campo escondido anti-spam preenchido também não.

## 8. Exportar CSV

1. Abra a planilha e clique na aba **Leads**.
2. **Arquivo > Baixar**.
3. Escolha **Valores separados por vírgula (.csv)**.

O download usa a aba que está aberta. A ajuda oficial do Planilhas descreve esse caminho como **Arquivo > Baixar** e a escolha do tipo de arquivo.

## 9. Mudou o código? Atualize a mesma implantação

Salvar o arquivo no editor **não** atualiza o endereço `/exec`. A implantação publicada fica na versão antiga até você apontá-la para uma versão nova. A URL não muda. Não crie outra implantação: isso gera outro `/exec` e o site continua no endereço velho.

1. Cole e salve o código novo.
2. **Implantar > Gerenciar implantações**.
3. Na implantação ativa do app da Web, clique no lápis (**Editar**).
4. Em **Versão**, escolha **Nova versão**.
5. Clique em **Implantar**.

A documentação descreve esse caminho como **Deploy > Manage deployments**, editar a implantação e usar uma versão nova, sem trocar a URL.

## O que o site faz com a rede

O navegador manda um POST com `Content-Type: text/plain` e `mode: "no-cors"`. Isso evita a pergunta prévia (preflight) que o Apps Script não responde. O site não consegue ler o JSON de volta.

- Se o envio termina, os dois botões de download aparecem.
- Se a rede falha, ou se o redirecionamento do Google recusa a leitura, os botões **também** aparecem, com o aviso: “Não deu para confirmar o envio. O download está liberado mesmo assim.” Assim, quem já teve a linha gravada não fica sem o arquivo. Quem está sem rede também baixa; a linha pode não ter sido gravada.
- Com `APPS_SCRIPT_URL` vazia, isso só acontece em localhost e no preview da Vercel, e o aviso diz que nada foi armazenado. Num domínio de produção, sem a URL, o download não abre.

O campo `name` vai sempre vazio. A coluna Nome existe para o caso de o texto do site passar a pedir nome.
