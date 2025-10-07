import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Alert from '../components/Alert';
import api from '../utils/api';

const Blueprints = () => {
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = {
    welcome: { icon: '👋', label: 'Welcome' },
    're-engage': { icon: '💤', label: 'Re-engage' },
    upsell: { icon: '🚀', label: 'Upsell' },
    milestone: { icon: '🎉', label: 'Milestone' },
    nurture: { icon: '🌱', label: 'Nurture' },
    feedback: { icon: '💬', label: 'Feedback' },
  };

  const fetchBlueprints = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/blueprints');
      setBlueprints(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load blueprints');
      console.error('Failed to load blueprints', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlueprints();
  }, [fetchBlueprints]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this blueprint?')) return;

    try {
      await api.delete(`/blueprints/${id}`);
      setSuccess('Blueprint deleted successfully');
      fetchBlueprints();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete blueprint');
      console.error('Failed to delete blueprint', err);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Email Blueprints</h1>
          <p className="mt-1 text-sm text-white/80">
            Reusable email templates with customizable variables and structure
          </p>
        </div>
        <Link to="/blueprints/new" className="glass-button">
          <span className="text-xl">+</span>
          Create Blueprint
        </Link>
      </div>

      {/* Alerts */}
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

      {/* Main Content */}
      <div>
        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : blueprints.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 glass-card">
            <div className="text-6xl mb-4">📧</div>
            <h3 className="text-xl font-semibold text-white mb-2">No blueprints yet</h3>
            <p className="text-white/70 mb-4">
              Create reusable email templates with variables and structure patterns.
            </p>
            <Link to="/blueprints/new" className="glass-button inline-flex">
              Create Blueprint
            </Link>
          </div>
        ) : (
          /* Blueprints Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {blueprints.map((blueprint) => (
              <div
                key={blueprint.id}
                className="glass-card hover:translate-y-[-4px] transition-transform"
              >
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {blueprint.name}
                      </h3>
                      {blueprint.description && (
                        <p className="text-sm text-white/70">{blueprint.description}</p>
                      )}
                    </div>
                    {blueprint.category && categories[blueprint.category] && (
                      <span className="ml-3 flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-white/10 border border-white/20 text-white/90">
                        <span>{categories[blueprint.category].icon}</span>
                        <span>{categories[blueprint.category].label}</span>
                      </span>
                    )}
                  </div>

                  {/* Subject Pattern */}
                  <div className="mb-4">
                    <p className="text-xs text-white/60 mb-1">Subject Pattern:</p>
                    <p className="text-sm text-white/90 font-mono bg-white/5 px-3 py-2 rounded border border-white/10">
                      {blueprint.subjectPattern}
                    </p>
                  </div>

                  {/* Variables */}
                  <div className="mb-4">
                    <p className="text-xs text-white/60 mb-2">Variables:</p>
                    <div className="flex flex-wrap gap-2">
                      {blueprint.variables && blueprint.variables.length > 0 ? (
                        blueprint.variables.map((variable, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs rounded bg-orange-500/20 border border-orange-400/30 text-orange-100 font-mono"
                          >
                            {variable}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-white/40">No variables</span>
                      )}
                    </div>
                    {blueprint.optionalVars && blueprint.optionalVars.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {blueprint.optionalVars.map((variable, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs rounded bg-white/10 border border-white/20 text-white/70 font-mono"
                          >
                            {variable} (optional)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-4 border-t border-white/10">
                    <Link
                      to={`/blueprints/${blueprint.id}/edit`}
                      className="glass-button flex-1 justify-center"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(blueprint.id)}
                      className="glass-button bg-red-500/30 hover:bg-red-500/40"
                      title="Delete blueprint"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Blueprints;
