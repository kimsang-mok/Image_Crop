import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import "react-image-crop/dist/ReactCrop.css";
import "./App.css";
import ImageCropModal from "./components/ImageCropModal";

function App() {
  const [files, setFiles] = useState([]);
  const [editImage, setEditImage] = useState(false);

  const [selectedImage, setSelectedImage] = useState({ current: null });

  const [croppedImageUrl, setcroppedImageUrl] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });
  const onEditClick = (img) => {
    setSelectedImage({ current: img });
    setEditImage(true);
  };


  const thumbs = files.map((file) => (
    <div className="thumb" key={file.name}>
      <div className="thumb-inner">
        <img src={file.preview} className="img" alt="" />
      </div>

      <button
        className="thumb-button"
        onClick={() => {
          onEditClick(file.preview);
        }}
      >
        Edit
      </button>
    </div>
  ));

  // const onCropComplete = (crop, fullImgWidth, fullImgHeight) => {
  //   makeClientCrop(crop, fullImgWidth, fullImgHeight);
  // };

  const makeClientCrop = async (crop, fullImgWidth, fullImgHeight) => {
    if (selectedImage.current && crop.width && crop.height) {
      const croppedImageUrlUrl = await getCroppedImg(
        selectedImage.current,
        crop,
        "newFile.jpeg",
        fullImgWidth,
        fullImgHeight
      );
      setcroppedImageUrl(croppedImageUrlUrl);
    }
  };

  const getCroppedImg = (file, crop, fileName, fullImgWidth, fullImgHeight) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = file;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scaleX = image.naturalWidth / fullImgWidth;
        const scaleY = image.naturalHeight / fullImgHeight;
        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(
          image,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          canvas.width,
          canvas.height
        );

        canvas.toBlob((blob) => {
          if (!blob) {
            console.error("Canvas is empty");
            reject(new Error("Canvas is empty"));
            return;
          }
          blob.name = fileName;
          const croppedImageUrl = window.URL.createObjectURL(blob);
          resolve(croppedImageUrl);
        }, "image/jpeg");
      };
      image.onerror = () => {
        reject(new Error("Image loading error"));
      };
    });
  };

  useEffect(
    () => () => {
      // Make sure to revoke the Object URL to avoid memory leaks
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    },
    [files]
  );

  console.log(croppedImageUrl);

  return (
    <>
      <section className="container">
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />
          <p>Drag and drop some files here, or click to select files</p>
        </div>
        <aside className="thumbs-container">{thumbs}</aside>

        {croppedImageUrl && (
          <div className="thumb">
            <img src={croppedImageUrl}></img>
          </div>
        )}
      </section>

      {editImage && (
        <div className="">
          <ImageCropModal
            selectedImage={selectedImage.current}
            // onCropComplete={onCropComplete}
            // cancelEdit={cancelEdit}
            setSelectedImage={setSelectedImage}
            setEditImage={setEditImage}
            makeClientCrop={makeClientCrop}
          />
        </div>
      )}
    </>
  );
}

export default App;
