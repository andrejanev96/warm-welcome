import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Alert from '../components/Alert';
import api from '../utils/api';

const BrandVoice = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    tone: 'warm',
    values: [''],
    talkingPoints: [''],
    dos: [''],
    donts: [''],
    exampleCopy: '',
  });

  const toneOptions = [
    { value: 'warm', label: 'Warm & Friendly', description: 'Approachable, caring, personal' },
    { value: 'professional', label: 'Professional', description: 'Polished, business-like, formal' },
    { value: 'playful', label: 'Playful', description: 'Fun, energetic, lighthearted' },
    { value: 'casual', label: 'Casual', description: 'Relaxed, conversational, easygoing' },
    { value: 'luxury', label: 'Luxury', description: 'Sophisticated, exclusive, premium' },
  ];

  useEffect(() => {
    fetchBrandVoice();
  }, []);

  const fetchBrandVoice = async () => {
    try {
      setLoading(true);
      const response = await api.get('/brand-voice');
      const brandVoice = response.data.data;

      if (brandVoice) {
        // Parse JSON fields
        const values = brandVoice.values ? JSON.parse(brandVoice.values) : [''];
        const talkingPoints = brandVoice.talkingPoints ? JSON.parse(brandVoice.talkingPoints) : [''];
        const dosDonts = brandVoice.dosDonts ? JSON.parse(brandVoice.dosDonts) : { dos: [''], donts: [''] };

        setFormData({
          businessName: brandVoice.businessName || '',
          businessDescription: brandVoice.businessDescription || '',
          tone: brandVoice.tone || 'warm',
          values,
          talkingPoints,
          dos: dosDonts.dos || [''],
          donts: dosDonts.donts || [''],
          exampleCopy: brandVoice.exampleCopy || '',
        });
      }
    } catch (err) {
      console.error('Error fetching brand voice:', err);
      // Don't show error if brand voice doesn't exist yet (404)
      if (err.response?.status !== 404) {
        setError('Failed to load brand voice');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item),
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // Filter out empty strings from arrays
      const cleanedValues = formData.values.filter(v => v.trim());
      const cleanedTalkingPoints = formData.talkingPoints.filter(v => v.trim());
      const cleanedDos = formData.dos.filter(v => v.trim());
      const cleanedDonts = formData.donts.filter(v => v.trim());

      const payload = {
        businessName: formData.businessName,
        businessDescription: formData.businessDescription,
        tone: formData.tone,
        values: cleanedValues.length > 0 ? cleanedValues : null,
        talkingPoints: cleanedTalkingPoints.length > 0 ? cleanedTalkingPoints : null,
        dosDonts: (cleanedDos.length > 0 || cleanedDonts.length > 0) ? {
          dos: cleanedDos,
          donts: cleanedDonts,
        } : null,
        exampleCopy: formData.exampleCopy || null,
      };

      await api.put('/brand-voice', payload);
      setSuccess('Brand voice saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save brand voice');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          🎨 Brand Voice
        </h1>
        <p className="text-lg text-white/80">
          Define your brand personality so AI can write emails that sound authentically you
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-6">
          <Alert type="success" message={success} onClose={() => setSuccess('')} duration={5000} />
        </div>
      )}

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError('')} duration={5000} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Basics */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-6">Business Basics</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-white/90 mb-2">
                Business Name *
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                placeholder="e.g., Acme Coffee Co."
                required
              />
            </div>

            <div>
              <label htmlFor="businessDescription" className="block text-sm font-medium text-white/90 mb-2">
                What does your business do?
              </label>
              <textarea
                id="businessDescription"
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                placeholder="e.g., We sell premium, ethically-sourced coffee beans delivered fresh to your door..."
              />
            </div>
          </div>
        </div>

        {/* Tone */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-2">Tone of Voice *</h2>
          <p className="text-sm text-white/70 mb-6">How should your emails sound?</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toneOptions.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                  formData.tone === option.value
                    ? 'bg-white/20 border-orange-400 shadow-lg'
                    : 'bg-white/5 border-white/20 hover:bg-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="tone"
                  value={option.value}
                  checked={formData.tone === option.value}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="font-semibold text-white mb-1">{option.label}</div>
                <div className="text-sm text-white/70">{option.description}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-2">Brand Values</h2>
          <p className="text-sm text-white/70 mb-6">What does your brand stand for?</p>

          <div className="space-y-3">
            {formData.values.map((value, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleArrayChange('values', index, e.target.value)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="e.g., Sustainability, Quality, Community"
                />
                {formData.values.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('values', index)}
                    className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('values')}
              className="glass-button"
            >
              + Add Value
            </button>
          </div>
        </div>

        {/* Talking Points */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-2">Key Talking Points</h2>
          <p className="text-sm text-white/70 mb-6">USPs, policies, or things customers should know</p>

          <div className="space-y-3">
            {formData.talkingPoints.map((point, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={point}
                  onChange={(e) => handleArrayChange('talkingPoints', index, e.target.value)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="e.g., Free returns within 30 days"
                />
                {formData.talkingPoints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('talkingPoints', index)}
                    className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('talkingPoints')}
              className="glass-button"
            >
              + Add Talking Point
            </button>
          </div>
        </div>

        {/* Do's and Don'ts */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-2">Do's & Don'ts</h2>
          <p className="text-sm text-white/70 mb-6">Guide the AI on what to say (and what to avoid)</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Do's */}
            <div>
              <h3 className="font-semibold text-white mb-3">✅ Do's</h3>
              <div className="space-y-3">
                {formData.dos.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayChange('dos', index, e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      placeholder="e.g., Use customer's first name"
                    />
                    {formData.dos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('dos', index)}
                        className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('dos')}
                  className="glass-button w-full"
                >
                  + Add Do
                </button>
              </div>
            </div>

            {/* Don'ts */}
            <div>
              <h3 className="font-semibold text-white mb-3">❌ Don'ts</h3>
              <div className="space-y-3">
                {formData.donts.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayChange('donts', index, e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      placeholder="e.g., Don't use exclamation marks"
                    />
                    {formData.donts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('donts', index)}
                        className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('donts')}
                  className="glass-button w-full"
                >
                  + Add Don't
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Example Copy */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-2">Example Communication</h2>
          <p className="text-sm text-white/70 mb-6">
            Share an example of your best customer communication (email, message, social post)
          </p>

          <textarea
            name="exampleCopy"
            value={formData.exampleCopy}
            onChange={handleInputChange}
            rows={6}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            placeholder="Paste an example of how you communicate with customers..."
          />
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="glass-button flex-1 justify-center"
          >
            {saving ? 'Saving...' : 'Save Brand Voice'}
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default BrandVoice;
