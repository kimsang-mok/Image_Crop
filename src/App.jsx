import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactCrop from "react-image-crop";
import { useDropzone } from "react-dropzone";
import ImageCropper from "./components/ImageCropper";

const thumbsContainer = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 16,
  padding: 20,
};

const thumb = {
  position: "relative",
  display: "inline-flex",
  justifyContent: "center",
  borderRadius: 2,
  border: "1px solid #eaeaea",
  marginBottom: 8,
  marginRight: 8,
  width: 400,
  height: 300,
  padding: 4,
  boxSizing: "border-box",
};

const thumbInner = {
  display: "flex",
  minWidth: 0,
  overflow: "hidden",
};

const img = {
  display: "block",
  width: "auto",
  height: "100%",
};

const thumbButton = {
  position: "absolute",
  right: 10,
  bottom: 10,
};

function App() {
  const [files, setFiles] = useState([]);
  const [crop, setCrop] = useState({ aspect: 4 / 3 });
  const imgRef = useRef(null);
  const [editImage, setEditImage] = useState(false);

  const [selectedImage, setSelectedImage] = useState({ current: null });

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
    console.log(img);
    selectedImage.current = img;
    setEditImage(true);
  };

  const cancelEdit = () => {
    selectedImage.current = null;
    setCrop({ aspect: 4 / 3 });
    setEditImage(false);
  };

  const thumbs = files.map((file, index) => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img src={file.preview} style={img} alt="" />
      </div>

      <button
        style={thumbButton}
        onClick={() => {
          onEditClick(file.preview);
        }}
      >
        Edit
      </button>
    </div>
  ));

  console.log(selectedImage);

  const onCropComplete = (crop) => {
    makeClientCrop(crop);
  };

  const makeClientCrop = async (crop) => {
    if (selectedImage.current && crop.width && crop.height) {
      const croppedImageUrl = await getCroppedImg(
        selectedImage.current,
        crop,
        "newFile.jpeg"
      );
      console.log(croppedImageUrl);
    }
  };

  const getCroppedImg = (file, crop, fileName) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = file;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext("2d");

        console.log(image);
        console.log("type of image", typeof image);

        ctx.drawImage(
          image,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height
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

  return (
    <section className="container">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <aside style={thumbsContainer}>{thumbs}</aside>
      <div>
        {editImage && (
          <>
            <ReactCrop
              // src={imgRef.current}
              crop={crop}
              // onImageLoaded={onImageLoaded}
              onChange={(c) => setCrop(c)}
              // onComplete={onCropComplete}
            >
              <img src={selectedImage.current} />
            </ReactCrop>
            <button type="button" onClick={() => onCropComplete(crop)}>
              Done
            </button>
            <button type="button" onClick={cancelEdit}>
              Cancel
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export default App;
