import {
  Heart,
  Activity,
  Sparkles,
  Briefcase,
  Palette,
} from 'lucide-react';
import type { CategoryType, DifficultyType } from '../types';

export function getCategoryColorClass(category: CategoryType) {
  switch (category) {
    case 'health':
      return 'dark:text-orange-400 text-orange-650 dark:bg-orange-500/10 bg-orange-500/15 border-orange-500/25';
    case 'fitness':
      return 'dark:text-violet-400 text-violet-650 dark:bg-violet-500/10 bg-violet-500/15 border-violet-500/25';
    case 'mindfulness':
      return 'dark:text-emerald-400 text-emerald-650 dark:bg-emerald-500/10 bg-emerald-500/15 border-emerald-500/25';
    case 'work':
      return 'dark:text-blue-400 text-blue-650 dark:bg-blue-500/10 bg-blue-500/15 border-blue-500/25';
    case 'creative':
      return 'dark:text-pink-400 text-pink-650 dark:bg-pink-500/10 bg-pink-500/15 border-pink-500/25';
  }
}

export function getDifficultyColorClass(diff: DifficultyType) {
  switch (diff) {
    case 'easy':
      return 'dark:text-sky-300 text-sky-600 border-sky-400/20 dark:bg-sky-400/5 bg-sky-400/10';
    case 'medium':
      return 'dark:text-amber-300 text-amber-600 border-amber-400/20 dark:bg-amber-400/5 bg-amber-450/10';
    case 'hard':
      return 'dark:text-rose-400 text-rose-600 border-rose-400/20 dark:bg-rose-400/5 bg-rose-400/10';
  }
}

export function getCategoryThemeClass(category: CategoryType) {
  switch (category) {
    case 'health':
      return 'bg-gradient-category-health';
    case 'fitness':
      return 'bg-gradient-category-fitness';
    case 'mindfulness':
      return 'bg-gradient-category-mindfulness';
    case 'work':
      return 'bg-gradient-category-work';
    case 'creative':
      return 'bg-gradient-category-creative';
  }
}

export function getCategoryIcon(category: CategoryType) {
  switch (category) {
    case 'health':
      return <Heart className="w-5 h-5 dark:text-orange-400 text-orange-605" />;
    case 'fitness':
      return <Activity className="w-5 h-5 dark:text-violet-400 text-violet-605" />;
    case 'mindfulness':
      return <Sparkles className="w-5 h-5 dark:text-emerald-400 text-emerald-605" />;
    case 'work':
      return <Briefcase className="w-5 h-5 dark:text-blue-400 text-blue-605" />;
    case 'creative':
      return <Palette className="w-5 h-5 dark:text-pink-400 text-pink-605" />;
  }
}
