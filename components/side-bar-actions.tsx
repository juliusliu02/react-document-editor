"use client"
import {
    SidebarGroup,
    SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function SideBarActions({
    onAddFolder,
    onAddFile,
}: {
    onAddFolder: () => void;
    onAddFile: () => void;
}) {
    return (
        <form onSubmit={(e) => e.preventDefault()}>
            <SidebarGroup className="py-0">
                <SidebarGroupContent className="relative">
                    <div className="flex justify-center space-x-2">
                        <Button type="button" variant="outline" onClick={onAddFolder}>
                            Add Folder
                        </Button>
                        <Button type="button" variant="outline"  onClick={onAddFile}>
                            Add File
                        </Button>
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        </form>
    );
}