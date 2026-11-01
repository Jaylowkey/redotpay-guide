# PAYGO RedotPay Guide — setup de produção

## Estado do projeto

- Site público: \`index.html\`
- Painel administrativo: \`admin.html\`
- Ingestão de eventos: \`api/track.js\`
- Métricas protegidas: \`api/admin/metrics.js\`
- Configuração pública do Supabase: \`api/public-config.js\`
- Migração SQL: \`supabase/migrations/202610310001_paygo_analytics.sql\`

## 1. Criar a base dedicada

Criar um projeto Supabase exclusivo para PAYGO. Não reutilizar bases de outros produtos.

Aplicar a migração SQL indicada acima no SQL Editor do novo projeto.

## 2. Criar o utilizador administrador

No Supabase Authentication, criar/convidar o e-mail administrador e confirmar o e-mail. O endpoint de métricas só autoriza o endereço configurado em \`PAYGO_ADMIN_EMAIL\`.

## 3. Configurar variáveis no Vercel

Adicionar em Production e Preview:

- \`SUPABASE_URL\`: URL do projeto Supabase
- \`SUPABASE_ANON_KEY\`: chave publishable/anon pública
- \`SUPABASE_SERVICE_ROLE_KEY\`: service role key (segredo; apenas backend)
- \`PAYGO_ADMIN_EMAIL\`: e-mail autorizado para o painel

Nunca colocar \`SUPABASE_SERVICE_ROLE_KEY\` no HTML, no navegador, no GitHub ou em variáveis \`NEXT_PUBLIC_*\`.

## 4. Confirmar o convite e os códigos

O link de convite mantido nesta versão é \`https://url.hk/i/en/jt6mg\`, conforme o site anterior.

Os códigos promocionais exibidos são exatamente os fornecidos pelo responsável: \`PAYGOP20\` e \`PAUGOV20\`. A validade, o desconto, a elegibilidade e o produto aplicável ainda precisam ser confirmados no checkout oficial. Não afirmar que os dois são cumulativos.

## 5. Eventos medidos

- \`page_view\`: sessão que visitou a página
- \`invite_click\`: clique no link de convite
- \`promo_copy\`: cópia de um código
- \`whatsapp_click\`: clique para falar com a PAYGO
- \`signup_start\`, \`signup_confirmed\`, \`kyc_verified\`, \`card_requested\`: aceites pelo backend, mas só devem ser enviados quando houver integração ou evidência de confirmação legítima.

O site não recolhe documentos, palavras-passe, OTP, PIN, dados de cartão ou UID. A métrica de visitas usa um identificador aleatório de sessão, não um endereço IP.

## 6. Verificação antes de produção

1. Testar landing page em telemóvel e desktop.
2. Confirmar o link de convite e os dois códigos.
3. Verificar eventos no banco.
4. Testar login com o e-mail administrador.
5. Confirmar que outro e-mail recebe 403.
6. Confirmar que o painel mostra visitas e cliques reais.
7. Confirmar que não existem conversões de registo fictícias.
8. Só então promover a versão testada para produção.
