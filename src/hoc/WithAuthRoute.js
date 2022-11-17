import React from "react";
import { getFirebase } from "../firebase";
import { Navigate } from "react-router-dom";
import { Space, Spin } from "antd";

import { useAuthState } from "react-firebase-hooks/auth";

export default function WithAuthRoute({ children }) {
  const { auth } = getFirebase();
  const [user, loading, error] = useAuthState(auth);
  if (loading)
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
  if (error) return <Navigate to='/login' />;
  if (!user) return <Navigate to='/login' />;
  return children;
}
