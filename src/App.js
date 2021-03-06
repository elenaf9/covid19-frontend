import React, { useState, useEffect } from "react";
import "./App.css";
import { Layout, Menu, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Graph from "./components/graph.js";
import Selection from "./components/selection.js";
import "antd/dist/antd.css";
import { useAlert } from "react-alert";

const { Header, Content } = Layout;

function App() {
  const alert = useAlert();
  const [data, setData] = useState({
    cases: [
      {
        x: "2020-07-14T19:17:55.924Z",
        y: "556",
      },
      {
        x: "2020-07-13T19:17:55.999Z",
        y: "656",
      },
    ],
    deaths: [
      {
        x: "2020-07-14T19:17:55.924Z",
        y: "5",
      },
      {
        x: "2020-07-13T19:17:55.999Z",
        y: "20",
      },
    ],
    geoId: "AF",
  });
  const [countries, setCountries] = useState([
    {
      _id: "5f1dd6e3326b132d1f1abe49",
      name: "Afghanistan",
      geoId: "AF",
      countryterritoryCode: "AFG",
      continentExp: "Asia",
      createdAt: "2020-07-26T19:17:55.833Z",
      updatedAt: "2020-07-26T19:17:55.833Z",
      __v: 0,
    },
  ]);

  useEffect(fetchCountries, []);

  function fetchCountries() {
    const requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };
    fetch("http://localhost:3100/country", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        setCountries(data);
      })
      .catch((err) => {
        throw new Error(err);
      });
    // Run! Like go get some data from an API.
  }

  const submitForm = (value) => {
    const requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };
    fetch("http://localhost:3100/cases/byCountry/" + value, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setData(data);
      })
      .catch((err) => {
        throw new Error(err);
      });
  };
  const [current, setCurrent] = useState({ current: "dashboard" });
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const props = {
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
  };
  const handleClick = (e) => {
    setCurrent({ current: e.key });
  };
  const handleBatchUpload = async (content) => {
    let batch = [];
    for (let i = 0; i < content.length; i++) {
      batch.push(content[i]);
      if (i % 250 === 0) {
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(batch),
        };
        batch = [];
        console.log(batch);
        console.log(i);
        await fetch("http://localhost:3100/cases/init", requestOptions);
      }
    }
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batch),
    };
    await fetch("http://localhost:3100/cases/init", requestOptions);
  };
  const handleUpload = () => {
    const file = fileList[0];
    const success = function (content) {
      content = JSON.parse(content)["records"];
      handleBatchUpload(content).then(() => {
        setUploading(false);
        alert.show("Successfully uploaded data");
        setCurrent({ current: "dashboard" });
        fetchCountries();
      });
      //console.log(JSON.stringify(content));
    };
    setUploading(true);
    const fileReader = new FileReader();
    fileReader.onload = function (evt) {
      success(evt.target.result);
    };
    fileReader.readAsText(file);
  };
  return (
    <Layout className="layout">
      <Header>
        <Menu onClick={handleClick} selectedKeys={[current]} mode="horizontal">
          <Menu.Item key="dashboard">Dashboard</Menu.Item>
          <Menu.Item key="upload">Upload</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: "0 50px" }}>
        {current.current === "dashboard" ? (
          <div id="one">
            <Selection onSubmit={submitForm} countries={countries} />
            <Graph cases={data.cases} deaths={data.deaths} />
          </div>
        ) : (
          <div>
            <Upload {...props}>
              <Button>
                <UploadOutlined /> Select File
              </Button>
            </Upload>
            <Button
              type="primary"
              onClick={handleUpload}
              disabled={fileList.length === 0}
              loading={uploading}
              style={{ marginTop: 16 }}
            >
              {uploading ? "Uploading" : "Start Upload"}
            </Button>
          </div>
        )}
      </Content>
    </Layout>
  );
}

export default App;
