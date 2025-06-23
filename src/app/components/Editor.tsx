"use client";
import { Button } from "@/components/ui/button";
import {
  useEditor,
  type Editor as TiptapEditor,
  EditorContent,
  JSONContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";

const lowlight = createLowlight({
  javascript,
});

// Custom Spoiler Extension
import { Node, generateHTML, mergeAttributes } from "@tiptap/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface JsonContentRendererProps {
  content: JSONContent | string;
  className?: string;
}

export const JsonContentRenderer: React.FC<JsonContentRendererProps> = ({
  content,
  className,
}) => {
  // Parse content if it's a string
  const parsedContent =
    typeof content === "string" ? JSON.parse(content) : content;

  const editor = useEditor(
    {
      editable: false, // Make it read-only
      extensions: [
        StarterKit,
        Link.configure({
          openOnClick: true,
          HTMLAttributes: {
            class: "text-blue-600 underline hover:text-blue-800",
          },
        }),
        Superscript,
        Subscript,
        CodeBlockLowlight.configure({
          lowlight,
        }),
      ],
      content: parsedContent,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: `prose dark:prose-invert max-w-none focus:outline-none ${
            className || ""
          }`,
        },
      },
    },
    [content]
  );

  if (!editor) return null;

  return <EditorContent editor={editor} />;
};

