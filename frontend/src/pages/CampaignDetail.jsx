import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import Alert from "../components/Alert";
import api, { emailAPI } from "../utils/api";

const CampaignDetail = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [customerInput, setCustomerInput] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [testRecipient, setTestRecipient] = useState("");

  const goals = {
    welcome: {
      label: "Welcome New Customers",
      icon: "👋",
      description: "Make a warm first impression",
    },
    "re-engage": {
      label: "Re-engage Inactive",
      icon: "💤",
      description: "Win back dormant customers",
    },
    upsell: {
      label: "Upsell & Cross-sell",
      icon: "🚀",
      description: "Suggest complementary products",
    },
    milestone: {
      label: "Celebrate Milestones",
      icon: "🎉",
      description: "Acknowledge customer achievements",
    },
    nurture: { label: "Nurture Leads", icon: "🌱", description: "Build relationships over time" },
    feedback: { label: "Request Feedback", icon: "💬", description: "Gather customer insights" },
  };

  const triggerTypes = {
    user_signup: {
      label: "User Signup",
      icon: "👋",
      description: "When a new user creates an account",
    },
    first_purchase: {
      label: "First Purchase",
      icon: "🛍️",
      description: "After customer's first purchase",
    },
    abandoned_cart: {
      label: "Abandoned Cart",
      icon: "🛒",
      description: "When cart is abandoned for 24h",
    },
    post_purchase: {
      label: "Post Purchase",
      icon: "📦",
      description: "After a purchase is completed",
    },
    no_activity: { label: "No Activity", icon: "💤", description: "After 30 days of inactivity" },
    high_value: {
      label: "High Value Reached",
      icon: "⭐",
      description: "When customer reaches spending threshold",
    },
  };

  const [statusLoading, setStatusLoading] = useState(false);

  const fetchCampaign = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/campaigns/${id}`);
      setCampaign(response.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load campaign");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusLoading(true);
      setError("");
      await api.patch(`/campaigns/${id}/status`, { status: newStatus });
      setSuccess(
        `Campaign ${newStatus === "active" ? "activated" : newStatus === "paused" ? "paused" : "completed"} successfully!`,
      );
      await fetchCampaign();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update campaign status");
    } finally {
      setStatusLoading(false);
    }
  };

  const sanitizedCustomer = () => {
    const entries = Object.entries(customerInput)
      .map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])
      .filter(([, value]) => Boolean(value));
    return entries.length ? Object.fromEntries(entries) : undefined;
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    setPreviewError("");
    setPreview(null);

    try {
      const response = await emailAPI.preview({ campaignId: id, customer: sanitizedCustomer() });
      setPreview(response.data.data);
    } catch (err) {
      setPreviewError(err.response?.data?.message || "Failed to generate preview");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!testRecipient.trim()) {
      setPreviewError("Add a recipient email before sending a test message.");
      return;
    }

    setSendLoading(true);
    setPreviewError("");

    try {
      await emailAPI.sendTest({
        campaignId: id,
        to: testRecipient.trim(),
        customer: sanitizedCustomer(),
      });
      setSuccess("Test email sent. Check your inbox!");
    } catch (err) {
      setPreviewError(err.response?.data?.message || "Failed to send test email");
    } finally {
      setSendLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      </Layout>
    );
  }

  if (error && !campaign) {
    return (
      <Layout>
        <div className="glass-card text-center py-16 max-w-lg mx-auto">
          <div className="text-6xl mb-6">⚠️</div>
          <h3 className="text-2xl font-bold text-white mb-4">Unable to load campaign</h3>
          <p className="text-white/70 mb-6">{error}</p>
          <Link to="/campaigns" className="glass-button inline-flex">
            Back to campaigns
          </Link>
        </div>
      </Layout>
    );
  }

  if (!campaign) {
    return null;
  }

  const goalInfo = campaign.goal ? goals[campaign.goal] : null;
  const triggerInfo = campaign.triggers?.[0]?.type ? triggerTypes[campaign.triggers[0].type] : null;

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 border-green-500/40 text-green-100";
      case "paused":
        return "bg-yellow-500/20 border-yellow-500/40 text-yellow-100";
      case "completed":
        return "bg-blue-500/20 border-blue-500/40 text-blue-100";
      default:
        return "bg-white/15 border-white/20 text-white/80";
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/campaigns" className="glass-button">
            ← Back
          </Link>
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(campaign.status)}`}
          >
            {campaign.status}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">{campaign.name}</h1>
        {campaign.description && <p className="text-lg text-white/80">{campaign.description}</p>}
      </div>

      {success && (
        <div className="mb-6">
          <Alert type="success" message={success} onClose={() => setSuccess("")} duration={3000} />
        </div>
      )}

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError("")} duration={5000} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Configuration */}
          <div className="glass-card">
            <h2 className="text-2xl font-bold text-white mb-6">Campaign Configuration</h2>

            <div className="space-y-6">
              {/* Goal */}
              {goalInfo && (
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-3">Campaign Goal</h3>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/20">
                    <span className="text-3xl">{goalInfo.icon}</span>
                    <div>
                      <p className="font-semibold text-white text-lg">{goalInfo.label}</p>
                      <p className="text-sm text-white/70 mt-1">{goalInfo.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Trigger */}
              {triggerInfo && (
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-3">Trigger Event</h3>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/20">
                    <span className="text-3xl">{triggerInfo.icon}</span>
                    <div>
                      <p className="font-semibold text-white text-lg">{triggerInfo.label}</p>
                      <p className="text-sm text-white/70 mt-1">{triggerInfo.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Store */}
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-3">Connected Store</h3>
                <div className="p-4 rounded-xl bg-white/5 border border-white/20">
                  <p className="text-white">
                    {campaign.store ? campaign.store.shopDomain : "All stores"}
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    {campaign.store
                      ? "Campaign is limited to this specific store"
                      : "Campaign runs across all connected stores"}
                  </p>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-3">Schedule</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/20">
                    <p className="text-xs text-white/60 mb-1">Start Date</p>
                    <p className="text-white font-medium">
                      {campaign.startDate
                        ? new Date(campaign.startDate).toLocaleDateString()
                        : "Immediate"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/20">
                    <p className="text-xs text-white/60 mb-1">End Date</p>
                    <p className="text-white font-medium">
                      {campaign.endDate
                        ? new Date(campaign.endDate).toLocaleDateString()
                        : "Always-on"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="glass-card">
            <h2 className="text-2xl font-bold text-white mb-6">Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                <p className="text-xs font-medium text-white/60 uppercase tracking-wide">
                  Emails Sent
                </p>
                <p className="text-3xl font-bold text-white mt-2">{campaign.emailsSent || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                <p className="text-xs font-medium text-white/60 uppercase tracking-wide">Pending</p>
                <p className="text-3xl font-bold text-white mt-2">{campaign.emailsPending || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30">
                <p className="text-xs font-medium text-white/60 uppercase tracking-wide">Failed</p>
                <p className="text-3xl font-bold text-white mt-2">{campaign.emailsFailed || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                <p className="text-xs font-medium text-white/60 uppercase tracking-wide">
                  Open Rate
                </p>
                <p className="text-3xl font-bold text-white mt-2">{campaign.openRate || 0}%</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <p className="text-xs font-medium text-white/60 uppercase tracking-wide">
                  Click Rate
                </p>
                <p className="text-3xl font-bold text-white mt-2">{campaign.clickRate || 0}%</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-400/20 to-pink-500/20 border border-orange-500/30">
                <p className="text-xs font-medium text-white/60 uppercase tracking-wide">Total</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {(campaign.emailsSent || 0) +
                    (campaign.emailsPending || 0) +
                    (campaign.emailsFailed || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* AI Info */}
          <div className="glass-card border-2 border-orange-400/30">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🤖</span>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">AI-Powered Personalization</h3>
                <p className="text-sm text-white/70 mb-3">
                  This campaign uses AI to generate unique, personalized emails for each recipient.
                  No two customers receive the same message.
                </p>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">•</span>
                    <span>Emails are generated based on your brand voice settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">•</span>
                    <span>Each message considers the customer's purchase history and behavior</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">•</span>
                    <span>Content adapts to the campaign goal and trigger context</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card">
            <h3 className="text-xl font-bold text-white mb-4">🔍 Preview & Test Email</h3>
            <p className="text-sm text-white/70 mb-4">
              Generate an AI draft for a sample customer and send yourself a preview email.
            </p>

            {previewError && (
              <div className="glass-alert border border-red-500/40 text-red-100 bg-red-500/10 mb-4">
                {previewError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white/80 mb-2">Sample customer</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={customerInput.firstName}
                    onChange={(e) => setCustomerInput({ ...customerInput, firstName: e.target.value })}
                    placeholder="First name"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={customerInput.lastName}
                    onChange={(e) => setCustomerInput({ ...customerInput, lastName: e.target.value })}
                    placeholder="Last name"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                  <input
                    type="email"
                    value={customerInput.email}
                    onChange={(e) => setCustomerInput({ ...customerInput, email: e.target.value })}
                    placeholder="Customer email (optional)"
                    className="sm:col-span-2 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handlePreview}
                    className="glass-button"
                    disabled={previewLoading}
                  >
                    {previewLoading ? "Generating..." : "Generate preview"}
                  </button>
                  <input
                    type="email"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder="Send test to"
                    className="flex-1 min-w-[200px] px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleSendTest}
                    className="glass-button"
                    disabled={sendLoading || !testRecipient}
                  >
                    {sendLoading ? "Sending..." : "Send test"}
                  </button>
                </div>
                <p className="text-xs text-white/50">
                  Tests use your current brand voice, blueprint, and campaign goal. Update those settings for different variations.
                </p>
              </div>

              {preview && (
                <div className="bg-white/5 border border-white/15 rounded-xl p-4 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-white/60 uppercase">Subject</p>
                    <p className="text-white text-lg font-semibold mt-1">{preview.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/60 uppercase mb-2">Email body</p>
                    <div className="bg-black/20 border border-white/10 rounded-lg p-4 text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
                      {preview.text || preview.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Management */}
          <div className="glass-card">
            <h3 className="text-xl font-bold text-white mb-4">Campaign Status</h3>
            <div className="flex flex-col gap-3">
              {campaign.status === "draft" && (
                <button
                  type="button"
                  onClick={() => handleStatusChange("active")}
                  disabled={statusLoading}
                  className="glass-button justify-center bg-green-500/20 border-green-500/40 hover:bg-green-500/30 disabled:opacity-50"
                >
                  {statusLoading ? "Activating..." : "✅ Activate Campaign"}
                </button>
              )}

              {campaign.status === "active" && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStatusChange("paused")}
                    disabled={statusLoading}
                    className="glass-button justify-center bg-yellow-500/20 border-yellow-500/40 hover:bg-yellow-500/30 disabled:opacity-50"
                  >
                    {statusLoading ? "Pausing..." : "⏸️ Pause Campaign"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange("completed")}
                    disabled={statusLoading}
                    className="glass-button justify-center bg-blue-500/20 border-blue-500/40 hover:bg-blue-500/30 disabled:opacity-50"
                  >
                    {statusLoading ? "Completing..." : "✓ Mark Complete"}
                  </button>
                </>
              )}

              {campaign.status === "paused" && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStatusChange("active")}
                    disabled={statusLoading}
                    className="glass-button justify-center bg-green-500/20 border-green-500/40 hover:bg-green-500/30 disabled:opacity-50"
                  >
                    {statusLoading ? "Resuming..." : "▶️ Resume Campaign"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange("completed")}
                    disabled={statusLoading}
                    className="glass-button justify-center bg-blue-500/20 border-blue-500/40 hover:bg-blue-500/30 disabled:opacity-50"
                  >
                    {statusLoading ? "Completing..." : "✓ Mark Complete"}
                  </button>
                </>
              )}

              {campaign.status === "completed" && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
                  <p className="text-sm text-white/70">This campaign is complete</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Link to={`/campaigns/${campaign.id}/edit`} className="glass-button justify-center">
                Edit Campaign
              </Link>
              <Link to="/brand-voice" className="glass-button justify-center">
                Update Brand Voice
              </Link>
              <Link to="/campaigns/new" className="glass-button justify-center">
                Create New Campaign
              </Link>
            </div>
          </div>

          {/* Next Steps */}
          <div className="glass-card">
            <h3 className="text-xl font-bold text-white mb-4">💡 Next Steps</h3>
            <ul className="space-y-3 text-sm text-white/70">
              {campaign.status === "draft" && (
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>Activate this campaign to start sending AI-generated emails</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                <span>Review your brand voice settings to ensure AI matches your tone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                <span>Check customer insights for additional outreach opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                <span>Monitor performance metrics to optimize your campaigns</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CampaignDetail;
