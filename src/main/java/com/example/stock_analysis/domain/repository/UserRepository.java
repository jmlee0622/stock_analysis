package com.example.stock_analysis.domain.repository;

import com.example.stock_analysis.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/** users 테이블에 대한 JPA 리포지토리 - username으로 유저 조회 제공 */
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
}
