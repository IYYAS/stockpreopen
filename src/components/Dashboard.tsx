import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { NsePreOpenData } from '../types/nse';
import { useDashboard, DEFAULT_RANGE, type SortKey, type TFilter, type MarketSegment, type RangeFilter } from '../context/DashboardContext';
import InlineChart from './InlineChart';
import MiniChart from './MiniChart';

const API_BASE_URL = '/api/pre-open?key=';

const Dashboard: React.FC = () => {
    const {
        segment, setSegment,
        sortKey, setSortKey,
        sortAsc, setSortAsc,
        filter, setFilter,
        search, setSearch,
        searchInput, setSearchInput,
        showFilters, setShowFilters,
        range, setRange
    } = useDashboard();

    const [data, setData] = useState<NsePreOpenData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState('');
    const [activeFilterCount, setActiveFilterCount] = useState(0);
    const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [timeframe, setTimeframe] = useState('1D');

    const fetchData = async () => {
        try {
            setError(null);
            const res = await fetch(`${API_BASE_URL}${segment}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json: NsePreOpenData = await res.json();
            setData(json);
            setLastUpdated(new Date().toLocaleTimeString('en-IN'));
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [segment]);

    // Count how many range filters are active
    useEffect(() => {
        setActiveFilterCount(Object.values(range).filter(v => v !== '').length);
    }, [range]);

    const stocks = useMemo(() => {
        if (!data) return [];
        let list = [...data.data];

        // Quick filter tabs
        if (filter === 'gainers') list = list.filter(s => s.metadata.pChange > 0);
        if (filter === 'losers') list = list.filter(s => s.metadata.pChange < 0);

        // Symbol search
        if (search) list = list.filter(s => s.metadata.symbol.toLowerCase().includes(search.toLowerCase()));

        // Range filters — auto-swap min/max so e.g. Min:-1 Max:-3 works as -3 to -1
        const n = (v: string) => v === '' ? null : parseFloat(v);
        const lo = (a: string, b: string) => { const x = n(a), y = n(b); return (x !== null && y !== null) ? Math.min(x, y) : x; };
        const hi = (a: string, b: string) => { const x = n(a), y = n(b); return (x !== null && y !== null) ? Math.max(x, y) : y; };
        list = list.filter(s => {
            const m = s.metadata;
            const mktVal = typeof m.marketCap === 'number' ? m.marketCap : 0;
            const mktCrore = mktVal / 1e7;
            const loPrice = lo(range.minPrice, range.maxPrice), hiPrice = hi(range.minPrice, range.maxPrice);
            const loPCh = lo(range.minPChange, range.maxPChange), hiPCh = hi(range.minPChange, range.maxPChange);
            const loMkt = lo(range.minMarketCap, range.maxMarketCap), hiMkt = hi(range.minMarketCap, range.maxMarketCap);
            const loVol = lo(range.minVolume, range.maxVolume), hiVol = hi(range.minVolume, range.maxVolume);
            if (loPrice !== null && m.lastPrice < loPrice) return false;
            if (hiPrice !== null && m.lastPrice > hiPrice) return false;
            if (loPCh !== null && m.pChange < loPCh) return false;
            if (hiPCh !== null && m.pChange > hiPCh) return false;
            if (loMkt !== null && mktCrore < loMkt) return false;
            if (hiMkt !== null && mktCrore > hiMkt) return false;
            if (loVol !== null && m.finalQuantity < loVol) return false;
            if (hiVol !== null && m.finalQuantity > hiVol) return false;
            return true;
        });

        // Sort
        list.sort((a, b) => {
            let valA: string | number = sortKey === 'symbol' ? a.metadata.symbol : (a.metadata[sortKey] as string | number);
            let valB: string | number = sortKey === 'symbol' ? b.metadata.symbol : (b.metadata[sortKey] as string | number);

            if (sortKey === 'marketCap') {
                valA = typeof valA === 'number' ? valA : 0;
                valB = typeof valB === 'number' ? valB : 0;
            }

            if (valA < valB) return sortAsc ? -1 : 1;
            if (valA > valB) return sortAsc ? 1 : -1;
            return 0;
        });
        return list;
    }, [data, sortKey, sortAsc, filter, search, range]);

    const gainers = useMemo(() => data ? [...data.data].sort((a, b) => b.metadata.pChange - a.metadata.pChange).slice(0, 5) : [], [data]);
    const losers = useMemo(() => data ? [...data.data].sort((a, b) => a.metadata.pChange - b.metadata.pChange).slice(0, 5) : [], [data]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortAsc(!sortAsc);
        else { setSortKey(key); setSortAsc(key === 'symbol'); }
    };

    const setRangeField = (field: keyof RangeFilter, value: string) => {
        setRange(prev => ({ ...prev, [field]: value }));
    };

    const clearFilters = () => {
        setRange(DEFAULT_RANGE);
        setSearch('');
        setFilter('all');
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-secondary)' }}>Loading NSE Pre-Open Data...</p>
        </div>
    );

    if (error) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ color: 'var(--accent-red)', fontSize: '3rem' }}>⚠</div>
            <p style={{ color: 'var(--accent-red)', fontWeight: 600 }}>Failed to fetch NSE data</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{error}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Make sure the proxy server is running: <code style={{ color: 'var(--accent-blue)' }}>node server.js</code></p>
            <button onClick={() => fetchData()} className="btn-retry">Retry</button>
        </div>
    );

    const formatMktCap = (val: number | string) => {
        const num = typeof val === 'number' ? val : 0;
        if (num === 0) return 'N/A';
        return `₹${(num / 1e7).toFixed(2)} Cr`;
    };

    if (!data) return null;

    return (
        <div className="dashboard animate-in">

            {/* Header */}
            <header className="header">
                <div>
                    <h1 className="title">NSE Pre-Open Market <span style={{ color: 'var(--accent-blue)', fontSize: '1rem', fontWeight: 500, WebkitTextFillColor: 'var(--accent-blue)' }}>LIVE</span></h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{segment} Segment — Last updated: {lastUpdated}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {viewMode === 'grid' && (
                        <div className="timeframe-selector" style={{ marginRight: '0.5rem' }}>
                            {[
                                { label: '1D', value: '1D' },
                                { label: '1W', value: '1W' },
                                { label: '1M', value: '1M' },
                                { label: '1Y', value: '1Y' },
                                { label: '20Y', value: '20Y' },
                                { label: '30Y', value: '30Y' },
                                { label: '40Y', value: '40Y' }
                            ].map(tf => (
                                <button
                                    key={tf.value}
                                    className={`timeframe-btn ${timeframe === tf.value ? 'active' : ''}`}
                                    onClick={() => setTimeframe(tf.value)}
                                >
                                    {tf.label}
                                </button>
                            ))}
                        </div>
                    )}
                    <select
                        className="filter-tab"
                        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', color: 'var(--text-primary)', cursor: 'pointer' }}
                        value={segment}
                        onChange={(e) => setSegment(e.target.value as MarketSegment)}
                    >
                        <option value="ALL">All Stocks</option>
                        <option value="FO">F&O Stocks</option>
                        <option value="NIFTY">Nifty 50</option>
                        <option value="BANKNIFTY">Bank Nifty</option>
                    </select>
                    <Link to="/all-charts" className="btn-refresh" style={{ textDecoration: 'none', background: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>📊 All Charts</Link>
                    <Link to="/news" className="btn-refresh" style={{ textDecoration: 'none', background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)', color: 'var(--accent-green)' }}>📰 Stock News</Link>
                    <Link to="/global-news" className="btn-refresh" style={{ textDecoration: 'none', background: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)', color: 'var(--accent-blue)' }}>🌎 Global News</Link>
                    <Link to="/ipc" className="btn-refresh" style={{ textDecoration: 'none', background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--accent-red)' }}>⚖️ IPC Codes</Link>
                    <button onClick={() => fetchData()} className="btn-refresh">↻ Refresh</button>
                </div>
            </header>

            {/* Stats */}
            <section className="stats-grid">
                <div className="glass-card stat-item">
                    <div className="stat-label">Total Securities</div>
                    <div className="stat-value">{data.data.length}</div>
                </div>
                <div className="glass-card stat-item">
                    <div className="stat-label">Advances</div>
                    <div className="stat-value up">{data.data.length - data.declines - data.unchanged}</div>
                </div>
                <div className="glass-card stat-item">
                    <div className="stat-label">Declines</div>
                    <div className="stat-value down">{data.declines}</div>
                </div>
                <div className="glass-card stat-item">
                    <div className="stat-label">Unchanged</div>
                    <div className="stat-value">{data.unchanged}</div>
                </div>
            </section>

            {/* Gainers / Losers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="glass-card">
                    <h3 style={{ marginBottom: '1rem', color: 'var(--accent-green)' }}>🚀 Top Gainers</h3>
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Symbol</th><th>Price</th><th>% Change</th><th>Mkt Cap (Cr)</th></tr></thead>
                            <tbody>
                                {gainers.map(s => (
                                    <tr key={s.metadata.symbol}>
                                        <td>
                                            <Link to={`/stock/${s.metadata.identifier}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                <strong>{s.metadata.symbol}</strong>
                                            </Link>
                                        </td>
                                        <td>₹{s.metadata.lastPrice.toLocaleString()}</td>
                                        <td><span className="badge badge-up">+{s.metadata.pChange}%</span></td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{formatMktCap(s.metadata.marketCap)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="glass-card">
                    <h3 style={{ marginBottom: '1rem', color: 'var(--accent-red)' }}>📉 Top Losers</h3>
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Symbol</th><th>Price</th><th>% Change</th><th>Mkt Cap (Cr)</th></tr></thead>
                            <tbody>
                                {losers.map(s => (
                                    <tr key={s.metadata.symbol}>
                                        <td>
                                            <Link to={`/stock/${s.metadata.identifier}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                <strong>{s.metadata.symbol}</strong>
                                            </Link>
                                        </td>
                                        <td>₹{s.metadata.lastPrice.toLocaleString()}</td>
                                        <td><span className="badge badge-down">{s.metadata.pChange}%</span></td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{formatMktCap(s.metadata.marketCap)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Search + Tabs + Filter toggle */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                        className="search-box"
                        type="text"
                        placeholder="Search symbol..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') setSearch(searchInput); }}
                    />
                    <button
                        className="btn-search"
                        onClick={() => setSearch(searchInput)}
                    >🔍 Search</button>
                    {search && (
                        <button className="btn-clear" onClick={() => { setSearch(''); setSearchInput(''); }}>✕</button>
                    )}
                </div>
                <div className="filter-tabs">
                    {(['all', 'gainers', 'losers'] as TFilter[]).map(f => (
                        <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
                <button
                    className={`btn-refresh ${showFilters ? 'active-btn' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    ⚙ Filters {activeFilterCount > 0 ? <span className="filter-badge">{activeFilterCount}</span> : null}
                </button>

                <div className="filter-tabs" style={{ marginLeft: '0.5rem' }}>
                    <button
                        className={`filter-tab ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setViewMode('table')}
                    >
                        📋 Table
                    </button>
                    <button
                        className={`filter-tab ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                    >
                        📊 Charts
                    </button>
                </div>

                {(activeFilterCount > 0 || search || filter !== 'all') && (
                    <button className="btn-clear" onClick={clearFilters}>✕ Clear All</button>
                )}
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginLeft: 'auto' }}>
                    {stocks.length} / {data.data.length} securities
                </span>
            </div>

            {/* Advanced Filter Panel */}
            {showFilters && (
                <div className="glass-card filter-panel animate-in">
                    <h3 className="filter-panel-title">Advanced Filters</h3>
                    <div className="filter-grid">
                        <div className="filter-group">
                            <label>Price (₹)</label>
                            <div className="range-inputs">
                                <input type="number" placeholder="Min" value={range.minPrice} onChange={e => setRangeField('minPrice', e.target.value)} className="filter-input" />
                                <span>—</span>
                                <input type="number" placeholder="Max" value={range.maxPrice} onChange={e => setRangeField('maxPrice', e.target.value)} className="filter-input" />
                            </div>
                        </div>
                        <div className="filter-group">
                            <label>% Change</label>
                            <div className="range-inputs">
                                <input type="number" placeholder="Min" value={range.minPChange} onChange={e => setRangeField('minPChange', e.target.value)} className="filter-input" />
                                <span>—</span>
                                <input type="number" placeholder="Max" value={range.maxPChange} onChange={e => setRangeField('maxPChange', e.target.value)} className="filter-input" />
                            </div>
                        </div>
                        <div className="filter-group">
                            <label>Market Cap (₹ Cr)</label>
                            <div className="range-inputs">
                                <input type="number" placeholder="Min" value={range.minMarketCap} onChange={e => setRangeField('minMarketCap', e.target.value)} className="filter-input" />
                                <span>—</span>
                                <input type="number" placeholder="Max" value={range.maxMarketCap} onChange={e => setRangeField('maxMarketCap', e.target.value)} className="filter-input" />
                            </div>
                        </div>
                        <div className="filter-group">
                            <label>Volume (Qty)</label>
                            <div className="range-inputs">
                                <input type="number" placeholder="Min" value={range.minVolume} onChange={e => setRangeField('minVolume', e.target.value)} className="filter-input" />
                                <span>—</span>
                                <input type="number" placeholder="Max" value={range.maxVolume} onChange={e => setRangeField('maxVolume', e.target.value)} className="filter-input" />
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-clear" onClick={() => setRange(DEFAULT_RANGE)}>Reset Ranges</button>
                    </div>
                </div>
            )}

            {/* Content View (Table or Grid) */}
            <section className="glass-card" style={{ padding: viewMode === 'grid' ? '0' : '1.5rem', background: viewMode === 'grid' ? 'transparent' : 'var(--surface-color)', border: viewMode === 'grid' ? 'none' : '1px solid var(--glass-border)' }}>
                {viewMode === 'table' ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    {([
                                        ['symbol', 'Symbol'],
                                        ['lastPrice', 'IEP (₹)'],
                                        ['pChange', '% Change'],
                                        ['marketCap', 'Mkt Cap (Cr)'],
                                        ['finalQuantity', 'Volume'],
                                    ] as [SortKey, string][]).map(([key, label]) => (
                                        <th key={key} onClick={() => handleSort(key)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                            {label} {sortKey === key ? (sortAsc ? '↑' : '↓') : <span style={{ opacity: 0.3 }}>↕</span>}
                                        </th>
                                    ))}
                                    <th>Prev Close</th>
                                    <th>Change</th>
                                    <th>52W H/L</th>
                                    <th>Chart</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.map(s => (
                                    <React.Fragment key={s.metadata.symbol}>
                                        <tr className={expandedSymbol === s.metadata.symbol ? 'expanded-row' : ''}>
                                            <td>
                                                <Link to={`/stock/${s.metadata.identifier}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                    <strong>{s.metadata.symbol}</strong>
                                                </Link>
                                            </td>
                                            <td>₹{s.metadata.iep.toLocaleString()}</td>
                                            <td>
                                                <span className={`badge ${s.metadata.pChange >= 0 ? 'badge-up' : 'badge-down'}`}>
                                                    {s.metadata.pChange > 0 ? '+' : ''}{s.metadata.pChange}%
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{formatMktCap(s.metadata.marketCap)}</td>
                                            <td>{s.metadata.finalQuantity.toLocaleString()}</td>
                                            <td>₹{s.metadata.previousClose.toLocaleString()}</td>
                                            <td style={{ color: s.metadata.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                                {s.metadata.change > 0 ? '+' : ''}{s.metadata.change}
                                            </td>
                                            <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                H: {s.metadata.yearHigh.toLocaleString()}<br />
                                                L: {s.metadata.yearLow.toLocaleString()}
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => setExpandedSymbol(expandedSymbol === s.metadata.symbol ? null : s.metadata.symbol)}
                                                    className={`btn-refresh ${expandedSymbol === s.metadata.symbol ? 'active-btn' : ''}`}
                                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                >
                                                    {expandedSymbol === s.metadata.symbol ? 'Close' : 'View'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedSymbol === s.metadata.symbol && (
                                            <tr>
                                                <td colSpan={10} style={{ padding: 0, background: 'rgba(59, 130, 246, 0.03)' }}>
                                                    <InlineChart symbol={s.metadata.symbol} identifier={s.metadata.identifier} />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                {stocks.length === 0 && (
                                    <tr>
                                        <td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                                            No stocks match the current filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <section className="charts-grid" style={{ marginTop: 0 }}>
                        {stocks.map(stock => (
                            <MiniChart
                                key={stock.metadata.identifier}
                                symbol={stock.metadata.symbol}
                                identifier={stock.metadata.identifier}
                                timeframe={timeframe}
                            />
                        ))}
                        {stocks.length === 0 && (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', background: 'var(--surface-color)', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                                No stocks found matching current criteria.
                            </div>
                        )}
                    </section>
                )}
            </section>
        </div>
    );
};

export default Dashboard;
