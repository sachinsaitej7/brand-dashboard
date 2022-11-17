import React from "react";
import { Table } from "antd";
import { useProducts, useProductVaraints } from "./hooks";
import { id } from "./constants";

function VariantTable({ productId }) {
  const [variants] = useProductVaraints(productId);
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Size",
      dataIndex: ["size", "values"],
    },
    {
      title: "Color",
      dataIndex: ["color", "name"],
    },
    {
      title: "Price",
      dataIndex: ["price", "currentPrice"],
    },
    {
      title: "Quantity",
      dataIndex: ["stock", "quantity"],
    },
    {
      title: "status",
      dataIndex: "status",
      render: (text) => String(text),
    },
  ];
  return (
    <Table
      dataSource={variants}
      rowKey='id'
      columns={columns}
      pagination={false}
    />
  );
}

const ProductsTable = () => {
  const [products,productLoading] = useProducts(id);
  const columns = [
    {
      title: "SKU",
      dataIndex: "id",
    },
    {
      title: "name",
      dataIndex: "name",
    },
    {
      title: "price",
      dataIndex: ["price", "currentPrice"],
    },
    {
      title: "category",
      dataIndex: ["category", "name"],
    },
    {
      title: "sub-category",
      dataIndex: ["sub_category", "name"],
    },
    {
      title: "status",
      dataIndex: "status",
      render: (text) => String(text),
    },
  ];
  return (
    <Table
      dataSource={products}
      rowKey='id'
      columns={columns}
      loading={productLoading}
      expandable={{
        expandedRowRender: (record) => <VariantTable productId={record.id} />,
      }}
    />
  );
};

export default ProductsTable;
