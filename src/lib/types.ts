export type ClipboardItem = {
  id: string;
  type: 'text';
  content: string;
  createdAt: number;
  isPinned: boolean;
};

export type Snippet = {
  id:string;
  name: string;
  content: string;
  categoryId: string;
};

export type SnippetCategory = {
  id: string;
  name: string;
};

export type AppTheme = "light" | "dark" | "system";
