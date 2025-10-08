import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import Alert from "../components/Alert";
import CelebrationOverlay from "../components/animations/CelebrationOverlay.jsx";
import EnvelopeAnimation from "../components/animations/EnvelopeAnimation.jsx";
import api from "../utils/api";

const CampaignForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goal: "welcome",
    storeId: "",
    blueprintId: "",
    triggerType: "user_signup",
    startDate: "",
    endDate: "",
  });
  const [stores, setStores] = useState([]);
  const [blueprints, setBlueprints] = useState([]);
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationContent, setCelebrationContent] = useState({ title: "", message: "" });
  const celebrationTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
    };
  }, []);

  const isFormValid = Boolean(formData.name.trim() && formData.goal && formData.triggerType);

  const goals = [
    {
      value: "welcome",
      label: "Welcome New Customers",
      icon: "👋",
      description: "Make a warm first impression",
    },
    {
      value: "re-engage",
      label: "Re-engage Inactive",
      icon: "💤",
      description: "Win back dormant customers",
    },
    {
      value: "upsell",
      label: "Upsell & Cross-sell",
      icon: "🚀",
      description: "Suggest complementary products",
    },
    {
      value: "milestone",
      label: "Celebrate Milestones",
      icon: "🎉",
      description: "Acknowledge customer achievements",
    },
    {
      value: "nurture",
      label: "Nurture Leads",
      icon: "🌱",
      description: "Build relationships over time",
    },
    {
      value: "feedback",
      label: "Request Feedback",
      icon: "💬",
      description: "Gather customer insights",
    },
  ];

  const triggerTypes = [
    {
      value: "user_signup",
      label: "User Signup",
      icon: "👋",
      description: "When a new user creates an account",
    },
    {
      value: "first_purchase",
      label: "First Purchase",
      icon: "🛍️",
      description: "After customer's first purchase",
    },
    {
      value: "abandoned_cart",
      label: "Abandoned Cart",
      icon: "🛒",
      description: "When cart is abandoned for 24h",
    },
    {
      value: "post_purchase",
      label: "Post Purchase",
      icon: "📦",
      description: "After a purchase is completed",
    },
    {
      value: "no_activity",
      label: "No Activity",
      icon: "💤",
      description: "After 30 days of inactivity",
    },
    {
      value: "high_value",
      label: "High Value Reached",
      icon: "⭐",
      description: "When customer reaches spending threshold",
    },
  ];

  const fetchStores = useCallback(async () => {
    try {
      const response = await api.get("/shopify/stores");
      setStores(response.data.data || []);
    } catch (err) {
      console.error("Failed to load stores:", err);
    }
  }, []);

  const fetchBlueprints = useCallback(async () => {
    try {
      const response = await api.get("/blueprints");
      setBlueprints(response.data.data || []);
    } catch (err) {
      console.error("Failed to load blueprints:", err);
    }
  }, []);

  const fetchCampaign = useCallback(async () => {
    try {
      setLoadingData(true);
      const response = await api.get(`/campaigns/${id}`);
      const campaign = response.data.data;
      setFormData({
        name: campaign.name,
        description: campaign.description || "",
        goal: campaign.goal || "welcome",
        storeId: campaign.store?.id || "",
        blueprintId: campaign.blueprint?.id || "",
        triggerType: campaign.triggers?.[0]?.type || "user_signup",
        startDate: campaign.startDate ? campaign.startDate.split("T")[0] : "",
        endDate: campaign.endDate ? campaign.endDate.split("T")[0] : "",
      });
      if (campaign.blueprint) {
        setSelectedBlueprint(campaign.blueprint);
      }
    } catch (err) {
      setError("Failed to load campaign");
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStores();
    fetchBlueprints();
  }, [fetchStores, fetchBlueprints]);

  useEffect(() => {
    if (isEdit) {
      fetchCampaign();
    } else {
      setLoadingData(false);
    }
  }, [isEdit, fetchCampaign]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Update selected blueprint when blueprintId changes
    if (name === "blueprintId") {
      const blueprint = blueprints.find((b) => b.id === value);
      setSelectedBlueprint(blueprint || null);
    }

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");
    setShowCelebration(false);
    setCelebrationContent({
      title: isEdit ? "Updating campaign... ✏️" : "Creating campaign... ✨",
      message: "Brewing personalized journeys for your customers.",
    });

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        goal: formData.goal,
        storeId: formData.storeId || null,
        blueprintId: formData.blueprintId || null,
        triggerType: formData.triggerType,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      if (isEdit) {
        await api.put(`/campaigns/${id}`, payload);
        setSuccess("Campaign updated successfully!");
        setCelebrationContent({
          title: "Campaign refreshed! 🔁",
          message: "Taking you back to your campaign list.",
        });
      } else {
        await api.post("/campaigns", payload);
        setSuccess("Campaign created successfully!");
        setCelebrationContent({
          title: "Campaign ready! 🎉",
          message: "Launching those warm welcomes now.",
        });
      }

      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
      setShowCelebration(true);
      celebrationTimeoutRef.current = setTimeout(() => {
        navigate("/campaigns");
      }, 1700);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} campaign`);
      console.error("Failed to save campaign", err);
      setShowCelebration(false);
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {isEdit ? "Edit Campaign" : "Create New Campaign"}
        </h1>
        <p className="text-lg text-white/80">
          {isEdit
            ? "Update your AI-powered email campaign"
            : "Set up triggers and let AI generate unique emails for each customer"}
        </p>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campaign Name */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-6">Campaign Details</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
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
                rows={3}
                placeholder="Brief description of this campaign's purpose..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Campaign Goal */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-2">Campaign Goal *</h2>
          <p className="text-sm text-white/70 mb-6">What's the purpose of this campaign?</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {goals.map((goal) => {
              const isSelected = formData.goal === goal.value;
              return (
                <label
                  key={goal.value}
                  className={`relative flex items-start gap-3 rounded-xl p-4 transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-white/20 border-orange-400 shadow-lg"
                      : "bg-white/5 border-white/20 hover:bg-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="goal"
                    value={goal.value}
                    checked={isSelected}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-2xl flex-shrink-0">{goal.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{goal.label}</p>
                    <p className="text-xs text-white/70 mt-1">{goal.description}</p>
                  </div>
                  {isSelected && (
                    <span className="absolute top-3 right-3 inline-flex items-center justify-center h-5 w-5 rounded-full bg-orange-400 text-white text-xs">
                      ✓
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Blueprint Selection */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-2">Email Blueprint (Optional)</h2>
          <p className="text-sm text-white/70 mb-4">
            Use a blueprint for consistent email structure and variables
          </p>

          <select
            id="blueprintId"
            name="blueprintId"
            value={formData.blueprintId}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          >
            <option value="">No blueprint (AI will generate freely)</option>
            {blueprints.map((blueprint) => (
              <option key={blueprint.id} value={blueprint.id}>
                {blueprint.name} {blueprint.category ? `(${blueprint.category})` : ""}
              </option>
            ))}
          </select>

          {selectedBlueprint && (
            <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg space-y-3">
              <div>
                <p className="text-xs text-white/60 mb-1">Subject Pattern:</p>
                <p className="text-sm text-white/90 font-mono">
                  {selectedBlueprint.subjectPattern}
                </p>
              </div>
              {selectedBlueprint.variables && selectedBlueprint.variables.length > 0 && (
                <div>
                  <p className="text-xs text-white/60 mb-2">Required Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBlueprint.variables.map((variable) => (
                      <span
                        key={`required-${variable}`}
                        className="px-2 py-1 text-xs rounded bg-orange-500/20 border border-orange-400/30 text-orange-100 font-mono"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedBlueprint.optionalVars && selectedBlueprint.optionalVars.length > 0 && (
                <div>
                  <p className="text-xs text-white/60 mb-2">Optional Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBlueprint.optionalVars.map((variable) => (
                      <span
                        key={`optional-${variable}`}
                        className="px-2 py-1 text-xs rounded bg-white/10 border border-white/20 text-white/70 font-mono"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-white/60 mt-2">
            Blueprints provide structure and consistency while still allowing AI personalization
          </p>
        </div>

        {/* Store Selection */}
        {stores.length > 0 && (
          <div className="glass-card">
            <h2 className="text-2xl font-bold text-white mb-2">Connected Store</h2>
            <p className="text-sm text-white/70 mb-4">Which store should this campaign use?</p>

            <select
              id="storeId"
              name="storeId"
              value={formData.storeId}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            >
              <option value="">All stores</option>
              {stores
                .filter((store) => store.isActive)
                .map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.shopDomain}
                  </option>
                ))}
            </select>
            <p className="text-xs text-white/60 mt-2">
              Leave as "All stores" to run this campaign across all connected stores
            </p>
          </div>
        )}

        {/* Trigger Type */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-2">Trigger Event *</h2>
          <p className="text-sm text-white/70 mb-6">When should this campaign send emails?</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {triggerTypes.map((trigger) => {
              const isSelected = formData.triggerType === trigger.value;
              return (
                <label
                  key={trigger.value}
                  className={`relative flex items-start gap-3 rounded-xl p-4 transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-white/20 border-orange-400 shadow-lg"
                      : "bg-white/5 border-white/20 hover:bg-white/10"
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
                  <div className="flex-1">
                    <p className="font-semibold text-white">{trigger.label}</p>
                    <p className="text-xs text-white/70 mt-1">{trigger.description}</p>
                  </div>
                  {isSelected && (
                    <span className="absolute top-3 right-3 inline-flex items-center justify-center h-5 w-5 rounded-full bg-orange-400 text-white text-xs">
                      ✓
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Date Range */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-6">Schedule (Optional)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-white/90 mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
              <p className="text-xs text-white/60 mt-2">
                When should the campaign begin? Leave blank to start immediately.
              </p>
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-white/90 mb-2">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
              <p className="text-xs text-white/60 mt-2">
                Optional — leave blank for an always-on campaign.
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
              <p className="text-sm text-white/70">
                Once activated, AI will generate unique, personalized emails for each recipient
                based on:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>Your brand voice settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>Customer purchase history and behavior</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>Campaign goal and trigger context</span>
                </li>
              </ul>
              <p className="text-sm text-white/70 mt-3">
                No two emails will be the same — each one is crafted specifically for the recipient.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="glass-button flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <EnvelopeAnimation size="sm" />
                <span className="font-medium">Saving magic...</span>
              </span>
            ) : isEdit ? (
              "Update Campaign"
            ) : (
              "Create Campaign"
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/campaigns")}
            className="glass-button justify-center"
          >
            Cancel
          </button>
        </div>
      </form>

      <CelebrationOverlay
        show={showCelebration}
        title={celebrationContent.title}
        message={celebrationContent.message}
      />
    </Layout>
  );
};

export default CampaignForm;
