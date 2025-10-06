'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { API_BASE_URL, buildEndpoint } from '@/config/api'
import F404 from '@/components/errors/F404'

export default function VerificationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const emailFromRegister = searchParams.get('email') || ''
  
  if(!emailFromRegister) return <F404 />
  
  const [email, setEmail] = useState(emailFromRegister)
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(true) // Start with sending state
  const [countdown, setCountdown] = useState(0)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')
  const [otpSent, setOtpSent] = useState(false)
  const [canVerify, setCanVerify] = useState(false)
  // Auto send OTP when component mounts - ONLY ONCE
  useEffect(() => {
    const sendInitialOTP = async () => {
      try {
        setIsSending(true)
        setMessage('Đang gửi mã OTP đến email của bạn...')
        setMessageType('info')

        const response = await fetch(`${API_BASE_URL}${buildEndpoint.auth.sendOTP()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setOtpSent(true)
          setCanVerify(true)
          setMessage('Mã OTP đã được gửi đến email của bạn. Hãy kiểm tra hộp thư!')
          setMessageType('success')
          setCountdown(60) // Start 60 second countdown
        } else {
          setMessage(data.message || 'Không thể gửi mã OTP. Vui lòng thử lại.')
          setMessageType('error')
          setCanVerify(false)
        }
      } catch (error) {
        setMessage('Đã xảy ra lỗi khi gửi mã OTP. Vui lòng thử lại.')
        setMessageType('error')
        setCanVerify(false)
      } finally {
        setIsSending(false)
      }
    }

    // Only send once when component mounts
    sendInitialOTP()
  }, []) // Empty dependency array - only run once

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setMessage('Vui lòng nhập mã OTP 6 số')
      setMessageType('error')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}${buildEndpoint.auth.verifyOTP()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          code: otp.trim() 
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage('Xác minh thành công! Đang chuyển hướng...')
        setMessageType('success')
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login?verified=true')
        }, 2000)
      } else {
        setMessage(data.message || 'Mã OTP không đúng hoặc đã hết hạn.')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Đã xảy ra lỗi khi xác minh OTP. Vui lòng thử lại.')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return
    
    setIsSending(true)
    setMessage('Đang gửi lại mã OTP...')
    setMessageType('info')

    try {
      const response = await fetch(`${API_BASE_URL}${buildEndpoint.auth.sendOTP()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage('Mã OTP mới đã được gửi đến email của bạn!')
        setMessageType('success')
        setCountdown(60)
        setOtp('') // Clear current OTP input
      } else {
        setMessage(data.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Đã xảy ra lỗi khi gửi lại mã OTP.')
      setMessageType('error')
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Xác minh tài khoản</h1>
          <p className="text-gray-600">
            Nhập mã OTP đã được gửi đến email của bạn
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-5 w-5 text-green-600" />
              Xác minh OTP
            </CardTitle>
            <CardDescription>
              Mã OTP đã được gửi đến: {email}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Alert Message */}
            {message && (
              <Alert className={`border-l-4 ${
                messageType === 'success' 
                  ? 'border-green-500 bg-green-50 text-green-800' 
                  : messageType === 'error'
                  ? 'border-red-500 bg-red-50 text-red-800'
                  : 'border-blue-500 bg-blue-50 text-blue-800'
              }`}>
                {messageType === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : messageType === 'info' && isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {/* OTP Input Step */}
            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Mã OTP (6 số)
                </label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`h-12 text-center text-2xl font-mono tracking-widest ${
                    !canVerify ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  maxLength={6}
                  disabled={isLoading || !canVerify}
                />
              </div>

              <Button 
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6 || !canVerify}
                className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xác minh...
                  </>
                ) : !canVerify ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Vui lòng chờ...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Xác minh OTP
                  </>
                )}
              </Button>

              {/* Resend OTP */}
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600 mb-3">
                  Không nhận được mã?
                </p>
                
                {countdown > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-blue-600 font-medium">
                      Gửi lại sau {formatTime(countdown)}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(countdown / 60) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ) : canVerify ? (
                  <Button
                    variant="outline"
                    onClick={handleResendOTP}
                    disabled={isSending}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Gửi lại mã OTP
                      </>
                    )}
                  </Button>
                ) : (
                  <p className="text-sm text-gray-500">
                    Vui lòng chờ quá trình gửi OTP hoàn tất
                  </p>
                )}
              </div>

              {/* Back to register */}
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/register')}
                  className="text-gray-600 hover:text-gray-800"
                  disabled={isSending || isLoading}
                >
                  ← Quay lại đăng ký
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Bạn đã có tài khoản?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Lưu ý bảo mật:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Mã OTP có hiệu lực trong 1 phút</li>
                <li>Không chia sẻ mã OTP với bất kỳ ai</li>
                <li>Tối đa 3 lần gửi OTP trong 15 phút</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
