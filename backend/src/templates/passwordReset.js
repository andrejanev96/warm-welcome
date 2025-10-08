const formatExpiry = (expiresAt) => {
  if (!expiresAt) {
    return "in one hour";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(expiresAt);
};

export const buildPasswordResetEmail = ({ resetLink, expiresAt }) => {
  const subject = "Reset your WarmWelcome.ai password";
  const expiryLabel = formatExpiry(expiresAt);

  const text = [
    "Hi there,",
    "",
    "We received a request to reset your WarmWelcome.ai password.",
    `Use the link below to choose a new password (the link expires ${expiryLabel}).`,
    "",
    resetLink,
    "",
    "If you did not request this change, you can safely ignore this email.",
    "",
    "Warm regards,",
    "The WarmWelcome.ai Team",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
    <style>
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #f7f8fc;
        margin: 0;
        padding: 0;
        color: #1f2937;
      }
      .wrapper {
        padding: 32px 16px;
      }
      .card {
        max-width: 520px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 18px 45px rgba(79, 70, 229, 0.08);
        border: 1px solid rgba(79, 70, 229, 0.1);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #6366f1, #f97316);
        padding: 32px 24px;
        color: #ffffff;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 32px 28px;
        line-height: 1.6;
      }
      .cta {
        display: inline-block;
        padding: 14px 28px;
        background: #f97316;
        color: #ffffff;
        border-radius: 999px;
        text-decoration: none;
        font-weight: 600;
        margin: 20px 0;
      }
      .footer {
        padding: 24px 28px 32px;
        font-size: 12px;
        color: #6b7280;
        background: #f9fafb;
      }
      .divider {
        height: 1px;
        background: rgba(79, 70, 229, 0.1);
        margin: 24px 0;
      }
      @media (max-width: 600px) {
        .card {
          margin: 0 8px;
        }
        .content,
        .footer {
          padding: 24px;
        }
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="card">
        <div class="header">
          <h1>Reset your password</h1>
          <p style="margin-top: 8px; opacity: 0.9;">We received a request to reset your WarmWelcome.ai account.</p>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>
            Someone (hopefully you!) asked us to reset the password for your WarmWelcome.ai account.
            Click the button below to choose a new password. This link expires ${expiryLabel}.
          </p>
          <p style="text-align: center;">
            <a class="cta" href="${resetLink}" target="_blank" rel="noopener">
              Reset password
            </a>
          </p>
          <p>If you didn’t ask for this, you can safely ignore this message—your password will stay the same.</p>
          <div class="divider"></div>
          <p style="font-size: 14px; color: #6b7280;">
            Having trouble with the button? Copy and paste this link into your browser:<br />
            <span style="word-break: break-all; color: #374151;">${resetLink}</span>
          </p>
        </div>
        <div class="footer">
          Warm regards,<br />
          The WarmWelcome.ai Team
        </div>
      </div>
    </div>
  </body>
</html>`;

  return { subject, text, html };
};
