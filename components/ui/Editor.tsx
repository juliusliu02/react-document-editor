"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export function Editor({
    content = "",
    onUpdate,
}: {
    content?: string;
    onUpdate?: (html: string) => void;
}) {
    const editor = useEditor({
        extensions: [StarterKit],
        content,
        onUpdate: ({ editor }) => {
            onUpdate?.(editor.getHTML());
        },
    });

    return (
        <div className="prose p-4 rounded-md">
            <EditorContent editor={editor} />
        </div>
    );
}
