CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    hashed_password VARCHAR(255),
    is_admin BOOLEAN NOT NULL DEFAULT false,
    login VARCHAR(100) UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    verified_email  BOOLEAN NOT NULL DEFAULT false,
    avatar_url TEXT DEFAULT 'https://useravatar.database-173.s3hoster.by/default/'
);

CREATE TABLE Film (
    film_id SERIAL PRIMARY KEY,
    poster_image TEXT DEFAULT 'https://filmposter.database-173.s3hoster.by/default/',
    synopsis TEXT DEFAULT '-',
    release_date DATE,
    runtime INT,
    producer VARCHAR(255)
);

CREATE TABLE Genre (
    genre_id SERIAL PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL
);

CREATE TABLE film_genre (
    film_id INT NOT NULL,
    genre_id INT NOT NULL,
    CONSTRAINT fk_film FOREIGN KEY (film_id) REFERENCES film (film_id) ON DELETE CASCADE,
    CONSTRAINT fk_genre FOREIGN KEY (genre_id) REFERENCES genre (genre_id) ON DELETE CASCADE
);

CREATE TABLE Rating (
    rating_id SERIAL PRIMARY KEY,
    stars INT CHECK ( stars >= 0 AND stars <=5 )
);

CREATE TABLE film_rating (
    film_id INT NOT NULL,
    rating_id INT NOT NULL,
    CONSTRAINT fk_film FOREIGN KEY (film_id) REFERENCES film (film_id) ON DELETE CASCADE,
    CONSTRAINT fk_rating FOREIGN KEY (rating_id) REFERENCES rating (rating_id) ON DELETE CASCADE
);

CREATE TABLE Actor (
    actor_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    actor_avatar_url TEXT DEFAULT 'https://actoravatar.database-173.s3hoster.by/default/'
);

CREATE TABLE film_actor (
    film_id INT NOT NULL,
    actor_id INT NOT NULL,
    CONSTRAINT fk_film FOREIGN KEY (film_id) REFERENCES film (film_id) ON DELETE CASCADE,
    CONSTRAINT fk_actor FOREIGN KEY (actor_id) REFERENCES actor (actor_id) ON DELETE CASCADE
);

CREATE TABLE Review (
    review_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    review_text TEXT NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

CREATE TABLE film_review (
    film_id INT NOT NULL,
    review_id INT NOT NULL,
    CONSTRAINT fk_film FOREIGN KEY (film_id) REFERENCES film (film_id) ON DELETE CASCADE,
    CONSTRAINT fk_review FOREIGN KEY (review_id) REFERENCES review (review_id) ON DELETE CASCADE
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_login ON users (login);
CREATE INDEX idx_films_date ON film (release_date);
CREATE INDEx idx_films_producer ON film (producer);
CREATE INDEX idx_review_user_id ON review (user_id);
