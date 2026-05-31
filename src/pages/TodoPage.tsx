import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Check,
  Calendar as CalendarIcon,
  Pencil,
  ListTodo,
  Circle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useTodos } from '../hooks/useTodos';
import { getLocalDateString, formatFriendlyDate } from '../utils';
import type { Todo } from '../types';

export default function TodoPage() {
  const { todos, addTodo, updateTodo, deleteTodo, toggleTodo } = useTodos();
  const location = useLocation();
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTodo(title, description, scheduledDate || null);
    setTitle('');
    setDescription('');
    setScheduledDate('');
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description);
    setEditDate(todo.scheduledDate ?? '');
  };

  const saveEdit = () => {
    if (!editingId || !editTitle.trim()) return;
    updateTodo(editingId, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      scheduledDate: editDate || null,
    });
    setEditingId(null);
  };

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  const stats = useMemo(() => {
    const active = todos.filter((t) => !t.completed).length;
    const done = todos.filter((t) => t.completed).length;
    const today = getLocalDateString(0);
    const dueToday = todos.filter((t) => t.scheduledDate === today && !t.completed).length;
    return { active, done, dueToday, total: todos.length };
  }, [todos]);

  const today = getLocalDateString(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') !== 'add') return;
    window.setTimeout(() => titleInputRef.current?.focus(), 120);
  }, [location.search]);

  return (
    <div className="max-w-2xl mx-auto">
      <header className="pb-6 mb-6 border-b border-slate-200 dark:border-white/5">
        <h1 className="text-2xl font-extrabold tracking-tight dark:text-white text-slate-850 flex items-center gap-2">
          <ListTodo className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          To‑Do
        </h1>
        <p className="text-sm text-slate-500 mt-1">Capture tasks, schedule them, and clear your list</p>
      </header>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
        <div className="glass-panel p-3 sm:p-4 rounded-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active</p>
          <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-0.5">{stats.active}</p>
        </div>
        <div className="glass-panel p-3 sm:p-4 rounded-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Done</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.done}</p>
        </div>
        <div className="glass-panel p-3 sm:p-4 rounded-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Due today</p>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats.dueToday}</p>
        </div>
      </div>

      <form
        onSubmit={handleAdd}
        className="glass-panel p-5 rounded-2xl mb-6 border border-cyan-500/10 shadow-lg shadow-cyan-500/5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
            New task
          </span>
        </div>
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you need to get done?"
          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 py-3 px-4 rounded-xl text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add notes (optional)"
          rows={2}
          className="w-full mt-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 py-2.5 px-4 rounded-xl text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
        />
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <label className="flex-1 flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2.5 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
            <CalendarIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={today}
              className="flex-1 bg-transparent text-xs font-medium text-slate-800 dark:text-white focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            Add task
          </button>
        </div>
      </form>

      <div className="flex p-1 mb-5 rounded-xl bg-slate-200/70 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5">
        {(['all', 'active', 'done'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
              filter === f
                ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {f}
            {f === 'active' && stats.active > 0 && (
              <span className="ml-1 opacity-70">({stats.active})</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel py-16 rounded-2xl text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
            <CheckCircle2 className="w-7 h-7 opacity-60" />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">All clear</p>
          <p className="text-xs text-slate-500 mt-1">Add a task above to get started</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((todo) => (
            <li
              key={todo.id}
              className={`group glass-panel rounded-2xl overflow-hidden transition-all duration-200 ${
                todo.completed ? 'opacity-75' : 'hover:border-cyan-500/20'
              }`}
            >
              <div className="flex gap-3 items-stretch">
                <div
                  className={`w-1 shrink-0 ${
                    todo.completed ? 'bg-slate-300 dark:bg-slate-600' : 'bg-cyan-500'
                  }`}
                />
                <div className="flex gap-3 items-start flex-1 p-4 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleTodo(todo.id)}
                    className={`mt-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      todo.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white scale-100'
                        : 'border-slate-300 dark:border-slate-600 hover:border-cyan-500 text-transparent hover:text-cyan-500/30'
                    }`}
                    aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {todo.completed ? (
                      <Check className="w-4 h-4" strokeWidth={3} />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    {editingId === todo.id ? (
                      <div className="space-y-2">
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-sm font-semibold focus:border-cyan-500 focus:outline-none"
                        />
                        <input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Notes"
                          className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-xs focus:border-cyan-500 focus:outline-none"
                        />
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-xs focus:border-cyan-500 focus:outline-none"
                        />
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={saveEdit}
                            className="px-4 py-1.5 bg-cyan-600 text-white text-xs rounded-lg font-bold"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-4 py-1.5 text-slate-500 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p
                          className={`text-sm font-bold dark:text-white text-slate-800 leading-snug ${
                            todo.completed ? 'line-through text-slate-500' : ''
                          }`}
                        >
                          {todo.title}
                        </p>
                        {todo.description && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{todo.description}</p>
                        )}
                        {todo.scheduledDate && (
                          <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-wide text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg">
                            <CalendarIcon className="w-3 h-3" />
                            {formatFriendlyDate(todo.scheduledDate)}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {editingId !== todo.id && (
                    <div className="flex flex-col gap-0.5 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => startEdit(todo)}
                        className="p-2 text-slate-400 hover:text-cyan-600 rounded-lg hover:bg-cyan-500/10"
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTodo(todo.id)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-500/10"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
