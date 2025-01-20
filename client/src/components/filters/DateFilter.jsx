import React from "react";
import { VStack, HStack, Text, Input } from "@chakra-ui/react";

const DateFilter = ({ minDate, maxDate, onDateChange }) => {
    return (
        <VStack spacing={2} align="stretch">
            <Text>Дата выхода</Text>
            <HStack>
                <Text>От</Text>
                <Input
                    type="date"
                    value={minDate}
                    onChange={(e) => onDateChange([e.target.value, maxDate])}
                />
            </HStack>
            <HStack>
                <Text>До</Text>
                <Input
                    type="date"
                    value={maxDate}
                    onChange={(e) => onDateChange([minDate, e.target.value])}
                />
            </HStack>
        </VStack>
    );
};

export default DateFilter;