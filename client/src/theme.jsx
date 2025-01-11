import { extendTheme } from "@chakra-ui/react";


const config = {
    initialColorMode: "system",
    useSystemColorMode: true,
};

const theme = extendTheme({
    // Цветовая палитра
    colors: {
        brand: {
            50: "#f0f0f0",
            100: "#d9d9d9",
            200: "#c2c2c2",
            300: "#ababab",
            400: "#949494",
            500: "#7d7d7d",
            600: "#666666",
            700: "#4f4f4f",
            800: "#383838",
            900: "#262626",
        },
        accent: {
            400: "#E4AB0F",
        },
    },

    fonts: {
        body: "JetBrains Mono, monospace",
        heading: "JetBrains Mono, monospace",
        mono: "JetBrains Mono, monospace",
    },

    fontSizes: {
        xs: "0.75rem", // 12px
        sm: "0.875rem", // 14px
        md: "1rem", // 16px
        lg: "1.125rem", // 18px
        xl: "1.25rem", // 20px
        "2xl": "1.5rem", // 24px
        "3xl": "1.875rem", // 30px
        "4xl": "2.25rem", // 36px
        "5xl": "3rem", // 48px
        "6xl": "4rem", // 64px
    },

    radii: {
        none: "0",
        sm: "4px",
        md: "8px",
        lg: "12px",
        full: "9999px",
    },

    // Размеры для отступов и padding/margin
    space: {
        px: "1px",
        0.5: "0.125rem", // 2px
        1: "0.25rem", // 4px
        1.5: "0.375rem", // 6px
        2: "0.5rem", // 8px
        2.5: "0.625rem", // 10px
        3: "0.75rem", // 12px
        3.5: "0.875rem", // 14px
        4: "1rem", // 16px
        5: "1.25rem", // 20px
        6: "1.5rem", // 24px
        7: "1.75rem", // 28px
        8: "2rem", // 32px
        9: "2.25rem", // 36px
        10: "2.5rem", // 40px
        12: "3rem", // 48px
        14: "3.5rem", // 56px
        16: "4rem", // 64px
        20: "5rem", // 80px
        24: "6rem", // 96px
        28: "7rem", // 112px
        32: "8rem", // 128px
        36: "9rem", // 144px
        40: "10rem", // 160px
        44: "11rem", // 176px
        48: "12rem", // 192px
        52: "13rem", // 208px
        56: "14rem", // 224px
        60: "15rem", // 240px
        64: "16rem", // 256px
        72: "18rem", // 288px
        80: "20rem", // 320px
        96: "24rem", // 384px
    },

    // Размеры для компонентов (например, кнопок, карточек)
    sizes: {
        container: {
            sm: "640px",
            md: "768px",
            lg: "1024px",
            xl: "1280px",
        },
    },

    // Стили для компонентов
    components: {
        Button: {
            // Базовая стилизация для всех кнопок
            baseStyle: {
                fontWeight: "bold", // Жирный текст
                borderRadius: "md", // Скругленные углы (8px)
            },
            // Варианты кнопок
            variants: {
                solid: {
                    bg: "brand.900", // Основной цвет (темный)
                    color: "white", // Белый текст
                    _hover: {
                        bg: "brand.800", // Темнее при наведении
                    },
                },
                outline: {
                    border: "2px solid",
                    borderColor: "brand.900", // Основной цвет для границы
                    color: "brand.900", // Основной цвет для текста
                    _hover: {
                        bg: "brand.50", // Светлый фон при наведении
                    },
                },
            },
        },
        Input: {
            // Стили для полей ввода
            baseStyle: {
                field: {
                    borderRadius: "md", // Скругленные углы (8px)
                    _focus: {
                        borderColor: "brand.900", // Основной цвет при фокусе
                        boxShadow: "0 0 0 1px brand.900", // Тонкая обводка
                    },
                },
            },
        },
        Card: {
            // Стили для карточек (если используете компонент Card)
            baseStyle: {
                borderRadius: "md", // Скругленные углы (8px)
                boxShadow: "md", // Тень для карточек
            },
        },
        Link: {
            baseStyle: {
                _activeLink: {
                    bg: "rgba(255, 165, 0, 0.1)",
                    color: "accent.400",
                },
            },
        },
    },

    // Глобальные стили
    styles: {
        global: (props) => ({
            body: {
                bg: props.colorMode === "dark" ? "brand.900" : "white", // Темный фон для темной темы, светлый для светлой
                color: props.colorMode === "dark" ? "white" : "brand.900", // Белый текст для темной темы, темный для светлой
            },
            a: {
                color: props.colorMode === "dark" ? "brand.500" : "brand.700", // Цвет ссылок в зависимости от темы
                _hover: {
                    textDecoration: "underline", // Подчеркивание при наведении
                },
            },
        }),
    },
});

export default theme;