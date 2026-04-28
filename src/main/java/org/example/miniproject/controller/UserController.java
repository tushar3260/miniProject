package org.example.miniproject.controller;

import org.example.miniproject.model.User;
import org.example.miniproject.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    // ✅ Register User
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.register(user);
    }
}