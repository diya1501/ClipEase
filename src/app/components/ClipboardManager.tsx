"use client";

import { AppProvider, useAppContext } from "@/app/context/AppContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ClipboardList, FileText, Bot, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { ClipboardHistory as ClipboardHistoryTab } from "./ClipboardHistory";
import { SnippetManager } from "./SnippetManager";
import { AISuggestions } from "./AISuggestions";
import { Logo } from "./Logo";

function MainLayout() {
  const { searchTerm, setSearchTerm } = useAppContext();

  return (
    <div className="container mx-auto flex min-h-screen flex-col p-4 md:p-8">
      <header className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
        <Logo />
        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search history & snippets..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1">
        <Tabs defaultValue="history" className="h-full">
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="history">
                <ClipboardList className="mr-2 h-4 w-4" /> History
              </TabsTrigger>
              <TabsTrigger value="snippets">
                <FileText className="mr-2 h-4 w-4" /> Snippets
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Bot className="mr-2 h-4 w-4" /> AI Suggestions
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="history" className="mt-4">
            <ClipboardHistoryTab />
          </TabsContent>
          <TabsContent value="snippets" className="mt-4">
            <SnippetManager />
          </TabsContent>
          <TabsContent value="ai" className="mt-4">
            <AISuggestions />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export function ClipboardManager() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
