// pages/blog/[id].js
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import axios from 'axios';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';
import BlogArticle from '@/app/blog/BlogArticle';
import '@/app/globals.css';

const ServerBlogPage = ({ initialData }) => {
  const router = useRouter();
  
  // Destructure data safely
  const { title, subheading, content, image, createdAt } = initialData || {};

  // Validate essential data
  if (!title || !content) {
    return (
      <div className="error-message">
        <h2>Missing Data</h2>
        <p>Title or content is missing.</p>
      </div>
    );
  }

  const stripHtmlTags = (html) => {
    return html.replace(/<[^>]+>/g, '');
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const cleanedContent = truncateText(stripHtmlTags(content), 160);
  const imageUri = image ? `/uploads/${image}` : '';

  return (
    <>
      <NavBar />
      <Head>
        <title>{title}</title>
        <meta name="description" content={cleanedContent} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://everestkit.com${router.asPath}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={cleanedContent} />
        <meta property="og:image" content={imageUri} />
        <meta property="article:published_time" content={createdAt} />
      </Head>
      <BlogArticle initialData={initialData} />
      <Footer />
    </>
  );
};

export const getServerSideProps = async (context) => {
  const { id } = context.params;
  let blogData = null;

  try {
    const response = await axios.get(`https://api.everestkit.com/api/blogs/${id}`);
    blogData = response.data.data || null;

    if (!blogData) {
      return {
        notFound: true,
      };
    }
  } catch (error) {
    console.error('Error fetching blog data:', error);
    return {
      notFound: true,
    };
  }

  return {
    props: {
      initialData: blogData,
    },
  };
};

export default ServerBlogPage;