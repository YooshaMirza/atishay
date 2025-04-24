import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getArticles, 
  likeArticle, 
  unlikeArticle, 
  saveArticle, 
  unsaveArticle, 
  shareArticle 
} from '../services/firebase';
import { useAuth } from './AuthContext';
import { Article, Topic, WordCount } from '../types';

interface ArticleContextType {
  articles: Article[];
  loading: boolean;
  error: string | null;
  topicFilters: Topic[];
  wordCountFilters: WordCount[];
  setTopicFilters: (topics: Topic[]) => void;
  setWordCountFilters: (wordCounts: WordCount[]) => void;
  likeArticle: (articleId: string) => Promise<void>;
  unlikeArticle: (articleId: string) => Promise<void>;
  saveArticle: (articleId: string) => Promise<void>;
  unsaveArticle: (articleId: string) => Promise<void>;
  shareArticle: (articleId: string) => Promise<void>;
  refreshArticles: () => Promise<void>;
  isLiked: (articleId: string) => boolean;
  isSaved: (articleId: string) => boolean;
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

export const useArticles = () => {
  const context = useContext(ArticleContext);
  if (context === undefined) {
    throw new Error('useArticles must be used within an ArticleProvider');
  }
  return context;
};

interface ArticleProviderProps {
  children: ReactNode;
}

export const ArticleProvider: React.FC<ArticleProviderProps> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topicFilters, setTopicFilters] = useState<Topic[]>([]);
  const [wordCountFilters, setWordCountFilters] = useState<WordCount[]>([]);
  
  const { currentUser, userData } = useAuth();

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedArticles = await getArticles(
        topicFilters.length > 0 ? topicFilters : undefined,
        wordCountFilters.length > 0 ? wordCountFilters : undefined,
        userData?.politicalLeaning
      );
      
      setArticles(fetchedArticles);
    } catch (err) {
      setError('Failed to fetch articles. Please try again later.');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchArticles();
    }
  }, [userData, topicFilters, wordCountFilters]);

  const handleLikeArticle = async (articleId: string) => {
    if (!currentUser) return;
    
    try {
      await likeArticle(currentUser.uid, articleId);
      
      // Update the local state to reflect the like
      setArticles(prev => 
        prev.map(article => 
          article.id === articleId 
            ? { ...article, likes: article.likes + 1 } 
            : article
        )
      );
      
      // Update user data in the auth context
      if (userData) {
        userData.likedArticles.push(articleId);
      }
    } catch (err) {
      setError('Failed to like the article. Please try again.');
      console.error('Error liking article:', err);
    }
  };

  const handleUnlikeArticle = async (articleId: string) => {
    if (!currentUser) return;
    
    try {
      await unlikeArticle(currentUser.uid, articleId);
      
      // Update the local state to reflect the unlike
      setArticles(prev => 
        prev.map(article => 
          article.id === articleId 
            ? { ...article, likes: Math.max(0, article.likes - 1) } 
            : article
        )
      );
      
      // Update user data in the auth context
      if (userData) {
        userData.likedArticles = userData.likedArticles.filter(id => id !== articleId);
      }
    } catch (err) {
      setError('Failed to unlike the article. Please try again.');
      console.error('Error unliking article:', err);
    }
  };

  const handleSaveArticle = async (articleId: string) => {
    if (!currentUser) return;
    
    try {
      await saveArticle(currentUser.uid, articleId);
      
      // Update user data in the auth context
      if (userData) {
        userData.savedArticles.push(articleId);
      }
    } catch (err) {
      setError('Failed to save the article. Please try again.');
      console.error('Error saving article:', err);
    }
  };

  const handleUnsaveArticle = async (articleId: string) => {
    if (!currentUser) return;
    
    try {
      await unsaveArticle(currentUser.uid, articleId);
      
      // Update user data in the auth context
      if (userData) {
        userData.savedArticles = userData.savedArticles.filter(id => id !== articleId);
      }
    } catch (err) {
      setError('Failed to unsave the article. Please try again.');
      console.error('Error unsaving article:', err);
    }
  };

  const handleShareArticle = async (articleId: string) => {
    try {
      await shareArticle(articleId);
      
      // Update the local state to reflect the share
      setArticles(prev => 
        prev.map(article => 
          article.id === articleId 
            ? { ...article, shares: article.shares + 1 } 
            : article
        )
      );
      
      // In a real app, you might also open a share dialog or copy a link to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/article/${articleId}`);
    } catch (err) {
      setError('Failed to share the article. Please try again.');
      console.error('Error sharing article:', err);
    }
  };

  const isLiked = (articleId: string): boolean => {
    return userData?.likedArticles.includes(articleId) || false;
  };

  const isSaved = (articleId: string): boolean => {
    return userData?.savedArticles.includes(articleId) || false;
  };

  const value = {
    articles,
    loading,
    error,
    topicFilters,
    wordCountFilters,
    setTopicFilters,
    setWordCountFilters,
    likeArticle: handleLikeArticle,
    unlikeArticle: handleUnlikeArticle,
    saveArticle: handleSaveArticle,
    unsaveArticle: handleUnsaveArticle,
    shareArticle: handleShareArticle,
    refreshArticles: fetchArticles,
    isLiked,
    isSaved
  };

  return (
    <ArticleContext.Provider value={value}>
      {children}
    </ArticleContext.Provider>
  );
};