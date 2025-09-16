'use client'
import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaSyncAlt, FaCopy, FaGlobeAsia, FaExclamationTriangle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import NepaliDate from 'nepali-date';
import Footer from '@/app/components/footer/footer';
import NavBar from '@/app/components/header/navbar';

export default function NepaliDateConverter() {
  const [nepaliDate, setNepaliDate] = useState({ year: 2080, month: 1, day: 1 });
  const [englishDate, setEnglishDate] = useState({ year: 2023, month: 4, day: 14 });
  const [convertedDate, setConvertedDate] = useState('');
  const [conversionDirection, setConversionDirection] = useState('nepali-to-english');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [currentNepaliDate, setCurrentNepaliDate] = useState('');
  const [calendarView, setCalendarView] = useState('english');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const [daysInMonth, setDaysInMonth] = useState(30); // Default days in month

  // Nepali months data
  const nepaliMonths = [
    { value: 1, name: 'Baishakh' },
    { value: 2, name: 'Jestha' },
    { value: 3, name: 'Ashadh' },
    { value: 4, name: 'Shrawan' },
    { value: 5, name: 'Bhadra' },
    { value: 6, name: 'Ashwin' },
    { value: 7, name: 'Kartik' },
    { value: 8, name: 'Mangsir' },
    { value: 9, name: 'Poush' },
    { value: 10, name: 'Magh' },
    { value: 11, name: 'Falgun' },
    { value: 12, name: 'Chaitra' },
  ];

  // English months
  const englishMonths = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  // Get current Nepali date
  useEffect(() => {
    const now = new NepaliDate();
    setCurrentNepaliDate(now.format('YYYY-MM-DD'));
    
    // Set initial values to current date
    const currentYear = now.getYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    
    setNepaliDate({
      year: currentYear,
      month: currentMonth,
      day: currentDay
    });
    
    // Update days in month for current Nepali month
    updateDaysInMonth(currentYear, currentMonth, 'nepali');
    
    // Convert Nepali date to English date
    const englishDateObj = convertNepaliToEnglish(currentYear, currentMonth, currentDay);
    if (englishDateObj) {
      setEnglishDate({
        year: englishDateObj.year,
        month: englishDateObj.month,
        day: englishDateObj.day
      });
    }
  }, []);

  // Update days in month when year or month changes
  useEffect(() => {
    if (conversionDirection === 'nepali-to-english') {
      updateDaysInMonth(nepaliDate.year, nepaliDate.month, 'nepali');
    } else {
      updateDaysInMonth(englishDate.year, englishDate.month, 'english');
    }
  }, [nepaliDate.year, nepaliDate.month, englishDate.year, englishDate.month, conversionDirection]);

  // Update days in month based on calendar type
  const updateDaysInMonth = (year, month, type) => {
    try {
      if (type === 'nepali') {
        // For Nepali calendar, use the nepali-date package to get days in month
        const daysInMonth = new NepaliDate(year, month - 1, 1).getDaysInMonth();
        setDaysInMonth(daysInMonth);
      } else {
        // For English calendar, calculate days in month
        const daysInMonth = new Date(year, month, 0).getDate();
        setDaysInMonth(daysInMonth);
      }
    } catch (error) {
      console.error('Error updating days in month:', error);
      // Fallback to 30 days if there's an error
      setDaysInMonth(30);
    }
  };

  // Convert Nepali date to English date
  const convertNepaliToEnglish = (year, month, day) => {
    try {
      // Validate the Nepali date
      if (year < 2000 || year > 2090) {
        throw new Error('Nepali year must be between 2000 and 2090');
      }
      
      if (month < 1 || month > 12) {
        throw new Error('Nepali month must be between 1 and 12');
      }
      
      // Get days in month for validation
      const daysInMonth = new NepaliDate(year, month - 1, 1).getDaysInMonth();
      if (day < 1 || day > daysInMonth) {
        throw new Error(`Nepali day must be between 1 and ${daysInMonth} for the selected month`);
      }
      
      const nepaliDate = new NepaliDate(year, month - 1, day); // Month is 0-based
      const englishDate = nepaliDate.toEnglish();
      return {
        year: englishDate.getFullYear(),
        month: englishDate.getMonth() + 1,
        day: englishDate.getDate()
      };
    } catch (error) {
      console.error('Error converting Nepali to English date:', error);
      setError(error.message);
      return null;
    }
  };

  // Convert English date to Nepali date
  const convertEnglishToNepali = (year, month, day) => {
    try {
      // Validate the English date
      if (year < 1944 || year > 2033) {
        throw new Error('English year must be between 1944 and 2033');
      }
      
      if (month < 1 || month > 12) {
        throw new Error('English month must be between 1 and 12');
      }
      
      // Get days in month for validation
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day < 1 || day > daysInMonth) {
        throw new Error(`English day must be between 1 and ${daysInMonth} for the selected month`);
      }
      
      const englishDate = new Date(year, month - 1, day);
      const nepaliDate = new NepaliDate(englishDate);
      return {
        year: nepaliDate.getYear(),
        month: nepaliDate.getMonth() + 1, // Convert to 1-based month
        day: nepaliDate.getDate()
      };
    } catch (error) {
      console.error('Error converting English to Nepali date:', error);
      setError(error.message);
      return null;
    }
  };

  // Handle input changes with proper validation
  const handleNepaliDateChange = (field, value) => {
    let numValue = parseInt(value) || 0;
    
    // Set appropriate limits for each field
    if (field === 'year') {
      numValue = Math.max(2000, Math.min(2090, numValue));
    } else if (field === 'month') {
      numValue = Math.max(1, Math.min(12, numValue));
      // Update days in month when month changes
      updateDaysInMonth(nepaliDate.year, numValue, 'nepali');
    } else if (field === 'day') {
      numValue = Math.max(1, Math.min(daysInMonth, numValue));
    }
    
    setNepaliDate(prev => ({ ...prev, [field]: numValue }));
    setError(''); // Clear error on input change
  };

  const handleEnglishDateChange = (field, value) => {
    let numValue = parseInt(value) || 0;
    
    // Set appropriate limits for each field
    if (field === 'year') {
      numValue = Math.max(1944, Math.min(2033, numValue));
    } else if (field === 'month') {
      numValue = Math.max(1, Math.min(12, numValue));
      // Update days in month when month changes
      updateDaysInMonth(englishDate.year, numValue, 'english');
    } else if (field === 'day') {
      numValue = Math.max(1, Math.min(daysInMonth, numValue));
    }
    
    setEnglishDate(prev => ({ ...prev, [field]: numValue }));
    setError(''); // Clear error on input change
  };

  // Convert date function using nepali-date package
  const convertDate = () => {
    setIsProcessing(true);
    setError('');
    
    try {
      let result = '';
      
      if (conversionDirection === 'nepali-to-english') {
        // Convert Nepali to English
        const engDate = convertNepaliToEnglish(nepaliDate.year, nepaliDate.month, nepaliDate.day);
        
        if (!engDate) {
          throw new Error('Invalid Nepali date');
        }
        
        setEnglishDate(engDate);
        result = `${engDate.day} ${englishMonths[engDate.month-1].name}, ${engDate.year}`;
        setConvertedDate(result);
        
      } else {
        // Convert English to Nepali
        const nepDate = convertEnglishToNepali(englishDate.year, englishDate.month, englishDate.day);
        
        if (!nepDate) {
          throw new Error('Invalid English date');
        }
        
        setNepaliDate(nepDate);
        result = `${nepDate.day} ${nepaliMonths[nepDate.month-1].name}, ${nepDate.year}`;
        setConvertedDate(result);
      }
    } catch (err) {
      console.error('Conversion error:', err);
      setError(err.message || 'Failed to convert date. Please check your input.');
      setConvertedDate('');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle date selection from calendar
  const handleDateSelect = (day, monthType, index) => {
    if (monthType !== 'current') return;
    
    setSelectedDate(index);
    
    if (calendarView === 'english') {
      const selectedEnglishDate = {
        year: englishDate.year,
        month: englishDate.month,
        day: day.date
      };
      setSelectedDateInfo({
        type: 'english',
        date: selectedEnglishDate,
        display: `${day.date} ${englishMonths[englishDate.month-1].name}, ${englishDate.year}`
      });
      
      // If we're in English to Nepali conversion mode, update the input
      if (conversionDirection === 'english-to-nepali') {
        setEnglishDate(selectedEnglishDate);
      }
    } else {
      const selectedNepaliDate = {
        year: nepaliDate.year,
        month: nepaliDate.month,
        day: day.date
      };
      setSelectedDateInfo({
        type: 'nepali',
        date: selectedNepaliDate,
        display: `${day.date} ${nepaliMonths[nepaliDate.month-1].name}, ${nepaliDate.year} BS`
      });
      
      // If we're in Nepali to English conversion mode, update the input
      if (conversionDirection === 'nepali-to-english') {
        setNepaliDate(selectedNepaliDate);
      }
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    
    if (calendarView === 'english') {
      // Generate English calendar
      const year = englishDate.year;
      const month = englishDate.month;
      
      // First day of the month
      const firstDay = new Date(year, month - 1, 1).getDay();
      
      // Days in the month
      const daysInMonth = new Date(year, month, 0).getDate();
      
      // Previous month days
      const prevMonthLastDate = new Date(year, month - 1, 0).getDate();
      
      // Add previous month's days
      for (let i = firstDay - 1; i >= 0; i--) {
        days.push({
          date: prevMonthLastDate - i,
          month: 'prev',
          isToday: false,
          dayOfWeek: (firstDay - i - 1) % 7
        });
      }
      
      // Add current month's days
      for (let i = 1; i <= daysInMonth; i++) {
        const dayOfWeek = new Date(year, month - 1, i).getDay();
        const isToday = today.getDate() === i && 
                        today.getMonth() + 1 === month && 
                        today.getFullYear() === year;
        days.push({
          date: i,
          month: 'current',
          isToday,
          dayOfWeek
        });
      }
      
      // Add next month's days to complete the grid
      const totalCells = 42; // 6 weeks * 7 days
      const nextMonthDays = totalCells - days.length;
      for (let i = 1; i <= nextMonthDays; i++) {
        days.push({
          date: i,
          month: 'next',
          isToday: false,
          dayOfWeek: (days.length + i - 1) % 7
        });
      }
    } else {
      // Generate Nepali calendar using nepali-date
      const year = nepaliDate.year;
      const month = nepaliDate.month;
      
      try {
        // Create a NepaliDate object for the first day of the month
        const firstDayOfMonth = new NepaliDate(year, month - 1, 1); // Month is 0-based
        
        // Get the English date equivalent to get the day of the week
        const firstDayEnglish = firstDayOfMonth.toEnglish();
        const firstDay = firstDayEnglish.getDay(); // Get day of week (0-6)
        
        // Get days in the month
        const daysInMonth = firstDayOfMonth.getDaysInMonth();
        
        // Add placeholder days for proper alignment
        for (let i = 0; i < firstDay; i++) {
          days.push({
            date: '',
            month: 'prev',
            isToday: false,
            dayOfWeek: i
          });
        }
        
        // Add current month's days
        const todayNepali = new NepaliDate();
        for (let i = 1; i <= daysInMonth; i++) {
          const dayOfWeek = (firstDay + i - 1) % 7;
          const isToday = i === todayNepali.getDate() && 
                          month === todayNepali.getMonth() + 1 && 
                          year === todayNepali.getYear();
          days.push({
            date: i,
            month: 'current',
            isToday,
            dayOfWeek
          });
        }
        
        // Add next month's days to complete the grid
        const totalCells = 42; // 6 weeks * 7 days
        const nextMonthDays = totalCells - days.length;
        for (let i = 1; i <= nextMonthDays; i++) {
          days.push({
            date: i,
            month: 'next',
            isToday: false,
            dayOfWeek: (days.length + i - 1) % 7
          });
        }
      } catch (error) {
        console.error('Error generating Nepali calendar:', error);
        // Fallback to a simple calendar if there's an error
        for (let i = 1; i <= 31; i++) {
          days.push({
            date: i,
            month: 'current',
            isToday: false,
            dayOfWeek: (i - 1) % 7
          });
        }
      }
    }
    
    return days;
  };

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (convertedDate) {
      navigator.clipboard.writeText(convertedDate);
      alert('Copied to clipboard!');
    }
  };

  // Set to current date
  const setToCurrentDate = () => {
    const todayNepali = new NepaliDate();
    const todayEnglish = new Date();
    
    if (conversionDirection === 'nepali-to-english') {
      setNepaliDate({ 
        year: todayNepali.getYear(), 
        month: todayNepali.getMonth() + 1, 
        day: todayNepali.getDate() 
      });
    } else {
      setEnglishDate({ 
        year: todayEnglish.getFullYear(), 
        month: todayEnglish.getMonth() + 1, 
        day: todayEnglish.getDate() 
      });
    }
  };

  // Handle month navigation
  const handleMonthNavigation = (direction) => {
    if (calendarView === 'english') {
      let newMonth = englishDate.month + direction;
      let newYear = englishDate.year;
      
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      } else if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
      
      setEnglishDate({ ...englishDate, month: newMonth, year: newYear });
    } else {
      let newMonth = nepaliDate.month + direction;
      let newYear = nepaliDate.year;
      
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      } else if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
      
      setNepaliDate({ ...nepaliDate, month: newMonth, year: newYear });
    }
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
    <NavBar/>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-3">
            <FaGlobeAsia className="text-green-500" /> Nepali Date Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Convert between Bikram Sambat (Nepali calendar) and Gregorian (English) calendars with our easy-to-use tool
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 mb-4 sm:mb-0">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaCalendarAlt className="text-green-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Date Conversion</h2>
                  <p className="text-gray-500 text-sm">Current Nepali Date: {currentNepaliDate}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setConversionDirection('nepali-to-english')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    conversionDirection === 'nepali-to-english' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Nepali to English
                </button>
                <button
                  onClick={() => setConversionDirection('english-to-nepali')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    conversionDirection === 'english-to-nepali' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  English to Nepali
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <FaExclamationTriangle className="text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Error</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                {conversionDirection === 'nepali-to-english' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nepali Year (BS)</label>
                      <input
                        type="number"
                        value={nepaliDate.year}
                        onChange={(e) => handleNepaliDateChange('year', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                        min="2000"
                        max="2090"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nepali Month</label>
                      <select
                        value={nepaliDate.month}
                        onChange={(e) => handleNepaliDateChange('month', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      >
                        {nepaliMonths.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.name} ({month.value})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nepali Day (1-{daysInMonth})</label>
                      <input
                        type="number"
                        value={nepaliDate.day}
                        onChange={(e) => handleNepaliDateChange('day', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                        min="1"
                        max={daysInMonth}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">English Year (AD)</label>
                      <input
                        type="number"
                        value={englishDate.year}
                        onChange={(e) => handleEnglishDateChange('year', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                        min="1944"
                        max="2033"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">English Month</label>
                      <select
                        value={englishDate.month}
                        onChange={(e) => handleEnglishDateChange('month', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      >
                        {englishMonths.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.name} ({month.value})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">English Day (1-{daysInMonth})</label>
                      <input
                        type="number"
                        value={englishDate.day}
                        onChange={(e) => handleEnglishDateChange('day', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                        min="1"
                        max={daysInMonth}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={convertDate}
                  disabled={isProcessing}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 ${
                    isProcessing ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
                  } transition-colors shadow-md`}
                >
                  {isProcessing ? (
                    <>
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Converting...
                    </>
                  ) : (
                    <>
                      <FaSyncAlt size={14} />
                      Convert Date
                    </>
                  )}
                </button>
                
                <button
                  onClick={setToCurrentDate}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
                >
                  Today
                </button>
              </div>

              {convertedDate && (
                <div className="mt-6 p-5 bg-green-50 rounded-xl border border-green-200">
                  <div className="font-medium text-green-800 mb-2">Converted Date:</div>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-green-900">{convertedDate}</div>
                    <button
                      onClick={copyToClipboard}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                      title="Copy to clipboard"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              )}

              {selectedDateInfo && (
                <div className="mt-4 p-5 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="font-medium text-blue-800 mb-2">Selected Date:</div>
                  <div className="text-lg font-semibold text-blue-900">{selectedDateInfo.display}</div>
                </div>
              )}
            </div>

            {/* Calendar Section */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 sm:mb-0">
                  {calendarView === 'english' ? 'English Calendar' : 'Nepali Calendar'}
                </h3>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setCalendarView('english')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${calendarView === 'english' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setCalendarView('nepali')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${calendarView === 'nepali' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Nepali
                  </button>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <button 
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      onClick={() => handleMonthNavigation(-1)}
                    >
                      <FaChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div className="font-semibold text-gray-800">
                      {calendarView === 'english' 
                        ? `${englishMonths[englishDate.month-1].name} ${englishDate.year}` 
                        : `${nepaliMonths[nepaliDate.month-1].name} ${nepaliDate.year} BS`
                      }
                    </div>
                    <button 
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      onClick={() => handleMonthNavigation(1)}
                    >
                      <FaChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day, index) => (
                      <div 
                        key={day} 
                        className={`text-center text-xs font-medium py-2 ${index === 0 ? 'text-red-500' : 'text-gray-500'}`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => (
                      <div
                        key={index}
                        className={`h-12 flex items-center justify-center rounded-lg text-sm
                          ${day.month !== 'current' ? 'text-gray-300' : 
                            day.isToday ? 'bg-green-100 text-green-800 font-bold border border-green-300' : 
                            selectedDate === index ? 'bg-blue-100 text-blue-800 font-medium border border-blue-300' :
                            day.dayOfWeek === 0 ? 'text-red-500' : 'text-gray-700'}
                          ${day.month === 'current' ? 'hover:bg-gray-100 cursor-pointer' : ''}
                        `}
                        onClick={() => day.month === 'current' && handleDateSelect(day, day.month, index)}
                      >
                        {day.date}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Click on a date to select it for conversion. Today is highlighted in green, selected date in blue, and Sundays in red.</p>
              </div>
            </div>
          </div>
        </div>

        

        {/* CTA Section */}
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