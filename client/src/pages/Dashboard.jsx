import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomers } from "../services/customerService";
import {
  getPayments,
  getRemainingAmount,
  getTotalPaidAmount,
} from "../services/paymentService";
import { formatCurrency } from "../utils/formatCurrency";
import { getDueDateStatus } from "../utils/dueDateStatus";
import { t } from "../utils/translations";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [paymentsMap, setPaymentsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setMessage("");

      const customerList = await getCustomers();

      setCustomers(customerList);

      const paymentResults = await Promise.all(
        customerList.map(async (customer) => {
          try {
            const payments = await getPayments(customer.id);

            return {
              customerId: customer.id,
              payments,
            };
          } catch (error) {
            console.error(
              `Payment fetch failed for customer ${customer.id}:`,
              error
            );

            return {
              customerId: customer.id,
              payments: [],
            };
          }
        })
      );

      const newPaymentsMap = {};

      paymentResults.forEach((item) => {
        newPaymentsMap[item.customerId] = item.payments;
      });

      setPaymentsMap(newPaymentsMap);
    } catch (error) {
      console.error("Dashboard error:", error);

      setMessage(
        error.message || t("unableToLoadDashboard")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const getCustomerPayments = (customerId) => {
    return paymentsMap[customerId] || [];
  };

  const getPaidAmount = (customerId) => {
    return getTotalPaidAmount({
      payments: getCustomerPayments(customerId),
    });
  };

  const getCustomerRemainingAmount = (customer) => {
    return getRemainingAmount({
      ...customer,
      payments: getCustomerPayments(customer.id),
    });
  };

  const totalCustomers = customers.length;

  const totalUdhar = customers.reduce(
    (total, customer) =>
      total + Number(customer.totalAmount || 0),
    0
  );

  const totalPaid = customers.reduce(
    (total, customer) =>
      total + getPaidAmount(customer.id),
    0
  );

  const totalRemaining = customers.reduce(
    (total, customer) =>
      total + getCustomerRemainingAmount(customer),
    0
  );

  const getAlertStatus = (customer) => {
    const remaining =
      getCustomerRemainingAmount(customer);

    if (remaining <= 0) {
      return {
        status: "paid",
        label: t("paid"),
      };
    }

    const status = getDueDateStatus(customer.dueDate);

    const translatedLabels = {
      overdue: t("overdue"),
      today: t("dueToday"),
      soon: t("dueSoon"),
      upcoming: t("upcoming"),
    };

    return {
      ...status,
      label:
        translatedLabels[status.status] ||
        status.label,
    };
  };

  const alertCustomers = customers.filter(
    (customer) => {
      const status = getAlertStatus(customer);

      return (
        status.status === "overdue" ||
        status.status === "today" ||
        status.status === "soon"
      );
    }
  );

  const recentCustomers = [...customers]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 5);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <h3>{t("loadingDashboard")}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>{t("dashboard")}</h1>

          <p>{t("dashboardOverview")}</p>
        </div>

        <button
          type="button"
          className="add-customer-btn"
          onClick={() =>
            navigate("/add-customer")
          }
        >
          + {t("addCustomer")}
        </button>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{t("totalCustomers")}</h3>
          <strong>{totalCustomers}</strong>
        </div>

        <div className="stat-card">
          <h3>{t("totalUdhar")}</h3>
          <strong>
            {formatCurrency(totalUdhar)}
          </strong>
        </div>

        <div className="stat-card">
          <h3>{t("totalPaid")}</h3>
          <strong>
            {formatCurrency(totalPaid)}
          </strong>
        </div>

        <div className="stat-card">
          <h3>{t("totalRemaining")}</h3>
          <strong>
            {formatCurrency(totalRemaining)}
          </strong>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>{t("dueAlerts")}</h2>

            <p>{t("dueAlertsDescription")}</p>
          </div>
        </div>

        {alertCustomers.length === 0 ? (
          <div className="empty-state">
            <h3>{t("noDueAlerts")}</h3>

            <p>{t("noDueAlertsDescription")}</p>
          </div>
        ) : (
          <div className="dashboard-alert-list">
            {alertCustomers.map((customer) => {
              const status =
                getAlertStatus(customer);

              const remaining =
                getCustomerRemainingAmount(customer);

              return (
                <div
                  className="dashboard-alert-card"
                  key={customer.id}
                >
                  <div>
                    <strong>
                      {customer.name}
                    </strong>

                    <p>
                      {t("remaining")}:{" "}
                      {formatCurrency(remaining)}
                    </p>

                    <p>
                      {t("dueDate")}:{" "}
                      {customer.dueDate ||
                        t("notSet")}
                    </p>
                  </div>

                  <span
                    className={`due-status ${status.status}`}
                  >
                    {status.label}
                  </span>

                  <button
                    type="button"
                    className="view-btn"
                    onClick={() =>
                      navigate(
                        `/customers/${customer.id}`
                      )
                    }
                  >
                    {t("view")}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>{t("recentCustomers")}</h2>

            <p>{t("recentCustomersDescription")}</p>
          </div>

          <button
            type="button"
            className="view-all-btn"
            onClick={() =>
              navigate("/customers")
            }
          >
            {t("viewAll")}
          </button>
        </div>

        {recentCustomers.length === 0 ? (
          <div className="empty-state">
            <h3>{t("noCustomersYet")}</h3>

            <p>{t("addFirstCustomer")}</p>

            <button
              type="button"
              className="submit-btn"
              onClick={() =>
                navigate("/add-customer")
              }
            >
              {t("addCustomer")}
            </button>
          </div>
        ) : (
          <div className="recent-customers-list">
            {recentCustomers.map((customer) => {
              const remaining =
                getCustomerRemainingAmount(customer);

              const paid =
                getPaidAmount(customer.id);

              return (
                <div
                  className="recent-customer-card"
                  key={customer.id}
                  onClick={() =>
                    navigate(
                      `/customers/${customer.id}`
                    )
                  }
                >
                  <div>
                    <strong>
                      {customer.name}
                    </strong>

                    <p>
                      {customer.mobile ||
                        t("noMobileNumber")}
                    </p>
                  </div>

                  <div>
                    <span>
                      {t("total")}:{" "}
                      {formatCurrency(
                        customer.totalAmount
                      )}
                    </span>

                    <span>
                      {t("paid")}:{" "}
                      {formatCurrency(paid)}
                    </span>

                    <span>
                      {t("remaining")}:{" "}
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;