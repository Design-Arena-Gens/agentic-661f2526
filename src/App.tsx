import { createSignal, Show } from 'solid-js';
import Toolbar from './components/Toolbar';
import FileExplorer from './components/FileExplorer';
import EditorPanel from './components/EditorPanel';
import ChatPanel from './components/ChatPanel';
import { createProjectStore } from './store/fs';

export default function App() {
  const { state, openedFile, openFile, addFile, addFolder, renameNode, deleteNode, updateFileContent, reset } = createProjectStore();
  const [theme, setTheme] = createSignal<'dark' | 'light'>('dark');

  return (
    <div class="h-full flex flex-col">
      <Toolbar theme={theme} setTheme={setTheme} onReset={reset} />
      <div class="flex-1 grid" style={{ 'grid-template-columns': '260px 1fr 360px' }}>
        <aside class="border-r border-white/5 bg-panel">
          <FileExplorer
            root={state().root}
            openedFileId={state().openedFileId}
            onOpenFile={openFile}
            onAddFile={(parentId, name) => void addFile(parentId, name)}
            onAddFolder={(parentId, name) => void addFolder(parentId, name)}
            onRename={renameNode}
            onDelete={deleteNode}
          />
        </aside>
        <main class="bg-background">
          <EditorPanel file={openedFile()} onChange={(content) => openedFile() && updateFileContent(openedFile()!.id, content)} />
        </main>
        <aside class="border-l border-white/5 bg-panel">
          <ChatPanel
            contextFile={openedFile()}
            onCreateFile={(path) => {
              // create file inside root for simplicity
              void addFile(state().root.id, path);
            }}
          />
        </aside>
      </div>
    </div>
  );
}
