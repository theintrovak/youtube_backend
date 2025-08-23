import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Delete file from Cloudinary by publicId
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log("✅ File deleted from cloudinary:", publicId);
    return true;
  } catch (error) {
    console.error("❌ Failed to delete from cloudinary:", publicId, error.message);
    return false;
  }
};

// ✅ Upload file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) throw new Error("No file path provided");

    // 🔄 Normalize path (fixes Windows backslashes)
    const normalizedPath = path.resolve(localFilePath);

    const response = await cloudinary.uploader.upload(normalizedPath, {
      resource_type: "auto",
    });

    console.log("✅ File uploaded to cloudinary:", response.url);

    // Delete local file after successful upload
    if (fs.existsSync(normalizedPath)) {
      fs.unlinkSync(normalizedPath);
      console.log("🗑️ Local file deleted:", normalizedPath);
    }

    return response;
  } catch (error) {
    console.error("❌ File upload to cloudinary failed:", error.message);

    // Try cleaning up local file if it exists
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log("🗑️ Local file deleted after failure:", localFilePath);
    }

    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
