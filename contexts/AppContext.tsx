import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface SavedArticle {
  id: string;
  title: string;
  summary: string;
  why: string;
  upskill: string;
  sourceUrl: string;
  image?: string;
  savedAt: number;
}

interface AppContextType {
  language: string;
  setLanguage: (language: string) => void;
  savedArticles: SavedArticle[];
  saveArticle: (article: SavedArticle) => void;
  removeSavedArticle: (id: string) => void;
  isArticleSaved: (id: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);

  // Load saved articles from AsyncStorage on app start
  useEffect(() => {
    loadSavedArticles();
    loadLanguagePreference();
  }, []);

  const loadSavedArticles = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedArticles');
      if (saved) {
        setSavedArticles(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved articles:', error);
    }
  };

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  };

  const saveLanguagePreference = async (lang: string) => {
    try {
      await AsyncStorage.setItem('language', lang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    saveLanguagePreference(lang);
  };

  const saveSavedArticles = async (articles: SavedArticle[]) => {
    try {
      await AsyncStorage.setItem('savedArticles', JSON.stringify(articles));
    } catch (error) {
      console.error('Error saving articles:', error);
    }
  };

  const saveArticle = (article: SavedArticle) => {
    setSavedArticles(prev => {
      // Check if article is already saved
      if (prev.some(saved => saved.id === article.id)) {
        return prev;
      }
      const newArticles = [...prev, article];
      saveSavedArticles(newArticles); // Persist to AsyncStorage
      return newArticles;
    });
  };

  const removeSavedArticle = (id: string) => {
    setSavedArticles(prev => {
      const newArticles = prev.filter(article => article.id !== id);
      saveSavedArticles(newArticles); // Persist to AsyncStorage
      return newArticles;
    });
  };

  const isArticleSaved = (id: string) => {
    return savedArticles.some(article => article.id === id);
  };

  return (
    <AppContext.Provider value={{ 
      language, 
      setLanguage: handleSetLanguage, 
      savedArticles, 
      saveArticle, 
      removeSavedArticle, 
      isArticleSaved 
    }}>
      {children}
    </AppContext.Provider>
  );
};