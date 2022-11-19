import React from "react";
import { Button, Table, Popconfirm, Select, Cascader, Input } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import {
  updateBrandItemVariant,
  useColorData,
  useSizeData,
  useProductVariants,
} from "./hooks";

export default function VaraintTable({ data }) {
  const [variants, loading] = useProductVariants(data.id);
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Size",
      dataIndex: "option1",
      key: "option1",
      editable: true,
      render: (text, record) => (
        <>
          <span style={{ marginBottom: "4px" }}>Scraped Value: {text}</span>
          <SizeSingleSelect record={record} data={data} />
        </>
      ),
    },
    {
      title: "Color",
      dataIndex: "option2",
      key: "option2",
      render: (text, record) => (
        <>
          <span style={{ marginBottom: "4px" }}>Scraped Value: {text}</span>
          <ColorSingleSelect data={data} record={record} />
        </>
      ),
      editable: true,
    },
    {
      title: "Price",
      dataIndex: ["price", "currentPrice"],
      key: "price",
      editable: true,
      render: (text, record) => (
        <>
          <span style={{ marginBottom: "4px" }}>Scraped Value: {text}</span>
          <Input
            defaultValue={text}
            disabled={record.status === "approved"}
            type='number'
            onBlur={(e) =>
              updateBrandItemVariant(data.id, record.id, {
                price: {
                  ...record.price,
                  currentPrice: Number(e.target.value),
                },
              })
            }
          />
        </>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      editable: true,
    },
    {
      title: "Weight(gms)",
      dataIndex: "grams",
      key: "grams",
    },
    {
      title: "In Stock",
      dataIndex: "available",
      key: "available",
      render: (text) => String(text),
    },
    {
      title: "Actions",
      dataIndex: "operation",
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            width: "100px",
            justifyContent: "space-around",
          }}
        >
          <div style={{ marginRight: "8px" }}>
            <Button
              type='outline'
              onClick={() => {
                updateBrandItemVariant(data.id, record.id, {
                  status: "approved",
                });
              }}
              disabled={record.status === "approved"}
            >
              Approve
            </Button>
          </div>
          <div>
            {" "}
            <Popconfirm title='Sure to delete?' onConfirm={() => {}}>
              <DeleteOutlined style={{ color: "red", cursor: "pointer" }} />
            </Popconfirm>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Table
      dataSource={variants}
      rowKey='id'
      columns={columns}
      pagination={false}
      loading={loading}
      editable
      size='small'
    />
  );
}

function ColorSingleSelect({ data, record }) {
  const [colorData, loading] = useColorData();

  const onSelect = (_, option) => {
    updateBrandItemVariant(data.id, record.id, {
      color: {
        id: option.id,
        name: option.name,
        description: option.description,
        hexcode: option.hexcode,
      },
    });
  };

  return (
    <Select
      loading={loading}
      disabled={record.status === "approved"}
      placeholder='Choose Color'
      onChange={onSelect}
      style={{ width: "100%" }}
      fieldNames={{ label: "name", value: "id" }}
      options={colorData}
      value={record.color?.name}
    />
  );
}

function SizeSingleSelect({ record, data }) {
  const [sizeData, loading] = useSizeData();

  const onSelect = (t, option) => {
    updateBrandItemVariant(data.id, record.id, {
      size: {
        id: option[0].id,
        name: t[0],
        description: option[0].description,
        values: option[1].values,
      },
    });
  };

  const options = sizeData?.map((i) => {
    return {
      ...i,
      id: i.name,
      children: i.values.map((j) => {
        return {
          id: j,
          description: i.description,
          values: j,
          name: j,
        };
      }),
    };
  });

  return (
    <Cascader
      loading={loading}
      placeholder='Choose size'
      onChange={onSelect}
      style={{ width: "100%" }}
      fieldNames={{ label: "name", value: "id" }}
      options={options}
      value={record.size?.values}
      disabled={record.status === "approved"}
    />
  );
}
