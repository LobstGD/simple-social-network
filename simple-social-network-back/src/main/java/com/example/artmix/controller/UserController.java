package com.example.artmix.controller;

import com.example.artmix.dto.UserDTO;
import com.example.artmix.model.Users;
import com.example.artmix.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping()
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    
    @Autowired
    private UserService service;
    
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers(){
        return ResponseEntity.ok(service.getAllUsers());
    }
    
    @PostMapping("/register")
    public Users register(@RequestBody Users users){
        return service.register(users);
    }

    @PostMapping("/login")
    public String login(@RequestBody Users user){
        return service.verify(user);
    }

    @PutMapping("/update/{id}")
    public Users updateUser(@PathVariable Long id,
                            @RequestBody Users updatedUsers){
        return service.updateUser(id, updatedUsers);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteUser(@PathVariable Long id){
        service.deleteUser(id);
    }
}
