// Force dynamic rendering to allow fetch with revalidate: 0
export const dynamic = "force-dynamic";

import ArticleBody from './components/body/articleBody';
import ArticlePart from './components/body/articlePart';
import ContactUs from './components/body/contactUs';
import OurClients from './components/body/ourClients';
import OurTools from './components/body/ourTools';
import TopBody from './components/body/topbody';
import Footer from './components/footer/footer';
import NavBar from './components/header/navbar';

const Page = () => {
  return (
    <main>
      {/* Fixed NavBar at the top */}
      <div className="fixed top-0 left-0 w-full z-50">
        <NavBar />
      </div>

      

      {/* Add padding-top to the first section to prevent content from being hidden behind the NavBar */}
      <div className="pt-20">
        <TopBody />
        <OurClients />
        <OurTools />
        <ArticleBody />
        <ArticlePart />
        <ContactUs />
        <Footer />
      </div>
    </main>
  );
};

export default Page;
