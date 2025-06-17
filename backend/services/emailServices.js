import nodemailer from 'nodemailer';

// Create transporter with correct method name
const createTransporter = () => {
  console.log('📧 Creating email transporter...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
  
  return nodemailer.createTransport({  // ✅ Fixed: createTransport (not createTransporter)
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp, username) => {
  try {
    
    const transporter = createTransporter();
    
    // Test the connection first
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    
    const mailOptions = {
      from: {
        name: 'TaskFlow App',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Verify Your TaskFlow Account - OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4F46E5; margin: 0;">TaskFlow</h1>
              <p style="color: #666; margin: 5px 0;">Project & Task Management</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Welcome ${username}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Thank you for registering with TaskFlow. To complete your account setup, please verify your email address using the OTP code below:
            </p>
            
            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
              <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Your OTP Code:</p>
              <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px; margin: 0; font-weight: bold;">${otp}</h1>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This OTP code will expire in <strong>10 minutes</strong>. If you didn't create an account with TaskFlow, please ignore this email.
            </p>
            
            <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </div>
      `
    };

    console.log('📤 Sending email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Email sending failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email, username) => {
  try {
    console.log(`🎉 Sending welcome email to: ${email}`);
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'TaskFlow App',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Welcome to TaskFlow! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4F46E5; margin: 0;">🎉 Welcome to TaskFlow!</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${username},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Congratulations! Your email has been successfully verified and your TaskFlow account is now active.
            </p>
            
            <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0;">
              <p style="color: #065F46; margin: 0; font-weight: 500;">
                ✅ Account verified successfully!
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              You can now start creating projects, managing tasks, and collaborating with your team. Here's what you can do:
            </p>
            
            <ul style="color: #666; line-height: 1.8; margin-bottom: 25px;">
              <li>📁 Create and manage projects</li>
              <li>✅ Add and track tasks</li>
              <li>👥 Collaborate with team members</li>
              <li>📊 Monitor your progress</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/login" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                Login to TaskFlow
              </a>
            </div>
            
            <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                Need help? Contact us at support@taskflow.com
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Welcome email sending failed:', error);
    return { success: false, error: error.message };
  }
};
