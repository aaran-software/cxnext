import type { DatabaseManagerReport, DatabaseManagerTable } from '@shared/index'
import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Database,
  Download,
  HardDriveDownload,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { AnimatedTabs, type AnimatedContentTab } from '@/components/ui/animated-tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@framework-core/web/auth/components/auth-provider'
import {
  backupDatabaseManager,
  downloadDatabaseManagerBackup,
  getDatabaseManager,
  hardResetDatabaseManager,
  HttpError,
  migrateDatabaseManager,
  verifyDatabaseManager,
} from '@/shared/api/client'
import { showErrorToast, showInfoToast, showSuccessToast } from '@/shared/notifications/toast'

const hardResetConfirmationText = 'RESET CXNEXT DATABASE'

function toErrorMessage(error: unknown) {
  if (error instanceof HttpError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Unable to complete the database maintenance action.'
}

function formatCount(value: number | null | undefined) {
  if (typeof value !== 'number') {
    return 'n/a'
  }

  return new Intl.NumberFormat('en-IN').format(value)
}

function getStatusBadgeClassName(status: DatabaseManagerTable['status'] | DatabaseManagerReport['verification']['status']) {
  if (status === 'ok' || status === 'ready') {
    return ''
  }

  if (status === 'missing' || status === 'error') {
    return 'bg-destructive/15 text-destructive'
  }

  return ''
}

export function DatabaseManagerPage() {
  const { session } = useAuth()
  const accessToken = session?.accessToken ?? null
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [report, setReport] = useState<DatabaseManagerReport | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [backingUp, setBackingUp] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | DatabaseManagerTable['status']>('all')
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetConfirmation, setResetConfirmation] = useState('')

  useEffect(() => {
    const token = accessToken
    if (typeof token !== 'string') {
      return
    }
    const resolvedToken = token

    let cancelled = false

    async function load() {
      setLoading(true)
      setErrorMessage(null)

      try {
        const nextReport = await getDatabaseManager(resolvedToken)
        if (!cancelled) {
          setReport(nextReport)
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(toErrorMessage(error))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [accessToken])

  async function handleVerify() {
    const token = accessToken
    if (typeof token !== 'string') {
      return
    }

    setVerifying(true)
    setErrorMessage(null)

    try {
      const result = await verifyDatabaseManager(token)
      setReport(result.report)
      showInfoToast({
        title: 'Verification finished',
        description: result.message,
      })
    } catch (error) {
      const message = toErrorMessage(error)
      setErrorMessage(message)
      showErrorToast({
        title: 'Unable to verify database',
        description: message,
      })
    } finally {
      setVerifying(false)
    }
  }

  async function handleMigrate() {
    const token = accessToken
    if (typeof token !== 'string') {
      return
    }

    setMigrating(true)
    setErrorMessage(null)

    try {
      const result = await migrateDatabaseManager(token)
      setReport(result.report)
      showSuccessToast({
        title: 'Database updated',
        description: result.message,
      })
    } catch (error) {
      const message = toErrorMessage(error)
      setErrorMessage(message)
      showErrorToast({
        title: 'Unable to update schema',
        description: message,
      })
    } finally {
      setMigrating(false)
    }
  }

  async function handleBackupAndDownload() {
    const token = accessToken
    if (typeof token !== 'string') {
      return
    }

    setBackingUp(true)
    setErrorMessage(null)

    try {
      const result = await backupDatabaseManager(token)
      setReport(result.report)
      await downloadDatabaseManagerBackup(token, result.backup.downloadPath, result.backup.fileName)
      showSuccessToast({
        title: 'Backup created',
        description: `${result.backup.fileName} was generated and downloaded.`,
      })
    } catch (error) {
      const message = toErrorMessage(error)
      setErrorMessage(message)
      showErrorToast({
        title: 'Unable to backup database',
        description: message,
      })
    } finally {
      setBackingUp(false)
    }
  }

  async function handleDownloadLatestBackup() {
    const token = accessToken
    if (typeof token !== 'string' || !report?.latestBackup) {
      return
    }

    try {
      await downloadDatabaseManagerBackup(token, report.latestBackup.downloadPath, report.latestBackup.fileName)
      showInfoToast({
        title: 'Backup download started',
        description: report.latestBackup.fileName,
      })
    } catch (error) {
      const message = toErrorMessage(error)
      setErrorMessage(message)
      showErrorToast({
        title: 'Unable to download backup',
        description: message,
      })
    }
  }

  async function handleHardReset() {
    const token = accessToken
    if (typeof token !== 'string') {
      return
    }

    setResetting(true)
    setErrorMessage(null)

    try {
      const result = await hardResetDatabaseManager(token, {
        confirmation: resetConfirmation,
      })
      setReport(result.report)
      setResetDialogOpen(false)
      setResetConfirmation('')
      showSuccessToast({
        title: 'Managed schema rebuilt',
        description: result.message,
      })
    } catch (error) {
      const message = toErrorMessage(error)
      setErrorMessage(message)
      showErrorToast({
        title: 'Unable to hard reset database',
        description: message,
      })
    } finally {
      setResetting(false)
    }
  }

  const filteredTables = (report?.tables ?? []).filter((table) => {
    const matchesStatus = statusFilter === 'all' || table.status === statusFilter
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const matchesSearch = !normalizedSearch
      || table.name.toLowerCase().includes(normalizedSearch)
      || table.category.toLowerCase().includes(normalizedSearch)

    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Migration manager</CardTitle>
            <CardDescription>Loading database maintenance report.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="mesh-panel overflow-hidden">
        <CardHeader className="border-b border-border/60">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <Badge>Super admin tool</Badge>
              <div>
                <CardTitle className="text-3xl">Migration manager and database verification</CardTitle>
                <CardDescription className="mt-2 max-w-4xl text-sm leading-6">
                  Inspect every database table, compare the managed schema against the live database, verify migration drift, create downloadable backups, and rebuild the managed schema when recovery work is required.
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => void handleVerify()} disabled={verifying || migrating || backingUp || resetting}>
                <RefreshCcw className="size-4" />
                {verifying ? 'Verifying...' : 'Verify schema'}
              </Button>
              <Button variant="outline" onClick={() => void handleMigrate()} disabled={verifying || migrating || backingUp || resetting}>
                <Sparkles className="size-4" />
                {migrating ? 'Updating...' : 'Update to latest version'}
              </Button>
              <Button onClick={() => void handleBackupAndDownload()} disabled={verifying || migrating || backingUp || resetting}>
                <HardDriveDownload className="size-4" />
                {backingUp ? 'Creating backup...' : 'Backup and download'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <AnimatedTabs
            defaultTabValue="overview"
            tabs={[
              {
                label: 'Overview',
                value: 'overview',
                content: (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <Card className="border-border/70">
                        <CardHeader>
                          <CardTitle className="text-base">Migration status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <Badge className={getStatusBadgeClassName(report?.verification.status ?? 'warning')}>
                            {report?.verification.status ?? 'unknown'}
                          </Badge>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Current</span>
                            <span className="font-medium text-foreground">{report?.database.currentVersionId ?? 'not-ready'}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Latest</span>
                            <span className="font-medium text-foreground">{report?.database.latestVersionId ?? 'unknown'}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Pending</span>
                            <span className="font-medium text-foreground">{formatCount(report?.database.pendingMigrations)}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-border/70">
                        <CardHeader>
                          <CardTitle className="text-base">Table coverage</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Expected</span>
                            <span className="font-medium text-foreground">{formatCount(report?.verification.expectedTableCount)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Present</span>
                            <span className="font-medium text-foreground">{formatCount(report?.verification.existingManagedTableCount)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Missing</span>
                            <span className="font-medium text-foreground">{formatCount(report?.verification.missingTableCount)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Unexpected</span>
                            <span className="font-medium text-foreground">{formatCount(report?.verification.unexpectedTableCount)}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-border/70">
                        <CardHeader>
                          <CardTitle className="text-base">Data footprint</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">All tables</span>
                            <span className="font-medium text-foreground">{formatCount(report?.verification.existingTableCount)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Total rows</span>
                            <span className="font-medium text-foreground">{formatCount(report?.verification.totalRowCount)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Checked</span>
                            <span className="font-medium text-foreground">{report?.verification.checkedAt?.slice(0, 19).replace('T', ' ') ?? 'n/a'}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-border/70">
                        <CardHeader>
                          <CardTitle className="text-base">Latest backup</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div className="text-muted-foreground">
                            {report?.latestBackup ? report.latestBackup.fileName : 'No backup file generated yet.'}
                          </div>
                          {report?.latestBackup ? (
                            <>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">Size</span>
                                <span className="font-medium text-foreground">{formatCount(report.latestBackup.byteSize)} bytes</span>
                              </div>
                              <Button variant="outline" className="w-full" onClick={() => void handleDownloadLatestBackup()}>
                                <Download className="size-4" />
                                Download latest backup
                              </Button>
                            </>
                          ) : null}
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="border-border/70">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Database className="size-5" />
                          Verification detail
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>{report?.verification.detail ?? 'No verification detail available.'}</p>
                        <p>Use verify to refresh the live table inventory and row counts. Update to latest applies any pending migrations and seeders tracked in the runtime.</p>
                      </CardContent>
                    </Card>
                  </div>
                ),
              },
              {
                label: 'Tables',
                value: 'tables',
                content: (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      <div className="relative min-w-[18rem] flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={searchTerm}
                          onChange={(event) => setSearchTerm(event.target.value)}
                          placeholder="Search tables or categories"
                          className="pl-9"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value as 'all' | DatabaseManagerTable['status'])}
                        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        <option value="all">All statuses</option>
                        <option value="ok">OK</option>
                        <option value="missing">Missing</option>
                        <option value="unexpected">Unexpected</option>
                      </select>
                    </div>

                    <Card className="border-border/70">
                      <CardHeader>
                        <CardTitle className="text-lg">Table comparison</CardTitle>
                        <CardDescription>
                          Every expected CXNext table is compared with the live database. Unexpected tables are listed too so schema drift is visible before maintenance work.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Status</TableHead>
                              <TableHead>Table</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Expected</TableHead>
                              <TableHead>Columns</TableHead>
                              <TableHead>Rows</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredTables.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                                  No tables match the current filters.
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredTables.map((table) => (
                                <TableRow key={table.name}>
                                  <TableCell>
                                    <Badge className={getStatusBadgeClassName(table.status)}>{table.status}</Badge>
                                  </TableCell>
                                  <TableCell className="font-medium text-foreground">{table.name}</TableCell>
                                  <TableCell className="capitalize text-muted-foreground">{table.category}</TableCell>
                                  <TableCell>{table.expected ? 'Yes' : 'No'}</TableCell>
                                  <TableCell>{formatCount(table.columnCount)}</TableCell>
                                  <TableCell>{formatCount(table.rowCount)}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                ),
              },
              {
                label: 'Recovery',
                value: 'recovery',
                content: (
                  <div className="space-y-4">
                    <Card className="border-amber-300/60 bg-amber-50/40 dark:border-amber-700/60 dark:bg-amber-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <ShieldAlert className="size-5" />
                          Maintenance flow
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>Verify is non-destructive and refreshes the live schema report.</p>
                        <p>Update to latest applies pending migrations and seeders only.</p>
                        <p>Backup and download creates a persisted JSON snapshot inside the runtime volume and downloads a copy to your browser.</p>
                        <p>Hard reset drops only the managed CXNext tables and rebuilds them from the current migration list. Unexpected tables are not removed.</p>
                      </CardContent>
                    </Card>

                    <Card className="border-destructive/40">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                          <AlertTriangle className="size-5" />
                          Danger zone
                        </CardTitle>
                        <CardDescription>
                          Use hard reset only when you intentionally need to rebuild the managed schema. Take a backup first.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm text-muted-foreground">
                          Confirmation text required: <span className="font-medium text-foreground">{hardResetConfirmationText}</span>
                        </div>
                        <Button
                          variant="destructive"
                          onClick={() => setResetDialogOpen(true)}
                          disabled={verifying || migrating || backingUp || resetting}
                        >
                          <RotateCcw className="size-4" />
                          Hard reset managed schema
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ),
              },
            ] satisfies AnimatedContentTab[]}
          />
        </CardContent>
      </Card>

      {errorMessage ? (
        <Card className="border-destructive/40">
          <CardContent className="flex items-start gap-3 p-4 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4" />
            <span>{errorMessage}</span>
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={resetDialogOpen} onOpenChange={(open) => {
        setResetDialogOpen(open)
        if (!open) {
          setResetConfirmation('')
        }
      }}>
        <DialogContent className="border-destructive/40">
          <DialogHeader>
            <DialogTitle>Confirm hard reset</DialogTitle>
            <DialogDescription>
              This drops the managed CXNext tables and rebuilds them from the latest migrations and seeders. Unexpected tables stay as they are. Type the confirmation text exactly to continue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-muted-foreground">
              Required confirmation: <span className="font-medium text-foreground">{hardResetConfirmationText}</span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="database-hard-reset-confirmation">Confirmation</Label>
              <Input
                id="database-hard-reset-confirmation"
                value={resetConfirmation}
                onChange={(event) => setResetConfirmation(event.target.value)}
                placeholder={hardResetConfirmationText}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setResetDialogOpen(false)} disabled={resetting}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleHardReset()}
              disabled={resetting || resetConfirmation !== hardResetConfirmationText}
            >
              {resetting ? 'Resetting...' : 'Confirm hard reset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
