import { useState, useEffect } from "react";
import ReactCrop from "react-image-crop";
import { useDropzone } from "react-dropzone";
import "react-image-crop/dist/ReactCrop.css";
import "./App.css";

/*
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

const thumb-button = {
  position: "absolute",
  right: 10,
  bottom: 10,
};
*/

function App() {
  const [files, setFiles] = useState([]);
  const [crop, setCrop] = useState();
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
    console.log(img);
    setSelectedImage({ current: img });
    setEditImage(true);
  };

  const cancelEdit = () => {
    selectedImage.current = null;
    setCrop();
    setEditImage(false);
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

  const onCropComplete = (crop) => {
    makeClientCrop(crop);
  };

  const makeClientCrop = async (crop) => {
    if (selectedImage.current && crop.width && crop.height) {
      const croppedImageUrlUrl = await getCroppedImg(
        selectedImage.current,
        crop,
        "newFile.jpeg"
      );
      setcroppedImageUrl(croppedImageUrlUrl);
    }
  };

  const getCroppedImg = (file, crop, fileName) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = file;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scaleX = image.naturalWidth / 400;
        const scaleY = image.naturalHeight / 300;
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

  return (
    <section className="container">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>Drag and drop some files here, or click to select files</p>
      </div>
      <aside className="thumbs-container">{thumbs}</aside>
      {editImage && (
        <div className="thumbs-container">
          <div className="thumb">
            <ReactCrop
              className="thumb-inner"
              crop={crop}
              onChange={(c) => setCrop(c)}
            >
              <img className="img" src={selectedImage.current} />
            </ReactCrop>

            <div className="thumb-button">
              <button type="button" onClick={() => onCropComplete(crop)}>
                Done
              </button>
              <button type="button" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {croppedImageUrl && (
        <div className="thumb">
          <img src={croppedImageUrl}></img>
        </div>
      )}
    </section>
  );
}

export default App;
