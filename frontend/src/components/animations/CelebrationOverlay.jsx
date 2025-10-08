import EnvelopeAnimation from './EnvelopeAnimation.jsx';

const variantDefaults = {
  login: {
    title: 'Signed in! 🎉',
    message: 'Warming up your dashboard...'
  },
  logout: {
    title: 'Logging out ✨',
    message: 'Thanks for spreading the warmth!'
  }
};

const CelebrationOverlay = ({
  show,
  variant = 'login',
  title,
  message,
}) => {
  const defaults = variantDefaults[variant] || variantDefaults.login;
  const resolvedTitle = title || defaults.title;
  const resolvedMessage = message || defaults.message;

  return (
    <div
      className={`celebration-overlay ${show ? 'celebration-overlay--visible' : ''}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div className="celebration-overlay__content">
        <EnvelopeAnimation size="lg" variant="celebration" />
        <h3 className="celebration-overlay__title">{resolvedTitle}</h3>
        {resolvedMessage ? (
          <p className="celebration-overlay__message">{resolvedMessage}</p>
        ) : null}
      </div>
    </div>
  );
};

export default CelebrationOverlay;
