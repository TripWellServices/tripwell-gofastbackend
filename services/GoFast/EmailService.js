const nodemailer = require('nodemailer');

/**
 * EmailService - Simple Gmail SMTP for MVP
 * Uses Gmail App Password (no OAuth needed)
 */
class EmailService {
  
  static createTransporter() {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // your-email@gmail.com
        pass: process.env.GMAIL_APP_PASSWORD // 16-char app password
      }
    });
  }

  /**
   * Send training plan ready email
   */
  static async sendTrainingPlanReady(userEmail, goesBy, raceName, raceType) {
    try {
      const transporter = this.createTransporter();
      
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: userEmail,
        subject: `🏃‍♂️ Your ${raceType} Training Plan is Ready!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🏃‍♂️ GoFast</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your training plan is ready!</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Hey ${goesBy}! 👋</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Great news! Your personalized <strong>${raceType}</strong> training plan for <strong>${raceName}</strong> is ready to go.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b35;">
                <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
                <ul style="color: #666; line-height: 1.8;">
                  <li>📱 Check your GoFast app for your complete training schedule</li>
                  <li>🏃‍♂️ Start with your first workout</li>
                  <li>📊 Track your progress as you train</li>
                  <li>🎯 Crush your ${raceType} goal!</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://gofastcrushgoals.vercel.app/training-pulse-hub" 
                   style="background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                  View Your Training Plan
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                Ready to GoFast? Let's do this! 💪
              </p>
            </div>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Training plan email sent to ${userEmail}`);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Email send failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send race intent submitted email
   */
  static async sendRaceIntentSubmitted(userEmail, goesBy, raceName, raceType) {
    try {
      const transporter = this.createTransporter();
      
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: userEmail,
        subject: `🏃‍♂️ Training Plan Generation Started - ${raceType}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🏃‍♂️ GoFast</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Creating your training plan...</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Hey ${goesBy}! 👋</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Awesome! We're creating your personalized <strong>${raceType}</strong> training plan for <strong>${raceName}</strong>.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b35;">
                <h3 style="color: #333; margin-top: 0;">🤖 What's Happening?</h3>
                <ul style="color: #666; line-height: 1.8;">
                  <li>📊 Analyzing your current fitness level</li>
                  <li>🎯 Building a plan to reach your goal time</li>
                  <li>📅 Creating your weekly training schedule</li>
                  <li>⚡ Optimizing for your race date</li>
                </ul>
              </div>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                This usually takes 2-3 minutes. We'll email you when it's ready!
              </p>
              
              <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                Get ready to GoFast! 🚀
              </p>
            </div>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Race intent email sent to ${userEmail}`);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Email send failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email after signup
   */
  static async sendWelcomeEmail(userEmail, goesBy) {
    try {
      const transporter = this.createTransporter();
      
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: userEmail,
        subject: `🏃‍♂️ Welcome to GoFast, ${goesBy}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🏃‍♂️ GoFast</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Welcome to the family!</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Hey ${goesBy}! 👋</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Welcome to GoFast! We're excited to help you crush your running goals.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b35;">
                <h3 style="color: #333; margin-top: 0;">🚀 What's Next?</h3>
                <ol style="color: #666; line-height: 1.8;">
                  <li>📝 Complete your runner profile</li>
                  <li>🎯 Set your race goal</li>
                  <li>🤖 Get your AI-powered training plan</li>
                  <li>🏃‍♂️ Start training and GoFast!</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://gofastcrushgoals.vercel.app/runner-profile" 
                   style="background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                  Complete Your Profile
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                Let's make you faster! 💪
              </p>
            </div>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${userEmail}`);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Email send failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;
