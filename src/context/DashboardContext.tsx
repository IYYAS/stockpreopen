import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type MarketSegment = 'FO' | 'ALL' | 'NIFTY' | 'BANKNIFTY';
export type SortKey = 'symbol' | 'lastPrice' | 'pChange' | 'finalQuantity' | 'marketCap';
export type TFilter = 'all' | 'gainers' | 'losers';

export interface RangeFilter {
    minPrice: string;
    maxPrice: string;
    minPChange: string;
    maxPChange: string;
    minMarketCap: string;
    maxMarketCap: string;
    minVolume: string;
    maxVolume: string;
}

export const DEFAULT_RANGE: RangeFilter = {
    minPrice: '', maxPrice: '',
    minPChange: '', maxPChange: '',
    minMarketCap: '', maxMarketCap: '',
    minVolume: '', maxVolume: '',
};

interface DashboardContextType {
    segment: MarketSegment;
    setSegment: React.Dispatch<React.SetStateAction<MarketSegment>>;
    sortKey: SortKey;
    setSortKey: React.Dispatch<React.SetStateAction<SortKey>>;
    sortAsc: boolean;
    setSortAsc: React.Dispatch<React.SetStateAction<boolean>>;
    filter: TFilter;
    setFilter: React.Dispatch<React.SetStateAction<TFilter>>;
    search: string;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
    searchInput: string;
    setSearchInput: React.Dispatch<React.SetStateAction<string>>;
    showFilters: boolean;
    setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
    range: RangeFilter;
    setRange: React.Dispatch<React.SetStateAction<RangeFilter>>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [segment, setSegment] = useState<MarketSegment>('ALL');
    const [sortKey, setSortKey] = useState<SortKey>('pChange');
    const [sortAsc, setSortAsc] = useState(false);
    const [filter, setFilter] = useState<TFilter>('all');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [range, setRange] = useState<RangeFilter>(DEFAULT_RANGE);

    return (
        <DashboardContext.Provider value={{
            segment, setSegment,
            sortKey, setSortKey,
            sortAsc, setSortAsc,
            filter, setFilter,
            search, setSearch,
            searchInput, setSearchInput,
            showFilters, setShowFilters,
            range, setRange
        }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
    return context;
};
