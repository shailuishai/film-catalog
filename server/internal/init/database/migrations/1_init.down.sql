-- Удаление индексов
DROP INDEX IF EXISTS idx_review_user_id;
DROP INDEX IF EXISTS idx_films_producer;
DROP INDEX IF EXISTS idx_films_date;
DROP INDEX IF EXISTS idx_users_login;
DROP INDEX IF EXISTS idx_users_email;

-- Удаление таблиц-связей
DROP TABLE IF EXISTS film_actor CASCADE;
DROP TABLE IF EXISTS film_stat CASCADE;
DROP TABLE IF EXISTS film_genre CASCADE;

-- Удаление основных таблиц
DROP TABLE IF EXISTS review CASCADE;
DROP TABLE IF EXISTS actor CASCADE;
DROP TABLE IF EXISTS genre CASCADE;
DROP TABLE IF EXISTS film CASCADE;
DROP TABLE IF EXISTS users CASCADE;
