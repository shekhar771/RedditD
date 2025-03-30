"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PostSchema } from "@/lib/validator/PostAdd";
import React, { FC, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs } from "@/components/ui/tab";
interface PageProps {
  subredditId: string;
}

const tabs = [
  { id: "Text", label: "Text" },
  { id: "Images", label: "Images" },
  { id: "Link", label: "Link" },
];

type FormData = z.infer<typeof PostSchema>;

const PostAddNav: FC<PageProps> = ({ subredditId }) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      contentType: "Text",
      subredditId: subredditId,
      title: "",
      content: {
        text: "",
        link: "",
        description: "",
        imageFile: undefined,
      },
    },
  });

  const contentType = watch("contentType");

  // Reset content when tab changes
  useEffect(() => {
    const resetValues = {
      title: watch("title"),
      subredditId,
      contentType,
      content: {
        text: "",
        link: "",
        description: "",
        imageFile: "",
      },
    };

    if (contentType === "Text") {
      resetValues.content.text = watch("content.text") || "";
    } else if (contentType === "Images") {
      resetValues.content.imageFile = watch("content.imageFile");
      resetValues.content.description = watch("content.description") || "";
    } else if (contentType === "Link") {
      resetValues.content.link = watch("content.link") || "";
      resetValues.content.description = watch("content.description") || "";
    }

    reset(resetValues);
  }, [contentType, reset, subredditId, watch]);

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);

    // Prepare data for submission based on content type
    const submissionData = {
      title: data.title,
      subredditId: data.subredditId,
      contentType: data.contentType,
      content: {} as any,
    };

    if (data.contentType === "Text") {
      submissionData.content.text = data.content.text;
    } else if (data.contentType === "Images") {
      submissionData.content.imageFile = data.content.imageFile;
      submissionData.content.description = data.content.description || "";
    } else if (data.contentType === "Link") {
      submissionData.content.link = data.content.link;
      submissionData.content.description = data.content.description || "";
    }

    console.log("Submission data:", submissionData);
    // Handle form submission with submissionData
  };

  const handleTabChange = (tabId: string) => {
    setValue("contentType", tabId as "Text" | "Images" | "Link");
  };

  const renderTabContent = () => {
    switch (contentType) {
      case "Text":
        return (
          <div className="mt-4">
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <div>
                  <Input placeholder="Title" className="mb-1" {...field} />
                  {errors.title && (
                    <p className="text-red-500 text-sm mb-2">
                      {errors.title.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="content.text"
              control={control}
              render={({ field }) => (
                <div>
                  <Textarea
                    placeholder="Write your post..."
                    className="min-h-[200px]"
                    {...field}
                  />
                  {errors.content?.text && (
                    <p className="text-red-500 text-sm">
                      {errors.content.text.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        );
      case "Images":
        return (
          <div className="mt-4">
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <div>
                  <Input placeholder="Title" className="mb-1" {...field} />
                  {errors.title && (
                    <p className="text-red-500 text-sm mb-2">
                      {errors.title.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="content.imageFile"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="mb-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      onChange(e.target.files?.[0] || null);
                    }}
                    {...field}
                  />
                  {errors.content?.imageFile && (
                    <p className="text-red-500 text-sm">
                      {errors.content.imageFile.message as string}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="content.description"
              control={control}
              render={({ field }) => (
                <Textarea
                  placeholder="Optional description..."
                  className="min-h-[100px]"
                  {...field}
                />
              )}
            />
          </div>
        );
      case "Link":
        return (
          <div className="mt-4">
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <div>
                  <Input placeholder="Title" className="mb-1" {...field} />
                  {errors.title && (
                    <p className="text-red-500 text-sm mb-2">
                      {errors.title.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="content.link"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <Input
                    placeholder="Paste your link here"
                    {...field}
                    value={field.value ?? ""}
                  />
                  {errors.content?.link && (
                    <p className="text-red-500 text-sm">
                      {errors.content.link.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="content.description"
              control={control}
              render={({ field }) => (
                <Textarea
                  placeholder="Optional description..."
                  className="min-h-[100px]"
                  {...field}
                />
              )}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Tabs
        className="mt-2"
        tabs={tabs}
        onTabChange={handleTabChange}
        activeTab={contentType}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        {renderTabContent()}
        <div className="flex items-center gap-2 mt-4 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              console.log("Saved as draft");
            }}
          >
            Draft
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </div>
  );
};

export default PostAddNav;
