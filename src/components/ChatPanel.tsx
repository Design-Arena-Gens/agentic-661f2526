import { For, Show, createSignal } from 'solid-js';
import { respond, type ChatMessage } from '../assistant/MockAssistant';
import type { FileNode } from '../types';
import { Send, Lightbulb } from 'lucide-solid';

export default function ChatPanel(props: { contextFile?: FileNode; onCreateFile: (path: string) => void }) {
  const [messages, setMessages] = createSignal<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I can explain files or generate snippets. Try "explain".' }
  ]);
  const [input, setInput] = createSignal('explain this file');
  const [busy, setBusy] = createSignal(false);

  async function send(userText?: string) {
    const content = (userText ?? input()).trim();
    if (!content) return;
    setMessages((m) => [...m, { role: 'user', content }]);
    setInput('');
    setBusy(true);
    const reply = await respond(messages().concat({ role: 'user', content }), props.contextFile);
    setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    setBusy(false);
  }

  function quickExplain() {
    void send('Explain this file');
  }

  function quickStub() {
    void send('generate function stub for utility');
  }

  function parseCreateFromAssistant(text: string) {
    const m = text.match(/create a new file named\s+\"([^\"]+)\"/i);
    if (m) props.onCreateFile(m[1]);
  }

  return (
    <div class="h-full flex flex-col">
      <div class="h-8 flex items-center justify-between px-3 border-b border-white/5 bg-panel">
        <div class="text-sm opacity-80">Assistant</div>
        <div class="flex items-center gap-2">
          <button class="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-xs" onClick={quickExplain}>
            <Lightbulb class="w-3.5 h-3.5 inline -mt-0.5" /> Explain
          </button>
          <button class="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-xs" onClick={quickStub}>
            <Lightbulb class="w-3.5 h-3.5 inline -mt-0.5" /> Stub
          </button>
        </div>
      </div>
      <div class="flex-1 overflow-auto p-3 space-y-3 scrollbar-thin">
        <For each={messages()}>
          {(m) => (
            <div class="rounded-lg p-3" classList={{ 'bg-white/5': m.role === 'assistant', 'bg-accent/10': m.role === 'user' }}>
              <div class="text-xs opacity-70 mb-1">{m.role === 'assistant' ? 'Assistant' : 'You'}</div>
              <div class="whitespace-pre-wrap leading-6 text-sm">{m.content}</div>
              <Show when={m.role === 'assistant'}>
                <div class="mt-2 text-[11px] opacity-60">Tip: Ask me to create a file with "create file path/to/file.ts".</div>
              </Show>
            </div>
          )}
        </For>
        <Show when={busy()}>
          <div class="text-sm opacity-70">Assistant is thinking?</div>
        </Show>
      </div>
      <form
        class="p-2 border-t border-white/5 bg-panel/80 backdrop-blur-sm flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          class="flex-1 bg-white/5 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40"
          placeholder="Ask the assistant?"
          value={input()}
          onInput={(e) => setInput(e.currentTarget.value)}
        />
        <button class="px-3 py-2 rounded-md bg-accent text-white hover:opacity-90 disabled:opacity-50" disabled={busy()} title="Send">
          <Send class="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
