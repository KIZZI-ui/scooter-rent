import { useState } from "react";
import "./App.css";
import MapComponent from "./MapComponent";
import AdminPanel from "./AdminPanel";

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const [payments, setPayments] = useState([]);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const showMessage = (text, type = "success") => {
    setNotification(text);
    setNotificationType(type);

    setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  const loadPayments = async () => {
    if (!user) return;

    const response = await fetch(
      `http://localhost:5000/users/${user.id}/payments`
    );

    const data = await response.json();
    setPayments(data);
  };

  const openProfile = async () => {
    setShowProfile(true);
    await loadPayments();
  };

  const topUpBalance = async () => {
    const response = await fetch(
      `http://localhost:5000/users/${user.id}/topup`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 500,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      showMessage("Баланс пополнен на 500 ₽", "success");
      await loadPayments();
    } else {
      showMessage(data.message || "Ошибка пополнения", "error");
    }
  };

  const scrollToMap = () => {
    setShowAdmin(false);

    document.getElementById("map-section")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const scrollToRides = () => {
    setShowAdmin(false);

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const register = async () => {
    if (!form.username || !form.email || !form.password) {
      showMessage("Заполни все поля", "error");
      return;
    }

    const response = await fetch("http://localhost:5000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (response.ok) {
      showMessage("Регистрация успешна", "success");
      setIsRegister(false);
    } else {
      showMessage(data.error || data.message || "Ошибка регистрации", "error");
    }
  };

  const login = async () => {
    if (!form.email || !form.password) {
      showMessage("Введи email и пароль", "error");
      return;
    }

    const response = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      setShowAuth(false);

      showMessage("Вход выполнен", "success");
    } else {
      showMessage(data.message || data.error || "Ошибка входа", "error");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setShowAdmin(false);
    setShowProfile(false);
    setPayments([]);

    showMessage("Вы вышли из аккаунта", "success");
  };

  return (
    <div className="app">
      {notification && (
        <div className={`notification ${notificationType}`}>
          {notification}
        </div>
      )}

      <header className="header">
        <div className="logo">ScooterRent</div>

        <nav>
          <button
            className="nav-button"
            onClick={() => {
              setShowAdmin(false);
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          >
            Главная
          </button>

          <button className="nav-button" onClick={scrollToMap}>
            Карта
          </button>

          <button className="nav-button" onClick={scrollToRides}>
            Поездки
          </button>

          {user?.role === "admin" && (
            <button className="nav-button" onClick={() => setShowAdmin(true)}>
              Админка
            </button>
          )}

          {user && (
            <button className="header-user" onClick={openProfile}>
              <span className="header-user-name">{user.username}</span>

              <span className="header-user-balance">
                Баланс: {user.balance ?? 300} ₽
              </span>
            </button>
          )}

          {user ? (
            <button className="nav-button" onClick={logout}>
              Выйти
            </button>
          ) : (
            <button className="nav-button" onClick={() => setShowAuth(true)}>
              Профиль
            </button>
          )}
        </nav>
      </header>

      {showAdmin ? (
        <AdminPanel />
      ) : (
        <>
          <section className="hero">
            <h1>Аренда электросамокатов</h1>

            <p>Быстрая аренда самокатов с поминутной тарификацией</p>

            <button onClick={scrollToMap}>Открыть карту</button>
          </section>

          <section id="map-section" className="map-section">
            <MapComponent />
          </section>
        </>
      )}

      {showProfile && user && (
        <div className="modal-overlay">
          <div className="profile-modal">
            <button
              className="close-button"
              onClick={() => setShowProfile(false)}
            >
              ×
            </button>

            <h2>Профиль пользователя</h2>

            <div className="profile-card">
              <div>
                <span>Имя</span>
                <strong>{user.username}</strong>
              </div>

              <div>
                <span>Email</span>
                <strong>{user.email || "Не указан"}</strong>
              </div>

              <div>
                <span>Статус</span>
                <strong>Активен</strong>
              </div>
            </div>

            <button className="topup-button" onClick={topUpBalance}>
              Пополнить баланс +500 ₽
            </button>

            <div className="payments-block">
              <h3>История платежей</h3>

              {payments.length === 0 ? (
                <p className="payments-empty">Операций пока нет</p>
              ) : (
                <div className="payments-list">
                  {payments.map((payment) => (
                    <div className="payment-row" key={payment.id}>
                      <div>
                        <strong>{payment.description}</strong>
                        <span>
                          {new Date(payment.createdAt).toLocaleString("ru-RU")}
                        </span>
                      </div>

                      <b
                        className={
                          payment.amount > 0
                            ? "payment-positive"
                            : "payment-negative"
                        }
                      >
                        {payment.amount > 0 ? "+" : ""}
                        {payment.amount} ₽
                      </b>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="profile-logout" onClick={logout}>
              Выйти из аккаунта
            </button>
          </div>
        </div>
      )}

      {showAuth && (
        <div className="modal-overlay">
          <div className="auth-modal">
            <button className="close-button" onClick={() => setShowAuth(false)}>
              ×
            </button>

            <h2>{isRegister ? "Регистрация" : "Вход"}</h2>

            {isRegister && (
              <input
                name="username"
                placeholder="Имя пользователя"
                value={form.username}
                onChange={handleChange}
              />
            )}

            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            <input
              name="password"
              type="password"
              placeholder="Пароль"
              value={form.password}
              onChange={handleChange}
            />

            <button onClick={isRegister ? register : login}>
              {isRegister ? "Зарегистрироваться" : "Войти"}
            </button>

            <p
              className="auth-switch"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister
                ? "Уже есть аккаунт? Войти"
                : "Нет аккаунта? Зарегистрироваться"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;