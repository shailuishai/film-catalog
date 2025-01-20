import React from "react";
import { VStack, HStack, Text, Input, RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb } from "@chakra-ui/react";

const DurationFilter = ({ minDuration, maxDuration, onDurationChange }) => {
    return (
        <VStack spacing={2} align="stretch">
            <Text>Длительность</Text>
            <HStack>
                <Text>От</Text>
                <Input
                    value={minDuration}
                    onChange={(e) => onDurationChange([Number(e.target.value), maxDuration])}
                />
                <Text>До</Text>
                <Input
                    value={maxDuration}
                    onChange={(e) => onDurationChange([minDuration, Number(e.target.value)])}
                />
            </HStack>
            <RangeSlider
                min={0}
                max={300}
                value={[minDuration, maxDuration]}
                onChange={onDurationChange}
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

export default DurationFilter;