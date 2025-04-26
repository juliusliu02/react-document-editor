"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { SearchForm } from "@/components/search-form";
import { SideBarActions } from "@/components/side-bar-actions";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { VersionSwitcher } from "./version-switcher";
import type { FileType, FolderType } from "@/props";
import { Input } from "@/components/ui/input"


// dnd imports 
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities";

// ---------------------------------------------------------------------------
//  Sortable wrappers --------------------------------------------------------
// ---------------------------------------------------------------------------
interface SortableFolderProps {
  folder: FolderType;
  children: React.ReactNode;
}

function SortableFolder({ folder, children }: SortableFolderProps) {
  const { attributes, listeners, setNodeRef } = useSortable({ id: folder.id, animateLayoutChanges: () => false, });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

interface SortableFileProps {
  file: FileType;
  children: React.ReactNode;
}

function SortableFile({ file, children }: SortableFileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,

  } = useSortable({
    id: file.id,
    // animate *any* layout change, not just same‐list moves
    animateLayoutChanges: () => false,
  });




  return (
    <div ref={setNodeRef}  {...attributes} {...listeners}>
      {children}
    </div>
  );
}
// ---------------------------------------------------------------------------
//  Main component -----------------------------------------------------------
// ---------------------------------------------------------------------------
interface AppSidebarProps {
  navItems: FolderType[];
  setNavItems: React.Dispatch<React.SetStateAction<FolderType[]>>;
  setCurrentFile: React.Dispatch<React.SetStateAction<{ folderId: number; file: FileType } | null>>;
  openFolders: Record<number, boolean>;
  setOpenFolders: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
}

