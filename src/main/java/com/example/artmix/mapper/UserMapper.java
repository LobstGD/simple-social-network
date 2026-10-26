package com.example.artmix.mapper;

import com.example.artmix.dto.UserRequest;
import com.example.artmix.dto.UserResponse;
import com.example.artmix.model.Users;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserMapper {
    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public Users toEntity(UserRequest request) {

        Users user = new Users();

        user.setEmail(request.email());
        user.setPassword(encoder.encode(request.password()));
        user.setUsername(request.username());

        return user;
    }

    public UserResponse toResponse(Users user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getUsername()
        );
    }
}
