const API_BASE_URL_ORDERS = "http://localhost:5000/api";

let currentPage = 1;
let searchTimeout = null;

document.addEventListener("DOMContentLoaded", function () {
    loadOrders();
    loadUserOrders();
});

const table = document.getElementById("ordersTable");

async function saveOrder(event) {
    event.preventDefault();
    if (!validateOrderForm()) {
        showToast("Пожалуйста заполните все обязательные поля");
    }
    const orderData = {
        route: {
            startLocation: document.getElementById("startLocation").value,
            endLocation: document.getElementById("endLocation").value,
            deliveryDate: document.getElementById("deliveryDate").value,
        },
        cargos: [
            {
                description: document.getElementById("cargoDescription").value,
                cargoWeight: parseFloat(
                    document.getElementById("cargoWeight").value,
                ),
                cargoType: document.getElementById("cargoType").value,
            },
        ],
        addtitionalInfo: document.getElementById("additionalInfo").value,
    };
    console.log(orderData);
    const modal = document.getElementById("orderModal");
    const submitBtn = document.getElementById("submitOrderBtn");
    modal.classList.add("loading");
    submitBtn.disabled = true;

    try {
        const token = localStorage.getItem("token");
        _O;
        const response = await fetch(`${API_BASE_URL_ORDERS}/Order/addOrder`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            showToast(errorText || "Ошибка добавления заказа");
            modal.classList.remove("loading");
            submitBtn.disabled = false;
            return;
        }

        const result = await response.json();
        showToast("Заказ успешно добавлен");
        closeOrderModal();
        loadOrders();
    } catch (error) {
        console.error(error);
        showToast("Ошибка сети. Попробуйте позже");
        modal.classList.remove("loading");
        submitBtn.disabled = false;
    }
}

function debounceSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => loadOrders(), 500);
}

function onSearchInput() {
    const searchInput = document.getElementById("searchOrder");
    const clearBtn = document.getElementById("clearSearchBtn");

    // Show/hide clear button
    if (clearBtn) {
        clearBtn.classList.toggle("visible", searchInput.value.length > 0);
    }

    debounceSearch();
}

function clearSearch() {
    document.getElementById("searchOrder").value = "";
    document.getElementById("clearSearchBtn").classList.remove("visible");
    loadOrders();
}

function onFilterChange() {
    // Add visual feedback
    const tableContainer = document.querySelector(".table-container");
    if (tableContainer) {
        tableContainer.classList.add("filters-changing");
        setTimeout(
            () => tableContainer.classList.remove("filters-changing"),
            400,
        );
    }

    // Highlight active filters
    document
        .querySelectorAll(".filters-wrapper .form-group")
        .forEach((group) => {
            group.classList.remove("filter-active");
        });

    const statusFilter = document.getElementById("statusFilter").value;
    const dateFilter = document.getElementById("dateFilter").value;

    if (statusFilter) {
        document
            .getElementById("statusFilterGroup")
            .classList.add("filter-active");
    }
    if (dateFilter !== "all") {
        document
            .getElementtById("dateFilterGroup")
            .classList.add("filter-active");
    }

    loadOrders();
}

function getDateRange() {
    const dateFilter = document.getElementById("dateFilter").value;
    const now = new Date();
    let dateFrom = null;

    switch (dateFilter) {
        case "week":
            dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case "month":
            dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case "year":
            dateFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
        default:
            return { from: null, to: null };
    }

    return { from: dateFrom.toISOString(), to: now.toISOString() };
}
const token = localStorage.getItem("token");

