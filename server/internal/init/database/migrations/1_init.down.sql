-- Удаление индексов
DROP INDEX IF EXISTS idx_review_user_id;
DROP INDEX IF EXISTS idx_films_producer;
DROP INDEX IF EXISTS idx_films_date;
DROP INDEX IF EXISTS idx_users_login;
DROP INDEX IF EXISTS idx_users_email;

-- Удаление таблиц-связей
DROP TABLE IF EXISTS film_review CASCADE;
DROP TABLE IF EXISTS film_actor CASCADE;
DROP TABLE IF EXISTS film_rating CASCADE;
DROP TABLE IF EXISTS film_genre CASCADE;

-- Удаление основных таблиц
DROP TABLE IF EXISTS Review CASCADE;
DROP TABLE IF EXISTS Actor CASCADE;
DROP TABLE IF EXISTS Rating CASCADE;
DROP TABLE IF EXISTS Genre CASCADE;
DROP TABLE IF EXISTS Film CASCADE;
DROP TABLE IF EXISTS Users CASCADE;
