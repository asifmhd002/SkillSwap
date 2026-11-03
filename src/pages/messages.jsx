import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import API_BASE_URL from "../api";
import "./messages.css";

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [error, setError] = useState("");
  const [messagesError, setMessagesError] = useState("");

  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [sessionSkill, setSessionSkill] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionStartTime, setSessionStartTime] = useState("");
  const [sessionEndTime, setSessionEndTime] = useState("");
  const [scheduling, setScheduling] = useState(false);


  // =========================================================
  // FORMAT MESSAGE TIME
  // =========================================================

  const formatTime = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };


  // =========================================================
  // LOAD CURRENT USER + CONVERSATIONS
  // =========================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please login again.");
        }


        // -----------------------------------------
        // Get current logged-in user
        // -----------------------------------------

        const userResponse = await fetch(
          `${API_BASE_URL}/api/auth/me`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const userData = await userResponse.json();

        if (!userResponse.ok) {
          throw new Error(
            userData.error || "Failed to load user"
          );
        }

        setCurrentUser(userData.user);


        // -----------------------------------------
        // Get conversations
        // -----------------------------------------

        const conversationResponse = await fetch(
          `${API_BASE_URL}/api/messages/conversations`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const conversationData =
          await conversationResponse.json();

        if (!conversationResponse.ok) {
          throw new Error(
            conversationData.error ||
              "Failed to load conversations"
          );
        }


        // -----------------------------------------
        // Format conversations for UI
        // -----------------------------------------

        const formattedConversations =
          conversationData.conversations.map(
            (conversation) => {

              const participantNames =
                conversation.participant_names || [];

              const participants =
                conversation.participants || [];


              // Find the other participant
              let otherIndex = participants.findIndex(
                (id) =>
                  String(id) !==
                  String(userData.user.user_id)
              );


              // For our temporary one-person test
              // conversation, use the first name.
              if (otherIndex === -1) {
                otherIndex = 0;
              }


              const name =
                participantNames[otherIndex] ||
                participantNames[0] ||
                "User";


              return {
                id: conversation._id,

                name: name,

                skill:
                  conversation.skill ||
                  "SkillSwap",

                message:
                  conversation.last_message || "",

                time:
                  formatTime(
                    conversation.last_message_time
                  ) || "",

                unread:
                  conversation.unread || 0,

                avatar:
                  name.charAt(0).toUpperCase(),

                online: false,

                participants:
                  participants,

                participantNames:
                  participantNames,
              };
            }
          );


        setConversations(formattedConversations);


        // -----------------------------------------
// Select requested conversation or first one
// -----------------------------------------

const params = new URLSearchParams(window.location.search);
const requestedConversationId = params.get("conversation");

if (requestedConversationId) {
  const requestedConversation = formattedConversations.find(
    (conversation) =>
      String(conversation.id) ===
      String(requestedConversationId)
  );

  if (requestedConversation) {
    setSelectedConversation(requestedConversation);
  } else if (formattedConversations.length > 0) {
    setSelectedConversation(formattedConversations[0]);
  }
} else if (formattedConversations.length > 0) {
  setSelectedConversation(formattedConversations[0]);
}

      } catch (error) {
        console.error("Messages error:", error);

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };


    loadData();
  }, []);


  // =========================================================
  // LOAD MESSAGES WHEN CONVERSATION CHANGES
  // =========================================================

  useEffect(() => {

    if (!selectedConversation) {
      return;
    }


    const loadMessages = async () => {

      try {

        setMessagesLoading(true);
        setMessagesError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_BASE_URL}/api/messages/conversations/${selectedConversation.id}`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );


        const data = await response.json();


        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load messages"
          );
        }


        setMessages(data.messages || []);


        // -----------------------------------------
        // Clear unread count locally
        // -----------------------------------------

        setConversations((previous) =>
          previous.map((conversation) =>
            conversation.id === selectedConversation.id
              ? {
                  ...conversation,
                  unread: 0,
                }
              : conversation
          )
        );

      } catch (error) {

        console.error("Chat error:", error);

        setMessagesError(error.message);

      } finally {

        setMessagesLoading(false);

      }
    };


    loadMessages();

  }, [selectedConversation]);


  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const handleSendMessage = async (event) => {

    event.preventDefault();


    const text = newMessage.trim();


    if (!text || !selectedConversation || sending) {
      return;
    }


    try {

      setSending(true);

      const token = localStorage.getItem("token");


      const response = await fetch(
        `${API_BASE_URL}/api/messages/conversations/${selectedConversation.id}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },

          body: JSON.stringify({
            text: text,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data.error || "Failed to send message"
        );
      }


      // -----------------------------------------
      // Add new message to chat immediately
      // -----------------------------------------

      setMessages((previous) => [
        ...previous,
        data.data,
      ]);


      // -----------------------------------------
      // Clear input
      // -----------------------------------------

      setNewMessage("");


      // -----------------------------------------
      // Update conversation preview
      // -----------------------------------------

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === selectedConversation.id
            ? {
                ...conversation,
                message: text,
                time: formatTime(
                  data.data.created_at
                ),
              }
            : conversation
        )
      );


    } catch (error) {

      console.error("Send message error:", error);

      setMessagesError(error.message);

    } finally {

      setSending(false);

    }
  };


  const handleScheduleSession = async (event) => {
  event.preventDefault();

  if (
    !selectedConversation ||
    !sessionSkill ||
    !sessionDate ||
    !sessionStartTime ||
    !sessionEndTime
  ) {
    return;
  }

  try {
    setScheduling(true);
    setMessagesError("");

    const token = localStorage.getItem("token");

    const participants = selectedConversation.participants || [];

    const otherUserId = participants.find(
      (id) =>
        String(id) !== String(currentUser?.user_id)
    );

    if (!otherUserId || !currentUser?.user_id) {
      throw new Error(
        "Could not determine session participants."
      );
    }

    // For now, the logged-in user is the learner
    // and the person they are chatting with is the teacher.
    const response = await fetch(
      `${API_BASE_URL}/api/sessions`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },

        body: JSON.stringify({
          teacher_id: String(otherUserId),
          learner_id: String(currentUser.user_id),
          skill: sessionSkill,
          date: sessionDate,
          start_time: sessionStartTime,
          end_time: sessionEndTime,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to schedule session"
      );
    }

    alert("Session scheduled successfully!");

    setShowScheduleModal(false);

    setSessionSkill("");
    setSessionDate("");
    setSessionStartTime("");
    setSessionEndTime("");

  } catch (error) {
    console.error(
      "Schedule session error:",
      error
    );

    setMessagesError(error.message);

    alert(error.message);

  } finally {
    setScheduling(false);
  }
};


  // =========================================================
  // SELECT CONVERSATION
  // =========================================================

  const handleConversationClick = (conversation) => {

    setSelectedConversation(conversation);

    setMessages([]);

    setMessagesError("");
  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="messages-page">


      {/* =========================
          PAGE HEADER
      ========================= */}

      <header className="messages-header">

        <div>

          <p className="messages-label">
            COMMUNICATION
          </p>

          <h1>
            Messages
          </h1>

          <p className="messages-subtitle">
            Stay connected with the people you learn
            and teach with.
          </p>

        </div>

      </header>


      {/* =========================
          MESSAGES LAYOUT
      ========================= */}

      <main className="messages-container">


        {/* =========================
            CONVERSATION LIST
        ========================= */}

        <section className="conversation-panel">


          <div className="conversation-header">

            <div>

              <h2>
                Conversations
              </h2>

              <p>
                Your recent conversations.
              </p>

            </div>


            <button
              className="new-message-button"
            >
              + New Message
            </button>

          </div>


          {/* Search */}

          <div className="message-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search conversations..."
            />

          </div>


          {/* Conversation Items */}

          <div className="conversation-list">


            {loading && (
              <p>
                Loading conversations...
              </p>
            )}


            {!loading && error && (
              <p>
                {error}
              </p>
            )}


            {!loading &&
              !error &&
              conversations.length === 0 && (
                <p>
                  No conversations yet.
                </p>
              )}


            {!loading &&
              !error &&
              conversations.map(
                (conversation) => (

                  <button
                    key={conversation.id}
                    onClick={() =>
                      handleConversationClick(
                        conversation
                      )
                    }
                    className={`conversation-item ${
                      selectedConversation?.id ===
                      conversation.id
                        ? "conversation-item-active"
                        : ""
                    }`}
                  >


                    <div className="conversation-avatar-wrapper">

                      <div className="conversation-avatar">
                        {conversation.avatar}
                      </div>

                      {conversation.online && (
                        <span className="online-indicator"></span>
                      )}

                    </div>


                    <div className="conversation-content">

                      <div className="conversation-top">

                        <h3>
                          {conversation.name}
                        </h3>

                        <span className="conversation-time">
                          {conversation.time}
                        </span>

                      </div>


                      <span className="conversation-skill">
                        {conversation.skill}
                      </span>


                      <p>
                        {conversation.message}
                      </p>

                    </div>


                    {conversation.unread > 0 && (
                      <span className="unread-count">
                        {conversation.unread}
                      </span>
                    )}

                  </button>

                )
              )}

          </div>

        </section>


        {/* =========================
            CHAT AREA
        ========================= */}

        <section className="chat-panel">


          {!selectedConversation ? (

            <div className="chat-empty">

              <h2>
                Select a conversation
              </h2>

              <p>
                Choose someone from your conversations
                to start chatting.
              </p>

            </div>

          ) : (

            <>


              {/* =========================
                  CHAT HEADER
              ========================= */}

              <div className="chat-header">


                <div className="chat-user">


                  <div className="chat-avatar-wrapper">

                    <div className="chat-avatar">
                      {selectedConversation.avatar}
                    </div>

                    {selectedConversation.online && (
                      <span className="online-indicator"></span>
                    )}

                  </div>


                  <div>

                    <h2>
                      {selectedConversation.name}
                    </h2>

                    <p>

                      {selectedConversation.online ? (
                        <span className="online-text">
                          Online
                        </span>
                      ) : (
                        <span>
                          Offline
                        </span>
                      )}

                      {" "}•{" "}

                      {selectedConversation.skill}

                    </p>

                  </div>

                </div>


                <div className="chat-header-actions">
  <button
  className="schedule-session-button"
  type="button"
  onClick={() => setShowScheduleModal(true)}
>
  Schedule Session
</button>

  <button className="chat-more-button">
    ⋮
  </button>
</div>

              </div>


              {/* =========================
                  CHAT MESSAGES
              ========================= */}

              <div className="chat-messages">


                <div className="chat-date">
                  Today
                </div>


                {messagesLoading && (
                  <p>
                    Loading messages...
                  </p>
                )}


                {!messagesLoading &&
                  messagesError && (
                    <p>
                      {messagesError}
                    </p>
                  )}


                {!messagesLoading &&
                  !messagesError &&
                  messages.length === 0 && (
                    <div className="chat-empty-messages">

                      <p>
                        No messages yet.
                      </p>

                      <span>
                        Send the first message!
                      </span>

                    </div>
                  )}


                {!messagesLoading &&
                  !messagesError &&
                  messages.map((message) => {

                    const isSent =
                      String(message.sender_id) ===
                      String(
                        currentUser?.user_id
                      );


                    return (

                      <div
                        key={message._id}
                        className={`message-row ${
                          isSent
                            ? "message-row-sent"
                            : "message-row-received"
                        }`}
                      >


                        {!isSent && (
                          <div className="message-avatar">
                            {message.sender_name
                              ?.charAt(0)
                              .toUpperCase() || "U"}
                          </div>
                        )}


                        <div
                          className={`message-bubble ${
                            isSent
                              ? "sent"
                              : "received"
                          }`}
                        >

                          <p>
                            {message.text}
                          </p>

                          <span>
                            {formatTime(
                              message.created_at
                            )}
                          </span>

                        </div>

                      </div>

                    );
                  })}

              </div>


              {/* =========================
                  MESSAGE INPUT
              ========================= */}

              <form
                className="message-input-area"
                onSubmit={handleSendMessage}
              >

                <button
                  type="button"
                  className="message-attachment"
                >
                  +
                </button>


                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(event) =>
                    setNewMessage(
                      event.target.value
                    )
                  }
                  disabled={sending}
                />


                <button
                  type="submit"
                  className="send-message-button"
                  disabled={
                    sending ||
                    !newMessage.trim()
                  }
                >
                  {sending ? "..." : "↗"}
                </button>

              </form>

            </>

          )}

        </section>

      </main>


      {/* =========================
          FOOTER
      ========================= */}

      <Footer />

