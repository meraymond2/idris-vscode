const filenameRegex = /.*:\d+:\d+--\d+:\d+\n(.|\n)*?(\n\n|\n$)/
const parseLineRegex = /Parse error at line \d+:\d+:\n/

const rmFileSec = (warning: string) => warning.replace(filenameRegex, "")

const rmParseLine = (warning: string) => warning.replace(parseLineRegex, "")

export const rmLocDesc = (warning: string) => rmFileSec(rmParseLine(warning)).trim()
