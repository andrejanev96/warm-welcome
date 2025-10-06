import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import GlassBackdrop from '../components/GlassBackdrop';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const CampaignForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateId: '',
    triggerType: 'user_signup',
    startDate: '',
    endDate: '',
  });
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  const isFormValid = Boolean(
    formData.name.trim() &&
    formData.templateId &&
    formData.triggerType
  );

  const triggerTypes = [
    { value: 'user_signup', label: 'User Signup', icon: '👋', description: 'Trigger when a new user signs up' },
    { value: 'first_purchase', label: 'First Purchase', icon: '🛍️', description: "Trigger after customer's first purchase" },
    { value: 'abandoned_cart', label: 'Abandoned Cart', icon: '🛒', description: 'Trigger when cart is abandoned' },
    { value: 'post_purchase', label: 'Post Purchase', icon: '📦', description: 'Trigger after a purchase is made' },
    { value: 'engagement', label: 'Re-engagement', icon: '💬', description: 'Trigger for inactive users' },
    { value: 'custom', label: 'Custom', icon: '⚙️', description: 'Custom trigger conditions' },
  ];

  const fetchTemplates = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates(response.data.data);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  }, []);

  const fetchCampaign = useCallback(async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const campaign = response.data.data;
      setFormData({
        name: campaign.name,
        description: campaign.description || '',
        templateId: campaign.template?.id || '',
        triggerType: 'user_signup',
        startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
        endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
      });
    } catch (err) {
      setError('Failed to load campaign');
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (isEdit) {
      fetchCampaign();
    } else {
      setLoadingData(false);
    }
  }, [isEdit, fetchCampaign]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        startDate: formData.startDate ? formData.startDate : null,
        endDate: formData.endDate ? formData.endDate : null,
      };
      if (isEdit) {
        await axios.put(`${API_URL}/campaigns/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/campaigns`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      navigate('/campaigns');
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} campaign`);
      console.error('Failed to save campaign', err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="glass-page flex items-center justify-center">
        <GlassBackdrop />
        <div className="glass-card flex items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white/70"></div>
          <span className="text-white/80">Loading campaign details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-page">
      <GlassBackdrop />

      {/* Header */}
      <div className="glass-nav">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link to="/campaigns" className="glass-button bg-white/10 hover:bg-white/20">
                  ← Back
                </Link>
                <h1 className="text-3xl font-bold text-white">
                  {isEdit ? 'Edit Campaign' : 'Create New Campaign'}
                </h1>
              </div>
              <p className="text-sm text-white/80 max-w-2xl">
                {isEdit ? 'Update your automated email journey with refreshed details.' : 'Launch a behavior-based journey that greets customers with warmth and perfectly timed messages.'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-white/60">Status</p>
              <p className="text-sm font-semibold text-white/90">Draft • Paused</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="glass-card space-y-8">
          {error && (
            <div className="glass-alert border border-red-500/40 text-red-100 bg-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Campaign Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="glass-label">
                Campaign Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Welcome Series"
                className="glass-input"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="glass-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of this campaign..."
                className="glass-input min-h-[120px] resize-y"
              />
              <p className="text-xs text-white/60">
                Share context for your teammates so everyone knows what this journey aims to achieve.
              </p>
            </div>

            {/* Select Template */}
            <div className="space-y-2">
              <label htmlFor="templateId" className="glass-label">
                Email Template *
              </label>
              <select
                id="templateId"
                name="templateId"
                value={formData.templateId}
                onChange={handleChange}
                required
                className="glass-input"
              >
                <option value="">Select a template...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.category})
                  </option>
                ))}
              </select>
              <p className="text-xs text-white/60">
                This template is the warm message customers receive when the trigger fires.
              </p>
            </div>

            {/* Trigger Type */}
            <div className="space-y-3">
              <span className="glass-label">Trigger Event *</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {triggerTypes.map((trigger) => {
                  const isSelected = formData.triggerType === trigger.value;
                  return (
                    <label
                      key={trigger.value}
                      className={`relative flex items-start gap-3 rounded-2xl p-5 transition-all border ${
                        isSelected
                          ? 'bg-white/20 border-white/50 shadow-lg shadow-primary-500/20'
                          : 'bg-white/10 border-white/20 hover:bg-white/15'
                      }`}
                    >
                      <input
                        type="radio"
                        name="triggerType"
                        value={trigger.value}
                        checked={isSelected}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="text-2xl flex-shrink-0">{trigger.icon}</span>
                      <div className="space-y-1">
                        <p className="font-semibold text-white">{trigger.label}</p>
                        <p className="text-xs text-white/70">{trigger.description}</p>
                      </div>
                      {isSelected && (
                        <span className="absolute top-4 right-4 inline-flex items-center justify-center h-6 w-6 rounded-full bg-white/30 text-white">
                          ✓
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="startDate" className="glass-label">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="glass-input"
                />
                <p className="text-xs text-white/60">
                  When should the campaign begin sending?
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="endDate" className="glass-label">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate}
                  className="glass-input"
                />
                <p className="text-xs text-white/60">
                  Optional — leave blank for an always-on journey.
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">Campaign Status</h4>
                  <p className="text-sm text-white/70">
                    New campaigns launch in a paused state so you can double-check everything. Activate from the campaigns list when you are ready to start sending.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className={`glass-button flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed ${isFormValid ? 'glass-btn-orange' : ''}`}
              >
                {loading ? 'Saving...' : isEdit ? 'Update Campaign' : 'Create Campaign'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/campaigns')}
                className="glass-button justify-center sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CampaignForm;
