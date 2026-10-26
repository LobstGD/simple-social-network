package com.example.artmix.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record UserRequest(
        @NotEmpty(message = "Email can't be empty")
        @Email(message = "Invalid email")
        String email,

        @NotEmpty(message = "Password can't be empty")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        @NotEmpty(message = "Username can't be empty")
        String username
) {
}
