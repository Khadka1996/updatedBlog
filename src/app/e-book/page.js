'use client';
import { useState, useEffect } from 'react';
import { FiSearch, FiDownload, FiBookOpen } from 'react-icons/fi';
import NavBar from '../components/header/navbar';
import Footer from '../components/footer/footer';

export default function EBookLibrary() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('programming');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const fetchBooks = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`
      );
      const data = await response.json();
      setBooks(data.docs || []);
    } catch (err) {
      setError('Failed to fetch books. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(searchQuery);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchBooks(searchQuery);
    }
  };

  const getCoverUrl = (coverId, size = 'M') => {
    return coverId 
      ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`
      : '/book-placeholder.jpg';
  };

  const getDownloadUrl = (book) => {
    // Open Library doesn't directly provide downloads, but we can link to their read page
    return `https://openlibrary.org${book.key}`;
  };

  return (
    <>
    <div className="fixed top-0 left-0 w-full z-50">
    <NavBar/>
  </div>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Free E-Book Library</h1>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex shadow-md rounded-lg overflow-hidden max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for books (e.g., science, fiction, python)"
            className="flex-grow px-4 py-3 focus:outline-none"
          />
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition"
            disabled={loading}
          >
            <FiSearch className="inline mr-2" />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
          {error}
        </div>
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <img
                  src={getCoverUrl(selectedBook.cover_i, 'L')}
                  alt={selectedBook.title}
                  className="w-full md:w-1/3 h-auto object-cover rounded shadow-md"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{selectedBook.title}</h2>
                  <p className="text-gray-600 mb-1">
                    <span className="font-semibold">Author:</span> {selectedBook.author_name?.join(', ') || 'Unknown'}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <span className="font-semibold">Published:</span> {selectedBook.first_publish_year || 'Unknown'}
                  </p>
                  <p className="text-gray-600 mb-4">
                    <span className="font-semibold">Subjects:</span> {selectedBook.subject?.slice(0, 5).join(', ') || 'Not specified'}
                  </p>
                  <div className="flex gap-3 mt-4">
                    <a
                      href={getDownloadUrl(selectedBook)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-4 py-2 rounded flex items-center hover:bg-green-700"
                    >
                      <FiBookOpen className="mr-2" /> Read Online
                    </a>
                    <a
                      href={`https://archive.org/download/${selectedBook.ia?.join(',') || ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
                    >
                      <FiDownload className="mr-2" /> Download
                    </a>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Grid */}
      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {books.map((book) => (
            <div
              key={book.key}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
              onClick={() => setSelectedBook(book)}
            >
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <img
                  src={getCoverUrl(book.cover_i)}
                  alt={book.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = '/book-placeholder.jpg';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-1">
                  {book.author_name?.join(', ') || 'Unknown Author'}
                </p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {book.first_publish_year || 'Year N/A'}
                  </span>
                  <a
                    href={`https://openlibrary.org${book.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attribution */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Book data provided by <a href="https://openlibrary.org" target="_blank" rel="noopener noreferrer" className="text-blue-600">Open Library</a></p>
        <p className="mt-1">Some books may be available for reading or download through Internet Archive</p>
      </div>
    </div>
    <Footer/>
    </>
  );
}
