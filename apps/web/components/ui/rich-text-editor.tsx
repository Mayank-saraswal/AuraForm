"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Button } from "./button";
import { cn } from "~/lib/utils";
import { RiBold, RiItalic, RiUnderline } from "react-icons/ri";
import { useEffect, useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  // Flag to prevent updates when change is from inside
  const isInternalChange = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
      }),
      Underline,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[80px] p-3 text-sm",
          className
        ),
        placeholder: placeholder ?? "Type here...",
      },
    },
    onUpdate: ({ editor }) => {
      isInternalChange.current = true;
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML() && !isInternalChange.current) {
      editor.commands.setContent(value);
    }
    isInternalChange.current = false;
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col rounded-md border shadow-sm overflow-hidden bg-background">
      <div className="flex items-center gap-1 border-b bg-muted/40 px-2 py-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("h-7 w-7 p-0", editor.isActive("bold") && "bg-muted text-primary")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <RiBold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("h-7 w-7 p-0", editor.isActive("italic") && "bg-muted text-primary")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <RiItalic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("h-7 w-7 p-0", editor.isActive("underline") && "bg-muted text-primary")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <RiUnderline className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
