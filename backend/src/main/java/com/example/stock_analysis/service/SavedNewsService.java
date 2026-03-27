package com.example.stock_analysis.service;

import com.example.stock_analysis.domain.dto.SavedNewsResponse;
import com.example.stock_analysis.domain.entity.SavedNews;
import com.example.stock_analysis.domain.entity.User;
import com.example.stock_analysis.domain.repository.SavedNewsRepository;
import com.example.stock_analysis.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedNewsService {

    private final SavedNewsRepository savedNewsRepository;
    private final UserRepository userRepository;

    public List<SavedNewsResponse> getSavedNews(String username) {
        User user = findUser(username);
        return savedNewsRepository.findByUserIdOrderBySavedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public void save(String username, Long newsId, String headline, String url,
                     String sentiment, String source, String category) {
        User user = findUser(username);
        if (!savedNewsRepository.existsByUserIdAndNewsId(user.getId(), newsId)) {
            savedNewsRepository.save(SavedNews.builder()
                    .userId(user.getId())
                    .newsId(newsId)
                    .headline(headline)
                    .url(url)
                    .sentiment(sentiment)
                    .source(source)
                    .category(category)
                    .build());
        }
    }

    @Transactional
    public void markRead(String username, Long newsId) {
        User user = findUser(username);
        savedNewsRepository.findByUserIdAndNewsId(user.getId(), newsId)
                .ifPresent(n -> n.setRead(true));
    }

    @Transactional
    public void remove(String username, Long newsId) {
        User user = findUser(username);
        savedNewsRepository.deleteByUserIdAndNewsId(user.getId(), newsId);
    }

    public boolean isSaved(String username, Long newsId) {
        User user = findUser(username);
        return savedNewsRepository.existsByUserIdAndNewsId(user.getId(), newsId);
    }

    private SavedNewsResponse toResponse(SavedNews n) {
        return new SavedNewsResponse(
                n.getNewsId(), n.getHeadline(), n.getUrl(),
                n.getSentiment(), n.getSource(), n.getCategory(),
                n.isRead(), n.getSavedAt()
        );
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다: " + username));
    }
}
