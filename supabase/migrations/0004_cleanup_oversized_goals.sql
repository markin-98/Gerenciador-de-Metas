-- Limpeza pontual: remove metas criadas antes da correção do algoritmo do
-- "Desafio por Depósitos" (que gerava depósitos de 1 em 1 centavo), deixando
-- metas com muito mais depósitos do que o limite atual (500) permitiria.
delete from public.goals where deposits_count > 500;
