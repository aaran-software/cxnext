import type { BootstrapSnapshot } from '@shared/index'
import type { SystemOverviewRepository } from '../infrastructure/system-overview-repository'

export class GetBootstrapSnapshot {
  constructor(private readonly repository: SystemOverviewRepository) {}

  execute(): BootstrapSnapshot {
    return this.repository.getSnapshot()
  }
}
