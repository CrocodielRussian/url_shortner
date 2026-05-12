package com.mikle.controller;


import com.mikle.model.Url;
import com.mikle.service.UrlService;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;




@RestController
@RequestMapping("/api/url")
public class UrlController {
    @Autowired
    private UrlService urlService;

    @Getter
    static private class UrlRequest {
        private String url;
    }

    @PostMapping
    public ResponseEntity<Url> addUrl(@RequestBody UrlRequest request) {
        try {
            Url shortUrl = urlService.addUrl(request.getUrl());
            return ResponseEntity.ok(shortUrl);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}

