import React, { useState } from "react";

import { Button, Popconfirm, Popover, Table, Select, Input } from "antd";
import {
  DeleteOutlined,
  UploadOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import VaraintTable from "./variant-table";
import {
  useProducts,
  // useScrapeData,
  useBrandData,
  // addProducts,
  useCategoryData,
  updateBrandItem,
  useSubcategoryData,
} from "./hooks";
import { id } from "./constants";

import ModalImages from "./modal-images";

function ScrapeTable() {
  const [rowData, setRowData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [brandData] = useBrandData(id);
  const [products, productLoading] = useProducts(id);
  // const [{ data, isLoading }] = useScrapeData(brandData?.website);

  const onClose = () => {
    setModalVisible(false);
    setRowData(null);
  };

  return (
    <div>
      {brandData?.website && (
        <div>
          <Button
            type='primary'
            loading={false}
            icon={<UploadOutlined />}
            style={{ margin: "16px" }}
            // onClick={() => addProducts(data.products, brandData)}
            disabled={true}
          >
            Fetch Data
          </Button>
        </div>
      )}
      <Table
        loading={productLoading}
        dataSource={products}
        rowKey='id'
        size={"large"}
        pagination={{
          pageSize: 50,
        }}
        expandable={{
          expandedRowRender: (record) => <VaraintTable data={record} />,
        }}
        columns={[
          {
            title: "ID",
            dataIndex: "id",
          },
          {
            title: "Product Name",
            dataIndex: "name",
            sorter: {
              compare: (a, b) => a.name.localeCompare(b.name),
              multiple: 3,
            },
            render: (text, record) => (
              <Input
                value={text}
                onChange={(event) =>
                  updateBrandItem(record.id, { name: event.target.value })
                }
              ></Input>
            ),
          },
          {
            title: "Product Type",
            dataIndex: "productType",
            editable: true,
            sorter: {
              compare: (a, b) => a.productType.localeCompare(b.productType),
              multiple: 2,
            },
          },
          {
            title: "tags",
            dataIndex: "tags",
            render: (tags) => tags.join(", "),
            editable: true,
            width: "80px",
          },
          {
            title: "Category",
            dataIndex: "category",
            render: (value, record) => (
              <CategorySingleSelect value={value} id={record.id} />
            ),
          },
          {
            title: "Sub-Category",
            dataIndex: "subcategory",
            render: (value, record) =>
              record.category?.id ? (
                <SubcategorySingleSelect
                  value={value}
                  id={record.id}
                  categoryId={record.category.id}
                />
              ) : null,
          },
          {
            title: "Actions",
            dataIndex: "operation",
            render: (_, record) =>
              products.length >= 1 ? (
                <div
                  style={{
                    display: "flex",
                    width: "100px",
                    justifyContent: "space-around",
                  }}
                >
                  <div
                    onClick={() => {
                      setModalVisible(true);
                      setRowData(record);
                    }}
                  >
                    <Popover content='View Images'>
                      <FileImageOutlined
                        style={{ color: "grey", cursor: "pointer" }}
                      />
                    </Popover>
                  </div>
                  <div>
                    {" "}
                    <Popconfirm title='Sure to delete?' onConfirm={() => {}}>
                      <DeleteOutlined
                        style={{ color: "red", cursor: "pointer" }}
                      />
                    </Popconfirm>
                  </div>
                </div>
              ) : null,
          },
        ]}
      />
      {rowData && (
        <ModalImages
          modalData={rowData}
          isOpen={modalVisible}
          onClose={onClose}
        />
      )}
    </div>
  );
}

function CategorySingleSelect({ value, id }) {
  const [categoryData, loading] = useCategoryData();

  const onSelect = (_, option) => {
    updateBrandItem(id, {
      category: {
        id: option.id,
        name: option.name,
        banner: option.banner,
        slug: option.slug,
        image: option.image,
      },
    });
  };

  return (
    <Select
      loading={loading}
      placeholder='Select Category'
      onChange={onSelect}
      style={{ width: "100%" }}
      fieldNames={{ label: "name", value: "id" }}
      options={categoryData}
      value={value?.id}
    />
  );
}

function SubcategorySingleSelect({ value, id, categoryId }) {
  const [categoryData, loading] = useSubcategoryData(categoryId);

  const onSelect = (_, option) => {
    updateBrandItem(id, {
      subcategory: {
        id: option.id,
        name: option.name,
        banner: option.banner,
        slug: option.slug,
        image: option.image,
      },
    });
  };

  return (
    <Select
      loading={loading}
      placeholder='Select Subcategory'
      onChange={onSelect}
      style={{ width: "100%" }}
      fieldNames={{ label: "name", value: "id" }}
      options={categoryData}
      value={value?.id}
    />
  );
}

export default ScrapeTable;
