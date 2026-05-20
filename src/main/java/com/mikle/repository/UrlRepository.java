package com.mikle.repository;

import com.mikle.model.Url;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface UrlRepository extends JpaRepository<Url, Long> {
    Optional<Url> findByShortUrl(String shortUrl);
    List<Url> findByUserId(Long userId);

    @Modifying
    @Transactional
    void deleteById(Long urlId);

    @Modifying
    @Transactional
    void deleteByUserId(Long userId);

    @Query("SELECT u.shortUrl FROM Url u")
    List<String> findAllShortUrls();
}