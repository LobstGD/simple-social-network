package com.example.artmix.repository;

import com.example.artmix.model.Users;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Users, Long> {
    Optional<Users> findByUsername(String username);

    boolean existsByEmail(@NotEmpty(message = "Email can't be empty") @Email(message = "Invalid email") String email);

    boolean existsByUsername(@NotEmpty(message = "Email can't be empty") @Email(message = "Invalid email") String email);
}
