import { API_URL, SITE_URL } from '../../config/site';

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

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export async function GET() {
  const blogEntries = await getBlogEntries();
  const routes = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date().toISOString(),
  }));
  const blogs = blogEntries
    .filter((blog) => blog?._id)
    .map((blog) => ({
      url: `${SITE_URL}/blogs/${blog._id}`,
      lastModified: blog.updatedAt || blog.createdAt,
    }));

  const entries = [...routes, ...blogs]
    .map(
      ({ url, lastModified }) =>
        `  <url><loc>${escapeXml(url)}</loc>${lastModified ? `<lastmod>${escapeXml(lastModified)}</lastmod>` : ''}</url>`,
    )
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`,
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    },
  );
}