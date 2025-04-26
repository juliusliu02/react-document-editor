"use client";
import * as React from "react";
import { ChevronsUpDown, GalleryVerticalEnd, Plus, Check } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export interface DocSet {
  id: string;          // unique id for the doc group (folder collection)
  name: string;        // label shown to the user
}

interface DocSetSwitcherProps {
  docSets: DocSet[];                     // all existing document groups
  currentDocSetId: string;               // id of the active one
  onSelectDocSet: (id: string) => void;  // update active group
  onCreateDocSet: () => void;            // create a completely new group
}

export function VersionSwitcher({
  docSets,
  currentDocSetId,
  onSelectDocSet,
  onCreateDocSet,
}: DocSetSwitcherProps) {
  const current = docSets.find((d) => d.id === currentDocSetId);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {/* square icon */}
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <GalleryVerticalEnd className="size-4" />
              </div>

              {/* name of the current doc-set */}
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">Documentation</span>
                <span>{current?.name ?? "Untitled"}</span>
              </div>

              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start">
            {/* pick among existing sets */}
            {docSets.map((d) => (
              <DropdownMenuItem
                key={d.id}
                onSelect={() => onSelectDocSet(d.id)}
              >
                {d.name}
                {d.id === currentDocSetId && <Check className="ml-auto" />}
              </DropdownMenuItem>
            ))}

            {/* divider */}
            <div className="my-1 h-px bg-muted" />

            {/* create brand-new set */}
            <DropdownMenuItem onSelect={onCreateDocSet}>
              <Plus className="mr-2 size-4" />
              New document set
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