{showScheduleModal && (
  <div
    className="schedule-modal-overlay"
    onClick={() => setShowScheduleModal(false)}
  >
    <div
      className="schedule-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="schedule-modal-header">
        <div>
          <p className="schedule-modal-label">
            SESSION
          </p>

          <h2>Schedule Session</h2>

          <p>
            Set a time for your session with{" "}
            <strong>
              {selectedConversation?.name}
            </strong>
            .
          </p>
        </div>

        <button
          type="button"
          className="schedule-modal-close"
          onClick={() => setShowScheduleModal(false)}
        >
          ×
        </button>
      </div>

      <form
  className="schedule-form"
  onSubmit={handleScheduleSession}
>
        <div className="schedule-field">
          <label>Skill</label>

          <input
            type="text"
            placeholder="e.g. Python"
            value={sessionSkill}
            onChange={(event) =>
              setSessionSkill(event.target.value)
            }
          />
        </div>

        <div className="schedule-field">
          <label>Date</label>

          <input
            type="date"
            value={sessionDate}
            onChange={(event) =>
              setSessionDate(event.target.value)
            }
          />
        </div>

        <div className="schedule-time-row">
          <div className="schedule-field">
            <label>Start Time</label>

            <input
              type="time"
              value={sessionStartTime}
              onChange={(event) =>
                setSessionStartTime(event.target.value)
              }
            />
          </div>

          <div className="schedule-field">
            <label>End Time</label>

            <input
              type="time"
              value={sessionEndTime}
              onChange={(event) =>
                setSessionEndTime(event.target.value)
              }
            />
          </div>
        </div>

        <div className="schedule-modal-actions">
          <button
            type="button"
            className="schedule-cancel-button"
            onClick={() => setShowScheduleModal(false)}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="schedule-confirm-button"
          >
            Schedule Session
          </button>
        </div>
      </form>
    </div>
  </div>
)}

</div>
  );
}

export default Messages;