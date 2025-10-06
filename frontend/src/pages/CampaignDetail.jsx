import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import GlassBackdrop from '../components/GlassBackdrop';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCampaign = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCampaign(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  if (loading) {
    return (
      <div className="glass-page flex items-center justify-center">
        <GlassBackdrop />
        <div className="glass-card flex items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white/70"></div>
          <span className="text-white/80">Loading campaign...</span>
        </div>
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="glass-page flex items-center justify-center">
        <GlassBackdrop />
        <div className="glass-card text-center max-w-lg space-y-4">
          <div className="text-5xl">⚠️</div>
          <h3 className="text-2xl font-semibold text-white">Unable to load campaign</h3>
          <p className="text-sm text-white/70">{error}</p>
          <Link to="/campaigns" className="glass-button justify-center">
            Back to campaigns
          </Link>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  const stats = [
    { label: 'Emails sent', value: campaign.emailsSent },
    { label: 'Pending', value: campaign.emailsPending },
    { label: 'Failed', value: campaign.emailsFailed },
    { label: 'Open rate', value: `${campaign.openRate || 0}%` },
    { label: 'Click rate', value: `${campaign.clickRate || 0}%` },
  ];

  return (
    <div className="glass-page">
      <GlassBackdrop />

      <div className="glass-nav">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Link to="/campaigns" className="glass-button bg-white/10 hover:bg-white/20">
                  ← Back
                </Link>
                <span className="px-3 py-1 text-xs rounded-full bg-white/15 border border-white/20 text-white">
                  {campaign.status}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white">{campaign.name}</h1>
              {campaign.description && (
                <p className="text-sm text-white/70 max-w-2xl">{campaign.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link to={`/campaigns/${campaign.id}/edit`} className="glass-button">
                Edit campaign
              </Link>
              <button
                type="button"
                onClick={() => alert('Detailed analytics are coming soon!')}
                className="glass-button bg-white/10 hover:bg-white/20"
              >
                View stats
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {error && (
          <div className="glass-alert border border-red-500/40 text-red-100 bg-red-500/20">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card">
              <h3 className="text-sm uppercase tracking-widest text-white/60 mb-4">Overview</h3>
              <dl className="space-y-4 text-white/80">
                <div>
                  <dt className="text-xs uppercase tracking-widest text-white/60">Trigger type</dt>
                  <dd className="text-lg font-semibold text-white">
                    {campaign.triggers?.[0]?.type?.replace('_', ' ') || 'Not configured'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-widest text-white/60">Template</dt>
                  <dd className="text-lg font-semibold text-white">
                    {campaign.template?.name || 'Custom'}
                  </dd>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs uppercase tracking-widest text-white/60">Start date</dt>
                    <dd>{campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'Not set'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-widest text-white/60">End date</dt>
                    <dd>{campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Not set'}</dd>
                  </div>
                </div>
                {campaign.triggers?.[0]?.conditions && (
                  <div>
                    <dt className="text-xs uppercase tracking-widest text-white/60">Conditions</dt>
                    <dd>
                      <pre className="text-sm text-white/80 bg-black/20 rounded-xl p-4 border border-white/10 whitespace-pre-wrap">
                        {JSON.stringify(campaign.triggers[0].conditions, null, 2)}
                      </pre>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="glass-card">
              <h3 className="text-sm uppercase tracking-widest text-white/60 mb-4">Performance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-white/10 border border-white/15 p-4">
                    <p className="text-xs uppercase tracking-widest text-white/60">{stat.label}</p>
                    <p className="text-2xl font-semibold text-white mt-2">{stat.value ?? 0}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card space-y-4">
              <h3 className="text-xl font-semibold text-white">Next steps</h3>
              <ul className="space-y-2 text-sm text-white/70 list-disc list-inside">
                <li>Connect Shopify to enable real triggers.</li>
                <li>Add a follow-up email for high-intent users.</li>
                <li>Personalize content using AI suggestions.</li>
              </ul>
            </div>

            <div className="glass-card space-y-4">
              <h3 className="text-xl font-semibold text-white">Quick actions</h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
                  className="glass-button justify-center"
                >
                  Edit campaign
                </button>
                <button
                  onClick={() => navigate('/campaigns/new')}
                  className="glass-button justify-center bg-white/10 hover:bg-white/20"
                >
                  Duplicate campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
