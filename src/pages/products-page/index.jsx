import React from "react";
import { Layout } from "antd";
import Table from "./table";

const { Content } = Layout;

const ProductsPage = () => {
  return (
    <Layout>
      <Content>
        <Table />
      </Content>
    </Layout>
  );
};

export default ProductsPage;