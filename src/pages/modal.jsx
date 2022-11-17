import React, { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Upload, Modal } from "antd";

import { getFirebase } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

import { getImages, addImages } from "./products-page/hooks";

const { auth } = getFirebase();

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const ModalImages = ({ modalData, close }) => {
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileList, setFileList] = useState([]);
  const [user] = useAuthState(auth);

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(
      newFileList.map((image) => {
        return {
          ...image,
          status: "done",
        };
      })
    );
  };

  const handlePreviewCancel = () => setPreviewOpen(false);
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };

  useEffect(() => {
    if (modalData.id)
      getImages(modalData.id).then((images) => {
        const newImages = images.map((image) => {
          return {
            uid: image.id,
            name: image.name,
            status: "done",
            type: image.type,
            url: image.url,
            thumbUrl: image.url,
          };
        });
        setFileList(newImages);
      });
  }, [modalData.id]);

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </div>
  );

  const handleOk = () => {
    setIsModalVisible(false);
    console.log(fileList);
    addImages(modalData.id, fileList, user).then(() => {
      close(false);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    close(false);
  };

  console.log(fileList, "Cancel");

  return (
    <Modal
      title='Upload Product Images'
      open={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText='Save'
    >
      <Upload
        listType='picture-card'
        fileList={fileList}
        onChange={handleChange}
        accept='image/*'
        maxCount={5}
        multiple={true}
        onPreview={handlePreview}
        method={null}
        // customRequest={() => {}}
      >
        {fileList.length >= 8 ? null : uploadButton}
      </Upload>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handlePreviewCancel}
      >
        <img
          alt='product-error'
          style={{
            width: "100%",
          }}
          src={previewImage}
        />
      </Modal>
    </Modal>
  );
};

export default ModalImages;
