package com.example.artmix.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PostResponse {
    private String title;
    private String content;
    private String author;
    private Long id;

    public PostResponse(String title, String content, String author, Long id) {
        this.title = title;
        this.content = content;
        this.author = author;
        this.id = id;
    }

}
