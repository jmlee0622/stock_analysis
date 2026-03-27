package com.example.stock_analysis.auth.oauth2;

import com.example.stock_analysis.auth.JwtUtil;
import com.example.stock_analysis.domain.entity.User;
import com.example.stock_analysis.domain.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * OAuth2 로그인 성공 후 처리 핸들러
 *
 * 흐름:
 *   1) Spring Security가 소셜 로그인 완료 후 이 핸들러를 호출
 *   2) OAuth2User에서 소셜 제공자와 고유 ID를 꺼냄
 *   3) DB에서 해당 유저의 username을 조회
 *   4) JWT 토큰 발급
 *   5) 프론트엔드로 리다이렉트 (URL에 token, username 파라미터 포함)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    // 로그인 성공 후 리다이렉트할 프론트엔드 주소 (application.yml에서 설정 가능)
    @Value("${oauth2.redirect-uri:http://localhost:5173}")
    private String frontendRedirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // 어떤 소셜 제공자인지 확인
        String provider = extractProvider(request);

        // 소셜 고유 ID 추출 (Google: sub, Naver: response.id)
        String providerId = extractProviderId(provider, oAuth2User);

        // DB에서 유저 조회 (CustomOAuth2UserService에서 이미 저장했으므로 반드시 존재)
        User user = userRepository.findByProviderAndProviderId(provider, providerId)
                .orElseThrow(() -> new IllegalStateException("OAuth2 유저를 DB에서 찾을 수 없음"));

        // JWT 발급
        String token = jwtUtil.generateToken(user.getUsername());

        log.info("OAuth2 로그인 성공 - username: {}, provider: {}", user.getUsername(), provider);

        // 프론트엔드로 리다이렉트 (token과 username을 URL 파라미터로 전달)
        String redirectUrl = frontendRedirectUri
                + "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8)
                + "&username=" + URLEncoder.encode(user.getUsername(), StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }

    /** 요청 URL 경로에서 provider 이름 추출 (예: /login/oauth2/code/google → google) */
    private String extractProvider(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String[] parts = uri.split("/");
        return parts[parts.length - 1];  // 마지막 부분이 provider 이름
    }

    @SuppressWarnings("unchecked")
    private String extractProviderId(String provider, OAuth2User oAuth2User) {
        return switch (provider) {
            case "google" -> (String) oAuth2User.getAttributes().get("sub");
            case "naver" -> {
                var responseMap = (java.util.Map<String, Object>) oAuth2User.getAttributes().get("response");
                yield (String) responseMap.get("id");
            }
            default -> throw new IllegalArgumentException("알 수 없는 provider: " + provider);
        };
    }
}
