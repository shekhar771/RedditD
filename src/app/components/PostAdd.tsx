"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

import { JSONContent } from "@tiptap/react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tab";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Editor } from "./Editor";
import UploadComponent from "./UploadButton";
import LinkPreviewComponent from "./LinkPreview";

import {
  TextPostSchema,
  ImagePostSchema,
  LinkPostSchema,
  TextPostData,
  ImagePostData,
  LinkPostData,
  LinkPreview,
} from "@/lib/validator/PostAdd";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { LinkPreviewSchema } from "@/lib/validator/link";

const PostCreationTabs = ({
  subredditId,
  availableTags = [],
}: {
  subredditId: string;
  availableTags?: string[];
}) => {
  const [activeTab, setActiveTab] = React.useState("text");

  // Text post form
  const textForm = useForm<TextPostData>({
    resolver: zodResolver(TextPostSchema),
    defaultValues: {
      title: "",
      subredditId,
      type: "TEXT",
      tag: "",
      content: null,
    },
  });

  // Image post form
  const imageForm = useForm<ImagePostData>({
    resolver: zodResolver(ImagePostSchema),
    defaultValues: {
      title: "",
      subredditId,
      type: "IMAGE",
      tag: "",
      imageUrl: "",
      description: "",
    },
  });

  // Link post form
  const linkForm = useForm<LinkPostData>({
    resolver: zodResolver(LinkPostSchema),
    defaultValues: {
      title: "",
      subredditId,
      type: "LINK",
      tag: "",
      linkUrl: "",
      linkMeta: undefined,
    },
  });

  // State to store preview data
  const [linkPreviewData, setLinkPreviewData] = useState<LinkPreview | null>(
    null
  );

  // Submit handler for text posts
  const onTextSubmit = async (data: TextPostData) => {
    try {
      const response = await axios.post("/api/posts/create", data);
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
      try {
        window.location.href = `/r/${response.data.subredditName}/post/${response.data.postId}`;
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      let errorMessage = "Failed to create post";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  // Submit handler for image posts
  const onImageSubmit = async (data: ImagePostData) => {
    console.log("Image post data:", data);

    // Validate image URL before submission
    if (!data.imageUrl) {
      toast({
        title: "Error",
        description: "No image uploaded. Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.post("/api/posts/create", data);

      // Handle success
      toast({
        title: "Success",
        description: "Image post created successfully!",
      });
      console.log(response.data);
      try {
        window.location.href = `/r/${response.data.subredditName}/post/${response.data.postId}`;
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.error("Error creating image post:", error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  // Submit handler for link posts
  // Submit handler for link posts
  const onLinkSubmit = async (data: LinkPostData) => {
    if (!linkPreviewData) {
      console.error("Link preview data is missing");
      toast({
        title: "Error",
        description: "Link preview data is missing. Please enter a valid URL.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Validate the link preview data against the schema
      const validatedPreview = LinkPreviewSchema.parse(linkPreviewData);

      const postData = {
        ...data,
        linkMeta: validatedPreview, // Use the validated data
      };

      const response = await axios.post("/api/posts/create", postData);

      toast({
        title: "Success",
        description: "Link post created successfully!",
      });
      console.log(response.data);
      window.location.href = `/r/${response.data.subredditName}/post/${response.data.postId}`;
    } catch (error) {
      console.error("Submission Error:", error);

      let errorMessage = "Failed to create post";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  // Handle editor content changes
  const handleTextEditorChange = (content: JSONContent) => {
    textForm.setValue("content", content, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    textForm.trigger("content"); // Explicitly trigger validation
  };

  const handleImageDescriptionChange = (content: JSONContent) => {
    imageForm.setValue("description", content);
  };

  // When link preview is loaded
  const handleLinkPreviewLoaded = (preview: LinkPreview) => {
    setLinkPreviewData(preview);
  };
  // Add this to your component to monitor form state
  useEffect(() => {
    console.log("Text Form Errors:", textForm.formState.errors);
    console.log("Image Form Errors:", imageForm.formState.errors);
    console.log("Link Form Errors:", linkForm.formState.errors);
  }, [
    textForm.formState.errors,
    imageForm.formState.errors,
    linkForm.formState.errors,
  ]);
  return (
    <div className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create a Post</CardTitle>
        <CardDescription>
          Choose the type of post you want to create
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="text"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
            <TabsTrigger value="link">Link</TabsTrigger>
          </TabsList>

          {/* Text Post Form */}
          <TabsContent value="text">
            <Form {...textForm}>
              <form
                onSubmit={textForm.handleSubmit(onTextSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={textForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Add a title for your text post"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {availableTags.length > 0 && (
                  <FormField
                    control={textForm.control}
                    name="tag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tag (optional)</FormLabel>{" "}
                        {/* Added (optional) */}
                        <FormControl>
                          <select
                            className="w-full px-3 py-2 border rounded-md"
                            {...field}
                          >
                            <option value="">None</option>{" "}
                            {/* Add a none option */}
                            {availableTags.map((tag) => (
                              <option key={tag} value={tag}>
                                {tag}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={textForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Editor onChange={handleTextEditorChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-2 mt-4 justify-end">
                  <Button variant="ghost">Draft</Button>
                  <Button type="submit">Submit</Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Image Post Form */}
          <TabsContent value="image">
            <Form {...imageForm}>
              <form
                onSubmit={imageForm.handleSubmit(onImageSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={imageForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Add a title for your image post"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {availableTags.length > 0 && (
                  <FormField
                    control={imageForm.control}
                    name="tag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tag</FormLabel>
                        <FormControl>
                          <select
                            className="w-full px-3 py-2 border rounded-md"
                            {...field}
                          >
                            {availableTags.map((tag) => (
                              <option key={tag} value={tag}>
                                {tag}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={imageForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image Upload</FormLabel>
                      <FormControl>
                        <UploadComponent
                          onImageUploaded={(url) => {
                            field.onChange(url); // This is the critical line
                            imageForm.setValue("imageUrl", url, {
                              shouldValidate: true,
                            });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={imageForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Editor onChange={handleImageDescriptionChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-2 mt-4 justify-end">
                  <Button variant="ghost">Draft</Button>
                  <Button type="submit">Submit</Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Link Post Form */}
          <TabsContent value="link">
            <Form {...linkForm}>
              <form
                onSubmit={linkForm.handleSubmit(onLinkSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={linkForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Add a title for your link"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {availableTags.length > 0 && (
                  <FormField
                    control={linkForm.control}
                    name="tag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tag</FormLabel>
                        <FormControl>
                          <select
                            className="w-full px-3 py-2 border rounded-md"
                            {...field}
                          >
                            {availableTags.map((tag) => (
                              <option key={tag} value={tag}>
                                {tag}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={linkForm.control}
                  name="linkUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link URL</FormLabel>
                      <FormControl>
                        <LinkPreviewComponent
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            // Reset preview data when URL changes
                            if (value !== field.value) {
                              setLinkPreviewData(null);
                            }
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          disabled={field.disabled}
                          onPreviewLoaded={handleLinkPreviewLoaded}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-2 mt-4 justify-end">
                  <Button variant="ghost">Draft</Button>

                  <Button type="submit">Submit</Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </div>
  );
};

export default PostCreationTabs;
