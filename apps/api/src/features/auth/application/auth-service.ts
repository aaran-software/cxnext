import type {
  AuthRegisterOtpRequestResponse,
  AuthRegisterOtpVerifyResponse,
  AuthTokenResponse,
  AuthUser,
} from '@shared/index'
import {
  authLoginPayloadSchema,
  authRegisterPayloadSchema,
  authRegisterOtpRequestPayloadSchema,
  authRegisterOtpRequestResponseSchema,
  authRegisterOtpVerifyPayloadSchema,
  authRegisterOtpVerifyResponseSchema,
} from '@shared/index'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomInt } from 'node:crypto'
import type { AuthUserRepository } from '../data/auth-user-repository'
import { environment } from '../../../shared/config/environment'
import { isDatabaseEnabled } from '../../../shared/database/database'
import { ApplicationError } from '../../../shared/errors/application-error'

interface TokenClaims {
  sub: string
  email: string
  actorType: AuthUser['actorType']
}

export class AuthService {
  constructor(private readonly repository: AuthUserRepository) {}

  async requestRegisterOtp(payload: unknown): Promise<AuthRegisterOtpRequestResponse> {
    this.assertDatabaseEnabled()

    const parsedPayload = authRegisterOtpRequestPayloadSchema.parse(payload)
    const actorType = 'customer'
    const destination =
      parsedPayload.channel === 'email'
        ? parsedPayload.destination.trim().toLowerCase()
        : this.normalizePhoneNumber(parsedPayload.destination)

    if (parsedPayload.channel === 'email') {
      const existingUser = await this.repository.findByEmailAndActorType(destination, actorType)
      if (existingUser) {
        throw new ApplicationError('An account already exists for this email.', { email: destination }, 409)
      }
    }

    if (parsedPayload.channel === 'mobile') {
      const existingUsers = await this.repository.findByPhoneNumber(destination)
      if (existingUsers.some((entry) => entry.user.actorType === actorType)) {
        throw new ApplicationError('An account already exists for this mobile number.', { phoneNumber: destination }, 409)
      }
    }

    const otp = String(randomInt(100000, 1000000))
    const otpHash = await bcrypt.hash(otp, 10)
    const expiresAt = new Date(Date.now() + environment.auth.otp.expiryMinutes * 60_000)

    await this.repository.deactivatePendingContactVerifications({
      purpose: 'customer_registration',
      actorType,
      channel: parsedPayload.channel,
      destination,
    })

    const verification = await this.repository.createContactVerification({
      purpose: 'customer_registration',
      actorType,
      channel: parsedPayload.channel,
      destination,
      otpHash,
      expiresAt,
    })

    return authRegisterOtpRequestResponseSchema.parse({
      verificationId: verification.id,
      expiresAt: verification.expiresAt,
      debugOtp: environment.auth.otp.debug ? otp : null,
    } satisfies AuthRegisterOtpRequestResponse)
  }

  async verifyRegisterOtp(payload: unknown): Promise<AuthRegisterOtpVerifyResponse> {
    this.assertDatabaseEnabled()

    const parsedPayload = authRegisterOtpVerifyPayloadSchema.parse(payload)
    const verification = await this.repository.getContactVerification(parsedPayload.verificationId)

    if (!verification || !verification.isActive || verification.purpose !== 'customer_registration') {
      throw new ApplicationError('Verification session could not be found.', { verificationId: parsedPayload.verificationId }, 404)
    }

    if (verification.consumedAt) {
      throw new ApplicationError('This verification session has already been used.', { verificationId: verification.id }, 409)
    }

    if (verification.verifiedAt) {
      return authRegisterOtpVerifyResponseSchema.parse({
        verificationId: verification.id,
        verified: true,
      } satisfies AuthRegisterOtpVerifyResponse)
    }

    if (new Date(verification.expiresAt).getTime() < Date.now()) {
      throw new ApplicationError('The OTP has expired. Request a new code.', { verificationId: verification.id }, 410)
    }

    const otpMatches = await bcrypt.compare(parsedPayload.otp, verification.otpHash)
    if (!otpMatches) {
      await this.repository.incrementContactVerificationAttempts(verification.id)
      throw new ApplicationError('Invalid OTP. Check the code and try again.', { verificationId: verification.id }, 400)
    }

    await this.repository.markContactVerificationVerified(verification.id)

    return authRegisterOtpVerifyResponseSchema.parse({
      verificationId: verification.id,
      verified: true,
    } satisfies AuthRegisterOtpVerifyResponse)
  }

