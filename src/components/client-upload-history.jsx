import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Select,
  Table,
  Row,
  Col,
  AutoComplete,
  Space,
  Button,
} from "antd";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Title } = Typography;

const ClientUploadHistory = () => {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    clientName: "",
    bankName: "",
    monthReference: "",
    accessCode: "",
  });
  const navigate = useNavigate();

  const fetchBankStatements = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/bank-statements`
      );
  
      const data = await response.data;

      const formattedData = data.data.map((ele) => ({
        createdAt: moment(ele.createdAt).format("DD/MM/YYYY"),
        financialInstitution: ele.accountInfo.bankName,
        monthReference: ele.accountInfo.monthReference
          ? moment(ele.accountInfo.monthReference, "YYYY-MM").format("MMM/YYYY")
          : "-",
        dateUpload: moment(ele.createdAt).format("DD/MM/YYYY"),
        dateDone: moment(ele.createdAt).format("DD/MM/YYYY"),
        status: ele.accountInfo.status,
        clientName: ele.client.clientName,
        accessCode: ele.client.accessCode,
        transactions: ele.transactions,
        accountId: ele.accountId,
        id: ele.id,
      }));

      setAllData(formattedData);
      setFilteredData(formattedData);
    } catch (error) {
      console.error("Error fetching bank statements:", error);
    }
  };

  useEffect(() => {
    fetchBankStatements();
  }, []);

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      sorter: (a, b) =>
        moment(a.createdAt, "DD/MM/YYYY").unix() -
        moment(b.createdAt, "DD/MM/YYYY").unix(),
    },
    {
      title: "Client Access Code",
      dataIndex: "accessCode",
      sorter: (a, b) => a.accessCode.localeCompare(b.accessCode),
    },
    {
      title: "Client Name",
      dataIndex: "clientName",
      sorter: (a, b) => a.clientName.localeCompare(b.clientName),
    },
    {
      title: "Financial Institution",
      dataIndex: "financialInstitution",
      sorter: (a, b) =>
        a.financialInstitution.localeCompare(b.financialInstitution),
    },
    {
      title: "Month Reference",
      dataIndex: "monthReference",
      sorter: (a, b) =>
        moment(a.monthReference, "MMM/YYYY").unix() -
        moment(b.monthReference, "MMM/YYYY").unix(),
    },
    {
      title: "Date Upload",
      dataIndex: "dateUpload",
      sorter: (a, b) =>
        moment(a.dateUpload, "DD/MM/YYYY").unix() -
        moment(b.dateUpload, "DD/MM/YYYY").unix(),
    },
    {
      title: "Date Done",
      dataIndex: "dateDone",
      sorter: (a, b) =>
        moment(a.dateDone, "DD/MM/YYYY").unix() -
        moment(b.dateDone, "DD/MM/YYYY").unix(),
    },
    {
      title: "Status",
      dataIndex: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        return (
          <Space size="middle">
            <Button
              type="primary"
              className="actionBtnColors"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => handleNavigate(record)}
            />
          </Space>
        );
      },
    },
  ];

  const filterData = () => {
    let result = [...allData];

    if (filters.clientName) {
      result = result.filter((item) =>
        item.clientName
          ?.toLowerCase()
          .includes(filters.clientName.toLowerCase())
      );
    }

    if (filters.accessCode) {
      result = result.filter((item) =>
        item.accessCode
          ?.toLowerCase()
          .includes(filters.accessCode.toLowerCase())
      );
    }

    if (filters.bankName) {
      result = result.filter(
        (item) => item.financialInstitution === filters.bankName
      );
    }

    if (filters.monthReference) {
      result = result.filter((item) =>
        item.monthReference?.includes(filters.monthReference)
      );
    }

    setFilteredData(result);
    setCurrentPage(1);
  };

  useEffect(() => {
    filterData();
  }, [filters]);

  const handleInputChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value || "",
    }));
  };

  // Get unique client names for autocomplete
  const clientNameOptions = [...new Set(allData.map((item) => item.clientName))]
    .filter(Boolean)
    .map((name) => ({ value: name }));

  // Get unique access codes for autocomplete
  const accessCodeOptions = [...new Set(allData.map((item) => item.accessCode))]
    .filter(Boolean)
    .map((code) => ({ value: code }));

  const bankOptions = [
    ...new Set(allData.map((client) => client.financialInstitution)),
  ]
    .filter(Boolean)
    .map((bank) => ({
      label: bank,
      value: bank,
    }));

  const monthReferenceOptions = [
    ...new Set(allData.map((item) => item.monthReference)),
  ]
    .filter(Boolean)
    .map((month) => ({ value: month }));

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleNavigate = (record) => {
    console.log(record);
    navigate(`/statement-history/${record.accountId}`);
  };

  const handleNavigateToNewClient = () => {
    navigate("/statements");
  };

  return (
    <Card
      className="p-6"
      title={
        <Title
          level={4}
          className="mt-0"
          style={{ marginTop: 6, marginBottom: 6 }}
        >
          Client Upload
        </Title>
      }
      extra={
        <Button
          type="primary"
          className="actionBtnColors"
          icon={<PlusOutlined />}
          onClick={handleNavigateToNewClient}
        >
          New Upload
        </Button>
      }
    >
      <Row
        gutter={16}
        className="mb-6 p-3 items-end"
        align="middle"
        style={{
          marginBottom: 24,
        }}
      >
        <Col span={6}>
          <Title level={5} className="mb-2">
            Client Name
          </Title>
          <AutoComplete
            placeholder="Search client name..."
            value={filters.clientName}
            onChange={(value) => handleInputChange("clientName", value)}
            options={clientNameOptions}
            style={{
              width: "100%",
            }}
            allowClear
            filterOption={(inputValue, option) =>
              option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !==
              -1
            }
          />
        </Col>

        <Col span={6}>
          <Title level={5} className="mb-2">
            Client Access Code
          </Title>
          <AutoComplete
            placeholder="Search access code..."
            value={filters.accessCode}
            onChange={(value) => handleInputChange("accessCode", value)}
            options={accessCodeOptions}
            style={{
              width: "100%",
            }}
            allowClear
            filterOption={(inputValue, option) =>
              option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !==
              -1
            }
          />
        </Col>

        <Col span={6}>
          <Title level={5} className="mb-2">
            Bank Name
          </Title>
          <Select
            placeholder="Select bank"
            value={filters.bankName}
            onChange={(value) => handleInputChange("bankName", value)}
            style={{ width: "100%" }}
            allowClear
            options={bankOptions}
          />
        </Col>

        <Col span={6}>
          <Title level={5} className="mb-2">
            Month Reference
          </Title>
          <AutoComplete
            placeholder="Search month reference..."
            value={filters.monthReference}
            onChange={(value) => handleInputChange("monthReference", value)}
            options={monthReferenceOptions}
            style={{
              width: "100%",
            }}
            allowClear
            filterOption={(inputValue, option) =>
              option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !==
              -1
            }
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey={(record) => `${record?.id}`}
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
        }}
        scroll={{ x: 800 }}
        className="shadow-sm"
      />
    </Card>
  );
};

export default ClientUploadHistory;
