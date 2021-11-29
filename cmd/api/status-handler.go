package main

import (
	"encoding/json"
	"net/http"
)

type appStatus struct {
	Status      string `json:"status"`
	Environment string `json:"environment"`
	Version     string `json:"version"`
}

func (app *application) statusHandler(w http.ResponseWriter, r *http.Request) {
	currentStatus := appStatus{
		Status:      "Available",
		Environment: app.config.env,
		Version:     appVersion.String(),
	}

	js, err := json.MarshalIndent(currentStatus, "", "\t")
	if err != nil {
		app.logger.Println(err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(js)
}
