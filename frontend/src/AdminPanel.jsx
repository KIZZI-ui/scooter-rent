import { useEffect, useState } from "react";

const API_URL = (() => {
  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000";
  }

  if (hostname.startsWith("192.168.")) {
    return `http://${hostname}:5000`;
  }

  return window.location.origin;
})();

const metroCoords = {
  Арбатская: { latitude: 55.7522, longitude: 37.6045 },
  ВДНХ: { latitude: 55.821, longitude: 37.639 },
  Таганская: { latitude: 55.741, longitude: 37.653 },
  Киевская: { latitude: 55.744, longitude: 37.566 },
  Сокол: { latitude: 55.805, longitude: 37.515 },
  Белорусская: { latitude: 55.777, longitude: 37.584 },
  Курская: { latitude: 55.758, longitude: 37.659 },
  Павелецкая: { latitude: 55.731, longitude: 37.637 },
  "Китай-город": { latitude: 55.756, longitude: 37.633 },
  "Юго-Западная": { latitude: 55.664, longitude: 37.482 },
};

const periodTitles = {
  week: "Последние 7 дней",
  month: "Доход по месяцам",
  year: "Доход по годам",
};

function AdminPanel() {
  const [scooters, setScooters] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [usersExpanded, setUsersExpanded] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [notification, setNotification] = useState("");
  const [incomePeriod, setIncomePeriod] = useState("week");

  const [stats, setStats] = useState({
    scootersCount: 0,
    totalRevenue: 0,
    scooterStats: [],
  });

  const [tariff, setTariff] = useState({
    minutePrice: 7,
    startPrice: 40,
  });

  const [newScooter, setNewScooter] = useState({
    serial: "",
    charge: 100,
    metro: "",
    latitude: 55.751244,
    longitude: 37.618423,
    status: "available",
  });

  const token = localStorage.getItem("token");

  const averageCharge =
    scooters.length > 0
      ? Math.round(
          scooters.reduce((sum, scooter) => sum + Number(scooter.charge || 0), 0) /
            scooters.length
        )
      : 0;

  const activeRides = scooters.filter((scooter) => scooter.status === "busy").length;

  const averageRideMinutes =
    stats.scooterStats?.length > 0
      ? Math.max(
          1,
          Math.round(
            stats.scooterStats.reduce((sum, item) => sum + Number(item.ridesCount || 0), 0) /
              Math.max(stats.scootersCount || 1, 1)
          )
        )
      : 0;

  const statusText = {
    available: "Свободен",
    busy: "Занят",
    repair: "Ремонт",
  };

  const showNotification = (text) => {
    setNotification(text);

    setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  const loadScooters = async () => {
    const res = await fetch(`${API_URL}/scooters`);
    const data = await res.json();

    setScooters(data);
  };

  const loadTariff = async () => {
    const res = await fetch(`${API_URL}/tariff`);
    const data = await res.json();

    setTariff({
      minutePrice: data.minutePrice,
      startPrice: data.startPrice,
    });
  };

const loadUsers = async () => {
  const res = await fetch(`${API_URL}/users`);
  const data = await res.json();

  setUsers(data);
};

  const loadStats = async () => {
    const res = await fetch(`${API_URL}/admin-stats`);
    const data = await res.json();

    setStats(data);
  };

  useEffect(() => {
  loadScooters();
  loadTariff();
  loadStats();
  loadUsers();

  const interval = setInterval(() => {
    loadUsers();
  }, 3000);

  return () => clearInterval(interval);
}, []);

const blockUser = async (id) => {
  const response = await fetch(`${API_URL}/users/${id}/block`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reason: "Нарушение правил сервиса",
    }),
  });

  if (response.ok) {
    await loadUsers();
    showNotification("Пользователь заблокирован");
  } else {
    showNotification("Ошибка блокировки пользователя");
  }
};

