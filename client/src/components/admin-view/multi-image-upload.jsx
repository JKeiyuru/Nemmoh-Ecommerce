/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// client/src/components/admin-view/multi-image-upload.jsx
import { useState, useRef } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { UploadCloud, X, ImageIcon, Trash2, MoveLeft, MoveRight } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "../ui/use-toast";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";

function MultiImageUpload({ formData, setFormData }) {
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    
    if (!files.length) return;

    // Check total image limit
    const currentImageCount = (formData.images || []).length;
    if (currentImageCount + files.length > 10) {
      toast({
        title: "Too many images",
        description: "Maximum 10 images allowed per product",
        variant: "destructive",
      });
      return;
    }

    // Validate each file
    for (const file of files) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid image format`,
          variant: "destructive",
        });
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 5MB limit`,
          variant: "destructive",
        });
        continue;
      }

      // Upload the file
      await uploadImage(file);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (file) => {
    try {
      setUploadingIndex((formData.images || []).length);

      const formDataUpload = new FormData();
      formDataUpload.append("my_file", file);

      const response = await axios.post(
        `${API_BASE_URL}/api/admin/products/upload-image`,
        formDataUpload,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to upload image");
      }

      const imageUrl = response.data.result.url;

      // Add to images array
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), imageUrl]
      }));

      toast({
        title: "Image uploaded",
        description: "Image added successfully",
      });

    } catch (err) {
      console.error("Upload error:", err);
      toast({
        title: "Upload failed",
        description: err.response?.data?.message || err.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));

    toast({
      title: "Image removed",
      description: "Image removed from product",
    });
  };

  const handleMoveImage = (index, direction) => {
    const newImages = [...(formData.images || [])];
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newImages.length) return;
    
    // Swap images
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    
    if (!files.length) return;

    // Trigger the same validation and upload process
    const currentImageCount = (formData.images || []).length;
    if (currentImageCount + files.length > 10) {
      toast({
        title: "Too many images",
        description: "Maximum 10 images allowed per product",
        variant: "destructive",
      });
      return;
    }

    for (const file of files) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid image format`,
          variant: "destructive",
        });
        continue;
      }

      await uploadImage(file);
    }
  };

  const imageCount = (formData.images || []).length;

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-semibold mb-3 block">
          Product Images
        </Label>
        <p className="text-sm text-gray-600 mb-4">
          Upload up to 10 images for this product. First image will be the main display image.
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
      >
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          id="multi-image-upload"
          multiple
        />
        <Label htmlFor="multi-image-upload" className="cursor-pointer">
          <UploadCloud className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600 mb-1">
            Drag & drop images here, or click to select
          </p>
          <p className="text-xs text-gray-500">
            JPG, PNG, WEBP (max 5MB each, up to 10 images total)
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {imageCount}/10 images uploaded
          </p>
        </Label>
      </div>

      {/* Current Images */}
      {imageCount > 0 ? (
        <div className="space-y-3">
          <h3 className="font-medium text-base flex items-center">
            <ImageIcon className="w-4 h-4 mr-2" />
            Product Images ({imageCount})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.images.map((imageUrl, index) => (
              <div
                key={`${imageUrl}-${index}`}
                className="relative bg-white border rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow group"
              >
                {/* Main Image Badge */}
                {index === 0 && (
                  <div className="absolute top-1 left-1 z-10 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Main
                  </div>
                )}
                
                {/* Image */}
                <div className="aspect-square w-full bg-gray-100 rounded overflow-hidden mb-2">
                  <img
                    src={imageUrl}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/api/placeholder/150/150";
                      e.target.alt = "Image failed to load";
                    }}
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => handleMoveImage(index, 'left')}
                    disabled={index === 0}
                  >
                    <MoveLeft className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => handleMoveImage(index, 'right')}
                    disabled={index === imageCount - 1}
                  >
                    <MoveRight className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="h-7 w-7 p-0"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                {/* Position indicator */}
                <p className="text-xs text-center text-gray-500 mt-1">
                  Image {index + 1}
                </p>
              </div>
            ))}

            {/* Loading placeholder */}
            {uploadingIndex !== null && (
              <div className="relative bg-white border rounded-lg p-2 shadow-sm">
                <div className="aspect-square w-full bg-gray-100 rounded overflow-hidden mb-2">
                  <Skeleton className="w-full h-full" />
                </div>
                <p className="text-xs text-center text-gray-500">
                  Uploading...
                </p>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 italic">
            💡 Tip: The first image will be used as the main product image. Use the arrow buttons to reorder.
          </p>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600 font-medium">No images uploaded yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Upload images to showcase your product
          </p>
        </div>
      )}
    </div>
  );
}

export default MultiImageUpload;