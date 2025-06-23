import React, { useState, useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LinkNode } from "@lexical/link";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { ListNode, ListItemNode } from "@lexical/list";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { QuoteNode } from "@lexical/rich-text";
import { HeadingNode } from "@lexical/rich-text";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  $getRoot,
} from "lexical";
import { $insertNodes } from "lexical";
import { $createParagraphNode } from "lexical";
import { $createTextNode } from "lexical";
import { COMMAND_PRIORITY_NORMAL } from "lexical";
import { createCommand } from "lexical";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const INSERT_IMAGE_COMMAND = createCommand("INSERT_IMAGE_COMMAND");

const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(300, "Title is too long"),
  content: z.string().min(1, "Content is required"),
});

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const onBoldClick = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  };

  const onItalicClick = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  };

  const onUnderlineClick = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  };

  const onLinkClick = () => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const url = prompt("Enter URL:", "https://");
      if (url) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "link", url);
      }
    }
  };

  const onImageUpload = (e) => {
    const fileInput = e.target;
    const file = fileInput.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result;
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center space-x-2 p-2 border-b border-gray-200 bg-gray-50 rounded-t-md">
      <button
        onClick={onBoldClick}
        className="p-2 rounded hover:bg-gray-200 transition-colors"
        aria-label="Bold"
      >
        <span className="font-bold">B</span>
      </button>
      <button
        onClick={onItalicClick}
        className="p-2 rounded hover:bg-gray-200 transition-colors"
        aria-label="Italic"
      >
        <span className="italic">I</span>
      </button>
      <button
        onClick={onUnderlineClick}
        className="p-2 rounded hover:bg-gray-200 transition-colors"
        aria-label="Underline"
      >
        <span className="underline">U</span>
      </button>
      <button
        onClick={onLinkClick}
        className="p-2 rounded hover:bg-gray-200 transition-colors"
        aria-label="Link"
      >
        <span>🔗</span>
      </button>
      <label className="p-2 rounded hover:bg-gray-200 transition-colors cursor-pointer">
        <span>📷</span>
        <input
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          className="hidden"
        />
      </label>
    </div>
  );
}

function ImagePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (imageUrl) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const imageNode = $createTextNode(
              `[Image: ${imageUrl.substring(0, 20)}...]`
            );
            selection.insertNodes([imageNode]);
          }
        });
        return true;
      },
      COMMAND_PRIORITY_NORMAL
    );
  }, [editor]);

  return null;
}

function OnChangePlugin({ onChange }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const textContent = root.getTextContent();
        onChange(textContent);
      });
    });
  }, [editor, onChange]);

  return null;
}

function Placeholder() {
  return (
    <div className="absolute top-0 left-0 p-2 text-gray-400 pointer-events-none">
      What are your thoughts?
    </div>
  );
}

export default function RedditPostForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
  };

  const initialConfig = {
    namespace: "RedditEditor",
    theme: {
      text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
      },
    },
    nodes: [
      LinkNode,
      ListNode,
      ListItemNode,
      HorizontalRuleNode,
      CodeNode,
      CodeHighlightNode,
      QuoteNode,
      HeadingNode,
    ],
    onError: (error) => console.error(error),
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register("title")}
            placeholder="Title"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div className="border border-gray-300 rounded-md overflow-hidden">
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <LexicalComposer initialConfig={initialConfig}>
                <ToolbarPlugin />
                <div className="relative bg-white min-h-32">
                  <RichTextPlugin
                    contentEditable={
                      <ContentEditable className="p-2 min-h-32 outline-none focus:ring-0" />
                    }
                    placeholder={<Placeholder />}
                    ErrorBoundary={LexicalErrorBoundary}
                  />
                  <OnChangePlugin onChange={field.onChange} />
                  <HistoryPlugin />
                  <AutoFocusPlugin />
                  <LinkPlugin />
                  <ListPlugin />
                  <MarkdownShortcutPlugin />
                  <ImagePlugin />
                </div>
              </LexicalComposer>
            )}
          />
          {errors.content && (
            <p className="text-red-500 text-sm p-2 border-t border-gray-300">
              {errors.content.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
}
