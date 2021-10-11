import * as vscode from 'vscode';

export async function loadIpkgFile(uri: vscode.Uri): Promise<string> {
  const readData = await vscode.workspace.fs.readFile(uri)
  const data = Buffer.from(readData).toString('utf8')
  return data
}

export function extractPkgs(fileContents: string): string[] {
  const pkgsMatches = fileContents.match(/pkgs\s*=\s*(([a-zA-Z/0-9., -_]+\s{0,1})*)/)
  const pkgs = pkgsMatches ? pkgsMatches[1].split(',').map((s: string) => s.trim()) : []
  return pkgs
}
