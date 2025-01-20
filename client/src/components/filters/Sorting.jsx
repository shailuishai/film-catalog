import React from "react";
import { Flex, Select, IconButton } from "@chakra-ui/react";
import { ArrowUpIcon, ArrowDownIcon } from "@chakra-ui/icons";

const Sorting = ({ sortBy, order, onSortChange, onOrderToggle }) => {
    return (
        <Flex align="center" justify="space-between">
            <Select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                flex="1"
                mr={2}
            >
                <option value="">Без сортировки</option>
                <option value="avg_rating">По рейтингу</option>
                <option value="release_date">По дате выхода</option>
                <option value="runtime">По длительности</option>
            </Select>
            <IconButton
                aria-label="Toggle sort order"
                icon={order === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />}
                onClick={onOrderToggle}
                size="sm"
                isDisabled={!sortBy}
            />
        </Flex>
    );
};

export default Sorting;