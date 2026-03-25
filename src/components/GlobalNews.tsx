import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { NewsAPIResponse, NewsArticle } from '../types/news';

const API_KEY = '05b70430ae3046bc9df116ece4a90949';
const BASE_URL = 'https://newsapi.org/v2/everything';

const categories = {
  WAR: { label: 'War & Conflict', color: '#ff4444', icon: '⚔️', keywords: ['war', 'conflict', 'military', 'army', 'missile', 'strike', 'battle', 'invasion', 'ceasefire', 'soldier', 'defense', 'weapon', 'nuclear', 'explosion', 'crisis', 'attack', 'bomb', 'shelling', 'combat', 'artillery', 'vladimir putin', 'zelenskyy', 'netanyahu'] },
  FINANCE: { label: 'Finance', color: '#00c853', icon: '💰', keywords: ['economy', 'stock', 'market', 'investment', 'bank', 'finance', 'inflation', 'trade', 'profit', 'revenue', 'fiscal', 'company', 'shares', 'gold', 'crypto', 'bitcoin', 'fed', 'interest rate', 'gdp', 'nasdaq', 'nifty', 'bse', 'sensex', 'bull market', 'bear market', 'ipo'] },
  SPORT: { label: 'Sport', color: '#ff9100', icon: '🏆', keywords: ['football', 'cricket', 'olympics', 'match', 'tournament', 'league', 'score', 'player', 'team', 'stadium', 'win', 'trophy', 'racing', 'tennis', 'nba', 'fifa', 'icc', 'ipl', 'world cup', 'premier league', 'laliga', 'champions league'] }
};

const sentimentKeywords = {
  POSITIVE: ['surge', 'growth', 'positive', 'profit', 'win', 'success', 'record', 'gain', 'improvement', 'breakthrough', 'expansion', 'bullish', 'recovery', 'rally', 'optimistic', 'upbeat', 'soaring', 'strong', 'higher', 'increase', 'launch', 'deal', 'agreement'],
  NEGATIVE: ['crash', 'drop', 'fall', 'negative', 'loss', 'failure', 'crisis', 'war', 'conflict', 'strike', 'inflation', 'decline', 'bearish', 'slump', 'debt', 'risk', 'warning', 'alert', 'fear', 'alarming', 'tragedy', 'death', 'toll', 'concern', 'down', 'lower', 'decrease', 'recession', 'attack', 'threat', 'hike', 'bomb', 'damage', 'kill', 'killing', 'casualty', 'disaster']
};

type NewsCategory = keyof typeof categories | 'GENERAL';
type Sentiment = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

interface SentimentResult {
  sentiment: Sentiment;
  reason: string;
}

interface IndiaImpactData {
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  sectors: string[];
  stocks: string[];
  description: string;
}

interface CategorizedArticle extends NewsArticle {
  detectedCategory: NewsCategory;
  sentiment: Sentiment;
  sentimentReason: string;
  shortSummary: string;
  impactAnalysis: string;
  indiaImpact: IndiaImpactData;
}

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Côte d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czechia", "DR Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland",
  "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
  "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
  "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
  "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan",
  "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "USA", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam",
  "Holy See", "Yemen", "Zambia", "Zimbabwe"
];

