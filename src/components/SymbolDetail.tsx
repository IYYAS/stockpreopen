import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { NseChartData } from '../types/nse';
import Chart from './Chart';
import { detectPatterns, type ChartPattern } from '../utils/patternDetection';
import { calculateQuantMetrics, calculateMultiTimeframes, generateSignal, type QuantMetrics, type TimeframeMetric, type TradeSignal } from '../utils/quant';

const SymbolDetail: React.FC = () => {
    const { symbol } = useParams<{ symbol: string }>();
    const navigate = useNavigate();
    const [chartData, setChartData] = useState<NseChartData | null>(null);
    const [patterns, setPatterns] = useState<ChartPattern[]>([]);
    const [quant, setQuant] = useState<QuantMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState('1D');

    // For race condition protection
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchChartData = async () => {
        // Abort any ongoing fetch request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const newAbortController = new AbortController();
        abortControllerRef.current = newAbortController;

        try {
            setLoading(true);
            setError(null); // Clear previous errors
            const res = await fetch(`/api/chart-data?symbol=${symbol}&days=${timeframe}`, { signal: newAbortController.signal });
            if (!res.ok) throw new Error('Failed to fetch chart data');
            const data = await res.json();
            setChartData(data);
                if (data?.grapthData) {
                    // Sort by timestamp ascending to handle reverse-ordered responses
                    data.grapthData.sort((a: any, b: any) => a[0] - b[0]);
                    setPatterns(detectPatterns(data.grapthData));
                    setQuant(calculateQuantMetrics(data.grapthData));
                }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                // Request was intentionally aborted, do nothing
                console.log('Fetch aborted:', err.message);
            } else {
                setError(err.message);
            }
        } finally {
            // Only set loading to false if this is the latest request
            if (abortControllerRef.current === newAbortController) {
                setLoading(false);
                abortControllerRef.current = null; // Clear the ref after the request is complete
            }
        }
    };

    useEffect(() => {
        if (symbol) fetchChartData();

        // Cleanup function to abort any pending request when component unmounts or dependencies change
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [symbol, timeframe]);

    const multiTimeframes = React.useMemo(() => {
        if (!chartData?.grapthData || timeframe === '1D') return [];
        return calculateMultiTimeframes(chartData.grapthData);
    }, [chartData, timeframe]);

    const signal = React.useMemo(() => {
        if (!quant) return null;
        return generateSignal(quant, patterns);
    }, [quant, patterns]);

    const timeframes = [
        { label: '1D', value: '1D' },
        { label: '1W', value: '1W' },
        { label: '1M', value: '1M' },
        { label: '1Y', value: '1Y' },
        { label: '20Y', value: '20Y' },
        { label: '30Y', value: '30Y' },
        { label: '40Y', value: '40Y' }
    ];

    if (error) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ color: 'var(--accent-red)', fontSize: '3rem' }}>⚠</div>
            <h2 style={{ color: 'var(--text-primary)' }}>Analysis Error</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <button onClick={() => navigate('/')} className="btn-retry">Back to Dashboard</button>
        </div>
    );

    return (
        <div className="dashboard animate-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
            <header className="header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/')} className="btn-refresh" style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '0.4rem 0.8rem' }}>← Back</button>
                    <div>
                        <h1 className="title" style={{ margin: 0 }}>{symbol}</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Quant Trend Analysis — {timeframe}</p>
                    </div>
                </div>

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
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
                <section className="glass-card" style={{ padding: '1.5rem', position: 'relative' }}>
                    {loading && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, borderRadius: '1rem' }}>
                            <div className="spinner" />
                        </div>
                    )}
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1rem' }}>
                        <span>Price Movement ({timeframe})</span>
                        {chartData?.grapthData?.length && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                                {chartData.grapthData.length} samples
                            </span>
                        )}
                    </h3>
                    {chartData && <Chart data={chartData.grapthData} patterns={patterns} height={350} width={600} />}
                </section>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className={`glass-card ${quant?.isBreak ? 'break-active' : ''}`} style={{ padding: '1.5rem', borderLeft: quant?.isBreak ? '4px solid var(--accent-red)' : undefined }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Quant Metrics</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Current Price</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{quant?.currentPrice.toLocaleString()}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{timeframe} Peak</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>₹{quant?.peakPrice.toLocaleString()}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Drawdown</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: (quant?.drawdownPercent ?? 0) < 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                                    {quant?.drawdownPercent.toFixed(2)}%
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Max Drawdown</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-red)' }}>
                                        {quant?.maxDrawdownPercent.toFixed(2)}%
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Recovery</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-green)' }}>
                                        +{quant?.recoveryPercent.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                            {quant?.isBreak && (
                                <div className="break-badge" style={{ padding: '0.5rem', textAlign: 'center', width: '100%', fontSize: '0.8rem' }}>
                                    SIGNAL: CRITICAL BREAK
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Signal & Sentiment</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {signal && (
                                <div style={{ 
                                    padding: '1rem', 
                                    borderRadius: '0.75rem', 
                                    background: signal.type.includes('BUY') ? 'rgba(16, 185, 129, 0.1)' : signal.type.includes('SELL') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                    border: `1px solid ${signal.type.includes('BUY') ? 'var(--accent-green)' : signal.type.includes('SELL') ? 'var(--accent-red)' : 'var(--accent-blue)'}`,
                                    textAlign: 'center'
                                }}>
                                    <div style={{ 
                                        fontSize: '1.25rem', 
                                        fontWeight: 800, 
                                        color: signal.type.includes('BUY') ? 'var(--accent-green)' : signal.type.includes('SELL') ? 'var(--accent-red)' : 'var(--accent-blue)',
                                        marginBottom: '0.25rem'
                                    }}>
                                        {signal.type.replace('_', ' ')}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                        {signal.reason}
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Trend</span>
                                    <span style={{ color: (quant?.drawdownPercent ?? 0) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                                        {(quant?.drawdownPercent ?? 0) >= 0 ? 'BULLISH' : 'BEARISH'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Confidence Score</span>
                                    <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{signal?.score.toFixed(0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {multiTimeframes.length > 0 && (
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Historical Drop Set</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {multiTimeframes.map((m: TimeframeMetric) => (
                                    <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{m.label} Drop</span>
                                        <span style={{ color: m.drawdown < 0 ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 600, fontSize: '0.85rem' }}>
                                            {m.drawdown.toFixed(1)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {patterns.length > 0 && (
                <div className="glass-card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Detected Chart Patterns</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                        {patterns.map((p, idx) => (
                            <div key={idx} style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderLeft: `4px solid ${p.sentiment === 'bullish' ? 'var(--accent-green)' : 'var(--accent-red)'}` }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{p.type}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sentiment: <span style={{ color: p.sentiment === 'bullish' ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>{p.sentiment.toUpperCase()}</span></div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Confidence: {(p.confidence * 100).toFixed(0)}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SymbolDetail;
