import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  const categories = [
    { value: 'all', label: 'All Templates', icon: '📧' },
    { value: 'welcome', label: 'Welcome', icon: '👋' },
    { value: 'engagement', label: 'Engagement', icon: '💬' },
    { value: 'purchase', label: 'Purchase', icon: '🛍️' },
    { value: 'abandoned_cart', label: 'Abandoned Cart', icon: '🛒' },
    { value: 'general', label: 'General', icon: '📝' },
  ];

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = filter === 'all'
        ? `${API_URL}/templates`
        : `${API_URL}/templates?category=${filter}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTemplates(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load templates');
      console.error('Failed to load templates', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleDuplicate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/templates/${id}/duplicate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTemplates();
    } catch (err) {
      setError('Failed to duplicate template');
      console.error('Failed to duplicate template', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTemplates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete template');
      console.error('Failed to delete template', err);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Email Templates</h1>
          <p className="mt-1 text-sm text-white/80">
            Create and manage warm, personalized emails for every moment
          </p>
        </div>
        <Link
          to="/templates/new"
          className="glass-button"
        >
          <span className="text-xl">+</span>
          New Template
        </Link>
      </div>

      {/* Main Content */}
      <div>
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`glass-button px-4 py-2 ${
                filter === cat.value
                  ? 'bg-white/25 border border-white/40'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 glass-alert border border-red-500/40 text-red-100 bg-red-500/20">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : templates.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 glass-card">
            <div className="text-6xl mb-4">📧</div>
            <h3 className="text-xl font-semibold text-white mb-2">No templates yet</h3>
            <p className="text-white/70 mb-4">
              {filter === 'all'
                ? 'Craft your first message to greet new customers.'
                : `No templates in the ${filter.replace('_', ' ')} category yet.`}
            </p>
            <Link to="/templates/new" className="glass-button inline-flex">
              Create Template
            </Link>
          </div>
        ) : (
          /* Templates Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="glass-card hover:translate-y-[-4px] transition-transform"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <Link
                      to={`/templates/${template.id}`}
                      className="font-semibold text-xl text-white hover:text-white/90 transition-colors"
                    >
                      {template.name}
                    </Link>
                    <span className="mt-2 inline-block px-2 py-1 text-xs rounded-full bg-white/20 text-white border border-white/30">
                      {template.category}
                    </span>
                  </div>
                  {template.isDefault && (
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-400/20 text-yellow-50 border border-yellow-300/40">
                      Default
                    </span>
                  )}
                </div>

                <div className="mb-4 space-y-2">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/60">Subject</p>
                    <p className="text-sm text-white/90 line-clamp-2">{template.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/60">Preview</p>
                    <p className="text-sm text-white/70 line-clamp-3">{template.body}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-white/20">
                  <Link
                    to={`/templates/${template.id}`}
                    className="flex-1 text-center px-3 py-2 text-sm rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDuplicate(template.id)}
                    className="flex-1 px-3 py-2 text-sm rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
                  >
                    Duplicate
                  </button>
                  {!template.isDefault && (
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="px-3 py-2 text-sm rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Templates;
