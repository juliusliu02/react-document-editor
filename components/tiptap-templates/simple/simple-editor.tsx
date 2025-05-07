"use client"

import * as React from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem } from "@tiptap/extension-task-item"
import { TaskList } from "@tiptap/extension-task-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Underline } from "@tiptap/extension-underline"

// --- Custom Extensions ---
import { Link } from "@/components/tiptap-extension/link-extension"
import { Selection } from "@/components/tiptap-extension/selection-extension"
import { TrailingNode } from "@/components/tiptap-extension/trailing-node-extension"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { NodeButton } from "@/components/tiptap-ui/node-button"
import {
  HighlightPopover,
  HighlightContent,
  HighlighterButton,
} from "@/components/tiptap-ui/highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useMobile } from "@/hooks/use-mobile"
import { useWindowSize } from "@/hooks/use-window-size"

// --- Components ---
import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"

/* import props  */
import type { FileType, FolderType } from '@/props'

// import styles for syntax highlighting 

import 'highlight.js/styles/atom-one-dark.css'

import { createLowlight } from 'lowlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'

import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import bash from 'highlight.js/lib/languages/bash'
import php from 'highlight.js/lib/languages/php'
import go from 'highlight.js/lib/languages/go'
import sql from 'highlight.js/lib/languages/sql'

const lowlight = createLowlight()

lowlight.register('javascript', javascript)
lowlight.register('typescript', typescript)
lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('json', json)
lowlight.register('python', python)
lowlight.register('java', java)
lowlight.register('bash', bash)
lowlight.register('php', php)
lowlight.register('go', go)
lowlight.register('sql', sql)



interface SimpleEditorProps {
  currentFile: { folderId: number; file: FileType }
  navItems: FolderType[]
  setNavItems: React.Dispatch<React.SetStateAction<FolderType[]>>
}

const MainToolbarContent = ({ onHighlighterClick, onLinkClick, isMobile }: { onHighlighterClick: () => void; onLinkClick: () => void; isMobile: boolean }) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
        <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
        <NodeButton type="codeBlock" />
        <NodeButton type="blockquote" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <HighlightPopover />
        ) : (
          <HighlighterButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  )
}

const MobileToolbarContent = ({ type, onBack }: { type: "highlighter" | "link"; onBack: () => void }) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? <HighlighterIcon className="tiptap-button-icon" /> : <LinkIcon className="tiptap-button-icon" />}
      </Button>
    </ToolbarGroup>
    <ToolbarSeparator />
    {type === "highlighter" ? <HighlightContent /> : <LinkContent />}
  </>
)

export function SimpleEditor({ currentFile, setNavItems }: SimpleEditorProps) {
  const isMobile = useMobile()
  const windowSize = useWindowSize()
  const [mobileView, setMobileView] = React.useState<"main" | "highlighter" | "link">("main")
  const [rect, setRect] = React.useState<Pick<DOMRect, "x" | "y" | "width" | "height">>({ x: 0, y: 0, width: 0, height: 0 })
  const toolbarRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const updateRect = () => setRect(document.body.getBoundingClientRect())
    updateRect()
    const obs = new ResizeObserver(updateRect)
    obs.observe(document.body)
    window.addEventListener("scroll", updateRect)
    return () => {
      obs.disconnect()
      window.removeEventListener("scroll", updateRect)
    }
  }, [])


  const editor = useEditor(
    {
      immediatelyRender: false,
      editorProps: { attributes: { autocomplete: "off", autocorrect: "off", autocapitalize: "off", "aria-label": "Main content, start typing" } },
      extensions: [
        StarterKit.configure({
          codeBlock: false,
        }),
        CodeBlockLowlight.configure({
          lowlight,
          HTMLAttributes: {
            spellcheck: 'false',
            autocorrect: 'off',
            autocapitalize: 'off',
            contenteditable: 'true',
          },
        }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Underline,
        TaskList,
        TaskItem.configure({ nested: true }),
        Highlight.configure({ multicolor: true }),
        Image,
        Typography,
        Superscript,
        Subscript,
        Selection,
        ImageUploadNode.configure({ accept: "image/*", maxSize: MAX_FILE_SIZE, limit: 3, upload: handleImageUpload, onError: console.error }),
        TrailingNode,
        Link.configure({ openOnClick: false }),
      ],
      content: currentFile.file.content,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML()
        setNavItems(prev =>
          prev.map(folder =>
            folder.id === currentFile.folderId
              ? { ...folder, items: folder.items.map(f => (f.id === currentFile.file.id ? { ...f, content: html } : f)) }
              : folder
          )
        )
      },
    },
    []
  )

  React.useEffect(() => {
    if (editor) editor.commands.setContent(currentFile.file.content)
  }, [editor, currentFile])

  React.useEffect(() => {
    if (!editor || !toolbarRef.current) return
  }, [editor, rect.height, windowSize.height])

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") setMobileView("main")
  }, [isMobile, mobileView])

  return (
      <EditorContext.Provider value={{ editor }}>
        <Toolbar ref={toolbarRef} style={isMobile ? { bottom: `calc(100% - ${windowSize.height - rect.y}px)` } : {}}>
          {mobileView === "main" ? <MainToolbarContent onHighlighterClick={() => setMobileView("highlighter")} onLinkClick={() => setMobileView("link")} isMobile={isMobile} /> : <MobileToolbarContent type={mobileView === "highlighter" ? "highlighter" : "link"} onBack={() => setMobileView("main")} />}
        </Toolbar>
        <div className="content-wrapper">
          <EditorContent
            editor={editor}
            role="presentation"
            className="simple-editor-content"
          />
        </div>
      </EditorContext.Provider>
  )
}
