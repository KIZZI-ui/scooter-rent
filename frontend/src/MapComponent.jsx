import { useEffect, useState } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";

function MapComponent() {
  const [scooters, setScooters] = useState([]);
  const [selectedScooter, setSelectedScooter] = useState(null);
  const [rideStarted, setRideStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [cost, setCost] = useState(0);
  const [finishedRide, setFinishedRide] = useState(null);
  const [rideHistory, setRideHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const statusText = {
    available: "Свободен",
    busy: "Занят",
    repair: "Ремонт",
  };

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const loadScooters = async () => {
    const res = await fetch("http://localhost:5000/scooters");
    const data = await res.json();

    setScooters(data);

    if (!selectedScooter && data.length > 0) {
      setSelectedScooter(data[0]);
      return;
    }

    if (selectedScooter) {
      const updated = data.find((s) => s.id === selectedScooter.id);

      if (updated) {
        setSelectedScooter(updated);
      }
    }
  };

  const loadRides = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (!currentUser) {
      setRideHistory([]);
      return;
    }

    const res = await fetch(`http://localhost:5000/rides/${currentUser.id}`);
    const data = await res.json();

    setRideHistory(data);
  };

  useEffect(() => {
    loadScooters();
    loadRides();
  }, []);

  useEffect(() => {
    if (!rideStarted) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [rideStarted]);

  useEffect(() => {
    if (rideStarted) {
      const minutes = Math.max(1, Math.ceil(seconds / 60));
      setCost(40 + minutes * 7);
    }
  }, [seconds, rideStarted]);

  const updateScooterStatus = async (id, status) => {
    const response = await fetch(`http://localhost:5000/scooters/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.message || "Ошибка изменения статуса", "error");
      return false;
    }

    if (data.scooter) {
      setSelectedScooter(data.scooter);

      setScooters((prev) =>
        prev.map((scooter) =>
          scooter.id === data.scooter.id ? data.scooter : scooter
        )
      );
    }

    return true;
  };

  const startRide = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (!currentUser) {
      showMessage("Войдите в аккаунт, чтобы начать поездку", "error");
      return;
    }

    if (selectedScooter.status !== "available") {
      showMessage("Этот самокат сейчас недоступен", "error");
      return;
    }

    if (currentUser.balance < 50) {
      showMessage("Недостаточно средств на балансе", "error");
      return;
    }

    const updated = await updateScooterStatus(selectedScooter.id, "busy");

    if (!updated) {
      return;
    }

    setRideStarted(true);
    setSeconds(0);
    setCost(47);
    setFinishedRide(null);

    showMessage("Поездка началась", "success");
  };

  const finishRide = async () => {
    const res = await fetch("http://localhost:5000/rides", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scooterId: selectedScooter.id,
        duration: seconds,
        cost,
        userId: JSON.parse(localStorage.getItem("user"))?.id,
      }),
    });

    const savedRide = await res.json();

    if (!res.ok) {
      showMessage(savedRide.message || "Ошибка завершения поездки", "error");
      return;
    }

    const savedUser = JSON.parse(localStorage.getItem("user"));

    localStorage.setItem(
      "user",
      JSON.stringify({
        ...savedUser,
        balance: savedRide.balance,
      })
    );

    const finishedScooterModel = selectedScooter.model;

    await updateScooterStatus(selectedScooter.id, "available");

    setRideStarted(false);

    setFinishedRide({
      scooter: finishedScooterModel,
      time: savedRide.ride.duration,
      price: savedRide.ride.cost,
    });

    await loadRides();

    showMessage("Поездка завершена", "success");
  };

  if (!selectedScooter) {
    return <div className="loading">Загрузка карты...</div>;
  }

  return (
    <div>
      {message && <div className={`map-message ${messageType}`}>{message}</div>}

      <div className="rental-wrapper">
        <div className="map-box">
          <YMaps
            query={{
              apikey: "656abd51-55c6-4c8a-821b-2fce7bdf5dc4",
              lang: "ru_RU",
            }}
          >
            <Map
              state={{
                center: [selectedScooter.latitude, selectedScooter.longitude],
                zoom: 11,
              }}
              width="100%"
              height="100%"
            >
              {scooters.map((scooter) => (
                <Placemark
                  key={scooter.id}
                  geometry={[scooter.latitude, scooter.longitude]}
                  onClick={() => setSelectedScooter(scooter)}
                  properties={{
                    hintContent: scooter.model,
                  }}
                  options={{
                    iconLayout: "default#image",
                    iconImageHref: "/scooter.png",
                    iconImageSize:
                      selectedScooter.id === scooter.id ? [58, 58] : [46, 46],
                    iconImageOffset:
                      selectedScooter.id === scooter.id
                        ? [-29, -29]
                        : [-23, -23],
                  }}
                />
              ))}
            </Map>
          </YMaps>
        </div>

        <aside className="control-panel">
          <div className="panel-header">
            <span
              className={`status-dot ${
                selectedScooter.status === "available"
                  ? "green"
                  : selectedScooter.status === "busy"
                  ? "red"
                  : "orange"
              }`}
            ></span>

            <span>{statusText[selectedScooter.status]}</span>
          </div>

          <h3>Самокат {selectedScooter.model}</h3>

          <div className="info-grid">
            <div>
              <span>Заряд</span>
              <strong>{selectedScooter.charge}%</strong>
            </div>

            <div>
              <span>Старт</span>
              <strong>40 ₽</strong>
            </div>

            <div>
              <span>Минута</span>
              <strong>7 ₽</strong>
            </div>

            <div>
              <span>Статус</span>
              <strong>{statusText[selectedScooter.status]}</strong>
            </div>
          </div>

          {!rideStarted ? (
            <button className="start-button" onClick={startRide}>
              Начать поездку
            </button>
          ) : (
            <div className="ride-panel">
              <div className="ride-header">Поездка активна</div>

              <div className="ride-info">
                <div className="ride-row">
                  <span>Время</span>
                  <strong>{seconds} сек.</strong>
                </div>

                <div className="ride-row">
                  <span>Стоимость</span>
                  <strong>{cost} ₽</strong>
                </div>
              </div>

              <button className="finish-button" onClick={finishRide}>
                Завершить поездку
              </button>
            </div>
          )}

          {finishedRide && (
            <div className="finished-ride">
              <div className="finished-header">Поездка завершена</div>

              <div className="finished-info">
                <div className="finished-row">
                  <span>Самокат</span>
                  <strong>{finishedRide.scooter}</strong>
                </div>

                <div className="finished-row">
                  <span>Время</span>
                  <strong>{finishedRide.time} сек.</strong>
                </div>

                <div className="finished-row">
                  <span>Стоимость</span>
                  <strong>{finishedRide.price} ₽</strong>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      <section id="rides" className="history-section">
        <div className="history-header">
          <h2>История поездок</h2>
        </div>

        {rideHistory.length === 0 ? (
          <div className="empty-history">Завершённых поездок пока нет</div>
        ) : (
          <div className="history-list">
            {rideHistory.map((ride) => (
              <div className="history-card" key={ride.id}>
                <div>
                  <span>Самокат</span>
                  <strong>{ride.Scooter?.model || "Неизвестно"}</strong>
                </div>

                <div>
                  <span>Время</span>
                  <strong>{ride.duration} сек.</strong>
                </div>

                <div>
                  <span>Стоимость</span>
                  <strong>{ride.cost} ₽</strong>
                </div>

                <div>
                  <span>Дата</span>
                  <strong>{new Date(ride.createdAt).toLocaleString("ru-RU")}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default MapComponent;