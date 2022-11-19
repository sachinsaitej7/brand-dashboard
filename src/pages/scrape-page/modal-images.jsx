import React from "react";
import { Modal, Image, Skeleton } from "antd";
import { useProductImages } from "./hooks";

const ModalImages = ({ modalData, isOpen, onClose }) => {
  const [images, loading] = useProductImages(modalData.id);
  return (
    <Modal
      title='View Product Images'
      open={isOpen}
      onCancel={onClose}
      okText={null}
    >
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {loading &&
          Array(4).map((_, index) => (
            <Skeleton.Image active={true} key={index} />
          ))}
        {!loading &&
          images?.map((image) => {
            return (
              <div key={image.id} style={{ padding: "8px", width: "100px" }}>
                <Image src={image.url} style={{ borderRadius: "4px" }} />
              </div>
            );
          })}
      </div>
    </Modal>
  );
};

export default ModalImages;
