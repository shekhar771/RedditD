import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { useState } from "react";
import Image from "next/image";

export default function UploadComponent() {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <UploadButton<OurFileRouter, "imageUploader">
        className='border'
        endpoint="imageUploader"
        onUploadBegin={() => setIsUploading(true)}
        onClientUploadComplete={(res) => {
          setIsUploading(false);
          if (res?.[0]?.url) {
            setUploadedUrl(res[0].url);
            alert("Upload completed successfully!");
          }
        }}
        onUploadError={(error) => {
          setIsUploading(false);
          console.error("Full error object:", error);
          alert(`Upload failed: ${error.message}`);

          // Additional error details if available
          if ("data" in error) {
            console.error("Error details:", error.data);
          }
        }}
      />

      {isUploading && <p>Uploading...</p>}

      {uploadedUrl && (
        <div className="mt-2">
          {/* <p>Uploaded image:</p> */}
          <Image
            src={uploadedUrl}
            alt="Uploaded"
            width={500}
            height={300}
            className="mt-2 max-w-md rounded-lg border"
          />
        </div>
      )}
    </div>
  );
}
