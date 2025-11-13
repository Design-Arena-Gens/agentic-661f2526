import { For, Show, createSignal } from 'solid-js';
import type { AnyNode, FileNode, FolderNode } from '../types';
import { FolderPlus, FilePlus, Trash2, Pencil, ChevronRight, ChevronDown, File } from 'lucide-solid';

export default function FileExplorer(props: {
  root: FolderNode;
  openedFileId?: string;
  onOpenFile: (id: string) => void;
  onAddFile: (parentId: string, name: string) => void;
  onAddFolder: (parentId: string, name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div class="h-full overflow-auto scrollbar-thin p-2">
      <TreeNode
        node={props.root}
        depth={0}
        openedFileId={props.openedFileId}
        onOpenFile={props.onOpenFile}
        onAddFile={props.onAddFile}
        onAddFolder={props.onAddFolder}
        onRename={props.onRename}
        onDelete={props.onDelete}
      />
    </div>
  );
}

function TreeNode(props: {
  node: AnyNode;
  depth: number;
  openedFileId?: string;
  onOpenFile: (id: string) => void;
  onAddFile: (parentId: string, name: string) => void;
  onAddFolder: (parentId: string, name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = createSignal(true);
  const [renaming, setRenaming] = createSignal(false);
  const [name, setName] = createSignal(props.node.name);

  const isFile = () => props.node.kind === 'file';

  const commitRename = () => {
    setRenaming(false);
    if (name().trim() && name().trim() !== props.node.name) props.onRename(props.node.id, name().trim());
  };

  return (
    <div>
      <div
        class="flex items-center gap-1 rounded px-1 hover:bg-white/5"
        style={{ 'padding-left': `${props.depth * 12 + 4}px` }}
      >
        <Show when={props.node.kind === 'folder'}>
          <button class="p-1" onClick={() => setExpanded((e) => !e)}>
            {expanded() ? <ChevronDown class="w-4 h-4" /> : <ChevronRight class="w-4 h-4" />}
          </button>
        </Show>
        <Show when={!renaming()} fallback={
          <input
            class="bg-transparent border border-white/10 rounded px-1 text-sm w-full"
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
            onBlur={commitRename}
            onKeyDown={(e) => e.key === 'Enter' && commitRename()}
            autofocus
          />
        }>
          <button
            class="flex-1 text-left py-1 text-sm truncate"
            classList={{ 'text-accent': isFile() && props.node.id === props.openedFileId }}
            onClick={() => (isFile() ? props.onOpenFile(props.node.id) : setExpanded((e) => !e))}
            title={props.node.name}
          >
            <span class="inline-flex items-center gap-1">
              {isFile() ? <File class="w-4 h-4" /> : null}
              {props.node.name}
            </span>
          </button>
        </Show>
        <div class="flex items-center gap-1 opacity-80">
          <button class="p-1 hover:bg-white/10 rounded" onClick={() => setRenaming(true)} title="Rename">
            <Pencil class="w-4 h-4" />
          </button>
          <button class="p-1 hover:bg-white/10 rounded" onClick={() => props.onDelete(props.node.id)} title="Delete">
            <Trash2 class="w-4 h-4" />
          </button>
          <Show when={props.node.kind === 'folder'}>
            <button
              class="p-1 hover:bg-white/10 rounded"
              onClick={() => {
                const name = prompt('New file name');
                if (name) props.onAddFile(props.node.id, name);
              }}
              title="New file"
            >
              <FilePlus class="w-4 h-4" />
            </button>
            <button
              class="p-1 hover:bg-white/10 rounded"
              onClick={() => {
                const name = prompt('New folder name');
                if (name) props.onAddFolder(props.node.id, name);
              }}
              title="New folder"
            >
              <FolderPlus class="w-4 h-4" />
            </button>
          </Show>
        </div>
      </div>
      <Show when={props.node.kind === 'folder' && expanded()}>
        <div class="mt-1">
          <For each={(props.node as FolderNode).children}>
            {(child) => (
              <TreeNode
                node={child}
                depth={props.depth + 1}
                openedFileId={props.openedFileId}
                onOpenFile={props.onOpenFile}
                onAddFile={props.onAddFile}
                onAddFolder={props.onAddFolder}
                onRename={props.onRename}
                onDelete={props.onDelete}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
