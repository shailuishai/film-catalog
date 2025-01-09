package s3

import (
	"bytes"
	"context"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"log/slog"
	s3Storage "server/internal/init/s3"
)

type FilmS3 struct {
	log    *slog.Logger
	s3     *s3Storage.S3Storage
	bucket string
}

func NewFilmS3(log *slog.Logger, s3 *s3Storage.S3Storage) *FilmS3 {
	return &FilmS3{log: log, s3: s3, bucket: "filmposter"}
}

func (s *FilmS3) UploadPoster(filmID uint, file []byte) (string, error) {
	objectKey := fmt.Sprintf("/posters/%d", filmID)

	uploadInput := &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(objectKey),
		Body:        bytes.NewReader(file),
		ContentType: aws.String("image/webp"),
	}

	_, err := s.s3.Client.PutObject(context.TODO(), uploadInput)
	if err != nil {
		return "", err
	}

	posterUrl := fmt.Sprintf("https://%s.%s%s", s.bucket, s.s3.Endpoint, objectKey)
	return posterUrl, err
}

func (s *FilmS3) DeletePoster(filmID uint) error {
	objectKey := fmt.Sprintf("/posters/%d", filmID)

	deleteInput := &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(objectKey),
	}

	_, err := s.s3.Client.DeleteObject(context.TODO(), deleteInput)
	return err
}
