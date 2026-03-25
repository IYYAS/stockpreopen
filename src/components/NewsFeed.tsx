import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { FeedResponse, FeedItem } from '../types/feed';

const FEED_API_URL = '/api/news-feed?publisherId=stocknewssummary&size=50';

const NewsFeed: React.FC = () => {
  const [news, setNews] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchNews = async (pageNum: number, isInitial: boolean = false) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const size = isInitial ? 50 : 10;
      const response = await fetch(`/api/news-feed?page=${pageNum}&size=${size}&publisherId=stocknewssummary`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data: FeedResponse = await response.json();
      
      if (isInitial) {
        setNews(data.feed);
      } else {
        setNews(prev => [...prev, ...data.feed]);
      }
      
      // If we got fewer items than requested, we've reached the end
      if (data.feed.length < size) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNews(1, true);
  }, []);

  // Infinite Scroll Observer
  useEffect(() => {
    if (loading || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchNews(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    const target = document.querySelector('#load-more-trigger');
    if (target) observer.observe(target);

    return () => observer.disconnect();
  }, [loading, hasMore, loadingMore, page]);

  const getSentiment = (title: string, body: string): { type: 'positive' | 'negative' | 'neutral'; reason: string } => {
    const text = (title + ' ' + body).toLowerCase();
    
    // Positive patterns
    const posPatterns = [
      { kw: 'wins', reason: 'New order or project win' },
      { kw: 'order', reason: 'Received new work order' },
      { kw: 'merger', reason: 'Strategic merger/acquisition' },
      { kw: 'approves', reason: 'Regulatory/Board approval received' },
      { kw: 'boost', reason: 'Positive growth catalyst' },
      { kw: 'dividend', reason: 'Dividend declaration' },
      { kw: 'acquisition', reason: 'Business expansion through acquisition' },
      { kw: 'restarts', reason: 'Operations resuming' },
      { kw: 'upgraded', reason: 'Credit/Rating upgrade' },
      { kw: 'relief', reason: 'Legal or financial relief' },
      { kw: 'strategic', reason: 'Strategic business move' },
      { kw: 'partnership', reason: 'New strategic partnership' },
      { kw: 'expansion', reason: 'Business expansion' },
      { kw: 'buy', reason: 'Insider/Bulk buying activity' },
    ];

    // Negative patterns
    const negPatterns = [
      { kw: 'drops', reason: 'Significant price drop' },
      { kw: 'falls', reason: 'Market value decline' },
      { kw: 'exit', reason: 'Key leadership exit' },
      { kw: 'resignation', reason: 'Leadership resignation' },
      { kw: 'resigned', reason: 'Executive departure' },
      { kw: 'loss', reason: 'Financial loss or market dip' },
      { kw: 'tax case', reason: 'Tax litigation concerns' },
      { kw: 'probe', reason: 'Regulatory investigation' },
      { kw: 'violations', reason: 'Compliance violations' },
      { kw: 'decline', reason: 'Performance decline' },
      { kw: 'crisis', reason: 'Governance/Financial crisis' },
      { kw: 'slump', reason: 'Sector/Market slump' },
      { kw: 'low', reason: 'Hit 52-week low' },
      { kw: 'curbs', reason: 'Regulatory/Supply restrictions' },
      { kw: 'curb', reason: 'Regulatory restrictions' },
      { kw: 'strain', reason: 'Financial/Sector strain' },
      { kw: 'crunch', reason: 'Credit/Financial crunch' },
      { kw: 'dissolve', reason: 'Subsidiary dissolution' },
      { kw: 'ceases', reason: 'Termination of role/charge' },
    ];

    for (const p of negPatterns) {
      if (text.includes(p.kw)) return { type: 'negative', reason: p.reason };
    }
    for (const p of posPatterns) {
      if (text.includes(p.kw)) return { type: 'positive', reason: p.reason };
    }
    
    return { type: 'neutral', reason: 'General market update' };
  };

  const handleAskAI = (item: FeedItem) => {
    const sentiment = getSentiment(item.data.title, item.data.body);
    const prompt = `I need a professional trading strategy for this news:
News Title: ${item.data.title}
Content: ${item.data.body}
Current AI Sentiment: ${sentiment.type.toUpperCase()}
Publisher: ${item.publisher}

Please provide:
1. 📈 BUY/SELL TIMING: Based on this news, is it the right time to buy or sell? Give specific timing logic.
2. 🎯 PRICE TARGETS: Key levels to watch for entry and exit based on this development.
3. 💡 DETAILED REASONING: Why should I take this action? Explain the market logic behind the news.
4. ⚠️ RISK FACTOR: What could go wrong with this trade?`;

    const encodedPrompt = encodeURIComponent(prompt);
    window.open(`https://chatgpt.com/?q=${encodedPrompt}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredNews = useMemo(() => {
    if (!searchTerm.trim()) return news;
    
    const term = searchTerm.toLowerCase();
    return news.filter(item => {
      const inTitle = item.data.title.toLowerCase().includes(term);
      const inBody = item.data.body.toLowerCase().includes(term);
      const inStocks = item.data.cta?.some(cta => 
        cta.ctaText.toLowerCase().includes(term) || 
        cta.meta?.nseScriptCode?.toLowerCase().includes(term)
      );
      return inTitle || inBody || inStocks;
    });
  }, [news, searchTerm]);

  if (loading && news.length === 0) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading market news...</p>
      </div>
    );
  }

  if (error && news.length === 0) {
    return (
      <div className="dashboard">
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: 'var(--accent-red)' }}>Oops!</h2>
          <p>{error}</p>
          <button className="btn-refresh" onClick={() => fetchNews(1, true)} style={{ marginTop: '1rem' }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard animate-in">
      <header className="header">
        <div>
          <Link to="/" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            ← Back to Dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
            <h1 className="title">Stock News <span style={{ color: 'var(--accent-blue)', fontSize: '1rem', fontWeight: 500, WebkitTextFillColor: 'var(--accent-blue)' }}>INSIGHTS</span></h1>
            <span className="count-badge">{filteredNews.length} items</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Latest updates from Groww Feed • Page {page}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search stocks, symbols or keywords..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="search-clear" onClick={() => setSearchTerm('')}>✕</button>
            )}
          </div>
          <button className="btn-refresh" onClick={() => { setPage(1); fetchNews(1, true); }}>↻ Refresh</button>
        </div>
      </header>

      <div className="news-grid">
        {filteredNews.length === 0 && !loading && (
          <div className="no-results glass-card">
            <span style={{ fontSize: '3rem' }}>🔍</span>
            <h3>No results found</h3>
            <p>We couldn't find any news matching "{searchTerm}"</p>
            <button className="btn-refresh" onClick={() => setSearchTerm('')}>Clear Search</button>
          </div>
        )}
        {filteredNews.map((item, index) => {
          const sentiment = getSentiment(item.data.title, item.data.body);
          return (
            <div key={`${item.postId}-${index}`} className="glass-card news-card">
              <div className="news-card-header">
                <div className="publisher-info">
                  <span className="publisher-name">{item.publisher}</span>
                  <span className="dot">•</span>
                  <span className="publish-date">{formatDate(item.publishedAt)}</span>
                </div>
                <div className={`sentiment-badge ${sentiment.type}`}>
                  {sentiment.type === 'positive' ? '🚀' : sentiment.type === 'negative' ? '⚠️' : 'ℹ️'} {sentiment.type.toUpperCase()}
                </div>
              </div>

              <h3 className="news-title">{item.data.title}</h3>
              <p className="news-body">{item.data.body}</p>

              {sentiment.reason && (
                <div className={`sentiment-reason ${sentiment.type}`}>
                   <strong>Reason:</strong> {sentiment.reason}
                </div>
              )}

              {item.data.cta && item.data.cta.length > 0 && (
                <div className="stock-cta-container">
                  {item.data.cta.map((cta, idx) => (
                    <div key={idx} className="stock-cta">
                      {cta.logoUrl && (
                        <img src={cta.logoUrl} alt={cta.ctaText} className="stock-logo" />
                      )}
                      <div className="stock-info">
                        <span className="stock-name">{cta.ctaText}</span>
                        {cta.meta?.nseScriptCode && (
                          <span className="stock-symbol">{cta.meta.nseScriptCode}</span>
                        )}
                      </div>
                      <a
                        href={cta.ctaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-trade"
                      >
                        View Stock
                      </a>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="news-card-footer">
                 <div className="reactions">
                   {item.data.reactions.map((reaction, rIdx) => (
                     <span key={rIdx} className="reaction-badge" style={{ marginLeft: '0.5rem' }}>
                       {reaction.type === 'LIKE' ? '👍' : reaction.type} {reaction.count}
                     </span>
                   ))}
                 </div>
                 <button onClick={() => handleAskAI(item)} className="ask-ai-btn">
                   <span className="ai-sparkle">✨</span> Ask GPT
                 </button>
              </div>
            </div>
          );
        })}
      </div>

      <div id="load-more-trigger" style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '2rem 0' }}>
        {loadingMore && (
           <div className="loading-more">
             <div className="spinner-small"></div>
             <span>Loading more news insights...</span>
           </div>
        )}
        {!hasMore && news.length > 0 && (
          <div className="end-of-feed">
             <span>✨ You've reached the end of the feed</span>
          </div>
        )}
      </div>

      <style>{`
        .search-container {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 0.5rem 1rem;
          width: 350px;
          transition: all 0.3s ease;
        }

        .search-container:focus-within {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          width: 400px;
        }

        .search-icon {
          font-size: 0.9rem;
          margin-right: 0.75rem;
          opacity: 0.5;
        }

        .search-input {
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 0.875rem;
          width: 100%;
          outline: none;
        }

        .search-input::placeholder {
          color: var(--text-secondary);
        }

        .search-clear {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.8rem;
          padding: 0.2rem;
          margin-left: 0.5rem;
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .search-clear:hover {
          opacity: 1;
        }

        .no-results {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          gap: 1rem;
          text-align: center;
          color: var(--text-secondary);
        }

        .no-results h3 {
          color: var(--text-primary);
          margin: 0;
        }

        .count-badge {
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-blue);
          padding: 0.2rem 0.6rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .loading-more {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid var(--glass-border);
          border-top-color: var(--accent-blue);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .end-of-feed {
          color: var(--text-secondary);
          font-size: 0.875rem;
          opacity: 0.7;
          font-style: italic;
        }

        .sentiment-badge {
          padding: 0.2rem 0.6rem;
          border-radius: 0.5rem;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .sentiment-badge.positive {
          background: rgba(16, 185, 129, 0.15);
          color: var(--accent-green);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .sentiment-badge.negative {
          background: rgba(239, 68, 68, 0.15);
          color: var(--accent-red);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .sentiment-badge.neutral {
          background: rgba(148, 163, 184, 0.1);
          color: var(--text-secondary);
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .sentiment-reason {
          font-size: 0.8rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          border-left: 3px solid transparent;
        }

        .sentiment-reason.positive {
          background: rgba(16, 185, 129, 0.05);
          color: var(--accent-green);
          border-left-color: var(--accent-green);
        }

        .sentiment-reason.negative {
          background: rgba(239, 68, 68, 0.05);
          color: var(--accent-red);
          border-left-color: var(--accent-red);
        }

        .sentiment-reason.neutral {
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-secondary);
          border-left-color: var(--text-secondary);
        }

        .news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .news-grid {
            grid-template-columns: 1fr;
          }
        }

        .news-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          height: 100%;
          border-left: 4px solid transparent;
          transition: all 0.3s ease;
        }

        .news-card:hover {
          border-left-color: var(--accent-blue);
          background: rgba(255, 255, 255, 0.05);
        }

        .news-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .publisher-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .publisher-name {
          color: var(--accent-blue);
          font-weight: 600;
        }

        .news-title {
          font-size: 1.125rem;
          font-weight: 600;
          line-height: 1.4;
          color: var(--text-primary);
        }

        .news-body {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .stock-cta-container {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid var(--glass-border);
        }

        .stock-cta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          padding: 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid var(--glass-border);
        }

        .stock-logo {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #fff;
          padding: 2px;
        }

        .stock-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .stock-name {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .stock-symbol {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .btn-trade {
          padding: 0.4rem 0.8rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent-blue);
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 0.5rem;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-trade:hover {
          background: var(--accent-blue);
          color: white;
        }

        .news-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .ask-ai-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.8rem;
          background: rgba(16, 163, 127, 0.1);
          border: 1px solid rgba(16, 163, 127, 0.2);
          border-radius: 0.5rem;
          color: #10a37f;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ask-ai-btn:hover {
          background: rgba(16, 163, 127, 0.2);
          border-color: #10a37f;
          transform: translateY(-1px);
        }

        .ai-sparkle {
          font-size: 0.8rem;
          filter: drop-shadow(0 0 2px rgba(16, 163, 127, 0.5));
        }

        .reaction-badge {
          background: var(--glass-bg);
          padding: 0.2rem 0.5rem;
          border-radius: 1rem;
          border: 1px solid var(--glass-border);
        }

        .dot {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default NewsFeed;
