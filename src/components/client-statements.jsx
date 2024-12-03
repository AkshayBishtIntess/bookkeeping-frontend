import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Space,
  Table,
  Modal,
  message,
  Row,
  Col,
  Card,
  Input,
  Tooltip,
  Typography,
  Select,
  Form,
} from "antd";
import {
  EyeOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";
import axios from "axios";
import useClientStore from "../store/useClientStore";
import { CopyIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const { confirm } = Modal;

const ClientStatements = () => {
  const [clients, setClients] = useState([]);
  const location = useLocation();
  const clientData = location.state?.clientData;

  const store = useClientStore();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleNavigate = (record) => {
    navigate("/statement-history", { state: { clientData: record } });
  };

  const columns = [
    {
      title: "SNo.",
      key: "index", // Add a key for this column
      render: (text, record, index) =>
        tableParams.pagination.pageSize * (tableParams.pagination.current - 1) +
        index +
        1,
    },
    {
      title: "Bank Name",
      dataIndex: "bankName",
      sorter: (a, b) => a.bankName.length - b.bankName.length,
    },
    {
      title: "Account Number",
      dataIndex: "accountNumber",
      sorter: (a, b) => a.accountNumber.length - b.accountNumber.length,
    },
    {
      title: "Account Holder",
      dataIndex: "accountHolder",
      sorter: (a, b) => a.accountHolder.length - b.accountHolder.length,
    },
    {
      title: "Beginning Balance",
      dataIndex: "beginningBalance",
      sorter: (a, b) => a.beginningBalance.length - b.beginningBalance.length,
    },
    {
      title: "Ending Balance",
      dataIndex: "endingBalance",
      sorter: (a, b) => a.endingBalance.length - b.endingBalance.length,
    },

    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            className="actionBtnColors"
            shape="circle"
            icon={<EyeOutlined />}
            onClick={() => handleNavigate(record)}
          />
        </Space>
      ),
    },
  ];

  useEffect(() => {
    const client = clientData.statements.map((items, index) => {
      return {
        id: index + 1,
        bankName: items?.accountInfo.bankName
          ? items?.accountInfo?.bankName
          : "-",
        accountNumber: items?.accountInfo?.accountNumber,
        accountHolder: items?.accountInfo?.accountHolder,
        beginningBalance: `$${items?.accountInfo?.balances?.beginning}`,
        endingBalance: `$${items?.accountInfo?.balances?.ending}`,
        accountId: items?.accountId,
        transactions: items?.transactions,
        summary: items?.summary,
        checks: items?.checks,
        clientId: items?.clientId,
        clientName: items?.clientName,
      };
    });
    setClients(client);
  }, []);

  console.log(clientData);

  // const [data, setData] = useState(dummyData);
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 5,
      total: 0,
      pageSizeOptions: ["5", "10", "20", "50"],
      showSizeChanger: true,
    },
    filters: {},
  });

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });

    // If you need to fetch data when page size changes
    if (pagination.pageSize !== tableParams.pagination.pageSize) {
      setLoading(true);
      // Fetch your data here with new page size
      fetchData(pagination.current, pagination.pageSize);
    }
  };

  // Example data fetching function
  const fetchData = (page, pageSize) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Update your data here
      setLoading(false);
      setTableParams((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          current: page,
          pageSize: pageSize,
          total: clients.length, // Update with your total count
        },
      }));
    }, 1000);
  };

  useEffect(() => {
    fetchData(tableParams.pagination.current, tableParams.pagination.pageSize);
  }, []);

  // CONFIRMATION MODAL FOR DELETION
  const showDeleteConfirm = (id) => {
    confirm({
      title: "Delete client",
      icon: <CloseCircleFilled style={{ color: "red" }} />,
      content:
        "Are you sure delete this client? This client will be deleted permanently.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        // API CALL FOR DELETING THE CLIENTS
        axios
          .delete(`${import.meta.env.VITE_API_BASE_URL}/delete/${id}`)
          .then((response) => {
            message.success(response.data.message);
            getAllClient();
          })
          .catch((error) => {
            console.log(error);
          });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  return (
    <Card bordered={false}>
      <Row style={{ alignItems: "center" }} gutter={24}>
        <Col span={12}>
          <Title level={5}>Client Name</Title>
          <Input
            placeholder=""
            disabled
            value={clientData.clientName}
            style={{ marginTop: 2 }}
            suffix={
              <Tooltip title="Click to copy">
                <CopyIcon
                  style={{
                    color: "rgba(0,0,0,.45)",
                  }}
                />
              </Tooltip>
            }
            size="large"
          />
        </Col>
        <Col span={12}>
          <Title level={5}>Client Access Code</Title>
          <Input
            placeholder=""
            disabled
            value={clientData.accessCode}
            style={{ marginTop: 2 }}
            suffix={
              <Tooltip title="Click to copy">
                <CopyIcon
                  style={{
                    color: "rgba(0,0,0,.45)",
                  }}
                />
              </Tooltip>
            }
            size="large"
          />
        </Col>
      </Row>

      <Title level={5}>Statements</Title>
      <Table
        columns={columns}
        rowKey={(record) => record.clientName}
        dataSource={clients}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 800 }}
      />
    </Card>
  );
};

export default ClientStatements;