const unblockUser = async (id) => {
  const response = await fetch(`${API_URL}/users/${id}/unblock`, {
    method: "PUT",
  });

  if (response.ok) {
    await loadUsers();
    showNotification("Пользователь разблокирован");
  } else {
    showNotification("Ошибка разблокировки пользователя");
  }
};

  const createScooter = async () => {
    if (!newScooter.serial) {
      showNotification("Введите серийный номер");
      return;
    }

    if (!newScooter.metro) {
      showNotification("Выберите метро");
      return;
    }

    const scooterToCreate = {
      model: `S-${newScooter.serial}`,
      charge: Number(newScooter.charge),
      latitude: Number(newScooter.latitude),
      longitude: Number(newScooter.longitude),
      status: "available",
    };

    const response = await fetch(`${API_URL}/scooters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(scooterToCreate),
    });

    if (response.ok) {
      await loadScooters();
      await loadStats();

      setNewScooter({
        serial: "",
        charge: 100,
        metro: "",
        latitude: 55.751244,
        longitude: 37.618423,
        status: "available",
      });

      showNotification("Самокат успешно добавлен");
    } else {
      showNotification("Ошибка добавления самоката");
    }
  };

  const updateStatus = async (id, status) => {
    const response = await fetch(`${API_URL}/scooters/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      await loadScooters();
      await loadStats();

      showNotification(`Статус изменён на "${statusText[status]}"`);
    } else {
      showNotification("Ошибка изменения статуса");
    }
  };

  const deleteScooter = async (id) => {
    const response = await fetch(`${API_URL}/scooters/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      await loadScooters();
      await loadStats();

      showNotification("Самокат удалён");
    } else {
      showNotification("Ошибка удаления самоката");
    }
  };

  const updateTariff = async () => {
    const response = await fetch(`${API_URL}/tariff`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        startPrice: Number(tariff.startPrice),
        minutePrice: Number(tariff.minutePrice),
      }),
    });

    if (response.ok) {
      showNotification("Тариф успешно обновлён");
    } else {
      showNotification("Ошибка обновления тарифа");
    }
  };

  const getScooterRevenue = (scooterId) => {
    const scooterStat = stats.scooterStats.find(
      (item) => item.scooterId === scooterId
    );

    return scooterStat?.revenue || 0;
  };

const filteredUsers = users.filter((user) => {
  const query = userSearch.toLowerCase();

  const matchesSearch =
    user.username?.toLowerCase().includes(query) ||
    user.email?.toLowerCase().includes(query) ||
    user.phone?.toLowerCase().includes(query);

  const matchesFilter =
    userFilter === "all" ||
    (userFilter === "online" && user.isOnline) ||
    (userFilter === "offline" && !user.isOnline) ||
    (userFilter === "blocked" && user.status === "blocked");

  return matchesSearch && matchesFilter;
});

  return (
    <div className="admin-page">
      {notification && (
        <div className="custom-notification">
          <div className="notification-icon">✓</div>

          <div>
            <strong>Успешно</strong>
            <p>{notification}</p>
          </div>
        </div>
      )}

      <div className="admin-container">
        <h1>Админ-панель</h1>

        <div className="system-status">
          <span className="status-dot"></span>
          Система активна
        </div>

        <div className="admin-stats-grid">
          <div className="income-chart">
            <div className="chart-header">
              <div>
                <h2>Доход</h2>
                <span>{periodTitles[incomePeriod]}</span>
              </div>

              <div className="chart-tabs">
                <button
                  className={incomePeriod === "week" ? "active" : ""}
                  onClick={() => setIncomePeriod("week")}
                >
                  Неделя
                </button>

                <button
                  className={incomePeriod === "month" ? "active" : ""}
                  onClick={() => setIncomePeriod("month")}
                >
                  Месяц
                </button>

<button
  className={incomePeriod === "year" ? "active" : ""}
  onClick={() => setIncomePeriod("year")}
>
  Год
</button>

              </div>
            </div>

            <div className="chart-bars">
  {stats.income?.[incomePeriod]?.map((item) => {
    const maxValue = Math.max(
      ...stats.income[incomePeriod].map((i) => i.value),
      1
    );

    const height = Math.max(
      (item.value / maxValue) * 150,
      20
    );

    return (
      <div className="chart-item" key={item.label}>
        <div
          className="chart-bar"
          style={{ height: `${height}px` }}
        ></div>

        <strong>{item.value} ₽</strong>
        <span>{item.label}</span>
      </div>
    );
  })}
</div>
          </div>

          <div className="admin-stat-card scooters-card">
  <h3>Активность</h3>

  <div className="mini-stats">
    <div className="activity-item scooter-activity">
  <img src="/scooter.png" alt="Самокат" className="activity-scooter-img" />
  <span>Самокатов</span>
  <strong>{scooters.length}</strong>
</div>

    <div className="activity-item">
  <span>Средний заряд</span>

  <strong>{averageCharge}%</strong>

  <small className="range-text">
    ~{Math.round((averageCharge / 100) * 70)} км
  </small>
</div>

    <div>
      <span>Активных поездок</span>
      <strong>{activeRides}</strong>
    </div>

    <div>
      <span>Средняя поездка</span>
      <strong>{averageRideMinutes} мин</strong>
    </div>
  </div>
</div>

          <div className="admin-stat-card revenue-card">
            <span>Выручка за сегодня</span>
<strong>{stats.todayRevenue || 0} ₽</strong>
          </div>
        </div>

        <section className={`admin-users-card ${usersExpanded ? "expanded" : ""}`}>
  <div className="users-card-header">
    <div>
      <h2>Пользователи</h2>
      <span>Управление аккаунтами</span>
    </div>

    <strong>{users.length}</strong>
  </div>

  <div className="users-toolbar">
    <input
      type="text"
      placeholder="Поиск по имени, email или телефону"
      value={userSearch}
      onChange={(e) => setUserSearch(e.target.value)}
    />

    <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
      <option value="all">Все пользователи</option>
      <option value="online">Онлайн</option>
      <option value="offline">Офлайн</option>
      <option value="blocked">Заблокированные</option>
    </select>

    <button onClick={() => setUsersExpanded(!usersExpanded)}>
      {usersExpanded ? "Свернуть" : "Развернуть"}
    </button>
  </div>

  <div className="users-list">
    {filteredUsers.map((user) => (
      <div className="user-row" key={user.id}>
        <div>
          <strong>{user.username}</strong>
          <span>{user.email}</span>
        </div>

        <div>
          <span>Телефон</span>
          <b>{user.phone || "Не указан"}</b>
        </div>

        <div>
          <span>Баланс</span>
          <b>{user.balance} ₽</b>
        </div>

        <div>
          <span>Статус</span>
          <b
            className={
              user.status === "blocked"
                ? "user-blocked"
                : user.isOnline
                ? "user-online"
                : "user-offline"
            }
          >
            {user.status === "blocked"
              ? "Заблокирован"
              : user.isOnline
              ? "Онлайн"
              : "Офлайн"}
          </b>
        </div>

        <div className="user-actions">
          <button onClick={() => setSelectedUser(user)}>
            Профиль
          </button>

          {user.status === "blocked" ? (
            <button className="user-unblock-btn" onClick={() => unblockUser(user.id)}>
              Разблокировать
            </button>
          ) : (
            <button className="user-block-btn" onClick={() => blockUser(user.id)}>
              Заблокировать
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
</section>

{selectedUser && (
  <div className="user-profile-modal">
    <div className="user-profile-card">
      <button className="close-button" onClick={() => setSelectedUser(null)}>
        ×
      </button>

      <h2>Профиль пользователя</h2>

      <div className="profile-info-grid">
        <div>
          <span>Имя</span>
          <strong>{selectedUser.username}</strong>
        </div>

        <div>
          <span>Email</span>
          <strong>{selectedUser.email}</strong>
        </div>

        <div>
          <span>Телефон</span>
          <strong>{selectedUser.phone || "Не указан"}</strong>
        </div>

        <div>
          <span>Баланс</span>
          <strong>{selectedUser.balance} ₽</strong>
        </div>

        <div>
          <span>Роль</span>
          <strong>{selectedUser.role}</strong>
        </div>

        <div>
          <span>Статус</span>
          <strong>
            {selectedUser.status === "blocked"
              ? "Заблокирован"
              : selectedUser.isOnline
              ? "Онлайн"
              : "Офлайн"}
          </strong>
        </div>
      </div>
    </div>
  </div>
)}

        <section className="admin-block">
          <h2>Управление тарифом</h2>

          <div className="admin-form">
            <input
              type="number"
              placeholder="Цена старта"
              value={tariff.startPrice}
              onChange={(e) =>
                setTariff({
                  ...tariff,
                  startPrice: e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Цена минуты"
              value={tariff.minutePrice}
              onChange={(e) =>
                setTariff({
                  ...tariff,
                  minutePrice: e.target.value,
                })
              }
            />

            <button onClick={updateTariff}>Сохранить тариф</button>
          </div>

          <div className="tariff-note">
            С 18:00 до 22:00 действует автоматическое повышение цены из-за высокого спроса
          </div>
        </section>

        <section className="admin-block">
          <h2>Добавить самокат</h2>

          <div className="admin-form">
            <input
              type="text"
              placeholder="Серийный номер, например 104"
              value={newScooter.serial}
              onChange={(e) =>
                setNewScooter({
                  ...newScooter,
                  serial: e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Заряд"
              value={newScooter.charge}
              onChange={(e) =>
                setNewScooter({
                  ...newScooter,
                  charge: e.target.value,
                })
              }
            />

            <select
              value={newScooter.metro}
              onChange={(e) => {
                const selected = metroCoords[e.target.value];

                if (!selected) {
                  setNewScooter({
                    ...newScooter,
                    metro: "",
                  });

                  return;
                }

                setNewScooter({
                  ...newScooter,
                  metro: e.target.value,
                  latitude: selected.latitude,
                  longitude: selected.longitude,
                });
              }}
            >
              <option value="">Выберите метро</option>
              <option value="Арбатская">Арбатская</option>
              <option value="ВДНХ">ВДНХ</option>
              <option value="Таганская">Таганская</option>
              <option value="Киевская">Киевская</option>
              <option value="Сокол">Сокол</option>
              <option value="Белорусская">Белорусская</option>
              <option value="Курская">Курская</option>
              <option value="Павелецкая">Павелецкая</option>
              <option value="Китай-город">Китай-город</option>
              <option value="Юго-Западная">Юго-Западная</option>
            </select>

            <button onClick={createScooter}>Добавить самокат</button>
          </div>
        </section>

        <section className="admin-block">
          <h2>Список самокатов</h2>

          <div className="admin-scooters">
            {scooters.length === 0 ? (
              <div className="empty-history">Самокатов пока нет</div>
            ) : (
              scooters.map((scooter) => (
                <div className="admin-scooter-card" key={scooter.id}>
                  <div className="scooter-model">{scooter.model}</div>

                  <div className="scooter-charge">
                    <span>Заряд</span>
                    <strong>{scooter.charge}%</strong>
                  </div>

                  <div className="scooter-revenue">
                    <span>Выручка</span>
                    <strong>{getScooterRevenue(scooter.id)} ₽</strong>
                  </div>

                  <div className={`scooter-status status-${scooter.status}`}>
                    <span>Статус</span>
                    <strong>{statusText[scooter.status] || "Неизвестно"}</strong>
                  </div>

                  <div className="admin-actions">
                    <button
                      className="free-btn"
                      onClick={() => updateStatus(scooter.id, "available")}
                    >
                      Свободен
                    </button>

                    <button
                      className="busy-btn"
                      onClick={() => updateStatus(scooter.id, "busy")}
                    >
                      Занят
                    </button>

                    <button
                      className="repair-btn"
                      onClick={() => updateStatus(scooter.id, "repair")}
                    >
                      Ремонт
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => deleteScooter(scooter.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminPanel;