async function loadOrders() {
    try {
        const response = await fetch(
            `${API_BASE_URL_ORDERS}/Order/getOrdersListForAdmin`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (!response.ok) throw new Error("Failed to load orders");
        const orders = await response.json();
        const tbody = document.querySelector("#ordersTable tbody");
        if (!orders || orders.length === 0) {
            tbody.innerHTML = `
                  <tr>
                    <td colspan="7" style="text-align: center; color: var(--color-primary); padding: 40px;">
                      <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <h3>Заказы не найдены</h3>
                        <p>В системе пока нет зарегистрированных заказов</p>
                      </div>
                    </td>
                  </tr>
                `;
            return;
        }

        tbody.innerHTML = orders
            .map((order) => {
                const date = order.route.deliveryDate
                    ? new Date(order.route.deliveryDate).toLocaleDateString(
                          "ru-RU",
                      )
                    : "—";

                const routeText =
                    order.route &&
                    order.route.startLocation &&
                    order.route.endLocation
                        ? `${order.route.startLocation} → ${order.route.endLocation}`
                        : "—";

                const cargoText =
                    order.cargos && order.cargos.length > 0
                        ? `${order.cargos[0].cargoType}, ${order.cargos[0].cargoWeight} кг`
                        : "—";

                const statusText = order.orderStatus || "Неизвестно";

                const clientText =
                    order.user && order.user.fullName
                        ? order.user.fullName
                        : "—";

                return `
                    <tr>
                        <td>${order.orderId}</td>
                        <td>${clientText}</td>
                        <td>${routeText}</td>
                        <td>${cargoText}</td>
                        <td><span class="status-badge ${getStatusClass(statusText)}">${statusText}</span></td>
                        <td>${date}</td>
                        <td>${order.price} BYN</td>
                    </tr>
                `;
            })
            .join("");
    } catch (error) {
        console.error(error);
        const tbody = document.querySelector("#ordersTable tbody");
        tbody.innerHTML =
            '<tr><td colspan="7">Ошибка загрузки заказов</td></tr>';
    }
}

async function filterOrders() {
    const status = document.getElementById("statusFilter").value;
    const search = document.getElementById("searchOrder").value;
    if (status == "" && search == "") {
        loadOrders();
        return;
    }
    try {
        const response = await fetch(
            `${API_BASE_URL_ORDERS}/Order/getOrderBySearch?SearchTerm=${encodeURIComponent(search)}&StatusFilter=${status !== "" ? status : ""}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            },
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const orders = await response.json();
        const tbody = document.querySelector("#ordersTable tbody");
        tbody.innerHTML = "";
        console.log(orders);
        if (!orders || orders.length === 0) {
            tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--color-primary); padding: 40px;">
            <div class="empty-state">
              <div class="empty-icon">📋</div>
              <h3>Заказы не найдены</h3>
              <p>В системе пока нет зарегистрированных заказов</p>
            </div>
          </td>
        </tr>
      `;
            return;
        }

        tbody.innerHTML = orders
            .map((order) => {
                const date = order.route.deliveryDate
                    ? new Date(order.route.deliveryDate).toLocaleDateString(
                          "ru-RU",
                      )
                    : "—";

                const routeText =
                    order.route &&
                    order.route.startLocation &&
                    order.route.endLocation
                        ? `${order.route.startLocation} → ${order.route.endLocation}`
                        : "—";

                const cargoText =
                    order.cargos && order.cargos.length > 0
                        ? `${order.cargos[0].cargoType}, ${order.cargos[0].cargoWeight} кг`
                        : "—";

                const statusText = order.orderStatus || "Неизвестно";
                const clientText =
                    order.user && order.user.fullName
                        ? order.user.fullName
                        : "—";

                return `
                 <tr>
                 <td>${order.orderId}</td>
                 <td>${clientText}</td>
                 <td>${routeText}</td>
                 <td>${cargoText}</td>
                 <td><span class="status-badge ${getStatusClass(statusText)}">${statusText}</span></td>
                 <td>${date}</td>
                 <td>${order.price} BYN</td>
                 </tr>
             `;
            })
            .join("");
    } catch (error) {
        console.error("Ошибка загрузки заказов:", error);
        const tbody = document.querySelector("#driversTable tbody");
        tbody.innerHTML = `
          < tr >
          <td colspan="6" style="text-align: center; color: var(--color-danger); padding: 40px;">
            <div class="empty-state">
              <div class="empty-icon">⚠</div>
              <h3>Ошибка загрузки</h3>
              <p>Не удалось загрузить данные о заказах</p>
            </div>
          </td>
      </tr >
          `;
    }
}
async function loadUserOrders() {
    try {
        const response = await fetch(
            `${API_BASE_URL_ORDERS}/Order/getOrdersListForUser`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token} `,
                    "Content-Type": "application/json",
                },
            },
        );
        const orders = await response.json();
        const tbody = document.querySelector("#ordersUserTable tbody");
        tbody.innerHTML = orders
            .map((order) => {
                const routeText =
                    order.route &&
                    order.route.startLocation &&
                    order.route.endLocation
                        ? `${order.route.startLocation} → ${order.route.endLocation} `
                        : "—";

                const date = order.route.deliveryDate
                    ? new Date(order.route.deliveryDate).toLocaleDateString(
                          "ru-RU",
                      )
                    : "—";
                const cargoText =
                    order.cargos && order.cargos.length > 0
                        ? `${order.cargos[0].cargoType}, ${order.cargos[0].cargoWeight} кг`
                        : "—";

                const statusText = order.orderStatus || "Неизвестно";
                return `
          < tr >
                        <td>${order.orderId}</td>
                        <td>${routeText}</td>
                        <td>${cargoText}</td>
                        <td><span class="status-badge ${getStatusClass(statusText)}">${statusText}</span></td>
                        <td>${date}</td>
                        <td>${order.price} BYN</td>
                    </tr >
          `;
            })
            .join("");
    } catch (error) {
        console.error(error);
    }
}

function getStatusClass(status) {
    const statusMap = {
        pending: "pending",
        "inTransit": "inTransit",
        delivered: "delivered",
        cancelled: "cancelled",
    };
    return statusMap[status?.toLowerCase()] || "Ожидание";
}

function getStatusText(status) {
    const statusMap = {
        pending: "Ожидание",
        "inTransit": "В пути",
        delivered: "Доставлен",
        cancelled: "Отменён",
    };
    return statusMap[status?.toLowerCase()] || "Неизвестно";
}

function formatDate(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function formatCost(cost) {
    if (!cost && cost !== 0) return "—";
    return new Intl.NumberFormat("ru-RU").format(Math.round(cost)) + " ₽";
}

function createNewOrder() {
    openOrderModal();
}

function openOrderModal() {
    const modal = document.getElementById("orderModal");
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    const today = new Date().toISOString().split("T")[0];
    document.getElementById("deliveryDate").setAttribute("min", today);

    resetOrderForm();
}

function closeOrderModal() {
    const modal = document.getElementById("orderModal");
    modal.classList.remove("active");
    document.body.style.overflow = "";
    resetOrderForm();
}

function resetOrderForm() {
    const form = document.getElementById("orderForm");
    form.reset();

    document.querySelectorAll(".form-group").forEach((group) => {
        group.classList.remove("error");
    });

    const modal = document.getElementById("orderModal");
    modal.classList.remove("loading");

    const submitBtn = document.getElementById("submitOrderBtn");
    submitBtn.disabled = false;
}

function validateOrderForm() {
    let isValid = true;

    document.querySelectorAll(".form-group").forEach((group) => {
        group.classList.remove("error");
    });

    const startLocation = document.getElementById("startLocation").value.trim();
    if (!startLocation) {
        document.getElementById("startLocationGroup").classList.add("error");
        isValid = false;
    }

    const endLocation = document.getElementById("endLocation").value.trim();
    if (!endLocation) {
        document.getElementById("endLocationGroup").classList.add("error");
        isValid = false;
    }

    const cargoDescription = document
        .getElementById("cargoDescription")
        .value.trim();
    if (!cargoDescription) {
        document.getElementById("cargoDescriptionGroup").classList.add("error");
        isValid = false;
    }

    // Validate weight
    const weight = parseFloat(document.getElementById("cargoWeight").value);
    if (!weight || weight <= 0) {
        document.getElementById("weightGroup").classList.add("error");
        isValid = false;
    }

    // Validate cargo type
    const cargoType = document.getElementById("cargoType").value;
    if (!cargoType) {
        document.getElementById("cargoTypeGroup").classList.add("error");
        isValid = false;
    }

    // Validate delivery date
    const deliveryDate = document.getElementById("deliveryDate").value;
    if (!deliveryDate) {
        document.getElementById("deliveryDateGroup").classList.add("error");
        isValid = false;
    }

    return isValid;
}

// Close modal on overlay click
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("orderModal");
    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            closeOrderModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            const activeModal = document.getElementById("orderModal");
            if (activeModal.classList.contains("active")) {
                closeOrderModal();
            }
        }
    });
});

function viewOrder(orderId) {
    showToast("Просмотр заказа #" + orderId, "info");
}

function trackOrder(orderId) {
    window.location.href = "cargo-map.html?order=" + orderId;
}

function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadOrders();
    }
}

function goToNextPage() {
    currentPage++;
    loadOrders();
}

// Pagination button listeners (legacy support)
document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        loadOrders();
    }
});

document.getElementById("nextBtn").addEventListener("click", () => {
    currentPage++;
    loadOrders();
});

// Toast notification system
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast toast - ${type} `;

    const icons = {
        info: "fas fa-info-circle",
        success: "fas fa-check-circle",
        warning: "fas fa-exclamation-circle",
        error: "fas fa-times-circle",
    };

    toast.innerHTML = `
          < i class="toast-icon ${icons[type] || icons["info"]}" ></i >
                <div class="toast-content">${message}</div>
                <button class="toast-close" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
        `;

    container.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = "toastSlideOut 0.4s ease forwards";
            setTimeout(() => toast.remove(), 400);
        }
    }, 5000);
}

