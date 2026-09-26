import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getCustomers,
  deleteCustomer,
} from "../services/customerService";
import { getRemainingAmount } from "../services/paymentService";
import { formatCurrency } from "../utils/formatCurrency";
import { getDueDateStatus } from "../utils/dueDateStatus";
import { t } from "../utils/translations";
import "../styles/Customer.css";

const CustomerList = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getCustomers();

      setCustomers(data);
    } catch (error) {
      console.error("Get customers error:", error);
      setMessage(t("unableToLoadCustomers"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `${t("deleteCustomerConfirmation")} ${name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const result = await deleteCustomer(id);

      if (!result.success) {
        setMessage(
          result.message || t("failedToDeleteCustomer")
        );
        return;
      }

      setMessage(
        result.message || t("customerDeletedSuccessfully")
      );

      await loadCustomers();

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Delete customer error:", error);
      setMessage(t("unableToConnectServer"));
    }
  };

  const getCustomerStatus = (customer) => {
    const remainingAmount = getRemainingAmount(customer);

    if (remainingAmount <= 0) {
      return {
        status: "paid",
        label: t("paid"),
      };
    }

    const status = getDueDateStatus(customer.dueDate);

    const labels = {
      overdue: t("overdue"),
      today: t("dueToday"),
      soon: t("dueSoon"),
      upcoming: t("upcoming"),
    };

    return {
      ...status,
      label: labels[status.status] || status.label,
    };
  };

  let processedCustomers = customers.filter((customer) => {
    const searchText = search.toLowerCase().trim();

    const customerName = String(
      customer.name || ""
    ).toLowerCase();

    const customerMobile = String(
      customer.mobile || ""
    );

    return (
      customerName.includes(searchText) ||
      customerMobile.includes(search)
    );
  });

  if (statusFilter !== "all") {
    processedCustomers = processedCustomers.filter(
      (customer) => {
        const customerStatus =
          getCustomerStatus(customer);

        return customerStatus.status === statusFilter;
      }
    );
  }

  processedCustomers = [...processedCustomers].sort(
    (a, b) => {
      if (sortBy === "amount-high") {
        return (
          Number(b.totalAmount || 0) -
          Number(a.totalAmount || 0)
        );
      }

      if (sortBy === "amount-low") {
        return (
          Number(a.totalAmount || 0) -
          Number(b.totalAmount || 0)
        );
      }

      if (sortBy === "due-date") {
        const dateA = a.dueDate
          ? new Date(a.dueDate)
          : new Date("9999-12-31");

        const dateB = b.dueDate
          ? new Date(b.dueDate)
          : new Date("9999-12-31");

        return dateA - dateB;
      }

      if (sortBy === "name") {
        return String(a.name || "").localeCompare(
          String(b.name || "")
        );
      }

      return (
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
      );
    }
  );

  return (
    <div className="customer-page">
      <div className="page-header customer-header">
        <div>
          <h1>{t("customers")}</h1>

          <p>{t("manageCustomersDescription")}</p>
        </div>

        <Link
          to="/add-customer"
          className="add-customer-btn"
        >
          + {t("addCustomer")}
        </Link>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <h3>{t("loadingCustomers")}</h3>
        </div>
      ) : (
        <>
          <div className="customer-toolbar">
            <input
              type="text"
              placeholder={t("searchCustomer")}
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="customer-search"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="customer-filter"
            >
              <option value="all">
                {t("allStatus")}
              </option>
              <option value="paid">
                {t("paid")}
              </option>
              <option value="overdue">
                {t("overdue")}
              </option>
              <option value="today">
                {t("dueToday")}
              </option>
              <option value="soon">
                {t("dueSoon")}
              </option>
              <option value="upcoming">
                {t("upcoming")}
              </option>
            </select>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
              className="customer-sort"
            >
              <option value="newest">
                {t("newestFirst")}
              </option>

              <option value="amount-high">
                {t("amountHighToLow")}
              </option>

              <option value="amount-low">
                {t("amountLowToHigh")}
              </option>

              <option value="due-date">
                {t("dueDate")}
              </option>

              <option value="name">
                {t("nameAZ")}
              </option>
            </select>

            <span className="customer-count">
              {t("showing")}:{" "}
              {processedCustomers.length}
            </span>
          </div>

          {processedCustomers.length === 0 ? (
            <div className="empty-state">
              <h3>{t("noCustomersFound")}</h3>

              <p>{t("changeSearchFilter")}</p>

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
            <div className="customer-table-wrapper">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>{t("customer")}</th>
                    <th>{t("mobile")}</th>
                    <th>{t("totalAmount")}</th>
                    <th>{t("remaining")}</th>
                    <th>{t("dueDate")}</th>
                    <th>{t("status")}</th>
                    <th>{t("actions")}</th>
                  </tr>
                </thead>

                <tbody>
                  {processedCustomers.map((customer) => {
                    const remainingAmount =
                      getRemainingAmount(customer);

                    const dueStatus =
                      getCustomerStatus(customer);

                    return (
                      <tr key={customer.id}>
                        <td>
                          <strong>
                            {customer.name}
                          </strong>
                        </td>

                        <td>
                          {customer.mobile ||
                            t("notAvailable")}
                        </td>

                        <td>
                          {formatCurrency(
                            customer.totalAmount
                          )}
                        </td>

                        <td>
                          {formatCurrency(
                            remainingAmount
                          )}
                        </td>

                        <td>
                          {customer.dueDate ||
                            t("notSet")}
                        </td>

                        <td>
                          <span
                            className={`due-status ${dueStatus.status}`}
                          >
                            {dueStatus.label}
                          </span>
                        </td>

                        <td>
                          <div className="table-actions">
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

                            <button
                              type="button"
                              className="edit-btn"
                              onClick={() =>
                                navigate(
                                  `/customers/${customer.id}/edit`
                                )
                              }
                            >
                              {t("edit")}
                            </button>

                            <button
                              type="button"
                              className="delete-btn"
                              onClick={() =>
                                handleDelete(
                                  customer.id,
                                  customer.name
                                )
                              }
                            >
                              {t("delete")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerList;