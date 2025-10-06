import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../utils/api';

const MAX_ACTIVITY_ITEMS = 8;

const initialStats = {
  totalCampaigns: 0,
  activeCampaigns: 0,
  emailsSent: 0,
  emailsPending: 0,
  emailsFailed: 0,
  openRate: 0,
  clickRate: 0,
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(initialStats);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError('');

      try {
        const campaignResponse = await api.get('/campaigns');
        const campaigns = Array.isArray(campaignResponse.data?.data)
          ? campaignResponse.data.data
          : [];

        const aggregate = campaigns.reduce(
          (acc, campaign) => {
            const sent = campaign.emailsSent || 0;
            acc.totalCampaigns += 1;
            if (campaign.status === 'active') {
              acc.activeCampaigns += 1;
            }
            acc.emailsSent += sent;
            acc.emailsPending += campaign.emailsPending || 0;
            acc.emailsFailed += campaign.emailsFailed || 0;
            acc.openWeighted += (campaign.openRate || 0) * sent;
            acc.clickWeighted += (campaign.clickRate || 0) * sent;
            return acc;
          },
          {
            totalCampaigns: 0,
            activeCampaigns: 0,
            emailsSent: 0,
            emailsPending: 0,
            emailsFailed: 0,
            openWeighted: 0,
            clickWeighted: 0,
          }
        );

        const openRate = aggregate.emailsSent
          ? aggregate.openWeighted / aggregate.emailsSent
          : 0;
        const clickRate = aggregate.emailsSent
          ? aggregate.clickWeighted / aggregate.emailsSent
          : 0;

        setStats({
          totalCampaigns: aggregate.totalCampaigns,
          activeCampaigns: aggregate.activeCampaigns,
          emailsSent: aggregate.emailsSent,
          emailsPending: aggregate.emailsPending,
          emailsFailed: aggregate.emailsFailed,
          openRate,
          clickRate,
        });

        const activity = campaigns
          .flatMap((campaign) => {
            const events = [];

            if (campaign.createdAt) {
              events.push({
                id: `${campaign.id}-created`,
                icon: '🆕',
                title: campaign.name,
                campaignId: campaign.id,
                message: 'Campaign created',
                timestamp: campaign.createdAt,
              });
            }

            if (campaign.updatedAt && campaign.updatedAt !== campaign.createdAt) {
              events.push({
                id: `${campaign.id}-status`,
                icon: campaign.status === 'active' ? '✅' : campaign.status === 'paused' ? '⏸️' : '📁',
                title: campaign.name,
                campaignId: campaign.id,
                message: `Status: ${campaign.status}`,
                timestamp: campaign.updatedAt,
              });
            }

            const emailEvents = (campaign.emails || [])
              .map((email) => {
                if (email.clickedAt) {
                  return {
                    id: `${email.id}-clicked`,
                    icon: '🖱️',
                    title: campaign.name,
                    campaignId: campaign.id,
                    message: 'Email clicked',
                    timestamp: email.clickedAt,
                  };
                }

                if (email.openedAt) {
                  return {
                    id: `${email.id}-opened`,
                    icon: '👀',
                    title: campaign.name,
                    campaignId: campaign.id,
                    message: 'Email opened',
                    timestamp: email.openedAt,
                  };
                }

                if (email.status === 'sent') {
                  return {
                    id: `${email.id}-sent`,
                    icon: '📬',
                    title: campaign.name,
                    campaignId: campaign.id,
                    message: 'Email sent',
                    timestamp: email.sentAt || campaign.updatedAt || campaign.createdAt,
                  };
                }

                if (email.status === 'failed') {
                  return {
                    id: `${email.id}-failed`,
                    icon: '⚠️',
                    title: campaign.name,
                    campaignId: campaign.id,
                    message: 'Email failed to send',
                    timestamp: email.updatedAt || campaign.updatedAt || campaign.createdAt,
                  };
                }

                return null;
              })
              .filter(Boolean);

            return [...events, ...emailEvents];
          })
          .filter((event) => Boolean(event.timestamp))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, MAX_ACTIVITY_ITEMS);

        setRecentActivity(activity);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
        setError('We could not load your campaign stats right now.');
        setStats(initialStats);
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatNumber = (value) => value.toLocaleString();
  const formatPercent = (value) => `${value.toFixed(1)}%`;
  const formatDateTime = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    []
  );

  return (
    <Layout>
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-2">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}! 👋
        </h2>
        <p className="text-lg text-white/80">Let's create some warm, personalized onboarding emails.</p>
      </div>

      {error && (
        <div className="glass-alert border border-yellow-400/40 text-yellow-100 bg-yellow-500/20 mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card hover:scale-105 transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-orange-400 to-pink-500 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/70">Total Campaigns</p>
                  <p className="text-4xl font-bold text-white mt-1">
                    {loading ? '—' : formatNumber(stats.totalCampaigns)}
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    Active: {loading ? '—' : formatNumber(stats.activeCampaigns)}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card hover:scale-105 transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/70">Emails Sent</p>
                  <p className="text-4xl font-bold text-white mt-1">
                    {loading ? '—' : formatNumber(stats.emailsSent)}
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    Pending: {loading ? '—' : formatNumber(stats.emailsPending)} • Failed:{' '}
                    {loading ? '—' : formatNumber(stats.emailsFailed)}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card hover:scale-105 transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/70">Open Rate</p>
                  <p className="text-4xl font-bold text-white mt-1">
                    {loading ? '—' : formatPercent(stats.openRate)}
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    Click rate: {loading ? '—' : formatPercent(stats.clickRate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/templates" className="glass-card hover:scale-105 transition-transform group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">📧 Email Templates</h3>
                  <p className="text-white/70">Create and manage personalized email templates</p>
                </div>
                <svg
                  className="w-8 h-8 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link to="/campaigns" className="glass-card hover:scale-105 transition-transform group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">🚀 Campaigns</h3>
                  <p className="text-white/70">Set up automated email campaigns</p>
                </div>
                <svg
                  className="w-8 h-8 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>

          <div className="glass-card">
            <h3 className="text-2xl font-bold text-white mb-6">🎯 Getting Started</h3>
            <div className="space-y-4">
              <Link
                to="/integrations"
                className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-lg">Connect your Shopify store</h4>
                  <p className="text-sm text-white/70 mt-1">
                    Link your e-commerce store to start collecting customer data
                  </p>
                </div>
                <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-white text-lg">Create your first campaign</h4>
                  <p className="text-sm text-white/70 mt-1">
                    Set up behavioral triggers and email templates
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-white text-lg">Let AI personalize your emails</h4>
                  <p className="text-sm text-white/70 mt-1">
                    Watch your engagement rates soar with warm, human-feeling emails
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Link to="/templates/new" className="glass-button flex-1 justify-center">
                Create Template
              </Link>
              <Link to="/campaigns/new" className="glass-button flex-1 justify-center">
                Start Campaign
              </Link>
            </div>
          </div>
        </div>

        <aside className="glass-card h-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white">🗞️ Recent Activity</h3>
              <p className="text-sm text-white/70">Latest moments across your campaigns and emails</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white/70"></div>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
              Nothing to report just yet. Launch a campaign to see activity roll in.
            </div>
          ) : (
            <ul className="space-y-4 max-h-[32rem] overflow-y-auto pr-2">
              {recentActivity.map((event) => (
                <li
                  key={event.id}
                  className="flex items-start gap-4 rounded-2xl bg-white/5 border border-white/10 p-4"
                >
                  <span className="text-2xl" aria-hidden="true">
                    {event.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-white font-semibold">{event.title}</p>
                      <span className="text-xs uppercase tracking-wide text-white/60">
                        {formatDateTime.format(new Date(event.timestamp))}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mt-1">{event.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </Layout>
  );
};

export default Dashboard;
