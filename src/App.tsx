import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Dashboard from './components/Dashboard';
import SymbolDetail from './components/SymbolDetail';
import AllCharts from './components/AllCharts';
import NewsFeed from './components/NewsFeed';
import GlobalNews from './components/GlobalNews';
import IPCPage from './components/IPCPage';
import { DashboardProvider } from './context/DashboardContext';

function App() {
  return (
    <Router>
      <DashboardProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/all-charts" element={<AllCharts />} />
            <Route path="/news" element={<NewsFeed />} />
            <Route path="/global-news" element={<GlobalNews />} />
            <Route path="/ipc" element={<IPCPage />} />
            <Route path="/stock/:symbol" element={<SymbolDetail />} />
          </Routes>
        </div>
      </DashboardProvider>
    </Router>
  );
}

export default App;