export const Menubar = ({ editor }: { editor: TiptapEditor | null }) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  if (!editor) {
    return null;
  }

  const setLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setIsLinkDialogOpen(false);
    setLinkUrl("");
  };

  const buttonVariant = (isActive: boolean) =>
    isActive ? "default" : "outline";

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2 mt-5 p-1 ">
        <div className="flex gap-[0.1rem] mr-[0.3rem] ">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                variant={buttonVariant(
                  editor.isActive("heading", { level: 1 })
                )}
                aria-label="Heading 1"
              >
                H1
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 1</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                variant={buttonVariant(editor.isActive("bold"))}
                aria-label="Bold"
              >
                B
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                variant={buttonVariant(editor.isActive("italic"))}
                aria-label="Italic"
              >
                I
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                variant={buttonVariant(editor.isActive("strike"))}
                aria-label="Strike"
              >
                S
              </Button>
            </TooltipTrigger>
            <TooltipContent>Strike</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                onClick={() => editor.chain().focus().toggleCode().run()}
                variant={buttonVariant(editor.isActive("code"))}
                aria-label="Inline Code"
              >
                <span className="font-mono">{"<>"}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Inline Code</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex gap-[0.1rem] mr-[0.3rem]">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                variant={buttonVariant(editor.isActive("superscript"))}
                aria-label="Superscript"
              >
                x²
              </Button>
            </TooltipTrigger>
            <TooltipContent>Superscript</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                variant={buttonVariant(editor.isActive("subscript"))}
                aria-label="Subscript"
              >
                x₂
              </Button>
            </TooltipTrigger>
            <TooltipContent>Subscript</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex gap-[0.1rem] mr-[0.3rem]">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                variant={buttonVariant(editor.isActive("bulletList"))}
                aria-label="Bullet List"
              >
                • List
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                variant={buttonVariant(editor.isActive("orderedList"))}
                aria-label="Numbered List"
              >
                1. List
              </Button>
            </TooltipTrigger>
            <TooltipContent>Numbered List</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex gap-[0.1rem] mr-[0.3rem]">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                variant={buttonVariant(editor.isActive("codeBlock"))}
                aria-label="Code Block"
              >
                {"</>"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Code Block</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                variant={buttonVariant(editor.isActive("blockquote"))}
                aria-label="Quote Block"
              >
                Quote Block
              </Button>
            </TooltipTrigger>
            <TooltipContent>Quote Block</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  // Check if link is active
                  if (editor.isActive("link")) {
                    // If active, unset the link
                    editor.chain().focus().unsetLink().run();
                  } else {
                    // Open the dialog to add a link
                    setIsLinkDialogOpen(true);
                  }
                }}
                variant={buttonVariant(editor.isActive("link"))}
                aria-label="Insert Link"
              >
                Link
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Link</TooltipContent>
          </Tooltip>
        </div>

        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="sm"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              variant="outline"
              aria-label="Horizontal Rule"
            >
              HR
            </Button>
          </TooltipTrigger>
          <TooltipContent>Horizontal Rule</TooltipContent>
        </Tooltip> */}
      </div>

      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="url" className="mb-2">
              URL
            </Label>
            <Input
              id="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-1"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLinkDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={setLink}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export function Editor({
  onChange,
  initialContent = "",
}: {
  onChange?: (json: JSONContent) => void;
  initialContent?: string | JSONContent;
}) {
  const [editorReady, setEditorReady] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Make sure lists are properly configured in StarterKit
        bulletList: {
          keepMarks: true,
          keepAttributes: false, // don't keep attributes when toggling lists
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false, // don't keep attributes when toggling lists
        },
      }),
      Placeholder.configure({
        // Use a placeholder:
        placeholder: "Write something …",
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        defaultProtocol: "https",
        protocols: ["http", "https"],
        HTMLAttributes: {
          // Add styling to links so they're clearly visible
          class: "text-blue-600 underline hover:text-blue-800",
        },
        // Keep the link validation logic
        isAllowedUri: (url, ctx) => {
          try {
            // construct URL
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`${ctx.defaultProtocol}://${url}`);

            // use default validation
            if (!ctx.defaultValidate(parsedUrl.href)) {
              return false;
            }

            // disallowed protocols
            const disallowedProtocols = ["ftp", "file", "mailto"];
            const protocol = parsedUrl.protocol.replace(":", "");

            if (disallowedProtocols.includes(protocol)) {
              return false;
            }

            // only allow protocols specified in ctx.protocols
            const allowedProtocols = ctx.protocols.map((p) =>
              typeof p === "string" ? p : p.scheme
            );

            if (!allowedProtocols.includes(protocol)) {
              return false;
            }

            // disallowed domains
            const disallowedDomains = [
              "example-phishing.com",
              "malicious-site.net",
            ];
            const domain = parsedUrl.hostname;

            if (disallowedDomains.includes(domain)) {
              return false;
            }

            // all checks have passed
            return true;
          } catch {
            return false;
          }
        },
        shouldAutoLink: (url) => {
          try {
            // construct URL
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`https://${url}`);

            // only auto-link if the domain is not in the disallowed list
            const disallowedDomains = [
              "example-no-autolink.com",
              "another-no-autolink.com",
            ];
            const domain = parsedUrl.hostname;

            return !disallowedDomains.includes(domain);
          } catch {
            return false;
          }
        },
      }),
      Superscript,
      Subscript,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      // SpoilerExtension,
    ],
    immediatelyRender: false,

    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert focus:outline-none max-w-none",
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      if (onChange) {
        onChange(json);
      }
    },
    onTransaction: () => {
      // Ensure the editor exists before trying to get its JSON
      if (!editorReady && editor) {
        setEditorReady(true);
      }
    },
  });

  return (
    <div className="editor-wrapper">
      <Menubar editor={editor} />
      <EditorContent
        editor={editor}
        className="rounded-lg border p-4 min-h-[200px] mt-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all"
      />
      <style jsx global>{`
        .ProseMirror {
          min-height: 150px;
          padding: 0.5rem;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror code {
          background-color: rgba(97, 97, 97, 0.1);
          border-radius: 3px;
          padding: 0.2em 0.4em;
        }
        .ProseMirror pre {
          background: #0d0d0d;
          color: #fff;
          font-family: "JetBrainsMono", monospace;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
        }
        .ProseMirror pre code {
          color: inherit;
          padding: 0;
          background: none;
          font-size: 0.8rem;
        }
        .ProseMirror blockquote {
          padding-left: 1rem;
          border-left: 3px solid #e2e8f0;
        }
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }
        .ProseMirror a:hover {
          color: #1d4ed8;
        }
        /* List styling */
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }
        [data-spoiler] {
          position: relative;
        }
        [data-spoiler][data-spoiler-visible="false"]::after {
          content: "Click to reveal spoiler";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(75, 85, 99, 0.8);
          color: white;
        }
      `}</style>
    </div>
  );
}
