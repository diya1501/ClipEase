"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { ClipboardItem, Snippet, SnippetCategory, AppTheme } from "@/lib/types";

interface AppContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  
  history: ClipboardItem[];
  addHistoryItem: (content: string) => void;
  togglePinHistoryItem: (id: string) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;

  snippets: Snippet[];
  categories: SnippetCategory[];
  addSnippet: (snippet: Omit<Snippet, 'id'>) => void;
  updateSnippet: (snippet: Snippet) => void;
  deleteSnippet: (id: string) => void;
  addCategory: (name: string) => void;
  updateCategory: (category: SnippetCategory) => void;
  deleteCategory: (id: string) => void;
  getSnippetsForCategory: (categoryId: string) => Snippet[];
  
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialCategories: SnippetCategory[] = [
  { id: 'general', name: 'General' },
  { id: 'code', name: 'Code Fragments' },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useLocalStorage<AppTheme>("clipmanager-theme", "system");

  const [history, setHistory] = useLocalStorage<ClipboardItem[]>("clipmanager-history", []);
  const [snippets, setSnippets] = useLocalStorage<Snippet[]>("clipmanager-snippets", []);
  const [categories, setCategories] = useLocalStorage<SnippetCategory[]>("clipmanager-categories", initialCategories);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let effectiveTheme = theme;
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    
    root.classList.add(effectiveTheme);
  }, [theme]);

  const addHistoryItem = (content: string) => {
    if (!content || history.some(item => item.content === content)) return;
    const newItem: ClipboardItem = {
      id: crypto.randomUUID(),
      type: 'text',
      content,
      createdAt: Date.now(),
      isPinned: false,
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const togglePinHistoryItem = (id: string) => {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, isPinned: !item.isPinned } : item));
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory(prev => prev.filter(item => item.isPinned));
  };

  const addSnippet = (snippet: Omit<Snippet, 'id'>) => {
    const newSnippet = { ...snippet, id: crypto.randomUUID() };
    setSnippets(prev => [...prev, newSnippet]);
  };

  const updateSnippet = (updatedSnippet: Snippet) => {
    setSnippets(prev => prev.map(s => s.id === updatedSnippet.id ? updatedSnippet : s));
  };

  const deleteSnippet = (id: string) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
  };

  const addCategory = (name: string) => {
    const newCategory = { id: crypto.randomUUID(), name };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (updatedCategory: SnippetCategory) => {
    setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  };
  
  const deleteCategory = (id: string) => {
    if (id === 'general' || id === 'code') return;
    setCategories(prev => prev.filter(c => c.id !== id));
    setSnippets(prev => prev.filter(s => s.categoryId !== id));
  };

  const getSnippetsForCategory = (categoryId: string) => {
    return snippets.filter(s => s.categoryId === categoryId);
  }

  const value = {
    theme,
    setTheme,
    history,
    addHistoryItem,
    togglePinHistoryItem,
    deleteHistoryItem,
    clearHistory,
    snippets,
    categories,
    addSnippet,
    updateSnippet,
    deleteSnippet,
    addCategory,
    updateCategory,
    deleteCategory,
    getSnippetsForCategory,
    searchTerm,
    setSearchTerm,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
