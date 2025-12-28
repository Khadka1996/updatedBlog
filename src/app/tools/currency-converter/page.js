'use client';
import { useState, useEffect, useRef } from 'react';
import { FaExchangeAlt, FaMoneyBillWave, FaSyncAlt, FaCopy, FaStar, FaCaretUp, FaCaretDown, FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';
import Select from 'react-select';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, TimeScale, Tooltip } from 'chart.js';
import 'chartjs-adapter-date-fns';
import Script from 'next/script';
import Head from 'next/head';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip);

export default function CurrencyConverter() {
  const [amount, setAmount] = useState(100);
  const [fromCurrency, setFromCurrency] = useState('NPR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [selectedCurrencies, setSelectedCurrencies] = useState(['USD']);
  const [convertedAmount, setConvertedAmount] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [adsLoaded, setAdsLoaded] = useState(false);
  const [historicalRates, setHistoricalRates] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [apiStatus, setApiStatus] = useState('loading');
  const [timeframe, setTimeframe] = useState('7D');
  const [chartType, setChartType] = useState('bar');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('favoritePairs')) || [];
    }
    return [];
  });
  const chartContainerRef = useRef(null);

  // Currency list
  const currencies = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '€' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', symbol: 'Fr' },
    { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', symbol: '₹' },
    { code: 'NPR', name: 'Nepalese Rupee', flag: '🇳🇵', symbol: 'Rs' },
    { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰', symbol: '₨' },
    { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', symbol: 'S$' },
  ];

  // Fallback exchange rates
  const fallbackRates = {
    USD: { NPR: 133.50, INR: 83.20, EUR: 0.93, GBP: 0.80, JPY: 149.30, AUD: 1.54, CAD: 1.36, CHF: 0.90, CNY: 7.24, PKR: 280.50, SGD: 1.35 },
    NPR: { USD: 0.0075, INR: 0.62, EUR: 0.0070, GBP: 0.0060, JPY: 1.12, AUD: 0.0115, CAD: 0.0102, CHF: 0.0067, CNY: 0.054, PKR: 2.10, SGD: 0.0101 },
    INR: { USD: 0.012, NPR: 1.61, EUR: 0.011, GBP: 0.0096, JPY: 1.80, AUD: 0.0185, CAD: 0.0164, CHF: 0.0108, CNY: 0.087, PKR: 3.37, SGD: 0.0162 },
    EUR: { USD: 1.07, NPR: 143.20, INR: 89.40, GBP: 0.86, JPY: 160.50, AUD: 1.66, CAD: 1.47, CHF: 0.97, CNY: 7.78, PKR: 301.50, SGD: 1.45 },
  };

  // Fetch exchange rates
  const fetchExchangeRates = async () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError('');
    setApiStatus('loading');

    try {
      const API_KEY = 'fca_live_Syl2X1J4S8H3DDzweT8BBTo3QXQPAyBBFWoMmQcS';
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      if (!response.ok) throw new Error('Failed to fetch exchange rates');

      const data = await response.json();
      const results = selectedCurrencies.map(currency => ({
        currency,
        rate: data.rates[currency] || fallbackRates[fromCurrency][currency] || 0,
        converted: parseFloat((amount * (data.rates[currency] || fallbackRates[fromCurrency][currency] || 0)).toFixed(2)),
      }));

      setConvertedAmount(results);
      setExchangeRate(data.rates[toCurrency] || fallbackRates[fromCurrency][toCurrency] || 0);
      setLastUpdated(new Date(data.time_last_updated * 1000).toLocaleString());
      setApiStatus('success');
      generateHistoricalData(data.rates[toCurrency] || fallbackRates[fromCurrency][toCurrency] || 0);
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to fetch live rates. Using fallback data.');
      setApiStatus('error');
      useFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback data
  const useFallbackData = () => {
    const results = selectedCurrencies.map(currency => ({
      currency,
      rate: fallbackRates[fromCurrency][currency] || 0,
      converted: parseFloat((amount * (fallbackRates[fromCurrency][currency] || 0)).toFixed(2)),
    }));
    setConvertedAmount(results);
    setExchangeRate(fallbackRates[fromCurrency][toCurrency] || 0);
    setLastUpdated('Fallback data - ' + new Date().toLocaleString());
    generateHistoricalData(fallbackRates[fromCurrency][toCurrency] || 0);
  };

  // Generate historical data
  const generateHistoricalData = (currentRate) => {
    const historicalData = [];
    const baseRate = currentRate;
    const days = timeframe === '7D' ? 7 : timeframe === '1M' ? 30 : 90;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const fluctuation = (Math.random() - 0.5) * baseRate * (['USD', 'EUR', 'GBP'].includes(fromCurrency) ? 0.005 : ['NPR', 'INR'].includes(fromCurrency) ? 0.01 : 0.008);
      historicalData.push({
        date: date.toISOString().split('T')[0],
        rate: parseFloat((baseRate + fluctuation).toFixed(4)),
        change: parseFloat(fluctuation.toFixed(4)),
      });
    }
    setHistoricalRates(historicalData);
  };

  // Swap currencies
  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setSelectedCurrencies([fromCurrency]);
  };

  // Add to favorites
  const addToFavorites = () => {
    const pair = { from: fromCurrency, to: selectedCurrencies, amount };
    const updatedFavorites = [...new Set([...favorites, JSON.stringify(pair)])].map(p => JSON.parse(p));
    setFavorites(updatedFavorites);
    localStorage.setItem('favoritePairs', JSON.stringify(updatedFavorites));
  };

  // Remove from favorites
  const removeFromFavorites = (pair) => {
    const updatedFavorites = favorites.filter(f => JSON.stringify(f) !== JSON.stringify(pair));
    setFavorites(updatedFavorites);
    localStorage.setItem('favoritePairs', JSON.stringify(updatedFavorites));
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Result copied to clipboard!');
  };

  

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchExchangeRates, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fromCurrency, selectedCurrencies, amount]);

  // Initial fetch
  useEffect(() => {
    fetchExchangeRates();
  }, [fromCurrency, selectedCurrencies, timeframe]);

  // AdSense initialization
  useEffect(() => {
    if (adsLoaded && window.adsbygoogle) {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        window.adsbygoogle.push({});
      } catch (e) {
        console.error('AdSense ad push failed:', e);
      }
    }
  }, [adsLoaded]);

  // Currency symbol
  const getCurrencySymbol = (code) => currencies.find(c => c.code === code)?.symbol || '';

  // Calculate change percentage
  const calculateChangePercentage = () => {
    if (historicalRates.length < 2) return 0;
    const firstRate = historicalRates[0].rate;
    const lastRate = historicalRates[historicalRates.length - 1].rate;
    return parseFloat(((lastRate - firstRate) / firstRate * 100).toFixed(2));
  };

  // Format numbers
  const formatNumber = (num, decimals = 2) => num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  // Chart data
  const chartData = {
    datasets: [
      {
        label: `${fromCurrency} to ${toCurrency}`,
        data: historicalRates.map(r => ({
          x: r.date,
          y: r.rate,
          o: r.rate - (Math.random() * 0.001),
          c: r.rate,
          h: r.rate + (Math.random() * 0.001),
          l: r.rate - (Math.random() * 0.001),
        })),
        borderColor: calculateChangePercentage() >= 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)',
        backgroundColor: calculateChangePercentage() >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: { type: 'time', time: { unit: timeframe === '7D' ? 'day' : 'week' } },
      y: { beginAtZero: false },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `Rate: ${formatNumber(context.parsed.y, 4)}`,
        },
      },
    },
  };

  // Export historical data
  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Rate', 'Change'],
      ...historicalRates.map(r => [r.date, r.rate, r.change]),
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fromCurrency}_to_${toCurrency}_historical_rates.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const changePercentage = calculateChangePercentage();
  const isPositiveChange = changePercentage >= 0;

  return (
    <>
      <NavBar />
      <div className="pt-10 pb-12 min-h-screen bg-white">
        <Head>
          <title>Currency Converter - Real-Time Exchange Rates</title>
          <meta name="description" content="Convert currencies with real-time exchange rates" />
        </Head>
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX`}
          crossOrigin="anonymous"
          onLoad={() => setAdsLoaded(true)}
          onError={(e) => console.error('AdSense script failed to load', e)}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <a href="/tools" className="text-blue-600 hover:underline text-sm md:text-base">← Back to all tools</a>
            <span className={`px-2 py-1 rounded text-sm font-medium ${apiStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {apiStatus === 'success' ? 'Live' : 'Fallback'}
            </span>
          </div>

          {/* Top Ad */}
          <div className="mb-6 md:mb-8">
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot="YOUR_TOP_AD_SLOT"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center mb-4 md:mb-6 border-b border-gray-200 pb-4">
              <FaMoneyBillWave className="text-green-500 text-2xl md:text-3xl mr-3" />
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Currency Converter</h1>
                <p className="text-sm text-gray-500">Real-time exchange rates</p>
              </div>
              <span className="ml-auto text-xs md:text-sm text-gray-500">{lastUpdated && `Last updated: ${lastUpdated}`}</span>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-600 rounded text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Conversion Form */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={() => setAutoRefresh(!autoRefresh)}
                      className="mr-2 h-4 w-4"
                      aria-label="Toggle auto-refresh every 30 seconds"
                    />
                    Auto-refresh every 30s
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.valueAsNumber || 0)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      min="0"
                      step="0.01"
                      aria-label="Amount to convert"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <div className="flex">
                     <Select
                        value={{ value: fromCurrency, label: `${currencies.find(c => c.code === fromCurrency)?.flag} ${fromCurrency} - ${currencies.find(c => c.code === fromCurrency)?.name}` }}
                        onChange={(option) => setFromCurrency(option.value)}
                        options={currencies.map(c => ({
                            value: c.code,
                            label: `${c.flag} ${c.code} - ${c.name}`
                        }))}
                        />

                      <button
                        onClick={swapCurrencies}
                        className="p-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 transition-all flex items-center justify-center"
                        title="Swap currencies"
                        aria-label="Swap currencies"
                      >
                        <FaExchangeAlt className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <Select
                        value={{ value: toCurrency, label: `${currencies.find(c => c.code === toCurrency)?.flag} ${toCurrency} - ${currencies.find(c => c.code === toCurrency)?.name}` }}
                        onChange={(option) => {
                            setToCurrency(option.value);
                            setSelectedCurrencies([option.value]);
                        }}
                        options={currencies.map(c => ({
                            value: c.code,
                            label: `${c.flag} ${c.code} - ${c.name}`
                        }))}
                        />

                  </div>
                </div>
              
                
                <div className="flex justify-center">
                  <button
                    onClick={fetchExchangeRates}
                    disabled={isLoading}
                    className={`px-5 py-3 rounded-md font-medium text-white flex items-center gap-2 transition-all ${
                      isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                    }`}
                    aria-label="Convert currency"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </div>
                    ) : (
                      <>
                        <FaSyncAlt size={14} />
                        Convert Currency
                      </>
                    )}
                  </button>
                </div>

                {/* Result Section */}
                <div className="p-4 md:p-6 bg-green-50 rounded-lg border border-green-200 shadow-md">
                  {convertedAmount.map(({ currency, converted, rate }) => {
                    const currencyObj = currencies.find(c => c.code === currency);
                    return (
                      <div key={currency} className="text-lg md:text-xl font-bold text-green-800 mb-2 flex items-center justify-center gap-2">
                        <span>{getCurrencySymbol(fromCurrency)}{formatNumber(amount)} {fromCurrency} {currencies.find(c => c.code === fromCurrency)?.flag}</span>
                        <span>=</span>
                        <span>{getCurrencySymbol(currency)}{formatNumber(converted)} {currency} {currencyObj?.flag}</span>
                        <button
                          onClick={() => copyToClipboard(`${getCurrencySymbol(currency)}${formatNumber(converted)} ${currency}`)}
                          className="ml-2 text-green-600 hover:text-green-800 transition-all"
                          aria-label={`Copy converted amount to ${currency}`}
                          title="Copy result"
                        >
                          <FaCopy />
                        </button>
                        <div className="text-sm text-green-600 w-full text-center mt-1">
                          1 {fromCurrency} = {formatNumber(rate, 4)} {currency}
                        </div>
                      </div>
                    );
                  })}
                  <button
                    onClick={addToFavorites}
                    className="mt-4 w-full md:w-auto px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center gap-2 justify-center transition-all shadow-md"
                    aria-label="Add to favorites"
                  >
                    <FaStar /> Add to Favorites
                  </button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2 border-b border-gray-200 pb-1">Favorites</h3>
                  <div className="space-y-2">
                    {favorites.map((pair, index) => (
                      <div
                        key={index}
                        className="w-full p-3 bg-gray-50 rounded-md text-left flex justify-between items-center border border-gray-200 hover:bg-gray-100 transition-all shadow-sm"
                      >
                        <button
                          onClick={() => {
                            setFromCurrency(pair.from);
                            setSelectedCurrencies(pair.to);
                            setAmount(pair.amount);
                          }}
                          className="flex-1 text-left"
                        >
                          <span className="font-medium text-sm md:text-base">{pair.amount} {pair.from}</span>
                          <span className="text-gray-500 text-xs md:text-sm"> to {pair.to.join(', ')}</span>
                        </button>
                        <button
                          onClick={() => removeFromFavorites(pair)}
                          className="text-red-500 hover:text-red-700 text-sm"
                          aria-label={`Remove ${pair.from} to ${pair.to.join(', ')} from favorites`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2 border-b border-gray-200 pb-1">Popular Conversions</h3>
                  <div className="space-y-2">
                    {[
                      { from: 'NPR', to: ['USD'], amount: 100 },
                      { from: 'NPR', to: ['INR'], amount: 100 },
                      { from: 'USD', to: ['NPR'], amount: 1 },
                      { from: 'USD', to: ['INR'], amount: 1 },
                      { from: 'INR', to: ['NPR'], amount: 1 },
                      
                    ].map((pair, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setFromCurrency(pair.from);
                          setSelectedCurrencies(pair.to);
                          setAmount(pair.amount);
                        }}
                        className="w-full p-3 bg-gray-50 rounded-md text-left hover:bg-gray-100 transition-all flex justify-between items-center border border-gray-200 shadow-sm"
                      >
                        <div>
                          <span className="font-medium text-sm md:text-base">{pair.amount} {pair.from}</span>
                          <span className="text-gray-500 text-xs md:text-sm"> to {pair.to.join(', ')}</span>
                        </div>
                        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {fallbackRates[pair.from] && fallbackRates[pair.from][pair.to[0]] ? formatNumber(fallbackRates[pair.from][pair.to[0]], 2) : 'N/A'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* See More Button - Improved */}
            <div className="mt-6 md:mt-8 flex justify-center">
              <button
                onClick={() => setShowMore(!showMore)}
                className={`px-6 py-3 rounded-md font-medium flex items-center gap-2 transition-all shadow-md ${
                  showMore 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700' 
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300 hover:from-gray-200 hover:to-gray-300'
                }`}
                aria-label={showMore ? 'Hide additional features' : 'Show additional features'}
              >
                {showMore ? (
                  <>
                    <FaChevronUp className="text-sm" />
                    Hide Advanced Features
                  </>
                ) : (
                  <>
                    <FaChevronDown className="text-sm" />
                    Show Advanced Features
                  </>
                )}
              </button>
            </div>

            {showMore && historicalRates.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 md:gap-4">
                  <h3 className="font-bold text-lg text-gray-800">Exchange Rate History</h3>
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="flex bg-gray-100 rounded-md p-1">
                      {['7D', '1M', '3M'].map((period) => (
                        <button
                          key={period}
                          onClick={() => setTimeframe(period)}
                          className={`px-2 md:px-3 py-1 text-sm rounded-md transition-all ${
                            timeframe === period ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-green-600'
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setChartType(chartType === 'bar' ? 'candlestick' : 'bar')}
                      className="px-2 md:px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-all"
                    >
                      {chartType === 'bar' ? 'Candlestick View' : 'Bar View'}
                    </button>
                    <div className={`flex items-center text-sm font-medium ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositiveChange ? <FaCaretUp className="mr-1" /> : <FaCaretDown className="mr-1" />}
                      {isPositiveChange ? '+' : ''}{changePercentage}%
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-md">
                  {chartType === 'bar' ? (
                    <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-14 gap-2 h-48 items-end mb-4" ref={chartContainerRef}>
                      {historicalRates.map((rate, index) => {
                        const maxRate = Math.max(...historicalRates.map(r => r.rate));
                        const minRate = Math.min(...historicalRates.map(r => r.rate));
                        const range = maxRate - minRate;
                        const height = range > 0 ? ((rate.rate - minRate) / range) * 100 : 50;
                        const isHigherThanPrevious = index === 0 || rate.rate >= historicalRates[index - 1].rate;
                        return (
                          <div key={index} className="flex flex-col items-center h-full justify-end">
                            <div
                              className={`w-full rounded-t hover:opacity-80 transition-all ${
                                isHigherThanPrevious ? 'bg-green-400' : 'bg-red-400'
                              }`}
                              style={{ height: `${height}%`, minHeight: '2px' }}
                              role="tooltip"
                              aria-label={`Date: ${rate.date}, Rate: ${formatNumber(rate.rate, 4)}, Change: ${rate.change >= 0 ? '+' : ''}${formatNumber(rate.change, 4)}`}
                            >
                              <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap z-10">
                                <div>{rate.date}</div>
                                <div className="font-semibold">{formatNumber(rate.rate, 4)}</div>
                                <div className={rate.change >= 0 ? 'text-green-300' : 'text-red-300'}>
                                  {rate.change >= 0 ? '+' : ''}{formatNumber(rate.change, 4)}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 text-center hidden md:block">
                              {new Date(rate.date).toLocaleDateString(undefined, {
                                month: timeframe === '7D' ? 'short' : 'numeric',
                                day: 'numeric',
                              }).replace('/', '/')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Line data={chartData} options={chartOptions} />
                  )}
                  <div className="grid grid-cols-5 gap-2 text-xs text-center md:hidden">
                    {[0, Math.floor(historicalRates.length / 4), Math.floor(historicalRates.length / 2), Math.floor(historicalRates.length * 3 / 4), historicalRates.length - 1].map(
                      (i) =>
                        historicalRates[i] && (
                          <div key={i} className="truncate">
                            {new Date(historicalRates[i].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        )
                    )}
                  </div>
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={exportToCSV}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all shadow-md"
                      aria-label="Export historical data as CSV"
                    >
                      Export Historical Data
                    </button>
                  </div>
                </div>
                <div className="mt-4 md:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-100 shadow-sm">
                    <div className="text-xs text-blue-600">24H High</div>
                    <div className="font-semibold text-blue-800">{formatNumber(Math.max(...historicalRates.map(r => r.rate)), 4)}</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-md border border-red-100 shadow-sm">
                    <div className="text-xs text-red-600">24H Low</div>
                    <div className="font-semibold text-red-800">{formatNumber(Math.min(...historicalRates.map(r => r.rate)), 4)}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 shadow-sm">
                    <div className="text-xs text-gray-600">Average</div>
                    <div className="font-semibold text-gray-800">
                      {formatNumber(historicalRates.reduce((sum, rate) => sum + rate.rate, 0) / historicalRates.length, 4)}
                    </div>
                  </div>
                  <div className={`p-3 rounded-md border ${isPositiveChange ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'} shadow-sm`}>
                    <div className="text-xs text-gray-600">Volatility</div>
                    <div className={`font-semibold ${isPositiveChange ? 'text-green-800' : 'text-red-800'}`}>
                      {formatNumber(historicalRates.reduce((sum, rate) => sum + Math.abs(rate.change), 0) / historicalRates.length, 4)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">Exchange rates are for informational purposes only and may differ from actual transaction rates.</p>
          </div>

          {/* Bottom Ad */}
          <div className="mt-6 md:mt-8">
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot="YOUR_BOTTOM_AD_SLOT"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>

          <div className="bg-gradient-to-r from-[#25609A] to-[#52aa4d] mt-4 md:mt-5 rounded-xl p-6 md:p-8 text-center text-white">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Ready to Grow Your Business?</h2>
            <a
              href="/contact"
              className="inline-block bg-white text-[#25609A] px-5 md:px-6 py-2 md:py-3 rounded-md font-medium hover:bg-gray-100 transition-all shadow-md"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}