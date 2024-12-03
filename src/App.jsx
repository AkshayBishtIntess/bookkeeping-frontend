import React, { useEffect, useState } from "react";
import {
  FileTextOutlined,
  ProductOutlined,
  ImportOutlined,
  FileTextFilled,
  UserOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme, Divider, AutoComplete } from "antd";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
const { Header, Content, Sider } = Layout;
import Clients from "./components/clients";
import ClientList from "./components/client-list";
import Statements from "./components/upload-statements";
import Dashboard from "./components/dashboard";
import ImportHistory from "./components/import-history";
import ImportConciliation from "./components/import-conciliation";
import StatementHistory from "./components/statement-history";
import ClientUploadHistory from "./components/client-upload-history";
import "./styles/App.css";
import logo from "./assets/images/logo.png";
import useClientStore from "./store/useClientStore";
import ClientStatements from "./components/client-statements";
import TransactionClassification from "./components/transaction-classification";

const App = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const [options, setOptions] = useState([]);
  const store = useClientStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { clients } = useClientStore();

  const handleSearch = (value) => {
    setOptions(() => {
      if (!value) {
        return [];
      }
      return clients
        .filter((client) =>
          client.clientName.toLowerCase().includes(value.toLowerCase())
        )
        .map((client) => ({
          label: client.clientName,
          value: client.clientName,
        }));
    });
  };

  const handleSelect = (value) => {
    const client = clients.find((client) => client.clientName === value);
    store.setSearchedClient(client);
  };

  // Custom menu item renderer with count badge
  const MenuItemLabel = ({ label, count }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      <span>{label}</span>
      {count && <span className="countSpan">{count}</span>}
    </div>
  );

  const items = [
    {
      key: "g1",
      label: "MAIN",
      type: "group",
      children: [
        {
          key: "/dashboard",
          icon: <ProductOutlined className="iconColors" />,
          label: <MenuItemLabel label="Dashboard" count={22} />,
        },
        // {
        //   key: "/clients",
        //   icon: <FileTextFilled className="iconColors" />,
        //   label: <MenuItemLabel label="Clients" count={14} />,
        // },
        {
          key: "/client-list",
          icon: <UserOutlined className="iconColors" />,
          label: <MenuItemLabel label="Clients" />,
        },
        {
          key: "/client-upload-history",
          icon: <UserOutlined className="iconColors" />,
          label: <MenuItemLabel label="Client Upload" />,
        },
        {
          key: "/statements",
          icon: <FileTextFilled className="iconColors" />,
          label: <MenuItemLabel label="Upload Statement" count={22} />,
        },
        {
          key: "/import-conciliation",
          icon: <ImportOutlined className="iconColors" />,
          label: <MenuItemLabel label="Import Conciliation" count={8} />,
        },
        {
          key: "/import-history",
          icon: <FileTextFilled className="iconColors" />,
          label: <MenuItemLabel label="Import History" />,
        },
       
       
      ],
    },
    {
      key: "g2",
      label: "MAIN",
      type: "group",
      children: [
        // {
        //   key: "/statements",
        //   icon: <FileTextFilled className="iconColors" />,
        //   label: <MenuItemLabel label="Upload Statement" count={22} />,
        // },
        {
          key: "/transaction-classification",
          icon: <HistoryOutlined className="iconColors" />,
          label:<MenuItemLabel label="Transaction Classification" />,
        },
      ],
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        breakpoint="lg"
        trigger={null}
        style={{
          backgroundColor: "white",
          borderRight: "1px solid #f0f0f0",
        }}
      >
        <div>
          <img src={logo} alt="logo" />
        </div>
        <Divider />
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]} // Highlight based on route
          onClick={(e) => navigate(e.key)} // Navigate to route
          items={items}
          style={{
            border: "none",
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <AutoComplete
            style={{
              width: 250,
              marginLeft: 36,
              borderRadius: "15px",
              border: "1px solid #ddd",
            }}
            onSearch={handleSearch}
            onSelect={handleSelect}
            placeholder="Try searching <<New Tasks>>"
            options={options}
            variant="borderless"
            allowClear
          />
        </Header>
        <Content
          style={{
            margin: "24px 16px 0",
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route
              path="/import-conciliation"
              element={<ImportConciliation />}
            />
            <Route path="/import-history" element={<ImportHistory />} />
            <Route path="/client-list" element={<ClientList />} />
            <Route
              path="/client-upload-history"
              element={<ClientUploadHistory />}
            />
            <Route path="/statements" element={<Statements />} />
            <Route path="/statement-history" element={<StatementHistory />} />
            <Route path="/client-statements" element={<ClientStatements />} />
            <Route path="/transaction-classification" element={<TransactionClassification />} />
            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
