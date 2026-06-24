import { useEffect, useRef, useState } from "react";
import { YMaps, Map, Placemark, Polygon } from "@pbe/react-yandex-maps";

const API_URL = (() => {
  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000";
  }

  if (
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.")
  ) {
    return `http://${hostname}:5000`;
  }

  return window.location.origin;
})();

const detectMobileMap = () => {
  const params = new URLSearchParams(window.location.search);

  if (params.get("desktop") === "1") return false;
  if (params.get("mobile") === "1") return true;

  const userAgent = navigator.userAgent || "";

  const viewportWidth =
    window.visualViewport?.width ||
    window.innerWidth ||
    document.documentElement.clientWidth ||
    9999;

  const screenSmallSide = Math.min(
    window.screen?.width || 9999,
    window.screen?.height || 9999
  );

  const hasTouch =
    navigator.maxTouchPoints > 0 ||
    window.matchMedia?.("(pointer: coarse)").matches ||
    "ontouchstart" in window;

  return (
    viewportWidth <= 900 ||
    screenSmallSide <= 900 ||
    (hasTouch && screenSmallSide <= 1200) ||
    /Android|iPhone|iPad|iPod|Mobile|Telegram|Mail|CriOS|FxiOS|YaBrowser/i.test(
      userAgent
    )
  );
};

