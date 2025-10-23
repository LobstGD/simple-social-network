package com.example.artmix.mapper;

import com.example.artmix.dto.UserDTO;
import com.example.artmix.model.Users;
import org.springframework.stereotype.Service;

import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class UserDTOMapper implements Function<Users, UserDTO> {
    @Override
    public UserDTO apply(Users user) {
        return new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getUsername());
    }
}
