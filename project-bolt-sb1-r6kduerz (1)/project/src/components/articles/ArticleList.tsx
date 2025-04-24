import React from 'react';
import ArticleCard from './ArticleCard';
import FilterBar from './FilterBar';
import { useArticles } from '../../contexts/ArticleContext';
import { Loader, RefreshCw } from 'lucide-react';

const ArticleList: React.FC = () => {
  const { articles, loading, error, refreshArticles } = useArticles();

  const handleRefresh = async () => {
    await refreshArticles();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Today's Headlines</h2>
        <button
          onClick={handleRefresh}
          className="flex items-center text-blue-600 hover:text-blue-800"
          disabled={loading}
        >
          <RefreshCw size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
      
      <FilterBar />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No articles found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters or come back later for new content.</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Articles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticleList;