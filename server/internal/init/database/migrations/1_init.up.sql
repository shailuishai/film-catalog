CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    hashed_password VARCHAR(255),
    is_admin BOOLEAN NOT NULL DEFAULT false,
    login VARCHAR(100) UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    verified_email  BOOLEAN NOT NULL DEFAULT false,
    avatar_url TEXT DEFAULT 'https://useravatar.storage-173.s3hoster.by/default/',
    create_at DATE DEFAULT current_date
);

CREATE OR REPLACE FUNCTION set_default_login()
    RETURNS TRIGGER AS $$
BEGIN
    IF NEW.login IS NULL OR NEW.login = '' THEN
        UPDATE users
        SET login = 'USER' || NEW.user_id
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_insert_user
    AFTER INSERT ON users
    FOR EACH ROW
EXECUTE FUNCTION set_default_login();

CREATE TABLE film (
    film_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'фильмец под чипсики',
    poster_url TEXT NOT NULL DEFAULT 'https://filmposter.database-173.s3hoster.by/default/',
    synopsis TEXT NOT NULL DEFAULT '-',
    release_date DATE,
    runtime INT,
    producer VARCHAR(255),
    create_at DATE DEFAULT current_date
);

--TODO: сделать жанры как отдельный католог с постерами и описанием крутая фича для пользователей не прошареных за фильмы
CREATE TABLE genres (
    genre_id SERIAL PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    create_at DATE DEFAULT current_date
);

CREATE TABLE film_genre (
    film_id INT NOT NULL,
    genre_id INT NOT NULL,
    CONSTRAINT fk_film FOREIGN KEY (film_id) REFERENCES film (film_id) ON DELETE CASCADE,
    CONSTRAINT fk_genre FOREIGN KEY (genre_id) REFERENCES genres (genre_id) ON DELETE CASCADE
);

CREATE TABLE actors (
    actor_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    avatar_url TEXT DEFAULT 'https://actoravatar.storage-173.s3hoster.by/default/512x512.webp',
    wiki_url TEXT DEFAULT '',
    create_at DATE DEFAULT current_date
);

CREATE TABLE film_actor (
    film_id INT NOT NULL,
    actor_id INT NOT NULL,
    CONSTRAINT fk_film FOREIGN KEY (film_id) REFERENCES film (film_id) ON DELETE CASCADE,
    CONSTRAINT fk_actor FOREIGN KEY (actor_id) REFERENCES actors (actor_id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users (user_id) ON DELETE CASCADE,
    film_id INT REFERENCES film (film_id) ON DELETE CASCADE,
    review_text TEXT NOT NULL,
    create_at DATE DEFAULT current_date,
    UNIQUE (user_id,film_id)
);

CREATE TABLE film_stat (
    film_id SERIAL PRIMARY KEY REFERENCES film (film_id) ON DELETE CASCADE,
    review_id INT NOT NULL,
    CONSTRAINT fk_film FOREIGN KEY (film_id) REFERENCES film (film_id) ON DELETE CASCADE,
    CONSTRAINT fk_review FOREIGN KEY (review_id) REFERENCES reviews (review_id) ON DELETE CASCADE
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_login ON users (login);
CREATE INDEX idx_films_date ON film (release_date);
CREATE INDEx idx_films_producer ON film (producer);
CREATE INDEX idx_review_user_id ON reviews (user_id);