function MapComponent() {
  const mapRef = useRef(null);

// Без “магнита”: карта больше не прыгает к самокату при автообновлении.
const moveMapToScooter = () => {};

const refreshMapSize = () => {
  if (!mapRef.current) return;

  let frame = 0;

  const animateResize = () => {
    frame++;

    mapRef.current.container.fitToViewport();

    if (frame < 18) {
      requestAnimationFrame(animateResize);
    }
  };

  requestAnimationFrame(animateResize);
};


  const [scooters, setScooters] = useState([]);
  const [selectedScooter, setSelectedScooter] = useState(null);
  const [rideStarted, setRideStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [cost, setCost] = useState(0);
  const [finishedRide, setFinishedRide] = useState(null);
  const [rideHistory, setRideHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [reserveSecondsLeft, setReserveSecondsLeft] = useState(0);
  const [showFinishedDetails, setShowFinishedDetails] = useState(false);
  const [isMobileMap, setIsMobileMap] = useState(detectMobileMap);

  const [tariff, setTariff] = useState({
    startPrice: 40,
    minutePrice: 7,
    dynamicMinutePrice: 7,
    eveningMultiplierActive: false,
  });

  const statusText = {
    available: "Свободен",
    reserved: "Забронирован",
    busy: "Занят",
    repair: "Ремонт",
  };

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (error) {
      return null;
    }
  };

  const isReservedByCurrentUser = (scooter, user = getCurrentUser()) => {
    if (!scooter || scooter.status !== "reserved" || !user?.id) {
      return false;
    }

    return Number(scooter.reservedByUserId) === Number(user.id);
  };

  const redZones = [
  {
    name: "Красная площадь",
    coordinates: [
      [
        [55.7542, 37.6175],
        [55.7542, 37.6255],
        [55.7498, 37.6255],
        [55.7498, 37.6175],
      ],
    ],
  },
  {
    name: "Парк Зарядье",
    coordinates: [
      [
        [55.7528, 37.626],
        [55.7528, 37.632],
        [55.7488, 37.632],
        [55.7488, 37.626],
      ],
    ],
  },
  {
    name: "Александровский сад",
    coordinates: [
      [
        [55.7558, 37.611],
        [55.7558, 37.617],
        [55.7515, 37.617],
        [55.7515, 37.611],
      ],
    ],
  },
];

const parkingZones = [
  {
    id: 1,
    name: "Парковка Арбат",
    coords: [55.7522, 37.5931],
  },
  {
    id: 2,
    name: "Парковка Москва-Сити",
    coords: [55.7495, 37.5378],
  },
  {
    id: 3,
    name: "Парковка Тверская",
    coords: [55.7648, 37.6067],
  },
  {
    id: 4,
    name: "Парковка Парк Горького",
    coords: [55.7298, 37.6010],
  },
  {
    id: 5,
    name: "Парковка ВДНХ",
    coords: [55.8298, 37.6339],
  },
  {
    id: 6,
    name: "Парковка Сокольники",
    coords: [55.7942, 37.6765],
  },
  {
    id: 7,
    name: "Парковка Лужники",
    coords: [55.7158, 37.5537],
  },
  {
    id: 8,
    name: "Парковка Белорусская",
    coords: [55.7767, 37.5849],
  },
];

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const loadTariff = async () => {
    const res = await fetch(`${API_URL}/tariff`);
    const data = await res.json();

    setTariff(data);
  };

  const loadScooters = async () => {
    try {
      const res = await fetch(`${API_URL}/scooters`);
      const data = await res.json();

      setScooters(data);

      setSelectedScooter((currentScooter) => {
        if (!data.length) return null;

        if (!currentScooter) {
          return data[0];
        }

        return data.find((s) => s.id === currentScooter.id) || data[0];
      });
    } catch (error) {
      console.log("Ошибка загрузки самокатов:", error);
    }
  };

  const loadRides = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (!currentUser) {
      setRideHistory([]);
      return;
    }

    const res = await fetch(`${API_URL}/rides/${currentUser.id}`);
    const data = await res.json();

    setRideHistory(data);
  };

  const clearRideHistory = async () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  if (!currentUser) {
    showMessage("Войдите в аккаунт", "error");
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/rides/clear/${currentUser.id}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      setRideHistory([]);
      showMessage("История очищена", "success");
    } else {
      showMessage("Ошибка очистки", "error");
    }

  } catch (error) {
    console.log(error);
  }
};

  useEffect(() => {
    const handleResize = () => {
      setIsMobileMap(detectMobileMap());
      setTimeout(refreshMapSize, 150);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  useEffect(() => {
    const loadSiteData = async () => {
      await Promise.all([
        loadTariff(),
        loadScooters(),
        loadRides(),
      ]);
    };

    loadSiteData();

    const interval = setInterval(() => {
      loadSiteData();
    }, 3000);

    return () => clearInterval(interval);
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
      setCost(tariff.startPrice + minutes * tariff.dynamicMinutePrice);
    }
  }, [seconds, rideStarted, tariff]);

useEffect(() => {
  refreshMapSize();
}, [showFinishedDetails, finishedRide]);

  useEffect(() => {
    if (!selectedScooter?.reservedUntil || selectedScooter.status !== "reserved") {
      setReserveSecondsLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const left = Math.max(
        0,
        Math.ceil((new Date(selectedScooter.reservedUntil) - new Date()) / 1000)
      );

      setReserveSecondsLeft(left);

      if (left <= 0) {
        clearInterval(interval);
        loadScooters();
        showMessage("Время бронирования истекло", "error");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedScooter]);

  const updateScooterStatus = async (id, status) => {
    const currentUser = getCurrentUser();

    const response = await fetch(`${API_URL}/scooters/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        userId: currentUser?.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.message || "Ошибка изменения статуса", "error");
      return false;
    }

    if (data.scooter) {
      setSelectedScooter(data.scooter);

      refreshMapSize();


      setScooters((prev) =>
        prev.map((scooter) =>
          scooter.id === data.scooter.id ? data.scooter : scooter
        )
      );
    }

    return true;
  };

  const reserveScooter = async () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      showMessage("Войдите в аккаунт, чтобы забронировать самокат", "error");
      return;
    }

    if (selectedScooter.status !== "available") {
      showMessage("Этот самокат нельзя забронировать", "error");
      await loadScooters();
      return;
    }

    const response = await fetch(
      `${API_URL}/scooters/${selectedScooter.id}/reserve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.message || "Ошибка бронирования", "error");
      await loadScooters();
      return;
    }

    setSelectedScooter(data.scooter);

    setScooters((prev) =>
      prev.map((scooter) =>
        scooter.id === data.scooter.id ? data.scooter : scooter
      )
    );

    await loadScooters();

    showMessage("Самокат забронирован на 5 минут", "success");
  };

  const cancelReserve = async () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      showMessage("Войдите в аккаунт", "error");
      return;
    }

    if (!isReservedByCurrentUser(selectedScooter, currentUser)) {
      showMessage("Эта бронь принадлежит другому пользователю", "error");
      await loadScooters();
      return;
    }

    const response = await fetch(
      `${API_URL}/scooters/${selectedScooter.id}/cancel-reserve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.message || "Ошибка отмены брони", "error");
      return;
    }

    setSelectedScooter(data.scooter);

    refreshMapSize();

    setScooters((prev) =>
      prev.map((scooter) =>
        scooter.id === data.scooter.id ? data.scooter : scooter
      )
    );

    await loadScooters();

    showMessage("Бронирование отменено", "success");
  };

  const startRide = async () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      showMessage("Войдите в аккаунт, чтобы начать поездку", "error");
      return;
    }

    if (selectedScooter.status !== "reserved") {
      showMessage("Сначала забронируйте самокат", "error");
      return;
    }

    if (!isReservedByCurrentUser(selectedScooter, currentUser)) {
      showMessage("Этот самокат забронирован другим пользователем", "error");
      await loadScooters();
      return;
    }

    if (currentUser.balance < tariff.startPrice + tariff.dynamicMinutePrice) {
      showMessage("Недостаточно средств на балансе", "error");
      return;
    }

    const updated = await updateScooterStatus(selectedScooter.id, "busy");

    if (!updated) {
      return;
    }

    setRideStarted(true);
    setSeconds(0);
    setCost(tariff.startPrice + tariff.dynamicMinutePrice);
    setFinishedRide(null);

    showMessage("Поездка началась", "success");
  };

  const finishRide = async () => {
    const res = await fetch(`${API_URL}/rides`, {
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

setShowFinishedDetails(false);

    await loadRides();

    showMessage("Поездка завершена", "success");
  };

  const getDistanceToSelected = (coords) => {
    if (!selectedScooter || !coords) return 0;

    const latDiff = coords[0] - selectedScooter.latitude;
    const lonDiff = coords[1] - selectedScooter.longitude;

    return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
  };

  const visibleParkingZones = isMobileMap
    ? [...parkingZones]
        .sort(
          (a, b) =>
            getDistanceToSelected(a.coords) - getDistanceToSelected(b.coords)
        )
        .slice(0, 3)
    : parkingZones;

  const visibleScooters = isMobileMap
    ? [
        selectedScooter,
        ...scooters
          .filter((scooter) => scooter.id !== selectedScooter?.id)
          .sort(
            (a, b) =>
              getDistanceToSelected([a.latitude, a.longitude]) -
              getDistanceToSelected([b.latitude, b.longitude])
          )
          .slice(0, 3),
      ].filter(Boolean)
    : scooters;

  const currentUser = getCurrentUser();
  const selectedReservedByCurrentUser = isReservedByCurrentUser(
    selectedScooter,
    currentUser
  );
  const selectedReservedByAnotherUser =
    selectedScooter?.status === "reserved" && !selectedReservedByCurrentUser;

  if (!selectedScooter) {
    return <div className="loading">Загрузка карты...</div>;
  }

  return (
    <div>
      {message && <div className={`map-message ${messageType}`}>{message}</div>}

      <div className="rental-wrapper">
        <div className="map-box">
          <YMaps
            key={`ymaps-${isMobileMap ? "mobile" : "desktop"}`}
            query={{
              apikey: "656abd51-55c6-4c8a-821b-2fce7bdf5dc4",
              lang: "ru_RU",
            }}
          >
           <Map
  key={`map-${isMobileMap ? "mobile" : "desktop"}`}
  defaultState={{
    center: [selectedScooter.latitude, selectedScooter.longitude],
    zoom: isMobileMap ? 14 : 11,
  }}
  width="100%"
  height="100%"
  options={{
    suppressMapOpenBlock: true,
    yandexMapDisablePoiInteractivity: true,
  }}
  instanceRef={(ref) => {
    mapRef.current = ref;
    setTimeout(refreshMapSize, 250);
  }}
>

{visibleParkingZones.map((zone) => (
  <Placemark
    key={zone.id}
    geometry={zone.coords}
    onClick={() => {
      showMessage("Тут ты можешь оставить самокат", "success");
    }}
    properties={{
      hintContent: "Парковочная зона",
      balloonContent: `${zone.name}: тут можно оставить самокат`,
    }}
    options={{
      iconLayout: "default#image",
      iconImageHref: "/parking.png",
      iconImageSize: isMobileMap ? [30, 30] : [42, 42],
      iconImageOffset: isMobileMap ? [-15, -30] : [-21, -42],
      cursor: "pointer",
    }}
  />
))}

              {redZones.map((zone) => (
  <Polygon
    key={zone.name}
    geometry={zone.coordinates}
    properties={{
      hintContent: zone.name,
      balloonContent: `${zone.name}: завершение поездки запрещено`,
    }}
options={{
  fillColor: "rgba(239, 68, 68, 0.18)",
  strokeColor: "#ef4444",
  strokeWidth: 2,
  strokeStyle: "dash",
  strokeOpacity: 0.9,
}}
  />
))}
              {visibleScooters.map((scooter) => {
                const isSelected = selectedScooter.id === scooter.id;

                return (
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
                      iconImageSize: isSelected
                        ? isMobileMap
                          ? [52, 52]
                          : [58, 58]
                        : isMobileMap
                        ? [38, 38]
                        : [46, 46],
                      iconImageOffset: isSelected
                        ? isMobileMap
                          ? [-26, -26]
                          : [-29, -29]
                        : isMobileMap
                        ? [-19, -19]
                        : [-23, -23],
                      zIndex: isSelected ? 1000 : 10,
                    }}
                  />
                );
              })}
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
                  : selectedScooter.status === "reserved"
                  ? "orange"
                  : "orange"
              }`}
            ></span>

            <span>{statusText[selectedScooter.status]}</span>
          </div>

          <h3>Самокат {selectedScooter.model}</h3>

          {tariff.eveningMultiplierActive && (
            <div className="tariff-alert">
              Вечерний спрос: цена за минуту повышена
            </div>
          )}

          <div className="info-grid">
            <div>
              <span>Заряд</span>
              <strong>{selectedScooter.charge}%</strong>
            </div>

            <div>
              <span>Старт</span>
              <strong>{tariff.startPrice} ₽</strong>
            </div>

            <div>
              <span>Минута</span>
              <strong>{tariff.dynamicMinutePrice} ₽</strong>
            </div>

            <div>
  <span>Запас хода</span>
  <strong>{Math.floor(selectedScooter.charge * 0.7)} км</strong>
</div>
          </div>

          {!rideStarted && selectedScooter.status === "available" && (
            <button className="reserve-button" onClick={reserveScooter}>
              Забронировать
            </button>
          )}

          {!rideStarted && selectedReservedByCurrentUser && (
            <div className="reserve-panel">
              <div className="reserve-title">Ваш самокат забронирован</div>

              <div className="reserve-time">
                Осталось: {Math.floor(reserveSecondsLeft / 60)}:
                {String(reserveSecondsLeft % 60).padStart(2, "0")}
              </div>

              <button className="start-button" onClick={startRide}>
                Начать поездку
              </button>

              <button className="cancel-reserve-button" onClick={cancelReserve}>
                Отменить бронь
              </button>
            </div>
          )}

          {!rideStarted && selectedReservedByAnotherUser && (
            <button className="start-button" disabled>
              Самокат забронирован другим пользователем
            </button>
          )}

          {!rideStarted &&
            selectedScooter.status !== "available" &&
            selectedScooter.status !== "reserved" && (
              <button className="start-button" disabled>
                Самокат недоступен
              </button>
            )}

          {rideStarted && (
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
    <button
  className="finished-toggle"
  onClick={() => {
    setShowFinishedDetails(!showFinishedDetails);

    setTimeout(() => {
      refreshMapSize();
    }, 80);
  }}
>
      <span>Подробнее о поездке</span>

      <b>
        {showFinishedDetails ? "−" : "+"}
      </b>
    </button>

    {showFinishedDetails && (
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
    )}
  </div>
)}
        </aside>
      </div>

      <section id="rides" className="history-section">
<div className="history-header">
  <h2>История поездок</h2>

  {rideHistory.length > 0 && (
    <button
      className="clear-history-button"
      onClick={clearRideHistory}
    >
      Очистить историю
    </button>
  )}
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