package org.example.miniproject.service;

import org.example.miniproject.model.User;
import org.example.miniproject.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // ✅ Register User
    public User register(User user) {
        return userRepository.save(user);
    }

    // ✅ Find by Email
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}