"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "@tiptap/extension-link";

import { UploadButton, UploadDropzone } from "@uploadthing/react";
import { Editor } from "./Editor";
import { Editor2 } from "@/components/ui/Toolbar";
import { error } from "console";
import UploadComponent from "./UploadButton";
import LinkPreviewComponent from "./LinkPreview";

// Schema for image posts
const imagePostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  imageUrl: z.string().url("Please enter a valid image URL"),
  description: z.string().optional(),
});

// Schema for link posts
const linkPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  link: z.string().url("Please enter a valid URL"),
});

// Schema for text posts
const textPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

const PostCreationTabs = () => {
  const [activeTab, setActiveTab] = React.useState("text");

  // Image post form
  const imageForm = useForm<z.infer<typeof imagePostSchema>>({
    resolver: zodResolver(imagePostSchema),
    defaultValues: {
      title: "",
      imageUrl: "",
      description: "",
    },
  });

  // Link post form
  const linkForm = useForm<z.infer<typeof linkPostSchema>>({
    resolver: zodResolver(linkPostSchema),
    defaultValues: {
      title: "",
      link: "",
    },
  });

  // Text post form
  const textForm = useForm<z.infer<typeof textPostSchema>>({
    resolver: zodResolver(textPostSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Submit handlers for each form type
  const onImageSubmit = (data: z.infer<typeof imagePostSchema>) => {
    console.log("Image post data:", data);
    // Add your API call or state update here
    imageForm.reset();
  };

  const onLinkSubmit = (data: z.infer<typeof linkPostSchema>) => {
    console.log("Link post data:", data);
    // Add your API call or state update here
    linkForm.reset();
  };

  const onTextSubmit = (data: z.infer<typeof textPostSchema>) => {
    console.log("Text post data:", data);
    // Add your API call or state update here
    textForm.reset();
  };

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
          defaultValue="image"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="image">Image</TabsTrigger>
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
          </TabsList>

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
                <FormField
                  control={imageForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image Upload</FormLabel>
                      <FormControl>
                        <UploadComponent />
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
                        <Editor />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-2  mt-4 justify-end ">
                  <Button variant="ghost">Draft</Button>

                  <Button type="submit">submit</Button>
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
                <FormField
                  control={linkForm.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link URL</FormLabel>
                      <FormControl>
                        <LinkPreviewComponent
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          disabled={field.disabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-2  mt-4 justify-end ">
                  <Button variant="ghost">Draft</Button>

                  <Button type="submit">submit</Button>
                </div>
              </form>
            </Form>
          </TabsContent>

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
                <FormField
                  control={textForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Editor />
                        {/* <Editor2 /> */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-2  mt-4 justify-end ">
                  <Button variant="ghost">Draft</Button>

                  <Button type="submit">submit</Button>
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
