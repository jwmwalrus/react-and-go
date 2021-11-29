package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/graphql-go/graphql"
	"github.com/jwmwalrus/react-and-go/models"
)

var movies []*models.Movie

var fields = graphql.Fields{
	"movie": &graphql.Field{
		Type:        movieType,
		Description: "Get movie by id",
		Args: graphql.FieldConfigArgument{
			"id": &graphql.ArgumentConfig{
				Type: graphql.Int,
			},
		},
		Resolve: func(p graphql.ResolveParams) (interface{}, error) {
			id, ok := p.Args["id"].(int)
			if ok {
				for _, movie := range movies {
					if movie.ID == id {
						return movie, nil
					}
				}
			}

			return nil, nil
		},
	},
	"list": &graphql.Field{
		Type:        graphql.NewList(movieType),
		Description: "Get all movies",
		Resolve: func(p graphql.ResolveParams) (interface{}, error) {
			return movies, nil
		},
	},
	"search": &graphql.Field{
		Type:        graphql.NewList(movieType),
		Description: "Search movies by title",
		Args: graphql.FieldConfigArgument{
			"titleContains": &graphql.ArgumentConfig{
				Type: graphql.String,
			},
		},
		Resolve: func(p graphql.ResolveParams) (interface{}, error) {
			var theList []*models.Movie
			search, ok := p.Args["titleContains"].(string)
			if ok {
				for _, m := range movies {
					if strings.Contains(m.Title, search) {
						log.Println("Found one")
						theList = append(theList, m)
					}
				}
			}
			return theList, nil
		},
	},
}

var movieType = graphql.NewObject(
	graphql.ObjectConfig{
		Name: "Movie",
		Fields: graphql.Fields{
			"id": &graphql.Field{
				Type: graphql.Int,
			},
			"title": &graphql.Field{
				Type: graphql.String,
			},
			"description": &graphql.Field{
				Type: graphql.String,
			},
			"year": &graphql.Field{
				Type: graphql.Int,
			},
			"releaseDate": &graphql.Field{
				Type: graphql.DateTime,
			},
			"runtime": &graphql.Field{
				Type: graphql.Int,
			},
			"rating": &graphql.Field{
				Type: graphql.Int,
			},
			"mpaaRating": &graphql.Field{
				Type: graphql.String,
			},
			"poster": &graphql.Field{
				Type: graphql.String,
			},
			"createdAt": &graphql.Field{
				Type: graphql.DateTime,
			},
			"updatedAt": &graphql.Field{
				Type: graphql.DateTime,
			},
		},
	},
)

func (app *application) moviesGraphQL(w http.ResponseWriter, r *http.Request) {
	var err error

	movies, err = app.models.DB.All()
	if err != nil {
		app.errorJSON(w, err, http.StatusInternalServerError)
		return
	}

	q, err := io.ReadAll(r.Body)
	if err != nil {
		app.errorJSON(w, err, http.StatusInternalServerError)
		return
	}

	query := string(q)

	rootQuery := graphql.ObjectConfig{Name: "RootQuery", Fields: fields}
	schemaConfig := graphql.SchemaConfig{Query: graphql.NewObject(rootQuery)}
	schema, err := graphql.NewSchema(schemaConfig)
	if err != nil {
		app.errorJSON(w, errors.New("Failed to create schema"), http.StatusInternalServerError)
		return
	}

	params := graphql.Params{Schema: schema, RequestString: query}
	resp := graphql.Do(params)
	if len(resp.Errors) > 0 {
		app.errorJSON(w, fmt.Errorf("Failed: %+v", resp.Errors), http.StatusBadRequest)
		return
	}

	j, err := json.MarshalIndent(resp, "", "  ")
	if err != nil {
		app.errorJSON(w, err, http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(j)
}
