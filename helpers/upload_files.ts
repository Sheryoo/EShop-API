import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";
import { createReadStream } from "streamifier";

config();

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

export const uploadFilesMiddleware = () => {
  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload only images."));
    }
  };

  const uploadOptions = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 },
  });

  return uploadOptions;
};

export const uploadToCloudinary = async (file, folderName) => {
  try {
    cloudinary.config({
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      cloud_name: CLOUDINARY_CLOUD_NAME,
      secure: true,
    });
    cloudinary.api.create_folder(`e-commerce`);
    cloudinary.api.create_folder(`e-commerce/${folderName}`);

    const uploadStream = () => {
      return new Promise((resolve, reject) => {
        const uploadedFile = cloudinary.uploader.upload_stream(
          {
            folder: `e-commerce/${folderName}`,
            use_filename: true,
            unique_filename: false,
            public_id: file?.originalname,
            overwrite: true,
          },
          async (error, result) => {
            if (error) {
              reject(error);
            }
            resolve(result);
          },
        );
        createReadStream(file.buffer).pipe(uploadedFile);
      });
    };

    const result: any = await uploadStream();

    return result?.secure_url;
  } catch (error) {
    return error;
  }
};

export default uploadFilesMiddleware;
