package com.example.stock_analysis.service;

import com.example.stock_analysis.domain.dto.WatchlistResponse;
import com.example.stock_analysis.domain.entity.User;
import com.example.stock_analysis.domain.entity.Watchlist;
import com.example.stock_analysis.domain.repository.UserRepository;
import com.example.stock_analysis.domain.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** 관심종목 추가/삭제/조회 서비스 */
@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final UserRepository userRepository;

    /** 로그인한 유저의 관심종목 목록 반환 */
    public List<WatchlistResponse> getWatchlist(String username) {
        User user = findUser(username);
        return watchlistRepository.findByUserId(user.getId())
                .stream()
                .map(w -> new WatchlistResponse(w.getSymbol(), w.getAssetType()))
                .toList();
    }

    /** 관심종목 추가 (이미 있으면 무시) */
    public void add(String username, String symbol, String assetType) {
        User user = findUser(username);
        if (!watchlistRepository.existsByUserIdAndSymbol(user.getId(), symbol)) {
            watchlistRepository.save(Watchlist.builder()
                    .userId(user.getId())
                    .symbol(symbol)
                    .assetType(assetType)
                    .build());
        }
    }

    /** 관심종목 삭제 */
    @Transactional
    public void remove(String username, String symbol) {
        User user = findUser(username);
        watchlistRepository.deleteByUserIdAndSymbol(user.getId(), symbol);
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다: " + username));
    }
}
