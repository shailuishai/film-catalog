package lib

import (
	"strconv"
	"strings"
)

func StrToUintSlice(s string) ([]uint, error) {
	parts := strings.Split(s, ",")
	var result []uint
	for _, part := range parts {
		val, err := strconv.ParseUint(strings.TrimSpace(part), 10, 64)
		if err != nil {
			return nil, err
		}
		result = append(result, uint(val))
	}
	return result, nil
}
