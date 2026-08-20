import { API_URL, SITE_URL } from '../config/site';

export const revalidate = 3600;

const staticRoutes = [
  '/',
  '/about',
  '/services',
  '/blog',
  '/tools',
  '/contact',
  '/privacy-policy',
  '/terms-and-conditions',
  '/disclaimer',
  '/cookies-policy',
  '/affiliate-disclosure',
  '/acceptable-use-policy',
  '/registration-details',
  '/services/blog-writing',
  '/services/digital-marketing',
  '/services/lead-capture',
  '/services/seo-content-writing',
  '/services/social-proof',
  '/services/website-development',
  '/tools/calculator',
  '/tools/compress-pdf',
  '/tools/currency-converter',
  '/tools/date-converter',
  '/tools/edit-pdf',
  '/tools/excel-to-pdf',
  '/tools/merge-pdf',
  '/tools/nepali-fonts-tool',
  '/tools/pdf-to-excel',
  '/tools/pdf-to-jpg',
  '/tools/pdf-to-powerpoint',
  '/tools/pdf-to-word',
  '/tools/photo-cropper',
  '/tools/photo-size-reducer',
  '/tools/photo-stretcher',
  '/tools/photo-to-pdf',
  '/tools/powerpoint-to-pdf',
  '/tools/split-pdf',
  '/tools/time-zone-converter',
  '/tools/video-downloader',
  '/tools/watermark',
  '/tools/word-counter',
  '/tools/word-to-pdf',
];

const blogPageSize = 100;
const maxBlogPages = 100;

async function getBlogEntries() {
  const blogs = [];

  try {
    for (let page = 1; page <= maxBlogPages; page += 1) {
      const response = await fetch(
        `${API_URL}/api/blogs?page=${page}&limit=${blogPageSize}`,
        { next: { revalidate: 3600 } },
      );

      if (!response.ok) break;

      const result = await response.json();
      const pageBlogs = Array.isArray(result.data) ? result.data : [];
      blogs.push(...pageBlogs);

      if (pageBlogs.length < blogPageSize || blogs.length >= result.total) break;
    }
  } catch (error) {
    console.error('Sitemap blog fetch failed:', error);
  }

  return blogs;
}

export default async function sitemap() {
  const blogEntries = await getBlogEntries();

  const routes = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: route === '/' || route === '/blog' ? 'daily' : 'monthly',
    priority: route === '/' ? 1 : route === '/blog' || route === '/tools' ? 0.9 : 0.7,
  }));

  const blogs = blogEntries
    .filter((blog) => blog?._id)
    .map((blog) => ({
      url: `${SITE_URL}/blogs/${blog._id}`,
      lastModified: blog.updatedAt || blog.createdAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  return [...routes, ...blogs];
}