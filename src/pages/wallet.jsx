import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import "./wallet.css";
import API_BASE_URL from "../api";

function Wallet() {
  const [wallet, setWallet] = useState({
    balance: 0,
    total_earned: 0,
    total_spent: 0,
    pending: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to view your wallet.");
      setLoading(false);
      return;
    }

    const fetchWalletData = async () => {
      try {
        const [walletResponse, transactionsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/wallet`, {
            headers: {
              Authorization: "Bearer " + token,
            },
          }),

          fetch(`${API_BASE_URL}/api/wallet/transactions`, {
            headers: {
              Authorization: "Bearer " + token,
            },
          }),
        ]);

        const walletData = await walletResponse.json();
        const transactionsData = await transactionsResponse.json();

        if (!walletResponse.ok) {
          throw new Error(walletData.error || "Failed to load wallet.");
        }

        if (!transactionsResponse.ok) {
          throw new Error(
            transactionsData.error || "Failed to load transactions."
          );
        }

        setWallet(walletData.wallet);
        setTransactions(transactionsData.transactions || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="wallet-page">
        <div className="wallet-container">
          <p>Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-page">
      <header className="wallet-header">
        <p className="wallet-label">WALLET</p>

        <h1>Your SkillSwap Wallet</h1>

        <p className="wallet-subtitle">
          Manage your credits and keep track of your SkillSwap activity.
        </p>
      </header>

      {error && (
        <div className="wallet-container">
          <p>{error}</p>
        </div>
      )}

      {!error && (
        <main className="wallet-container">

          {/* Main Wallet Card */}
          <section className="wallet-main-card">
            <div className="wallet-main-top">
              <div>
                <p className="wallet-balance-label">
                  AVAILABLE CREDITS
                </p>

                <h2 className="wallet-main-balance">
                  {wallet.balance} <span>credits</span>
                </h2>

                <p className="wallet-balance-description">
                  Credits available to book learning sessions.
                </p>
              </div>

              <div className="wallet-coin-icon">◆</div>
            </div>

            <div className="wallet-main-bottom">
              <div>
                <span>Earned</span>
                <strong>{wallet.total_earned}</strong>
              </div>

              <div>
                <span>Spent</span>
                <strong>{wallet.total_spent}</strong>
              </div>

              <div>
                <span>Pending</span>
                <strong>{wallet.pending}</strong>
              </div>
            </div>
          </section>

          {/* Wallet Information */}
          <section className="wallet-info-grid">

            <div className="wallet-info-card">
              <div className="wallet-info-icon earned-icon">
                ↑
              </div>

              <div>
                <span>Total Earned</span>
                <strong>
                  {wallet.total_earned} credits
                </strong>
                <small>From teaching sessions</small>
              </div>
            </div>

            <div className="wallet-info-card">
              <div className="wallet-info-icon spent-icon">
                ↓
              </div>

              <div>
                <span>Total Spent</span>
                <strong>
                  {wallet.total_spent} credits
                </strong>
                <small>On learning sessions</small>
              </div>
            </div>

            <div className="wallet-info-card">
              <div className="wallet-info-icon pending-icon">
                ◷
              </div>

              <div>
                <span>Pending</span>
                <strong>
                  {wallet.pending} credits
                </strong>
                <small>Awaiting completion</small>
              </div>
            </div>

          </section>

          {/* Transactions */}
          <section className="wallet-section">
            <div className="wallet-section-heading">
              <div>
                <h2>Transaction History</h2>
                <p>Your recent credit activity.</p>
              </div>

              <button className="wallet-filter-button">
                All Transactions
              </button>
            </div>

            <div className="transaction-list">

              {transactions.length === 0 ? (
                <div className="transaction-item">
                  <div className="transaction-details">
                    <h3>No transactions yet</h3>
                    <p>
                      Your credit activity will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div
                    className="transaction-item"
                    key={transaction._id}
                  >

                    <div
                      className={`transaction-icon ${transaction.type}`}
                    >
                      {transaction.type === "earned" ? "↑" : "↓"}
                    </div>

                    <div className="transaction-details">
                      <h3>{transaction.title}</h3>

                      <p>{transaction.description}</p>

                      <span>
                        {formatDate(transaction.created_at)}
                      </span>
                    </div>

                    <strong
                      className={`transaction-amount ${transaction.type}`}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount} credits
                    </strong>

                  </div>
                ))
              )}

            </div>
          </section>

          {/* How Credits Work */}
          <section className="wallet-how-section">
            <div className="wallet-section-heading">
              <div>
                <h2>How SkillSwap Credits Work</h2>

                <p>
                  Learn and teach using SkillSwap credits.
                </p>
              </div>
            </div>

            <div className="wallet-how-grid">

              <div className="wallet-how-card">
                <div className="how-number">01</div>

                <div>
                  <h3>Teach a Skill</h3>

                  <p>
                    Complete teaching sessions and earn credits
                    that you can use later.
                  </p>
                </div>
              </div>

              <div className="wallet-how-card">
                <div className="how-number">02</div>

                <div>
                  <h3>Learn a Skill</h3>

                  <p>
                    Use your available credits when you book
                    sessions with other members.
                  </p>
                </div>
              </div>

              <div className="wallet-how-card">
                <div className="how-number">03</div>

                <div>
                  <h3>Keep Swapping</h3>

                  <p>
                    Keep teaching and learning to maintain your
                    credit balance.
                  </p>
                </div>
              </div>

            </div>
          </section>

        </main>
      )}

      <Footer />
    </div>
  );
}

export default Wallet;