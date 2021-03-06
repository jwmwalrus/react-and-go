package models

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

// DBModel defines the database model
type DBModel struct {
	DB *sql.DB
}

// Get returns one movie and error, if any
func (m *DBModel) Get(id int) (*Movie, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `select
					id,
					title,
					description,
					year,
					release_date,
					rating,
					runtime,
					mpaa_rating,
					coalesce(poster,'') as poster,
					created_at,
					updated_at
				from movies
				where id = $1
	`

	row := m.DB.QueryRowContext(ctx, query, id)

	var movie Movie

	err := row.Scan(
		&movie.ID,
		&movie.Title,
		&movie.Description,
		&movie.Year,
		&movie.ReleaseDate,
		&movie.Rating,
		&movie.Runtime,
		&movie.MPAARating,
		&movie.Poster,
		&movie.CreatedAt,
		&movie.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	query = `select mg.id, mg.movie_id, mg.genre_id, g.created_at, g.updated_at,
				g.id, g.genre_name, g.created_at, g.updated_at
				from movies_genres mg
				join genres g on g.id = mg.genre_id
				where mg.movie_id = $1;
	`

	movie.MovieGenre = make(map[int]string)

	rows, err := m.DB.QueryContext(ctx, query, id)

	if err == nil {
		defer rows.Close()

		for rows.Next() {
			mg := MovieGenre{}

			err = rows.Scan(
				&mg.ID,
				&mg.MovieID,
				&mg.GenreID,
				&mg.CreatedAt,
				&mg.UpdatedAt,
				&mg.Genre.ID,
				&mg.Genre.GenreName,
				&mg.Genre.CreatedAt,
				&mg.Genre.UpdatedAt,
			)
			if err != nil {
				return nil, err
			}
			movie.MovieGenre[mg.ID] = mg.Genre.GenreName
		}
	}

	return &movie, nil
}

// All returns all movies and error, if any
func (m *DBModel) All(genre ...int) ([]*Movie, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	where := ""
	if len(genre) > 0 {
		where = fmt.Sprintf("where id in (select movie_id from movies_genres where genre_id = %d)", genre[0])
	}

	query := fmt.Sprintf(`select id, title, description, year, release_date, rating, runtime, mpaa_rating,
				coalesce(poster,'') as poster, created_at, updated_at
				from movies %s
				order by title`, where)

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var movies []*Movie

	genreQuery := `select mg.id, mg.movie_id, mg.genre_id, g.created_at, g.updated_at,
					g.id, g.genre_name, g.created_at, g.updated_at
					from movies_genres mg
					join genres g on g.id = mg.genre_id
					where mg.movie_id = $1;
	`

	for rows.Next() {
		movie := Movie{}
		err := rows.Scan(
			&movie.ID,
			&movie.Title,
			&movie.Description,
			&movie.Year,
			&movie.ReleaseDate,
			&movie.Rating,
			&movie.Runtime,
			&movie.MPAARating,
			&movie.Poster,
			&movie.CreatedAt,
			&movie.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		movie.MovieGenre = make(map[int]string)

		genreRows, err := m.DB.QueryContext(ctx, genreQuery, movie.ID)

		if err == nil {
			defer genreRows.Close()

			for genreRows.Next() {
				mg := MovieGenre{}

				err = genreRows.Scan(
					&mg.ID,
					&mg.MovieID,
					&mg.GenreID,
					&mg.CreatedAt,
					&mg.UpdatedAt,
					&mg.Genre.ID,
					&mg.Genre.GenreName,
					&mg.Genre.CreatedAt,
					&mg.Genre.UpdatedAt,
				)
				if err != nil {
					return nil, err
				}
				movie.MovieGenre[mg.ID] = mg.Genre.GenreName
			}
		}
		movies = append(movies, &movie)
	}

	return movies, nil
}

// GenresAll returns all genres
func (m *DBModel) GenresAll() ([]*Genre, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `select id, genre_name, created_at, updated_at
				from genres
				order by genre_name
	`

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var genres []*Genre

	for rows.Next() {
		g := Genre{}
		err := rows.Scan(
			&g.ID,
			&g.GenreName,
			&g.CreatedAt,
			&g.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		genres = append(genres, &g)
	}

	return genres, nil
}

// InsertMovie inserts a movie into the database
func (m *DBModel) InsertMovie(movie Movie) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	stmt := `insert into movies (title, description, year, release_date, rating, runtime, mpaa_rating,
				poster, created_at, updated_at) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	_, err := m.DB.ExecContext(ctx, stmt,
		movie.Title,
		movie.Description,
		movie.Year,
		movie.ReleaseDate,
		movie.Rating,
		movie.Runtime,
		movie.MPAARating,
		movie.Poster,
		movie.CreatedAt,
		movie.UpdatedAt,
	)

	if err != nil {
		return err
	}

	return nil
}

// UpdateMovie updates a movie entry in the database
func (m *DBModel) UpdateMovie(movie Movie) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	stmt := `update movies set
				title = $1,
				description = $2,
				year = $3,
				release_date = $4,
				rating = $5,
				runtime =$6,
				mpaa_rating = $7,
				poster = $8,
				updated_at = $9
				where id = $10
	`

	_, err := m.DB.ExecContext(ctx, stmt,
		movie.Title,
		movie.Description,
		movie.Year,
		movie.ReleaseDate,
		movie.Rating,
		movie.Runtime,
		movie.MPAARating,
		movie.Poster,
		movie.UpdatedAt,
		movie.ID,
	)

	if err != nil {
		return err
	}

	return nil
}

// DeleteMovie deletes a movie entry from the database
func (m *DBModel) DeleteMovie(id int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	stmt := `delete from movies
				where id = $1
	`

	_, err := m.DB.ExecContext(ctx, stmt, id)
	if err != nil {
		return err
	}

	return nil
}
