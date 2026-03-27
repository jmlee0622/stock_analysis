package com.example.stock_analysis.news;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

/** HuggingFace FinBERT를 사용해 뉴스 헤드라인의 감성을 분석하는 서비스 (무료) */
@Service
@Slf4j
public class SentimentAnalysisService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${huggingface.api-key}")
    private String apiKey;

    private static final String FINBERT_URL =
            "https://router.huggingface.co/hf-inference/models/ProsusAI/finbert";

    // FinBERT 최대 입력 길이 (토큰 기준 512 ≈ 문자 1000자)
    private static final int MAX_INPUT_LENGTH = 1000;

    @SuppressWarnings("unchecked")
    public SentimentResult analyze(String headline, String summary) {
        try {
            // 입력 텍스트 조합 및 길이 제한
            String input = headline + (summary != null ? " " + summary : "");
            if (input.length() > MAX_INPUT_LENGTH) {
                input = input.substring(0, MAX_INPUT_LENGTH);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request =
                    new HttpEntity<>(Map.of("inputs", input), headers);

            // 응답 형식: [[{"label": "positive", "score": 0.99}, ...]]
            var response = restTemplate.exchange(
                    FINBERT_URL, HttpMethod.POST, request, List.class);

            List<List<Map<String, Object>>> result =
                    (List<List<Map<String, Object>>>) response.getBody();

            Map<String, Object> best = result.get(0).stream()
                    .max(Comparator.comparingDouble(m -> ((Number) m.get("score")).doubleValue()))
                    .orElseThrow();

            String label  = ((String) best.get("label")).toUpperCase();
            double score  = ((Number) best.get("score")).doubleValue();
            String reason = String.format("FinBERT 신뢰도 %.1f%%", score * 100);

            log.debug("감성 분석 완료 - [{}] {:.1f}% {}", label, score * 100, headline);
            return new SentimentResult(label, reason);

        } catch (Exception e) {
            log.error("감성 분석 실패 - 제목: {}, 오류: {}", headline, e.getMessage());
            return new SentimentResult("NEUTRAL", "분석 실패");
        }
    }
}
