import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import "./DonateModal.css"

export default function DonateModal({ onClose }) {
  const { username } = useParams();
  const [searchParams] = useSearchParams();

  const [paymentMethod, setPaymentMethod] = useState("Paypal");
  const [amount, setAmount] = useState(9.99);
  const [currency, setCurrency] = useState("RUB");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(null);

  const token = localStorage.getItem("jwtToken");

  // ✅ если пользователь вернулся после оплаты, считываем параметр ?payment=success
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") setStatus("approved");
    else if (paymentStatus === "cancel") setStatus("cancelled");
  }, [searchParams]);

  async function handleDonate(e) {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("http://localhost:8080/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Bearer ${token}`,
        },
        body: new URLSearchParams({
          method: paymentMethod,
          amount,
          currency,
          description,
          username, // ⚡ передаём имя пользователя, чтобы вернуть на нужную страницу
        }),
      });

      const result = await response.json();

      if (result.redirectUrl) {
        window.location.href = result.redirectUrl; // просто редиректим на YooMoney/PayPal
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <h2>💸 Поддержите автора</h2>

        {status === null && (
          <form className="donate-form" onSubmit={handleDonate}>
            <label>Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="donate-input"
            />

            <label>Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="donate-select"
            >
              <option value="RUB">RUB</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>

            <label>Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="donate-select"
            >
              <option value="Paypal">PayPal</option>
              <option value="YooMoney">YooMoney</option>
            </select>

            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="donate-textarea"
              placeholder="Message to the author..."
            />

            <div className="modal-buttons">
              <button type="submit" className="donate-submit">
                Отправить
              </button>
              <button type="button" className="close-modal" onClick={onClose}>
                Закрыть
              </button>
            </div>
          </form>
        )}

        {status === "loading" && <p>⏳ Создание платежа...</p>}
        {status === "approved" && (
          <div>
            <h3>✅ Спасибо за пожертвование!</h3>
            <p>Вы успешно отправили {amount} {currency}</p>
            <button onClick={onClose}>Назад</button>
          </div>
        )}
        {status === "cancelled" && (
          <div>
            <h3>⚠️ Платёж отменён</h3>
            <button onClick={() => setStatus(null)}>Попробовать снова</button>
          </div>
        )}
        {status === "error" && (
          <div>
            <h3>❌ Ошибка при оплате</h3>
            <button onClick={() => setStatus(null)}>Попробовать снова</button>
          </div>
        )}
      </div>
    </div>
  );
}
