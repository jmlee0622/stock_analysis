package com.example.stock_analysis.config;

import com.example.stock_analysis.auth.JwtFilter;
import com.example.stock_analysis.auth.oauth2.CustomOAuth2UserService;
import com.example.stock_analysis.auth.oauth2.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Spring Security 설정
 *
 * - 일반 API 요청: JWT 필터로 인증 (Stateless)
 * - 소셜 로그인 요청: OAuth2 흐름 (임시 세션 사용 → 완료 후 JWT 발급 → Stateless로 전환)
 *
 * OAuth2 흐름에서 임시 세션이 필요한 이유:
 *   OAuth2는 CSRF 방어를 위해 state 파라미터를 사용하는데,
 *   이 값을 요청-응답 사이에 저장하려면 짧은 세션이 필요합니다.
 *   로그인 완료 후에는 JWT만 사용하므로 실질적으로는 무상태입니다.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final CorsConfigurationSource corsConfigurationSource;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            // OAuth2 흐름 중에는 세션이 필요하므로 IF_REQUIRED로 변경
            // (완전 STATELESS이면 OAuth2 state 파라미터를 저장할 수 없음)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/oauth2/**").permitAll()        // OAuth2 시작 URL
                .requestMatchers("/login/oauth2/**").permitAll()  // OAuth2 콜백 URL
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/api/stocks/**").permitAll()
                .requestMatchers("/api/trades/**").permitAll()
                .requestMatchers("/api/news/**").permitAll()
                .anyRequest().authenticated()
            )
            // OAuth2 소셜 로그인 설정
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService))  // 사용자 정보 처리 서비스
                .successHandler(oAuth2SuccessHandler)       // 성공 시 JWT 발급 + 리다이렉트
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
