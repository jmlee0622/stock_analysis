package com.example.stock_analysis.auth.oauth2;

import com.example.stock_analysis.domain.entity.User;
import com.example.stock_analysis.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * 소셜 로그인 콜백 후 사용자 정보를 처리하는 서비스
 *
 * 흐름:
 *   1) 구글/네이버로부터 액세스 토큰을 받은 뒤 Spring Security가 이 클래스를 호출
 *   2) 소셜에서 받은 사용자 정보(이메일, 고유ID 등)를 파싱
 *   3) DB에서 해당 유저 조회 → 없으면 자동 회원가입
 *   4) 이후 OAuth2SuccessHandler에서 JWT 발급
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 부모 클래스가 소셜 API를 호출해서 사용자 정보를 가져옴
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 어떤 소셜 서비스인지 확인 (google 또는 naver)
        String provider = userRequest.getClientRegistration().getRegistrationId();

        // 제공자별로 사용자 정보 파싱
        OAuthAttributes attributes = OAuthAttributes.of(provider, oAuth2User.getAttributes());

        log.info("OAuth2 로그인 - provider: {}, email: {}", provider, attributes.email());

        // DB에서 기존 유저 조회, 없으면 새로 저장 (자동 회원가입)
        saveOrUpdateUser(provider, attributes);

        return oAuth2User;
    }

    private void saveOrUpdateUser(String provider, OAuthAttributes attributes) {
        userRepository.findByProviderAndProviderId(provider, attributes.providerId())
                .orElseGet(() -> {
                    // 이메일이 없는 경우 provider+id로 username 생성
                    String username = (attributes.email() != null && !attributes.email().isBlank())
                            ? attributes.email()
                            : provider + "_" + attributes.providerId();

                    log.info("소셜 로그인 최초 가입 - username: {}", username);

                    User newUser = User.builder()
                            .username(username)
                            .password(null)          // 소셜 로그인은 비밀번호 없음
                            .provider(provider)
                            .providerId(attributes.providerId())
                            .build();

                    return userRepository.save(newUser);
                });
    }

    /**
     * 소셜 제공자별로 응답 구조가 다르기 때문에 파싱을 통일하는 레코드
     *
     * Google 응답: { "sub": "1234...", "email": "user@gmail.com", "name": "홍길동" }
     * Naver 응답:  { "response": { "id": "abc", "email": "user@naver.com", "name": "홍길동" } }
     *               → application.yml에서 user-name-attribute: response 설정 덕분에
     *                 attributes.get("response")가 내부 Map을 반환함
     */
    public record OAuthAttributes(String providerId, String email, String name) {

        @SuppressWarnings("unchecked")
        public static OAuthAttributes of(String provider, Map<String, Object> attributes) {
            return switch (provider) {
                case "google" -> new OAuthAttributes(
                        (String) attributes.get("sub"),    // 구글 고유 ID
                        (String) attributes.get("email"),
                        (String) attributes.get("name")
                );
                case "naver" -> {
                    // 네이버는 응답이 { response: { id, email, name } } 형태로 중첩됨
                    Map<String, Object> response = (Map<String, Object>) attributes.get("response");
                    yield new OAuthAttributes(
                            (String) response.get("id"),
                            (String) response.get("email"),
                            (String) response.get("name")
                    );
                }
                default -> throw new OAuth2AuthenticationException("지원하지 않는 소셜 로그인: " + provider);
            };
        }
    }
}
