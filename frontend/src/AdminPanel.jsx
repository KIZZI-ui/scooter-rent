import { useEffect, useState } from "react";

const districts = {
  center: {
    name: "Центр Москвы",
    latitude: 55.751244,
    longitude: 37.618423,
  },

  arbat: {
    name: "Арбат",
    latitude: 55.752023,
    longitude: 37.593482,
  },

  tverskaya: {
    name: "Тверская",
    latitude: 55.765343,
    longitude: 37.605847,
  },
};

function AdminPanel() {
  const [scooters, setScooters] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [stats, setStats] = useState({
    usersCount: 0,
    scootersCount: 0,
    ridesCount: 0,
    revenue: 0,
  });

  const [form, setForm] = useState({
    serial: "",
    charge: "",
    district: "center",
    status: "available",
  });

  const token =
    localStorage.getItem("token");

  const loadScooters = async () => {
    const response = await fetch(
      "http://localhost:5000/scooters"
    );

    const data = await response.json();

    setScooters(data);
  };

  const loadStats = async () => {
    const response = await fetch(
      "http://localhost:5000/stats"
    );

    const data = await response.json();

    setStats(data);
  };

  useEffect(() => {
    loadScooters();
    loadStats();
  }, []);

  const showMessage = (
    text,
    type = "success"
  ) => {
    setMessage({
      text,
      type,
    });

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const updateStatus = async (
    id,
    status
  ) => {
    const response = await fetch(
      `http://localhost:5000/scooters/${id}/status`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          status,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      showMessage(
        data.message,
        "error"
      );

      return;
    }

    loadScooters();
  };

  const deleteScooter = async (id) => {
    const response = await fetch(
      `http://localhost:5000/scooters/${id}`,
      {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      showMessage(
        data.message,
        "error"
      );

      return;
    }

    showMessage(
      "Самокат удалён",
      "success"
    );

    loadScooters();
    loadStats();
  };

  const createScooter = async () => {
    if (
      !form.serial ||
      !form.charge
    ) {
      showMessage(
        "Заполни серийный номер и заряд",
        "error"
      );

      return;
    }

    const model = `S-${form.serial}`;

    const exists = scooters.find(
      (s) => s.model === model
    );

    if (exists) {
      showMessage(
        "Такой самокат уже существует",
        "error"
      );

      return;
    }

    const selectedDistrict =
      districts[form.district];

    const response = await fetch(
      "http://localhost:5000/scooters",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          model,

          charge: Number(
            form.charge
          ),

          latitude:
            selectedDistrict.latitude,

          longitude:
            selectedDistrict.longitude,

          status: form.status,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      showMessage(
        data.message,
        "error"
      );

      return;
    }

    setForm({
      serial: "",
      charge: "",
      district: "center",
      status: "available",
    });

    showMessage(
      "Самокат добавлен",
      "success"
    );

    loadScooters();
    loadStats();
  };

  const statusText = {
    available: "Свободен",
    busy: "Занят",
    repair: "Ремонт",
  };

  return (
    <section className="admin-section">
      {message && (
        <div
          className={`notification ${message.type}`}
        >
          {message.text}
        </div>
      )}

      <h1>
        Административная панель
      </h1>

      <p>
        Управление
        электросамокатами
      </p>

      <div className="stats-grid">
        <div className="stats-card">
          <span>
            Пользователи
          </span>

          <strong>
            {stats.usersCount}
          </strong>
        </div>

        <div className="stats-card">
          <span>Самокаты</span>

          <strong>
            {stats.scootersCount}
          </strong>
        </div>

        <div className="stats-card">
          <span>Поездки</span>

          <strong>
            {stats.ridesCount}
          </strong>
        </div>

        <div className="stats-card">
          <span>Выручка</span>

          <strong>
            {stats.revenue} ₽
          </strong>
        </div>
      </div>

      <div className="create-form compact">
        <input
          placeholder="Серийный номер"
          value={form.serial}
          onChange={(e) =>
            setForm({
              ...form,
              serial:
                e.target.value,
            })
          }
        />

        <input
          placeholder="Заряд, %"
          value={form.charge}
          onChange={(e) =>
            setForm({
              ...form,
              charge:
                e.target.value,
            })
          }
        />

        <select
          value={form.district}
          onChange={(e) =>
            setForm({
              ...form,
              district:
                e.target.value,
            })
          }
        >
          <option value="center">
            Центр Москвы
          </option>

          <option value="arbat">
            Арбат
          </option>

          <option value="tverskaya">
            Тверская
          </option>
        </select>

        <button
          onClick={createScooter}
        >
          Добавить
        </button>
      </div>

      <div className="admin-table">
        {scooters.map((scooter) => (
          <div
            className="admin-card"
            key={scooter.id}
          >
            <div>
              <span>Самокат</span>

              <strong>
                {scooter.model}
              </strong>
            </div>

            <div>
              <span>Заряд</span>

              <strong>
                {scooter.charge}%
              </strong>
            </div>

            <div>
              <span>Статус</span>

              <strong>
                {
                  statusText[
                    scooter.status
                  ]
                }
              </strong>
            </div>

            <div className="admin-actions">
              <button
                onClick={() =>
                  updateStatus(
                    scooter.id,
                    "available"
                  )
                }
              >
                Свободен
              </button>

              <button
                onClick={() =>
                  updateStatus(
                    scooter.id,
                    "busy"
                  )
                }
              >
                Занят
              </button>

              <button
                onClick={() =>
                  updateStatus(
                    scooter.id,
                    "repair"
                  )
                }
              >
                Ремонт
              </button>

              <button
                className="delete-button"
                onClick={() =>
                  deleteScooter(
                    scooter.id
                  )
                }
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AdminPanel;