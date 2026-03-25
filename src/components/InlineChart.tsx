import React, { useState, useEffect } from 'react';
import type { NseChartData } from '../types/nse';
import Chart from './Chart';
import { detectPatterns, type ChartPattern } from '../utils/patternDetection';
import { calculateQuantMetrics, type QuantMetrics } from '../utils/quant';

interface InlineChartProps {
    symbol: string;
    identifier: string;
}

const InlineChart: React.FC<InlineChartProps> = ({ symbol, identifier }) => {
    const [chartData, setChartData] = useState<NseChartData | null>(null);
    const [patterns, setPatterns] = useState<ChartPattern[]>([]);
    const [quant, setQuant] = useState<QuantMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/chart-data?symbol=${identifier}&days=1D`);
                if (!res.ok) throw new Error('Failed to fetch chart data');
                const data = await res.json();
                setChartData(data);
                if (data?.grapthData) {
                    data.grapthData.sort((a: any, b: any) => a[0] - b[0]);
                    setPatterns(detectPatterns(data.grapthData));
                    setQuant(calculateQuantMetrics(data.grapthData));
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [identifier]);

    if (loading) return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="mini-spinner" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Loading chart for {symbol}...</p>
        </div>
    );

    if (error) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent-red)' }}>
            <p>⚠ {error}</p>
        </div>
    );

    if (!chartData || !chartData.grapthData || chartData.grapthData.length < 2) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>No intraday data available for {symbol}</p>
        </div>
    );

    return (
        <div className="animate-in" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '0 0 0.75rem 0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h4 style={{ margin: 0, color: 'var(--accent-blue)', fontSize: '1rem' }}>{symbol} Analysis</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>Intraday pattern detection active</p>
                </div>
                {quant && (
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: quant.drawdownPercent < -5 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                            {quant.drawdownPercent.toFixed(2)}% <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-secondary)' }}>from peak</span>
                        </div>
                        {quant.isBreak && <span className="break-badge">BREAK DETECTED</span>}
                    </div>
                )}
            </div>
            <Chart data={chartData.grapthData} height={220} patterns={patterns} />
        </div>
    );
};

export default InlineChart;
