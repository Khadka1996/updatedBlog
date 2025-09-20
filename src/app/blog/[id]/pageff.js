// src/app/blog/[id]/page.js

import { FaFacebook, FaTwitter, FaWhatsapp, FaPinterest, FaQuora } from 'react-icons/fa';
import CommentSection from '../CommentSection';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';
import TopArticle from '@/app/components/body/articlePart';
import Image from 'next/image';
import { notFound } from 'next/navigation';

async function getBlogData(id) {
  try {
    const res = await fetch(`https://api.everestkit.com/api/blogs/${id}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 404) return notFound();
      throw new Error('Failed to fetch blog data');
    }

    return res.json();
  } catch {
    throw notFound();
  }
}

async function getGoogleAds() {
  const ads = {
    top: { __html: '<script>console.log("Google Ad - Top")</script>' },
    left: { __html: '<script>console.log("Google Ad - Left")</script>' },
    right: { __html: '<script>console.log("Google Ad - Right")</script>' },
    bottom: { __html: '<script>console.log("Google Ad - Bottom")</script>' },
  };

  await new Promise((resolve) => setTimeout(resolve, 1000));
  return Math.random() > 0.5 ? ads : null;
}

async function getUserData() {
  // Implement user fetching logic (e.g., from session)
  return null;
}

export default async function BlogArticle({ params }) {
  const { id } = params;

  try {
    const [blog, googleAds, user] = await Promise.all([
      getBlogData(id),
      getGoogleAds(),
      getUserData(),
    ]);

    if (!blog?.data) return notFound();

    const blogData = blog.data;
    const shareUrl = `https://everestkit.com/blogs/${id}`;

    const socialLinks = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(blogData.title)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${blogData.title} ${shareUrl}`)}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(blogData.title)}`,
      quora: `https://www.quora.com/share?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(blogData.title)}`,
    };

    const renderAdPlaceholder = (position) => (
      <div className={`bg-gray-200 flex items-center justify-center text-gray-600 ${position === 'top' || position === 'bottom' ? 'h-32' : 'h-96'}`}>
        Placeholder Ad - {position.charAt(0).toUpperCase() + position.slice(1)}
      </div>
    );

    const renderHTML = (htmlString) => (
      <div dangerouslySetInnerHTML={{ __html: htmlString }} />
    );

    return (
      <>
        <div className="fixed top-0 left-0 w-full z-50">
          <NavBar />
        </div>

        <div className="pt-16" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            {googleAds?.top ? <div dangerouslySetInnerHTML={googleAds.top} /> : renderAdPlaceholder('top')}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="hidden lg:block lg:w-1/6">
              {googleAds?.left ? <div dangerouslySetInnerHTML={googleAds.left} /> : renderAdPlaceholder('left')}
            </div>

            <div className="flex-1">
              <article className="bg-white rounded-lg shadow-md p-6">
                <header className="mb-8">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">{blogData.title}</h1>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3a1 1 0 00.293.707l2 2a1 1 0 101.414-1.414L11 9.586V7z" clipRule="evenodd" />
                      </svg>
                      <span>{new Date(blogData.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-4">
                      {Object.entries(socialLinks).map(([key, url]) => {
                        const Icon = {
                          facebook: FaFacebook,
                          twitter: FaTwitter,
                          whatsapp: FaWhatsapp,
                          pinterest: FaPinterest,
                          quora: FaQuora,
                        }[key];

                        return (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-blue-600 transition duration-300"
                            aria-label={`Share on ${key.charAt(0).toUpperCase() + key.slice(1)}`}
                          >
                            <Icon className="h-5 w-5" />
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  <hr className="border-t border-gray-300 mb-6" />
                  {blogData.subheading && <h2 className="text-xl text-gray-600 mb-8">{blogData.subheading}</h2>}
                </header>

                {blogData.image && (
                  <div className="relative h-64 md:h-96 w-full mb-8 rounded-lg overflow-hidden">
                    <Image
                      src={`/uploads/${blogData.image}`}
                      alt={blogData.title}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}

                <div className="prose prose-lg max-w-none mb-8">{renderHTML(blogData.content)}</div>

                {blogData.youtubeLink && (
                  <div className="mb-8 aspect-w-16 aspect-h-9">
                    <iframe
                      src={blogData.youtubeLink}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-64 md:h-96 rounded-lg"
                    />
                  </div>
                )}
              </article>

              <CommentSection blog={blogData} user={user} />
            </div>

            <div className="hidden lg:block lg:w-1/6">
              {googleAds?.right ? <div dangerouslySetInnerHTML={googleAds.right} /> : renderAdPlaceholder('right')}
            </div>
          </div>

          <div className="mt-8">
            {googleAds?.bottom ? <div dangerouslySetInnerHTML={googleAds.bottom} /> : renderAdPlaceholder('bottom')}
          </div>
        </div>

        <TopArticle />
        <Footer />
      </>
    );
  } catch {
    return notFound();
  }
}

export async function generateMetadata({ params }) {
  const { id } = params;
  const blog = await getBlogData(id);

  if (!blog?.data) {
    return {
      title: 'Blog Not Found',
      description: "The blog article you're looking for doesn't exist.",
    };
  }

  const blogData = blog.data;

  return {
    title: blogData.title,
    description: blogData.subheading || blogData.title,
    openGraph: {
      title: blogData.title,
      description: blogData.subheading || blogData.title,
      images: blogData.image ? [`/uploads/${blogData.image}`] : [],
      url: `/blogs/${id}`,
      type: 'article',
    },
  };
}
