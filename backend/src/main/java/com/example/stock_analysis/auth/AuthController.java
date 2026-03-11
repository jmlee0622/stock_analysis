package com.example.stock_analysis.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** 회원가입 및 로그인 REST API 엔드포인트 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /auth/register
    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestParam String username,
            @RequestParam String password) {
        authService.register(username, password);
        return ResponseEntity.ok("회원가입 완료");
    }

    // POST /auth/login → JWT 토큰 반환
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestParam String username,
            @RequestParam String password) {
        String token = authService.login(username, password);
        return ResponseEntity.ok(Map.of("token", token));
    }
}
