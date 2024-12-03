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
  Tooltip,
  Typography,
  Select,
  Form,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  CloseCircleFilled,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { CopyIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import useClientStore from "../store/useClientStore";
import axios from "axios";

const { Title } = Typography;
const { confirm } = Modal;

const StatementHistory = () => {
  const location = useLocation();
  const clientData = location.state?.clientData;
  const navigate = useNavigate();

  const [statementData, setStatementData] = useState(null);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isNewRow, setIsNewRow] = useState(false);
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
  const [editingRow, setEditingRow] = useState(null);
  const [formFields, setFormFields] = useState({
    bankName: "",
    beginningBalance: 0,
    accountNumber: "",
    endingBalance: 0,
  });
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 5,
      total: 0,
      pageSizeOptions: ["5", "10", "20", "50"],
      showSizeChanger: true,
    },
  });

  const { setRecentStatement } = useClientStore();

  const getStatementByAccountID = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/bank-statements/${
          clientData.accountId
        }`
      );
      const data = response.data.data;
      setStatementData(data);
      setRecentStatement(data);
      setFormFields({
        bankName: data.accountInfo.bankName,
        beginningBalance: data.accountInfo.balances.beginning,
        accountNumber: data.accountInfo.accountNumber,
        endingBalance: data.accountInfo.balances.ending,
      });

      setEditedData({
        ...data,
        accountInfo: {
          ...data.accountInfo,
          balances: {
            beginning: data.accountInfo.balances.beginning,
            ending: data.accountInfo.balances.ending,
          },
        },
      });

      // Update total in pagination
      setTableParams((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: data.transactions.length,
        },
      }));
    } catch (error) {
      console.log(error);
      message.error("Failed to fetch statement data");
    } finally {
      setLoading(false);
    }
  };

  const getClassifiedData = async () => {
    try {
      setLoading(true);
      await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/classify-transactions`
      );
    } catch (error) {
      console.log(error);
      message.error("Failed to fetch classification data");
    } finally {
      setLoading(false);
    }
  };

  const handleClassifyNavigation = () => {
    navigate("/transaction-classification");
  };

  useEffect(() => {
    if (clientData?.accountId) {
      getClassifiedData();
      getStatementByAccountID();
    }
  }, [clientData?.accountId]);

  // Handle table change including pagination and sorting
  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });
  };

  // Get current page data
  const getCurrentPageData = () => {
    const { current, pageSize } = tableParams.pagination;
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return editedData.transactions.slice(startIndex, endIndex);
  };

  const handleFieldEdit = (field, value) => {
    setFormFields((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Update editedData simultaneously
    setEditedData((prev) => {
      const newData = { ...prev };
      switch (field) {
        case "bankName":
          newData.accountInfo.bankName = value;
          break;
        case "accountNumber":
          newData.accountInfo.accountNumber = value;
          break;
        case "beginningBalance":
          newData.accountInfo.balances.beginning = value;
          break;
        case "endingBalance":
          newData.accountInfo.balances.ending = value;
          break;
      }
      return newData;
    });
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
        `${import.meta.env.VITE_API_BASE_URL}/bank-statements/${
          clientData.accountId
        }`,
        editedData
      );
      message.success("Changes saved successfully");
      // getStatementByAccountID();
    } catch (error) {
      message.error(`Error while saving the data: ${error}`);
    }
  };

  const handleSaveRow = async (id) => {
    setEditingRow(null);
    setIsNewRow(false);
    try {
      if (editedData.transactions.find((tx) => tx.id === id)) {
        await updateBankDetails();
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/bank-statements/${
            clientData.accountId
          }`,
          editedData
        );
        message.success("New transaction added successfully");
      }
    } catch (error) {
      message.error("Failed to save transaction");
    }
  };

  const startEditing = (id) => {
    setEditingRow(id);
    setIsNewRow(false); // Make sure to set this to false when editing existing row
  };

  const handleCancelRow = () => {
    if (isNewRow) {
      // Only remove the row if it's a newly added row
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

  // Add handler for canceling form edit
  const handleCancelFields = () => {
    setIsEditing(false);
    // Reset form fields to original state
    if (statementData) {
      setFormFields({
        bankName: statementData.accountInfo.bankName,
        beginningBalance: statementData.accountInfo.balances.beginning,
        accountNumber: statementData.accountInfo.accountNumber,
        endingBalance: statementData.accountInfo.balances.ending,
      });
    }
  };

  const handleSaveFields = () => {
    setIsEditing(false);
    updateBankDetails();
  };

  const showDeleteConfirm = (id) => {
    confirm({
      title: "Delete transaction",
      icon: <CloseCircleFilled style={{ color: "red" }} />,
      content:
        "Are you sure you want to delete this transaction? This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        setEditedData((prevData) => ({
          ...prevData,
          transactions: prevData.transactions.filter((tx) => tx.id !== id),
        }));
        deleteTransaction(id);
      },
    });
  };

  const deleteTransaction = async (id) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/delete/${id}`
      );
      message.success(response.data.message);
      // getStatementByAccountID();
    } catch (error) {
      console.log(error);
      message.error("Failed to delete transaction");
    }
  };

  const handleMonth = (value) => {
    console.log(value);
    // Add your month change logic here
  };

  // const handleAddRow = (afterId) => {
  //   const newTransaction = {
  //     id: Date.now(),
  //     date: moment().format('MM/DD/YYYY'),
  //     description: '',
  //     amount: 0,
  //     type: 'credit',
  //   };

  //   setEditedData((prevData) => {
  //     const transactions = [...prevData.transactions];
  //     const insertIndex = transactions.findIndex(tx => tx.id === afterId) + 1;

  //     transactions.splice(insertIndex, 0, newTransaction);

  //     return {
  //       ...prevData,
  //       transactions,
  //     };
  //   });

  //   setEditingRow(newTransaction.id);
  //   setIsNewRow(true);
  // };

  const handleAddRow = () => {
    const newTransaction = {
      id: Date.now(),
      date: moment().format("MM/DD/YYYY"),
      description: "",
      amount: 0,
      type: "credit",
    };

    setEditedData((prevData) => ({
      ...prevData,
      transactions: [...prevData.transactions, newTransaction], // Add to end of array
    }));

    setEditingRow(newTransaction.id);
    setIsNewRow(true);

    // Update pagination to show the last page where the new row is added
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

  const columns = [
    {
      title: "SNo.",
      key: "index",
      render: (text, record, index) =>
        tableParams.pagination.pageSize * (tableParams.pagination.current - 1) +
        index +
        1,
    },
    {
      title: "Date",
      dataIndex: "date",
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      render: (date, record) =>
        editingRow === record.id ? (
          <Input
            defaultValue={moment(date).format("MM/DD/YYYY")}
            onChange={(e) => handleTableEdit(record.id, "date", e.target.value)}
          />
        ) : (
          moment(date).format("MM/DD/YYYY")
        ),
    },
    {
      title: "Description",
      dataIndex: "description",
      sorter: (a, b) => a.description.length - b.description.length,
      render: (text, record) =>
        editingRow === record.id ? (
          <Input
            defaultValue={text}
            onChange={(e) =>
              handleTableEdit(record.id, "description", e.target.value)
            }
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
            onChange={(e) =>
              handleTableEdit(record.id, "amount", Number(e.target.value))
            }
          />
        ) : (
          amount
        ),
      sorter: (a, b) => !editingRow && a.amount - b.amount,
    },
    {
      title: "Type",
      dataIndex: "type",
      render: (type) => (
        // <span style={{ color: type === "credit" ? "green" : "red" }}>
        //   {type.charAt(0).toUpperCase() + type.slice(1)}
        // </span>
        <>{type.charAt(0).toUpperCase() + type.slice(1)}</>
      ),
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

  return (
    <Card bordered={false}>
      <Row style={{ alignItems: "center" }} gutter={24}>
        <Col span={18}>
          <Title level={5}>Client Name</Title>
          <Input
            placeholder="Client Name"
            value={statementData?.accountInfo.accountHolder}
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
            onChange={handleMonth}
            value={
              statementData
                ? moment(statementData.accountInfo.statementPeriod.from).format(
                    "MMM"
                  )
                : undefined
            }
            options={[
              { value: "Jan", label: "January" },
              { value: "Feb", label: "February" },
              { value: "Mar", label: "March" },
              { value: "Apr", label: "April" },
              { value: "May", label: "May" },
              { value: "Jun", label: "June" },
              { value: "Jul", label: "July" },
              { value: "Aug", label: "August" },
              { value: "Sep", label: "September" },
              { value: "Oct", label: "October" },
              { value: "Nov", label: "November" },
              { value: "Dec", label: "December" },
            ]}
          />
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 28 }}>
        <Col span={8}>
          <Form layout="horizontal" name="test" form={form}>
            <Form.Item label="Bank Name">
              <Input
                placeholder="Bank Name"
                variant={isEditing ? "outlined" : "borderless"}
                value={formFields.bankName}
                readOnly={!isEditing}
                onChange={(e) => handleFieldEdit("bankName", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Beginning Balance">
              <Input
                placeholder="Beginning Balance"
                variant={isEditing ? "outlined" : "borderless"}
                value={formFields.beginningBalance}
                readOnly={!isEditing}
                onChange={(e) =>
                  handleFieldEdit("beginningBalance", Number(e.target.value))
                }
              />
            </Form.Item>
          </Form>
        </Col>
        <Col span={8}>
          <Form layout="horizontal" name="test" form={form}>
            <Form.Item label="Account Number">
              <Input
                placeholder="Account Number"
                variant={isEditing ? "outlined" : "borderless"}
                value={formFields.accountNumber}
                readOnly={!isEditing}
                onChange={(e) =>
                  handleFieldEdit("accountNumber", e.target.value)
                }
              />
            </Form.Item>
            <div style={{ display: "flex" }}>
              <Form.Item label="Ending Balance">
                <Input
                  placeholder="Ending Balance"
                  variant={isEditing ? "outlined" : "borderless"}
                  value={formFields.endingBalance}
                  readOnly={!isEditing}
                  onChange={(e) =>
                    handleFieldEdit("endingBalance", Number(e.target.value))
                  }
                />
              </Form.Item>
            </div>
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
                {/* <Button
                  type="primary"
                  className="actionBtnColors"
                  shape="circle"
                  icon={<EyeOutlined />}
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => showDeleteConfirm(statementData?.accountId)}
                /> */}
                <Button
                  type="primary"
                  shape="circle"
                  className="actionBtnColors"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddRow()}
                />
              </>
            )}
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns}
        rowKey={(record) => record.id}
        dataSource={editedData.transactions}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 800 }}
      />
      <Button
        type="text"
        iconPosition={"end"}
        icon={<RightOutlined />}
        className="classifyBtn"
        size="large"
        onClick={handleClassifyNavigation}
      >
        Classify
      </Button>
    </Card>
  );
};
export default StatementHistory;
