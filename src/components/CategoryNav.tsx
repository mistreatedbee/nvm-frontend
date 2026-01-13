import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { categoriesAPI } from '../lib/api';

interface CategoryNavProps {
  activeCategory: string;
  onSelect: (id: string) => void;
}

export function CategoryNav({ activeCategory, onSelect }: CategoryNavProps) {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      const categoriesData = response.data.data || [];
      
      // Add "All" category
      setCategories([
        { _id: 'all', name: 'All Products', slug: 'all' },
        ...categoriesData
      ]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to default categories
      setCategories([
        { _id: 'all', name: 'All Products', slug: 'all' }
      ]);
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-4 pt-2 no-scrollbar">
      <div className="flex space-x-2 md:space-x-4 px-4 min-w-max">
        {categories.map((category) => {
          const isActive = activeCategory === (category._id || category.slug);
          return (
            <button
              key={category._id}
              onClick={() => onSelect(category._id || category.slug)}
              className={`relative px-6 py-3 rounded-full text-sm md:text-base font-medium transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-nvm-green-primary hover:text-nvm-green-light bg-white border border-nvm-green-primary/20'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-nvm-green-primary rounded-full"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}
              <span className="relative z-10">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
