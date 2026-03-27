package com.example.stock_analysis.domain.repository;

import com.example.stock_analysis.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/** users 테이블에 대한 JPA 리포지토리 */
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    // 소셜 로그인용: 어떤 제공자(google/naver)의 어떤 ID인지로 유저 조회
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
}
