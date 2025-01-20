import React from "react";
import { Box, Text, useColorModeValue } from "@chakra-ui/react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

const RatingDistributionChart = ({ data }) => {
    const chartData = [
        { subject: "от 0 до 20", A: data.count_ratings_0_20, fullMark: data.total_reviews },
        { subject: "от 21 до 40", A: data.count_ratings_21_40, fullMark: data.total_reviews },
        { subject: "от 41 до 60", A: data.count_ratings_41_60, fullMark: data.total_reviews },
        { subject: "от 61 до 80", A: data.count_ratings_61_80, fullMark: data.total_reviews },
        { subject: "от 81 до 100", A: data.count_ratings_81_100, fullMark: data.total_reviews },
    ];

    const bgColor = useColorModeValue("white", "brand.900");
    const textColor = useColorModeValue("brand.900", "white");
    const borderColor = useColorModeValue("gray.200", "brand.800");

    return (
        <Box width="100%" height={{ base: "300px", md: "400px" }} mt={6} borderRadius="md" borderWidth="2px" borderColor={borderColor}>
            <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center">
                Распределение отзывов по рейтингам
            </Text>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={150} data={chartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <Radar
                        name="Отзывы"
                        dataKey="A"
                        stroke="#E4AB0F"
                        fill="#E4AB0F"
                        fillOpacity={0.6}
                    />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const percentage = ((payload[0].value / data.total_reviews) * 100).toFixed(2);
                                return (
                                    <Box
                                        bg={bgColor}
                                        p={2}
                                        borderRadius="md" borderWidth="2px" borderColor={borderColor}
                                    >
                                        <Text>{`${payload[0].payload.subject}: ${payload[0].value}`}</Text>
                                        <Text>{`${percentage}% от всех отзывов`}</Text>
                                    </Box>
                                );
                            }
                            return null;
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default RatingDistributionChart;