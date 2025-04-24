import React, { useState } from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';
import { Topic, WordCount } from '../../types';
import { useArticles } from '../../contexts/ArticleContext';

const topics: Topic[] = [
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

const wordCounts: WordCount[] = [50, 100, 250, 500];

const FilterBar: React.FC = () => {
  const { topicFilters, wordCountFilters, setTopicFilters, setWordCountFilters } = useArticles();
  const [isTopicFilterOpen, setIsTopicFilterOpen] = useState(false);
  const [isWordCountFilterOpen, setIsWordCountFilterOpen] = useState(false);

  const toggleTopicFilter = () => {
    setIsTopicFilterOpen(!isTopicFilterOpen);
    setIsWordCountFilterOpen(false);
  };

  const toggleWordCountFilter = () => {
    setIsWordCountFilterOpen(!isWordCountFilterOpen);
    setIsTopicFilterOpen(false);
  };

  const handleTopicChange = (topic: Topic) => {
    if (topicFilters.includes(topic)) {
      setTopicFilters(topicFilters.filter(t => t !== topic));
    } else {
      setTopicFilters([...topicFilters, topic]);
    }
  };

  const handleWordCountChange = (wordCount: WordCount) => {
    if (wordCountFilters.includes(wordCount)) {
      setWordCountFilters(wordCountFilters.filter(wc => wc !== wordCount));
    } else {
      setWordCountFilters([...wordCountFilters, wordCount]);
    }
  };

  const clearAllFilters = () => {
    setTopicFilters([]);
    setWordCountFilters([]);
  };

  const removeTopic = (topic: Topic) => {
    setTopicFilters(topicFilters.filter(t => t !== topic));
  };

  const removeWordCount = (wordCount: WordCount) => {
    setWordCountFilters(wordCountFilters.filter(wc => wc !== wordCount));
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <button
            onClick={toggleTopicFilter}
            className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>Topics</span>
            <ChevronDown size={16} className="ml-1" />
          </button>
          
          {isTopicFilterOpen && (
            <div className="absolute z-10 mt-2 w-56 bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-2 max-h-60 overflow-y-auto">
                {topics.map((topic) => (
                  <label key={topic} className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={topicFilters.includes(topic)}
                      onChange={() => handleTopicChange(topic)}
                      className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">{topic}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={toggleWordCountFilter}
            className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>Word Count</span>
            <ChevronDown size={16} className="ml-1" />
          </button>
          
          {isWordCountFilterOpen && (
            <div className="absolute z-10 mt-2 w-56 bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-2">
                {wordCounts.map((count) => (
                  <label key={count} className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wordCountFilters.includes(count)}
                      onChange={() => handleWordCountChange(count)}
                      className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">{count} words</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {(topicFilters.length > 0 || wordCountFilters.length > 0) && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-700 flex items-center"
          >
            <X size={14} className="mr-1" />
            Clear all
          </button>
        )}
      </div>
      
      {(topicFilters.length > 0 || wordCountFilters.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm text-gray-500 flex items-center">
            <Filter size={14} className="mr-1" />
            <span>Active filters:</span>
          </div>
          
          {topicFilters.map((topic) => (
            <div 
              key={topic}
              className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full"
            >
              <span>{topic}</span>
              <X 
                size={12} 
                className="ml-1 cursor-pointer"
                onClick={() => removeTopic(topic)}
              />
            </div>
          ))}
          
          {wordCountFilters.map((count) => (
            <div 
              key={count}
              className="flex items-center bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full"
            >
              <span>{count} words</span>
              <X 
                size={12} 
                className="ml-1 cursor-pointer"
                onClick={() => removeWordCount(count)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterBar;