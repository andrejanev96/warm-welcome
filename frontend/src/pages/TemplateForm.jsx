import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import GlassBackdrop from '../components/GlassBackdrop';
import api from '../utils/api';

const TemplateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'general',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingTemplate, setLoadingTemplate] = useState(isEdit);

  const categories = [
    { value: 'welcome', label: 'Welcome', icon: '👋' },
    { value: 'engagement', label: 'Engagement', icon: '💬' },
    { value: 'purchase', label: 'Purchase', icon: '🛍️' },
    { value: 'abandoned_cart', label: 'Abandoned Cart', icon: '🛒' },
    { value: 'general', label: 'General', icon: '📝' },
  ];

  const availableVariables = [
    { name: '{{firstName}}', description: 'Customer first name' },
    { name: '{{lastName}}', description: 'Customer last name' },
    { name: '{{email}}', description: 'Customer email' },
    { name: '{{storeName}}', description: 'Your store name' },
    { name: '{{orderNumber}}', description: 'Order number' },
    { name: '{{trackingLink}}', description: 'Order tracking link' },
    { name: '{{cartItems}}', description: 'Cart items list' },
    { name: '{{cartTotal}}', description: 'Cart total amount' },
    { name: '{{cartHoldDays}}', description: 'Days cart is held' },
    { name: '{{specialOffer}}', description: 'Special offer text' },
    { name: '{{reviewLink}}', description: 'Product review link' },
  ];

  const fetchTemplate = useCallback(async () => {
    try {
      setLoadingTemplate(true);
      const response = await api.get(`/templates/${id}`);
      const template = response.data.data;
      setFormData({
        name: template.name,
        subject: template.subject,
        body: template.body,
        category: template.category || 'general',
      });
    } catch (err) {
      setError('Failed to load template');
      console.error(err);
    } finally {
      setLoadingTemplate(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEdit) {
      fetchTemplate();
    }
  }, [isEdit, fetchTemplate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await api.put(`/templates/${id}`, formData);
      } else {
        await api.post('/templates', formData);
      }
      navigate('/templates');
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} template`);
      console.error('Failed to save template', err);
    } finally {
      setLoading(false);
    }
  };

  const insertVariable = (variable) => {
    setFormData({
      ...formData,
      body: `${formData.body}${variable}`,
    });
  };

  if (loadingTemplate) {
    return (
      <div className="glass-page flex items-center justify-center">
        <GlassBackdrop />
        <div className="glass-card flex items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white/70"></div>
          <span className="text-white/80">Loading template...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-page">
      <GlassBackdrop />

      {/* Header */}
      <div className="glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link to="/templates" className="glass-button bg-white/10 hover:bg-white/20">
                  ← Back
                </Link>
                <h1 className="text-3xl font-bold text-white">
                  {isEdit ? 'Edit Template' : 'Create New Template'}
                </h1>
              </div>
              <p className="text-sm text-white/80 max-w-2xl">
                {isEdit ? 'Refresh copy, personalize the experience, and keep the welcome warm.' : 'Craft a beautifully warm message that feels 1:1, every single time.'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-white/60">Category</p>
              <p className="text-sm font-semibold text-white/90">{formData.category}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card space-y-6">
              {error && (
                <div className="glass-alert border border-red-500/40 text-red-100 bg-red-500/20">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Template Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="glass-label">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Welcome Email"
                    className="glass-input"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label htmlFor="category" className="glass-label">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="glass-input"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label htmlFor="subject" className="glass-label">
                    Email Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Welcome to WarmWelcome.ai!"
                    className="glass-input"
                  />
                </div>

                {/* Body */}
                <div className="space-y-2">
                  <label htmlFor="body" className="glass-label">
                    Email Body *
                  </label>
                  <textarea
                    id="body"
                    name="body"
                    value={formData.body}
                    onChange={handleChange}
                    required
                    rows={12}
                    className="glass-input font-mono text-sm leading-relaxed min-h-[280px]"
                    placeholder={'Hi {{firstName}},\n\nWe are thrilled you joined {{storeName}}!'}
                  />
                  <p className="text-xs text-white/60">
                    Use personalization variables to keep every message feeling hand-written.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="glass-button flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : isEdit ? 'Update Template' : 'Create Template'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/templates')}
                    className="glass-button justify-center sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-card space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white">Personalization Variables</h3>
                <p className="text-sm text-white/70">
                  Click a variable to add it to your template body.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {availableVariables.map((variable) => (
                  <button
                    type="button"
                    key={variable.name}
                    onClick={() => insertVariable(variable.name)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 transition-all"
                  >
                    <span className="block font-mono text-sm text-white">{variable.name}</span>
                    <span className="block text-xs text-white/70 mt-1">{variable.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card space-y-3">
              <h3 className="text-xl font-semibold text-white">Tips for Warm Emails</h3>
              <ul className="space-y-3 text-sm text-white/70 list-disc list-inside">
                <li>Lead with gratitude and keep the tone human.</li>
                <li>Use variables sparingly—balance personalization with clarity.</li>
                <li>Invite a reply to encourage a two-way conversation.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateForm;
