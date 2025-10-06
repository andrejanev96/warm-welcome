import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import GlassBackdrop from '../components/GlassBackdrop';
import api from '../utils/api';

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

const TemplateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [variableQuery, setVariableQuery] = useState('');

  const bodyRef = useRef(null);

  const fetchTemplate = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/templates/${id}`);
      const fetchedTemplate = response.data.data;
      setTemplate(fetchedTemplate);
      setFormData({
        name: fetchedTemplate.name,
        subject: fetchedTemplate.subject,
        body: fetchedTemplate.body,
        category: fetchedTemplate.category || 'general',
      });
      setError('');
    } catch (err) {
      setError('Failed to load template');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await api.delete(`/templates/${id}`);
      navigate('/templates');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete template');
      console.error('Failed to delete template', err);
    }
  };

  const handleDuplicate = async () => {
    try {
      await api.post(`/templates/${id}/duplicate`);
      navigate('/templates');
    } catch (err) {
      setError('Failed to duplicate template');
      console.error('Failed to duplicate template', err);
    }
  };

  const handleFieldChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const insertVariable = (variable) => {
    if (!bodyRef.current) return;
    const textarea = bodyRef.current;
    const { selectionStart, selectionEnd } = textarea;
    const before = formData.body.slice(0, selectionStart);
    const after = formData.body.slice(selectionEnd);
    const updated = `${before}${variable}${after}`;

    setFormData((prev) => ({
      ...prev,
      body: updated,
    }));

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = selectionStart + variable.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const filteredVariables = useMemo(() => {
    if (!variableQuery.trim()) return availableVariables;
    const query = variableQuery.toLowerCase();
    return availableVariables.filter(
      (variable) =>
        variable.name.toLowerCase().includes(query) ||
        variable.description.toLowerCase().includes(query)
    );
  }, [variableQuery]);

  const startEditing = () => {
    if (template?.isDefault) return;
    setIsEditing(true);
    setSuccessMessage('');
    setVariableQuery('');
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: template.category || 'general',
    });
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError('');
    setSuccessMessage('');
    setVariableQuery('');
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: template.category || 'general',
    });
  };

  const handleSave = async () => {
    if (!formData || !formData.name || !formData.subject || !formData.body) {
      setError('Please fill in name, subject, and body before saving.');
      return;
    }

    try {
      setSaving(true);
      const response = await api.put(`/templates/${id}`, formData);
      const updated = response.data.data;
      setTemplate(updated);
      setFormData({
        name: updated.name,
        subject: updated.subject,
        body: updated.body,
        category: updated.category || 'general',
      });
      setSuccessMessage('Template updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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

  if (error && !template) {
    return (
      <div className="glass-page flex items-center justify-center">
        <GlassBackdrop />
        <div className="glass-card text-center max-w-lg space-y-4">
          <div className="text-5xl">⚠️</div>
          <h3 className="text-2xl font-semibold text-white">Error Loading Template</h3>
          <p className="text-sm text-white/70">{error}</p>
          <Link to="/templates" className="glass-button justify-center">
            Back to Templates
          </Link>
        </div>
      </div>
    );
  }

  if (!template || !formData) {
    return null;
  }

  return (
    <div className="glass-page">
      <GlassBackdrop />

      <div className="glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Link to="/templates" className="glass-button bg-white/10 hover:bg-white/20">
                  ← Back
                </Link>
                <h1 className="text-3xl font-bold text-white">{template.name}</h1>
                <span className="px-3 py-1 text-xs rounded-full bg-white/20 border border-white/30 text-white">
                  {template.category}
                </span>
                {template.isDefault && (
                  <span className="px-3 py-1 text-xs rounded-full bg-yellow-400/30 border border-yellow-300/40 text-yellow-50">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm text-white/70">
                Created {new Date(template.createdAt).toLocaleDateString()}
                {template.updatedAt !== template.createdAt && (
                  <span> • Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDuplicate}
                className="glass-button justify-center"
              >
                Duplicate
              </button>
              {!template.isDefault && !isEditing && (
                <button
                  onClick={startEditing}
                  className="glass-button justify-center"
                >
                  Edit
                </button>
              )}
              {!template.isDefault && isEditing && (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="glass-button glass-btn-orange justify-center disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    disabled={saving}
                    className="glass-button justify-center bg-white/10 hover:bg-white/20"
                  >
                    Cancel
                  </button>
                </>
              )}
              {!template.isDefault && (
                <button
                  onClick={handleDelete}
                  className="glass-button justify-center bg-red-500/30 hover:bg-red-500/40"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {successMessage && (
          <div className="mb-6 glass-card border border-emerald-400/40 bg-emerald-500/20 text-emerald-50">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="glass-alert border border-red-500/40 text-red-100 bg-red-500/20 mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {isEditing ? (
              <div className="glass-card space-y-6">
                <div className="space-y-2">
                  <label className="glass-label" htmlFor="templateName">
                    Template name
                  </label>
                  <input
                    id="templateName"
                    type="text"
                    className="glass-input"
                    value={formData.name}
                    onChange={handleFieldChange('name')}
                  />
                </div>

                <div className="space-y-2">
                  <label className="glass-label" htmlFor="templateCategory">
                    Category
                  </label>
                  <select
                    id="templateCategory"
                    className="glass-input"
                    value={formData.category}
                    onChange={handleFieldChange('category')}
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="glass-label" htmlFor="templateSubject">
                    Subject
                  </label>
                  <input
                    id="templateSubject"
                    type="text"
                    className="glass-input"
                    value={formData.subject}
                    onChange={handleFieldChange('subject')}
                  />
                </div>

                <div className="space-y-2">
                  <label className="glass-label" htmlFor="templateBody">
                    Body
                  </label>
                  <textarea
                    id="templateBody"
                    ref={bodyRef}
                    className="glass-input font-mono text-sm leading-relaxed min-h-[320px]"
                    value={formData.body}
                    onChange={handleFieldChange('body')}
                  />
                  <p className="text-xs text-white/60">
                    Tip: type the first letter of a variable below to filter, then click to insert where your cursor currently is.
                  </p>
                </div>

                <div className="glass-card bg-white/5 border border-white/15 space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h4 className="text-lg font-semibold text-white">Shopify variables</h4>
                      <p className="text-xs text-white/60">Start typing to auto-complete common placeholders.</p>
                    </div>
                    <input
                      type="text"
                      className="glass-input w-full sm:w-64"
                      placeholder="Search variables…"
                      value={variableQuery}
                      onChange={(event) => setVariableQuery(event.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                    {filteredVariables.length === 0 ? (
                      <p className="text-sm text-white/60 italic">No matches found. Try different letters.</p>
                    ) : (
                      filteredVariables.map((variable) => (
                        <button
                          key={variable.name}
                          type="button"
                          onClick={() => insertVariable(variable.name)}
                          className="text-left px-4 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 transition-all"
                        >
                          <span className="block font-mono text-sm text-white">{variable.name}</span>
                          <span className="block text-xs text-white/70 mt-1">{variable.description}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="glass-card space-y-2">
                  <h3 className="text-sm uppercase tracking-widest text-white/60">Email Subject</h3>
                  <p className="text-2xl font-semibold text-white">{template.subject}</p>
                </div>

                <div className="glass-card">
                  <h3 className="text-sm uppercase tracking-widest text-white/60 mb-4">Email Body</h3>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-6 overflow-auto max-h-[70vh]">
                    <pre className="whitespace-pre-wrap font-sans text-base text-white/90 leading-relaxed">
                      {template.body}
                    </pre>
                  </div>
                </div>

                <div className="glass-card bg-white/10 border border-white/20">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Personalization Reminder</h4>
                      <p className="text-sm text-white/70">
                        Variables like <code className="font-mono">{'{{firstName}}'}</code> and <code className="font-mono">{'{{storeName}}'}</code> automatically become real customer data when emails send. Keep things conversational to maximize replies.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass-card space-y-4">
              <h3 className="text-xl font-semibold text-white">Template Insights</h3>
              <div className="space-y-3 text-sm text-white/70">
                <div className="flex items-center justify-between">
                  <span>Used in campaigns</span>
                  <span className="text-white font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Emails sent</span>
                  <span className="text-white font-semibold">0</span>
                </div>
              </div>
              {template.isDefault && (
                <div className="rounded-xl border border-yellow-300/40 bg-yellow-400/20 p-4 text-sm text-yellow-50">
                  Default templates are read-only. Duplicate this template to create a customized version.
                </div>
              )}
            </div>

            <div className="glass-card space-y-4">
              <h3 className="text-xl font-semibold text-white">Next Steps</h3>
              <ul className="space-y-2 text-sm text-white/70 list-disc list-inside">
                <li>Connect Shopify to enable real triggers.</li>
                <li>Add a follow-up email for high-intent users.</li>
                <li>Personalize content using AI suggestions.</li>
              </ul>
            </div>

            <div className="glass-card space-y-4">
              <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
              <div className="flex flex-col gap-3">
                {!template.isDefault && !isEditing && (
                  <button
                    onClick={startEditing}
                    className="glass-button justify-center"
                  >
                    Edit template inline
                  </button>
                )}
                <button
                  onClick={handleDuplicate}
                  className="glass-button justify-center bg-white/10 hover:bg-white/20"
                >
                  Duplicate template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateDetail;
