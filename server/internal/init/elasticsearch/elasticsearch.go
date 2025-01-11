package elasticsearch

import (
	"github.com/elastic/go-elasticsearch/v8"
	"log"
	"os"
	"server/config"
	"time"
)

type Search struct {
	Client *elasticsearch.Client
	Index  string
}

func NewSearch(cfg config.ElasticsearchConfig) (*Search, error) {
	var client *elasticsearch.Client
	var err error

	// Number of connection attempts
	maxRetries := 3
	retryDelay := 5 * time.Second

	for attempt := 1; attempt <= maxRetries; attempt++ {
		client, err = elasticsearch.NewClient(elasticsearch.Config{
			Addresses: []string{cfg.Address},         // Адрес Elasticsearch
			Username:  "elastic",                     // Логин для локального Elasticsearch
			Password:  os.Getenv("ELASTIC_PASSWORD"), // Пароль из переменной окружения
		})

		if err != nil {
			log.Printf("Attempt %d: Failed to create Elasticsearch client: %v", attempt, err)
			time.Sleep(retryDelay)
			continue
		}

		res, err := client.Ping()
		if err != nil {
			log.Printf("Attempt %d: Failed to connect to Elasticsearch: %v", attempt, err)
			time.Sleep(retryDelay)
			continue
		}
		defer res.Body.Close()

		if res.IsError() {
			log.Printf("Attempt %d: Elasticsearch returned an error: %s", attempt, res.String())
			time.Sleep(retryDelay)
			continue
		}

		log.Println("Successfully connected to Elasticsearch")
		return &Search{
			Client: client,
			Index:  cfg.Index,
		}, nil
	}

	// If all attempts fail, return the error
	return nil, err
}
