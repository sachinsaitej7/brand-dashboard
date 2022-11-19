import React from "react";
import { Table } from "antd";
import { useProducts, useProductVaraints } from "./hooks";
import { id } from "./constants";

function VariantTable({ productId }) {
  const [variants, loading] = useProductVaraints(productId);
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: "10%",
    },
    {
      title: "Size",
      dataIndex: ["size", "values"],
      render: (text) => text || "N/A",
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
      size='small'
      loading={loading}
    />
  );
}

const ProductsTable = () => {
  const [products, productLoading] = useProducts(id);
  const columns = [
    {
      title: "SKU",
      dataIndex: "id",
    },
    {
      title: "name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "price",
      dataIndex: ["price", "currentPrice"],
      sorter: (a, b) => a.price.currentPrice - b.price.currentPrice,
    },
    {
      title: "category",
      dataIndex: ["category", "name"],
      sorter: (a, b) => a.category?.name.localeCompare(b.category?.name),
      render: (text) => text || "N/A",
    },
    {
      title: "sub-category",
      dataIndex: ["subcategory", "name"],
      render: (text) => text || "N/A",
    },
    {
      title: "Updated at",
      dataIndex: "updatedAt",
      render: (text) => text.toDate().toLocaleString(),
      sorter: (a, b) => a.updatedAt - b.updatedAt,
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
      pagination={{
        pageSize: 50,
      }}
      expandable={{
        expandedRowRender: (record) => <VariantTable productId={record.id} />,
      }}
    />
  );
};

export default ProductsTable;
