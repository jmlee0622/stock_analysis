package com.example.stock_analysis.domain.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * users 테이블과 매핑되는 유저 엔티티
 *
 * provider   : 로그인 방식 (local / google / naver)
 * providerId : 소셜 제공자가 부여한 고유 ID (소셜 로그인 유저만 사용)
 * password   : 일반 로그인 유저만 사용, 소셜 로그인 유저는 null
 */
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = true)   // 소셜 로그인 유저는 비밀번호 없음
    private String password;

    @Column(nullable = false)
    private String provider = "local";   // local / google / naver

    @Column
    private String providerId;           // 소셜에서 발급된 고유 ID

    @Builder
    public User(String username, String password, String provider, String providerId) {
        this.username = username;
        this.password = password;
        this.provider = (provider != null) ? provider : "local";
        this.providerId = providerId;
    }
}
