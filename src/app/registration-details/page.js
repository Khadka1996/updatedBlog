import React from 'react';
import { FaBuilding, FaDownload, FaExternalLinkAlt, FaFilePdf } from 'react-icons/fa';
import Head from 'next/head';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

const registrationDocuments = [
  {
    name: 'Company Registration Certificate',
    file: 'Company Registration Certificate.pdf',
  },
  {
    name: 'Company Registration Letter',
    file: 'Company Registration Letter Documents.pdf',
  },
  {
    name: 'Memorandum of Association (MOA)',
    file: 'MOA Everestkit.pdf',
  },
  {
    name: 'Articles of Association (AOA)',
    file: 'AOA Everestkit.pdf',
  },
  {
    name: 'PAN Registration Certificate',
    file: 'Pan Reg Certificate.pdf',
  },
];

const RegistrationDetails = () => {
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'EverestKit Company Pvt. Ltd.';
  const documentUrl = (file) => `/documents/${encodeURIComponent(file)}`;

  return (
    <>
      <Head>
        <title>Company Registration Details | {companyName}</title>
        <meta
          name="description"
          content={`Official registration documents for ${companyName}.`}
        />
        <meta property="og:title" content={`Company Registration Details | ${companyName}`} />
      </Head>

      <NavBar />

      <main className="bg-gray-100 min-h-screen py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <FaBuilding className="text-5xl text-[#25609A]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#25609A] mb-4 tracking-tight">
              Company Registration Details
            </h1>
            <p className="text-lg text-gray-600">
              Official documents for {companyName}, registered in Nepal.
            </p>
          </header>

          <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8" aria-labelledby="documents-heading">
            <div className="mb-6">
              <h2 id="documents-heading" className="text-2xl font-semibold text-[#25609A]">
                Registration Documents
              </h2>
              <p className="text-gray-600 mt-2">
                View or download our company registration and statutory documents.
              </p>
            </div>

            <div className="space-y-4">
              {registrationDocuments.map((document) => {
                const url = documentUrl(document.file);

                return (
                  <article
                    key={document.file}
                    className="border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-[#52aa4d] transition-colors"
                  >
                    <div className="flex items-center min-w-0">
                      <FaFilePdf className="text-2xl text-red-600 mr-4 shrink-0" aria-hidden="true" />
                      <h3 className="font-medium text-gray-800 break-words">{document.name}</h3>
                    </div>
                    <div className="flex items-center gap-4 sm:shrink-0">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-[#25609A] hover:text-[#1b4773] font-medium"
                      >
                        <FaExternalLinkAlt className="mr-2" aria-hidden="true" />
                        View
                      </a>
                      <a
                        href={url}
                        download
                        className="inline-flex items-center text-[#52aa4d] hover:text-[#428a3d] font-medium"
                      >
                        <FaDownload className="mr-2" aria-hidden="true" />
                        Download
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default RegistrationDetails;
