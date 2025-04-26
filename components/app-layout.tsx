"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import type { FileType, FolderType } from '@/props'

export default function AppLayout() {
    const [navItems, setNavItems] = React.useState<FolderType[]>([]);
    const [currentFile, setCurrentFile] = React.useState<{ folderId: number; file: FileType; } | null>(null);
    const [openFolders, setOpenFolders] = React.useState<Record<number, boolean>>({});
    const currentFolder = currentFile ? navItems.find((f) => f.id === currentFile.folderId) || null : null;


    // handle local storage  

    React.useEffect(() => {
        const savedNavItems = localStorage.getItem('navItems');
        const savedCurrentFile = localStorage.getItem('currentFile');

        if (savedNavItems) {
            setNavItems(JSON.parse(savedNavItems));
        }

        if (savedCurrentFile) {
            setCurrentFile(JSON.parse(savedCurrentFile));
        }
    }, []); // Empty dependency array = runs only once on mount

    // Save navItems to localStorage whenever navItems changes
    React.useEffect(() => {
        localStorage.setItem('navItems', JSON.stringify(navItems));
    }, [navItems]);

    // Save currentFile to localStorage whenever currentFile changes
    React.useEffect(() => {
        localStorage.setItem('currentFile', JSON.stringify(currentFile));
    }, [currentFile]);

    const defaultFile: FileType = {
        id: -1,
        title: "Untitled",
        isEditing: true,
        url: "",
        content: "",
    }

    return (
        <SidebarProvider>
            <AppSidebar navItems={navItems} setNavItems={setNavItems} setCurrentFile={setCurrentFile} openFolders={openFolders} setOpenFolders={setOpenFolders} />
            <SidebarInset className="flex flex-col h-screen">
                <header className="flex sticky top-0 bg-background h-10 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            {currentFolder && (
                                <>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setOpenFolders((prev) => ({
                                                    ...prev,
                                                    [currentFolder.id]: true,
                                                }));
                                            }}
                                        >
                                            {currentFolder.title}
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="hidden md:block" />
                                </>
                            )}
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    {currentFile?.file.title ?? "New Document"}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <main className="flex flex-col flex-1 overflow-y-auto ">
                    <SimpleEditor currentFile={currentFile || { folderId: -1, file: defaultFile }} navItems={navItems} setNavItems={setNavItems} />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
