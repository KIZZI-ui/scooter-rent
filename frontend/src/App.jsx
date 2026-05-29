import { useState, useEffect } from "react";
import "./App.css";
import MapComponent from "./MapComponent";
import AdminPanel from "./AdminPanel";

function SafetyPage() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);

    if (element) {
      window.scrollTo({
        top: element.offsetTop - 110,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="safety-page">
      <div className="safety-hero safety-hero-pro">
        <span>Правила сервиса</span>

        <h1>Катайтесь безопасно</h1>

        <p>
          Перед поездкой важно знать, как правильно арендовать самокат, где его
          можно оставить, как вести себя рядом с пешеходами и какие действия
          запрещены. Эти правила помогают сделать поездки удобными, безопасными
          и понятными для всех пользователей.
        </p>

        <div className="safety-nav">
          <button onClick={() => scrollToSection("rent-guide")}>
            Как арендовать
          </button>

          <button onClick={() => scrollToSection("where-scooters")}>
            Где искать
          </button>

          <button onClick={() => scrollToSection("safe-ride")}>
            Как ездить
          </button>

          <button onClick={() => scrollToSection("forbidden")}>
            Что запрещено
          </button>

          <button onClick={() => scrollToSection("parking")}>
            Парковка
          </button>
        </div>
      </div>

      <section id="rent-guide" className="safety-section-block">
        <div className="safety-section-title">
          <span>1</span>
          <h2>Как арендовать самокат</h2>
          <p>
            Аренда занимает меньше минуты. Главное — выбрать свободный самокат,
            проверить заряд и завершить поездку в подходящем месте.
          </p>
        </div>

        <div className="safety-wide-grid">
          <div className="safety-detail-card">
            <b>1</b>
            <h3>Откройте карту</h3>
            <p>
              На карте отображаются доступные самокаты. Выберите ближайший
              свободный самокат и проверьте его статус. Если самокат занят или
              находится в ремонте, начать поездку на нём нельзя.
            </p>
          </div>

          <div className="safety-detail-card">
            <b>2</b>
            <h3>Проверьте заряд и стоимость</h3>
            <p>
              Перед бронированием посмотрите уровень заряда, цену старта,
              стоимость минуты и примерный запас хода. Это поможет заранее
              понять, хватит ли самоката на вашу поездку.
            </p>
          </div>

          <div className="safety-detail-card">
            <b>3</b>
            <h3>Забронируйте самокат</h3>
            <p>
              После бронирования самокат временно закрепляется за вами. За это
              время можно спокойно подойти к нему и подготовиться к поездке.
            </p>
          </div>

          <div className="safety-detail-card">
            <b>4</b>
            <h3>Начните и завершите поездку</h3>
            <p>
              Нажмите кнопку начала поездки, когда будете готовы. После
              завершения остановитесь в безопасном месте и убедитесь, что
              поездка действительно завершилась в интерфейсе.
            </p>
          </div>
        </div>
      </section>

      <section id="where-scooters" className="safety-section-block">
        <div className="safety-section-title">
          <span>2</span>
          <h2>Где находятся самокаты</h2>
          <p>
            Самокаты расположены в городе и отображаются на карте. Статус,
            заряд и доступность обновляются автоматически.
          </p>
        </div>

        <div className="safety-text-layout">
          <div className="safety-text-panel">
            <h3>Самокаты на карте</h3>
            <p>
              На карте видно, где находится каждый самокат. Свободные самокаты
              можно забронировать, занятые — недоступны до окончания поездки, а
              самокаты в ремонте временно нельзя использовать.
            </p>
            <p>
              Перед выбором обращайте внимание на заряд и запас хода. Если
              заряд низкий, лучше выбрать другой самокат, чтобы поездка не
              закончилась раньше времени.
            </p>
          </div>

          <div className="safety-text-panel">
            <h3>Зоны поездки</h3>
            <p>
              Во время поездки старайтесь двигаться по велодорожкам,
              спокойным улицам и безопасным маршрутам. На оживлённых участках
              снижайте скорость и заранее планируйте манёвры.
            </p>
            <p>
              Если рядом много людей, лучше ехать медленнее или пройти участок
              пешком, ведя самокат рядом с собой.
            </p>
          </div>
        </div>
      </section>

      <section id="safe-ride" className="safety-section-block">
        <div className="safety-section-title">
          <span>3</span>
          <h2>Как ездить безопасно</h2>
          <p>
            Электросамокат — это транспорт. Во время поездки важно соблюдать
            ПДД, держать дистанцию и учитывать пешеходов.
          </p>
        </div>

        <div className="safety-rules-grid">
          <div className="safety-rule-card">
            <div className="safety-icon">🪖</div>
            <h3>Используйте защиту</h3>
            <p>
              Шлем и защитная экипировка снижают риск травм. Особенно это
              важно при поездках по неровной дороге, вечером или в незнакомом
              районе.
            </p>
          </div>

          <div className="safety-rule-card">
            <div className="safety-icon">🚦</div>
            <h3>Соблюдайте ПДД</h3>
            <p>
              Следите за светофорами, дорожными знаками и разметкой. Не
              выезжайте резко на дорогу и не пересекайте проезжую часть без
              внимания к автомобилям.
            </p>
          </div>

          <div className="safety-rule-card">
            <div className="safety-icon">🚶</div>
            <h3>Уступайте пешеходам</h3>
            <p>
              Пешеходы всегда должны чувствовать себя безопасно. Снижайте
              скорость рядом с переходами, остановками, дворами и местами, где
              много людей.
            </p>
          </div>

          <div className="safety-rule-card">
            <div className="safety-icon">🌧️</div>
            <h3>Осторожно в дождь</h3>
            <p>
              На мокрой дороге тормозной путь увеличивается, а сцепление с
              покрытием становится хуже. Избегайте резких поворотов и
              торможений.
            </p>
          </div>
        </div>
      </section>

      <section id="forbidden" className="safety-section-block">
        <div className="safety-section-title">
          <span>4</span>
          <h2>Что запрещено</h2>
          <p>
            Эти действия опасны для пользователя, пешеходов и других участников
            движения. За грубые нарушения аккаунт может быть ограничен.
          </p>
        </div>

        <div className="safety-ban-list">
          <div>
            <strong>🚫 Нельзя кататься вдвоём</strong>
            <p>
              Один самокат рассчитан только на одного человека. При езде вдвоём
              сложнее управлять, тормозить и сохранять равновесие.
            </p>
          </div>

          <div>
            <strong>🍺 Нельзя ездить в нетрезвом виде</strong>
            <p>
              Алкоголь и другие вещества ухудшают реакцию и внимание. Такая
              поездка опасна для всех вокруг.
            </p>
          </div>

          <div>
            <strong>📱 Нельзя отвлекаться на телефон</strong>
            <p>
              Во время движения держите обе руки на руле. Не пишите сообщения,
              не смотрите видео и не используйте наушники на высокой громкости.
            </p>
          </div>

          <div>
            <strong>⚡ Нельзя специально повреждать самокат</strong>
            <p>
              Не пытайтесь ломать замок, руль, тормоза или элементы корпуса.
              Повреждения могут сделать поездку опасной.
            </p>
          </div>
        </div>
      </section>

      <section id="parking" className="safety-section-block">
        <div className="safety-section-title">
          <span>5</span>
          <h2>Как правильно парковать</h2>
          <p>
            После поездки самокат нужно оставить так, чтобы он никому не мешал
            и был доступен следующему пользователю.
          </p>
        </div>

        <div className="safety-text-layout">
          <div className="safety-text-panel">
            <h3>Где можно оставить</h3>
            <p>
              Паркуйте самокат у края тротуара, рядом с велопарковками или в
              местах, где он не мешает движению людей и транспорта.
            </p>
            <p>
              Самокат должен стоять устойчиво. Не оставляйте его лежать на
              земле или на проезжей части.
            </p>
          </div>

          <div className="safety-text-panel danger-panel">
            <h3>Где нельзя оставлять</h3>
            <p>
              Нельзя оставлять самокат у входов, на пандусах, остановках,
              пешеходных переходах, узких тротуарах и в местах, где он может
              помешать людям с колясками или инвалидными креслами.
            </p>
            <p>
              Перед уходом убедитесь, что поездка завершена и самокат больше не
              списывает оплату.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const [payments, setPayments] = useState([]);
  const [supportMessage, setSupportMessage] = useState("");

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [profileForm, setProfileForm] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;

    return {
      username: parsedUser?.username || "",
      phone: parsedUser?.phone || "",
    };
  });

  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [page, setPage] = useState("home");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    fetch(`http://localhost:5000/users/${user.id}/online`, {
      method: "PUT",
    }).catch(() => {});

    const handleOffline = () => {
      fetch(`http://localhost:5000/users/${user.id}/offline`, {
        method: "PUT",
        keepalive: true,
      }).catch(() => {});
    };

    window.addEventListener("beforeunload", handleOffline);

    return () => {
      window.removeEventListener("beforeunload", handleOffline);
    };
  }, [user?.id]);

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
    if (user) {
      setProfileForm({
        username: user.username || "",
        phone: user.phone || "",
      });
    }

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

  const saveProfile = () => {
    const updatedUser = {
      ...user,
      username: profileForm.username,
      phone: profileForm.phone,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);

    showMessage("Профиль обновлён", "success");
  };

  const sendSupport = () => {
    if (!user) {
      showMessage("Войдите в аккаунт, чтобы отправить обращение", "error");
      return;
    }

    if (!supportMessage.trim()) {
      showMessage("Введите текст обращения", "error");
      return;
    }

    setSupportMessage("");
    setShowSupport(false);

    showMessage("Обращение отправлено в поддержку", "success");
  };

  const scrollToMap = () => {
    setPage("home");
    setShowAdmin(false);

    setTimeout(() => {
      const element = document.getElementById("map-section");

      if (element) {
        const offset = 110;

        const top =
          element.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
          top,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const openAdminPanel = () => {
    setPage("home");
    setShowAdmin(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToRides = () => {
    setPage("home");
    setShowAdmin(false);

    setTimeout(() => {
      const element = document.getElementById("rides");

      if (element) {
        const offset = 110;

        const top =
          element.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
          top,
          behavior: "smooth",
        });
      } else {
        const mapElement = document.getElementById("map-section");

        if (mapElement) {
          const top =
            mapElement.getBoundingClientRect().top + window.pageYOffset - 110;

          window.scrollTo({
            top,
            behavior: "smooth",
          });
        }
      }
    }, 100);
  };

  const openSafetyPage = () => {
    setPage("safety");
    setShowAdmin(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openHomePage = () => {
    setPage("home");
    setShowAdmin(false);

    window.scrollTo({
      top: 0,
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
      setProfileForm({
        username: data.user?.username || "",
        phone: data.user?.phone || "",
      });

      setShowAuth(false);

      showMessage("Вход выполнен", "success");
    } else {
      showMessage(data.message || data.error || "Ошибка входа", "error");
    }
  };

  const logout = async () => {
  if (user?.id) {
    try {
      await fetch(`http://localhost:5000/users/${user.id}/offline`, {
        method: "PUT",
      });
    } catch (error) {
      console.log("Ошибка установки offline:", error);
    }
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  setUser(null);
  setShowAdmin(false);
  setShowProfile(false);
  setShowSupport(false);
  setPayments([]);
  setProfileForm({
    username: "",
    phone: "",
  });
  setSupportMessage("");
  setPage("home");

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
        <div className="logo" onClick={openHomePage}>
          ScooterRent
        </div>

        <nav>
          <button className="nav-button" onClick={openHomePage}>
            Главная
          </button>

          <button className="nav-button" onClick={scrollToMap}>
            Карта
          </button>

          <button className="nav-button" onClick={openSafetyPage}>
            Правила
          </button>

          <button className="nav-button" onClick={scrollToRides}>
            Поездки
          </button>

          <button className="nav-button" onClick={() => setShowSupport(true)}>
            Поддержка
          </button>

          {user?.role === "admin" && (
            <button className="nav-button" onClick={openAdminPanel}>
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
  <button
    className="nav-button logout-btn"
    onClick={logout}
  >
    Выйти
  </button>
) : (
  <button
    className="nav-button"
    onClick={() => setShowAuth(true)}
  >
    Войти
  </button>
)}
        </nav>
      </header>

      {showAdmin ? (
        <AdminPanel />
      ) : page === "safety" ? (
        <SafetyPage />
      ) : (
        <>
          <section className="hero">
            <h1>Аренда электросамокатов</h1>

            <p>Быстрая аренда самокатов с поминутной тарификацией</p>

            <button onClick={scrollToMap}>Открыть карту</button>

            <div className="stats-grid">
              <div className="stats-card">
                <span>Самокатов онлайн</span>
                <strong>24</strong>
              </div>

              <div className="stats-card">
                <span>Средняя цена</span>
                <strong>7 ₽/мин</strong>
              </div>

              <div className="stats-card">
                <span>Активных поездок</span>
                <strong>12</strong>
              </div>

              <div className="stats-card">
                <span>Поддержка</span>
                <strong>24/7</strong>
              </div>
            </div>
          </section>

          <section className="steps-section">
            <div className="steps-header">
              <span>Сценарий аренды</span>
              <h2>Как начать поездку</h2>
              <p>
                Весь процесс занимает меньше минуты: выберите самокат,
                забронируйте его и начните аренду.
              </p>
            </div>

            <div className="steps-grid">
              <div className="step-card">
                <b>1</b>
                <h3>Выберите самокат</h3>
                <p>
                  Откройте карту и выберите ближайший свободный
                  электросамокат.
                </p>
              </div>

              <div className="step-card">
                <b>2</b>
                <h3>Забронируйте</h3>
                <p>Самокат закрепляется за пользователем на ограниченное время.</p>
              </div>

              <div className="step-card">
                <b>3</b>
                <h3>Начните поездку</h3>
                <p>
                  После запуска аренды система считает время и итоговую
                  стоимость.
                </p>
              </div>
            </div>
          </section>

          <section id="map-section" className="map-section">
            <MapComponent />
          </section>
        </>
      )}

      {showSupport && (
        <div className="modal-overlay">
          <div className="support-modal">
            <button
              className="close-button"
              onClick={() => setShowSupport(false)}
            >
              ×
            </button>

            <h2>Поддержка</h2>

            <p>
              Опишите проблему с поездкой, оплатой или техническим состоянием
              самоката.
            </p>

            <textarea
              className="support-textarea"
              placeholder="Напишите обращение..."
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
            />

            <button className="support-button" onClick={sendSupport}>
              Отправить обращение
            </button>
          </div>
        </div>
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

                <input
                  className="profile-input"
                  value={profileForm.username}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      username: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <span>Email</span>
                <strong>{user.email || "Не указан"}</strong>
              </div>

              <div>
                <span>Телефон</span>

                <input
                  className="profile-input"
                  placeholder="+7 (999) 123-45-67"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <span>Статус</span>
                <strong>Активен</strong>
              </div>
            </div>

            <button className="topup-button" onClick={topUpBalance}>
              Пополнить баланс +500 ₽
            </button>

            <button className="save-profile-button" onClick={saveProfile}>
              Сохранить профиль
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

      {showScrollTop && (
        <button
          className="scroll-top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
        >
          ↑
        </button>
      )}

      <footer className="footer">
        <div className="footer-line"></div>

        <div className="footer-content">
          <h2>ScooterRent</h2>

          <p>Аренда электросамокатов нового поколения</p>

          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
