// app/blog/BlogSearch.js
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useDebounce } from 'use-debounce';

const BlogSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [query, setQuery] = useState(initialSearch);
  const [debouncedQuery] = useDebounce(query, 500);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    console.log('Debounced Query:', debouncedQuery); // Debug
    console.log('Current Search Params:', searchParams.toString()); // Debug

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set('search', debouncedQuery);
    } else {
      params.delete('search');
    }

    if (initialSearch !== debouncedQuery) {
      params.set('page', '1'); // Reset to page 1 on new search
    }

    const newUrl = `/blog?${params.toString()}`;
    console.log('Navigating to:', newUrl); // Debug
    router.push(newUrl);
  }, [debouncedQuery, router, searchParams, initialSearch]);

  return (
    <div className="max-w-md mx-auto mb-8">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
    </div>
  );
};

export default BlogSearch;