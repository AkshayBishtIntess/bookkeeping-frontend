import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Space,
  Table,
  Modal,
  message,
  Typography,
  Input,
  Form,
  Card,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  CloseCircleFilled,
  EditOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import axios from "axios";
import useClientStore from "../store/useClientStore";
import { useNavigate } from "react-router-dom";

const { confirm } = Modal;
const { Title } = Typography;

const ClientList = () => {
  const store = useClientStore();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState("");
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 5,
      pageSizeOptions: ["5", "10", "20", "50"],
      showSizeChanger: true,
    },
    filters: {},
  });


  const handleNavigate = (record) => {
    store.setSpecificRecord(record);
    navigate("/client-statements", { state: { clientData: record } });
  };

  const handleNavigateToNewClient = () => {
    navigate("/clients");
  };

  const edit = (record) => {
    form.setFieldsValue({
      accessCode: record.accessCode,
      clientName: record.clientName,
      contactPhone: record.contactPhone,
      contactName: record.contactName,
      ...record,
    });
    setEditingKey(record.clientId);
    setEditedData({ ...record });
  
    // Redirect to Clients page with pre-filled data
    navigate("/clients", {
      state: {
        editing: true,
        clientData: record, // Pass the record data to be pre-filled
      },
    });
  };

  const columns = [
    {
      title: "Code",
      dataIndex: "accessCode",
      sorter: (a, b) => a.accessCode.length - b.accessCode.length,
    },
    {
      title: "Name",
      dataIndex: "clientName",
      sorter: (a, b) => a.clientName.length - b.clientName.length,
    },
    {
      title: "Phone",
      dataIndex: "contactPhone",
      sorter: (a, b) => a.contactPhone.length - b.contactPhone.length,
    },
    {
      title: "Contact",
      dataIndex: "contactName",
      sorter: (a, b) => a.contactName.length - b.contactName.length,
    },
    {
      title: "Type",
      dataIndex: "clientType",
      sorter: (a, b) => a.clientType.length - b.clientType.length,
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => {
        return (
          <Space size="middle">
                <Button
                  type="primary"
                  className="actionBtnColors"
                  shape="circle"
                  icon={<EditOutlined />}
                  disabled={editingKey !== ""}
                  onClick={() => edit(record)}
                />
                <Button
                  type="primary"
                  className="actionBtnColors"
                  shape="circle"
                  icon={<EyeOutlined />}
                  onClick={() => handleNavigate(record)}
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => {
                    showDeleteConfirm(record.clientId);
                  }}
                />
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    getAllClient();
    store.fetchBankStatements();
  }, []);

  const getAllClient = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/client`
      );
      store.setClients(response.data);
    } catch (error) {
      console.log(error);
      message.error("Failed to fetch clients");
    }
  };

  const groupedStatements = useMemo(() => {
    if (!store.clients || store.clients.length === 0) {
      return [];
    }

    if (store.allStatement === '[]') {
      return [];
    } else {
      const grouped = store.clients.reduce((acc, client) => {
        acc[client?.id] = {
          clientId: client?.id,
          clientName: client?.clientName,
          accessCode: client?.accessCode,
          contactName: client?.contactName,
          contactPhone: client?.contactPhone,
          clientType: client?.clientType,
          statements: [],
          totalStatements: 0,
          totalValue: 0,
        };
        return acc;
      }, {});

      store.allStatement.forEach((statement) => {
        if (grouped[statement?.clientId]) {
          grouped[statement?.clientId].statements.push(statement);
          grouped[statement?.clientId].totalStatements += 1;
          grouped[statement?.clientId].totalValue +=
            statement.accountInfo.balances?.ending || 0;
        }
      });
      return Object.values(grouped) || [];
    }
  }, [store.allStatement, store.clients]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setTableParams((prevState) => ({
        ...prevState,
        pagination: {
          ...prevState.pagination,
          total: groupedStatements.length,
        },
      }));
    }, 1000);
  }, [tableParams.pagination?.current, tableParams.pagination?.pageSize]);

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams((prevState) => ({
      ...prevState,
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    }));
  };

  const handlePaginationChange = (page, pageSize) => {
    setTableParams((prevState) => ({
      ...prevState,
      pagination: {
        ...prevState.pagination,
        current: page,
        pageSize: pageSize,
      },
    }));
  };

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
        axios
          .delete(`${import.meta.env.VITE_API_BASE_URL}/delete/${id}`)
          .then((response) => {
            message.success(response.data.message);
            getAllClient();
          })
          .catch((error) => {
            console.log(error);
            message.error("Failed to delete client");
          });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  return (
    <Card
      title={
        <Title
          level={4}
          className="mt-0"
          style={{ marginTop: 6, marginBottom: 6 }}
        >
          Client Management
        </Title>
      }
      extra={
        <Button
          type="primary"
          className="actionBtnColors"
          icon={<PlusOutlined />}
          onClick={handleNavigateToNewClient}
        >
          New Client
        </Button>
      }
    >
      <Form form={form} component={false}>
        <Table
          columns={columns}
          rowKey={(record) => record.clientName}
          dataSource={groupedStatements}
          pagination={{
            ...tableParams.pagination,
            onChange: handlePaginationChange,
          }}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Form>
    </Card>
  );
};

export default ClientList;
