import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import Alert from "../components/Alert";
import api from "../utils/api";
import { useOnboardingProgress } from "../context/OnboardingContext.jsx";

const toneOptions = [
  { value: "warm", label: "Warm & Friendly" },
  { value: "professional", label: "Professional" },
  { value: "playful", label: "Playful" },
  { value: "casual", label: "Casual" },
  { value: "luxury", label: "Luxury" },
];

const goalOptions = [
  { value: "welcome", label: "Welcome New Customers" },
  { value: "re-engage", label: "Re-engage Inactive" },
  { value: "upsell", label: "Upsell & Cross-sell" },
  { value: "milestone", label: "Celebrate Milestones" },
  { value: "nurture", label: "Nurture Leads" },
  { value: "feedback", label: "Request Feedback" },
];

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { progress, refresh, loading: onboardingLoading } = useOnboardingProgress();

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const handledShopCallbackRef = useRef(false);

  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [brandVoiceData, setBrandVoiceData] = useState(null);
  const [brandVoiceLoading, setBrandVoiceLoading] = useState(false);
  const [blueprints, setBlueprints] = useState([]);
  const [blueprintsLoading, setBlueprintsLoading] = useState(false);

  const [globalError, setGlobalError] = useState("");
  const [globalSuccess, setGlobalSuccess] = useState("");

  const fetchStores = useCallback(async () => {
    try {
      setStoresLoading(true);
      const response = await api.get("/shopify/stores");
      setStores(response.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch stores", err);
    } finally {
      setStoresLoading(false);
    }
  }, []);

  const fetchBrandVoice = useCallback(async () => {
    try {
      setBrandVoiceLoading(true);
      const response = await api.get("/brand-voice");
      setBrandVoiceData(response.data?.data || null);
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Failed to fetch brand voice", err);
      }
    } finally {
      setBrandVoiceLoading(false);
    }
  }, []);

  const fetchBlueprints = useCallback(async () => {
    try {
      setBlueprintsLoading(true);
      const response = await api.get("/blueprints");
      setBlueprints(response.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch blueprints", err);
    } finally {
      setBlueprintsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
    fetchBrandVoice();
    fetchBlueprints();
  }, [fetchStores, fetchBrandVoice, fetchBlueprints]);

  useEffect(() => {
    const shop = searchParams.get("shop");
    if (shop && !handledShopCallbackRef.current) {
      handledShopCallbackRef.current = true;
      setGlobalSuccess(`Successfully connected ${shop}!`);
      refresh();
      fetchStores();
    }
  }, [searchParams, refresh, fetchStores]);

  useEffect(() => {
    if (!onboardingLoading && progress) {
      const firstIncomplete = progress.steps.findIndex((step) => !step.completed);
      if (firstIncomplete === -1) {
        setActiveStepIndex(progress.steps.length - 1);
      } else {
        setActiveStepIndex(firstIncomplete);
      }
    }
  }, [progress, onboardingLoading]);

  const steps = useMemo(
    () => [
      { id: "connect_store", title: "Connect your Shopify store" },
      { id: "setup_brand_voice", title: "Define your brand voice" },
      { id: "create_blueprint", title: "Create your first blueprint" },
      { id: "launch_campaign", title: "Launch your first campaign" },
    ],
    [],
  );

  const goToNextStep = () => {
    setGlobalError("");
    refresh();
    setActiveStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleSkip = () => {
    setGlobalError("");
    setActiveStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const activeStepId = steps[activeStepIndex]?.id;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🚀 Guided Onboarding</h1>
          <p className="text-white/80">
            Follow the guided setup to connect your store, teach WarmWelcome your voice, and launch your
            first automated campaign.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {steps.map((step, index) => {
              const isActive = index === activeStepIndex;
              const isCompleted = progress?.steps?.[index]?.completed;
              return (
                <button
                  type="button"
                  key={step.id}
                  onClick={() => setActiveStepIndex(index)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    isActive
                      ? "bg-white/20 border-orange-400 text-white shadow-lg"
                      : isCompleted
                        ? "bg-green-500/20 border-green-400/40 text-white"
                        : "bg-white/5 border-white/15 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 font-semibold">
                    {isCompleted ? "✓" : index + 1}
                  </span>
                  <span className="text-left text-sm md:text-base font-medium">{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {globalSuccess && (
          <div className="mb-6">
            <Alert type="success" message={globalSuccess} onClose={() => setGlobalSuccess("")} duration={4000} />
          </div>
        )}

        {globalError && (
          <div className="mb-6">
            <Alert type="error" message={globalError} onClose={() => setGlobalError("")} duration={5000} />
          </div>
        )}

        <div className="glass-card">
          {activeStepId === "connect_store" && (
            <StepConnectStore
              stores={stores}
              loading={storesLoading}
              onSuccess={goToNextStep}
              onSkip={handleSkip}
              setGlobalError={setGlobalError}
            />
          )}

          {activeStepId === "setup_brand_voice" && (
            <StepBrandVoice
              initialData={brandVoiceData}
              loading={brandVoiceLoading}
              onRefresh={fetchBrandVoice}
              onSuccess={goToNextStep}
              onSkip={handleSkip}
              setGlobalError={setGlobalError}
            />
          )}

          {activeStepId === "create_blueprint" && (
            <StepBlueprint
              blueprints={blueprints}
              loading={blueprintsLoading}
              onRefresh={fetchBlueprints}
              onSuccess={goToNextStep}
              onSkip={handleSkip}
              setGlobalError={setGlobalError}
            />
          )}

          {activeStepId === "launch_campaign" && (
            <StepCampaign
              stores={stores}
              blueprints={blueprints}
              loadingStores={storesLoading}
              loadingBlueprints={blueprintsLoading}
              onSuccess={() => {
                refresh();
                setGlobalSuccess("🎉 Onboarding complete! You're ready to go.");
                setTimeout(() => navigate("/dashboard"), 2000);
              }}
              onSkip={() => navigate("/dashboard")}
              setGlobalError={setGlobalError}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

const StepConnectStore = ({ stores, loading, onSuccess, onSkip, setGlobalError }) => {
  const [shopDomain, setShopDomain] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasActiveStore = stores.some((store) => store.isActive);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!shopDomain.trim()) {
      setGlobalError("Enter your Shopify store domain to continue.");
      return;
    }

    setGlobalError("");
    setSubmitting(true);

    try {
      const cleanDomain = shopDomain.replace(/\.myshopify\.com$/i, "");
      const response = await api.post("/shopify/install", { shop: cleanDomain });
      const installUrl = response.data?.data?.installUrl;

      if (installUrl) {
        window.location.href = installUrl;
      } else {
        onSuccess();
      }
    } catch (err) {
      setGlobalError(err.response?.data?.message || "Failed to initiate Shopify installation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Step 1: Connect Shopify</h2>
        <p className="text-white/70 max-w-2xl">
          WarmWelcome syncs customer and order data directly from Shopify. Connect your store to enable
          personalized onboarding journeys and real-time segments.
        </p>
      </div>

      {hasActiveStore ? (
        <div className="bg-green-500/10 border border-green-500/30 text-green-100 px-4 py-3 rounded-lg">
          ✅ Store connected! You can move to the next step.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="shopDomain" className="block text-sm font-medium text-white/80 mb-2">
              Shopify store domain
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center rounded-lg bg-white/10 border border-white/20 overflow-hidden">
                <input
                  id="shopDomain"
                  type="text"
                  placeholder="your-store"
                  value={shopDomain}
                  onChange={(e) => setShopDomain(e.target.value)}
                  className="flex-1 px-4 py-3 bg-transparent text-white focus:outline-none"
                />
                <span className="px-3 py-3 text-white/70 border-l border-white/10">.myshopify.com</span>
              </div>
              <button
                type="submit"
                className="glass-button px-6"
                disabled={submitting}
              >
                {submitting ? "Opening Shopify..." : "Connect store"}
              </button>
            </div>
            <p className="text-xs text-white/50 mt-2">
              We'll redirect you to Shopify to approve permissions.
            </p>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="glass-button"
          onClick={onSuccess}
          disabled={!hasActiveStore}
        >
          Continue
        </button>
        <button type="button" className="glass-button bg-white/5" onClick={onSkip}>
          Skip for now
        </button>
        {loading && <span className="text-white/60 text-sm">Checking store status...</span>}
      </div>
    </div>
  );
};

const StepBrandVoice = ({
  initialData,
  loading,
  onRefresh,
  onSuccess,
  onSkip,
  setGlobalError,
}) => {
  const [formState, setFormState] = useState({
    businessName: "",
    tone: "warm",
    exampleCopy: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormState({
        businessName: initialData.businessName || "",
        tone: initialData.tone || "warm",
        exampleCopy: initialData.exampleCopy || "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formState.businessName.trim()) {
      setGlobalError("Business name is required");
      return;
    }

    setGlobalError("");
    setSaving(true);

    try {
      await api.put("/brand-voice", {
        businessName: formState.businessName.trim(),
        tone: formState.tone,
        businessDescription: initialData?.businessDescription || "",
        values: initialData?.values ? JSON.parse(initialData.values) : null,
        talkingPoints: initialData?.talkingPoints ? JSON.parse(initialData.talkingPoints) : null,
        dosDonts: initialData?.dosDonts ? JSON.parse(initialData.dosDonts) : null,
        exampleCopy: formState.exampleCopy || null,
      });

      onRefresh();
      onSuccess();
    } catch (err) {
      setGlobalError(err.response?.data?.message || "Failed to save brand voice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Step 2: Dial in your voice</h2>
        <p className="text-white/70 max-w-2xl">
          Tell WarmWelcome how to speak like your brand. We'll use this tone for every email we generate.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-white/80 mb-2">
              Business name
            </label>
            <input
              id="businessName"
              type="text"
              value={formState.businessName}
              onChange={(e) => setFormState({ ...formState, businessName: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="Acme Coffee Co."
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-white/80 mb-2">Tone</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {toneOptions.map((tone) => {
                const isSelected = formState.tone === tone.value;
                return (
                  <button
                    type="button"
                    key={tone.value}
                    onClick={() => setFormState({ ...formState, tone: tone.value })}
                    className={`rounded-xl px-4 py-3 border text-sm transition-all ${
                      isSelected
                        ? "bg-orange-500/30 border-orange-300 text-white"
                        : "bg-white/10 border-white/15 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    {tone.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="exampleCopy" className="block text-sm font-medium text-white/80 mb-2">
              Example copy (optional)
            </label>
            <textarea
              id="exampleCopy"
              rows={4}
              value={formState.exampleCopy}
              onChange={(e) => setFormState({ ...formState, exampleCopy: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="Paste an email or message that captures your brand voice."
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="glass-button" disabled={saving}>
              {saving ? "Saving..." : "Save & continue"}
            </button>
            <button type="button" className="glass-button bg-white/5" onClick={onSkip}>
              Skip for now
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const StepBlueprint = ({ blueprints, loading, onRefresh, onSuccess, onSkip, setGlobalError }) => {
  const existingBlueprint = blueprints?.[0];
  const [formState, setFormState] = useState({
    name: existingBlueprint?.name || 'Welcome Series',
    subjectPattern: existingBlueprint?.subjectPattern || 'Welcome to {{store.name}}, {{customer.firstName}}!',
    structure: existingBlueprint?.structure
      ? JSON.stringify(
          typeof existingBlueprint.structure === 'string'
            ? JSON.parse(existingBlueprint.structure)
            : existingBlueprint.structure,
          null,
          2,
        )
      : JSON.stringify(
          {
            intro: 'Greeting and thank you',
            story: 'Share your brand promise',
            offer: 'Promote a popular product',
            closing: 'Sign off with warmth',
          },
          null,
          2,
        ),
    variables: existingBlueprint?.variables
      ? (Array.isArray(existingBlueprint.variables)
          ? existingBlueprint.variables
          : JSON.parse(existingBlueprint.variables)).join(', ')
      : 'customer.firstName, store.name',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGlobalError('');

    if (!formState.name.trim()) {
      setGlobalError('Blueprint name is required');
      return;
    }

    if (!formState.subjectPattern.trim()) {
      setGlobalError('Subject pattern is required');
      return;
    }

    let structure;
    try {
      structure = JSON.parse(formState.structure);
    } catch (error) {
      setGlobalError('Structure must be valid JSON');
      return;
    }

    const variables = formState.variables
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean);

    setSaving(true);

    try {
      await api.post('/blueprints', {
        name: formState.name.trim(),
        description: null,
        category: 'welcome',
        subjectPattern: formState.subjectPattern.trim(),
        structure,
        variables,
        optionalVars: null,
        example: null,
      });

      await onRefresh();
      onSuccess();
    } catch (error) {
      setGlobalError(error.response?.data?.message || 'Failed to create blueprint');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Step 3: Create a repeatable blueprint</h2>
        <p className="text-white/70 max-w-2xl">
          Blueprints teach WarmWelcome how to structure your emails. Start with a simple welcome template—you can refine it later.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      ) : (
        <>
          {existingBlueprint && (
            <div className="bg-white/5 border border-white/15 rounded-xl p-4">
              <p className="text-white/80 text-sm">You already have <strong>{existingBlueprint.name}</strong>. You can reuse it or create another.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="blueprintName" className="block text-sm font-medium text-white/80 mb-2">
                Blueprint name
              </label>
              <input
                id="blueprintName"
                type="text"
                value={formState.name}
                onChange={(event) => setFormState({ ...formState, name: event.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="subjectPattern" className="block text-sm font-medium text-white/80 mb-2">
                Subject pattern
              </label>
              <input
                id="subjectPattern"
                type="text"
                value={formState.subjectPattern}
                onChange={(event) => setFormState({ ...formState, subjectPattern: event.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="structure" className="block text-sm font-medium text-white/80 mb-2">
                Structure (JSON)
              </label>
              <textarea
                id="structure"
                rows={5}
                value={formState.structure}
                onChange={(event) => setFormState({ ...formState, structure: event.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="variables" className="block text-sm font-medium text-white/80 mb-2">
                Variables (comma separated)
              </label>
              <input
                id="variables"
                type="text"
                value={formState.variables}
                onChange={(event) => setFormState({ ...formState, variables: event.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
              <p className="text-xs text-white/60 mt-1">Hint: Use Shopify tokens like customer.firstName or store.name.</p>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="glass-button" disabled={saving}>
                {saving ? 'Saving...' : 'Save & continue'}
              </button>
              <button type="button" className="glass-button bg-white/5" onClick={onSkip}>
                Skip for now
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

const StepCampaign = ({
  stores,
  blueprints,
  loadingStores,
  loadingBlueprints,
  onSuccess,
  onSkip,
  setGlobalError,
}) => {
  const activeStore = stores.find((store) => store.isActive);
  const [formState, setFormState] = useState({
    name: 'Welcome Series',
    goal: 'welcome',
    storeId: activeStore?.id || '',
    blueprintId: blueprints?.[0]?.id || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!formState.storeId && activeStore?.id) {
      setFormState((prev) => ({ ...prev, storeId: activeStore.id }));
    }
  }, [activeStore, formState.storeId]);

  useEffect(() => {
    if (!formState.blueprintId && blueprints?.[0]?.id) {
      setFormState((prev) => ({ ...prev, blueprintId: blueprints[0].id }));
    }
  }, [blueprints, formState.blueprintId]);

  useEffect(() => {
    if (blueprints.length === 0 && formState.blueprintId) {
      setFormState((prev) => ({ ...prev, blueprintId: '' }));
    }
  }, [blueprints.length, formState.blueprintId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGlobalError('');

    if (!formState.name.trim()) {
      setGlobalError('Campaign name is required');
      return;
    }

    if (!formState.blueprintId) {
      setGlobalError('Select a blueprint before launching your campaign.');
      return;
    }

    setSaving(true);

    try {
      await api.post('/campaigns', {
        name: formState.name.trim(),
        description: null,
        goal: formState.goal,
        storeId: formState.storeId || null,
        blueprintId: formState.blueprintId,
        triggerType: 'user_signup',
        triggerConditions: null,
        startDate: null,
        endDate: null,
      });

      onSuccess();
    } catch (error) {
      setGlobalError(error.response?.data?.message || 'Failed to create campaign');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Step 4: Launch your first campaign</h2>
        <p className="text-white/70 max-w-2xl">
          Tie everything together with an automated journey. Start with a welcome series that greets every new customer.
        </p>
      </div>

      {loadingStores || loadingBlueprints ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="campaignName" className="block text-sm font-medium text-white/80 mb-2">
              Campaign name
            </label>
            <input
              id="campaignName"
              type="text"
              value={formState.name}
              onChange={(event) => setFormState({ ...formState, name: event.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-white/80 mb-2">
              Campaign goal
            </label>
            <select
              id="goal"
              value={formState.goal}
              onChange={(event) => setFormState({ ...formState, goal: event.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            >
              {goalOptions.map((goal) => (
                <option key={goal.value} value={goal.value}>
                  {goal.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="storeId" className="block text-sm font-medium text-white/80 mb-2">
                Shopify store
              </label>
              <select
                id="storeId"
                value={formState.storeId}
                onChange={(event) => setFormState({ ...formState, storeId: event.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              >
                <option value="">No store connected</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.shopDomain}
                  </option>
                ))}
              </select>
              {stores.length === 0 && (
                <p className="text-xs text-white/60 mt-1">Connect a store to send live emails.</p>
              )}
            </div>

            <div>
              <label htmlFor="blueprintId" className="block text-sm font-medium text-white/80 mb-2">
                Blueprint
              </label>
              {blueprints.length === 0 ? (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-white/80 space-y-2 text-sm">
                  <p>Create a blueprint before launching your first campaign.</p>
                  <Link to="/blueprints/new" className="glass-button inline-flex w-auto text-sm">
                    + Create blueprint
                  </Link>
                </div>
              ) : (
                <select
                  id="blueprintId"
                  required
                  value={formState.blueprintId}
                  onChange={(event) => setFormState({ ...formState, blueprintId: event.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                >
                  {blueprints.map((blueprint) => (
                    <option key={blueprint.id} value={blueprint.id}>
                      {blueprint.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="glass-button"
              disabled={saving || !formState.blueprintId || blueprints.length === 0}
            >
              {saving ? 'Launching...' : 'Launch campaign'}
            </button>
            <button type="button" className="glass-button bg-white/5" onClick={onSkip}>
              Skip for now
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default OnboardingWizard;
