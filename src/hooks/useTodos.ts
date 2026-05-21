import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../constants/storage';
import { getLocalDateString } from '../utils';
import type { Todo } from '../types';

export function useTodos() {
  const [todos, setTodos] = useLocalStorage<Todo[]>(STORAGE_KEYS.todos, []);

  const addTodo = (title: string, description = '', scheduledDate: string | null = null) => {
    const now = getLocalDateString(0);
    const todo: Todo = {
      id: `todo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title: title.trim(),
      description: description.trim(),
      scheduledDate,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    setTodos((prev) => [todo, ...prev]);
    return todo;
  };

  const updateTodo = (id: string, patch: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: getLocalDateString(0) } : t,
      ),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, updatedAt: getLocalDateString(0) }
          : t,
      ),
    );
  };

  return { todos, setTodos, addTodo, updateTodo, deleteTodo, toggleTodo };
}
