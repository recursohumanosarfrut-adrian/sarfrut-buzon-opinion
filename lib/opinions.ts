export type OpinionType = "sugerencia" | "reconocimiento" | "denuncia"

export type Opinion = {
  id: string
  type: OpinionType
  message: string
  created_at: string
}

export const OPINION_LABELS: Record<OpinionType, string> = {
  sugerencia: "Sugerencia",
  reconocimiento: "Reconocimiento",
  denuncia: "Denuncia",
}

export const OPINION_COLORS: Record<OpinionType, string> = {
  sugerencia: "#08783f",
  reconocimiento: "#f49a1a",
  denuncia: "#d64c36",
}

export const DEMO_OPINIONS: Opinion[] = [
  {
    id: "demo-01",
    type: "sugerencia",
    message: "Colocar una guía visual más clara para separar correctamente los residuos en el comedor.",
    created_at: "2026-08-25T15:20:00.000Z",
  },
  {
    id: "demo-02",
    type: "reconocimiento",
    message: "La nueva inducción fue clara y ayudó a entender mejor las reglas desde el primer día.",
    created_at: "2026-08-19T17:08:00.000Z",
  },
  {
    id: "demo-03",
    type: "denuncia",
    message: "En el cambio de turno se han presentado comentarios irrespetuosos que necesitan seguimiento.",
    created_at: "2026-08-14T13:45:00.000Z",
  },
  {
    id: "demo-04",
    type: "sugerencia",
    message: "Publicar el menú semanal con un poco más de anticipación ayudaría a planear mejor.",
    created_at: "2026-08-04T19:10:00.000Z",
  },
  {
    id: "demo-05",
    type: "sugerencia",
    message: "Agregar un recordatorio visual de los horarios de transporte para los tres turnos.",
    created_at: "2026-07-28T12:10:00.000Z",
  },
  {
    id: "demo-06",
    type: "reconocimiento",
    message: "El equipo de almacén apoyó muy bien durante el cierre y mantuvo una comunicación ordenada.",
    created_at: "2026-07-16T10:35:00.000Z",
  },
  {
    id: "demo-07",
    type: "sugerencia",
    message: "Sería útil contar con un tablero único para los comunicados importantes de la semana.",
    created_at: "2026-07-08T16:22:00.000Z",
  },
  {
    id: "demo-08",
    type: "denuncia",
    message: "Se requiere revisar una práctica insegura que ocurre al finalizar la limpieza del área.",
    created_at: "2026-06-26T09:05:00.000Z",
  },
  {
    id: "demo-09",
    type: "sugerencia",
    message: "Podrían colocarse más puntos de hidratación cerca de las áreas operativas.",
    created_at: "2026-06-11T20:40:00.000Z",
  },
  {
    id: "demo-10",
    type: "reconocimiento",
    message: "El apoyo de Calidad durante la capacitación resolvió todas las dudas del equipo.",
    created_at: "2026-05-21T14:18:00.000Z",
  },
  {
    id: "demo-11",
    type: "sugerencia",
    message: "Habilitar un espacio breve para compartir mejoras al inicio de turno.",
    created_at: "2026-04-17T11:12:00.000Z",
  },
  {
    id: "demo-12",
    type: "denuncia",
    message: "Hace falta dar seguimiento a una condición del equipo que ya se ha reportado anteriormente.",
    created_at: "2026-03-10T18:55:00.000Z",
  },
  {
    id: "demo-13",
    type: "reconocimiento",
    message: "La atención del comedor ha sido amable y el servicio ha mejorado durante este mes.",
    created_at: "2026-02-23T16:44:00.000Z",
  },
  {
    id: "demo-14",
    type: "sugerencia",
    message: "Compartir las vacantes internas en un formato más visible para todos los turnos.",
    created_at: "2026-01-15T12:30:00.000Z",
  },
]
