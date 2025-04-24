import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Share2, Bookmark, Calendar, ArrowLeft, MessageSquare, Loader, BookOpen } from 'lucide-react';
import { getArticleById } from '../../services/firebase';
import { Article, WordCount } from '../../types';
import { useArticles } from '../../contexts/ArticleContext';
import { useAuth } from '../../contexts/AuthContext';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedWordCount, setSelectedWordCount] = useState<WordCount>(250);
  const { likeArticle, unlikeArticle, saveArticle, unsaveArticle, shareArticle, isLiked, isSaved } = useArticles();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const wordCounts: WordCount[] = [50, 100, 250, 500];

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const fetchedArticle = await getArticleById(id);
        
        if (fetchedArticle) {
          setArticle(fetchedArticle);
          setSelectedWordCount(fetchedArticle.wordCount);
        } else {
          setError('Article not found');
        }
      } catch (err) {
        setError('Failed to load article');
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [id]);

  const handleLike = async () => {
    if (!currentUser || !article) return;
    
    setIsAnimating(true);
    
    try {
      if (isLiked(article.id)) {
        await unlikeArticle(article.id);
        setArticle(prev => prev ? { ...prev, likes: Math.max(0, prev.likes - 1) } : null);
      } else {
        await likeArticle(article.id);
        setArticle(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }
    } finally {
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const handleSave = async () => {
    if (!currentUser || !article) return;
    
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

  const handleShare = async () => {
    if (!article) return;
    
    try {
      await shareArticle(article.id);
      setArticle(prev => prev ? { ...prev, shares: prev.shares + 1 } : null);
      
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const truncateContent = (content: string, wordCount: number) => {
    const words = content.split(' ');
    return words.slice(0, wordCount).join(' ') + (words.length > wordCount ? '...' : '');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Article not found'}</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const liked = currentUser && isLiked(article.id);
  const saved = currentUser && isSaved(article.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <Link 
        to="/" 
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-transform hover:-translate-x-1"
      >
        <ArrowLeft size={18} className="mr-1" />
        <span>Back to articles</span>
      </Link>
      
      <header className="mb-8">
        <div className="flex flex-wrap gap-2 mb-3">
          {article.topics.map((topic, index) => (
            <span 
              key={index}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white transform hover:scale-105 transition-transform"
            >
              {topic}
            </span>
          ))}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{article.title}</h1>
        
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3 text-white">
              <span className="font-medium">{article.author.charAt(0)}</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{article.author}</p>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar size={14} className="mr-1" />
                <span>{formatDate(article.publishedDate)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLike}
              className={`group flex items-center ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'} transition-colors`}
            >
              <Heart 
                size={20} 
                className={`mr-1 transform transition-transform group-hover:scale-110 ${
                  isAnimating && liked ? 'animate-ping' : ''
                } ${liked ? 'fill-red-500' : 'fill-none'}`} 
              />
              <span>{article.likes}</span>
            </button>
            
            <button 
              onClick={handleSave}
              className={`group flex items-center ${saved ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'} transition-colors`}
            >
              <Bookmark 
                size={20} 
                className={`mr-1 transform transition-transform group-hover:scale-110 ${saved ? 'fill-blue-500' : 'fill-none'}`}
              />
              <span>Save</span>
            </button>
            
            <button 
              onClick={handleShare}
              className="group flex items-center text-gray-500 hover:text-green-500 transition-colors"
            >
              <Share2 size={20} className="mr-1 transform transition-transform group-hover:scale-110" />
              <span>{article.shares}</span>
            </button>
          </div>
        </div>
      </header>
      
      {article.imageUrl && (
        <div className="mb-8 rounded-xl overflow-hidden shadow-lg transform hover:scale-[1.01] transition-transform">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      
      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-gray-600 mb-6 font-light leading-relaxed">{article.summary}</p>
        
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-gray-700">
              <BookOpen size={20} className="mr-2" />
              <span className="font-medium">Reading Length</span>
            </div>
            <select
              value={selectedWordCount}
              onChange={(e) => setSelectedWordCount(Number(e.target.value) as WordCount)}
              className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {wordCounts.map((count) => (
                <option key={count} value={count}>
                  {count} words
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-500">
            Estimated reading time: {Math.ceil(selectedWordCount / 200)} minutes
          </div>
        </div>
        
        <div className="whitespace-pre-line text-gray-800 leading-relaxed">
          {truncateContent(article.content, selectedWordCount)}
        </div>
      </div>
      
      <div className="mt-10 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Share your thoughts</h3>
        <div className="flex items-center">
          <MessageSquare size={20} className="text-gray-400 mr-2" />
          <p className="text-gray-500">Comments are coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;