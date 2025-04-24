import React from 'react';
import ArticleList from '../components/articles/ArticleList';

const Home: React.FC = () => {
  return (
    <div>
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Stay informed with PoliticalPulse</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl">
            News tailored to your political preferences, curated to keep you informed on the issues that matter most to you.
          </p>
        </div>
      </div>
      
      <ArticleList />
    </div>
  );
};

export default Home;