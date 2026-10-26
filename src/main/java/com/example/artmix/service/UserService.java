package com.example.artmix.service;

import com.example.artmix.dto.UserRequest;
import com.example.artmix.dto.UserResponse;
import com.example.artmix.exception.EmailAlreadyExistsException;
import com.example.artmix.exception.ResourceNotFoundException;
import com.example.artmix.exception.UsernameAlreadyExistsException;
import com.example.artmix.mapper.UserMapper;
import com.example.artmix.model.Users;
import com.example.artmix.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserService {

    private final UserRepository repository;
    private final AuthenticationManager authManager;
    private final JWTService jwtService;
    private final UserMapper mapper;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public UserResponse register(UserRequest request){

        if (repository.existsByUsername(request.username())){
            throw new UsernameAlreadyExistsException("Username already exist!");
        }

        Users user = new Users();

        user.setEmail(request.email());
        user.setPassword(encoder.encode(request.password()));
        user.setUsername(request.username());

        Users savedUser = repository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getUsername()
        );
    }

    public String verify(UserRequest request) {
        Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        if (authentication.isAuthenticated()){
            return jwtService.generateToken(request.username());
        } else {
            return "fail";
        }
    }

    public List<UserResponse> getAllUsers(){
        return repository.findAll()
                .stream()
                .map(mapper::toResponse).collect(Collectors.toList());
    }

    public UserResponse updateUser(Long id, UserRequest request){
        Users users = repository.findById(id).orElseThrow(() ->
               new ResourceNotFoundException("There is not such user with given id" + id));

        users.setUsername(request.username());
        users.setEmail(request.email());

        Users updatedUsersObj = repository.save(users);
        return mapper.toResponse(
                updatedUsersObj
        );
    }

    public void deleteUser(Long id) {
        repository.deleteById(id);
    }
}
