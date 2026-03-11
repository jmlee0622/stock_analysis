package com.example.stock_analysis.domain.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** users 테이블과 매핑되는 유저 엔티티 */
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

    @Column(nullable = false)
    private String password; // BCrypt 암호화된 비밀번호

    @Builder
    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }
}
