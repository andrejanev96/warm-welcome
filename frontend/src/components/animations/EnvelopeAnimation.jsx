const sizeClassMap = {
  sm: "envelope-animation--sm",
  md: "envelope-animation--md",
  lg: "envelope-animation--lg",
};

const EnvelopeAnimation = ({ size = "md", variant = "loop", className = "" }) => {
  const sizeClass = sizeClassMap[size] || sizeClassMap.md;
  const variantClass = variant === "celebration" ? "envelope-animation--celebration" : "";
  const classes = ["envelope-animation", sizeClass, variantClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} aria-hidden="true">
      <span className="envelope-animation__letter" />
      <span className="envelope-animation__body" />
      <span className="envelope-animation__flap" />
      <span className="envelope-animation__heart envelope-animation__heart--1" />
      <span className="envelope-animation__heart envelope-animation__heart--2" />
      <span className="envelope-animation__heart envelope-animation__heart--3" />
    </div>
  );
};

export default EnvelopeAnimation;
