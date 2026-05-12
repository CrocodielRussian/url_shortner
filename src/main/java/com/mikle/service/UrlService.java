package com.mikle.service;

import com.mikle.model.Url;
import com.mikle.model.User;
import com.mikle.repository.UrlRepository;
import com.mikle.repository.UserRepository;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;

@Getter
@Setter
@Service
public class UrlService {
    @Autowired
    private final UrlRepository urlRepository;

    @Autowired
    private UserRepository userRepository;

    public UrlService(UrlRepository repo) {
        this.urlRepository = repo;
    }

    @Transactional
    public Url addUrl(String url) {
        User user = getCurrentUser();

        System.out.println("Principal: " + user);
        Url shortUrl = new Url();
        shortUrl.setUser(user);

        return urlRepository.save(shortUrl);
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        switch (principal) {
            case User user -> {
                return user;
            }
            case org.springframework.security.core.userdetails.User user -> {
                String username = user.getUsername();
                return userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found: " + username));
            }
            case String s -> {
                return userRepository.findByUsername(s)
                        .orElseThrow(() -> new RuntimeException("User not found: " + principal));
            }
            default -> throw new RuntimeException("Unknown principal type: " + principal.getClass().getName());
        }
    }

}
