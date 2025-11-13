import { createSignal, createMemo } from 'solid-js';
import type { AnyNode, FileNode, FolderNode, ProjectState } from '../types';

const STORAGE_KEY = 'cc-solid-project';

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function defaultProject(): ProjectState {
  const root: FolderNode = {
    id: generateId(),
    name: 'project',
    kind: 'folder',
    children: [
      {
        id: generateId(),
        name: 'index.html',
        kind: 'file',
        content: `<!doctype html>\n<html>\n  <head>\n    <meta charset=\"utf-8\"/>\n    <title>Playground</title>\n  </head>\n  <body>\n    <h1>Hello from your project</h1>\n  </body>\n</html>`
      },
      {
        id: generateId(),
        name: 'src',
        kind: 'folder',
        children: [
          {
            id: generateId(),
            name: 'main.ts',
            kind: 'file',
            content: `export function greet(name: string) {\n  return \`Hello, ${name}!\`;\n}\n\nconsole.log(greet('World'));\n`
          }
        ]
      },
      {
        id: generateId(),
        name: 'README.md',
        kind: 'file',
        content: '# Welcome\nThis is your in-browser project. Edit files on the left.'
      }
    ]
  };

  return { root, openedFileId: (root.children[0] as FileNode).id };
}

function save(state: ProjectState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load(): ProjectState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultProject();
  try {
    const parsed = JSON.parse(raw) as ProjectState;
    return parsed;
  } catch {
    return defaultProject();
  }
}

function findNodeById(node: AnyNode, id: string): AnyNode | undefined {
  if (node.id === id) return node;
  if (node.kind === 'folder') {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return undefined;
}

function findParentFolder(root: FolderNode, targetId: string): FolderNode | undefined {
  for (const child of root.children) {
    if (child.id === targetId) return root;
    if (child.kind === 'folder') {
      const res = findParentFolder(child, targetId);
      if (res) return res;
    }
  }
  return undefined;
}

export function createProjectStore() {
  const [state, setState] = createSignal<ProjectState>(load());

  const openedFile = createMemo<FileNode | undefined>(() => {
    const s = state();
    if (!s.openedFileId) return undefined;
    const node = findNodeById(s.root, s.openedFileId);
    return node && node.kind === 'file' ? node : undefined;
  });

  function openFile(id: string) {
    setState((s) => ({ ...s, openedFileId: id }));
  }

  function updateFileContent(id: string, content: string) {
    setState((s) => {
      const clone: ProjectState = JSON.parse(JSON.stringify(s));
      const node = findNodeById(clone.root, id);
      if (node && node.kind === 'file') {
        node.content = content;
      }
      save(clone);
      return clone;
    });
  }

  function addFile(parentId: string, name: string): string | undefined {
    setState((s) => {
      const clone: ProjectState = JSON.parse(JSON.stringify(s));
      const parent = findNodeById(clone.root, parentId);
      if (!parent || parent.kind !== 'folder') return s;
      const id = generateId();
      const file: FileNode = { id, name, kind: 'file', content: '' };
      parent.children.push(file);
      clone.openedFileId = id;
      save(clone);
      return clone;
    });
    return state().openedFileId;
  }

  function addFolder(parentId: string, name: string): string | undefined {
    setState((s) => {
      const clone: ProjectState = JSON.parse(JSON.stringify(s));
      const parent = findNodeById(clone.root, parentId);
      if (!parent || parent.kind !== 'folder') return s;
      const id = generateId();
      const folder: FolderNode = { id, name, kind: 'folder', children: [] };
      parent.children.push(folder);
      save(clone);
      return clone;
    });
    return undefined;
  }

  function renameNode(id: string, name: string) {
    setState((s) => {
      const clone: ProjectState = JSON.parse(JSON.stringify(s));
      const node = findNodeById(clone.root, id);
      if (node) node.name = name;
      save(clone);
      return clone;
    });
  }

  function deleteNode(id: string) {
    setState((s) => {
      const clone: ProjectState = JSON.parse(JSON.stringify(s));
      const parent = findParentFolder(clone.root, id);
      if (!parent) return s;
      parent.children = parent.children.filter((c) => c.id !== id);
      if (clone.openedFileId === id) {
        clone.openedFileId = undefined;
      }
      save(clone);
      return clone;
    });
  }

  function reset() {
    const fresh = defaultProject();
    setState(fresh);
    save(fresh);
  }

  return {
    state,
    openedFile,
    openFile,
    updateFileContent,
    addFile,
    addFolder,
    renameNode,
    deleteNode,
    reset,
  };
}
