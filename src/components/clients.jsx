import React, { useEffect } from "react";
import {
  Collapse,
  Form,
  Input,
  Radio,
  Tabs,
  Tooltip,
  Button,
  message,
  Select,
} from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import useClientStore from "../store/useClientStore";

const Clients = () => {
  const [form] = Form.useForm();
  const store = useClientStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { clientData, editing } = location.state || {};

  useEffect(() => {
    if (editing && clientData) {
      form.setFieldsValue({
        accessCode: clientData.accessCode,
        clientName: clientData.clientName,
        contactPhone: clientData.contactPhone,
        contactName: clientData.contactName,
        clientType: clientData.clientType,
      });
    }
  }, [form, editing, clientData]);

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const apiUrl = editing
        ? `${import.meta.env.VITE_API_BASE_URL}/update-client/${
            clientData.clientId
          }`
        : `${import.meta.env.VITE_API_BASE_URL}/add-client`;

      const method = editing ? axios.put : axios.post;

      await method(apiUrl, values)
        .then((response) => {
          message.success(response.data.message);
          form.resetFields();
          navigate("/client-list");
        })
        .catch((error) => {
          message.error(error.response?.data?.error || "Something went wrong");
        });
    } catch (errorInfo) {
      console.log("Validation failed:", errorInfo);
    }
  };

  const items = [
    {
      key: "1",
      label: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Radio style={{ marginRight: "8px" }} defaultChecked />
          <span>Personal Information</span>
        </div>
      ),
      children: (
        <div>
          <Form form={form} layout="vertical">
            <Form.Item
              label="Access Code"
              name="accessCode"
              tooltip="Access codes are necessary"
              rules={[{ required: true, message: "Access Code is required!" }]}
            >
              <Input
                placeholder="123456"
                suffix={
                  <Tooltip title="Click to copy">
                    <CopyOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                  </Tooltip>
                }
                size="large"
              />
            </Form.Item>
            <Form.Item
              label="Client Name"
              name="clientName"
              rules={[{ required: true, message: "Client Name is required!" }]}
            >
              <Input
                placeholder="Acme Corp"
                suffix={
                  <Tooltip title="Click to copy">
                    <CopyOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                  </Tooltip>
                }
                size="large"
              />
            </Form.Item>
            <Form.Item
              label="Contact Name"
              name="contactName"
              rules={[{ required: true, message: "Contact Name is required!" }]}
            >
              <Input
                placeholder="John Doe"
                suffix={
                  <Tooltip title="Click to copy">
                    <CopyOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                  </Tooltip>
                }
                size="large"
              />
            </Form.Item>
            <Form.Item
              label="Contact Phone"
              name="contactPhone"
              rules={[
                { required: true, message: "Contact Phone is required!" },
              ]}
            >
              <Input
                placeholder="333-444-5555"
                suffix={
                  <Tooltip title="Click to copy">
                    <CopyOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                  </Tooltip>
                }
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Client Type"
              name="clientType"
              rules={[{ required: true, message: "Client type is required!" }]}
            >
              <Select
                showSearch
                placeholder="Select a client type"
                options={[
                  { value: "Business", label: "Business" },
                  { value: "Individual", label: "Individual" },
                ]}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" onClick={onSubmit}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ];

  const TabItems = [
    {
      key: "1",
      label: "Basic Info",
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Tabs defaultActiveKey="1" items={TabItems} />
        <Button variant="solid" color="primary" href="/client-list">
          Go back
        </Button>
      </div>

      <Collapse
        defaultActiveKey={["1"]}
        expandIconPosition="end"
        items={items}
      />
    </>
  );
};

export default Clients;
