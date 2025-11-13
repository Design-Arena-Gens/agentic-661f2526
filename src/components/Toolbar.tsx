import { Accessor, Setter } from 'solid-js';
import { Sun, Moon, RefreshCw } from 'lucide-solid';

export default function Toolbar(props: { theme: Accessor<'dark' | 'light'>; setTheme: Setter<'dark' | 'light'>; onReset: () => void }) {
  const toggleTheme = () => {
    const next = props.theme() === 'dark' ? 'light' : 'dark';
    props.setTheme(next);
    if (next === 'light') document.body.classList.add('light');
    else document.body.classList.remove('light');
  };

  return (
    <div class="h-12 flex items-center justify-between px-3 border-b border-white/5 bg-panel/60 backdrop-blur-sm">
      <div class="font-semibold tracking-wide">Claude Code</div>
      <div class="flex items-center gap-2">
        <button class="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-sm" onClick={props.onReset} title="Reset project">
          <RefreshCw class="w-4 h-4 inline -mt-0.5" /> Reset
        </button>
        <button class="p-2 rounded-md bg-white/5 hover:bg-white/10" onClick={toggleTheme} title="Toggle theme">
          {props.theme() === 'dark' ? <Sun class="w-4 h-4" /> : <Moon class="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
