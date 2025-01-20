import React from "react";
import { VStack, HStack, Text, Input, RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb } from "@chakra-ui/react";

const RatingFilter = ({ minRating, maxRating, onRatingChange }) => {
    return (
        <VStack spacing={2} align="stretch">
            <Text>Рейтинг</Text>
            <HStack>
                <Text>От</Text>
                <Input
                    value={minRating}
                    onChange={(e) => onRatingChange([Number(e.target.value), maxRating])}
                />
                <Text>До</Text>
                <Input
                    value={maxRating}
                    onChange={(e) => onRatingChange([minRating, Number(e.target.value)])}
                />
            </HStack>
            <RangeSlider
                min={0}
                max={100}
                value={[minRating, maxRating]}
                onChange={onRatingChange}
            >
                <RangeSliderTrack>
                    <RangeSliderFilledTrack />
                </RangeSliderTrack>
                <RangeSliderThumb index={0} />
                <RangeSliderThumb index={1} />
            </RangeSlider>
        </VStack>
    );
};

export default RatingFilter;