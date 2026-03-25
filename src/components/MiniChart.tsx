import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { NseChartData } from '../types/nse';
import { detectPatterns, type ChartPattern } from '../utils/patternDetection';
import { calculateQuantMetrics, type QuantMetrics } from '../utils/quant';

interface MiniChartProps {
    symbol: string;
    identifier: string;
    timeframe?: string;
}

const MiniChart: React.FC<MiniChartProps> = ({ symbol, identifier, timeframe = '1D' }) => {
    const [chartData, setChartData] = useState<NseChartData | null>(null);
    const [patterns, setPatterns] = useState<ChartPattern[]>([]);
    const [quant, setQuant] = useState<QuantMetrics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (isVisible) {
            fetchChartData();
        }
    }, [isVisible, timeframe]);

    const fetchChartData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/chart-data?symbol=${identifier}&days=${timeframe}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setChartData(data);
            if (data?.grapthData && data.grapthData.length > 0) {
                // Sort by timestamp ascending to handle reverse-ordered responses
                data.grapthData.sort((a: any, b: any) => a[0] - b[0]);
                setPatterns(detectPatterns(data.grapthData));
                setQuant(calculateQuantMetrics(data.grapthData));
            }
        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const renderChart = () => {
        if (!chartData || !chartData.grapthData || chartData.grapthData.length < 2) {
            return <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>No {timeframe} data</span>;
        }

        const points = chartData.grapthData;
        const prices = points.map(p => p[1]);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const range = max - min || 1;

        const width = 160;
        const height = 60;
        const padding = 4;

        const pathData = points.map((p, i) => {
            const x = (i / (points.length - 1)) * width;
            const y = height - (padding + ((p[1] - min) / range) * (height - padding * 2));
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');

        const isUp = prices[prices.length - 1] >= prices[0];
        const color = isUp ? 'var(--accent-green)' : 'var(--accent-red)';

        return (
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                <path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0 0 4px ' + (isUp ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)') + ')' }}
                />

                {patterns.length > 0 && patterns.map((p, pIdx) => {
                    const patternPoints = p.points.map(pt => {
                        const relIdx = chartData!.grapthData.findIndex(d => d[0] === pt.timestamp);
                        if (relIdx === -1) return null;
                        const x = (relIdx / (chartData!.grapthData.length - 1)) * width;
                        const y = height - (padding + ((pt.price - min) / range) * (height - padding * 2));
                        return { x, y };
                    }).filter(pt => pt !== null) as { x: number, y: number }[];

                    if (patternPoints.length < 2) return null;

                    const pPath = patternPoints.map((pt, i) => (i === 0 ? 'M' : 'L') + `${pt.x},${pt.y}`).join(' ');
                    const pColor = p.sentiment === 'bullish' ? 'var(--accent-green)' : 'var(--accent-red)';
                    const pOpacity = Math.max(0.4, p.confidence);

                    return (
                        <g key={pIdx}>
                            <path 
                                d={pPath} 
                                fill="none" 
                                stroke={pColor} 
                                strokeWidth="2" 
                                strokeDasharray="3,1" 
                                opacity={pOpacity} 
                            />
                            {patternPoints.map((pt, i) => (
                                <circle key={i} cx={pt.x} cy={pt.y} r="1.5" fill={pColor} opacity={pOpacity} />
                            ))}
                            <text
                                x={patternPoints[Math.floor(patternPoints.length / 2)].x}
                                y={Math.min(...patternPoints.map(pt => pt.y)) - 4}
                                fill={pColor}
                                fontSize="5"
                                fontWeight="700"
                                textAnchor="middle"
                                opacity={pOpacity}
                                style={{ pointerEvents: 'none', textShadow: '0 0 2px rgba(0,0,0,0.8)' }}
                            >
                                {p.type === 'Head and Shoulders' ? 'H&S' : p.type}
                            </text>
                        </g>
                    );
                })}
            </svg>
        );
    };

    return (
        <div ref={containerRef} className={`glass-card mini-chart-card ${quant?.isBreak ? 'break-active' : ''}`}>
            <div className="mini-chart-header">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Link to={`/stock/${identifier}`} className="mini-chart-symbol">
                        {symbol}
                    </Link>
                    {quant && (
                        <span className={`quant-text ${quant.drawdownPercent < -5 ? 'break' : ''}`}>
                            {quant.drawdownPercent.toFixed(1)}% Down
                        </span>
                    )}
                </div>
                {chartData && chartData.grapthData && chartData.grapthData.length > 0 && (
                    <div style={{ textAlign: 'right' }}>
                        <div className={`mini-chart-price ${chartData.grapthData[chartData.grapthData.length - 1][1] >= chartData.grapthData[0][1] ? 'up' : 'down'}`}>
                            ₹{chartData.grapthData[chartData.grapthData.length - 1][1].toLocaleString()}
                        </div>
                        {quant?.isBreak && <span className="break-badge">BREAK</span>}
                    </div>
                )}
            </div>
            <div className="mini-chart-body">
                {loading ? (
                    <div className="mini-spinner" />
                ) : error ? (
                    <span className="error-text">! Fetch Error</span>
                ) : chartData ? (
                    renderChart()
                ) : (
                    <div className="placeholder" />
                )}
            </div>
        </div>
    );
};

export default MiniChart;
