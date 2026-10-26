package com.example.artmix.mapper;

import com.example.artmix.dto.PostRequest;
import com.example.artmix.dto.PostResponse;
import com.example.artmix.dto.UserRequest;
import com.example.artmix.dto.UserResponse;
import com.example.artmix.model.Posts;
import com.example.artmix.model.Users;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PostMapper {

    public Posts toEntity(PostRequest request, Users author) {

        Posts posts = new Posts();

        posts.setAuthor(author);
        posts.setTitle(request.title());
        posts.setContent(request.content());
        posts.setCreatedAt(LocalDateTime.now());

        return posts;
    }

    public PostResponse toResponse(Posts posts) {
        return new PostResponse(
                posts.getTitle(),
                posts.getContent(),
                posts.getAuthor().getUsername(),
                posts.getId()
        );
    }
}
