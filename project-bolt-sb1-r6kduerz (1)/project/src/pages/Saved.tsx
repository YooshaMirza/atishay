import React, { useState, useEffect } from 'react';
import { Bookmark, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getArticleById } from '../services/firebase';
import { Article } from '../types';
import ArticleCard from '../components/articles/ArticleCard';

const Saved: React.FC = () => {
  const { userData } = useAuth();
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedArticles = async () => {
      if (!userData) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const articles = await Promise.all(
          userData.savedArticles.map(async (articleId) => {
            const article = await getArticleById(articleId);
            return article;
          })
        );
        
        // Filter out any null values (articles that couldn't be found)
        setSavedArticles(articles.filter(Boolean) as Article[]);
      } catch (err) {
        setError('Failed to fetch saved articles');
        console.error('Error fetching saved articles:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedArticles();
  }, [userData]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Bookmark className="h-8 w-8 text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">Saved Articles</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : savedArticles.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No saved articles yet</h3>
          <p className="text-gray-500 mb-4">
            Articles you save will appear here. Click the bookmark icon on any article to save it for later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Saved;