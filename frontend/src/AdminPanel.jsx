import { useEffect, useState } from "react";

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

function AdminPanel() {
  const [scooters, setScooters] = useState([]);
  const [notification, setNotification] = useState("");

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
    const res = await fetch("http://localhost:5000/scooters");
    const data = await res.json();
    setScooters(data);
  };

  const loadTariff = async () => {
    const res = await fetch("http://localhost:5000/tariff");
    const data = await res.json();

    setTariff({
      minutePrice: data.minutePrice,
      startPrice: data.startPrice,
    });
  };

  const loadStats = async () => {
    const res = await fetch("http://localhost:5000/admin-stats");
    const data = await res.json();

    setStats(data);
  };

  useEffect(() => {
    loadScooters();
    loadTariff();
    loadStats();
  }, []);

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

    const response = await fetch("http://localhost:5000/scooters", {
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
    }
  };

  const updateStatus = async (id, status) => {
    const response = await fetch(`http://localhost:5000/scooters/${id}/status`, {
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
    }
  };

  const deleteScooter = async (id) => {
    const response = await fetch(`http://localhost:5000/scooters/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      await loadScooters();
      await loadStats();
      showNotification("Самокат удалён");
    }
  };

  const updateTariff = async () => {
    const response = await fetch("http://localhost:5000/tariff", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(tariff),
    });

    if (response.ok) {
      showNotification("Тариф успешно обновлён");
    }
  };

  const getScooterRevenue = (scooterId) => {
    const scooterStat = stats.scooterStats.find(
      (item) => item.scooterId === scooterId
    );

    return scooterStat?.revenue || 0;
  };

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

        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span>Самокатов</span>
            <strong>{stats.scootersCount}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Общая выручка</span>
            <strong>{stats.totalRevenue} ₽</strong>
          </div>
        </div>

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
            {scooters.map((scooter) => (
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
                  <strong>{statusText[scooter.status]}</strong>
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
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminPanel;