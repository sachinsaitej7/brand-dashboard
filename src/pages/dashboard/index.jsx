import { ShopOutlined, UserOutlined, ScanOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { getFirebase } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

import { ReactComponent as Logo } from "../../assets/images/logo-full.svg";
import {
  ProductsPage,
  UploadProductsPage,
  ScrapePage,
} from "./module-registry";

const { auth } = getFirebase();

const { Header, Content, Footer, Sider } = Layout;

const Dashboard = () => {
  const [user, userLoading] = useAuthState(auth);
  const [state, setState] = useState({ key: "3" });
  const items = [
    {
      key: "1",
      icon: <UserOutlined />,
      label: <span>Logout</span>,
      onClick: () => signOut(auth),
    },
    {
      key: "2",
      icon: <ShopOutlined />,
      label: <span>Products</span>,
      onClick: () => setState({ key: "2" }),
    },
    {
      key: "3",
      icon: <ScanOutlined />,
      label: <span>Scrape a website</span>,
      onClick: () => setState({ key: "3" }),
    },
  ];

  if (userLoading) return null;

  return (
    <Layout hasSider>
      <Sider
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <Logo width='80px' />
        <Menu
          theme='dark'
          mode='inline'
          defaultSelectedKeys={["3"]}
          items={items}
          selectedKeys={[state.key]}
        />
      </Sider>
      <Layout
        className='site-layout'
        style={{
          marginLeft: 200,
        }}
      >
        <Header
          className='site-layout-background'
          style={{
            padding: 0,
          }}
        >
          <UserOutlined /> {user.displayName}
        </Header>
        <Content
          style={{
            margin: "24px 16px 0",
            overflow: "initial",
          }}
        >
          <div
            className='site-layout-background'
            style={{
              padding: 24,
              textAlign: "center",
            }}
          >
            {state.key === "2" && <ProductsPage />}
            {state.key === "3" && <ScrapePage />}
            {state.key === "4" && <UploadProductsPage />}
          </div>
        </Content>
        <Footer
          style={{
            textAlign: "center",
          }}
        >
          Clock ©2022
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
