import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  PlayCircle, 
  Trash2, 
  Edit3, 
  Folder,
  Calendar,
  Tag
} from 'lucide-react';

export default function ItemCard({ item, onEdit, onDelete, onStatusToggle }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={15} className="text-emerald-400" />;
      case 'in-progress':
        return <PlayCircle size={15} className="text-amber-400" />;
      default:
        return <Clock size={15} className="text-slate-400" />;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    }
  };

  const getCardBorder = (status) => {
    switch (status) {
      case 'completed':
        return 'border-l-4 border-l-emerald-500 hover:border-l-emerald-400';
      case 'in-progress':
        return 'border-l-4 border-l-amber-500 hover:border-l-amber-400';
      default:
        return 'border-l-4 border-l-indigo-500 hover:border-l-indigo-400';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleNextStatus = () => {
    let nextStatus = 'pending';
    if (item.status === 'pending') nextStatus = 'in-progress';
    else if (item.status === 'in-progress') nextStatus = 'completed';
    else nextStatus = 'pending';

    onStatusToggle(item._id, nextStatus);
  };

  return (
    <div className={`group rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)] ${getCardBorder(item.status)}`}>
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
            <Folder size={11} />
            {item.category || 'General'}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getPriorityBadge(item.priority)}`}>
            {item.priority}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button 
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            onClick={() => onEdit(item)}
            title="Edit item"
          >
            <Edit3 size={14} />
          </button>
          <button 
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-colors"
            onClick={() => onDelete(item._id)}
            title="Delete item"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1">
        <h3 className={`text-base font-bold text-white mb-1.5 line-clamp-2 leading-snug ${item.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag, idx) => (
            <span key={idx} className="text-[10px] font-medium text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
        <button
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-medium transition-all"
          onClick={handleNextStatus}
          title="Click to cycle status (Pending -> In Progress -> Completed)"
        >
          {getStatusIcon(item.status)}
          <span>
            {item.status === 'in-progress' ? 'In Progress' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
        </button>

        <div className="flex items-center gap-1 text-[11px] text-slate-500" title={`Created: ${item.createdAt}`}>
          <Calendar size={12} />
          <span>{formatDate(item.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
