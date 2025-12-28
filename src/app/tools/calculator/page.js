'use client'
import { useState, useEffect } from 'react';
import { FaCalculator, FaBackspace, FaHistory, FaTrash } from 'react-icons/fa';
import Script from 'next/script';
import Head from 'next/head';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

export default function ScientificCalculator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [adsLoaded, setAdsLoaded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [degreeMode, setDegreeMode] = useState(true); // true for degrees, false for radians

  // Basic operations
  const handleButtonClick = (value) => {
    setError('');
    setInput(prev => prev + value);
  };

  // Handle special operations
  const handleSpecialOperation = (op) => {
    setError('');
    if (input) {
      try {
        let calculation = '';
        let resultValue = '';
        
        switch(op) {
          case 'sqrt':
            calculation = `√(${input})`;
            resultValue = Math.sqrt(parseFloat(evaluateExpression(input)));
            break;
          case 'square':
            calculation = `(${input})²`;
            resultValue = Math.pow(parseFloat(evaluateExpression(input)), 2);
            break;
          case 'inverse':
            calculation = `1/(${input})`;
            resultValue = 1 / parseFloat(evaluateExpression(input));
            break;
          case 'sin':
            calculation = `sin(${input})`;
            const sinValue = degreeMode ? 
              Math.sin(parseFloat(evaluateExpression(input)) * Math.PI / 180) :
              Math.sin(parseFloat(evaluateExpression(input)));
            resultValue = parseFloat(sinValue.toFixed(8));
            break;
          case 'cos':
            calculation = `cos(${input})`;
            const cosValue = degreeMode ? 
              Math.cos(parseFloat(evaluateExpression(input)) * Math.PI / 180) :
              Math.cos(parseFloat(evaluateExpression(input)));
            resultValue = parseFloat(cosValue.toFixed(8));
            break;
          case 'tan':
            calculation = `tan(${input})`;
            const tanValue = degreeMode ? 
              Math.tan(parseFloat(evaluateExpression(input)) * Math.PI / 180) :
              Math.tan(parseFloat(evaluateExpression(input)));
            resultValue = parseFloat(tanValue.toFixed(8));
            break;
          case 'log':
            calculation = `log(${input})`;
            resultValue = Math.log10(parseFloat(evaluateExpression(input)));
            break;
          case 'ln':
            calculation = `ln(${input})`;
            resultValue = Math.log(parseFloat(evaluateExpression(input)));
            break;
          case 'exp':
            calculation = `exp(${input})`;
            resultValue = Math.exp(parseFloat(evaluateExpression(input)));
            break;
          case 'factorial':
            calculation = `factorial(${input})`;
            resultValue = factorial(parseInt(evaluateExpression(input)));
            break;
          case 'pow':
            setInput(prev => prev + '^');
            return;
          default:
            return;
        }
        
        setResult(resultValue.toString());
        addToHistory(calculation, resultValue.toString());
        setInput(resultValue.toString());
      } catch (err) {
        setError('Invalid input for this operation');
      }
    } else {
      setError('Please enter a value first');
    }
  };

  // Evaluate expressions safely
  const evaluateExpression = (expr) => {
    try {
      // Replace ^ with ** for exponentiation
      expr = expr.replace(/\^/g, '**');
      
      // Handle percentage
      expr = expr.replace(/(\d+)%/g, (match, num) => (parseFloat(num) / 100).toString());
      
      // Use Function constructor for evaluation (safer than eval)
      return Function(`"use strict"; return (${expr})`)();
    } catch (err) {
      throw new Error('Invalid expression');
    }
  };

  // Calculate factorial
  const factorial = (n) => {
    if (n < 0) throw new Error('Factorial not defined for negative numbers');
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  // Calculate result
  const calculateResult = () => {
    if (!input) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      const resultValue = evaluateExpression(input);
      setResult(resultValue.toString());
      addToHistory(input, resultValue.toString());
    } catch (err) {
      setError('Invalid expression');
      setResult('');
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear input
  const clearInput = () => {
    setInput('');
    setResult('');
    setError('');
  };

  // Delete last character
  const deleteLastChar = () => {
    setInput(prev => prev.slice(0, -1));
  };

  // Add calculation to history
  const addToHistory = (calculation, result) => {
    setHistory(prev => [...prev, { calculation, result, timestamp: new Date() }].slice(-10));
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
  };

  // Use history item
  const useHistoryItem = (item) => {
    setInput(item.calculation);
    setResult(item.result);
    setShowHistory(false);
  };

  // Initialize ads
  useEffect(() => {
    if (adsLoaded && window.adsbygoogle) {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({}); // Top ad
        window.adsbygoogle.push({}); // Bottom ad
      } catch (e) {
        console.error('AdSense ad push failed:', e);
      }
    }
  }, [adsLoaded]);

  // Calculator buttons
  const basicButtons = [
    ['C', '(', ')', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=', '⌫']
  ];

  const scientificButtons = [
    ['sin', 'cos', 'tan', 'π'],
    ['log', 'ln', 'e', '√'],
    ['x²', 'x^y', '10^x', 'x!'],
    ['1/x', '|x|', '‰', '±']
  ];

  return (
    <>
      <NavBar/>
      <div className="p-6 bg-gray-100 min-h-screen">
        <Head>
          <title>Scientific Calculator - Advanced Math Tool</title>
          <meta name="description" content="Advanced scientific calculator with functions for math, science, and engineering" />
        </Head>
        
        <Script 
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX`}
          crossOrigin="anonymous"
          onLoad={() => setAdsLoaded(true)}
          onError={(e) => console.error('AdSense script failed to load', e)}
        />
        
        <div className="mx-3 md:mx-10 lg:mx-18">
          <div className="flex items-center mb-6">
            <a href="/tools" className="text-blue-600 hover:underline">← Back to all tools</a>
          </div>

          {/* Top Ad Unit */}
          <div className="mb-8">
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot="YOUR_TOP_AD_SLOT"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-6">
              <FaCalculator className="text-purple-500 text-3xl mr-3" />
              <div>
                <h1 className="text-2xl font-bold">Scientific Calculator</h1>
                <p className="text-gray-500">Advanced calculator for math, science, and engineering</p>
              </div>
              <div className="ml-auto flex items-center space-x-3">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${showHistory ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}
                >
                  <FaHistory size={12} />
                  History
                </button>
                <div className="flex items-center text-sm">
                  <span className="mr-2 text-gray-600">Angle:</span>
                  <button
                    onClick={() => setDegreeMode(true)}
                    className={`px-2 py-1 rounded-l ${degreeMode ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}
                  >
                    DEG
                  </button>
                  <button
                    onClick={() => setDegreeMode(false)}
                    className={`px-2 py-1 rounded-r ${!degreeMode ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}
                  >
                    RAD
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Calculator Display */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="text-right text-gray-500 text-sm h-6 overflow-hidden">
                    {input}
                  </div>
                  <div className="text-right text-3xl font-bold text-gray-800 h-12 overflow-hidden">
                    {isProcessing ? 'Calculating...' : result || '0'}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  {scientificButtons.map((row, rowIndex) => (
                    row.map((btn, colIndex) => (
                      <button
                        key={`sci-${rowIndex}-${colIndex}`}
                        onClick={() => {
                          if (['π', 'e'].includes(btn)) {
                            handleButtonClick(btn === 'π' ? Math.PI.toString() : Math.E.toString());
                          } else if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'square', 'inverse', 'factorial'].includes(btn)) {
                            handleSpecialOperation(
                              btn === 'x²' ? 'square' : 
                              btn === 'x^y' ? 'pow' : 
                              btn === '√' ? 'sqrt' : 
                              btn === 'x!' ? 'factorial' : 
                              btn === '1/x' ? 'inverse' : 
                              btn
                            );
                          } else if (btn === '|x|') {
                            setInput(prev => `|${prev}|`);
                          } else if (btn === '‰') {
                            setInput(prev => prev + '/1000');
                          } else if (btn === '±') {
                            setInput(prev => prev.startsWith('-') ? prev.slice(1) : `-${prev}`);
                          } else if (btn === '10^x') {
                            setInput(prev => `10^${prev}`);
                          }
                        }}
                        className="p-3 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
                      >
                        {btn === '×' ? '×' : 
                         btn === '÷' ? '÷' : 
                         btn === 'π' ? 'π' : 
                         btn === 'x²' ? 'x²' : 
                         btn === 'x^y' ? 'x^y' : 
                         btn === 'x!' ? 'x!' : 
                         btn === '1/x' ? '1/x' : 
                         btn === '|x|' ? '|x|' : 
                         btn === '‰' ? '‰' : 
                         btn === '±' ? '±' : 
                         btn === '10^x' ? '10^x' : 
                         btn}
                      </button>
                    ))
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {basicButtons.map((row, rowIndex) => (
                    row.map((btn, colIndex) => (
                      <button
                        key={`basic-${rowIndex}-${colIndex}`}
                        onClick={() => {
                          if (btn === '=') {
                            calculateResult();
                          } else if (btn === 'C') {
                            clearInput();
                          } else if (btn === '⌫') {
                            deleteLastChar();
                          } else if (btn === '×') {
                            handleButtonClick('*');
                          } else if (btn === '÷') {
                            handleButtonClick('/');
                          } else {
                            handleButtonClick(btn);
                          }
                        }}
                        className={`p-3 rounded font-medium ${
                          btn === '=' ? 'bg-purple-500 text-white hover:bg-purple-600' :
                          ['C', '⌫'].includes(btn) ? 'bg-red-500 text-white hover:bg-red-600' :
                          ['÷', '×', '-', '+', '(', ')'].includes(btn) ? 'bg-blue-500 text-white hover:bg-blue-600' :
                          'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {btn === '×' ? '×' : 
                         btn === '÷' ? '÷' : 
                         btn === '⌫' ? <FaBackspace /> : 
                         btn}
                      </button>
                    ))
                  ))}
                </div>
              </div>

              {/* History Panel */}
              <div className={`bg-gray-50 rounded-lg p-4 ${showHistory ? 'block' : 'hidden lg:block'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-gray-700">Calculation History</h3>
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Clear history"
                    >
                      <FaTrash size={14} />
                    </button>
                  )}
                </div>
                
                {history.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No calculation history yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {history.slice().reverse().map((item, index) => (
                      <div 
                        key={index} 
                        className="p-3 bg-white rounded border border-gray-200 hover:bg-purple-50 cursor-pointer"
                        onClick={() => useHistoryItem(item)}
                      >
                        <div className="text-sm text-gray-600">{item.calculation}</div>
                        <div className="text-lg font-bold text-purple-600">= {item.result}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Middle Ad Unit */}
            <div className="my-6">
              <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot="YOUR_MIDDLE_AD_SLOT"
                data-ad-format="auto"
                data-full-width-responsive="true"
              ></ins>
            </div>

            {/* Information Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-lg text-gray-700 mb-4">Calculator Functions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Basic Operations</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    <li>Addition, Subtraction, Multiplication, Division</li>
                    <li>Parentheses for grouping expressions</li>
                    <li>Percentage calculations</li>
                    <li>Decimal and negative numbers</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Scientific Functions</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    <li>Trigonometric functions (sin, cos, tan)</li>
                    <li>Logarithmic functions (log, ln)</li>
                    <li>Exponential functions (e^x, 10^x)</li>
                    <li>Square root, powers, and factorial</li>
                    <li>Constants (π, e)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Ad Unit */}
          <div className="mt-8">
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot="YOUR_BOTTOM_AD_SLOT"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>
          
          <div className="bg-gradient-to-r from-[#25609A] to-[#52aa4d] mt-5 rounded-xl p-8 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              Let's discuss how we can help you achieve your digital goals and take your business to the next level.
            </p>
            <a 
              href="/contact" 
              className="inline-block bg-white text-[#25609A] px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}