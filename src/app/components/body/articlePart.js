import Link from 'next/link';
import Image from 'next/image';

async function getTopArticle() {
  try {
    const res = await fetch('http://116.203.117.20:5000/api/blogs/top-viewed', {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null; // Handle 404 gracefully
      }
      throw new Error(`Failed to fetch top article: ${res.statusText}`);
    }

    const data = await res.json();
    return data.topArticle || null;
  } catch (error) {
    console.error('Error fetching top article:', error);
    return null;
  }
}

function TopArticleCard({ article }) {
  // Remove HTML tags and truncate content
  const plainTextContent = (article.content || '').replace(/<[^>]+>/g, '');
  const truncatedContent = plainTextContent.length > 120
    ? `${plainTextContent.slice(0, 120)}...`
    : plainTextContent;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-r from-[#25609A] to-[#51A94C] rounded-2xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Image Column */}
          <div className="flex items-center justify-center lg:col-span-1">
            {article.image ? (
              <div className="relative w-full h-64 lg:h-80 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={`http://116.203.117.20:5000/uploads/${article.image}`}
                  alt={article.title || 'Top article image'}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  priority
                />
              </div>
            ) : (
              <div className="w-full h-64 lg:h-80 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-white/70 text-sm">No Image Available</span>
              </div>
            )}
          </div>

          {/* Content Column */}
          <div className="flex flex-col justify-center lg:col-span-2 text-white">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-white/20 text-xs font-semibold rounded-full backdrop-blur-sm">
                TOP ARTICLE
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight">
              {article.title || 'Untitled'}
            </h2>

            {article.subheading && (
              <p className="text-white/90 text-lg font-medium mb-4">
                {article.subheading}
              </p>
            )}

            <p className="text-white/80 text-base mb-6 leading-relaxed">
              {truncatedContent}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-start text-sm text-white/80 mb-6 space-x-6">
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {new Date(article.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                {article.viewCount || 0} views
              </span>
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {article.likes?.length || 0} likes
              </span>
            </div>

            <Link
              href={`/blog/${article._id}`}
              className="inline-flex items-center px-6 py-3 bg-white text-[#25609A] rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm w-fit group"
            >
              Read Full Article
              <svg 
                className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function TopArticle() {
  const topArticle = await getTopArticle();

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-gray-900 dark:text-white">
          Top Article
        </h1>

        {topArticle ? (
          <TopArticleCard article={topArticle} />
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-md max-w-7xl mx-auto px-4">
            <div className="max-w-md mx-auto">
              <svg 
                className="w-16 h-16 mx-auto text-gray-400 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Currently no top article available. Check back later!
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}