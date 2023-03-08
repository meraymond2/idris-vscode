export type ExtLanguage = "idris2" | "idris" | "lidr" | "markdown"

export const isExtLanguage = (s: string): s is ExtLanguage => ["idris2", "idris", "lidr", "markdown"].includes(s)
