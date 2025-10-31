"use client";

import React, { useState } from "react";
import { useAppContext } from "@/app/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import type { Snippet, SnippetCategory } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Copy, Edit, Plus, Trash2, GripVertical, FileText } from "lucide-react";

function SnippetForm({
  snippet,
  onSave,
  onClose,
}: {
  snippet?: Snippet;
  onSave: (data: Omit<Snippet, "id"> | Snippet) => void;
  onClose: () => void;
}) {
  const { categories } = useAppContext();
  const [name, setName] = useState(snippet?.name || "");
  const [content, setContent] = useState(snippet?.content || "");
  const [categoryId, setCategoryId] = useState(snippet?.categoryId || categories[0]?.id || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim() || !categoryId) return;
    onSave(snippet ? { ...snippet, name, content, categoryId } : { name, content, categoryId });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="snippet-name">Name</Label>
        <Input id="snippet-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., React Component" required />
      </div>
      <div>
        <Label htmlFor="snippet-category">Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger id="snippet-category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="snippet-content">Content</Label>
        <Textarea id="snippet-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="const MyComponent = () => <div>Hello</div>;" required className="font-code min-h-[150px]" />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Snippet</Button>
      </DialogFooter>
    </form>
  );
}

function SnippetItem({ snippet }: { snippet: Snippet }) {
  const { deleteSnippet, updateSnippet } = useAppContext();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.content);
    toast({ title: "Snippet copied to clipboard!" });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group relative flex items-start gap-2 rounded-lg p-3 transition-colors hover:bg-accent"
    >
      <FileText className="h-5 w-5 flex-shrink-0 text-muted-foreground mt-1" />
      <div className="flex-1">
        <p className="font-semibold">{snippet.name}</p>
        <pre className="font-code mt-1 text-xs text-muted-foreground bg-background rounded-sm p-2 max-h-24 overflow-auto">{snippet.content}</pre>
      </div>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-4 w-4" /></Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Snippet</DialogTitle></DialogHeader>
            <SnippetForm snippet={snippet} onSave={updateSnippet} onClose={() => setIsEditDialogOpen(false)} />
          </DialogContent>
        </Dialog>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}><Copy className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteSnippet(snippet.id)}><Trash2 className="h-4 w-4" /></Button>
      </div>
    </motion.div>
  );
}

export function SnippetManager() {
  const { categories, getSnippetsForCategory, searchTerm, addSnippet } = useAppContext();
  const [isAddSnippetOpen, setIsAddSnippetOpen] = useState(false);
  const filteredCategories = categories.map(category => ({
    ...category,
    snippets: getSnippetsForCategory(category.id).filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.content.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(category => searchTerm === "" || category.snippets.length > 0);

  const totalSnippets = categories.reduce((acc, cat) => acc + getSnippetsForCategory(cat.id).length, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-headline font-bold">Snippet Library</h2>
        <Dialog open={isAddSnippetOpen} onOpenChange={setIsAddSnippetOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Snippet</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Snippet</DialogTitle>
              <DialogDescription>Save a new snippet for quick access.</DialogDescription>
            </DialogHeader>
            <SnippetForm onSave={addSnippet} onClose={() => setIsAddSnippetOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {totalSnippets > 0 ? (
        <Accordion type="multiple" defaultValue={categories.map(c => c.id)} className="w-full">
          <AnimatePresence>
            {filteredCategories.map(({ id, name, snippets }) => (
              <motion.div key={id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AccordionItem value={id} className="border-b-0">
                  <AccordionTrigger className="border-b hover:no-underline rounded-lg px-4 data-[state=open]:bg-accent/50 data-[state=open]:border-b-0">
                    <div className="flex items-center gap-2">
                       <h3 className="font-semibold">{name}</h3>
                       <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{snippets.length}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="space-y-1">
                      <AnimatePresence>
                         {snippets.map(snippet => <SnippetItem key={snippet.id} snippet={snippet} />)}
                      </AnimatePresence>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </Accordion>
      ) : (
         <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted/50 text-center h-48">
            <p className="text-muted-foreground">
              {searchTerm ? "No snippets match your search." : "You have no snippets."}
            </p>
            <p className="text-sm text-muted-foreground/70">
              {searchTerm ? "Try a different search term." : "Click 'Add Snippet' to create one."}
            </p>
          </div>
      )}
    </div>
  );
}
