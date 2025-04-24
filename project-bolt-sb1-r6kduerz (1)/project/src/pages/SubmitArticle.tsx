import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader } from 'lucide-react';
import { Topic, WordCount, PoliticalLeaning } from '../types';
import { submitPublicArticle } from '../services/firebase';

const SubmitArticle: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [author, setAuthor] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const [wordCount, setWordCount] = useState<WordCount>(250);
  const [imageUrl, setImageUrl] = useState('');
  const [politicalLeaning, setPoliticalLeaning] = useState<PoliticalLeaning>('moderate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const topicOptions: Topic[] = [
    'Economy', 
    'Foreign Policy', 
    'Environment', 
    'Healthcare', 
    'Education', 
    'Immigration', 
    'Civil Rights',
    'Technology',
    'Defense',
    'Infrastructure'
  ];

  const wordCountOptions: WordCount[] = [50, 100, 250, 500];

  const politicalLeaningOptions: { value: PoliticalLeaning; label: string }[] = [
    { value: 'conservative', label: 'Conservative' },
    { value: 'liberal', label: 'Liberal' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'libertarian', label: 'Libertarian' },
    { value: 'green', label: 'Green' }
  ];

  const handleTopicToggle = (topic: Topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content || !summary || !author || selectedTopics.length === 0) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const articleData = {
        title,
        content,
        summary,
        author,
        topics: selectedTopics,
        wordCount,
        imageUrl: imageUrl || undefined,
        publishedDate: new Date(),
        likes: 0,
        shares: 0,
        politicalLeaning,
        status: 'pending'
      };
      
      await submitPublicArticle(articleData);
      
      setSuccess('Article submitted successfully! It will be reviewed by our editors.');
      
      // Reset form
      setTitle('');
      setContent('');
      setSummary('');
      setAuthor('');
      setSelectedTopics([]);
      setWordCount(250);
      setImageUrl('');
      setPoliticalLeaning('moderate');
      
      // Redirect to home after a delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError('Failed to submit article');
      console.error('Error submitting article:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg mb-8">
        <h1 className="text-3xl font-bold mb-4">Submit Your Article</h1>
        <p className="text-lg text-blue-100">
          Share your perspective with our community. All submissions are reviewed by our editorial team before publication.
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded animate-fade-in">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded animate-fade-in">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title*
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
            Summary* (A brief description of your article)
          </label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content*
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              Author Name*
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL (optional)
            </label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <span className="block text-sm font-medium text-gray-700 mb-2">
            Topics* (Select at least one)
          </span>
          <div className="flex flex-wrap gap-2">
            {topicOptions.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleTopicToggle(topic)}
                className={`px-3 py-1 rounded-full text-sm transition-all duration-300 transform hover:scale-105 ${
                  selectedTopics.includes(topic)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="wordCount" className="block text-sm font-medium text-gray-700 mb-1">
              Word Count*
            </label>
            <select
              id="wordCount"
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value) as WordCount)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            >
              {wordCountOptions.map((count) => (
                <option key={count} value={count}>
                  {count} words
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="politicalLeaning" className="block text-sm font-medium text-gray-700 mb-1">
              Political Perspective*
            </label>
            <select
              id="politicalLeaning"
              value={politicalLeaning}
              onChange={(e) => setPoliticalLeaning(e.target.value as PoliticalLeaning)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            >
              {politicalLeaningOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mr-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center transition-all duration-300 transform hover:scale-105 ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <Loader size={18} className="mr-2 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                <span>Submit Article</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitArticle;