package com.mikle.service;

import com.google.common.hash.BloomFilter;
import com.google.common.hash.Funnels;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.mikle.repository.UrlRepository;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class BloomFilterService {

    private final UrlRepository urlRepository;

    private BloomFilter<String> bloomFilter;

    @PostConstruct
    public void init() {
        bloomFilter = BloomFilter.create(
                Funnels.stringFunnel(StandardCharsets.UTF_8),
                100_000,
                0.01
        );

        urlRepository.findAllShortUrls().forEach(bloomFilter::put);
    }

    public boolean mightExist(String shortUrl) {
        return bloomFilter.mightContain(shortUrl);
    }

    public void add(String shortUrl) {
        bloomFilter.put(shortUrl);
    }
}