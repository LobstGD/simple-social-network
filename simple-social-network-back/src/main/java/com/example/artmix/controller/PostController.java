package com.example.artmix.controller;

import com.example.artmix.dto.PostResponse;
import com.example.artmix.model.PostRequest;
import com.example.artmix.model.Posts;
import com.example.artmix.repository.PostRepository;
import com.example.artmix.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
@CrossOrigin(origins = "http://localhost:5173")
public class PostController {

    @Autowired
    private PostService postService;
    @Autowired
    private PostRepository postRepository;

    @PostMapping
    public PostResponse createPost(
            @RequestBody PostRequest postRequest,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        Posts post = postService.createPost(postRequest, token);

        return new PostResponse(post.getTitle(), post.getContent(), post.getAuthor().getUsername(), post.getId());
    }

    @PutMapping("{postId}")
    public PostResponse updatePost(@PathVariable Long postId,
                            @RequestBody PostRequest newPostData,
                            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        Posts post = postService.updatePost(postId, newPostData, token);

        return new PostResponse(post.getTitle(), post.getContent(), post.getAuthor().getUsername(), post.getId());
    }

    @DeleteMapping("{postId}")
    public void deletePost(@PathVariable Long postId,
                           @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        postService.deletePost(postId, token);
    }

    @GetMapping("{postId}")
    public PostResponse getPostById(@PathVariable Long postId){
        Posts post = postService.getPostById(postId);
        return new PostResponse(post.getTitle(), post.getContent(), post.getAuthor().getUsername(), post.getId());
    }

    @GetMapping("/feed")
    public List<PostResponse> getAllPosts() {
        List<Posts> posts = postRepository.findAllByOrderByCreatedAtDesc();

        return posts.stream()
                .map(p -> new PostResponse(
                        p.getTitle(),
                        p.getContent(),
                        p.getAuthor().getUsername(),
                        p.getId()
                ))
                .toList();
    }
}
