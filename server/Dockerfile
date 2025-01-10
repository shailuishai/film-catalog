FROM golang:1.23.4 AS builder

RUN apt-get update && apt-get install -y gcc g++ make libwebp-dev

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

COPY ./config /app/server/config

RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build -o main ./cmd/film-catalog/main.go

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y libwebp7 ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/main /app/main
COPY --from=builder /app/server/config /app/server/config

EXPOSE 8080
CMD ["./main"]
