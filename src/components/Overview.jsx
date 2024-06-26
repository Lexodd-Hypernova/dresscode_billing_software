import "./Overview.css";
import { useState, useContext, useEffect } from "react";
import Drawer from "./Drawer";
import sharedContext from "../context/SharedContext";
import uploadIcon from "../../utils/uploadIcon.svg";
import Loader from "./Loader";
import SideNav from "./SideNav";
import closeIcon from "../../utils/closeIcon.svg";
import toast from "react-hot-toast";

const Overview = () => {
  const { setLoader, token, isSideNavOpen } = useContext(sharedContext);
  const [onlineOrdersData, setOnlineOrdersData] = useState([]);
  const [offlineOrdersData, setOfflineOrdersData] = useState([]);
  const [onlineSales, setOnlineSales] = useState(0);
  const [offlineSales, setOfflineSales] = useState(0);

  const [buttonStates, setButtonStates] = useState({
    online: true,
    offline: false,
  });

  const handleButtonClick = (buttonName) => {
    setButtonStates((prevStates) => ({
      ...Object.fromEntries(Object.keys(prevStates).map((key) => [key, false])),
      [buttonName]: true,
    }));
  };
  const [current, setCurrent] = useState("");
  const [isDrawerOpen, setOpenDrawer] = useState(false);

  const toggleDrawer = (event, open, button) => {
    console.log(button);
    if (
      event &&
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      setOpenDrawer(false);
      return;
    }
    setOpenDrawer(open);
    setCurrent(button);
  };

  useEffect(() => {
    getOrders();
    getTotalSales();
  }, [token]);

  const getOrders = () => {
    setLoader(true);
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      `${import.meta.env.VITE_BASE_URL}/orders/getOrders/Shopify`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        console.log(result.data);
        if (result.status == 200) {
          setOnlineOrdersData(result.data.orders_by_client);
        }
        setLoader(false);
      })
      .catch((error) => {
        console.log("error", error.message);
        setLoader(false);
      });

    fetch(
      `${import.meta.env.VITE_BASE_URL}/orders/getAllOfflineExecutives`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        console.log(result.data);
        if (result.status == 200) {
          setOfflineOrdersData(result.data.executives);
        }
        setLoader(false);
      })
      .catch((error) => {
        console.log("error", error.message);
        setLoader(false);
      });
  };

  const getTotalSales = () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      `${import.meta.env.VITE_BASE_URL}/orders/getTotalOnlineSales`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        if (result.status == 200) {
          setOnlineSales(result.data.total_online_sales);
        }
      })
      .catch((error) => {
        console.log("error", error.message);
      });

    fetch(
      `${import.meta.env.VITE_BASE_URL}/orders/getTotalOfflineSales`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        if (result.status == 200) {
          setOfflineSales(result.data.total_offline_sales);
        }
      })
      .catch((error) => {
        console.log("error", error.message);
      });
  };
  const [selectedClient, setSelectedClient] = useState(null);

  const handleClientClick = (clientIndex, orderData) => {
    // Set the selected client index when a client is clicked
    if (orderData.orders.length === 0) {
      alert("No orders to show");
    } else {
      setSelectedClient(clientIndex);
    }
  };

  const handleCloseClick = () => {
    // Reset the selected client when the close button is clicked
    setSelectedClient(null);
  };

  function convertOrderDataToCSV(orderData) {
    let csvContent =
      "Executive ID,Executive Name,Student Name,Class,Roll No,Email Id,Phone No,Order ID,Product ID,Product Name,Size,Quantity,MRP,Ordered Date,Total Price,Mode Of Payment\n";

    orderData.orders.forEach((order) => {
      order.products.forEach((product) => {
        const row = [
          orderData.executive_id,
          orderData.executive_name,
          order.studentName,
          order.class,
          order.roll_no,
          order.email_id,
          order.phn_no,
          order.orderId,
          product.product_id,
          product.product_name,
          product.size,
          product.quantity,
          product.MRP,
          order.ordered_date,
          order.total_price,
          order.mode_of_payment,
        ];
        csvContent += row.join(",") + "\n";
      });
    });

    return csvContent;
  }

  function handleExportClick(orderData) {
    const csvData = convertOrderDataToCSV(orderData);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${orderData.executive_name}_orders.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="overview_box">
      <Drawer
        anchor="right"
        toggleDrawer={toggleDrawer}
        isOpen={isDrawerOpen}
        current={current}
        getOrders={getOrders}
        getTotalSales={getTotalSales}
      />
      <Loader />
      <div className="overview_con">
        {
          <button
            onClick={() => handleButtonClick("online")}
            style={{
              backgroundColor: !buttonStates.online ? "#D9D9D9" : "#b5b3b3",
            }}
          >
            <div className="onlOverview_con">
              <h2 className="font-medium text-xl">Online Overview</h2>
              <h4 className="font-medium text-10">
                Total Sales : ₹{onlineSales}
              </h4>
            </div>
          </button>
        }
        {
          <button
            onClick={() => handleButtonClick("offline")}
            style={{
              backgroundColor: !buttonStates.offline ? "#D9D9D9" : "#b5b3b3",
            }}
          >
            <div className="offOverview_con">
              <h2 className="font-medium text-xl">Offline Overview</h2>
              <h4 className="font-medium text-10">
                Total Sales : ₹{offlineSales}
              </h4>
            </div>
          </button>
        }
      </div>
      <div className="data_con">
        {buttonStates.online && (
          <>
            <div className="upload_con">
              <button
                className="upload_button"
                // onClick={(event) => toggleDrawer(event, true, "upload")}
                onClick={() => toast.error("Coming Soon!")}
                style={{ width: "max-content" }}
                name="upload"
              >
                <img
                  className="uploadIcon"
                  src={uploadIcon}
                  alt="uploadIcon SVG"
                />
                <h4> Upload Online Sales Data</h4>
              </button>
            </div>
            <div className="onData_box">
              <div className="heading_con">
                <h2 className="font-medium text-xl">Online Sales Data</h2>
              </div>
              <div className="orders_box">
                <div className="orders_con">
                  {onlineOrdersData.length !== 0 ? (
                    onlineOrdersData?.map((orderData, index) => (
                      <div key={index} className="client_box">
                        <div className="client_con">
                          <div
                            className="flex gap-1 cursor-pointer noWhiteSpace"
                            onClick={() => handleClientClick(index, orderData)}
                          >
                            <p className="font-bold text-20">Name :</p>
                            <p className="noWhiteSpace">
                              {orderData?.client_name}
                            </p>
                          </div>
                          {selectedClient === index && (
                            <img
                              src={closeIcon}
                              alt="closeIcon"
                              onClick={handleCloseClick}
                              className="w-5 cursor-pointer"
                            />
                          )}
                        </div>
                        {selectedClient === index &&
                          orderData?.orders?.map((data, index) => (
                            <div key={index} className="p-3">
                              <div className="flex gap-1">
                                <p className="font-bold text-20 mb-5">
                                  Order Id :
                                </p>
                                <p>{data?.orderId}</p>
                              </div>
                              <div className="flex flex-col gap-5">
                                <p className="font-bold text-20">Products:</p>
                                <div className="heading-row">
                                  <div className="text__Fld text-center font-bold text-20">
                                    Product Id
                                  </div>
                                  <div className="text__Fld text-center font-bold text-20">
                                    Product Name
                                  </div>
                                  <div className="text__Fld text-center font-bold text-20">
                                    Size
                                  </div>
                                  <div className="text__Fld text-center font-bold text-20">
                                    Order Quantity
                                  </div>
                                  <div className="text__Fld text-center font-bold text-20">
                                    MRP
                                  </div>
                                </div>
                                {data?.products.map((product, index) => (
                                  <>
                                    <div
                                      key={index}
                                      className="product-details-row"
                                    >
                                      <p className="text__Fld text-center">
                                        {product.product_id}
                                      </p>
                                      <p className="text__Fld text-center">
                                        {product.product_name}
                                      </p>
                                      <p className="text__Fld text-center">
                                        {product.size}
                                      </p>
                                      <p className="text__Fld text-center">
                                        {product.quantity}
                                      </p>
                                      <p className="text__Fld text-center">
                                        ₹{product.MRP}
                                      </p>
                                    </div>
                                    <div
                                      key={index}
                                      className="product-details-col pl-3"
                                    >
                                      <p className="label">
                                        Product Id :{" "}
                                        <span className="value">
                                          {product.product_id}
                                        </span>
                                      </p>
                                      <p className="label">
                                        Product Name :{" "}
                                        <span className="value">
                                          {product.product_name}
                                        </span>
                                      </p>
                                      <p className="label">
                                        Size :{" "}
                                        <span className="value">
                                          {product.size}
                                        </span>
                                      </p>
                                      <p className="label">
                                        Order Quantity :{" "}
                                        <span className="value">
                                          {product.quantity}
                                        </span>
                                      </p>
                                      <p className="label">
                                        MRP :{" "}
                                        <span className="value">
                                          ₹{product.MRP}
                                        </span>
                                      </p>
                                    </div>
                                  </>
                                ))}
                                <div className="footer-container">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex gap-1">
                                      <p className="font-bold text-20 noWhiteSpace">
                                        Ordered At :
                                      </p>
                                      <p className="noWhiteSpace">
                                        {data?.ordered_date}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <p className="font-bold text-20 noWhiteSpace">
                                      Total Price :
                                    </p>
                                    <p className="noWhiteSpace">
                                      ₹{data?.total_price}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ))
                  ) : (
                    <p style={{ textAlign: "center" }}>No data to show</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        {buttonStates.offline && (
          <>
            <div className="offData_box">
              <div className="heading_con">
                <h2 className="font-medium text-xl">Offline Sales Data</h2>
              </div>
              <div className="orders_box">
                <div className="bg-grey-500 w-full h-full">
                  <div className="w-full text-left border-separate border-spacing-y-2.5">
                    {offlineOrdersData.length !== 0 ? (
                      offlineOrdersData?.map((orderData, index) => (
                        <div key={index} className="client_box">
                          <div className="client_con">
                            <div
                              className="flex flex-col gap-1 cursor-pointer " //noWhiteSpace
                              onClick={() =>
                                handleClientClick(index, orderData)
                              }
                            >
                              <div className="flex gap-1">
                                <p className="font-bold text-20">
                                  Executive Name :
                                </p>
                                <p>
                                  {" "}
                                  {/* className="noWhiteSpace" */}
                                  {orderData?.executive_name}
                                </p>
                              </div>
                            </div>
                            {selectedClient === index && (
                              <div className="flex flex-col gap-5 items-center">
                                <img
                                  src={closeIcon}
                                  alt="closeIcon"
                                  onClick={handleCloseClick}
                                  className="w-5 cursor-pointer"
                                />
                                <button
                                  className="bg-blue-500 text-white px-2 py-1 rounded-md"
                                  onClick={() => handleExportClick(orderData)}
                                >
                                  Export
                                </button>
                              </div>
                            )}
                          </div>
                          {selectedClient === index &&
                            orderData?.orders?.map((data, index) => (
                              <div
                                key={index}
                                className="mt-2 p-2 rounded-md bg-gray-100"
                              >
                                <div className="flex gap-1">
                                  <p className="font-bold text-20 mb-5">
                                    Order Id :
                                  </p>
                                  <p>{data?.orderId}</p>
                                </div>
                                <div className="flex flex-col gap-5 pl-2 mb-5">
                                  <p className="font-bold text-20">
                                    Student Details:
                                  </p>
                                  <div className="heading-row">
                                    <div className="text__Fld text-center font-bold text-20">
                                      Student Name
                                    </div>
                                    <div className="text__Fld text-center font-bold text-20">
                                      Class
                                    </div>
                                    <div className="text__Fld text-center font-bold text-20">
                                      Roll No
                                    </div>
                                    <div className="text__Fld text-center font-bold text-20">
                                      Email ID
                                    </div>
                                    <div className="text__Fld text-center font-bold text-20">
                                      Mobile No
                                    </div>
                                  </div>
                                  <div className="product-details-row">
                                    <p className="text__Fld text-center">
                                      {data?.studentName}
                                    </p>
                                    <p className="text__Fld text-center">
                                      {data?.class}
                                    </p>
                                    <p className="text__Fld text-center">
                                      {data?.roll_no || "---"}
                                    </p>
                                    <p className="text__Fld text-center">
                                      {data?.email_id || "---"}
                                    </p>
                                    <p className="text__Fld text-center">
                                      {data?.phn_no}
                                    </p>
                                  </div>
                                  <div
                                    key={index}
                                    className="product-details-col pl-2"
                                  >
                                    <p className="label">
                                      Student Name :{" "}
                                      <span className="value">
                                        {data?.studentName}
                                      </span>
                                    </p>
                                    <p className="label">
                                      Class :{" "}
                                      <span className="value">
                                        {data?.class}
                                      </span>
                                    </p>
                                    <p className="label">
                                      Roll No :{" "}
                                      <span className="value">
                                        {data?.roll_no || "---"}
                                      </span>
                                    </p>
                                    <p className="label">
                                      Email ID :{" "}
                                      <span className="value">
                                        {data?.email_id || "---"}
                                      </span>
                                    </p>
                                    <p className="label">
                                      Mobile No :{" "}
                                      <span className="value">
                                        {data?.phn_no}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-5 pl-2">
                                  <p className="font-bold text-20">Products:</p>
                                  <div className="heading-row">
                                    <div className="text__Fld text-center font-bold text-20">
                                      Product Id
                                    </div>
                                    <div className="text__Fld text-center font-bold text-20">
                                      Product Name
                                    </div>
                                    <div className="text__Fld text-center font-bold text-20">
                                      Size
                                    </div>
                                    <div className="text__Fld text-center font-bold text-20">
                                      Order Quantity
                                    </div>
                                    <div className="text__Fld text-center font-bold text-20">
                                      MRP
                                    </div>
                                  </div>
                                  {data?.products.map((product, index) => (
                                    <>
                                      <div
                                        key={index}
                                        className="product-details-row"
                                      >
                                        <p className="text__Fld text-center">
                                          {product.product_id}
                                        </p>
                                        <p className="text__Fld text-center">
                                          {product.product_name}
                                        </p>
                                        <p className="text__Fld text-center">
                                          {product.size}
                                        </p>
                                        <p className="text__Fld text-center">
                                          {product.quantity}
                                        </p>
                                        <p className="text__Fld text-center">
                                          ₹{product.MRP}
                                        </p>
                                      </div>
                                      <div
                                        key={index}
                                        className="product-details-col pl-2"
                                      >
                                        <p className="label">
                                          Product Id :{" "}
                                          <span className="value">
                                            {product.product_id}
                                          </span>
                                        </p>
                                        <p className="label">
                                          Product Name :{" "}
                                          <span className="value">
                                            {product.product_name}
                                          </span>
                                        </p>
                                        <p className="label">
                                          Size :{" "}
                                          <span className="value">
                                            {product.size}
                                          </span>
                                        </p>
                                        <p className="label">
                                          Order Quantity :{" "}
                                          <span className="value">
                                            {product.quantity}
                                          </span>
                                        </p>
                                        <p className="label">
                                          MRP :{" "}
                                          <span className="value">
                                            ₹{product.MRP}
                                          </span>
                                        </p>
                                      </div>
                                    </>
                                  ))}
                                  <div className="flex gap-1">
                                    <p className="font-bold text-20">
                                      Mode Of Payment :
                                    </p>
                                    <p className="noWhiteSpace">
                                      {data?.mode_of_payment}
                                    </p>
                                  </div>
                                  <div className="footer-container">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex gap-1">
                                        <p className="font-bold text-20 ">
                                          {/*noWhiteSpace*/}
                                          Ordered At :
                                        </p>
                                        <p className="noWhiteSpace">
                                          {data?.ordered_date}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex gap-1">
                                      <p className="font-bold text-20">
                                        {/*noWhiteSpace*/}
                                        Total Price :
                                      </p>
                                      <p className="">
                                        {/*noWhiteSpace*/}₹{data?.total_price}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ))
                    ) : (
                      <p style={{ textAlign: "center" }}>No data to show</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className={`side_nav ${isSideNavOpen ? "open" : ""}`}>
        <SideNav />
      </div>
    </div>
  );
};

export default Overview;
