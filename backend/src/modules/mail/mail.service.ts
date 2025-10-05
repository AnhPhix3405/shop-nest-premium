import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    // Cấu hình email transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });

    // Test connection
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('❌ Email configuration error:', error);
      } else {
        this.logger.log('✅ Email server is ready to send messages');
      }
    });
  }

  /**
   * Sinh mã OTP 6 số ngẫu nhiên
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Gửi OTP đến email với rate limiting và TTL
   * @param email - Email người nhận
   * @returns Object chứa thông tin kết quả
   */
  async sendOTP(email: string): Promise<{
    success: boolean;
    message: string;
    waitTime?: number;
  }> {
    try {
      // 1. Kiểm tra rate limiting (tối đa 3 lần trong 15 phút)
      const rateLimitKey = `otp_rate_limit:${email}`;
      const currentCountStr = await this.redisService.get(rateLimitKey);
      const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;

      if (currentCount >= 3) {
        const ttl = await this.redisService.getTTL(rateLimitKey);
        return {
          success: false,
          message: `Bạn đã gửi quá 3 lần. Vui lòng thử lại sau ${Math.ceil(ttl / 60)} phút.`,
          waitTime: ttl,
        };
      }

      // 2. Kiểm tra xem có OTP chưa hết hạn không (tránh spam)
      const existingOTP = await this.redisService.getOTP(email);
      if (existingOTP) {
        const otpKey = `otp:${email}`;
        const ttl = await this.redisService.getTTL(otpKey);
        return {
          success: false,
          message: `OTP đã được gửi. Vui lòng kiểm tra email hoặc thử lại sau ${ttl} giây.`,
          waitTime: ttl,
        };
      }

      // 3. Sinh mã OTP mới
      const otpCode = this.generateOTP();

      // 4. Lưu OTP vào Redis với TTL 1 phút (60 giây)
      await this.redisService.setOTP(email, otpCode, 60);

      // 5. Tăng counter rate limiting
      if (currentCount === 0) {
        // Lần đầu tiên, set TTL 15 phút (900 giây)
        await this.redisService.set(rateLimitKey, '1', 900);
      } else {
        // Tăng counter nhưng giữ nguyên TTL
        const remainingTTL = await this.redisService.getTTL(rateLimitKey);
        await this.redisService.set(rateLimitKey, (currentCount + 1).toString(), remainingTTL);
      }

      // 6. Gửi email thật
      const fromName = this.configService.get<string>('MAIL_FROM_NAME', 'ShopNest Support');
      const fromEmail = this.configService.get<string>('MAIL_USER');
      
      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: '🔐 Mã xác minh OTP - ShopNest',
        html: this.generateOTPEmailTemplate(otpCode),
      };

      await this.transporter.sendMail(mailOptions);

      this.logger.log(`✅ OTP sent successfully to ${email} - Code: ${otpCode}`);

      // Also log to console for development
      console.log('\n=== 📧 EMAIL SENT ===');
      console.log(`To: ${email}`);
      console.log(`OTP Code: ${otpCode}`);
      console.log(`Valid for: 1 minute`);
      console.log('====================\n');

      return {
        success: true,
        message: 'Mã OTP đã được gửi đến email của bạn. Mã có hiệu lực trong 1 phút.',
      };

    } catch (error) {
      this.logger.error(`❌ Failed to send OTP to ${email}:`, error);
      throw new BadRequestException('Không thể gửi mã OTP. Vui lòng thử lại sau.');
    }
  }

  /**
   * Xác minh OTP
   * @param email - Email người dùng
   * @param inputOTP - Mã OTP người dùng nhập
   * @returns Object chứa kết quả xác minh
   */
  async verifyOTP(email: string, inputOTP: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // 1. Lấy OTP từ Redis
      const storedOTPData = await this.redisService.getOTP(email);

      if (!storedOTPData) {
        return {
          success: false,
          message: 'Mã OTP không tồn tại hoặc đã hết hạn. Vui lòng gửi lại mã mới.',
        };
      }

      // 2. So sánh OTP
      if (storedOTPData.code !== inputOTP) {
        return {
          success: false,
          message: 'Mã OTP không chính xác. Vui lòng kiểm tra lại.',
        };
      }

      // 3. OTP chính xác - Xóa OTP và reset rate limit
      await this.redisService.deleteOTP(email);
      await this.redisService.del(`otp_rate_limit:${email}`);

      this.logger.log(`✅ OTP verified successfully for ${email}`);

      return {
        success: true,
        message: 'Xác minh OTP thành công!',
      };

    } catch (error) {
      this.logger.error(`❌ Failed to verify OTP for ${email}:`, error);
      throw new BadRequestException('Không thể xác minh OTP. Vui lòng thử lại sau.');
    }
  }

  /**
   * Tạo template HTML cho email OTP
   * @param otpCode - Mã OTP
   * @returns HTML template
   */
  private generateOTPEmailTemplate(otpCode: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mã xác minh OTP</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 ShopNest</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Mã xác minh OTP</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-top: 0;">Xin chào!</h2>
          <p>Bạn đã yêu cầu mã xác minh OTP cho tài khoản ShopNest của mình.</p>
          
          <div style="background: white; border: 2px dashed #667eea; border-radius: 10px; padding: 25px; text-align: center; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Mã xác minh của bạn là:</p>
            <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otpCode}
            </div>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              ⚠️ <strong>Lưu ý quan trọng:</strong><br>
              • Mã này có hiệu lực trong <strong>1 phút</strong><br>
              • Không chia sẻ mã này với bất kỳ ai<br>
              • Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email
            </p>
          </div>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
          <p>Email này được gửi tự động từ hệ thống ShopNest</p>
          <p style="margin: 0;">© 2024 ShopNest. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Kiểm tra trạng thái rate limiting
   * @param email - Email cần kiểm tra
   * @returns Thông tin rate limiting
   */
  async getRateLimitStatus(email: string): Promise<{
    count: number;
    remainingTime: number;
    isBlocked: boolean;
  }> {
    const rateLimitKey = `otp_rate_limit:${email}`;
    const countStr = await this.redisService.get(rateLimitKey);
    const count = countStr ? parseInt(countStr, 10) : 0;
    const ttl = count > 0 ? await this.redisService.getTTL(rateLimitKey) : 0;

    return {
      count,
      remainingTime: ttl,
      isBlocked: count >= 3,
    };
  }
}
