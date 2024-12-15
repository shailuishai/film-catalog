package data

import (
	"context"
	"errors"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	u "server/internal/modules/user"
)

type UserDBClient interface {
	CreateUser(email string, hashedPassword string) (int64, error)
	CreateOauthUser(user *u.User) (int64, error)
	GetUserByEmail(email string) (*u.User, error)
	GetUserById(userId int64) (*u.User, error)
	IsEmailConfirmed(email string) (bool, error)
	UpdateUser(user *u.User) error
	ConfirmEmail(email string) error
	DeleteUser(userId int64) error
}

type UserDB struct {
	db *pgxpool.Pool
}

func NewUserDB(db *pgxpool.Pool) *UserDB {
	return &UserDB{
		db: db,
	}
}

func (db *UserDB) CreateUser(email string, hashedPassword string) (int64, error) {
	var userID int64
	err := db.db.QueryRow(context.Background(),
		`INSERT INTO users (email, hashed_password) VALUES ($1, $2) RETURNING user_id`, email, hashedPassword).Scan(&userID)

	if err != nil {
		if err.Error() == `ERROR: duplicate key value violates unique constraint "users_email_key" (SQLSTATE 23505)` {
			return 0, u.ErrEmailExists
		}
		return 0, err
	}

	return userID, nil
}

func (db *UserDB) CreateOauthUser(user *u.User) (int64, error) {
	query := `
        INSERT INTO users (
            hashed_password, is_admin, login, email, verified_email, avatar_url
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING user_id`

	var userID int64
	err := db.db.QueryRow(
		context.Background(),
		query,
		user.HashedPassword,
		user.IsAdmin,
		user.Login,
		user.Email,
		user.VerifiedEmail,
		user.AvatarUrl,
	).Scan(&userID)

	if err != nil {
		if err.Error() == `ERROR: duplicate key value violates unique constraint "users_email_key" (SQLSTATE 23505)` {
			return 0, u.ErrEmailExists
		}
		return 0, err
	}
	return userID, nil
}

func (db *UserDB) GetUserByEmail(email string) (*u.User, error) {
	row := db.db.QueryRow(context.Background(),
		`SELECT * FROM users WHERE email = $1`,
		email,
	)

	user := &u.User{}

	err := row.Scan(
		&user.UserId,
		&user.HashedPassword,
		&user.IsAdmin,
		&user.Login,
		&user.Email,
		&user.VerifiedEmail,
		&user.AvatarUrl,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, u.ErrUserNotFound
		}
		return nil, err
	}

	return user, nil
}

func (db *UserDB) GetUserById(userId int64) (*u.User, error) {
	row := db.db.QueryRow(context.Background(),
		`SELECT * FROM users WHERE user_id = $1`,
		userId,
	)

	user := &u.User{}

	err := row.Scan(
		&user.UserId,
		&user.HashedPassword,
		&user.IsAdmin,
		&user.Login,
		&user.Email,
		&user.VerifiedEmail,
		&user.AvatarUrl,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, u.ErrUserNotFound
		}
		return nil, err
	}

	return user, nil
}

func (db *UserDB) IsEmailConfirmed(email string) (bool, error) {
	row := db.db.QueryRow(context.Background(),
		`SELECT verified_email FROM users WHERE email = $1`,
		email,
	)

	var verified bool
	err := row.Scan(&verified)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return false, u.ErrUserNotFound
		}
		return false, err
	}

	return verified, nil
}

func (db *UserDB) UpdateUser(user *u.User) error {
	_, err := db.db.Exec(context.Background(),
		`UPDATE users
		 SET 
		     login = COALESCE($1, login),
		     avatar_url = COALESCE($2, avatar_url)
		 WHERE user_id = $3`,
		user.Login, user.AvatarUrl, user.UserId,
	)

	return err
}

func (db *UserDB) ConfirmEmail(email string) error {
	_, err := db.db.Exec(context.Background(),
		`UPDATE users SET verified_email = true WHERE email = $1`,
		email,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return u.ErrUserNotFound
		}
		return err
	}

	return nil
}

func (db *UserDB) DeleteUser(userId int64) error {
	_, err := db.db.Exec(context.Background(),
		`DELETE FROM users WHERE user_id = $1`,
		userId,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return u.ErrUserNotFound
		}
		return err
	}

	return nil
}
