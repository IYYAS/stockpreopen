import type { ChartPattern } from './patternDetection';

export interface QuantMetrics {
    peakPrice: number;
    peakTimestamp: number;
    currentPrice: number;
    drawdownPercent: number;
    maxDrawdownPercent: number;
    recoveryPercent: number;
    lowSincePeak: number;
    isBreak: boolean;
    breakLevel: number;
}

export interface TimeframeMetric {
    label: string;
    drawdown: number;
    peak: number;
}

export type SignalType = 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';

export interface TradeSignal {
    type: SignalType;
    reason: string;
    score: number; // -100 to 100
}

/**
 * Calculates quant metrics like drawdown from peak, max drawdown reached, and recovery from low.
 * @param data Array of [timestamp, price, ...] from NSE API
 * @returns QuantMetrics object
 */
export function calculateQuantMetrics(data: [number, number, ...any[]][]): QuantMetrics | null {
    if (!data || data.length === 0) return null;

    const prices = data.map(d => d[1]);
    const currentPrice = prices[prices.length - 1];
    
    // Find absolute peak in the current data range
    let peakPrice = prices[0];
    let peakIndex = 0;
    
    for (let i = 1; i < prices.length; i++) {
        if (prices[i] >= peakPrice) {
            peakPrice = prices[i];
            peakIndex = i;
        }
    }
    
    const peakTimestamp = data[peakIndex][0];
    
    // Find the lowest point REACHED after the peak
    let lowSincePeak = peakPrice;
    for (let i = peakIndex; i < prices.length; i++) {
        if (prices[i] < lowSincePeak) {
            lowSincePeak = prices[i];
        }
    }
    
    // Calculate drawdown (percentage down from peak to current)
    const drawdownPercent = ((currentPrice - peakPrice) / peakPrice) * 100;
    
    // Calculate max drawdown (percentage down from peak to lowest point after peak)
    const maxDrawdownPercent = ((lowSincePeak - peakPrice) / peakPrice) * 100;
    
    // Calculate recovery (percentage up from the lowest point after peak)
    const recoveryPercent = lowSincePeak > 0 ? ((currentPrice - lowSincePeak) / lowSincePeak) * 100 : 0;

    // A "break" is defined as being more than 5% below the peak
    const isBreak = drawdownPercent < -5;

    return {
        peakPrice,
        peakTimestamp,
        currentPrice,
        drawdownPercent,
        maxDrawdownPercent,
        recoveryPercent,
        lowSincePeak,
        isBreak,
        breakLevel: peakPrice * 0.95 // 5% below peak
    };
}

/**
 * Calculates drawdown metrics for multiple historical windows from a single dataset.
 */
export function calculateMultiTimeframes(data: [number, number, ...any[]][]): TimeframeMetric[] {
    if (!data || data.length === 0) return [];

    const latestTs = data[data.length - 1][0];
    const latestPrice = data[data.length - 1][1];

    const windows = [
        { label: '1W', ms: 7 * 24 * 60 * 60 * 1000 },
        { label: '1M', ms: 30 * 24 * 60 * 60 * 1000 },
        { label: '1Y', ms: 365 * 24 * 60 * 60 * 1000 },
        { label: '10Y', ms: 10 * 365 * 24 * 60 * 60 * 1000 },
        { label: '20Y', ms: 20 * 365 * 24 * 60 * 60 * 1000 },
        { label: 'Full', ms: Infinity }
    ];

    return windows.map(win => {
        const threshold = latestTs - win.ms;
        const slice = data.filter(d => d[0] >= threshold);
        if (slice.length === 0) return { label: win.label, drawdown: 0, peak: 0 };

        const peak = Math.max(...slice.map(s => s[1]));
        const drawdown = ((latestPrice - peak) / peak) * 100;
        return { label: win.label, drawdown, peak };
    });
}

/**
 * Generates a Buy/Sell signal based on quant metrics and chart patterns.
 */
export function generateSignal(quant: QuantMetrics, patterns: ChartPattern[]): TradeSignal {
    let score = 0;
    const reasons: string[] = [];

    // Factor 1: Drawdown & Recovery
    if (quant.recoveryPercent > 8) {
        score += 35;
        reasons.push('Healthy recovery from recent low');
    }
    
    if (quant.drawdownPercent < -20) {
        score -= 40;
        reasons.push('Deep historical drawdown');
    } else if (quant.isBreak) {
        score -= 25;
        reasons.push('Price break level violated');
    }

    // Factor 2: Chart Patterns
    patterns.forEach(p => {
        const weight = p.confidence * 45;
        if (p.sentiment === 'bullish') {
            score += weight;
            reasons.push(`Bullish ${p.type} (Conf: ${(p.confidence*100).toFixed(0)}%)`);
        } else {
            score -= weight;
            reasons.push(`Bearish ${p.type} (Conf: ${(p.confidence*100).toFixed(0)}%)`);
        }
    });

    // Factor 3: Momentum
    if (quant.currentPrice > quant.peakPrice * 0.95) {
        score += 15;
        reasons.push('Strong momentum near peak');
    }

    // Clamp score
    score = Math.max(-100, Math.min(100, score));

    let type: SignalType = 'HOLD';
    if (score >= 50) type = 'STRONG_BUY';
    else if (score >= 15) type = 'BUY';
    else if (score <= -50) type = 'STRONG_SELL';
    else if (score <= -15) type = 'SELL';

    return {
        type,
        reason: reasons.length > 0 ? reasons[0] : 'Consolidating / Neutral trend',
        score
    };
}
