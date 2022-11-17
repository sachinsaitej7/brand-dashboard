import React from "react";
import { Button, Table, Popconfirm, Select, Cascader, Input } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import { updateBrandItem, useColorData, useSizeData } from "./hooks";

export default function VaraintTable({ data }) {
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
      dataIndex: "price",
      key: "price",
      editable: true,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            updateBrandItem(data.id, {
              variants: data.variants.map((i) => {
                if (i.id === record.id) {
                  return { ...i, price: e.target.value };
                }
                return i;
              }),
            })
          }
        />
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
                updateBrandItem(data.id, {
                  variants: data.variants.map((i) => {
                    if (i.id === record.id) {
                      return {
                        ...i,
                        status: "approved",
                      };
                    }
                    return i;
                  }),
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
      dataSource={data.variants}
      rowKey='id'
      columns={columns}
      pagination={false}
      editable
    />
  );
}

function ColorSingleSelect({ data, record }) {
  const [colorData, loading] = useColorData();

  const onSelect = (_, option) => {
    updateBrandItem(data.id, {
      variants: data.variants.map((i) => {
        if (i.id === record.id) {
          return {
            ...i,
            color: option,
          };
        }
        return i;
      }),
    });
  };

  return (
    <Select
      loading={loading}
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
    updateBrandItem(data.id, {
      variants: data.variants.map((i) => {
        if (i.id === record.id) {
          return {
            ...i,
            size: { ...option[1], name: t[0], id: option[0].id },
          };
        }
        return i;
      }),
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
    />
  );
}