// Legacy alert function (backward compatibility)
function showAlert(message, type = "info") {
    showToast(message, type);
}

// Переключение бокового меню на мобильных
function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const menuToggle = document.querySelector(".menu-toggle");

    if (sidebar) {
        sidebar.classList.toggle("active");
    }

    if (menuToggle) {
        menuToggle.classList.toggle("active");
    }

    let overlay = document.getElementById("sidebarOverlay");
    if (overlay) {
        overlay.remove();
    } else {
        const newOverlay = document.createElement("div");
        newOverlay.id = "sidebarOverlay";
        newOverlay.className = "sidebar-overlay";
        newOverlay.onclick = toggleSidebar;
        document.body.appendChild(newOverlay);
    }
}

// Закрытие меню при клике на ссылку (для мобильных)
document.querySelectorAll(".sidebar-menu a").forEach((link) => {
    link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            toggleSidebar();
        }
    });
});

// Handle window resize for mobile/desktop view switching
let resizeTimeout;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Re-render orders to switch between mobile card view and desktop table
        const tbody = document.querySelector("#ordersTable tbody");
        if (tbody && tbody.querySelector("tr")) {
            const isMobile = window.innerWidth <= 768;
            const actionsCells = tbody.querySelectorAll("tr td:last-child");
            actionsCells.forEach((cell) => {
                if (isMobile) {
                    cell.classList.remove("hide-mobile");
                    if (!cell.querySelector(".mobile-actions")) {
                        // Re-render needed for mobile layout
                        loadOrders();
                    }
                } else {
                    cell.classList.add("hide-mobile");
                }
            });
        }
    }, 250);
});
