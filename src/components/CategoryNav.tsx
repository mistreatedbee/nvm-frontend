import React from 'react';
import { motion } from 'framer-motion';
import { categories } from '../utils/mockData';
interface CategoryNavProps {
  activeCategory: string;
  onSelect: (id: string) => void;
}
export function CategoryNav({
  activeCategory,
  onSelect
}: CategoryNavProps) {
  return <div className="w-full overflow-x-auto pb-4 pt-2 no-scrollbar">
      <div className="flex space-x-2 md:space-x-4 px-4 min-w-max">
        {categories.map(category => {
        const isActive = activeCategory === category.id;
        return <button key={category.id} onClick={() => onSelect(category.id)} className={`relative px-6 py-3 rounded-full text-sm md:text-base font-medium transition-colors ${isActive ? 'text-white' : 'text-nvm-green-primary hover:text-nvm-green-light bg-white border border-nvm-green-primary/20'}`}>
              {isActive && <motion.div layoutId="activeCategory" className="absolute inset-0 bg-nvm-green-primary rounded-full" initial={false} transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30
          }} />}
              <span className="relative z-10">{category.name}</span>
            </button>;
      })}
      </div>
    </div>;
}