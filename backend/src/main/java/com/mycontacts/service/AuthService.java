package com.mycontacts.service;

import com.mycontacts.dto.LoginRequest;
import com.mycontacts.dto.SignupRequest;
import com.mycontacts.dto.AuthResponse;
import com.mycontacts.entity.User;
import com.mycontacts.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Handles user registration, login (session creation), and logout.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    /**
     * Register a new user. Checks for duplicate email/username.
     */
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);
        return new AuthResponse("Registration successful", user.getUsername(), user.getEmail());
    }

    /**
     * Authenticate and create an HTTP session. Stores user ID in session.
     */
    public AuthResponse login(LoginRequest request, HttpSession session) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Store user info in session for easy retrieval
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
            session.setAttribute("userId", user.getId());
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

            return new AuthResponse("Login successful", user.getUsername(), user.getEmail());
        } catch (org.springframework.security.authentication.BadCredentialsException ex) {
            throw new IllegalArgumentException("Incorrect password. Please try again.");
        }
        // Let other exceptions bubble up for global handler
    }

    /**
     * Invalidate the current session.
     */
    public void logout(HttpSession session) {
        session.invalidate();
        SecurityContextHolder.clearContext();
    }

    /**
     * Get the currently authenticated user from the session.
     */
    public User getCurrentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            throw new IllegalArgumentException("No active session. Please log in.");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
