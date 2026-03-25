import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard, type MarketSegment } from '../context/DashboardContext';
import MiniChart from './MiniChart';
import type { NsePreOpenData } from '../types/nse';

const API_BASE_URL = 'http://localhost:3001/api/pre-open?key=';

const AllCharts: React.FC = () => {
    const { segment, setSegment, search, filter } = useDashboard();
    const navigate = useNavigate();
    const [data, setData] = useState<NsePreOpenData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState('1D');

    const fetchPreOpenData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}${segment}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json: NsePreOpenData = await res.json();
            setData(json);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPreOpenData();
    }, [segment]);

    const filteredStocks = useMemo(() => {
        if (!data) return [];
        let list = [...data.data];

        if (filter === 'gainers') list = list.filter(s => s.metadata.pChange > 0);
        if (filter === 'losers') list = list.filter(s => s.metadata.pChange < 0);
        if (search) list = list.filter(s => s.metadata.symbol.toLowerCase().includes(search.toLowerCase()));

        return list;
    }, [data, search, filter]);

    const timeframes = [
        { label: '1D', value: '1D' },
        { label: '1W', value: '1W' },
        { label: '1M', value: '1M' },
        { label: '1Y', value: '1Y' },
        { label: '20Y', value: '20Y' },
        { label: '30Y', value: '30Y' },
        { label: '40Y', value: '40Y' }
    ];

    if (loading) return (
        <div className="loading-screen">
            <div className="spinner" />
            <p>Loading market data...</p>
        </div>
    );

    if (error) return (
        <div className="loading-screen">
            <div style={{ color: 'var(--accent-red)', fontSize: '3rem', marginBottom: '1rem' }}>⚠</div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Failed to Load Charts</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => fetchPreOpenData()} className="btn-refresh">Retry</button>
                <button onClick={() => navigate('/')} className="btn-retry">Back to Dashboard</button>
            </div>
        </div>
    );

    return (
        <div className="dashboard animate-in">
            <header className="header" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/')} className="btn-refresh" style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '0.4rem 0.8rem' }}>← Back</button>
                    <div>
                        <h1 className="title">Market Sentiment <span style={{ color: 'var(--accent-blue)', fontSize: '1rem' }}>QUANT</span></h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{segment} Segment — {filteredStocks.length} symbols</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="timeframe-selector">
                        {timeframes.map(tf => (
                            <button
                                key={tf.value}
                                className={`timeframe-btn ${timeframe === tf.value ? 'active' : ''}`}
                                onClick={() => setTimeframe(tf.value)}
                            >
                                {tf.label}
                            </button>
                        ))}
                    </div>

                    <select
                        className="filter-tab"
                        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', color: 'var(--text-primary)', cursor: 'pointer', outline: 'none' }}
                        value={segment}
                        onChange={(e) => setSegment(e.target.value as MarketSegment)}
                    >
                        <option value="ALL">All Stocks</option>
                        <option value="FO">F&O Stocks</option>
                        <option value="NIFTY">Nifty 50</option>
                        <option value="BANKNIFTY">Bank Nifty</option>
                    </select>
                </div>
            </header>

            <section className="charts-grid">
                {filteredStocks.map(stock => (
                    <MiniChart
                        key={stock.metadata.identifier}
                        symbol={stock.metadata.symbol}
                        identifier={stock.metadata.identifier}
                        timeframe={timeframe}
                    />
                ))}
                {filteredStocks.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        No stocks found matching current criteria.
                    </div>
                )}
            </section>
        </div>
    );
};

export default AllCharts;
