package com.example.artmix.service;

import com.example.artmix.exception.ResourceNotFoundException;
import com.example.artmix.exception.UnauthorizedActionException;
import com.example.artmix.exception.UserIdNotFoundException;
import com.example.artmix.model.PostRequest;
import com.example.artmix.model.Posts;
import com.example.artmix.model.Users;
import com.example.artmix.repository.PostRepository;
import com.example.artmix.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {

    @Autowired
    private JWTService jwtService;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    public Posts createPost(PostRequest postRequest, String token){
        String username = jwtService.extractUsername(token);

        Users author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Posts post = new Posts();
        post.setTitle(postRequest.getTitle());
        post.setContent(postRequest.getContent());
        post.setAuthor(author);

        return postRepository.save(post);
    }

    @Transactional
    public Posts updatePost(Long postId, PostRequest newPostData, String token) {
        String username = jwtService.extractUsername(token);

        Users author = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserIdNotFoundException("User with username " + username + " not found"));

        Posts existingPost = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post with id " + postId + " not found"));

        if (!existingPost.getAuthor().getUsername().equals(author.getUsername())) {
            throw new UnauthorizedActionException("You can update only your own posts");
        }

        existingPost.setTitle(newPostData.getTitle());
        existingPost.setContent(newPostData.getContent());

        return postRepository.save(existingPost);
    }

    public void deletePost(Long postId, String token) {

        String username = jwtService.extractUsername(token);

        Users author = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserIdNotFoundException("User with username " + username + " not found"));

        Posts existingPost = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post with id " + postId + " not found"));

        if(!existingPost.getAuthor().getUsername().equals(author.getUsername())){
            throw new UnauthorizedActionException("You can delete only your own posts");
        }
        postRepository.delete(existingPost);
    }

    public Posts getPostById(Long postId){
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post with id " + postId + " not found"));
    }

    public List<Posts> getAllPosts(){
        return postRepository.findAllByOrderByCreatedAtDesc();
    }
}
