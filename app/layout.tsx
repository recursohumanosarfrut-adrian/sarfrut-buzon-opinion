import type { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "Buzón de Opinión SARFRUT",
  description:
    "Canal anónimo para compartir sugerencias, reconocimientos y denuncias en SARFRUT.",
  icons: {
    icon: "/logo-sarfrut.png",
    shortcut: "/logo-sarfrut.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
