package elasticsearch

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log/slog"
	"server/internal/init/elasticsearch"
	f "server/internal/modules/film"
)

type FilmEs struct {
	log *slog.Logger
	s   *elasticsearch.Search
}

func NewFilmEs(log *slog.Logger, s *elasticsearch.Search) *FilmEs {
	return &FilmEs{
		log: log,
		s:   s,
	}
}

func (es *FilmEs) SearchFilms(query string) ([]*f.FilmDTO, error) {
	// Создаем JSON-запрос для поиска
	searchQuery := map[string]interface{}{
		"query": map[string]interface{}{
			"multi_match": map[string]interface{}{
				"query":  query,
				"fields": []string{"title", "description"},
			},
		},
	}

	// Преобразуем запрос в JSON
	queryJSON, err := json.Marshal(searchQuery)
	if err != nil {
		es.log.Error("Ошибка при сериализации запроса", slog.Any("error", err))
		return nil, err
	}

	// Выполняем поиск в Elasticsearch
	res, err := es.s.Client.Search(
		es.s.Client.Search.WithIndex(es.s.Index),
		es.s.Client.Search.WithBody(bytes.NewReader(queryJSON)),
		es.s.Client.Search.WithPretty(),
	)
	if err != nil {
		es.log.Error("Ошибка при выполнении поиска", slog.Any("error", err))
		return nil, err
	}
	defer res.Body.Close()

	// Проверяем ответ от Elasticsearch
	if res.IsError() {
		var e map[string]interface{}
		if err := json.NewDecoder(res.Body).Decode(&e); err != nil {
			es.log.Error("Ошибка при разборе ответа от Elasticsearch", slog.Any("error", err))
			return nil, err
		}
		es.log.Error("Ошибка Elasticsearch", slog.Any("response", e))
		return nil, fmt.Errorf("ошибка Elasticsearch: %s", e["error"].(map[string]interface{})["reason"])
	}

	// Разбираем результаты поиска
	var result map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		es.log.Error("Ошибка при разборе результатов поиска", slog.Any("error", err))
		return nil, err
	}

	// Извлекаем фильмы из ответа
	hits := result["hits"].(map[string]interface{})["hits"].([]interface{})
	films := make([]*f.FilmDTO, 0, len(hits))

	for _, hit := range hits {
		source := hit.(map[string]interface{})["_source"]
		filmJSON, err := json.Marshal(source)
		if err != nil {
			es.log.Error("Ошибка при сериализации фильма", slog.Any("error", err))
			continue
		}

		var film f.FilmDTO
		if err := json.Unmarshal(filmJSON, &film); err != nil {
			es.log.Error("Ошибка при десериализации фильма", slog.Any("error", err))
			continue
		}

		films = append(films, &film)
	}

	es.log.Info("Успешный поиск", slog.Int("найдено фильмов", len(films)))
	return films, nil
}

func (es *FilmEs) IndexFilm(film *f.FilmDTO) error {
	// Преобразуем фильм в JSON
	filmJSON, err := json.Marshal(film)
	if err != nil {
		es.log.Error("Ошибка при сериализации фильма", slog.Any("error", err))
		return err
	}

	// Индексируем документ в Elasticsearch
	res, err := es.s.Client.Index(
		es.s.Index,                // Имя индекса
		bytes.NewReader(filmJSON), // Тело документа
		es.s.Client.Index.WithDocumentID(fmt.Sprint(film.ID)), // ID документа
	)
	if err != nil {
		es.log.Error("Ошибка при индексации фильма", slog.Any("error", err))
		return err
	}
	defer res.Body.Close()

	// Проверяем ответ от Elasticsearch
	if res.IsError() {
		var e map[string]interface{}
		if err := json.NewDecoder(res.Body).Decode(&e); err != nil {
			es.log.Error("Ошибка при разборе ответа от Elasticsearch", slog.Any("error", err))
			return err
		}
		es.log.Error("Ошибка Elasticsearch", slog.Any("response", e))
		return fmt.Errorf("ошибка Elasticsearch: %s", e["error"].(map[string]interface{})["reason"])
	}

	es.log.Info("Фильм успешно проиндексирован", slog.String("id", fmt.Sprint(film.ID)))
	return nil
}

func (es *FilmEs) DeleteFilmFromIndex(filmID uint) error {
	res, err := es.s.Client.Delete(
		es.s.Index,
		fmt.Sprint(filmID),
	)
	if err != nil {
		es.log.Error("Ошибка при удалении фильма из индекса", slog.Any("error", err))
		return err
	}
	defer res.Body.Close()

	if res.IsError() {
		var e map[string]interface{}
		if err := json.NewDecoder(res.Body).Decode(&e); err != nil {
			es.log.Error("Ошибка при разборе ответа от Elasticsearch", slog.Any("error", err))
			return err
		}
		es.log.Error("Ошибка Elasticsearch", slog.Any("response", e))
		return fmt.Errorf("ошибка Elasticsearch: %s", e["error"].(map[string]interface{})["reason"])
	}

	return nil
}
