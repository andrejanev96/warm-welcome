import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Alert from '../components/Alert';
import api from '../utils/api';

const BlueprintForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'welcome',
    subjectPattern: '',
    structure: '',
    variables: [],
    optionalVars: [],
    example: '',
  });
  const [newVariable, setNewVariable] = useState('');
  const [newOptionalVar, setNewOptionalVar] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    { value: 'welcome', label: 'Welcome New Customers', icon: '👋' },
    { value: 're-engage', label: 'Re-engage Inactive', icon: '💤' },
    { value: 'upsell', label: 'Upsell & Cross-sell', icon: '🚀' },
    { value: 'milestone', label: 'Celebrate Milestones', icon: '🎉' },
    { value: 'nurture', label: 'Nurture Leads', icon: '🌱' },
    { value: 'feedback', label: 'Request Feedback', icon: '💬' },
  ];

  const fetchBlueprint = useCallback(async () => {
    try {
      setLoadingData(true);
      const response = await api.get(`/blueprints/${id}`);
      const blueprint = response.data.data;
      setFormData({
        name: blueprint.name || '',
        description: blueprint.description || '',
        category: blueprint.category || 'welcome',
        subjectPattern: blueprint.subjectPattern || '',
        structure: typeof blueprint.structure === 'object' ? JSON.stringify(blueprint.structure, null, 2) : blueprint.structure || '',
        variables: blueprint.variables || [],
        optionalVars: blueprint.optionalVars || [],
        example: blueprint.example || '',
      });
    } catch (err) {
      setError('Failed to load blueprint');
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEdit) {
      fetchBlueprint();
    } else {
      setLoadingData(false);
    }
  }, [isEdit, fetchBlueprint]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleAddVariable = () => {
    if (newVariable.trim() && !formData.variables.includes(newVariable.trim())) {
      setFormData({ ...formData, variables: [...formData.variables, newVariable.trim()] });
      setNewVariable('');
    }
  };

  const handleRemoveVariable = (index) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter((_, i) => i !== index)
    });
  };

  const handleAddOptionalVar = () => {
    if (newOptionalVar.trim() && !formData.optionalVars.includes(newOptionalVar.trim())) {
      setFormData({ ...formData, optionalVars: [...formData.optionalVars, newOptionalVar.trim()] });
      setNewOptionalVar('');
    }
  };

  const handleRemoveOptionalVar = (index) => {
    setFormData({
      ...formData,
      optionalVars: formData.optionalVars.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Parse structure to validate JSON
      let parsedStructure;
      try {
        parsedStructure = JSON.parse(formData.structure);
      } catch (err) {
        setError('Invalid JSON in structure field');
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category || null,
        subjectPattern: formData.subjectPattern.trim(),
        structure: parsedStructure,
        variables: formData.variables,
        optionalVars: formData.optionalVars.length > 0 ? formData.optionalVars : null,
        example: formData.example.trim() || null,
      };

      if (isEdit) {
        await api.put(`/blueprints/${id}`, payload);
        setSuccess('Blueprint updated successfully!');
      } else {
        await api.post('/blueprints', payload);
        setSuccess('Blueprint created successfully!');
      }

      setTimeout(() => navigate('/blueprints'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} blueprint`);
      console.error('Failed to save blueprint', err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {isEdit ? 'Edit Blueprint' : 'Create New Blueprint'}
        </h1>
        <p className="text-lg text-white/80">
          {isEdit
            ? 'Update your email blueprint template'
            : 'Define a reusable email structure with variables'}
        </p>
      </div>

      {success && (
        <div className="mb-6">
          <Alert type="success" message={success} onClose={() => setSuccess('')} duration={3000} />
        </div>
      )}

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError('')} duration={5000} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
                Blueprint Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Welcome Series Template"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white/90 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                placeholder="Brief description of this blueprint..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-white/90 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Subject Pattern */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-2">Subject Pattern *</h2>
          <p className="text-sm text-white/70 mb-4">
            Use variables in curly braces, e.g., Welcome {'{'}customerName{'}'} to {'{'}storeName{'}'}
          </p>

          <input
            type="text"
            id="subjectPattern"
            name="subjectPattern"
            value={formData.subjectPattern}
            onChange={handleChange}
            required
            placeholder="e.g., Welcome {customerName} to {storeName}"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent font-mono"
          />
        </div>

        {/* Variables */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-2">Required Variables *</h2>
          <p className="text-sm text-white/70 mb-4">
            Variables that must be provided when using this blueprint
          </p>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newVariable}
                onChange={(e) => setNewVariable(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVariable())}
                placeholder="e.g., customerName"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent font-mono"
              />
              <button
                type="button"
                onClick={handleAddVariable}
                className="glass-button"
              >
                Add
              </button>
            </div>

            {formData.variables.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.variables.map((variable, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded bg-orange-500/20 border border-orange-400/30 text-orange-100 font-mono"
                  >
                    {variable}
                    <button
                      type="button"
                      onClick={() => handleRemoveVariable(idx)}
                      className="text-orange-100 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Optional Variables */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-2">Optional Variables</h2>
          <p className="text-sm text-white/70 mb-4">
            Variables that can be provided but are not required
          </p>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newOptionalVar}
                onChange={(e) => setNewOptionalVar(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOptionalVar())}
                placeholder="e.g., discountCode"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent font-mono"
              />
              <button
                type="button"
                onClick={handleAddOptionalVar}
                className="glass-button"
              >
                Add
              </button>
            </div>

            {formData.optionalVars.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.optionalVars.map((variable, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded bg-white/10 border border-white/20 text-white/90 font-mono"
                  >
                    {variable}
                    <button
                      type="button"
                      onClick={() => handleRemoveOptionalVar(idx)}
                      className="text-white/70 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Structure */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-2">Email Structure (JSON) *</h2>
          <p className="text-sm text-white/70 mb-4">
            Define the email structure as JSON. Use variables in format {'{'}variableName{'}'}
          </p>

          <textarea
            id="structure"
            name="structure"
            value={formData.structure}
            onChange={handleChange}
            required
            rows={10}
            placeholder={`{
  "greeting": "Hi {customerName},",
  "body": "Welcome to {storeName}!",
  "closing": "Best regards,\\nThe Team"
}`}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent font-mono text-sm"
          />
        </div>

        {/* Example */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-2">Example Output</h2>
          <p className="text-sm text-white/70 mb-4">
            Optional example showing how this blueprint might look with real data
          </p>

          <textarea
            id="example"
            name="example"
            value={formData.example}
            onChange={handleChange}
            rows={5}
            placeholder="Example email content with variables filled in..."
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !formData.name.trim() || !formData.subjectPattern.trim() || !formData.structure.trim() || formData.variables.length === 0}
            className="glass-button flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Blueprint' : 'Create Blueprint'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/blueprints')}
            className="glass-button justify-center"
          >
            Cancel
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default BlueprintForm;
