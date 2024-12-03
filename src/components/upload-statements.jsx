import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Radio,
  Tabs,
  Tooltip,
  Button,
  Card,
  DatePicker,
  message,
} from "antd";
import { CopyOutlined, RightOutlined } from "@ant-design/icons";
import FileUpload from "./file-upload";
import useClientStore from "../store/useClientStore";
import axios from "axios";

const Statements = () => {
  const [form] = Form.useForm();
  const { searchedClient, setClientStatement, setClients } = useClientStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [isLoading, setIsLoading] = useState(false);
  const key = "updatable";

  const TabItems = [
    {
      key: "1",
      label: "Upload Statement",
    },
  ];

  useEffect(() => {
    getAllClient();
  }, []);

  const getAllClient = async () => {
    await axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/client`)
      .then((response) => {
        setClients(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedDate = values.monthYear.format('YYYY-MM');
      
      const formData = new FormData();
      formData.append("accessCode", searchedClient?.accessCode);
      formData.append("clientName", searchedClient?.clientName);
      formData.append("id", searchedClient?.id);
      formData.append("pdfFile", values?.uploadedFile);
      formData.append("monthReference", formattedDate); 

      // Show loading message without duration (will stay until manually changed)
      messageApi.open({
        key,
        type: "loading",
        content: "Uploading statement...",
        duration: 0, // This makes the message stay until we manually close it
      });

      setIsLoading(true);

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/process-statement`,
          formData
        );

      
        // Only close the loading message if we get a successful response
        if (response.status === 200) {
          messageApi.open({
            key,
            type: "success",
            content: response.data.databaseOperation.message,
            duration: 2,
          });
          setClientStatement(response.data);
          form.resetFields();
          setIsLoading(false);
        } else {
          // Keep showing loading if status is not 200
          messageApi.open({
            key,
            type: "loading",
            content: "Still processing...",
            duration: 0,
          });
        }
      } catch (error) {
        // Show error message if request fails
        messageApi.open({
          key,
          type: "error",
          content: error.response?.data?.error || "Failed to submit statement",
          duration: 2,
        });
      }
    } catch (errorInfo) {
      console.log("Validation failed:", errorInfo);
      message.error("Please fill in all required fields correctly");
    }
  };

  return (
    <>
      {contextHolder}
      <Tabs defaultActiveKey="1" items={TabItems} />
      <Card
        title=""
        bordered={false}
        style={{
          paddingRight: 16,
          paddingLeft: 16,
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            accessCode: searchedClient?.accessCode
              ? searchedClient?.accessCode
              : "",
            clientName: searchedClient?.clientName
              ? searchedClient?.clientName
              : "",
          }}
        >
          <Form.Item
            name="accessCode"
            label="Access Code"
            tooltip="Access codes are necessary"
          >
            <Input
              placeholder={searchedClient?.accessCode}
              className="accessCodeInput"
              size="large"
              suffix={
                <Tooltip title="Click to copy">
                  <CopyOutlined
                    style={{
                      color: "rgba(0,0,0,.45)",
                    }}
                  />
                </Tooltip>
              }
              disabled
            />
          </Form.Item>

          <Form.Item name="clientName" label="Client Name">
            <Input
              placeholder={searchedClient?.clientName}
              size="large"
              disabled
            />
          </Form.Item>

          <Form.Item
            name="uploadedFile"
            label="Upload File"
            rules={[{ required: true, message: "Please upload a file" }]}
          >
            <FileUpload />
          </Form.Item>

          <Form.Item
            name="monthYear"
            label="Month/Year"
            rules={[
              { required: true, message: "Please select month and year" },
            ]}
          >
            <DatePicker
              placeholder="Select month and year"
              style={{ width: "50%" }}
              picker="month"
            />
          </Form.Item>

          <Button
            type="primary"
            shape="round"
            icon={<RightOutlined />}
            iconPosition="end"
            size="large"
            onClick={handleSubmit}
            style={{
              background: "#3361ff",
            }}
            loading={isLoading}
          >
            Next
          </Button>
        </Form>
      </Card>
    </>
  );
};

export default Statements;
