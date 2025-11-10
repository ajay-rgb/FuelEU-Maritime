import { useState } from 'react';
import RoutesTab from './components/RoutesTab';
import CompareTab from './components/CompareTab';
import BankingTab from './components/BankingTab';
import PoolingTab from './components/PoolingTab';
import './index.css';

type Tab = 'routes' | 'compare' | 'banking' | 'pooling';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('routes');

  const tabs = [
    { id: 'routes' as Tab, label: 'Routes', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
    { id: 'compare' as Tab, label: 'Compare', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'banking' as Tab, label: 'Banking', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { id: 'pooling' as Tab, label: 'Pooling', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Modern Header with Gradient */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-lime-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-teal-900 bg-clip-text text-transparent">
                  FuelEU Maritime
                </h1>
                <p className="text-xs text-slate-500 font-medium">Compliance Platform</p>
              </div>
            </div>

            {/* User Profile Section */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-slate-600 hover:text-teal-700 transition-colors rounded-lg hover:bg-slate-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">Captain Smith</p>
                  <p className="text-xs text-slate-500">Fleet Manager</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold shadow-md">
                  CS
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card group hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs bg-lime-400 text-teal-900 px-2 py-1 rounded-full font-semibold">+5.2%</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">24</p>
            <p className="text-teal-100 text-sm font-medium">Total Routes</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all group hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">-2.4%</span>
            </div>
            <p className="text-3xl font-bold text-slate-800 mb-1">€32K</p>
            <p className="text-slate-600 text-sm font-medium">Potential Penalties</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all group hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-lime-100 to-lime-200 rounded-lg">
                <svg className="w-6 h-6 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xs bg-lime-100 text-lime-700 px-2 py-1 rounded-full font-semibold">+12.5%</span>
            </div>
            <p className="text-3xl font-bold text-slate-800 mb-1">85.2%</p>
            <p className="text-slate-600 text-sm font-medium">Compliance Rate</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all group hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">Active</span>
            </div>
            <p className="text-3xl font-bold text-slate-800 mb-1">12</p>
            <p className="text-slate-600 text-sm font-medium">Active Pools</p>
          </div>
        </div>

        {/* Modern Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'routes' && <RoutesTab />}
          {activeTab === 'compare' && <CompareTab />}
          {activeTab === 'banking' && <BankingTab />}
          {activeTab === 'pooling' && <PoolingTab />}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pb-8 text-center text-slate-500 text-sm">
        <p>© 2025 FuelEU Maritime Platform · Regulation Compliance at 100%</p>
      </footer>
    </div>
  );
}

export default App;
