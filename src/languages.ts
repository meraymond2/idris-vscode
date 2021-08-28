export type ExtLanguage = "idris" | "lidr" | "markdown"

export const isExtLanguage = (s: string): s is ExtLanguage => ["idris", "lidr", "markdown"].includes(s)
