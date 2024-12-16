import React, { useEffect, useState } from "react";
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
  Typography,
  Select,
  Form,
  Tooltip,
  Spin,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";
import { CopyIcon } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import axios from "axios";

const { Title } = Typography;
const { confirm } = Modal;

const TransactionClassification = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // State management
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [isNewRow, setIsNewRow] = useState(false);
  const [error, setError] = useState(null);

  const [editedData, setEditedData] = useState({
    transactions: [],
    accountInfo: {
      bankName: "",
      accountNumber: "",
      accountHolder: "",
      balances: {
        beginning: 0,
        ending: 0,
      },
      statementPeriod: {
        from: "",
        to: "",
      },
    },
  });

  const [recentStatement, setRecentStatement] = useState({
    success: false,
    message: "",
    statistics: {
      classified: 0,
      total: 0
    },
    accountInfo: {
      id: "",
      bankName: "",
      accountHolder: "",
      accountNumber: "",
      statementFromDate: "",
      statementToDate: "",
      beginningBalance: 0,
      endingBalance: 0,
      clientId: "",
      pdfUrl: "",
      pdfFileName: "",
      pdfUploadDate: "",
      pdfFileSize: "",
      monthReference: "",
      status: "",
      createdAt: "",
      updatedAt: ""
    },
    transactions: []
  });

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 5,
      total: 0,
      pageSizeOptions: ["5", "10", "20", "50"],
      showSizeChanger: true,
    },
  });

  // Initial data fetch
  useEffect(() => {
    if (accountId) {
      fetchClassificationData();
    } else {
      setError("No account ID provided");
      setLoading(false);
    }
  }, [accountId]);

  // Fetch classification data
  const fetchClassificationData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/classify-transactions/${accountId}`
      );
      
      if (response.data) {
        setRecentStatement(response.data);
        setEditedData({
          transactions: response.data.transactions || [],
          accountInfo: {
            bankName: response.data.accountInfo.bankName,
            accountNumber: response.data.accountInfo.accountNumber,
            accountHolder: response.data.accountInfo.accountHolder,
            balances: {
              beginning: response.data.accountInfo.beginningBalance,
              ending: response.data.accountInfo.endingBalance,
            },
            statementPeriod: {
              from: response.data.accountInfo.statementFromDate,
              to: response.data.accountInfo.statementToDate,
            },
          },
        });
        setTableParams(prev => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: response.data.transactions?.length || 0,
          },
        }));
      }
    } catch (error) {
      console.error("Failed to fetch classification data:", error);
      setError("Failed to load classification data");
      message.error("Failed to load classification data");
    } finally {
      setLoading(false);
    }
  };

  // Table pagination update
  useEffect(() => {
    setTableParams(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        total: editedData.transactions.length
      }
    }));
  }, [editedData.transactions]);

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });
  };

  const handleFieldEdit = (field, value) => {
    setRecentStatement(prev => ({
      ...prev,
      accountInfo: {
        ...prev.accountInfo,
        [field]: value
      }
    }));
  };

  const startEditing = (id) => {
    setEditingRow(id);
    setIsNewRow(false);
  };

  const handleTableEdit = (id, field, value) => {
    const updatedData = editedData.transactions.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setEditedData({ ...editedData, transactions: updatedData });
  };

  const updateBankDetails = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/bank-statements/${accountId}`,
        editedData
      );
      message.success("Transaction updated!");
      // await fetchClassificationData();
    } catch (error) {
      message.error(`Error while saving the data: ${error}`);
    }
  };

  const handleSaveFields = async () => {
    try {
      setLoading(true);
      await updateBankDetails();
      setIsEditing(false);
    } catch (error) {
      message.error("Failed to update account information");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRow = async (id) => {
    setEditingRow(null);
    setIsNewRow(false);
    try {
      // Find the transaction in editedData
      const transaction = editedData.transactions.find(tx => tx.id === id);
      
      // Send the entire editedData state
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/bank-statements/${accountId}`,
        editedData
      );
      
      message.success(isNewRow ? "New transaction added successfully" : "Transaction updated successfully");
      // await fetchClassificationData(); // Refresh the data
    } catch (error) {
      message.error("Failed to save transaction");
      console.error(error);
    }
  };
  const handleCancelRow = () => {
    if (isNewRow) {
      setEditedData((prevData) => ({
        ...prevData,
        transactions: prevData.transactions.filter(
          (tx) => tx.id !== editingRow
        ),
      }));
    }
    setEditingRow(null);
    setIsNewRow(false);
  };

  const handleCancelFields = () => {
    setIsEditing(false);
    // fetchClassificationData();
  };

  const handleAddRow = () => {
    const maxId = Math.max(...editedData.transactions.map(tx => tx.id));

    const newTransaction = {
      // id: maxId + 1,
      date: moment().format("YYYY-MM-DD"),
      description: "",
      amount: 0,
      type: "credit",
      split: null
    };

    setEditedData((prevData) => ({
      ...prevData,
      transactions: [...prevData.transactions, newTransaction],
    }));

    setEditingRow(newTransaction.id);
    setIsNewRow(true);

    const lastPage = Math.ceil(
      (editedData.transactions.length + 1) / tableParams.pagination.pageSize
    );
    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: lastPage,
        total: editedData.transactions.length + 1,
      },
    }));
  };

  const handleDeleteTransaction = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/transactions/${id}`);
      
      setEditedData(prev => ({
        ...prev,
        transactions: prev.transactions.filter(tx => tx.id !== id)
      }));
      
      message.success("Transaction deleted successfully");
    } catch (error) {
      message.error("Failed to delete transaction");
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (id) => {
    confirm({
      title: "Delete transaction",
      icon: <CloseCircleFilled style={{ color: "red" }} />,
      content: "Are you sure you want to delete this transaction? This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        handleDeleteTransaction(id);
      },
    });
  };

  const handleMonth = (value) => {
    handleFieldEdit("monthReference", value);
  };

  const columns = [
    {
      title: "SNo.",
      key: "index",
      render: (text, record, index) =>
        tableParams.pagination.pageSize * (tableParams.pagination.current - 1) + index + 1,
    },
    {
      title: "Date",
      dataIndex: "date",
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      render: (date, record) =>
        editingRow === record.id ? (
          <Input
            defaultValue={moment(date).format("YYYY-MM-DD")}
            onChange={(e) => handleTableEdit(record.id, "date", e.target.value)}
          />
        ) : (
          moment(date).format("YYYY-MM-DD")
        ),
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (text, record) =>
        editingRow === record.id ? (
          <Input
            defaultValue={text}
            onChange={(e) => handleTableEdit(record.id, "description", e.target.value)}
          />
        ) : (
          text
        ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (amount, record) =>
        editingRow === record.id ? (
          <Input
            defaultValue={amount}
            type="number"
            onChange={(e) => handleTableEdit(record.id, "amount", Number(e.target.value))}
          />
        ) : (
          amount
        ),
    },
    {
      title: "Type",
      dataIndex: "type",
      render: (type, record) =>
        editingRow === record.id ? (
          <Select
            defaultValue={type}
            style={{ width: '100%' }}
            onChange={(value) => handleTableEdit(record.id, "type", value)}
            options={[
              { value: "credit", label: "Credit" },
              { value: "debit", label: "Debit" },
            ]}
          />
        ) : (
          type.charAt(0).toUpperCase() + type.slice(1)
        ),
    },
    {
      title: "Split",
      dataIndex: "split",
      render: (split) => split || "Unclassified"
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {editingRow === record.id ? (
            <>
              <Button
                type="primary"
                className="saveBtn"
                shape="circle"
                icon={<CheckOutlined />}
                onClick={() => handleSaveRow(record.id)}
              />
              <Button
                type="primary"
                danger
                shape="circle"
                icon={<CloseOutlined />}
                onClick={handleCancelRow}
              />
            </>
          ) : (
            <>
              <Button
                type="primary"
                className="actionBtnColors"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => startEditing(record.id)}
              />
              <Button
                type="primary"
                shape="circle"
                icon={<DeleteOutlined />}
                danger
                onClick={() => showDeleteConfirm(record.id)}
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <Card bordered={false}>
        <div style={{ textAlign: 'center', color: 'red', padding: '20px' }}>
          {error}
        </div>
      </Card>
    );
  }

  return (
    <Card bordered={false}>
      {loading && !editingRow && !isEditing ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row style={{ alignItems: "center" }} gutter={24}>
            <Col span={18}>
              <Title level={5}>Client Name</Title>
              <Input
                placeholder="Client Name"
                value={recentStatement?.accountInfo?.accountHolder ?? ""}
                disabled
                style={{ marginTop: 2 }}
                suffix={
                  <Tooltip title="Click to copy">
                    <CopyIcon style={{ color: "rgba(0,0,0,.45)" }} />
                  </Tooltip>
                }
                size="large"
              />
            </Col>
            <Col span={6}>
              <Title level={5}>Month Reference</Title>
              <Select
                placeholder="Select"
                size="large"
                style={{ width: "100%" }}
                value={recentStatement?.accountInfo?.monthReference ?? ""}
                onChange={handleMonth}
                options={[
                  { value: "2024-01", label: "January 2024" },
                  { value: "2024-02", label: "February 2024" },
                  { value: "2024-03", label: "March 2024" },
                  { value: "2024-04", label: "April 2024" },
                  { value: "2024-05", label: "May 2024" },
                  { value: "2024-06", label: "June 2024" },
                  { value: "2024-07", label: "July 2024" },
                  { value: "2024-08", label: "August 2024" },
                  { value: "2024-09", label: "September 2024" },
                  { value: "2024-10", label: "October 2024" },
                  { value: "2024-11", label: "November 2024" },
                  { value: "2024-12", label: "December 2024" },
                ]}
              />
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: 28 }}>
            <Col span={8}>
              <Form layout="horizontal" form={form}>
                <Form.Item label="Bank Name">
                  <Input
                    placeholder="Bank Name"
                    variant={isEditing ? "outlined" : "borderless"}
                    value={recentStatement?.accountInfo?.bankName ?? ""}
                    readOnly={!isEditing}
                    onChange={(e) => handleFieldEdit("bankName", e.target.value)}
                  />
                </Form.Item>
                <Form.Item label="Beginning Balance">
                  <Input
                    placeholder="Beginning Balance"
                    type="number"
                    variant={isEditing ? "outlined" : "borderless"}
                    value={recentStatement?.accountInfo?.beginningBalance ?? ""}
                    readOnly={!isEditing}
                    onChange={(e) => handleFieldEdit("beginningBalance", Number(e.target.value))}
                  />
                </Form.Item>
              </Form>
            </Col>
            <Col span={8}>
              <Form layout="horizontal" form={form}>
                <Form.Item label="Account Number">
                  <Input
                    placeholder="Account Number"
                    variant={isEditing ? "outlined" : "borderless"}
                    value={recentStatement?.accountInfo?.accountNumber ?? ""}
                    readOnly={!isEditing}
                    onChange={(e) => handleFieldEdit("accountNumber", e.target.value)}
                  />
                </Form.Item>
                <Form.Item label="Ending Balance">
                  <Input
                    placeholder="Ending Balance"
                    variant={isEditing ? "outlined" : "borderless"}
                    type="number"
                    value={recentStatement?.accountInfo?.endingBalance ?? ""}
                    readOnly={!isEditing}
                    onChange={(e) => handleFieldEdit("endingBalance", Number(e.target.value))}
                  />
                </Form.Item>
              </Form>
            </Col>
            <Col span={8} style={{ textAlign: "center" }}>
              <Space size="middle">
                {isEditing ? (
                  <>
                    <Button
                      type="primary"
                      className="saveBtn"
                      shape="circle"
                      icon={<CheckOutlined />}
                      onClick={handleSaveFields}
                    />
                    <Button
                      type="primary"
                      danger
                      shape="circle"
                      icon={<CloseOutlined />}
                      onClick={handleCancelFields}
                    />
                  </>
                ) : (
                  <>
                    <Button
                      type="primary"
                      className="actionBtnColors"
                      shape="circle"
                      icon={<EditOutlined />}
                      onClick={() => setIsEditing(true)}
                    />
                    <Button
                      type="primary"
                      shape="circle"
                      className="actionBtnColors"
                      icon={<PlusOutlined />}
                      onClick={handleAddRow}
                    />
                  </>
                )}
              </Space>
            </Col>
          </Row>

          <div style={{ marginTop: 24 }}>   
            <Table
              columns={columns}
              rowKey={(record) => record.id}
              dataSource={editedData.transactions}
              pagination={tableParams.pagination}
              loading={loading}
              onChange={handleTableChange}
              scroll={{ x: 800 }}
            />
          </div>
        </>
      )}
    </Card>
  );
};

export default TransactionClassification;