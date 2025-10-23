package com.example.artmix.service;

import com.example.artmix.dto.UserDTO;
import com.example.artmix.exception.ResourceNotFoundException;
import com.example.artmix.mapper.UserDTOMapper;
import com.example.artmix.model.Users;
import com.example.artmix.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    @Autowired
    AuthenticationManager authManager;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private UserDTOMapper mapper;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public Users register(Users user){
        user.setPassword(encoder.encode(user.getPassword()));
        return repository.save(user);
    }

    public String verify(Users user) {
        Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
        );

        if (authentication.isAuthenticated()){
            return jwtService.generateToken(user.getUsername());
        } else {
            return "fail";
        }
    }

    public List<UserDTO> getAllUsers(){
        return repository.findAll()
                .stream()
                .map(mapper).collect(Collectors.toList());
    }

    public Users updateUser(Long id, Users updatedUsers){
        Users users = repository.findById(id).orElseThrow(() ->
               new ResourceNotFoundException("There is not such user with given id" + id));

        users.setUsername(updatedUsers.getUsername());
        users.setEmail(updatedUsers.getEmail());

        Users updatedUsersObj = repository.save(users);
        return updatedUsersObj;
    }

    public void deleteUser(Long id) {
        repository.deleteById(id);
    }
}
