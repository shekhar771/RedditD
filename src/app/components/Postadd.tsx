"use client";

import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tab";
import { Textarea } from "@/components/ui/textarea";
import { PostSchema } from "@/lib/validator/PostAdd";
import React, { FC, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { title } from "process";
interface PageProps {
  subredditId: string;
}

const tabs = [
  { id: "Text", label: "Text" },
  { id: "Images", label: "Images" },

  { id: "Link", label: "Link" },
];

const PostAddNav: FC<PageProps> = ({ subredditId }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const onSubmit = (data: any) => {};
  const {} = useForm({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      contentType: "Text",
      subredditId: subredditId,
      title: "",
      content: null,
    },
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case "Text":
        return (
          <div className="mt-4">
            <Input placeholder="Title" className="mb-4" />
            <Textarea
              placeholder="Write your post..."
              className="min-h-[200px]"
            />
          </div>
        );
      case "Image":
        return (
          <div className="mt-4">
            <Input placeholder="Title" className="mb-4" />
            <Input type="file" accept="image/*" className="mb-4" />
            <Textarea
              placeholder="Optional description..."
              className="min-h-[100px]"
            />
          </div>
        );
      case "Link":
        return (
          <div className="mt-4">
            <Input placeholder="Title" className="mb-4" />
            <Input placeholder="Paste your link here" className="mb-4" />
            <Textarea
              placeholder="Optional description..."
              className="min-h-[100px]"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const handleTabChange = (tabId: string) => {
    console.log("Selected tab:", tabId);
    setActiveTab(tabId);
    // Add any additional logic for tab change
  };

  return (
    <div>
      <Tabs
        className="mt-2"
        tabs={tabs}
        onTabChange={handleTabChange}
        activeTab={activeTab}
      />
      {renderTabContent()}
    </div>
  );
};

export default PostAddNav;
