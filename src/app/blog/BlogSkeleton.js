const BlogSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative h-48 w-full bg-gray-200 animate-pulse"></div>
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-4 animate-pulse"></div>
            <div className="flex justify-between mt-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
              </div>
            </div>
            <div className="mt-4 h-10 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogSkeleton;