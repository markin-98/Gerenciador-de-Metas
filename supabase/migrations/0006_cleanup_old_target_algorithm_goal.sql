-- Remove a meta de teste "250" (tipo "Meta por Valor Total") criada antes da
-- correção do algoritmo de geração de sequência, que usava passo de 1 centavo
-- em vez de R$1 e por isso gerava valores inconsistentes com o Desafio.
delete from public.goals where name = '250' and type = 'target';
