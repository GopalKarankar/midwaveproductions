"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import CharacterCount from "@tiptap/extension-character-count";

export function RichTextField({ label, id, name, value, onChange, placeholder, maxLength }) {
  const editorRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      CharacterCount.configure({
        limit: maxLength || null,
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "bg-transparent border-0 border-b border-border text-text font-body py-2 focus:outline-none focus:border-accent transition-colors duration-200 prose prose-invert max-w-none w-full prose-p:my-0 prose-p:leading-relaxed prose-p:font-body prose-p:text-text prose-strong:text-highlight prose-em:text-text prose-u:underline prose-a:text-accent prose-a:underline prose-a:no-underline hover:prose-a:underline prose-ul:list-disc prose-ul:pl-6 prose-ul:my-1 prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-1 prose-li:my-0 prose-blockquote:border-l-2 prose-blockquote:border-accent prose-blockquote:pl-4 prose-blockquote:py-0 prose-blockquote:italic prose-blockquote:my-1 prose-h2:text-xl prose-h2:font-display prose-h2:font-bold prose-h2:my-2 prose-h3:text-lg prose-h3:font-display prose-h3:font-bold prose-h3:my-2 prose-hr:border-border prose-hr:my-2",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const html = editor.getHTML();
      const syntheticEvent = {
        target: {
          name,
          value: html,
        },
      };
      onChange(syntheticEvent);
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, name, onChange]);

  if (!editor) return null;

  const charCount = editor.storage.characterCount.characters();

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="font-mono text-xs text-accent-2 tracking-widest uppercase"
      >
        {label}
      </label>

      <div className="relative">
        <div className="border-0 border-b border-border rounded-none focus-within:border-accent transition-colors duration-200">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 pb-2 border-0 border-b border-border items-center">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
              title="Bold"
            >
              B
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
              title="Italic"
            >
              I
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive("underline")}
              title="Underline"
            >
              U
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive("strike")}
              title="Strikethrough"
            >
              S
            </ToolbarButton>

            <div className="w-px h-4 bg-border" />

            <ToolbarButton
              onClick={() => {
                const url = prompt("Enter link URL:");
                if (url) {
                  editor
                    .chain()
                    .focus()
                    .extendMarkRange("link")
                    .setLink({ href: url })
                    .run();
                }
              }}
              active={editor.isActive("link")}
              title="Link"
            >
              Link
            </ToolbarButton>

            <div className="w-px h-4 bg-border" />

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive("bulletList")}
              title="Bullet List"
            >
              • List
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive("orderedList")}
              title="Ordered List"
            >
              1. List
            </ToolbarButton>

            <div className="w-px h-4 bg-border" />

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive("blockquote")}
              title="Blockquote"
            >
              &quot; Quote
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              H2
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive("heading", { level: 3 })}
              title="Heading 3"
            >
              H3
            </ToolbarButton>
          </div>

          {/* Editor */}
          <EditorContent ref={editorRef} editor={editor} />
        </div>
      </div>

      {/* Character counter */}
      <p className="text-xs text-muted mt-2 font-mono tracking-widest uppercase">
        {charCount}{maxLength ? ` / ${maxLength}` : ""}
      </p>
    </div>
  );
}

function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-2 py-1 text-xs font-mono tracking-widest uppercase rounded transition-colors duration-200 ${
        active ? "text-accent bg-surface-2" : "text-muted hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}
