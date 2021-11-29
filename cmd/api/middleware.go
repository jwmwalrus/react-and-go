package main

import (
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/pascaldekloe/jwt"
)

func (app *application) enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization")

		next.ServeHTTP(w, r)
	})
}

func (app *application) checkToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Vary", "Authorization")

		authHeader := r.Header.Get("Authorization")

		if authHeader == "" {
			// could set anonymous user
		}

		headerParts := strings.Split(authHeader, " ")

		if len(headerParts) != 2 {
			app.errorJSON(w, errors.New("Invalid auth header"), http.StatusBadRequest)
			return
		}

		if headerParts[0] != "Bearer" {
			app.errorJSON(w, errors.New("Unauthorized - no bearer"), http.StatusBadRequest)
			return
		}

		token := headerParts[1]

		claims, err := jwt.HMACCheck([]byte(token), []byte(app.config.jwt.secret))
		if err != nil {
			app.errorJSON(w, errors.New("Unauthorized - failed hmac check"), http.StatusForbidden)
			return
		}

		if !claims.Valid(time.Now()) {
			app.errorJSON(w, errors.New("Unauthorized - token expired"), http.StatusForbidden)
			return
		}

		if !claims.AcceptAudience("mydomain.com") {
			app.errorJSON(w, errors.New("Unauthorized - invalid audience"), http.StatusForbidden)
			return
		}

		if claims.Issuer != "mydomain.com" {
			app.errorJSON(w, errors.New("Unauthorized - invalid issuer"), http.StatusForbidden)
			return
		}

		userID, err := strconv.ParseInt(claims.Subject, 10, 64)
		if err != nil {
			app.errorJSON(w, errors.New("Unauthorized"), http.StatusForbidden)
			return
		}

		app.logger.Println("Valid user", userID)

		next.ServeHTTP(w, r)
	})
}
