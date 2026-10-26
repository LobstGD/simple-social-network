package com.example.artmix.service;

import com.example.artmix.dto.PostResponse;
import com.example.artmix.exception.ResourceNotFoundException;
import com.example.artmix.exception.UnauthorizedActionException;
import com.example.artmix.exception.UserIdNotFoundException;
import com.example.artmix.dto.PostRequest;
import com.example.artmix.mapper.PostMapper;
import com.example.artmix.model.Posts;
import com.example.artmix.model.Users;
import com.example.artmix.repository.PostRepository;
import com.example.artmix.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class PostService {

    private final JWTService jwtService;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostMapper mapper;

    public PostResponse createPost(PostRequest postRequest, String token){
        String username = jwtService.extractUsername(token);

        Users author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Posts post = new Posts();
        post.setTitle(postRequest.title());
        post.setContent(postRequest.content());
        post.setAuthor(author);

        return mapper.toResponse(postRepository.save(post));
    }

    @Transactional(rollbackOn = Exception.class)
    public PostResponse updatePost(Long postId, PostRequest newPostData, String token) {
        String username = jwtService.extractUsername(token);

        Users author = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserIdNotFoundException("User with username " + username + " not found"));

        Posts existingPost = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post with id " + postId + " not found"));

        if (!existingPost.getAuthor().getUsername().equals(author.getUsername())) {
            throw new UnauthorizedActionException("You can update only your own posts");
        }

        existingPost.setTitle(newPostData.title());
        existingPost.setContent(newPostData.content());

        return mapper.toResponse(postRepository.save(existingPost));
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

    public PostResponse getPostById(Long postId){
        return mapper.toResponse(postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post with id " + postId + " not found")));
    }

    public List<PostResponse> getAllPosts(){
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }
}
