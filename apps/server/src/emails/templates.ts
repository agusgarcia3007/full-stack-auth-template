export interface EmailTemplate {
  subject: string;
  html: string;
}

export function renderWelcomeVerification(params: {
  verificationUrl: string;
}): EmailTemplate {
  return {
    subject: "Verify your email",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome!</h1>
          </div>
          <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Thank you for signing up! Please verify your email address to get started.</p>
            <p style="margin-bottom: 30px;">Click the button below to verify your email:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${params.verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Verify Email</a>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">Or copy and paste this link into your browser:</p>
            <p style="font-size: 14px; color: #667eea; word-break: break-all;">${params.verificationUrl}</p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">This link will expire in 24 hours.</p>
          </div>
        </body>
      </html>
    `,
  };
}

export function renderPasswordReset(params: {
  resetUrl: string;
}): EmailTemplate {
  return {
    subject: "Reset your password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Reset Password</h1>
          </div>
          <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">You requested to reset your password. Click the button below to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${params.resetUrl}" style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">Or copy and paste this link into your browser:</p>
            <p style="font-size: 14px; color: #f59e0b; word-break: break-all;">${params.resetUrl}</p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">This link will expire in 1 hour.</p>
            <p style="font-size: 14px; color: #ef4444; margin-top: 20px; padding: 15px; background: #fef2f2; border-radius: 6px;">If you didn't request this password reset, please ignore this email.</p>
          </div>
        </body>
      </html>
    `,
  };
}

export function renderEmailChangeVerification(params: {
  verificationUrl: string;
}): EmailTemplate {
  return {
    subject: "Verify your new email",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Email Change Request</h1>
          </div>
          <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">You requested to change your email address. Click the button below to confirm:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${params.verificationUrl}" style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Verify New Email</a>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">Or copy and paste this link into your browser:</p>
            <p style="font-size: 14px; color: #06b6d4; word-break: break-all;">${params.verificationUrl}</p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">This link will expire in 1 hour.</p>
            <p style="font-size: 14px; color: #3b82f6; margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 6px;">If you didn't request this change, please ignore this email.</p>
          </div>
        </body>
      </html>
    `,
  };
}

export function renderResendVerification(params: {
  verificationUrl: string;
}): EmailTemplate {
  return {
    subject: "Verify your email",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
          </div>
          <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Please verify your email address to continue using our platform.</p>
            <p style="margin-bottom: 30px;">Click the button below to verify your email:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${params.verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Verify Email</a>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">Or copy and paste this link into your browser:</p>
            <p style="font-size: 14px; color: #667eea; word-break: break-all;">${params.verificationUrl}</p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">This link will expire in 24 hours.</p>
          </div>
        </body>
      </html>
    `,
  };
}
