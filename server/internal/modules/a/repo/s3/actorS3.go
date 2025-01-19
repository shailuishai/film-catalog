package s3

import (
	"bytes"
	"context"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"log/slog"
	s3Storage "server/internal/init/s3"
	"server/internal/modules/a"
	"strings"
)

type ActorS3 struct {
	log    *slog.Logger
	s3     *s3Storage.S3Storage
	bucket string
}

func NewActorS3(log *slog.Logger, s3 *s3Storage.S3Storage) *ActorS3 {
	return &ActorS3{
		log:    log,
		s3:     s3,
		bucket: "actoravatar",
	}
}

func (s *ActorS3) UploadAvatar(avatar []byte, name string, actorId uint) (*string, error) {
	name = strings.ReplaceAll(name, " ", "")
	objectKey := fmt.Sprintf("/%s%d", name, actorId)

	uploadInput := &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(objectKey),
		Body:        bytes.NewReader(avatar),
		ContentType: aws.String("image/webp"),
	}

	_, err := s.s3.Client.PutObject(context.TODO(), uploadInput)

	avatarUrl := fmt.Sprintf("https://%s.%s%s", s.bucket, s.s3.Endpoint, objectKey)
	return &avatarUrl, err
}

func (s *ActorS3) DeleteAvatar(name string, actorId uint) error {
	name = strings.ReplaceAll(name, " ", "")
	objectKey := fmt.Sprintf("/%s%d", name, actorId)

	deleteInput := &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(objectKey),
	}

	_, err := s.s3.Client.DeleteObject(context.TODO(), deleteInput)

	return err
}

func (s *ActorS3) RenameAvatar(oldName string, actorId uint, newName string) error {
	oldName = strings.ReplaceAll(oldName, " ", "")
	newName = strings.ReplaceAll(newName, " ", "")

	oldObjectKey := fmt.Sprintf("/%s%d", oldName, actorId)
	newObjectKey := fmt.Sprintf("/%s%d", newName, actorId)

	copyInput := &s3.CopyObjectInput{
		Bucket:     aws.String(s.bucket),
		CopySource: aws.String(fmt.Sprintf("%s/%s", s.bucket, oldObjectKey)),
		Key:        aws.String(newObjectKey),
	}
	_, err := s.s3.Client.CopyObject(context.TODO(), copyInput)
	if err != nil {
		s.log.Error("failed to copy object", slog.String("error", err.Error()))
		return a.ErrInternal
	}

	deleteInput := &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(oldObjectKey),
	}
	_, err = s.s3.Client.DeleteObject(context.TODO(), deleteInput)
	if err != nil {
		s.log.Error("failed to delete old object", slog.String("error", err.Error()))
		return a.ErrInternal
	}

	s.log.Info("object renamed successfully",
		slog.String("old_key", oldObjectKey),
		slog.String("new_key", newObjectKey),
	)

	return nil
}
