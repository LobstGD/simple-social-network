package com.example.artmix.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

public record PostResponse(
        String title,
        String content,
        String authorName,
        Long id
) {
}
