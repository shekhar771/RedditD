import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs } from "@/components/ui/tab";
import { Button } from "@/components/ui/button";

import { PostSchema } from "@/lib/validator/PostAdd";
import RedditEditor from "@/components/ui/Editor";

const tabs = [
  { id: "Text", label: "Text" },
  { id: "Images", label: "Images" },
  { id: "Link", label: "Link" },
];

const PostAddNav: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PostFormData>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      contentType: "Text",
      subredditId: "",
      content: {},
    },
  });

  const watchedValues = watch();

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setValue("contentType", tabId as "Text" | "Images" | "Link");
  };

  const onSubmit = async (data: PostFormData) => {
    try {
      console.log("Form Data:", data);
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Text":
        return (
          <div className="mt-4 space-y-4">
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    {...field}
                    placeholder="Title"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">
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
                <Textarea
                  {...field}
                  placeholder="Write your post..."
                  className="min-h-[200px]"
                />
              )}
            />
          </div>
        );

      case "Images":
        return (
          <div className="mt-4 space-y-4">
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    {...field}
                    placeholder="Title"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              name="content.imageFile"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <Input
                  type="file"
                  accept="image/*"
                  {...field}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                    }
                  }}
                />
              )}
            />

            <Controller
              name="content.description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Optional description..."
                  className="min-h-[100px]"
                />
              )}
            />
          </div>
        );

      case "Link":
        return (
          <div className="mt-4 space-y-4">
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    {...field}
                    placeholder="Title"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">
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
                <div>
                  <Input
                    {...field}
                    placeholder="Paste your link here"
                    className={errors.content?.link ? "border-red-500" : ""}
                  />
                  {errors.content?.link && (
                    <p className="text-red-500 text-sm mt-1">
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
                  {...field}
                  placeholder="Optional description..."
                  className="min-h-[100px]"
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Tabs
        className="mt-2"
        tabs={tabs}
        onTabChange={handleTabChange}
        activeTab={activeTab}
      />

      {renderTabContent()}

      <Button type="submit" className="w-full">
        Submit Post
      </Button>

      {/* Optional: Debug information */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre>{JSON.stringify(watchedValues, null, 2)}</pre>
          <pre>{JSON.stringify(errors, null, 2)}</pre>
        </div>
      )}
    </form>
  );
};

export default PostAddNav;
