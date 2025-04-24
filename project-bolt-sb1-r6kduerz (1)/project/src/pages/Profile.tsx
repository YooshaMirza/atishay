import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, ChevronRight, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser, updateUserPoliticalLeaning } from '../services/firebase';
import { PoliticalLeaning } from '../types';

const Profile: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedLeaning, setSelectedLeaning] = useState<PoliticalLeaning>(
    userData?.politicalLeaning || 'unspecified'
  );
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const politicalLeaningOptions: { value: PoliticalLeaning; label: string; description: string }[] = [
    { 
      value: 'conservative', 
      label: 'Conservative', 
      description: 'Prioritizes tradition, free markets, and limited government intervention.'
    },
    { 
      value: 'liberal', 
      label: 'Liberal', 
      description: 'Advocates for social equality, government-funded programs, and progressive reforms.'
    },
    { 
      value: 'moderate', 
      label: 'Moderate', 
      description: 'Takes a balanced position between left and right on most political issues.'
    },
    { 
      value: 'libertarian', 
      label: 'Libertarian', 
      description: 'Emphasizes personal freedom, minimal government, and free markets.'
    },
    { 
      value: 'green', 
      label: 'Green', 
      description: 'Focuses on environmental concerns, social justice, and grassroots democracy.'
    },
    { 
      value: 'unspecified', 
      label: 'No Preference', 
      description: 'Receive a balanced mix of content from various political perspectives.'
    }
  ];

  const getLeaningLabel = (leaning: PoliticalLeaning): string => {
    const option = politicalLeaningOptions.find(opt => opt.value === leaning);
    return option ? option.label : 'Unknown';
  };

  const handleLeaningChange = async () => {
    if (!currentUser || selectedLeaning === userData?.politicalLeaning) return;
    
    try {
      setIsUpdating(true);
      setError('');
      
      await updateUserPoliticalLeaning(currentUser.uid, selectedLeaning);
      
      setSuccess('Political preference updated successfully!');
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Failed to update political preference');
      console.error('Error updating political leaning:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      // Redirect is handled by the auth listener in the AuthContext
    } catch (err) {
      setError('Failed to log out');
      console.error('Error logging out:', err);
    }
  };

  if (!currentUser || !userData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Please sign in to view your profile.</p>
        <Link 
          to="/signin"
          className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-4 rounded-full mr-4">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900">{currentUser.displayName}</h2>
              <p className="text-gray-600">{currentUser.email}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Political Preference</h3>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              Your current preference: <span className="font-medium">{getLeaningLabel(userData.politicalLeaning)}</span>
            </p>
            <p className="text-sm text-gray-500">
              This helps us tailor news content to your interests. You can change it at any time.
            </p>
          </div>
          
          <div className="space-y-3 mb-6">
            {politicalLeaningOptions.map((option) => (
              <label 
                key={option.value}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedLeaning === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="politicalLeaning"
                  value={option.value}
                  checked={selectedLeaning === option.value}
                  onChange={() => setSelectedLeaning(option.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <span className="block text-gray-900 font-medium">{option.label}</span>
                  <span className="block text-sm text-gray-500">{option.description}</span>
                </div>
              </label>
            ))}
          </div>
          
          <button
            onClick={handleLeaningChange}
            disabled={isUpdating || selectedLeaning === userData.politicalLeaning}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors ${
              isUpdating || selectedLeaning === userData.politicalLeaning
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-700'
            }`}
          >
            {isUpdating ? 'Updating...' : 'Update Preference'}
          </button>
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="space-y-2">
            <Link 
              to="/survey"
              className="flex items-center justify-between py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <Settings size={20} className="text-gray-500 mr-3" />
                <span className="text-gray-800">Retake Political Survey</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-red-600"
            >
              <div className="flex items-center">
                <LogOut size={20} className="mr-3" />
                <span>Sign Out</span>
              </div>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;