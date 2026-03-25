import React, { useMemo, useState, useRef, useEffect } from 'react';
import type { ChartPattern } from '../utils/patternDetection';

interface ChartProps {
    data: [number, number, string, string, string][];
    width?: number;
    height?: number;
    color?: string;
    patterns?: ChartPattern[];
}

const Chart: React.FC<ChartProps> = ({ data, width = 800, height = 300, patterns = [] }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [zoomRange, setZoomRange] = useState<[number, number] | null>(null);
    const [selectionStart, setSelectionStart] = useState<number | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
 
    // Reset zoom when data changes
    useEffect(() => {
        setZoomRange(null);
        setHoverIndex(null);
    }, [data]);

    // Current data based on zoom
    const currentData = useMemo(() => {
        if (!data || data.length === 0) return [];
        if (!zoomRange) return data;
        const start = Math.max(0, zoomRange[0]);
        const end = Math.min(data.length - 1, zoomRange[1]);
        return data.slice(start, end + 1);
    }, [data, zoomRange]);

    const points = useMemo(() => {
        if (!currentData || currentData.length === 0) return '';

        const prices = currentData.map(d => d[1]);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const range = maxPrice - minPrice || 1;

        const padding = 20;
        const drawWidth = width - (padding * 2);
        const drawHeight = height - (padding * 2);

        return currentData.map((d, i) => {
            const x = padding + (i / (currentData.length - 1)) * drawWidth;
            const y = height - (padding + ((d[1] - minPrice) / range) * drawHeight);
            return `${x},${y}`;
        }).join(' ');
    }, [currentData, width, height]);

    if (!points || currentData.length < 2) {
        return (
            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', borderRadius: '1rem' }}>
                {zoomRange ? <button onClick={() => setZoomRange(null)} className="btn-refresh">Reset Zoom</button> : 'No chart data available'}
            </div>
        );
    }

    const prices = currentData.map(d => d[1]);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const isUp = lastPrice >= firstPrice;
    const finalColor = isUp ? 'var(--accent-green)' : 'var(--accent-red)';

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const padding = 20;
        const drawWidth = width - (padding * 2);

        // Calculate index relative to currentData
        let index = Math.round(((x - padding) / drawWidth) * (currentData.length - 1));
        index = Math.max(0, Math.min(index, currentData.length - 1));
        setHoverIndex(index);

        if (selectionStart !== null) {
            setSelectionEnd(index);
        }
    };

    const handleMouseDown = () => {
        if (hoverIndex !== null) {
            setSelectionStart(hoverIndex);
            setSelectionEnd(hoverIndex);
        }
    };

    const handleMouseUp = () => {
        if (selectionStart !== null && selectionEnd !== null && Math.abs(selectionStart - selectionEnd) > 5) {
            const start = Math.min(selectionStart, selectionEnd);
            const end = Math.max(selectionStart, selectionEnd);

            // Map relative indices to absolute indices if zoomed
            const absoluteStart = zoomRange ? zoomRange[0] + start : start;
            const absoluteEnd = zoomRange ? zoomRange[0] + end : end;

            setZoomRange([absoluteStart, absoluteEnd]);
        }
        setSelectionStart(null);
        setSelectionEnd(null);
    };

    const isHistorical = useMemo(() => {
        if (!data || data.length < 2) return false;
        const duration = data[data.length - 1][0] - data[0][0];
        return duration > 24 * 60 * 60 * 1000; // More than 24 hours
    }, [data]);

    const formatTime = (ms: number) => {
        const date = new Date(ms);
        if (isHistorical) {
            return date.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
        }
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const activePoint = hoverIndex !== null ? currentData[hoverIndex] : null;
    const padding = 20;
    const drawWidth = width - (padding * 2);
    const hoverX = hoverIndex !== null ? padding + (hoverIndex / (currentData.length - 1)) * drawWidth : 0;

    return (
        <div style={{ position: 'relative', width, height, background: 'rgba(0,0,0,0.2)', borderRadius: '1rem', padding: '10px', overflow: 'hidden', cursor: 'crosshair' }}>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${width} ${height}`}
                style={{ width: '100%', height: '100%', touchAction: 'none' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => { setHoverIndex(null); setSelectionStart(null); }}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            >
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={finalColor} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={finalColor} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Selection Overlay */}
                {selectionStart !== null && selectionEnd !== null && (
                    <rect
                        x={padding + (Math.min(selectionStart, selectionEnd) / (currentData.length - 1)) * drawWidth}
                        y={padding}
                        width={(Math.abs(selectionEnd - selectionStart) / (currentData.length - 1)) * drawWidth}
                        height={height - (padding * 2)}
                        fill="rgba(255, 255, 255, 0.1)"
                    />
                )}

                {/* Area under the line */}
                <polyline
                    fill="url(#chartGradient)"
                    stroke="none"
                    points={`${points} ${padding + drawWidth},${height - padding} ${padding},${height - padding}`}
                />

                {/* The trend line */}
                <polyline
                    fill="none"
                    stroke={finalColor}
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points={points}
                    style={{ transition: 'all 0.3s ease' }}
                />

                {/* Patterns Visualization */}
                {patterns.length > 0 && patterns.map((p, pIdx) => {
                    const prices = currentData.map(d => d[1]);
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    const range = maxPrice - minPrice || 1;
                    const padding = 20;
                    const drawWidth = width - (padding * 2);
                    const drawHeight = height - (padding * 2);

                    const patternPoints = p.points.map(pt => {
                        // Find relative index within currentData
                        const relIdx = currentData.findIndex(d => d[0] === pt.timestamp);
                        if (relIdx === -1) return null;
                        
                        const x = padding + (relIdx / (currentData.length - 1)) * drawWidth;
                        const y = height - (padding + ((pt.price - minPrice) / range) * drawHeight);
                        return { x, y };
                    }).filter(pt => pt !== null) as { x: number, y: number }[];

                    if (patternPoints.length < 2) return null;

                    const pathData = patternPoints.map((pt, i) => (i === 0 ? 'M' : 'L') + `${pt.x},${pt.y}`).join(' ');
                    const color = p.sentiment === 'bullish' ? 'var(--accent-green)' : 'var(--accent-red)';
                    
                    // Use confidence to vary line thickness and opacity
                    const strokeWidth = p.confidence > 0.6 ? 3 : 2;
                    const opacity = Math.max(0.4, p.confidence);
                    
                    // Y position for label - stagger based on index to prevent some overlaps
                    const labelY = Math.min(...patternPoints.map(pt => pt.y)) - (10 + (pIdx % 3) * 12);

                    return (
                        <g key={`${p.type}-${pIdx}`} style={{ pointerEvents: 'none' }}>
                            <path
                                d={pathData}
                                fill="none"
                                stroke={color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={p.confidence > 0.7 ? "0" : "4,2"} // Solid for very strong patterns
                                opacity={opacity}
                            />
                            {patternPoints.map((pt, i) => (
                                <circle key={i} cx={pt.x} cy={pt.y} r={p.confidence > 0.7 ? 4 : 3} fill={color} opacity={opacity} />
                            ))}
                            <g transform={`translate(${patternPoints[Math.floor(patternPoints.length / 2)].x}, ${labelY})`}>
                                <rect 
                                    x="-50" y="-12" width="100" height="16" rx="4"
                                    fill="rgba(15, 23, 42, 0.8)" 
                                    stroke={color} strokeWidth="1" opacity={opacity}
                                />
                                <text
                                    fill={color}
                                    fontSize="10"
                                    fontWeight="700"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                >
                                    {p.type} ({(p.confidence * 100).toFixed(0)}%)
                                </text>
                            </g>
                        </g>
                    );
                })}

                {/* Hover line and point */}
                {hoverIndex !== null && activePoint && (
                    <g>
                        <line
                            x1={hoverX} y1={padding}
                            x2={hoverX} y2={height - padding}
                            stroke="rgba(255,255,255,0.3)"
                            strokeDasharray="4"
                        />
                        <circle
                            cx={hoverX}
                            cy={height - (padding + ((activePoint[1] - Math.min(...prices)) / (Math.max(...prices) - Math.min(...prices) || 1)) * (height - padding * 2))}
                            r="6"
                            fill={finalColor}
                            stroke="white"
                            strokeWidth="2"
                        />
                    </g>
                )}
            </svg>

            {/* Tooltip */}
            {activePoint && (
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: hoverX > width / 2 ? hoverX - 160 : hoverX + 20,
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    pointerEvents: 'none',
                    zIndex: 10,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        {formatTime(activePoint[0])}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>
                        ₹{activePoint[1].toLocaleString()}
                    </div>
                    {!isHistorical && (
                        <div style={{ fontSize: '0.75rem', color: activePoint[2] === 'PO' ? 'var(--accent-blue)' : 'var(--accent-green)' }}>
                            Phase: {activePoint[2] === 'PO' ? 'Pre-Open' : 'Normal Market'}
                        </div>
                    )}
                </div>
            )}

            {/* Labels */}
            {!activePoint && (
                <>
                    <div style={{ position: 'absolute', top: '10px', right: '20px', textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>High</div>
                        <div style={{ fontWeight: 600 }}>₹{Math.max(...prices).toLocaleString()}</div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '10px', right: '20px', textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Low</div>
                        <div style={{ fontWeight: 600 }}>₹{Math.min(...prices).toLocaleString()}</div>
                    </div>
                </>
            )}

            {/* Zoom Controls */}
            {zoomRange && (
                <button
                    onClick={() => setZoomRange(null)}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        padding: '4px 10px',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                    }}
                >
                    Reset Zoom
                </button>
            )}

            <div style={{ position: 'absolute', bottom: '5px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                Drag to zoom • Hover to track price
            </div>
        </div>
    );
};

export default Chart;