const GlobalNews: React.FC = () => {
  const [articles, setArticles] = useState<CategorizedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<NewsCategory | 'ALL'>('ALL');
  
  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountries = countries.filter(c => 
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const [isBriefMode, setIsBriefMode] = useState(false);
  
  const generateShortSummary = (title: string, description: string): string => {
    // If title is already very descriptive, use it.
    // Otherwise, combine with first half of description
    const cleanDesc = (description || '').replace(/<[^>]*>/g, '').trim();
    if (!cleanDesc) return title;
    
    // Logic: extract first sentence robustly (ignoring decimal points in numbers)
    const sentence = cleanDesc.split(/\.(?!\d)|[!?]/)[0];
    const short = sentence.length > 120 ? sentence.substring(0, 117) + '...' : sentence;
    
    // To make it feel 'AI generated', we sometimes prefix with key actions
    if (title.toLowerCase().includes('moves') || title.toLowerCase().includes('shifts')) {
       return title.replace(/\bTrump administration\b/i, 'US'); // Example simple transform
    }
    
    return short + '.';
  };

  const generateImpactAnalysis = (title: string, description: string, category: NewsCategory, sentiment: Sentiment): string => {
    const text = `${title} ${description}`.toLowerCase();
    
    if (category === 'WAR') {
      if (text.includes('attack') || text.includes('strike') || text.includes('invade')) {
        return "Critical Risk: High probability of retaliatory strikes and regional escalation.";
      }
      return "Stability Warning: Potential for diplomatic shifts and heightened military readiness.";
    }
    
    if (category === 'FINANCE') {
      if (text.includes('inflation') || text.includes('rate hike') || text.includes('fed')) {
        return "Economic Impact: Likely increase in borrowing costs and consumer price pressure.";
      }
      return sentiment === 'POSITIVE' ? "Market Boost: Expected to improve investor confidence and sector growth." : "Volatility Alert: Investors may pivot to safe-haven assets amidst uncertainty.";
    }

    if (category === 'SPORT') {
      return "Team Dynamics: Potential shift in win-probability and team standings. High fan engagement expected.";
    }
    
    return "Social Pulse: Likely to trigger policy discussions and public interest shifts.";
  };

  const generateIndiaImpact = (title: string, description: string, category: NewsCategory): IndiaImpactData => {
    const text = `${title} ${description}`.toLowerCase();
    
    // 🏏 1. CRICKET / IPL / INDIAN SPORTS (Keep this from before)
    if (text.includes('ipl') || text.includes('cricket') || text.includes('bcci') || text.includes('wpl') || text.includes('srh') || text.includes('mi') || text.includes('rcb') || text.includes('csk')) {
      return {
        sentiment: 'POSITIVE',
        sectors: ['Media', 'Consumer Stocks', 'Hospitality'],
        stocks: ['Network18', 'JioFinancial', 'Zomato', 'Amber'],
        description: "IPL season drives massive ad-revenue for Media and boosts QSR/Delivery sectors significantly."
      };
    }

    // 🔴 2. OIL + MIDDLE EAST IMPACT (PRO VERSION)
    if (
      text.includes('iran') ||
      text.includes('israel') ||
      text.includes('middle east') ||
      text.includes('oil price') ||
      text.includes('crude') ||
      text.includes('opec') ||
      text.includes('strait of hormuz')
    ) {
      const isPriceUp = text.includes('rise') || text.includes('surge') || text.includes('increase') || text.includes('jump') || text.includes('threat');

      return {
        sentiment: isPriceUp ? 'NEGATIVE' : 'POSITIVE',
        sectors: isPriceUp
          ? ['Aviation', 'Paint', 'Logistics', 'FMCG']
          : ['Oil Marketing', 'Refineries'],
        stocks: isPriceUp
          ? ['Indigo', 'Asian Paints', 'BPCL', 'IOC']
          : ['ONGC', 'Reliance'],
        description: isPriceUp
          ? "Crude oil surge increases input cost → negative for consumption-driven sectors."
          : "Stable oil prices reduce cost pressure → positive for Indian economy."
      };
    }

    // 🟢 3. US FED / INTEREST RATE
    if (
      text.includes('fed') ||
      text.includes('interest rate') ||
      text.includes('inflation') ||
      text.includes('bond yield')
    ) {
      return {
        sentiment: 'NEGATIVE',
        sectors: ['IT', 'Banking', 'Real Estate'],
        stocks: ['TCS', 'Infosys', 'HDFC Bank', 'ICICI Bank'],
        description:
          "Higher US interest rates trigger FII outflow → pressure on Indian equity markets."
      };
    }

    // 🔵 4. INDIAN MARKET SPECIFIC
    if (
      text.includes('nifty') ||
      text.includes('sensex') ||
      text.includes('india economy') ||
      text.includes('rbi')
    ) {
      return {
        sentiment: 'POSITIVE',
        sectors: ['Banking', 'Infrastructure'],
        stocks: ['SBI', 'L&T'],
        description:
          "Strong domestic indicators support long-term growth outlook."
      };
    }

    // 🟣 5. TECH / AI GLOBAL
    const aiRegex = /\bai\b/i;
    if (
      aiRegex.test(text) ||
      text.includes('nvidia') ||
      text.includes('microsoft') ||
      text.includes('google')
    ) {
      return {
        sentiment: 'POSITIVE',
        sectors: ['IT Services'],
        stocks: ['TCS', 'Infosys', 'Wipro'],
        description:
          "Global AI boom boosts demand for Indian IT services."
      };
    }

    return {
      sentiment: 'NEUTRAL',
      sectors: ['Diversified'],
      stocks: ['NIFTY 50'],
      description:
        "No direct significant impact on Indian markets."
    };
  };

  const handleAskAI = (article: CategorizedArticle) => {
    const prompt = `Analyze this news in depth for a trader/investor:
Title: ${article.title}
Context: ${article.description}
AI Summary: ${article.shortSummary}
Market Forecast: ${article.impactAnalysis}
India Impact: ${article.indiaImpact.description}
Sectors Involved: ${article.indiaImpact.sectors.join(', ')}
Key Stocks: ${article.indiaImpact.stocks.join(', ')}

Please provide a detailed breakdown of:
1. Short-term market sentiment (1-3 days).
2. Any hidden risks not mentioned above.
3. Potential profit-booking levels or entry points for related sectors.`;

    const encodedPrompt = encodeURIComponent(prompt);
    window.open(`https://chatgpt.com/?q=${encodedPrompt}`, '_blank');
  };

  const detectSentiment = (title: string, description: string): SentimentResult => {
    const text = `${title} ${description}`.toLowerCase();
    
    const findMatches = (keywords: string[]) => {
      return keywords.filter(k => {
        const regex = new RegExp(`\\b${k}\\b`, 'i');
        return regex.test(text);
      });
    };

    const positiveMatches = findMatches(sentimentKeywords.POSITIVE);
    const negativeMatches = findMatches(sentimentKeywords.NEGATIVE);
    
    // Contextual Fixes
    let finalSentiment: Sentiment = 'NEUTRAL';
    let reasonParts: string[] = [];

    // Check for "soaring/surge" + "prices/inflation/costs"
    const priceBadKeywords = ['price', 'inflation', 'cost', 'oil', 'gas', 'bill', 'tax'];
    const isPriceSoaring = (positiveMatches.includes('soaring') || positiveMatches.includes('surge')) && 
                         priceBadKeywords.some(k => text.includes(k));

    if (isPriceSoaring) {
       // Move soaring/surge to negative for this case
       if (positiveMatches.includes('soaring')) {
         negativeMatches.push('soaring prices');
         positiveMatches.splice(positiveMatches.indexOf('soaring'), 1);
       }
       if (positiveMatches.includes('surge')) {
         negativeMatches.push('surge in prices');
         positiveMatches.splice(positiveMatches.indexOf('surge'), 1);
       }
    }

    if (positiveMatches.length > negativeMatches.length) {
      finalSentiment = 'POSITIVE';
      reasonParts = positiveMatches.map(m => `"${m}" detected as growth indicator`);
    } else if (negativeMatches.length > positiveMatches.length) {
      finalSentiment = 'NEGATIVE';
      reasonParts = negativeMatches.map(m => `"${m}" identified as risk/crisis`);
    }

    const reason = reasonParts.length > 0 
      ? `AI identified ${reasonParts.slice(0, 2).join(' and ')}` 
      : 'Topic seems balanced or neutral';

    return { sentiment: finalSentiment, reason };
  };

  const categorizeArticle = (title: string, description: string): NewsCategory => {
    const text = `${title} ${description}`.toLowerCase();
    
    const checkMatch = (keywords: string[]) => {
      return keywords.some(k => {
        const regex = new RegExp(`\\b${k}\\b`, 'i');
        return regex.test(text);
      });
    };

    if (checkMatch(categories.WAR.keywords)) return 'WAR';
    if (checkMatch(categories.FINANCE.keywords)) return 'FINANCE';
    if (checkMatch(categories.SPORT.keywords)) return 'SPORT';
    
    return 'GENERAL';
  };

  const fetchNews = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = `${BASE_URL}?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&apiKey=${API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch global news. API might be rate limited.');
      }
      
      const data: NewsAPIResponse = await response.json();
      
      if (data.status === 'error') {
        throw new Error('NewsAPI Error: ' + (data as any).message);
      }
      
      const processed = (data.articles || []).map(article => {
        const category = categorizeArticle(article.title, article.description || '');
        const sentimentInfo = detectSentiment(article.title, article.description || '');
        return {
          ...article,
          detectedCategory: category,
          sentiment: sentimentInfo.sentiment,
          sentimentReason: sentimentInfo.reason,
          shortSummary: generateShortSummary(article.title, article.description || ''),
          impactAnalysis: generateImpactAnalysis(article.title, article.description || '', category, sentimentInfo.sentiment),
          indiaImpact: generateIndiaImpact(article.title, article.description || '', category)
        };
      });
      
      setArticles(processed);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(selectedCountry);
  }, [selectedCountry, fetchNews]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchNews(searchTerm);
    }
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

  const getGlobalPulse = (articles: CategorizedArticle[]) => {
    if (articles.length === 0) return null;

    const stats = {
      total: articles.length,
      positive: articles.filter(a => a.sentiment === 'POSITIVE').length,
      negative: articles.filter(a => a.sentiment === 'NEGATIVE').length,
      war: articles.filter(a => a.detectedCategory === 'WAR').length,
      finance: articles.filter(a => a.detectedCategory === 'FINANCE').length,
      sport: articles.filter(a => a.detectedCategory === 'SPORT').length,
    };

    const topCategory = stats.war > stats.finance && stats.war > stats.sport ? 'Conflict' : 
                      stats.finance > stats.war && stats.finance > stats.sport ? 'Financial' : 
                      stats.sport > 0 ? 'Sporting' : 'General';
    
    const sentimentTrend = stats.positive > stats.negative ? 'Positive' : 
                         stats.negative > stats.positive ? 'Cautions/At Risk' : 'Neutral';

    // Summary text logic
    let briefing = `The current news landscape for ${selectedCountry} is primarily ${topCategory}-driven with a ${sentimentTrend.toLowerCase()} outlook.`;
    
    if (stats.negative > stats.positive) {
      briefing += ` Key risks identified include ${articles.filter(a => a.sentiment === 'NEGATIVE').slice(0, 2).map(a => a.title.split(' ').slice(0, 3).join(' ')).join(' and ')} related developments.`;
    } else if (stats.positive > 0) {
      briefing += ` Growth indicators seen in ${articles.filter(a => a.sentiment === 'POSITIVE').slice(0, 2).map(a => a.title.split(' ').slice(0, 3).join(' ')).join(' and ')}.`;
    }

    return { ...stats, briefing, trend: sentimentTrend };
  };

  const globalPulse = getGlobalPulse(articles);

  const displayedArticles = activeCategory === 'ALL' 
    ? articles 
    : articles.filter(a => a.detectedCategory === activeCategory);

  return (
    <div className="dashboard animate-in">
      <header className="header" style={{ marginBottom: '2rem' }}>
        <div>
          <Link to="/" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            ← Back to Dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
            <h1 className="title">Global <span style={{ color: 'var(--accent-blue)', fontSize: '1rem', fontWeight: 500, WebkitTextFillColor: 'var(--accent-blue)' }}>NEWS</span></h1>
            <span className="count-badge">{displayedArticles.length} articles</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>AI-Powered sentiment & category analysis for 195 nations</p>
        </div>
        
        <div className="header-actions">
           <form onSubmit={handleSearch} className="search-form">
              <input 
                type="text" 
                placeholder="Search topics..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn-search">🔍</button>
           </form>
           <button className="btn-refresh" onClick={() => fetchNews(selectedCountry)}>↻ Refresh</button>
        </div>
      </header>

      <div className="controls-row">
        <div className="selector-container">
          <div className="custom-dropdown" ref={dropdownRef}>
            <button 
              className="dropdown-toggle glass-card" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="label">Region:</span>
              <span className="selected-value">{selectedCountry}</span>
              <span className={`arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu glass-card animate-in">
                <div className="dropdown-search">
                  <input 
                    type="text" 
                    placeholder="Search 195 countries..." 
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="dropdown-list">
                  {filteredCountries.map((country) => (
                    <div 
                      key={country} 
                      className={`dropdown-item ${selectedCountry === country ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCountry(country);
                        setIsDropdownOpen(false);
                        setCountrySearch('');
                        setSearchTerm('');
                      }}
                    >
                      {country}
                    </div>
                  ))}
                  {filteredCountries.length === 0 && (
                    <div className="dropdown-no-results">No countries found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="quick-regions">
            {['India', 'USA', 'UK', 'Global'].map(q => (
              <button 
                key={q} 
                className={`quick-chip ${selectedCountry === q ? 'active' : ''}`}
                onClick={() => setSelectedCountry(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="category-filters glass-card">
          <button 
            className={`cat-filter ${activeCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveCategory('ALL')}
          >
            All News
          </button>
          <div className="cat-divider"></div>
          {(Object.keys(categories) as Array<keyof typeof categories>).map(catKey => (
            <button 
              key={catKey}
              className={`cat-filter ${activeCategory === catKey ? 'active' : ''}`}
              onClick={() => setActiveCategory(catKey)}
              style={{ '--cat-color': categories[catKey].color } as React.CSSProperties}
            >
              <span className="cat-icon">{categories[catKey].icon}</span>
              {categories[catKey].label}
            </button>
          ))}
        </div>

        <button 
          className={`brief-toggle glass-card ${isBriefMode ? 'active' : ''}`}
          onClick={() => setIsBriefMode(!isBriefMode)}
        >
          {isBriefMode ? '📖 Show Full' : '⚡ Brief View'}
        </button>
      </div>

      {/* Global Pulse Dashboard */}
      {!loading && globalPulse && articles.length > 0 && (
        <div className="pulse-dashboard glass-card animate-in" style={{ marginBottom: '2rem' }}>
          <div className="pulse-header">
            <div className="pulse-dot-container">
              <div className="pulse-dot"></div>
              <span className="pulse-title">AI GLOBAL PULSE</span>
            </div>
            <div className="pulse-badge" style={{ background: globalPulse.trend === 'Positive' ? 'rgba(0, 200, 83, 0.1)' : globalPulse.trend === 'Cautions/At Risk' ? 'rgba(255, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)', color: globalPulse.trend === 'Positive' ? '#00c853' : globalPulse.trend === 'Cautions/At Risk' ? '#ff4444' : '#fff' }}>
              Market Outlook: {globalPulse.trend}
            </div>
          </div>
          
          <div className="pulse-content">
            <div className="pulse-stats">
              <div className="p-stat">
                <span className="p-val">{globalPulse.total}</span>
                <span className="p-lab">Articles</span>
              </div>
              <div className="p-stat">
                <span className="p-val" style={{ color: '#00c853' }}>{Math.round((globalPulse.positive / globalPulse.total) * 100)}%</span>
                <span className="p-lab">Good</span>
              </div>
              <div className="p-stat">
                <span className="p-val" style={{ color: '#ff4444' }}>{Math.round((globalPulse.negative / globalPulse.total) * 100)}%</span>
                <span className="p-lab">Alerts</span>
              </div>
            </div>
            <div className="pulse-divider"></div>
            <div className="pulse-briefing">
              <p>{globalPulse.briefing}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Fetching global updates for {selectedCountry}...</p>
        </div>
      ) : error ? (
        <div className="glass-card error-card">
          <h3 style={{ color: 'var(--accent-red)' }}>Connection Error</h3>
          <p>{error}</p>
          <button className="btn-refresh" style={{ marginTop: '1rem' }} onClick={() => fetchNews(selectedCountry)}>Retry</button>
        </div>
      ) : (
        <div className="news-grid">
          {displayedArticles.map((article, index) => (
            <div key={`${article.url}-${index}`} className="glass-card news-card global-news-card" style={{ 
              borderColor: article.sentiment === 'POSITIVE' ? 'rgba(0, 200, 83, 0.4)' : article.sentiment === 'NEGATIVE' ? 'rgba(255, 68, 68, 0.4)' : 'var(--glass-border)'
            }}>
              {article.urlToImage && (
                <div className="article-image-container">
                  <img src={article.urlToImage} alt={article.title} className="article-image" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  <div className="card-labels-container">
                    {article.detectedCategory !== 'GENERAL' && (
                      <div className="category-overlay-tag" style={{ background: categories[article.detectedCategory as keyof typeof categories].color }}>
                        {categories[article.detectedCategory as keyof typeof categories].icon} {categories[article.detectedCategory as keyof typeof categories].label}
                      </div>
                    )}
                    {article.sentiment !== 'NEUTRAL' && (
                      <div className={`sentiment-badge ${article.sentiment.toLowerCase()}`}>
                        {article.sentiment === 'POSITIVE' ? '📈 Good News' : '📉 Alert'}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="news-card-content">
                <div className="news-card-header">
                  <div className="publisher-info">
                    <span className="publisher-name">{article.source.name}</span>
                    <span className="dot">•</span>
                    <span className="publish-date">{formatDate(article.publishedAt)}</span>
                  </div>
                  {article.detectedCategory === 'GENERAL' && (
                     <div className="general-tag">Topic: Global</div>
                  )}
                </div>

                <h3 className="news-title">{article.title}</h3>
                <div className="tldr-box">
                  <span className="tldr-label">⚡ AI TL;DR:</span> {article.shortSummary}
                </div>
                <div className="impact-box">
                  <span className="impact-label">🎯 AI Forecast:</span> {article.impactAnalysis}
                </div>
                <div className={`india-impact-box ${article.indiaImpact.sentiment.toLowerCase()}`}>
                  <div className="india-impact-header">
                    <span className="india-label">🇮🇳 India Impact Forecast</span>
                    <span className={`impact-badge ${article.indiaImpact.sentiment.toLowerCase()}`}>
                      {article.indiaImpact.sentiment === 'POSITIVE' ? '📈 Growth' : 
                       article.indiaImpact.sentiment === 'NEGATIVE' ? '⚠️ At Risk' : '➖ Neutral'}
                    </span>
                  </div>
                  <p className="impact-description">{article.indiaImpact.description}</p>
                  <div className="impact-metadata">
                    <div className="impact-tag-group">
                      <span className="tag-label">Sectors:</span>
                      {article.indiaImpact.sectors.map(s => <span key={s} className="sector-tag">{s}</span>)}
                    </div>
                    <div className="impact-tag-group">
                      <span className="tag-label">Key Stocks:</span>
                      {article.indiaImpact.stocks.map(s => <span key={s} className="stock-tag">{s}</span>)}
                    </div>
                  </div>
                </div>
                {!isBriefMode && <p className="news-body">{article.description}</p>}
                
                {article.sentiment !== 'NEUTRAL' && (
                  <div className={`sentiment-reason-box ${article.sentiment.toLowerCase()}`}>
                    <span className="reason-label">AI Reasoning:</span> {article.sentimentReason}
                  </div>
                )}

                <div className="news-card-footer">
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="read-more-link">
                    Read Full Story →
                  </a>
                  <button onClick={() => handleAskAI(article)} className="ask-ai-btn">
                    <span className="ai-sparkle">✨</span> Ask GPT Analysis
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {displayedArticles.length === 0 && !loading && !error && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem', marginTop: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h3 style={{ color: 'var(--text-primary)' }}>No articles found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            We couldn't find any {activeCategory !== 'ALL' ? categories[activeCategory as keyof typeof categories].label : ''} news for {selectedCountry} at the moment.
          </p>
          <button className="btn-refresh" style={{ marginTop: '1.5rem' }} onClick={() => setActiveCategory('ALL')}>Show All News</button>
        </div>
      )}

      <style>{`
        .controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .selector-container {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .category-filters {
          display: flex;
          align-items: center;
          padding: 0.4rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 1rem;
        }

        .cat-filter {
          padding: 0.6rem 1.2rem;
          border-radius: 0.75rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
        }

        .cat-filter:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        .cat-filter.active {
          background: var(--cat-color, var(--accent-blue));
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .cat-filter.active[style*="--cat-color"] {
          background: var(--cat-color);
        }

        .cat-divider {
          width: 1px;
          height: 20px;
          background: var(--glass-border);
          margin: 0 0.5rem;
        }

        .cat-icon {
          font-size: 1rem;
        }

        .brief-toggle {
          padding: 0.6rem 1.2rem;
          border-radius: 2rem;
          border: 1px solid var(--glass-border);
          background: rgba(255,255,255,0.03);
          color: var(--text-secondary);
          font-size: 0.8125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .brief-toggle:hover {
          border-color: var(--accent-blue);
          color: white;
        }

        .brief-toggle.active {
          background: rgba(59, 130, 246, 0.15);
          border-color: var(--accent-blue);
          color: var(--accent-blue);
        }

        .tldr-box {
          margin: 0.75rem 0;
          padding: 0.5rem 0.75rem;
          background: rgba(255,255,255,0.02);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          line-height: 1.4;
          color: var(--text-primary);
          border-left: 2px solid var(--accent-blue);
        }

        .tldr-label {
          color: var(--accent-blue);
          font-weight: 800;
          margin-right: 0.4rem;
          font-size: 0.75rem;
          letter-spacing: 0.02em;
        }

        .impact-box {
          margin-top: 0.25rem;
          margin-bottom: 1rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 68, 68, 0.03);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          line-height: 1.4;
          color: #ef9a9a;
          border-left: 2px solid #ff4444;
        }

        .impact-label {
          color: #ff4444;
          font-weight: 800;
          margin-right: 0.4rem;
          font-size: 0.75rem;
          letter-spacing: 0.02em;
        }

        .india-impact-box {
          margin: 1rem 0;
          padding: 1rem;
          background: rgba(255,255,255,0.02);
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.05);
          border-left: 4px solid var(--accent-blue);
          transition: all 0.3s;
        }

        .india-impact-box.positive { border-left-color: #00c853; background: rgba(0, 200, 83, 0.02); }
        .india-impact-box.negative { border-left-color: #ff4444; background: rgba(255, 68, 68, 0.02); }

        .india-impact-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .india-label {
          color: white;
          font-weight: 800;
          font-size: 0.85rem;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .impact-badge {
          padding: 0.25rem 0.6rem;
          border-radius: 2rem;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .impact-badge.positive { background: rgba(0, 200, 83, 0.2); color: #69f0ae; }
        .impact-badge.negative { background: rgba(255, 68, 68, 0.2); color: #ff8a80; }
        .impact-badge.neutral { background: rgba(255, 255, 255, 0.1); color: #bdbdbd; }

        .impact-description {
          font-size: 0.875rem;
          line-height: 1.5;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        .impact-metadata {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .impact-tag-group {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.4rem;
        }

        .tag-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          margin-right: 0.25rem;
        }

        .sector-tag, .stock-tag {
          padding: 0.2rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.7rem;
          font-weight: 600;
          background: rgba(255,255,255,0.05);
          color: var(--text-primary);
        }

        .stock-tag {
          color: var(--accent-blue);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .card-labels-container {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-end;
          z-index: 10;
        }

        .category-overlay-tag {
          padding: 0.4rem 0.8rem;
          border-radius: 0.5rem;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          backdrop-filter: blur(4px);
        }

        .sentiment-badge {
          padding: 0.4rem 0.8rem;
          border-radius: 0.5rem;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          backdrop-filter: blur(4px);
        }

        .sentiment-badge.positive {
          background: rgba(0, 200, 83, 0.9);
        }

        .sentiment-badge.negative {
          background: rgba(255, 68, 68, 0.9);
        }

        .sentiment-reason-box {
          margin-top: 1rem;
          padding: 0.6rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.8125rem;
          background: rgba(255,255,255,0.03);
          border-left: 3px solid;
          line-height:1.4;
        }

        .sentiment-reason-box.positive {
          border-color: #00c853;
          color: #a5d6a7;
        }

        .sentiment-reason-box.negative {
          border-color: #ff4444;
          color: #ef9a9a;
        }

        .reason-label {
          font-weight: 700;
          color: rgba(255,255,255,0.6);
          margin-right: 0.5rem;
        }

        .general-tag {
          font-size: 0.75rem;
          color: var(--text-secondary);
          background: rgba(255,255,255,0.05);
          padding: 0.2rem 0.5rem;
          border-radius: 0.3rem;
        }

        .custom-dropdown {
          position: relative;
          min-width: 250px;
        }

        .dropdown-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.8rem 1.2rem;
          cursor: pointer;
          border: 1px solid var(--glass-border);
          text-align: left;
          transition: all 0.2s;
        }

        .dropdown-toggle:hover {
          border-color: var(--accent-blue);
          background: rgba(255, 255, 255, 0.05);
        }

        .dropdown-toggle .label {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .dropdown-toggle .selected-value {
          flex: 1;
          font-weight: 600;
          color: var(--accent-blue);
        }

        .dropdown-toggle .arrow {
          font-size: 0.75rem;
          transition: transform 0.3s;
          opacity: 0.5;
        }

        .dropdown-toggle .arrow.open {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          width: 100%;
          max-height: 400px;
          z-index: 100;
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          backdrop-filter: blur(20px);
        }

        .dropdown-search {
          padding: 0.75rem;
          border-bottom: 1px solid var(--glass-border);
          background: rgba(255,255,255,0.02);
        }

        .dropdown-search input {
          width: 100%;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--glass-border);
          border-radius: 0.5rem;
          padding: 0.6rem 0.8rem;
          color: white;
          outline: none;
          font-size: 0.875rem;
        }

        .dropdown-list {
          overflow-y: auto;
          flex: 1;
          scrollbar-width: thin;
        }

        .dropdown-item {
          padding: 0.75rem 1.25rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
          color: var(--text-secondary);
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          padding-left: 1.5rem;
        }

        .dropdown-item.active {
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-blue);
          font-weight: 600;
        }

        .dropdown-no-results {
          padding: 2rem;
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .quick-regions {
          display: flex;
          gap: 0.5rem;
        }

        .quick-chip {
          padding: 0.5rem 0.8rem;
          border-radius: 2rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .quick-chip:hover {
          border-color: rgba(59, 130, 246, 0.3);
          background: rgba(255, 255, 255, 0.08);
        }

        .quick-chip.active {
          background: rgba(59, 130, 246, 0.15);
          border-color: var(--accent-blue);
          color: var(--accent-blue);
        }

        .pulse-dashboard {
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 1.25rem;
        }

        .pulse-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .pulse-dot-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          box-shadow: 0 0 10px #3b82f6;
          animation: pulse-ring 2s infinite;
        }

        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }

        .pulse-title {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--accent-blue);
        }

        .pulse-badge {
          padding: 0.4rem 0.8rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .pulse-content {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .pulse-stats {
          display: flex;
          gap: 1.5rem;
        }

        .p-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .p-val {
          font-size: 1.25rem;
          font-weight: 800;
          color: white;
        }

        .p-lab {
          font-size: 0.625rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          margin-top: 0.25rem;
        }

        .pulse-divider {
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.1);
        }

        .pulse-briefing {
          flex: 1;
        }

        .pulse-briefing p {
          font-size: 0.9375rem;
          color: var(--text-primary);
          line-height: 1.5;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .search-form {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .search-input {
          background: transparent;
          border: none;
          padding: 0.5rem 1rem;
          color: white;
          width: 200px;
          outline: none;
        }

        .btn-search {
          background: transparent;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .btn-search:hover {
          opacity: 1;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          min-height: 400px;
        }

        .error-card {
          text-align: center;
          padding: 3rem;
          max-width: 500px;
          margin: 0 auto;
        }

        .global-news-card {
          position: relative;
          padding: 0 !important;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--glass-border);
        }

        .global-news-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.3);
        }

        .article-image-container {
          position: relative;
          width: 100%;
          height: 300px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid var(--glass-border);
        }

        .article-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: transform 0.5s ease;
        }

        .news-card-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .news-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .read-more-link {
          color: var(--accent-blue);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .ask-ai-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(16, 163, 127, 0.1);
          border: 1px solid rgba(16, 163, 127, 0.2);
          border-radius: 0.5rem;
          color: #10a37f;
          font-size: 0.8125rem;
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
          font-size: 0.9rem;
          filter: drop-shadow(0 0 2px rgba(16, 163, 127, 0.5));
        }
      `}</style>
    </div>
  );
};

export default GlobalNews;
