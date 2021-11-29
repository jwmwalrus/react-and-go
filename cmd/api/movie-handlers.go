package main

import (
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"

	"github.com/julienschmidt/httprouter"
	"github.com/jwmwalrus/react-and-go/models"
)

type jsonResp struct {
	OK      bool   `json:"ok"`
	Message string `json:"message"`
}

func (app *application) getOneMovie(w http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext(r.Context())

	id, err := strconv.Atoi(params.ByName("id"))
	if err != nil {
		app.logger.Print(errors.New("Invalid id parameter"))
		app.errorJSON(w, err, http.StatusBadRequest)
		return
	}

	movie, err := app.models.DB.Get(id)
	if err != nil {
		app.errorJSON(w, err, http.StatusNotFound)
		return
	}

	err = app.writeJSON(w, http.StatusOK, movie, "movie")
	if err != nil {
		app.errorJSON(w, err, http.StatusBadRequest)
	}
}

func (app *application) getAllMovies(w http.ResponseWriter, r *http.Request) {
	movies, err := app.models.DB.All()
	if err != nil {
		app.errorJSON(w, err, http.StatusBadRequest)
		return
	}

	err = app.writeJSON(w, http.StatusOK, movies, "movies")
	if err != nil {
		app.errorJSON(w, err, http.StatusBadRequest)
	}

}

func (app *application) getAllGenres(w http.ResponseWriter, r *http.Request) {
	genres, err := app.models.DB.GenresAll()
	if err != nil {
		app.errorJSON(w, err, http.StatusBadRequest)
		return
	}

	err = app.writeJSON(w, http.StatusOK, genres, "genres")
	if err != nil {
		app.errorJSON(w, err, http.StatusBadRequest)
	}
}

func (app *application) getAllMoviesByGenre(w http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext(r.Context())

	genreID, err := strconv.Atoi(params.ByName("genre_id"))
	if err != nil {
		app.logger.Print(errors.New("Invalid id parameter"))
		app.errorJSON(w, err, http.StatusBadRequest)
		return
	}

	movies, err := app.models.DB.All(genreID)
	if err != nil {
		app.errorJSON(w, err, http.StatusBadRequest)
		return
	}

	err = app.writeJSON(w, http.StatusOK, movies, "movies")
	if err != nil {
		app.errorJSON(w, err, http.StatusBadRequest)
	}
}

func (app *application) deleteMovie(w http.ResponseWriter, r *http.Request) {
	params, ok := r.Context().Value(wrappedParamsKey).(httprouter.Params)
	if !ok {
		app.errorJSON(w, errors.New("Missing `id` to delete movie"), http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(params.ByName("id"))
	if err != nil {
		app.errorJSON(w, err, http.StatusBadRequest)
		return
	}

	err = app.models.DB.DeleteMovie(id)
	if err != nil {
		app.errorJSON(w, err, http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

type moviePayload struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	ReleaseDate string `json:"releaseDate"`
	Runtime     string `json:"runtime"`
	Rating      string `json:"rating"`
	MPAARating  string `json:"mpaaRating"`
}

func (app *application) editMovie(w http.ResponseWriter, r *http.Request) {
	var payload moviePayload

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		app.errorJSON(w, err, http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(payload.ID)
	if err != nil {
		app.errorJSON(w, err, http.StatusBadRequest)
		return
	}

	runtime, err := strconv.Atoi(payload.Runtime)
	if err != nil {
		app.errorJSON(w, err, http.StatusBadRequest)
		return
	}

	rating, err := strconv.Atoi(payload.Rating)
	if err != nil {
		app.errorJSON(w, err, http.StatusBadRequest)
		return
	}

	releaseDate, err := time.Parse("2006-01-02", payload.ReleaseDate)
	if err != nil {
		app.errorJSON(w, err, http.StatusBadRequest)
		return
	}

	movie := models.Movie{
		ID:          id,
		Title:       payload.Title,
		Description: payload.Description,
		Year:        releaseDate.Year(),
		ReleaseDate: releaseDate,
		Runtime:     runtime,
		Rating:      rating,
		MPAARating:  payload.MPAARating,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if movie.Poster == "" {
		movie = getPoster(movie)
	}

	if movie.ID > 0 {
		err = app.models.DB.UpdateMovie(movie)
		if err != nil {
			app.errorJSON(w, err, http.StatusNotFound)
			return
		}
	} else {
		err = app.models.DB.InsertMovie(movie)
		if err != nil {
			app.errorJSON(w, err, http.StatusBadRequest)
			return
		}
	}

	ok := jsonResp{OK: true}

	err = app.writeJSON(w, http.StatusOK, ok, "response")
	if err != nil {
		app.errorJSON(w, err, http.StatusBadRequest)
	}
}

func getPoster(movie models.Movie) models.Movie {
	type TheMovieDB struct {
		Page    int `json:"page"`
		Results []struct {
			Adult            bool    `json:"adult"`
			BackdropPath     string  `json:"backdrop_path"`
			GenreIds         []int   `json:"genre_ids"`
			ID               int     `json:"id"`
			OriginalLanguage string  `json:"original_language"`
			OriginalTitle    string  `json:"original_title"`
			Overview         string  `json:"overview"`
			Popularity       float64 `json:"popularity"`
			PosterPath       string  `json:"poster_path"`
			ReleaseDate      string  `json:"release_date,omitempty"`
			Title            string  `json:"title"`
			Video            bool    `json:"video"`
			VoteAverage      float64 `json:"vote_average"`
			VoteCount        int     `json:"vote_count"`
		} `json:"results"`
		TotalPages   int `json:"total_pages"`
		TotalResults int `json:"total_results"`
	}

	client := http.Client{}

	key := os.Getenv("API_TMDB_KEY")

	theURL := "https://api.themoviedb.org/3/search/movie?api_key="

	req, err := http.NewRequest(
		http.MethodGet,
		theURL+key+"&query="+url.QueryEscape(movie.Title),
		nil,
	)
	if err != nil {
		log.Println(err)
		return movie
	}

	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/json")

	res, err := client.Do(req)
	if err != nil {
		log.Println(err)
		return movie
	}
	defer res.Body.Close()

	bodyBytes, err := io.ReadAll(res.Body)
	if err != nil {
		log.Println(err)
		return movie
	}

	var responseObject TheMovieDB
	err = json.Unmarshal(bodyBytes, &responseObject)
	if err != nil {
		log.Println(err)
		return movie
	}

	if len(responseObject.Results) > 0 {
		movie.Poster = responseObject.Results[0].PosterPath
	}

	return movie
}
