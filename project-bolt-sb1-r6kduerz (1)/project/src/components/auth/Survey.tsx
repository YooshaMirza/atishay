import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ChevronRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PoliticalLeaning } from '../../types';

const surveyQuestions = [
  {
    id: '1',
    question: 'Which statement best aligns with your views on government regulation?',
    options: [
      { text: 'The government should limit regulations to ensure businesses can thrive', leaning: 'conservative' },
      { text: 'The government should implement regulations to protect consumers and the environment', leaning: 'liberal' },
      { text: 'The government should find a balance between business freedom and consumer protection', leaning: 'moderate' },
      { text: 'The government should minimize all regulations on individuals and businesses', leaning: 'libertarian' },
      { text: 'The government should heavily regulate corporations to protect the environment', leaning: 'green' }
    ]
  },
  {
    id: '2',
    question: 'What is your view on taxation?',
    options: [
      { text: 'Lower taxes across the board to stimulate economic growth', leaning: 'conservative' },
      { text: 'Higher taxes on the wealthy to fund social programs', leaning: 'liberal' },
      { text: 'Balanced tax approach with moderate rates across income levels', leaning: 'moderate' },
      { text: 'Minimal taxation with most services privatized', leaning: 'libertarian' },
      { text: 'Higher taxes on environmentally harmful activities and corporations', leaning: 'green' }
    ]
  },
  {
    id: '3',
    question: 'What best describes your view on healthcare?',
    options: [
      { text: 'Healthcare should be provided through private markets with minimal government involvement', leaning: 'conservative' },
      { text: 'Universal healthcare should be guaranteed to all citizens', leaning: 'liberal' },
      { text: 'A mix of private and public healthcare options should be available', leaning: 'moderate' },
      { text: 'Healthcare decisions should be left to individuals with no government mandates', leaning: 'libertarian' },
      { text: 'Healthcare should be universal with emphasis on preventive and holistic approaches', leaning: 'green' }
    ]
  }
];

const Survey: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<PoliticalLeaning[]>([]);
  const [loading, setLoading] = useState(false);
  const { setUserPoliticalLeaning } = useAuth();
  const navigate = useNavigate();

  const handleAnswer = (leaning: PoliticalLeaning) => {
    const newAnswers = [...answers, leaning];
    setAnswers(newAnswers);
    
    if (currentQuestion < surveyQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishSurvey(newAnswers);
    }
  };

  const finishSurvey = async (allAnswers: PoliticalLeaning[]) => {
    setLoading(true);
    
    try {
      // Count the frequency of each leaning
      const leaningCount: Record<PoliticalLeaning, number> = {
        conservative: 0,
        liberal: 0,
        moderate: 0,
        libertarian: 0,
        green: 0,
        unspecified: 0
      };
      
      allAnswers.forEach(leaning => {
        leaningCount[leaning]++;
      });
      
      // Find the most frequent leaning
      let dominantLeaning: PoliticalLeaning = 'unspecified';
      let maxCount = 0;
      
      (Object.keys(leaningCount) as PoliticalLeaning[]).forEach(leaning => {
        if (leaningCount[leaning] > maxCount) {
          maxCount = leaningCount[leaning];
          dominantLeaning = leaning;
        }
      });
      
      // Set the user's political leaning
      await setUserPoliticalLeaning(dominantLeaning);
      navigate('/');
    } catch (error) {
      console.error('Error saving survey results:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const skipSurvey = async () => {
    try {
      setLoading(true);
      await setUserPoliticalLeaning('unspecified');
      navigate('/');
    } catch (error) {
      console.error('Error skipping survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestionData = surveyQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / surveyQuestions.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="w-full max-w-2xl bg-white bg-opacity-80 backdrop-blur-md p-8 rounded-xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Political Preference Survey</h2>
          <button
            onClick={skipSurvey}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
            disabled={loading}
          >
            Skip for now
          </button>
        </div>
        
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Question {currentQuestion + 1} of {surveyQuestions.length}</p>
        </div>
        
        <div className="mb-8">
          <div className="flex items-start mb-4">
            <HelpCircle className="text-blue-500 mr-2 flex-shrink-0 mt-1" size={20} />
            <h3 className="text-xl font-medium text-gray-800">{currentQuestionData.question}</h3>
          </div>
          
          <div className="space-y-3">
            {currentQuestionData.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option.leaning)}
                disabled={loading}
                className="w-full text-left p-4 rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex items-center justify-between group"
              >
                <span>{option.text}</span>
                <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={18} />
                </span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <CheckCircle size={16} className="mr-2 text-green-500" />
          <p>Your responses help us tailor content to your preferences</p>
        </div>
      </div>
    </div>
  );
};

export default Survey;