  async register(payload: unknown): Promise<AuthTokenResponse> {
    this.assertDatabaseEnabled()

    const parsedPayload = authRegisterPayloadSchema.parse(payload)
    const actorType = 'customer'
    const normalizedEmail = parsedPayload.email.trim().toLowerCase()
    const normalizedPhone = this.normalizePhoneNumber(parsedPayload.phoneNumber)

    if (parsedPayload.actorType !== actorType) {
      throw new ApplicationError('Public registration is limited to customer accounts.', { actorType: parsedPayload.actorType }, 403)
    }

    const emailVerification = await this.repository.getContactVerification(parsedPayload.emailVerificationId)
    const mobileVerification = await this.repository.getContactVerification(parsedPayload.mobileVerificationId)

    this.assertVerifiedRegistrationContact({
      verification: emailVerification,
      expectedChannel: 'email',
      expectedDestination: normalizedEmail,
    })
    this.assertVerifiedRegistrationContact({
      verification: mobileVerification,
      expectedChannel: 'mobile',
      expectedDestination: normalizedPhone,
    })

    const existingUser = await this.repository.findByEmailAndActorType(
      normalizedEmail,
      actorType,
    )

    if (existingUser) {
      throw new ApplicationError(
        'An account already exists for this email.',
        { email: normalizedEmail, actorType },
        409,
      )
    }

    const existingPhoneUsers = await this.repository.findByPhoneNumber(normalizedPhone)
    if (existingPhoneUsers.some((entry) => entry.user.actorType === actorType)) {
      throw new ApplicationError(
        'An account already exists for this mobile number.',
        { phoneNumber: normalizedPhone, actorType },
        409,
      )
    }

    const passwordHash = await bcrypt.hash(parsedPayload.password, 10)
    const user = await this.repository.create({
      email: normalizedEmail,
      phoneNumber: normalizedPhone,
      displayName: parsedPayload.displayName,
      actorType,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(parsedPayload.displayName)}&background=1f2937&color=ffffff`,
      passwordHash,
      organizationName: parsedPayload.organizationName ?? null,
    })

    await this.repository.consumeContactVerification(emailVerification!.id)
    await this.repository.consumeContactVerification(mobileVerification!.id)

    return this.createAuthResponse(user)
  }

  async login(payload: unknown): Promise<AuthTokenResponse> {
    this.assertDatabaseEnabled()

    const parsedPayload = authLoginPayloadSchema.parse(payload)
    const storedUsers = await this.repository.findByEmail(parsedPayload.email)

    if (storedUsers.length === 0) {
      throw new ApplicationError('Invalid credentials.', { email: parsedPayload.email }, 401)
    }

    let storedUser = null

    for (const candidate of storedUsers) {
      const passwordMatches = await bcrypt.compare(parsedPayload.password, candidate.passwordHash)
      if (passwordMatches) {
        storedUser = candidate
        break
      }
    }

    if (!storedUser) {
      throw new ApplicationError('Invalid credentials.', { email: parsedPayload.email }, 401)
    }

    if (!storedUser.user.isActive) {
      throw new ApplicationError('The account is disabled.', { id: storedUser.user.id }, 403)
    }

    return this.createAuthResponse(storedUser.user)
  }

  async getAuthenticatedUser(token: string) {
    const claims = jwt.verify(token, environment.jwtSecret) as TokenClaims

    const storedUser = await this.repository.findByEmailAndActorType(
      claims.email,
      claims.actorType,
    )

    if (!storedUser) {
      throw new ApplicationError('Authenticated user no longer exists.', { sub: claims.sub }, 404)
    }

    return storedUser.user
  }

  private createAuthResponse(user: AuthUser): AuthTokenResponse {
    const accessToken = jwt.sign(
      {
        email: user.email,
        actorType: user.actorType,
      },
      environment.jwtSecret,
      {
        subject: user.id,
        expiresIn: environment.jwtExpiresInSeconds,
      },
    )

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresInSeconds: environment.jwtExpiresInSeconds,
      user,
    }
  }

  private assertDatabaseEnabled() {
    if (!isDatabaseEnabled()) {
      throw new ApplicationError(
        'Database-backed authentication is disabled.',
        { dbEnabled: false },
        503,
      )
    }
  }

  private assertVerifiedRegistrationContact(input: {
    verification: Awaited<ReturnType<AuthUserRepository['getContactVerification']>>
    expectedChannel: 'email' | 'mobile'
    expectedDestination: string
  }) {
    const { verification, expectedChannel, expectedDestination } = input

    if (!verification || !verification.isActive) {
      throw new ApplicationError('A required verification session is missing.', { channel: expectedChannel }, 400)
    }

    if (verification.purpose !== 'customer_registration' || verification.actorType !== 'customer') {
      throw new ApplicationError('Verification session is not valid for customer registration.', { channel: expectedChannel }, 400)
    }

    if (verification.channel !== expectedChannel) {
      throw new ApplicationError('Verification channel mismatch.', { channel: expectedChannel }, 400)
    }

    if (verification.destination !== expectedDestination) {
      throw new ApplicationError('Verification destination mismatch.', { channel: expectedChannel }, 400)
    }

    if (!verification.verifiedAt) {
      throw new ApplicationError('Verify the OTP before completing registration.', { channel: expectedChannel }, 400)
    }

    if (verification.consumedAt) {
      throw new ApplicationError('Verification session has already been used.', { channel: expectedChannel }, 409)
    }

    if (new Date(verification.expiresAt).getTime() < Date.now()) {
      throw new ApplicationError('One of the verification sessions expired. Request a new OTP.', { channel: expectedChannel }, 410)
    }
  }

  private normalizePhoneNumber(value: string) {
    const trimmed = value.trim()
    const normalized = trimmed.startsWith('+')
      ? `+${trimmed.slice(1).replace(/\D/g, '')}`
      : trimmed.replace(/\D/g, '')

    if (!normalized || normalized === '+') {
      throw new ApplicationError('Enter a valid mobile number.', { phoneNumber: value }, 400)
    }

    return normalized.startsWith('+') ? normalized : `+${normalized}`
  }
}
