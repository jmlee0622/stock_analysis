package com.example.stock_analysis.news;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.anthropic.AnthropicChatModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** LangChain4j를 통해 Claude API를 호출해 뉴스 헤드라인의 감성을 분석하는 서비스 */
@Service
@Slf4j
public class SentimentAnalysisService {

    private final AnthropicChatModel chatModel;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SentimentAnalysisService(
            @Value("${claude.api-key}") String apiKey,
            @Value("${claude.model}") String model) {

        this.chatModel = AnthropicChatModel.builder()
                .apiKey(apiKey)
                .modelName(model)
                .maxTokens(300)
                .build();
    }

    public SentimentResult analyze(String headline, String summary) {
        String prompt = """
                다음 암호화폐 관련 뉴스를 분석하고 아래 기준에 따라 감성을 판단해주세요.

                [판단 기준]
                POSITIVE: 가격 상승, 긍정적 전망, 규제 완화, 기관 채택, 신규 파트너십, 기술 발전
                NEGATIVE: 가격 하락, 규제 강화, 해킹 및 보안 사고, 시장 붕괴, 사기, 거래소 문제
                NEUTRAL: 중립적 시황 보도, 단순 가격 분석, 기술적 설명, 방향성 불명확

                제목: %s
                내용: %s

                반드시 아래 JSON 형식으로만 응답하세요. 다른 말은 하지 마세요:
                {"sentiment": "POSITIVE 또는 NEGATIVE 또는 NEUTRAL", "reason": "한 문장으로 이유"}
                """.formatted(headline, summary != null ? summary : "");

        try {
            String response = chatModel.generate(prompt);
            // Claude 응답에서 JSON 부분만 추출
            String json = extractJson(response);
            return objectMapper.readValue(json, SentimentResult.class);
        } catch (Exception e) {
            log.error("감성 분석 실패 - 제목: {}, 오류: {}", headline, e.getMessage());
            return new SentimentResult("NEUTRAL", "분석 실패");
        }
    }

    // 응답 문자열에서 { } 안의 JSON만 추출
    private String extractJson(String response) {
        int start = response.indexOf('{');
        int end = response.lastIndexOf('}');
        if (start != -1 && end != -1) {
            return response.substring(start, end + 1);
        }
        return response;
    }
}
