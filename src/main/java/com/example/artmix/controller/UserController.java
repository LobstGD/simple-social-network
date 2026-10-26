package com.example.artmix.controller;

import com.example.artmix.dto.UserRequest;
import com.example.artmix.dto.UserResponse;
import com.example.artmix.model.Users;
import com.example.artmix.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping()
public class UserController {
    
    @Autowired
    private UserService service;
    
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers(){
        return ResponseEntity.ok(service.getAllUsers());
    }
    
    @PostMapping("/register")
    public ResponseEntity<UserResponse> userResponse(
            @Valid @RequestBody UserRequest userRequest
    ) {
        UserResponse response = service.register(userRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<String> verify(
            @Valid @RequestBody UserRequest userRequest
    ) {
        String token = service.verify(userRequest);
        return ResponseEntity.ok(token);
    }

    @PutMapping("/update/{id}")
    public UserResponse updateUser(@PathVariable Long id,
                            @RequestBody UserRequest updatedUsers){
        return service.updateUser(id, updatedUsers);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteUser(@PathVariable Long id){
        service.deleteUser(id);
    }
}
