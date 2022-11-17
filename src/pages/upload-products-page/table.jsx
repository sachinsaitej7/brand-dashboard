import { Button, Form, Input, Popconfirm, Popover, Table } from "antd";
import React, { useContext, useEffect, useRef, useState } from "react";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";

import { getData, updateItem, deleteItem, addItem, getDocRef } from "./hooks";
import ModalImages from "../modal";
import { useAuthState } from "react-firebase-hooks/auth";
import { getFirebase } from "../../firebase";

const { auth } = getFirebase();
const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
      await updateItem(record.id, values);
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: ["size", "quantity"].includes(dataIndex) ? false : true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className='editable-cell-value-wrap'
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const ProductTable = () => {
  const [items, setItems] = useState([]);
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    setLoading(true);
    getData(user)
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  const handleDelete = (id) => {
    const newItems = items.filter((item) => item.id !== id);
    deleteItem(id);
    setItems(newItems);
  };

  const defaultColumns = [
    {
      title: "ID",
      dataIndex: "id",
      width: "5%",
    },
    {
      title: "Product Name",
      dataIndex: "name",
      width: "25%",
      editable: true,
    },
    {
      title: "Product Price",
      dataIndex: "price",
      width: "10%",
      editable: true,
    },
    {
      title: "Size",
      dataIndex: "size",
      editable: true,
    },
    {
      title: "Color",
      dataIndex: "color",
      editable: true,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      editable: true,
    },
    {
      title: "Actions",
      dataIndex: "operation",
      render: (_, record) =>
        items.length >= 1 ? (
          <div
            style={{
              display: "flex",
              width: "100px",
              justifyContent: "space-around",
            }}
          >
            <div
              onClick={() => {
                setIsModalVisible(true);
                setModalData(record);
              }}
            >
              <Popover content='Upload Images'>
                <UploadOutlined style={{ color: "grey", cursor: "pointer" }} />
              </Popover>
            </div>
            <div>
              {" "}
              <Popconfirm
                title='Sure to delete?'
                onConfirm={() => handleDelete(record.id)}
              >
                <DeleteOutlined style={{ color: "red", cursor: "pointer" }} />
              </Popconfirm>
            </div>
          </div>
        ) : null,
    },
  ];

  const handleAdd = () => {
    const newItemRef = getDocRef();
    const newData = {
      id: newItemRef.id,
      name: `-`,
      price: `-`,
      size: `-`,
      color: `-`,
      quantity: 0,
      createdBy: user.uid,
    };
    setItems([...items, newData]);
    addItem(newItemRef, newData);
  };

  const handleSave = (row) => {
    const newData = [...items];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setItems(newData);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <Table
        components={components}
        rowClassName={() => "editable-row"}
        bordered
        dataSource={items}
        columns={columns}
      />
      <Button
        onClick={handleAdd}
        type='primary'
        style={{
          marginTop: "16px",
          marginBottom: "16px",
        }}
        disabled={items.length > 10 ? true : false}
      >
        Add a Product
      </Button>
      {isModalVisible && (
        <ModalImages close={setIsModalVisible} modalData={modalData} />
      )}
    </div>
  );
};

export default ProductTable;
