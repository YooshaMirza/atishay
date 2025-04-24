import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Share2, Bookmark, Calendar, MessageSquare, ChevronRight } from 'lucide-react';
import { Article } from '../../types';
import { useArticles } from '../../contexts/ArticleContext';
import { useAuth } from '../../contexts/AuthContext';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const { likeArticle, unlikeArticle, saveArticle, unsaveArticle, shareArticle, isLiked, isSaved } = useArticles();
  const { currentUser } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) return;
    
    setIsAnimating(true);
    
    try {
      if (isLiked(article.id)) {
        await unlikeArticle(article.id);
      } else {
        await likeArticle(article.id);
      }
    } finally {
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) return;
    
    try {
      if (isSaved(article.id)) {
        await unsaveArticle(article.id);
      } else {
        await saveArticle(article.id);
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await shareArticle(article.id);
      
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: `/article/${article.id}`,
        });
      } else {
        // Fallback for browsers that don't support navigator.share
        navigator.clipboard.writeText(`${window.location.origin}/article/${article.id}`);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getWordCountLabel = (count: number) => {
    return `${count} words · ${Math.ceil(count / 200)} min read`;
  };

  const liked = isLiked(article.id);
  const saved = isSaved(article.id);

  return (
    <Link 
      to={`/article/${article.id}`}
      className="block bg-white bg-opacity-80 backdrop-blur-md rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      {article.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      )}
      
      <div className="p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          {article.topics.slice(0, 2).map((topic, index) => (
            <span 
              key={index}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-800"
            >
              {topic}
            </span>
          ))}
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
            {getWordCountLabel(article.wordCount)}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">{article.summary}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar size={14} className="mr-1" />
            <span>{formatDate(article.publishedDate)}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleLike}
              className={`group flex items-center text-sm ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
              <Heart 
                size={16} 
                className={`mr-1 ${isAnimating && liked ? 'animate-ping' : ''} ${liked ? 'fill-red-500' : 'fill-none'}`} 
              />
              <span>{article.likes}</span>
            </button>
            
            <button 
              onClick={handleSave}
              className={`group flex items-center text-sm ${saved ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
            >
              <Bookmark 
                size={16} 
                className={`mr-1 ${saved ? 'fill-blue-500' : 'fill-none'}`}
              />
            </button>
            
            <button 
              onClick={handleShare}
              className="group flex items-center text-sm text-gray-500 hover:text-green-500"
            >
              <Share2 size={16} className="mr-1" />
              <span>{article.shares}</span>
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
          <span>Read more</span>
          <ChevronRight size={16} className="ml-1" />
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;