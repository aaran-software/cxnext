import { coreWorkspaceItems } from '../../core/domain/src/index'
import { ecommerceWorkspaceItems } from '../../ecommerce/domain/src/index'
import { frameworkServices, suiteApps } from './app-suite'

export function getFrameworkManifest() {
  return {
    framework: {
      services: frameworkServices,
    },
    appSuite: suiteApps,
    workspaces: {
      core: coreWorkspaceItems,
      ecommerce: ecommerceWorkspaceItems,
    },
  }
}
