const nodemailer = require('nodemailer');

/**
 * Email Service
 * Handles sending emails for reimbursement requests and notifications
 */

// Create transporter (configure based on environment)
const createTransporter = () => {
  // For development, use ethereal (fake SMTP)
  // For production, use real SMTP like Gmail or SendGrid
  
  if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
    // Real email configuration (Gmail)
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });
  } else {
    // Development mode - just log
    console.log('⚠️  Email not configured. Set EMAIL_USER and EMAIL_APP_PASSWORD in .env');
    return null;
  }
};

/**
 * Send reimbursement request email
 */
const sendReimbursementEmail = async (recipientEmail, reimbursementData, customBody = null) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    // In development without email config, just log
    console.log('📧 [EMAIL] Would send reimbursement email to:', recipientEmail);
    console.log('   Amount:', reimbursementData.amount);
    console.log('   Reason:', reimbursementData.reason);
    console.log('   Custom Body:', customBody || 'None');
    return { success: true, message: 'Email simulation (no SMTP configured)' };
  }

  const { amount, reason, date, claimantName } = reimbursementData;

  // Use custom body if provided, otherwise use default template
  const emailBody = customBody || `
    <strong>${claimantName}</strong> has submitted a reimbursement request that requires your review.
  `;

  const mailOptions = {
    from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `Reimbursement Request - ₹${amount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 10px;">
          Reimbursement Request
        </h2>
        
        <p style="color: #4b5563; font-size: 16px;">Hello,</p>
        
        <p style="color: #4b5563; font-size: 16px;">
          ${emailBody}
        </p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">Amount:</td>
              <td style="padding: 10px 0; color: #1f2937; font-size: 18px; font-weight: bold;">₹${amount}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">Date:</td>
              <td style="padding: 10px 0; color: #1f2937;">${new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280; font-weight: bold; vertical-align: top;">Reason:</td>
              <td style="padding: 10px 0; color: #1f2937;">${reason}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #4b5563; font-size: 16px;">
          Please review this reimbursement request and reply to this email with your approval or any questions.
        </p>
        
        <div style="margin: 30px 0; padding: 20px; background: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            <strong>Action Required:</strong> Please reply to this email with your decision or any questions about this reimbursement request.
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Best regards,<br>
          <strong>Expense Tracker Team</strong>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          This is an automated email. Please do not reply directly to this message.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

module.exports = {
  sendReimbursementEmail
};
