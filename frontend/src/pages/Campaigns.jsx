import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  const statusFilters = [
    { value: 'all', label: 'All Campaigns', icon: '📊' },
    { value: 'active', label: 'Active', icon: '▶️' },
    { value: 'paused', label: 'Paused', icon: '⏸️' },
    { value: 'completed', label: 'Completed', icon: '✅' },
  ];

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter === 'all' ? {} : { status: filter };
      const response = await api.get('/campaigns', { params });

      setCampaigns(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load campaigns');
      console.error('Failed to load campaigns', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/campaigns/${id}/status`, { status: newStatus });
      fetchCampaigns();
    } catch (err) {
      setError('Failed to update campaign status');
      console.error('Failed to update campaign status', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      await api.delete(`/campaigns/${id}`);
      fetchCampaigns();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete campaign');
      console.error('Failed to delete campaign', err);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { text: 'text-emerald-50', bg: 'bg-emerald-500/30', border: 'border-emerald-300/40', label: 'Active' },
      paused: { text: 'text-yellow-50', bg: 'bg-yellow-500/30', border: 'border-yellow-300/40', label: 'Paused' },
      completed: { text: 'text-cyan-50', bg: 'bg-cyan-500/30', border: 'border-cyan-300/40', label: 'Completed' },
    };

    const styles = config[status] || config.paused;
    return (
      <span className={`px-3 py-1 text-xs rounded-full border ${styles.bg} ${styles.text} ${styles.border}`}>
        {styles.label}
      </span>
    );
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Campaigns</h1>
          <p className="mt-1 text-sm text-white/80">
            Automate warm touchpoints across the entire customer journey
          </p>
        </div>
        <Link
          to="/campaigns/new"
          className="glass-button"
        >
          <span className="text-xl">+</span>
          New Campaign
        </Link>
      </div>

      {/* Main Content */}
      <div>
        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {statusFilters.map((statusFilter) => (
            <button
              key={statusFilter.value}
              onClick={() => setFilter(statusFilter.value)}
              className={`glass-button px-4 py-2 ${
                filter === statusFilter.value
                  ? 'bg-white/25 border border-white/40'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <span className="mr-2">{statusFilter.icon}</span>
              {statusFilter.label}
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
        ) : campaigns.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 glass-card">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-white mb-2">No campaigns yet</h3>
            <p className="text-white/70 mb-4">
              {filter === 'all'
                ? 'Set up your first journey to greet customers the moment they need it.'
                : `No ${filter} campaigns right now.`}
            </p>
            <Link to="/campaigns/new" className="glass-button inline-flex">
              Create Campaign
            </Link>
          </div>
        ) : (
          /* Campaigns List */
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="glass-card hover:translate-y-[-4px] transition-transform"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        to={`/campaigns/${campaign.id}`}
                        className="text-2xl font-semibold text-white hover:text-white/90 transition-colors"
                      >
                        {campaign.name}
                      </Link>
                      {getStatusBadge(campaign.status)}
                    </div>

                    {campaign.description && (
                      <p className="text-sm text-white/70 max-w-3xl">{campaign.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-5 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <span>📨</span>
                        <span>{campaign.emailsSent || 0} sent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⏳</span>
                        <span>{campaign.emailsPending || 0} pending</span>
                      </div>
                      {campaign.emailsFailed > 0 && (
                        <div className="flex items-center gap-2 text-red-200">
                          <span>⚠️</span>
                          <span>{campaign.emailsFailed} failed</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span>🗓️</span>
                        <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {campaign.status === 'paused' && (
                      <button
                        onClick={() => handleStatusChange(campaign.id, 'active')}
                        className="glass-button bg-emerald-500/30 hover:bg-emerald-500/40"
                        title="Activate campaign"
                      >
                        ▶️
                      </button>
                    )}
                    {campaign.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(campaign.id, 'paused')}
                        className="glass-button bg-yellow-500/30 hover:bg-yellow-500/40"
                        title="Pause campaign"
                      >
                        ⏸️
                      </button>
                    )}
                    <Link
                      to={`/campaigns/${campaign.id}`}
                      className="glass-button"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(campaign.id)}
                      className="glass-button bg-red-500/30 hover:bg-red-500/40"
                      title="Delete campaign"
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

export default Campaigns;
