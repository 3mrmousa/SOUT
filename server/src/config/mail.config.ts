import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const baseEmailLayout = (title: string, content: string) => `
  <div style="font-family: 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #1e1f22; padding: 40px 20px; text-align: center; color: #dbdee1;">
    <div style="max-width: 580px; margin: auto; background-color: #313338; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35); text-align: left; border: 1px solid #383a40;">
      <div style="height: 4px; background: linear-gradient(90deg, #5865f2 0%, #4752c4 100%);"></div>
      <div style="padding: 36px 32px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h1 style="color: #5865f2; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase;">SOUT</h1>
        </div>
        <h2 style="color: #f2f3f5; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 20px; text-align: center;">${title}</h2>
        <div style="color: #dbdee1; font-size: 15px; line-height: 1.6;">
          ${content}
        </div>
        <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #383a40; text-align: center; color: #949ba4; font-size: 12px; line-height: 1.5;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} SOUT. All rights reserved.</p>
        </div>
      </div>
    </div>
  </div>
`;
