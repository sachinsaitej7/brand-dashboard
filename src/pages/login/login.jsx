import { LockOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Layout,
  notification,
  Space,
  Spin,
} from "antd";
import React, { useEffect } from "react";
import { ReactComponent as Logo } from "../../assets/images/logo-full.svg";
import {
  useSignInWithEmailAndPassword,
  useAuthState,
} from "react-firebase-hooks/auth";

import { getFirebase } from "../../firebase";
import { useNavigate } from "react-router-dom";

const { Header, Footer, Content } = Layout;

const SignInForm = () => {
  const { auth } = getFirebase();
  const navigate = useNavigate();

  const [signInWithEmailAndPassword, , , error] =
    useSignInWithEmailAndPassword(auth);

  const [user, userLoading] = useAuthState(auth);

  useEffect(() => {
    if (error) {
      notification.error({
        message: "Invalid Credentials",
        //   description: error.message,
      });
    }
  }, [error]);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, userLoading, navigate]);

  const onFinish = ({ username, password, remember }) => {
    signInWithEmailAndPassword(username, password);
    // if (remember) auth.setPersistence(auth.Auth.Persistence.LOCAL);
  };

  if (userLoading)
    return (
      <Space
        direction='vertical'
        size='large'
        align='center'
        style={{ marginTop: "50px" }}
      >
        <Spin size='large' />
      </Space>
    );

  return (
    <Layout>
      <Header style={{ color: "white" }}>
        {" "}
        <Logo width='60px' />
        <span></span>
      </Header>
      <Content>
        <Form
          name='normal_login'
          className='login-form'
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
        >
          <h3>Login</h3>
          <Form.Item
            name='username'
            rules={[
              {
                required: true,
                message: "Please input your Username!",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className='site-form-item-icon' />}
              placeholder='Username'
            />
          </Form.Item>
          <Form.Item
            name='password'
            rules={[
              {
                required: true,
                message: "Please input your Password!",
              },
            ]}
          >
            <Input
              prefix={<LockOutlined className='site-form-item-icon' />}
              type='password'
              placeholder='Password'
            />
          </Form.Item>
          <Form.Item>
            <Form.Item name='remember' valuePropName='checked' noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
          </Form.Item>

          <Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              className='login-form-button'
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Content>
      <Footer>
        <div>Copyright © 2022 Clock</div>
      </Footer>
    </Layout>
  );
};

export default SignInForm;