export function AppSidebar({ navItems, setNavItems, setCurrentFile, setOpenFolders, openFolders }: AppSidebarProps) {

  // ---------------- sensors -----------------
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  );

  // ------------- CRUD helpers -------------
  const handleAddFolder = () => {
    // Create a brand-new folder
    const newFolder: FolderType = {
      id: Date.now(),
      title: "Untitled",
      isEditing: true,
      items: [],
    };

    // Add it & auto-open it
    setNavItems(prev => [...prev, newFolder]);
    setOpenFolders(prev => ({ ...prev, [newFolder.id]: true }));

    // Select it for future “Add File” calls
    setSelectedFolderId(newFolder.id);
  };



  const handleAddFile = () => {
    // pick the last-clicked folder, or fall back to the first one
    const targetId = selectedFolderId ?? navItems[0]?.id;
    if (!targetId) return;   // nothing to do if you have zero folders

    handleAddFileToFolder(targetId);
  };


  const handleAddFileToFolder = (folderId: number) => {
    const newFile = {
      id: Date.now(),
      title: "Untitled",
      url: "#",
      isEditing: true,
      content: "",
    };

    setNavItems(prev =>
      prev.map(f =>
        f.id === folderId
          ? { ...f, items: [...f.items, newFile] }
          : f
      )
    );

    // auto-open that folder
    setOpenFolders(prev => ({ ...prev, [folderId]: true }));
  };


  const pendingRename = React.useRef<{ type: "folder"; id: number } | { type: "file"; folderId: number; fileId: number } | null>(null);

  // track selected folder for adding files 
  const [selectedFolderId, setSelectedFolderId] = React.useState<number | null>(null);


  const handleFolderNameChange = (id: number, newTitle: string) => setNavItems(prev => prev.map(f => f.id === id ? { ...f, title: newTitle } : f));
  const handleFileNameChange = (folderId: number, fileId: number, newTitle: string) => setNavItems(prev => prev.map(f => f.id === folderId ? { ...f, items: f.items.map(fl => fl.id === fileId ? { ...fl, title: newTitle } : fl) } : f));
  const stopEditingFolder = (id: number) => setNavItems(prev => prev.map(f => f.id === id ? { ...f, isEditing: false } : f));
  const stopEditingFile = (folderId: number, fileId: number) => setNavItems(prev => prev.map(f => f.id === folderId ? { ...f, items: f.items.map(fl => fl.id === fileId ? { ...fl, isEditing: false } : fl) } : f));
  const startEditingFolder = (id: number) => setNavItems(prev => prev.map(f => f.id === id ? { ...f, isEditing: true } : f));
  const startEditingFile = (folderId: number, fileId: number) => setNavItems(prev => prev.map(f => f.id === folderId ? { ...f, items: f.items.map(fl => fl.id === fileId ? { ...fl, isEditing: true } : fl) } : f));
  const handleDeleteFolder = (id: number) => setNavItems(prev => prev.filter(f => f.id !== id));
  const handleDeleteFile = (folderId: number, fileId: number) => setNavItems(prev => prev.map(f => f.id === folderId ? { ...f, items: f.items.filter(fl => fl.id !== fileId) } : f));

  // ------------- clipboard (copy/paste) -------------
  const [clipboard, setClipboard] = React.useState<| { type: "folder"; item: FolderType } | { type: "file"; folderId: number; item: FileType } | null>(null);
  const handleCopyFolder = (folder: FolderType) => setClipboard({ type: "folder", item: folder });
  const handleCopyFile = (folderId: number, file: FileType) => setClipboard({ type: "file", folderId, item: file });
  const handlePasteFolder = () => {
    if (!clipboard || clipboard.type !== "folder") return;
    const newFolder: FolderType = { ...clipboard.item, id: Date.now(), title: clipboard.item.title + " Copy", isEditing: false, items: clipboard.item.items.map(fl => ({ ...fl, id: Date.now() + Math.random(), title: fl.title + " Copy" })) };
    setNavItems(prev => [...prev, newFolder]);
    setClipboard(null);
  };
  const handlePasteFile = (targetFolderId: number) => {
    if (!clipboard || clipboard.type !== "file") return;
    const newFile: FileType = { ...clipboard.item, id: Date.now(), title: clipboard.item.title + " Copy" };
    setNavItems(prev => prev.map(f => f.id === targetFolderId ? { ...f, items: [...f.items, newFile] } : f));
    setClipboard(null);
  };

  // ------------- drag-end ----------------
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    setNavItems(prev => {
      //Folder-level reordering
      const sourceFolderIdx = prev.findIndex(f => f.id === active.id);
      if (sourceFolderIdx !== -1) {
        const destFolderIdx = prev.findIndex(f => f.id === over.id);
        return arrayMove(prev, sourceFolderIdx, destFolderIdx);
      }

      //File drag: find its source folder
      const fromFolderIdx = prev.findIndex(f =>
        f.items.some(item => item.id === active.id)
      );
      if (fromFolderIdx === -1) return prev;
      const fileToMove = prev[fromFolderIdx].items.find(i => i.id === active.id)!;

      //Dropped onto a folder header? (append)
      const destFolderIdx = prev.findIndex(f => f.id === over.id);
      if (destFolderIdx !== -1) {
        const updated = [...prev];

        // remove from source
        updated[fromFolderIdx] = {
          ...updated[fromFolderIdx],
          items: updated[fromFolderIdx].items.filter(i => i.id !== active.id),
        };
        //append to destination
        updated[destFolderIdx] = {
          ...updated[destFolderIdx],
          items: [...updated[destFolderIdx].items, fileToMove],
        };
        return updated;
      }

      //Dropped onto another file
      const toFolderIdx = prev.findIndex(f =>
        f.items.some(item => item.id === over.id)
      );
      if (toFolderIdx === -1) return prev;

      const fromItems = prev[fromFolderIdx].items.filter(i => i.id !== active.id);
      const toIndex = prev[toFolderIdx].items.findIndex(i => i.id === over.id);

      const updated = [...prev];
      updated[fromFolderIdx] = {
        ...updated[fromFolderIdx],
        items: fromItems,
      };

      // insert into target folder
      const newToItems = [...updated[toFolderIdx].items];
      newToItems.splice(toIndex, 0, fileToMove);
      updated[toFolderIdx] = { ...updated[toFolderIdx], items: newToItems };

      return updated;
    });
  };


  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <Sidebar>
        <SidebarHeader>
          

          <SideBarActions onAddFolder={handleAddFolder} onAddFile={handleAddFile} />
        </SidebarHeader>


        <ContextMenu>
          <ContextMenuTrigger asChild>
            <SidebarContent className="gap-0">
              <SortableContext items={navItems.map(f => f.id)} strategy={verticalListSortingStrategy}>
                {navItems.map(folder => (
                  <SortableFolder key={folder.id} folder={folder}>
                    <Collapsible
                      className="group/collapsible"
                      open={!!openFolders[folder.id]}
                      onOpenChange={o => setOpenFolders(prev => ({ ...prev, [folder.id]: o }))}
                    >
                      <SidebarGroup>
                        <ContextMenu>
                          <ContextMenuTrigger asChild>
                            <SidebarGroupLabel onClick={() => setSelectedFolderId(folder.id)} asChild className={folder.isEditing ? "group/label text-sm text-sidebar-foreground" : "group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}>
                              <CollapsibleTrigger>
                                {folder.isEditing ? (
                                  <Input
                                    autoFocus
                                    onPointerDown={e => e.stopPropagation()}
                                    value={folder.title}
                                    className="flex w-130px"
                                    onChange={e => handleFolderNameChange(folder.id, e.target.value)}
                                    onBlur={() => stopEditingFolder(folder.id)}
                                    onKeyDown={e => e.key === "Enter" && stopEditingFolder(folder.id)}
                                  />
                                ) : (
                                  <>{folder.title}</>
                                )}
                                <ChevronRight className="h-4 w-4 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90 cursor-pointer" />
                              </CollapsibleTrigger>
                            </SidebarGroupLabel>
                          </ContextMenuTrigger>
                          <ContextMenuContent
                            onCloseAutoFocus={e => {
                              e.preventDefault();
                              const p = pendingRename.current;
                              if (p?.type === "folder" && p.id === folder.id) {
                                startEditingFolder(folder.id);
                              }
                              pendingRename.current = null;
                            }}
                          >
                            <ContextMenuItem onSelect={() => handleAddFileToFolder(folder.id)}>New File</ContextMenuItem>
                            <ContextMenuItem onSelect={handleAddFolder}>New Folder</ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem onSelect={() => (pendingRename.current = { type: "folder", id: folder.id })}>Rename</ContextMenuItem>
                            <ContextMenuItem onSelect={() => handleCopyFolder(folder)}>Copy</ContextMenuItem>
                            <ContextMenuItem onSelect={handlePasteFolder}>Paste</ContextMenuItem>
                            <ContextMenuItem
                              onSelect={() => handlePasteFile(folder.id)}
                              disabled={clipboard?.type !== "file"}
                              className={clipboard?.type === "file" ? "" : "opacity-50 pointer-events-none"}
                            >
                              Paste File
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem onSelect={() => handleDeleteFolder(folder.id)} className="text-red-500">Delete</ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>

                        {/* Files list */}
                        <CollapsibleContent>
                          <SidebarGroupContent>
                            <SidebarMenu>
                              <SortableContext items={folder.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                {folder.items.map(file => (
                                  <SortableFile key={file.id} file={file}>
                                    <ContextMenu>
                                      <ContextMenuTrigger asChild>
                                        <SidebarMenuItem>
                                          <SidebarMenuButton asChild className={folder.isEditing ? "hover:bg-transparent hover:text-sidebar-foreground focus:bg-transparent pointer-events-none" : ""}>
                                            {file.isEditing ? (
                                              <Input
                                                autoFocus
                                                onPointerDown={e => e.stopPropagation()}
                                                value={file.title}
                                                onChange={e => handleFileNameChange(folder.id, file.id, e.target.value)}
                                                onBlur={() => stopEditingFile(folder.id, file.id)}
                                                onKeyDown={e => e.key === "Enter" && stopEditingFile(folder.id, file.id)}
                                              />
                                            ) : (
                                              <a href="#" onClick={e => { e.preventDefault(); setCurrentFile({ folderId: folder.id, file }); }}>{file.title}</a>
                                            )}
                                          </SidebarMenuButton>
                                        </SidebarMenuItem>
                                      </ContextMenuTrigger>
                                      <ContextMenuContent
                                        onCloseAutoFocus={e => {
                                          e.preventDefault();
                                          const p = pendingRename.current;
                                          if (
                                            p?.type === "file" &&
                                            p.folderId === folder.id &&
                                            p.fileId === file.id
                                          ) {
                                            // only start editing if "Rename" was the last action
                                            startEditingFile(folder.id, file.id);
                                          }
                                          pendingRename.current = null;
                                        }}>
                                        <ContextMenuItem onSelect={() => handleAddFileToFolder(folder.id)}>New File</ContextMenuItem>
                                        <ContextMenuItem onSelect={handleAddFolder}>New Folder</ContextMenuItem>
                                        <ContextMenuSeparator />
                                        <ContextMenuItem onSelect={() => (pendingRename.current = { type: "file", folderId: folder.id, fileId: file.id })}>Rename</ContextMenuItem>
                                        <ContextMenuItem onSelect={() => handleCopyFile(folder.id, file)}>Copy</ContextMenuItem>
                                        <ContextMenuItem
                                          onSelect={() => handlePasteFile(folder.id)}
                                          disabled={clipboard?.type !== "file"}
                                          className={clipboard?.type === "file" ? "" : "opacity-50 pointer-events-none"}
                                        >
                                          Paste
                                        </ContextMenuItem>
                                        <ContextMenuSeparator />
                                        <ContextMenuItem onSelect={() => handleDeleteFile(folder.id, file.id)} className="text-red-500">Delete File</ContextMenuItem>
                                      </ContextMenuContent>
                                    </ContextMenu>
                                  </SortableFile>
                                ))}
                              </SortableContext>
                            </SidebarMenu>
                          </SidebarGroupContent>
                        </CollapsibleContent>
                      </SidebarGroup>
                    </Collapsible>
                  </SortableFolder>
                ))}
              </SortableContext>
            </SidebarContent>
          </ContextMenuTrigger>

          <ContextMenuContent>
            <ContextMenuItem onSelect={handleAddFolder}>Add Folder</ContextMenuItem>
            <ContextMenuItem onSelect={handleAddFile}>Add File</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <SidebarRail />
      </Sidebar>
    </DndContext >
  );
}
