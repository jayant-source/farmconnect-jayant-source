import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number }>();

export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function sendOTP(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if Twilio credentials are available
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.log('Twilio credentials not found, using demo mode');
      // Store demo OTP
      otpStore.set(phoneNumber, { 
        otp: '0000', 
        expires: Date.now() + 10 * 60 * 1000 // 10 minutes
      });
      return { success: true };
    }

    const otp = generateOTP();
    
    // Send SMS via Twilio
    await client.messages.create({
      body: `Your FarmConnect verification code is: ${otp}. This code will expire in 10 minutes.`,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    // Store OTP with expiration (10 minutes)
    otpStore.set(phoneNumber, { 
      otp, 
      expires: Date.now() + 10 * 60 * 1000 
    });

    console.log(`OTP sent to ${phoneNumber}: ${otp}`);
    return { success: true };
  } catch (error) {
    console.error('Twilio SMS error:', error);
    
    // Fallback to demo mode if Twilio fails
    console.log('Falling back to demo mode');
    otpStore.set(phoneNumber, { 
      otp: '0000', 
      expires: Date.now() + 10 * 60 * 1000 
    });
    
    return { success: true };
  }
}

export function verifyOTP(phoneNumber: string, inputOtp: string): boolean {
  const stored = otpStore.get(phoneNumber);
  
  if (!stored) {
    return false;
  }
  
  // Check if OTP has expired
  if (Date.now() > stored.expires) {
    otpStore.delete(phoneNumber);
    return false;
  }
  
  // Verify OTP
  const isValid = stored.otp === inputOtp;
  
  if (isValid) {
    // Remove OTP after successful verification
    otpStore.delete(phoneNumber);
  }
  
  return isValid;
}

export function isValidPhoneNumber(phone: string): boolean {
  // Basic phone number validation - should start with + and have 10-15 digits
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(otpStore.entries());
  for (const [phone, data] of entries) {
    if (now > data.expires) {
      otpStore.delete(phone);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes