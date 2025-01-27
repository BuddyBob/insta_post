import React, { useState, useEffect } from "react";
import { openDB } from "idb";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./component.css";

const dbPromise = openDB("imageDB", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("images")) {
      db.createObjectStore("images", { keyPath: "id", autoIncrement: true });
    }
  },
});

const ImageUpload = () => {
  const [images, setImages] = useState([]);
  const [enlargedImageIndex, setEnlargedImageIndex] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      const db = await dbPromise;
      const allImages = await db.getAll("images");
      setImages(allImages.map((item) => item.url));
    };
    fetchImages();
  }, []);

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    const db = await dbPromise;

    const fileReaders = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReaders).then(async (base64Images) => {
      for (const base64 of base64Images) {
        await db.add("images", { url: base64 });
      }
      setImages((prevImages) => [...prevImages, ...base64Images]);
    });
  };

  const handleRemoveImage = async (index) => {
    const db = await dbPromise;
    const updatedImages = [...images];
    const [removedImage] = updatedImages.splice(index, 1);
    setImages(updatedImages);

    const allImages = await db.getAll("images");
    const imageToDelete = allImages.find((img) => img.url === removedImage);
    if (imageToDelete) {
      await db.delete("images", imageToDelete.id);
    }
  };

  const handleImageDoubleClick = (index) => {
    setEnlargedImageIndex(index);
  };

  const closeEnlargedImage = () => {
    setEnlargedImageIndex(null);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedImages = Array.from(images);
    const [movedImage] = reorderedImages.splice(result.source.index, 1);
    reorderedImages.splice(result.destination.index, 0, movedImage);

    setImages(reorderedImages);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (enlargedImageIndex !== null) {
        if (event.key === "ArrowRight") {
          setEnlargedImageIndex((prevIndex) =>
            prevIndex < images.length - 1 ? prevIndex + 1 : 0
          );
        } else if (event.key === "ArrowLeft") {
          setEnlargedImageIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : images.length - 1
          );
        } else if (event.key === "Escape") {
          closeEnlargedImage();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enlargedImageIndex, images]);

  return (
    <div className="image-upload-container">
      <label htmlFor="file-upload" className="custom-file-upload">
        Choose Files
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
      />
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="image-upload-display"
          direction="horizontal"
          isDropDisabled={false}
        >
          {(provided) => (
            <div
              className="image-upload-display"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {images.map((image, index) => (
                <Draggable key={image} draggableId={image} index={index}>
                  {(provided) => (
                    <div
                      className="image-upload-item"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <img
                        src={image}
                        alt={`Uploaded ${index + 1}`}
                        className="image-upload-img"
                        onDoubleClick={() => handleImageDoubleClick(index)}
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="image-upload-remove-btn"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {enlargedImageIndex !== null && (
        <div className="enlarged-image-overlay" onClick={closeEnlargedImage}>
          <div className="image-counter">
            {enlargedImageIndex + 1} / {images.length}
          </div>
          <img
            src={images[enlargedImageIndex]}
            alt="Enlarged"
            className="enlarged-image"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
