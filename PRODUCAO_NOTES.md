# Produção — decisão atual

O site NÃO processa pagamentos diretamente.
O cliente é direcionado para o WhatsApp para solicitar a recarga e receber as instruções.

Fluxo:
1. Link de convite.
2. Código jt6mg.
3. KYC.
4. Escolha do cartão.
5. Código promocional.
6. WhatsApp para solicitar 850 MT.

Antes do deploy, substituir `258SEU_NUMERO_WHATSAPP` em index.html pelo número oficial em formato internacional.

Painel admin:
- admin.html é apenas protótipo visual.
- Para produção real, proteger com autenticação e guardar conteúdo/imagens no Supabase Storage/DB.