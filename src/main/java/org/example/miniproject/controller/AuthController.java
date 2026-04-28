package org.example.miniproject.controller;

import org.example.miniproject.dto.LoginRequest;
import org.example.miniproject.model.User;
import org.example.miniproject.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.register(user);
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {

        User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(user.getPassword().equals(request.getPassword())) {
            return "Login Success";
        }

        throw new RuntimeException("Invalid Password");
    }
}