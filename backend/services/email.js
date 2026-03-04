const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  service : 'gmail',
  auth    : {
    user : process.env.GMAIL_USER,
    pass : process.env.GMAIL_PASS
  }
});

// ── Send OTP ──────────────────────────────────────────
const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from    : `"Visitors App" <${process.env.GMAIL_USER}>`,
    to      : email,
    subject : '🔐 Your OTP for Visitors App',
    html    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Email Verification</h2>
        <p>Your OTP for verification is:</p>
        <div style="
          background: #f3f4f6;
          padding: 20px;
          text-align: center;
          border-radius: 8px;
          margin: 20px 0;
        ">
          <h1 style="
            color: #2563eb;
            font-size: 48px;
            letter-spacing: 10px;
            margin: 0;
          ">${otp}</h1>
        </div>
        <p style="color: #6b7280;">This OTP expires in <strong>10 minutes</strong>.</p>
        <p style="color: #6b7280;">If you did not request this, ignore this email.</p>
      </div>
    `
  });
};

// ── Send Approval Request to Host ─────────────────────
const sendApprovalRequest = async (host, visitor, visitId) => {
  const approveUrl = `${process.env.APP_URL}/api/approval/${visitId}/approve`;
  const rejectUrl  = `${process.env.APP_URL}/api/approval/${visitId}/reject`;

  await transporter.sendMail({
    from    : `"Visitors App" <${process.env.GMAIL_USER}>`,
    to      : host.email,
    subject : `🔔 Visit Request from ${visitor.name}`,
    html    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Visit Request</h2>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Visitor Name</td>
              <td style="padding: 8px 0; font-weight: bold;">${visitor.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Phone</td>
              <td style="padding: 8px 0;">${visitor.phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Purpose</td>
              <td style="padding: 8px 0;">${visitor.purpose}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Preferred Date</td>
              <td style="padding: 8px 0;">${visitor.preferred_date}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Preferred Time</td>
              <td style="padding: 8px 0;">${visitor.preferred_time}</td>
            </tr>
          </table>
          ${visitor.photo_url ? `
            <div style="margin-top: 15px;">
              <img src="${visitor.photo_url}"
                style="width: 120px; height: 120px; border-radius: 8px; object-fit: cover;"
              />
            </div>
          ` : ''}
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${approveUrl}" style="
            background: #16a34a;
            color: white;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 16px;
            font-weight: bold;
            margin-right: 16px;
          ">✅ Approve</a>

          <a href="${rejectUrl}" style="
            background: #dc2626;
            color: white;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 16px;
            font-weight: bold;
          ">❌ Reject</a>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          After approving, you will be asked to set the allowed visit timings.
        </p>
      </div>
    `
  });
};

// ── Send Visitor Pass ─────────────────────────────────
const sendVisitorPass = async (email, visitor, pass, qrCodeImage) => {
  await transporter.sendMail({
    from    : `"Visitors App" <${process.env.GMAIL_USER}>`,
    to      : email,
    subject : '🎫 Your Visitor Pass is Ready!',
    html    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Your Visit has been Approved!</h2>

        <div style="
          border: 2px solid #2563eb;
          border-radius: 12px;
          padding: 24px;
          margin: 20px 0;
        ">
          <h3 style="color: #2563eb; margin-top: 0;">🎫 VISITOR PASS</h3>

          <div style="display: flex; gap: 20px;">
            <div style="flex: 1;">
              <table style="width: 100%;">
                <tr>
                  <td style="color: #6b7280; padding: 6px 0;">Name</td>
                  <td style="font-weight: bold;">${visitor.name}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 6px 0;">Phone</td>
                  <td>${visitor.phone}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 6px 0;">Purpose</td>
                  <td>${visitor.purpose}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 6px 0;">Host</td>
                  <td>${visitor.host_name}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 6px 0;">Date</td>
                  <td>${visitor.preferred_date}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 6px 0;">Valid From</td>
                  <td style="color: #16a34a; font-weight: bold;">
                    ${new Date(pass.approved_start_time).toLocaleTimeString()}
                  </td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 6px 0;">Valid Until</td>
                  <td style="color: #dc2626; font-weight: bold;">
                    ${new Date(pass.approved_end_time).toLocaleTimeString()}
                  </td>
                </tr>
              </table>
            </div>

            <div style="text-align: center;">
              <img src="${visitor.photo_url}"
                style="width: 100px; height: 100px; border-radius: 8px; object-fit: cover;"
              />
              <div style="margin-top: 10px;">
                <img src="cid:qrcode"
                  style="width: 100px; height: 100px;"
                />
              </div>
              <p style="font-size: 11px; color: #6b7280;">Scan at gate</p>
            </div>
          </div>
        </div>

        <p style="color: #6b7280;">
          Please show this pass at the security gate on the day of your visit.
        </p>
      </div>
    `,
    attachments: [{
      filename : 'qrcode.png',
      content  : qrCodeImage,
      encoding : 'base64',
      cid      : 'qrcode'
    }]
  });
};

// ── Send Rejection Email ──────────────────────────────
const sendRejectionEmail = async (email, visitor) => {
  await transporter.sendMail({
    from    : `"Visitors App" <${process.env.GMAIL_USER}>`,
    to      : email,
    subject : '❌ Visit Request Rejected',
    html    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Visit Request Not Approved</h2>
        <p>Unfortunately your visit request to meet
          <strong>${visitor.host_name}</strong>
          on <strong>${visitor.preferred_date}</strong> has been rejected.
        </p>
        <p>Please contact the host directly for more information.</p>
      </div>
    `
  });
};

module.exports = {
  sendOTP,
  sendApprovalRequest,
  sendVisitorPass,
  sendRejectionEmail
};