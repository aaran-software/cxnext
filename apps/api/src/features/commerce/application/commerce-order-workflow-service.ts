import type {
  AuthUser,
  CommerceOrderListResponse,
  CommerceOrderWorkflowResponse,
  PrintableDocumentResponse,
} from '@shared/index'
import {
  commerceOrderListResponseSchema,
  commerceOrderWorkflowResponseSchema,
  commerceWorkflowActionPayloadSchema,
  printableDocumentResponseSchema,
} from '@shared/index'
import { ApplicationError } from '../../../shared/errors/application-error'
import type { CommerceOrderWorkflowRepository } from '../data/commerce-order-workflow-repository'

function assertBackofficeUser(user: AuthUser) {
  if (user.actorType !== 'admin' && user.actorType !== 'staff') {
    throw new ApplicationError(
      'This workflow is available only to internal operations users.',
      { actorType: user.actorType },
      403,
    )
  }
}

export class CommerceOrderWorkflowService {
  constructor(private readonly repository: CommerceOrderWorkflowRepository) {}

  async listOrders(user: AuthUser): Promise<CommerceOrderListResponse> {
    assertBackofficeUser(user)
    return commerceOrderListResponseSchema.parse({
      items: await this.repository.listOrders(),
    } satisfies CommerceOrderListResponse)
  }

  async getWorkflow(user: AuthUser, orderId: string): Promise<CommerceOrderWorkflowResponse> {
    assertBackofficeUser(user)
    return commerceOrderWorkflowResponseSchema.parse({
      workflow: await this.repository.getWorkflow(orderId),
    } satisfies CommerceOrderWorkflowResponse)
  }

  async applyWorkflowAction(user: AuthUser, orderId: string, payload: unknown): Promise<CommerceOrderWorkflowResponse> {
    assertBackofficeUser(user)
    const parsedPayload = commerceWorkflowActionPayloadSchema.parse(payload)
    return commerceOrderWorkflowResponseSchema.parse({
      workflow: await this.repository.applyWorkflowAction(orderId, parsedPayload),
    } satisfies CommerceOrderWorkflowResponse)
  }

  async renderInvoice(user: AuthUser, orderId: string): Promise<PrintableDocumentResponse> {
    assertBackofficeUser(user)
    return printableDocumentResponseSchema.parse(await this.repository.renderInvoiceHtml(orderId))
  }
}
