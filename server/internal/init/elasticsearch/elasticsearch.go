package elasticsearch

import (
	"github.com/elastic/go-elasticsearch/v8"
	"log"
	"server/config"
)

type Search struct {
	Client *elasticsearch.Client
	Index  string
}

func NewSearch(cfg config.ElasticsearchConfig) (*Search, error) {
	client, err := elasticsearch.NewClient(elasticsearch.Config{
		Addresses: []string{cfg.Address},
		Username:  cfg.Username,
		Password:  cfg.Password,
	})
	if err != nil {
		return nil, err
	}

	res, err := client.Ping()
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.IsError() {
		log.Printf("Ошибка подключения к Elasticsearch: %s", res.String())
		return nil, err
	}

	log.Println("Успешное подключение к Elasticsearch")

	return &Search{
		Client: client,
		Index:  cfg.Index,
	}, nil
}
