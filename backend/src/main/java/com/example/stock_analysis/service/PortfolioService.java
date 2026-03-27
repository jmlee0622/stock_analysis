package com.example.stock_analysis.service;

import com.example.stock_analysis.domain.dto.PortfolioResponse;
import com.example.stock_analysis.domain.entity.Portfolio;
import com.example.stock_analysis.domain.entity.User;
import com.example.stock_analysis.domain.repository.PortfolioRepository;
import com.example.stock_analysis.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;

    public List<PortfolioResponse> getPortfolio(String username) {
        User user = findUser(username);
        return portfolioRepository.findByUserId(user.getId())
                .stream()
                .map(p -> new PortfolioResponse(p.getId(), p.getSymbol(), p.getAssetType(),
                        p.getQuantity(), p.getAvgPrice()))
                .toList();
    }

    public PortfolioResponse add(String username, String symbol, String assetType,
                                 BigDecimal quantity, BigDecimal avgPrice) {
        User user = findUser(username);
        Portfolio saved = portfolioRepository.save(Portfolio.builder()
                .userId(user.getId())
                .symbol(symbol)
                .assetType(assetType)
                .quantity(quantity)
                .avgPrice(avgPrice)
                .build());
        return new PortfolioResponse(saved.getId(), saved.getSymbol(), saved.getAssetType(),
                saved.getQuantity(), saved.getAvgPrice());
    }

    @Transactional
    public void remove(String username, Long id) {
        User user = findUser(username);
        portfolioRepository.deleteByIdAndUserId(id, user.getId());
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다: " + username));
    }
}
