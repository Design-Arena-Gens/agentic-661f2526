export type FileKind = 'file' | 'folder';

export interface BaseNode {
  id: string;
  name: string;
  kind: FileKind;
}

export interface FileNode extends BaseNode {
  kind: 'file';
  content: string;
}

export interface FolderNode extends BaseNode {
  kind: 'folder';
  children: Array<FileNode | FolderNode>;
}

export type AnyNode = FileNode | FolderNode;

export interface ProjectState {
  root: FolderNode;
  openedFileId?: string;
}
