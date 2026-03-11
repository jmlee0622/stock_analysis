package com.example.stock_analysis.news;

import com.example.stock_analysis.domain.entity.NewsArticle;
import com.example.stock_analysis.domain.repository.NewsArticleRepository;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/** ChromaDB 벡터 저장 및 유사도 검색 서비스 */
@Service
@Slf4j
@RequiredArgsConstructor
public class NewsVectorService {

    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;
    private final NewsArticleRepository newsArticleRepository;

    /** 뉴스를 벡터로 변환해 ChromaDB에 저장 */
    public void storeNewsEmbedding(Long newsId, String headline, String summary, String sentiment, String url) {
        String text = headline + " " + summary;

        Metadata metadata = new Metadata();
        metadata.put("newsId", String.valueOf(newsId));
        metadata.put("sentiment", sentiment);
        metadata.put("headline", headline);
        metadata.put("url", url != null ? url : "");

        TextSegment segment = TextSegment.from(text, metadata);
        Embedding embedding = embeddingModel.embed(segment).content();
        embeddingStore.add(embedding, segment);

        log.debug("ChromaDB 저장 완료 - newsId: {}", newsId);
    }

    /** 쿼리 텍스트와 의미적으로 유사한 뉴스 검색 */
    public List<EmbeddingMatch<TextSegment>> searchSimilarNews(String query, int maxResults) {
        Embedding queryEmbedding = embeddingModel.embed(query).content();
        return embeddingStore.findRelevant(queryEmbedding, maxResults);
    }

    /** TimescaleDB에 있는 기존 뉴스를 ChromaDB로 일괄 마이그레이션 */
    public int migrateExistingNews() {
        List<NewsArticle> articles = newsArticleRepository.findAll();
        int count = 0;

        for (NewsArticle article : articles) {
            storeNewsEmbedding(article.getId(), article.getHeadline(), article.getSummary(), article.getSentiment(), article.getUrl());
            count++;
        }

        log.info("ChromaDB 마이그레이션 완료 - {}건 저장", count);
        return count;
    }
}
