import React from "react";
import { Modal, Image } from "antd";

const ModalImages = ({ modalData, isOpen, onClose }) => {
  return (
    <Modal title='View Product Images' open={isOpen} onCancel={onClose} okText={null}>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {modalData?.images.map((image) => {
          return (
            <div key={image.id} style={{ padding: "8px", width: "100px" }}>
              <Image src={image.src} style={{ borderRadius: "4px" }} />
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default ModalImages;
