"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Lightbulb,
  ListChecks,
  LockKeyhole,
  LogOut,
  MessageSquareText,
  RefreshCw,
  Search,
  Sparkles,
  TriangleAlert,
  TrendingUp,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  OPINION_COLORS,
  OPINION_LABELS,
  type Opinion,
  type OpinionType,
} from "@/lib/opinions"
import type {
  ComplaintAnalysis,
  ComplaintPriority,
} from "@/lib/ai-analysis"

const chartConfig = {
  sugerencia: { label: "Sugerencias", color: OPINION_COLORS.sugerencia },
  reconocimiento: {
    label: "Reconocimientos",
    color: OPINION_COLORS.reconocimiento,
  },
  denuncia: { label: "Denuncias", color: OPINION_COLORS.denuncia },
} satisfies ChartConfig

const typeIcons: Record<OpinionType, typeof Lightbulb> = {
  sugerencia: Lightbulb,
  reconocimiento: Award,
  denuncia: TriangleAlert,
}

const priorityLabels: Record<ComplaintPriority, string> = {
  baja: "Prioridad baja",
  media: "Prioridad media",
  alta: "Prioridad alta",
  critica: "Prioridad crítica",
}

const priorityStyles: Record<ComplaintPriority, React.CSSProperties> = {
  baja: { background: "#e7f4eb", color: "#08783f" },
  media: { background: "#fff1db", color: "#9c5700" },
  alta: { background: "#fde9e5", color: "#b63d28" },
  critica: { background: "#b42318", color: "#ffffff" },
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function monthLabel(key: string, style: "short" | "long" = "short") {
  const [year, month] = key.split("-").map(Number)
  return new Intl.DateTimeFormat("es-MX", {
    month: style,
    year: "numeric",
  }).format(new Date(year, month - 1, 1))
}

function TypePill({ type }: { type: OpinionType }) {
  const Icon = typeIcons[type]
  const styles: Record<OpinionType, React.CSSProperties> = {
    sugerencia: { background: "#e7f4eb", color: "#08783f" },
    reconocimiento: { background: "#fff1db", color: "#a75900" },
    denuncia: { background: "#fde9e5", color: "#b63d28" },
  }
  return (
    <span className="type-pill" style={styles[type]}>
      <Icon className="size-3.5" />
      {OPINION_LABELS[type]}
    </span>
  )
}

export default function InternalDashboard() {
  const [opinions, setOpinions] = useState<Opinion[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [needsLogin, setNeedsLogin] = useState(false)
  const [password, setPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [demo, setDemo] = useState(false)
  const [typeFilter, setTypeFilter] = useState<"all" | OpinionType>("all")
  const [period, setPeriod] = useState("12")
  const [selected, setSelected] = useState<Opinion | null>(null)
  const [analyses, setAnalyses] = useState<Record<string, ComplaintAnalysis>>({})
  const [analysisLoading, setAnalysisLoading] = useState<string | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const loadOpinions = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/opinions", { cache: "no-store" })
      if (response.status === 401) {
        setNeedsLogin(true)
        setAuthorized(false)
        return
      }
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "No fue posible cargar los datos.")
      setOpinions(payload.opinions ?? [])
      setDemo(Boolean(payload.demo))
      setAuthorized(true)
      setNeedsLogin(false)
    } catch (error) {
      toast.error("No fue posible cargar el panel", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOpinions()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadOpinions])

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginLoading(true)
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || "No fue posible iniciar sesión.")
      setPassword("")
      await loadOpinions()
    } catch (error) {
      toast.error("Acceso rechazado", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setLoginLoading(false)
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" })
    setAuthorized(false)
    setNeedsLogin(true)
    setOpinions([])
    setAnalyses({})
  }

  function openOpinion(opinion: Opinion) {
    setAnalysisError(null)
    setSelected(opinion)
  }

  async function analyzeSelectedComplaint() {
    if (!selected || selected.type !== "denuncia") return

    const opinionId = selected.id
    setAnalysisLoading(opinionId)
    setAnalysisError(null)
    try {
      const response = await fetch("/api/admin/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opinionId }),
      })
      const payload = await response.json().catch(() => ({}))

      if (response.status === 401) {
        setSelected(null)
        setAuthorized(false)
        setNeedsLogin(true)
        throw new Error("La sesión terminó. Ingresa nuevamente para continuar.")
      }
      if (!response.ok || !payload.analysis) {
        throw new Error(payload.error || "No fue posible generar el análisis.")
      }

      setAnalyses((current) => ({
        ...current,
        [opinionId]: payload.analysis as ComplaintAnalysis,
      }))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No fue posible generar el análisis."
      setAnalysisError(message)
      toast.error("No se pudo analizar la denuncia", { description: message })
    } finally {
      setAnalysisLoading(null)
    }
  }

  const filtered = useMemo(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - Number(period) + 1, 1)
    return opinions.filter((opinion) => {
      const typeMatch = typeFilter === "all" || opinion.type === typeFilter
      const periodMatch = period === "all" || new Date(opinion.created_at) >= start
      return typeMatch && periodMatch
    })
  }, [opinions, typeFilter, period])

  const analytics = useMemo(() => {
    const counts: Record<OpinionType, number> = {
      sugerencia: 0,
      reconocimiento: 0,
      denuncia: 0,
    }
    const months = new Map<
      string,
      { month: string; sugerencia: number; reconocimiento: number; denuncia: number; total: number }
    >()

    filtered.forEach((opinion) => {
      counts[opinion.type] += 1
      const key = monthKey(new Date(opinion.created_at))
      const current = months.get(key) ?? {
        month: key,
        sugerencia: 0,
        reconocimiento: 0,
        denuncia: 0,
        total: 0,
      }
      current[opinion.type] += 1
      current.total += 1
      months.set(key, current)
    })

    const monthly = [...months.values()]
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12)
      .map((item) => ({ ...item, label: monthLabel(item.month) }))
    const peak = [...months.values()].sort((a, b) => b.total - a.total)[0]
    const topType = (Object.entries(counts) as Array<[OpinionType, number]>).sort(
      (a, b) => b[1] - a[1],
    )[0]
    const currentMonth = monthKey(new Date())
    const currentCount = months.get(currentMonth)?.total ?? 0
    const distribution = (Object.entries(counts) as Array<[OpinionType, number]>).map(
      ([name, value]) => ({ name, value, label: OPINION_LABELS[name] }),
    )

    return { monthly, peak, topType, currentCount, distribution }
  }, [filtered])

  if (loading && !authorized && !needsLogin) {
    return (
      <main className="admin-shell grid place-items-center px-5">
        <div className="text-center">
          <RefreshCw className="mx-auto size-7 animate-spin text-[#08783f]" />
          <p className="mt-3 text-sm text-[#64776d]">Preparando el panel…</p>
        </div>
      </main>
    )
  }

  if (needsLogin && !authorized) {
    return (
      <main className="admin-shell grid min-h-screen place-items-center px-5 py-12">
        <div className="panel-card w-full max-w-[430px] overflow-hidden">
          <div className="bg-[#08783f] px-7 pb-8 pt-7 text-white">
            <Link href="/" className="inline-flex items-center gap-1 text-xs font-semibold text-white/75 hover:text-white">
              <ArrowLeft className="size-3.5" /> Volver al buzón
            </Link>
            <div className="mt-8 flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-white/15">
                <LockKeyhole className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-white/65 uppercase">
                  Uso exclusivo
                </p>
                <h1 className="font-display text-2xl font-semibold">Módulo interno</h1>
              </div>
            </div>
          </div>
          <form onSubmit={login} className="space-y-5 p-7">
            <div>
              <h2 className="text-lg font-bold text-[#173126]">Ingresa tu contraseña</h2>
              <p className="mt-1 text-sm leading-6 text-[#6b7d73]">
                Las respuestas sólo están disponibles para el personal autorizado.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Contraseña de acceso</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="h-11 rounded-xl"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loginLoading}
              className="h-11 w-full rounded-xl bg-[#08783f] font-bold hover:bg-[#066833]"
            >
              {loginLoading ? "Verificando…" : "Entrar al panel"}
            </Button>
          </form>
        </div>
      </main>
    )
  }

  const topTypeLabel = analytics.topType?.[1]
    ? OPINION_LABELS[analytics.topType[0]]
    : "Sin datos"

  return (
    <main className="admin-shell">
      <header className="border-b border-[#dce8e1] bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="brand-mark">
              <Image src="/logo-sarfrut.png" alt="SARFRUT" width={52} height={52} unoptimized />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#08783f] uppercase">SARFRUT</p>
              <h1 className="text-sm font-bold text-[#173126] sm:text-base">Panel de opinión</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden text-[#52665b] sm:inline-flex">
              <Link href="/"><ArrowLeft /> Buzón público</Link>
            </Button>
            {!demo && (
              <Button variant="outline" size="sm" onClick={logout} className="rounded-lg">
                <LogOut /> <span className="hidden sm:inline">Cerrar sesión</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1280px] px-5 py-7 sm:px-8 sm:py-9">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold tracking-[0.16em] text-[#08783f] uppercase">Resumen ejecutivo</p>
              {demo && (
                <span className="rounded-full bg-[#fff0d7] px-2.5 py-1 text-[10px] font-bold text-[#9c5700]">
                  DATOS DEMOSTRATIVOS
                </span>
              )}
            </div>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#173126] sm:text-4xl">
              Lo que la gente está diciendo
            </h2>
            <p className="mt-2 text-sm text-[#6b7d73]">
              Indicadores calculados a partir de las opiniones almacenadas.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-10 w-full rounded-xl border-[#cfdcd4] bg-white sm:w-44">
                <CalendarDays className="size-4 text-[#08783f]" />
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Últimos 3 meses</SelectItem>
                <SelectItem value="6">Últimos 6 meses</SelectItem>
                <SelectItem value="12">Últimos 12 meses</SelectItem>
                <SelectItem value="all">Todo el historial</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as "all" | OpinionType)}>
              <SelectTrigger className="h-10 w-full rounded-xl border-[#cfdcd4] bg-white sm:w-48">
                <SelectValue placeholder="Tipo de opinión" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="sugerencia">Sugerencias</SelectItem>
                <SelectItem value="reconocimiento">Reconocimientos</SelectItem>
                <SelectItem value="denuncia">Denuncias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="metric-card" style={{ "--metric-accent": "#08783f" } as React.CSSProperties}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#718078]">Opiniones recibidas</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-[#173126]">{filtered.length}</p>
              </div>
              <div className="grid size-10 place-items-center rounded-xl bg-[#e7f4eb] text-[#08783f]">
                <MessageSquareText className="size-5" />
              </div>
            </div>
            <p className="mt-4 text-xs text-[#809087]">En el periodo seleccionado</p>
          </article>

          <article className="metric-card" style={{ "--metric-accent": "#f49a1a" } as React.CSSProperties}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#718078]">Este mes</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-[#173126]">{analytics.currentCount}</p>
              </div>
              <div className="grid size-10 place-items-center rounded-xl bg-[#fff0d7] text-[#b96500]">
                <CalendarDays className="size-5" />
              </div>
            </div>
            <p className="mt-4 text-xs text-[#809087]">Registros del mes actual</p>
          </article>

          <article className="metric-card" style={{ "--metric-accent": "#5c9d78" } as React.CSSProperties}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#718078]">Tipo predominante</p>
                <p className="mt-2 truncate text-xl font-bold tracking-tight text-[#173126]">{topTypeLabel}</p>
              </div>
              <div className="grid size-10 place-items-center rounded-xl bg-[#edf5f0] text-[#397353]">
                <Sparkles className="size-5" />
              </div>
            </div>
            <p className="mt-4 text-xs text-[#809087]">{analytics.topType?.[1] ?? 0} registros</p>
          </article>

          <article className="metric-card" style={{ "--metric-accent": "#d64c36" } as React.CSSProperties}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#718078]">Mes con mayor actividad</p>
                <p className="mt-2 truncate text-xl font-bold tracking-tight text-[#173126]">
                  {analytics.peak ? monthLabel(analytics.peak.month, "long") : "Sin datos"}
                </p>
              </div>
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fde9e5] text-[#b63d28]">
                <TrendingUp className="size-5" />
              </div>
            </div>
            <p className="mt-4 text-xs text-[#809087]">{analytics.peak?.total ?? 0} opiniones</p>
          </article>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_.75fr]">
          <article className="panel-card p-5 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-[#173126]">Opiniones por mes</h3>
                <p className="mt-1 text-xs text-[#718078]">Tendencia y composición mensual</p>
              </div>
              <div className="flex flex-wrap gap-3 text-[11px] font-semibold text-[#61746a]">
                {(Object.keys(OPINION_LABELS) as OpinionType[]).map((type) => (
                  <span key={type} className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={{ background: OPINION_COLORS[type] }} />
                    {OPINION_LABELS[type]}
                  </span>
                ))}
              </div>
            </div>
            {analytics.monthly.length ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full aspect-auto">
                <BarChart data={analytics.monthly} margin={{ left: -20, right: 6, top: 10 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="sugerencia" stackId="a" fill="var(--color-sugerencia)" radius={[0, 0, 3, 3]} />
                  <Bar dataKey="reconocimiento" stackId="a" fill="var(--color-reconocimiento)" />
                  <Bar dataKey="denuncia" stackId="a" fill="var(--color-denuncia)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="grid h-[300px] place-items-center text-sm text-[#809087]">No hay datos para mostrar.</div>
            )}
          </article>

          <article className="panel-card p-5 sm:p-6">
            <div>
              <h3 className="font-bold text-[#173126]">Distribución</h3>
              <p className="mt-1 text-xs text-[#718078]">Participación por tipo</p>
            </div>
            {filtered.length ? (
              <>
                <ChartContainer config={chartConfig} className="mx-auto mt-2 h-[205px] w-full max-w-[280px] aspect-auto">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
                    <Pie data={analytics.distribution} dataKey="value" nameKey="name" innerRadius={56} outerRadius={83} strokeWidth={5}>
                      {analytics.distribution.map((entry) => (
                        <Cell key={entry.name} fill={OPINION_COLORS[entry.name]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="space-y-3">
                  {analytics.distribution.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2 text-[#52665b]">
                        <span className="size-2.5 rounded-full" style={{ background: OPINION_COLORS[entry.name] }} />
                        {entry.label}
                      </span>
                      <span className="font-bold tabular-nums text-[#173126]">
                        {entry.value} · {filtered.length ? Math.round((entry.value / filtered.length) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="grid h-[300px] place-items-center text-sm text-[#809087]">No hay datos para mostrar.</div>
            )}
          </article>
        </section>

        <section className="panel-card mt-5 overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[#e2ebe5] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h3 className="font-bold text-[#173126]">Respuestas almacenadas</h3>
              <p className="mt-1 text-xs text-[#718078]">Haz clic en una fila para revisar el mensaje completo.</p>
            </div>
            <Button variant="outline" size="sm" onClick={loadOpinions} disabled={loading} className="self-start rounded-lg">
              <RefreshCw className={loading ? "animate-spin" : ""} /> Actualizar
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f8fbf9] hover:bg-[#f8fbf9]">
                <TableHead className="px-5 sm:px-6">Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead className="w-20 pr-5 text-right sm:pr-6">Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((opinion) => (
                <TableRow key={opinion.id} onClick={() => openOpinion(opinion)} className="cursor-pointer">
                  <TableCell className="px-5 text-[#607268] sm:px-6">
                    {new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(opinion.created_at))}
                  </TableCell>
                  <TableCell><TypePill type={opinion.type} /></TableCell>
                  <TableCell className="max-w-[480px] truncate text-[#52665b]">{opinion.message}</TableCell>
                  <TableCell className="pr-5 text-right sm:pr-6">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Ver opinión"
                      onClick={(event) => {
                        event.stopPropagation()
                        openOpinion(opinion)
                      }}
                    >
                      <Eye className="text-[#08783f]" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!filtered.length && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-[#809087]">No hay opiniones para los filtros seleccionados.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border-[#d9e5dd] sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <div className="mb-2"><TypePill type={selected.type} /></div>
                <DialogTitle className="text-xl text-[#173126]">Detalle de la opinión</DialogTitle>
                <DialogDescription>
                  Recibida el {new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeStyle: "short" }).format(new Date(selected.created_at))}
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-xl bg-[#f4f8f5] p-4 text-sm leading-7 text-[#365849]">
                {selected.message}
              </div>
              <p className="flex items-center gap-2 text-xs text-[#718078]">
                <LockKeyhole className="size-3.5 text-[#08783f]" />
                Este registro no contiene campos de identidad del remitente.
              </p>

              {selected.type === "denuncia" && (
                <section className="ai-analysis-panel" aria-live="polite">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-bold text-[#173126]">
                        <Sparkles className="size-4 text-[#08783f]" />
                        Orientación asistida por IA
                      </p>
                      <p className="mt-1 max-w-lg text-xs leading-5 text-[#718078]">
                        Apoyo privado para priorizar la revisión y preparar un plan de atención.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={analyzeSelectedComplaint}
                      disabled={analysisLoading === selected.id}
                      className="shrink-0 rounded-lg bg-[#08783f] hover:bg-[#066833]"
                    >
                      {analysisLoading === selected.id ? (
                        <RefreshCw className="animate-spin" />
                      ) : (
                        <Sparkles />
                      )}
                      {analysisLoading === selected.id
                        ? "Analizando…"
                        : analyses[selected.id]
                          ? "Analizar nuevamente"
                          : "Analizar denuncia"}
                    </Button>
                  </div>

                  {analysisError && (
                    <div className="mt-4 rounded-xl border border-[#f2c8bf] bg-[#fff5f3] p-3 text-xs leading-5 text-[#a53a27]">
                      {analysisError}
                    </div>
                  )}

                  {analysisLoading === selected.id && !analyses[selected.id] && (
                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-white p-4 text-sm text-[#52665b]">
                      <RefreshCw className="size-4 animate-spin text-[#08783f]" />
                      Revisando riesgos y posibles acciones de seguimiento…
                    </div>
                  )}

                  {analyses[selected.id] && (
                    <div className="mt-5 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full px-3 py-1 text-xs font-bold"
                          style={priorityStyles[analyses[selected.id].priority]}
                        >
                          {priorityLabels[analyses[selected.id].priority]}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#52665b]">
                          Información {analyses[selected.id].informationSufficiency}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#52665b]">
                          <Clock3 className="size-3.5 text-[#08783f]" />
                          {analyses[selected.id].timeframe}
                        </span>
                      </div>

                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs font-bold tracking-[0.08em] text-[#08783f] uppercase">
                          Lectura inicial
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#365849]">
                          {analyses[selected.id].summary}
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <AnalysisList
                          icon={TriangleAlert}
                          title="Riesgos a revisar"
                          items={analyses[selected.id].riskCategories}
                        />
                        <AnalysisList
                          icon={CheckCircle2}
                          title="Acciones recomendadas"
                          items={analyses[selected.id].recommendedActions}
                        />
                        <AnalysisList
                          icon={Search}
                          title="Preguntas de investigación"
                          items={analyses[selected.id].investigationQuestions}
                        />
                        <AnalysisList
                          icon={ListChecks}
                          title="Áreas sugeridas"
                          items={analyses[selected.id].responsibleAreas}
                        />
                      </div>

                      {analyses[selected.id].cautions.length > 0 && (
                        <div className="rounded-xl border border-[#f1d4a7] bg-[#fff8ec] p-4">
                          <p className="text-xs font-bold text-[#91510a]">Consideraciones</p>
                          <ul className="mt-2 space-y-1.5 text-xs leading-5 text-[#775329]">
                            {analyses[selected.id].cautions.map((item, index) => (
                              <li key={`${item}-${index}`} className="flex gap-2">
                                <span aria-hidden="true">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <p className="text-[11px] leading-5 text-[#718078]">
                        La IA ofrece orientación preliminar. No verifica los hechos, no determina culpabilidad y no sustituye la investigación interna ni la asesoría legal.
                      </p>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}

function AnalysisList({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof TriangleAlert
  title: string
  items: string[]
}) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="flex items-center gap-2 text-xs font-bold text-[#173126]">
        <Icon className="size-4 text-[#08783f]" />
        {title}
      </p>
      {items.length ? (
        <ul className="mt-3 space-y-2 text-xs leading-5 text-[#52665b]">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="flex gap-2">
              <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-[#f49a1a]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-[#809087]">Sin elementos identificados.</p>
      )}
    </div>
  )
}
