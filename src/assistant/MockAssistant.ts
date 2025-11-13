import type { FileNode } from '../types';

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function respond(messages: ChatMessage[], contextFile?: FileNode): Promise<string> {
  const last = messages[messages.length - 1]?.content ?? '';
  const lowered = last.toLowerCase();

  if (lowered.includes('explain') || lowered.includes('what does') || lowered.includes('help me understand')) {
    if (contextFile) {
      const summary = summarizeFile(contextFile);
      return `Here is a concise explanation of ${contextFile.name}:\n\n${summary}\n\nYou can ask me to refactor or add tests.`;
    }
    return 'Tell me which file to explain, or open one in the editor.';
  }

  if (lowered.startsWith('generate function') || lowered.includes('stub function')) {
    return `Here's a TypeScript function template you can paste into your file:\n\nfunction example(name: string): string {\n  if (!name) throw new Error('name is required');\n  return \`Hello, \${name}!\`;\n}`;
  }

  if (lowered.startsWith('create file ')) {
    const name = last.split('create file ')[1]?.trim();
    if (!name) return 'Provide a file name, e.g., "create file utils/math.ts"';
    return `Ok, create a new file named "${name}" in the selected folder.`;
  }

  // playful default
  const echo = last.length > 280 ? last.slice(0, 280) + '?' : last;
  await sleep(250);
  return `I heard: ?${echo}?.\nTry commands like: "explain", "generate function", or "create file path".`;
}

function summarizeFile(file: FileNode): string {
  const lines = file.content.split(/\r?\n/);
  const numLines = lines.length;
  const functions = (file.content.match(/function\s+([a-zA-Z0-9_]+)/g) ?? []).map((m) => m.replace('function ', ''));
  const exports = (file.content.match(/export\s+(?:function|const|class|interface)\s+([a-zA-Z0-9_]+)/g) ?? [])
    .map((m) => m.replace(/export\s+(?:function|const|class|interface)\s+/, ''));
  const hasTypes = /:\s*[A-Z]/.test(file.content) || /interface\s+/.test(file.content) || /type\s+/.test(file.content);

  let summary = `- Lines: ${numLines}`;
  if (functions.length) summary += `\n- Functions: ${functions.join(', ')}`;
  if (exports.length) summary += `\n- Exports: ${exports.join(', ')}`;
  if (hasTypes) summary += `\n- Uses TypeScript types`;

  return summary;
}
