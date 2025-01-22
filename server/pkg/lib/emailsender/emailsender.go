package emailsender

import (
	"fmt"
	"gopkg.in/gomail.v2"
	"os"
	"server/config"
)

type EmailSender struct {
	SmtpServer *gomail.Dialer
}

func New(cfg config.SMTPConfig) (*EmailSender, error) {
	d := gomail.NewDialer(cfg.Host, cfg.Port, cfg.Username, os.Getenv("YANDEX_EMAIL_PASSWORD"))
	conn, err := d.Dial()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to SMTP server: %w", err)
	}
	defer conn.Close()
	return &EmailSender{d}, nil
}

func (e *EmailSender) SendConfirmEmail(code string, email string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", "OfflinerMen@yandex.by")
	m.SetHeader("To", email)
	m.SetHeader("Subject", "Подтверждение почты")
	body := `<!DOCTYPE html>
	<html lang="ru">
	<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <title>Подтверждение почты</title>
    <style>
        body {
            font-family: "JetBrains Mono", monospace;
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px;
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            flex-direction: column;
        }
        .container {
            max-width: 600px;
            margin: auto auto 40px auto;
            background: #ffffff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        h1 {
            color: #E4AB0F;
            font-weight: 700;
            font-size: 28px;
            margin-bottom: 20px;
        }
        p {
            font-size: 16px;
            font-weight: 400;
            line-height: 1.6;
            color: #555;
            margin-bottom: 20px;
        }
        .code {
            background: #f1f3f5;
            padding: 15px;
            border-radius: 8px;
            font-size: 24px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
            color: #E4AB0F;
            border: 1px solid #ddd;
            font-family: "JetBrains Mono", monospace;
        }
        .copy-button {
            display: inline-block;
            padding: 12px 20px;
            font-size: 16px;
            font-weight: 500;
            color: #ffffff;
            background-color: #025ADD;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            text-align: center;
            text-decoration: none;
            transition: background-color 0.3s ease;
            font-family: "JetBrains Mono", monospace;
        }
        .copy-button:hover {
            background-color: #0248b3;
        }
        a {
            color: #E4AB0F;
            text-decoration: none;
            font-weight: 500;
        }
        a:hover {
            text-decoration: underline;
        }
        .footer {
            font-size: 14px;
            color: #888;
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-family: "JetBrains Mono", monospace;
        }
    </style>
	</head>
	<body>
    <div class="container">
        <h1>Подтверждение вашей почты</h1>
        <p>Здравствуйте!</p>
        <p>Спасибо за регистрацию в каталоге фильмов PotatoRate. Чтобы завершить процесс, пожалуйста, подтвердите вашу почту, введя следующий код:</p>
        <div class="code" id="verificationCode">` + code + `</div>
        <p>Скопируйте код и вставьте его <a href="https://film-catalog-lilac.vercel.app/confirm-email">на сайте</a> для завершения регистрации.</p>
        <p>Если у вас возникли вопросы, не стесняйтесь обращаться в службу поддержки.</p>
    </div>
    <div class="footer">
        <p>&copy; 2024 PotatoRate. Все права защищены.</p>
    </div>
	</body>
	</html>`
	m.SetBody("text/html", body)
	if err := e.SmtpServer.DialAndSend(m); err != nil {
		return err
	}
	return nil
}
