package com.example.artmix.controller;

import com.example.artmix.dto.PostResponse;
import com.example.artmix.dto.PostRequest;
import com.example.artmix.model.Posts;
import com.example.artmix.repository.PostRepository;
import com.example.artmix.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping("/create")
    public PostResponse createPost(
            @RequestBody PostRequest postRequest,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        return postService.createPost(postRequest, token);
    }

    @PutMapping("/update/{postId}")
    public PostResponse updatePost(@PathVariable Long postId,
                            @RequestBody PostRequest newPostData,
                            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        return postService.updatePost(postId, newPostData, token);
    }

    @DeleteMapping("/delete/{postId}")
    public void deletePost(@PathVariable Long postId,
                           @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        postService.deletePost(postId, token);
    }

    @GetMapping("/{postId}")
    public PostResponse getPostById(@PathVariable Long postId){
        return postService.getPostById(postId);
    }

    @GetMapping("/feed")
    public List<PostResponse> getAllPosts() {
        return postService.getAllPosts();
    }
}
