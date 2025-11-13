import { createEffect, createMemo, onCleanup, onMount } from 'solid-js';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import type { FileNode } from '../types';
import { guessLanguage } from '../utils/language';

export default function EditorPanel(props: { file?: FileNode; onChange: (content: string) => void }) {
  let container!: HTMLDivElement;
  let view: EditorView | undefined;

  const extensions = createMemo(() => {
    const ext = [
      history(),
      keymap.of([indentWithTab, ...defaultKeymap]),
      EditorView.lineWrapping,
      highlightActiveLine(),
      EditorView.theme({
        '&': { height: '100%', backgroundColor: 'transparent' },
        '.cm-content': { caretColor: '#7c9eff' },
        '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: '13px' },
        '&.cm-editor': { color: 'var(--fg)', backgroundColor: 'transparent' },
        '.cm-gutters': { backgroundColor: 'transparent', color: 'var(--muted)', border: 'none' },
        '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.04)' },
        '.cm-selectionBackground, .cm-content ::selection': { backgroundColor: 'rgba(124,158,255,0.25)' },
        '.cm-cursor': { borderLeftColor: '#7c9eff' }
      })
    ];
    switch (guessLanguage(props.file?.name || '')) {
      case 'ts':
      case 'js':
        ext.push(javascript({ jsx: true, typescript: true }));
        break;
      case 'json':
        ext.push(json());
        break;
      case 'html':
        ext.push(html());
        break;
      case 'css':
        ext.push(css());
        break;
    }
    return ext;
  });

  onMount(() => {
    const state = EditorState.create({
      doc: props.file?.content ?? '',
      extensions: [
        ...extensions(),
        EditorView.updateListener.of((vu) => {
          if (vu.docChanged && props.file) {
            const content = vu.state.doc.toString();
            props.onChange(content);
          }
        })
      ]
    });
    view = new EditorView({ state, parent: container });
  });

  createEffect(() => {
    // When file changes (open different file), swap doc
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    const nextDoc = props.file?.content ?? '';
    if (currentDoc !== nextDoc) {
      view.setState(
        EditorState.create({
          doc: nextDoc,
          extensions: [
            ...extensions(),
            EditorView.updateListener.of((vu) => {
              if (vu.docChanged && props.file) {
                props.onChange(vu.state.doc.toString());
              }
            })
          ]
        })
      );
    }
  });

  onCleanup(() => {
    view?.destroy();
    view = undefined;
  });

  return (
    <div class="h-full">
      <div class="h-8 flex items-center justify-between px-3 border-b border-white/5 bg-panel">
        <div class="text-sm opacity-80 truncate">{props.file ? props.file.name : 'No file selected'}</div>
      </div>
      <div class="h-[calc(100%-2rem)]">
        <div ref={container} class="h-full" />
      </div>
    </div>
  );
}
