
export interface Point {
    x: number;
    y: number;
    index: number;
    timestamp: number;
    price: number;
}

export interface ChartPattern {
    type: 'Double Top' | 'Double Bottom' | 'Head and Shoulders' | 'Inverted Head and Shoulders' | 'Ascending Triangle' | 'Descending Triangle' | 'Symmetrical Triangle' | 'Rising Wedge' | 'Falling Wedge' | 'Flag' | 'Pennant';
    points: Point[];
    confidence: number;
    sentiment: 'bullish' | 'bearish';
}

/**
 * Finds local peaks and valleys in price data
 */
export function findExtremes(data: [number, number, string, string, string][], windowSize: number = 5): Point[] {
    const extremes: Point[] = [];
    
    for (let i = windowSize; i < data.length - windowSize; i++) {
        const currentPrice = data[i][1];
        let isPeak = true;
        let isValley = true;

        for (let j = i - windowSize; j <= i + windowSize; j++) {
            if (i === j) continue;
            if (data[j][1] >= currentPrice) isPeak = false;
            if (data[j][1] <= currentPrice) isValley = false;
        }

        if (isPeak || isValley) {
            extremes.push({
                x: i,
                y: currentPrice,
                index: i,
                timestamp: data[i][0],
                price: currentPrice
            });
        }
    }
    
    return extremes;
}

/**
 * Detects patterns from extremes with scoring and filtering
 */
export function detectPatterns(data: [number, number, string, string, string][]): ChartPattern[] {
    const extremes = findExtremes(data, 15); // Increased window for stronger peaks
    let patterns: ChartPattern[] = [];

    if (extremes.length < 5) return [];

    const getScore = (pts: Point[], type: string): number => {
        const prices = pts.map(p => p.y);
        const maxVal = Math.max(...prices);
        const minVal = Math.min(...prices);
        const magnitude = (maxVal - minVal) / minVal;

        // Base score on relative magnitude of the move
        let score = Math.min(magnitude * 50, 0.95); // Magnitude weight

        // Symmetry check for H&S
        if (type === 'Head and Shoulders' || type === 'Inverted Head and Shoulders') {
            const lShoulder = pts[0].y;
            const rShoulder = pts[4].y;
            const symmetry = 1 - (Math.abs(lShoulder - rShoulder) / lShoulder);
            score *= symmetry;
        }

        return score;
    };

    // Simple Double Top detection
    for (let i = 0; i < extremes.length - 3; i++) {
        const p1 = extremes[i];
        const p2 = extremes[i+1];
        const p3 = extremes[i+2];

        // Peak, Valley, Peak (Double Top)
        if (p1.y > p2.y && p3.y > p2.y) {
            const diff = Math.abs(p1.y - p3.y) / p1.y;
            const magnitude = (p1.y - p2.y) / p2.y;
            
            if (diff < 0.003 && magnitude > 0.0015) { // Thresholds for "strength"
                 patterns.push({
                     type: 'Double Top',
                     points: [p1, p2, p3],
                     confidence: getScore([p1, p2, p3], 'Double Top'),
                     sentiment: 'bearish'
                 });
            }
        }
        
        // Valley, Peak, Valley (Double Bottom)
        if (p1.y < p2.y && p3.y < p2.y) {
            const diff = Math.abs(p1.y - p3.y) / p1.y;
            const magnitude = (p2.y - p1.y) / p1.y;

            if (diff < 0.003 && magnitude > 0.0015) {
                patterns.push({
                    type: 'Double Bottom',
                    points: [p1, p2, p3],
                    confidence: getScore([p1, p2, p3], 'Double Bottom'),
                    sentiment: 'bullish'
                });
            }
       }
    }

    // Head and Shoulders
    for (let i = 0; i < extremes.length - 5; i++) {
        const pts = extremes.slice(i, i + 5);
        const [p1, p2, p3, p4, p5] = pts;

        // Check for H&S (Peak, Valley, Higher Peak, Valley, Lower Peak)
        if (p1.y > p2.y && p3.y > p1.y && p3.y > p5.y && p5.y > p4.y) {
            const shoulderDiff = Math.abs(p1.y - p5.y) / p1.y;
            const headMagnitude = (p3.y - Math.max(p1.y, p5.y)) / Math.max(p1.y, p5.y);

            if (shoulderDiff < 0.005 && headMagnitude > 0.001) {
                patterns.push({
                    type: 'Head and Shoulders',
                    points: pts,
                    confidence: getScore(pts, 'Head and Shoulders'),
                    sentiment: 'bearish'
                });
            }
        }
    }

    // Filter Out weak patterns and overlaps
    // 1. Sort by confidence descending
    patterns.sort((a, b) => b.confidence - a.confidence);

    // 2. Remove overlaps (keep strongest)
    const filteredPatterns: ChartPattern[] = [];
    const usedIndices = new Set<number>();

    for (const p of patterns) {
        const patternIndices = p.points.map(pt => pt.index);
        let overlaps = false;
        
        // If any point in this pattern is too close to a point in a higher-ranked pattern
        for (const idx of patternIndices) {
            for (let j = idx - 10; j <= idx + 10; j++) {
                if (usedIndices.has(j)) {
                    overlaps = true;
                    break;
                }
            }
            if (overlaps) break;
        }

        if (!overlaps && p.confidence > 0.15) { // Minimum threshold for "strong"
            filteredPatterns.push(p);
            patternIndices.forEach(idx => usedIndices.add(idx));
        }
    }

    return filteredPatterns;
}
