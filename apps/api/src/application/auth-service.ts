import type { AuthTokenResponse, AuthUser } from '@shared/index'
import {
  authLoginPayloadSchema,
  authRegisterPayloadSchema,
} from '@shared/index'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { environment } from '../config/environment'
import type { AuthUserRepository } from '../infrastructure/auth-user-repository'
import { ApplicationError } from '../infrastructure/errors'
import { isDatabaseEnabled } from '../infrastructure/database'

interface TokenClaims {
  sub: string
  email: string
  actorType: AuthUser['actorType']
}

export class AuthService {
  constructor(private readonly repository: AuthUserRepository) {}

  async register(payload: unknown): Promise<AuthTokenResponse> {
    this.assertDatabaseEnabled()

    const parsedPayload = authRegisterPayloadSchema.parse(payload)
    const existingUser = await this.repository.findByEmailAndActorType(
      parsedPayload.email,
      parsedPayload.actorType,
    )

    if (existingUser) {
      throw new ApplicationError(
        'An account already exists for this email and actor type.',
        { email: parsedPayload.email, actorType: parsedPayload.actorType },
        409,
      )
    }

    const passwordHash = await bcrypt.hash(parsedPayload.password, 10)
    const user = await this.repository.create({
      email: parsedPayload.email,
      displayName: parsedPayload.displayName,
      actorType: parsedPayload.actorType,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(parsedPayload.displayName)}&background=1f2937&color=ffffff`,
      passwordHash,
      organizationName: parsedPayload.organizationName ?? null,
    })

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
}
