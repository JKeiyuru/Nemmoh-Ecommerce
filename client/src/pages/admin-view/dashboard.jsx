/* eslint-disable no-unused-vars */
// client/src/pages/admin-view/dashboard.jsx
import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { addFeatureImage, getFeatureImages, deleteFeatureImage } from "@/store/common-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { featureImageList } = useSelector((state) => state.commonFeature);

  console.log(uploadedImageUrl, "uploadedImageUrl");

  function handleUploadFeatureImage() {
    if (!uploadedImageUrl) {
      toast({
        title: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
        toast({
          title: "✅ Hero image added successfully!",
          description: "Your new hero image is now live on the homepage.",
        });
      } else {
        toast({
          title: "Failed to add hero image",
          variant: "destructive",
        });
      }
    });
  }

  function handleDeleteClick(imageId, imageUrl) {
    setImageToDelete({ id: imageId, url: imageUrl });
    setDeleteDialogOpen(true);
  }

  async function handleConfirmDelete() {
    if (!imageToDelete) return;

    setIsDeleting(true);
    try {
      const result = await dispatch(deleteFeatureImage(imageToDelete.id));
      
      if (result?.payload?.success) {
        dispatch(getFeatureImages());
        toast({
          title: "✅ Hero image deleted",
          description: "The image has been removed from your homepage.",
        });
      } else {
        toast({
          title: "Failed to delete image",
          description: result?.payload?.message || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error deleting image",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  }

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  console.log(featureImageList, "featureImageList");

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Hero Images Manager</h1>
        <p className="text-gray-600">
          Upload and manage the hero images that appear on your homepage carousel.
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Hero Image
          </h2>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isCustomStyling={true}
          />
          <Button 
            onClick={handleUploadFeatureImage} 
            className="mt-5 w-full"
            disabled={imageLoadingState || !uploadedImageUrl}
          >
            {imageLoadingState ? "Uploading..." : "Add Hero Image"}
          </Button>
        </CardContent>
      </Card>

      {/* Current Hero Images */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Current Hero Images ({featureImageList?.length || 0})
          </h2>
          
          {featureImageList && featureImageList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featureImageList.map((featureImgItem, index) => (
                <div 
                  key={featureImgItem._id || index} 
                  className="relative group overflow-hidden rounded-lg border-2 border-gray-200 hover:border-primary transition-all duration-200 shadow-md hover:shadow-xl"
                >
                  <img
                    src={featureImgItem.image}
                    className="w-full h-[250px] object-cover"
                    alt={`Hero image ${index + 1}`}
                    onError={(e) => {
                      e.target.src = "/api/placeholder/400/250";
                      e.target.alt = "Image failed to load";
                    }}
                  />
                  
                  {/* Overlay with delete button */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="lg"
                      className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-200"
                      onClick={() => handleDeleteClick(featureImgItem._id, featureImgItem.image)}
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      Delete Image
                    </Button>
                  </div>

                  {/* Image number badge */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Hero Images Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Upload your first hero image to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this hero image from your homepage. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {imageToDelete && (
            <div className="my-4">
              <img
                src={imageToDelete.url}
                alt="Image to delete"
                className="w-full h-32 object-cover rounded-lg border"
                onError={(e) => {
                  e.target.src = "/api/placeholder/400/150";
                }}
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Image"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AdminDashboard;