"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Award,
  Check,
  ChevronRight,
  Lightbulb,
  LockKeyhole,
  MessageCircleMore,
  Send,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import type { OpinionType } from "@/lib/opinions"

const choices: Array<{
  value: OpinionType
  label: string
  description: string
  icon: typeof Lightbulb
}> = [
  {
    value: "sugerencia",
    label: "Sugerencia",
    description: "Una idea para mejorar",
    icon: Lightbulb,
  },
  {
    value: "reconocimiento",
    label: "Reconocimiento",
    description: "Algo que vale la pena destacar",
    icon: Award,
  },
  {
    value: "denuncia",
    label: "Denuncia",
    description: "Una situación que debe revisarse",
    icon: TriangleAlert,
  },
]

const guideCopy: Record<OpinionType, string> = {
  sugerencia:
    "Cuéntanos qué podríamos hacer mejor. Entre más concreta sea tu idea, más fácil será convertirla en una acción.",
  reconocimiento:
    "También queremos saber qué está funcionando bien. Describe la acción o situación que te gustaría reconocer.",
  denuncia:
    "Describe los hechos con claridad: qué ocurrió, dónde y aproximadamente cuándo. No necesitas identificarte.",
}

export default function Home() {
  const [type, setType] = useState<OpinionType>("sugerencia")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [configured, setConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    fetch("/api/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setConfigured(Boolean(data.configured)))
      .catch(() => setConfigured(null))
  }, [])

  const remaining = 2000 - message.length
  const activeChoice = useMemo(
    () => choices.find((choice) => choice.value === type) ?? choices[0],
    [type],
  )

  async function submitOpinion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (message.trim().length < 15) {
      toast.error("Cuéntanos un poco más", {
        description: "Tu mensaje debe tener al menos 15 caracteres.",
      })
      return
    }

    setSending(true)
    try {
      const response = await fetch("/api/opinions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message, website: "" }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (payload.code === "not_configured") {
          throw new Error(
            "La conexión de almacenamiento aún no está activa. Este mensaje no se guardó.",
          )
        }
        throw new Error(payload.error || "No pudimos registrar tu opinión.")
      }

      setSent(true)
      setMessage("")
      toast.success("Opinión registrada")
    } catch (error) {
      toast.error("No fue posible enviar el mensaje", {
        description:
          error instanceof Error
            ? error.message
            : "Inténtalo nuevamente en unos momentos.",
      })
    } finally {
      setSending(false)
    }
  }

  function resetForm() {
    setSent(false)
    setType("sugerencia")
    setMessage("")
  }

  return (
    <main className="public-shell min-h-screen overflow-hidden">
      <header className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="brand-mark">
            <Image src="/logo-sarfrut.png" alt="SARFRUT" width={52} height={52} unoptimized />
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] text-[#08783f] uppercase">
              SARFRUT
            </p>
            <p className="text-sm font-semibold text-[#183226]">
              Buzón de opinión
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[#d8e8df] bg-white/80 px-3 py-2 text-xs font-medium text-[#365849] shadow-sm backdrop-blur">
          <ShieldCheck className="size-4 text-[#08783f]" />
          <span className="hidden sm:inline">Participación anónima</span>
          <span className="sm:hidden">Anónimo</span>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-[1180px] gap-7 px-5 pb-10 pt-2 sm:px-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(330px,.88fr)] lg:px-10 lg:pb-16 lg:pt-5">
        <div className="relative z-10">
          <div className="mb-6 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#fff0d7] px-3 py-1.5 text-xs font-bold text-[#a85800]">
              <MessageCircleMore className="size-3.5" />
              Tu voz también mejora nuestro trabajo
            </div>
            <h1 className="font-display text-[clamp(2.35rem,6vw,4.7rem)] leading-[.98] font-semibold tracking-[-0.055em] text-[#102a1e]">
              Queremos saber
              <span className="block text-[#08783f]">qué piensas.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#52665b] sm:text-lg">
              Comparte una sugerencia, reconoce algo positivo o reporta una
              situación que debamos atender. El formulario no solicita datos
              personales.
            </p>
          </div>

          <div className="form-card">
            {configured === false && (
              <div className="demo-banner" role="status">
                Vista de demostración · falta conectar Supabase para guardar
                respuestas.
              </div>
            )}

            {sent ? (
              <div className="flex min-h-[470px] flex-col items-center justify-center px-6 py-12 text-center sm:px-12">
                <div className="success-orbit">
                  <Check className="size-9" strokeWidth={2.5} />
                </div>
                <p className="mt-7 text-xs font-bold tracking-[0.18em] text-[#08783f] uppercase">
                  Mensaje recibido
                </p>
                <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#173126]">
                  Gracias por alzar la voz
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#607268]">
                  Tu opinión fue registrada sin pedir información que te
                  identifique y será revisada por el equipo responsable.
                </p>
                <Button
                  type="button"
                  onClick={resetForm}
                  className="mt-8 h-11 rounded-xl bg-[#08783f] px-6 hover:bg-[#066833]"
                >
                  Registrar otra opinión
                </Button>
              </div>
            ) : (
              <form onSubmit={submitOpinion} className="space-y-7 p-5 sm:p-8">
                <div>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="step-label">Paso 1 de 2</p>
                      <h2 className="mt-1 text-lg font-bold text-[#173126]">
                        ¿Qué deseas compartir?
                      </h2>
                    </div>
                    <span className="hidden text-xs font-medium text-[#809087] sm:block">
                      Elige una opción
                    </span>
                  </div>

                  <RadioGroup
                    value={type}
                    onValueChange={(value) => setType(value as OpinionType)}
                    className="grid gap-3 sm:grid-cols-3"
                    aria-label="Tipo de opinión"
                  >
                    {choices.map((choice) => {
                      const Icon = choice.icon
                      const selected = type === choice.value
                      return (
                        <Label
                          key={choice.value}
                          htmlFor={choice.value}
                          className={`choice-card ${selected ? "choice-card-active" : ""}`}
                        >
                          <RadioGroupItem
                            id={choice.value}
                            value={choice.value}
                            className="sr-only"
                          />
                          <span className="choice-icon">
                            <Icon className="size-5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-bold text-[#173126]">
                              {choice.label}
                            </span>
                            <span className="mt-1 block text-xs leading-4 font-normal text-[#718078]">
                              {choice.description}
                            </span>
                          </span>
                        </Label>
                      )
                    })}
                  </RadioGroup>
                </div>

                <div>
                  <div className="mb-3 flex items-end justify-between gap-4">
                    <div>
                      <p className="step-label">Paso 2 de 2</p>
                      <Label
                        htmlFor="opinion-message"
                        className="mt-1 text-lg font-bold text-[#173126]"
                      >
                        Escribe tu opinión
                      </Label>
                    </div>
                    <span
                      className={`text-xs tabular-nums ${remaining < 100 ? "text-[#b54b28]" : "text-[#809087]"}`}
                    >
                      {remaining} caracteres
                    </span>
                  </div>
                  <Textarea
                    id="opinion-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    maxLength={2000}
                    placeholder="Describe aquí tu idea, reconocimiento o situación…"
                    className="min-h-40 resize-y rounded-2xl border-[#cddbd3] bg-[#fbfdfb] px-4 py-4 text-[15px] leading-6 shadow-none focus-visible:border-[#0a8647] focus-visible:ring-[#0a8647]/15"
                    required
                  />
                  <input
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute -left-[9999px]"
                  />
                </div>

                <div className="flex flex-col gap-4 border-t border-[#e6eee9] pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex max-w-sm items-start gap-2.5 text-xs leading-5 text-[#64776d]">
                    <LockKeyhole className="mt-0.5 size-4 shrink-0 text-[#08783f]" />
                    <span>
                      No solicitamos nombre, correo ni número de empleado.
                    </span>
                  </div>
                  <Button
                    type="submit"
                    disabled={sending || message.trim().length < 15}
                    className="h-12 rounded-xl bg-[#08783f] px-6 text-sm font-bold shadow-[0_10px_25px_rgba(8,120,63,.18)] hover:bg-[#066833] sm:min-w-44"
                  >
                    {sending ? "Enviando…" : "Enviar opinión"}
                    {!sending && <Send className="size-4" />}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        <aside className="guide-panel" aria-label="Guía de uso">
          <div className="guide-glow guide-glow-one" />
          <div className="guide-glow guide-glow-two" />
          <div className="relative z-10 max-w-[330px] p-6 sm:p-8 lg:max-w-none">
            <p className="text-xs font-bold tracking-[0.18em] text-white/70 uppercase">
              Estoy para orientarte
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Hola, soy tu guía.
            </h2>
            <div className="guide-bubble mt-5" key={type}>
              <activeChoice.icon className="mb-3 size-5 text-[#f49a1a]" />
              <p className="text-sm leading-6 text-[#294638]">
                {guideCopy[type]}
              </p>
            </div>
          </div>
          <Image
            src="/guia-sarfrut.png"
            alt="Personaje guía de SARFRUT"
            width={934}
            height={1685}
            unoptimized
            className="guide-character"
          />
          <div className="guide-steps">
            <span>1 · Elige</span>
            <ChevronRight className="size-3.5" />
            <span>2 · Escribe</span>
            <ChevronRight className="size-3.5" />
            <span>3 · Envía</span>
          </div>
        </aside>
      </section>

      <footer className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 border-t border-[#dce8e1] px-5 py-6 text-xs text-[#6d7c74] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <p>Procedimiento principal RH.0005 · Uso interno SARFRUT</p>
        <Link
          href="/interno"
          className="inline-flex items-center gap-1 font-semibold text-[#08783f] transition-colors hover:text-[#f49a1a]"
        >
          Acceso al módulo interno <ChevronRight className="size-3.5" />
        </Link>
      </footer>
    </main>
  )
}
