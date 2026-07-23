// Chatt.tsx
import api from "@/lib/api";
import React, { useEffect, useMemo, useState } from "react";
import { socket } from '@/services/socket'
import { useAuth } from "@/hooks/useAuth";

type User = {
  _id: string;
  username: string;
  firstname: string;
  lastname: string;
  fullname: string;
  email: string;
  status: "online" | "offline";
};

type Message = {
  id: number;
  userId: string;
  sender: "me" | "other";
  text: string;
  time: string;
};

const INITIAL_MESSAGES: Message[] = [];

const Chatt = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");

        if (response.data.success) {
          const fetchedUsers = response.data.users;

          setUsers(fetchedUsers);

          if (fetchedUsers.length > 0) {
            setActiveUserId(fetchedUsers[0]._id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  const currentUserId = user?.id;

  useEffect(() => {
    const handleMessage = (message: any) => {
      console.log('message',message);

      setMessages((prev) => [
        ...prev,
        {
          id: message.id ?? Date.now(),
          userId: message.senderId,
          sender: message.senderId === currentUserId ? "me" : "other",
          text: message.text,
          time: new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    };

    socket.on("receive-message", handleMessage);

    return () => {
      socket.off("receive-message", handleMessage);
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    socket.connect();
    socket.emit("join-user", currentUserId);

    return () => {
      socket.disconnect();
    };
  }, [currentUserId]);

  const activeUser = useMemo(
    () => users.find((user) => user._id === activeUserId),
    [activeUserId, users]
  );

  const activeMessages = useMemo(
    () => messages.filter((message) => message.userId === activeUserId),
    [messages, activeUserId]
  );

  const handleSendMessage = () => {
    const trimmed = input.trim();

    if (!trimmed || !activeUserId || !currentUserId) return;

    const newMessage: Message = {
      id: Date.now(),
      userId: activeUserId,
      sender: "me",
      text: trimmed,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    socket.emit("send-message", {
      senderId: currentUserId,
      receiverId: activeUserId,
      text: trimmed,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  if (!activeUser && users.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading users...
      </div>
    );
  }

  return (
    <div className="h-130 w-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mx-auto flex h-full w-full max-w-7xl overflow-hidden lg:p-4">
        <div className="flex w-full overflow-hidden rounded-none bg-white shadow-sm dark:bg-slate-900 lg:rounded-2xl">
          {/* Sidebar */}
          <aside className="w-full max-w-[320px] border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <div className="border-b border-slate-200 dark:border-slate-800 p-4">
              <h1 className="text-xl font-semibold">Chats</h1>

              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="h-[calc(100vh-140px)] overflow-y-auto p-2">
              {users.map((user) => {
                const isActive = user._id === activeUserId;

                return (
                  <button
                    key={user._id}
                    onClick={() => setActiveUserId(user._id)}
                    className={`mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${isActive
                      ? "bg-indigo-600 text-white shadow-md"
                      : "hover:bg-slate-200 dark:hover:bg-slate-800"
                      }`}
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold ${isActive
                        ? "bg-white/15"
                        : "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                        }`}
                    >
                      {(user.fullname || user.username)
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">
                          {user.fullname || user.username}
                        </span>

                        <span
                          className={`h-2.5 w-2.5 rounded-full ${user.status === "online"
                            ? "bg-green-500"
                            : "bg-slate-400"
                            }`}
                        />
                      </div>

                      <p
                        className={`mt-1 text-xs ${isActive
                          ? "text-white/80"
                          : "text-slate-500 dark:text-slate-400"
                          }`}
                      >
                        {user.status === "online" ? "Online" : "Offline"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Chat Area */}
          <main className="flex flex-1 flex-col bg-white dark:bg-slate-900">
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                  {(activeUser?.fullname || activeUser?.username || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    {activeUser?.fullname || activeUser?.username}
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {activeUser?.status === "online"
                      ? "Online"
                      : "Offline"}
                  </p>
                </div>
              </div>

              <div className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                Room: direct-chat
              </div>
            </header>

            <section className="flex-1 overflow-y-auto bg-slate-50 px-4 py-6 dark:bg-slate-950">
              {activeMessages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="max-w-sm rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
                    <h3 className="text-lg font-medium">
                      No messages yet
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Start the conversation with{" "}
                      {activeUser?.fullname || activeUser?.username}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "me"
                        ? "justify-end"
                        : "justify-start"
                        }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${message.sender === "me"
                          ? "bg-indigo-600 text-white rounded-br-md"
                          : "bg-white text-slate-900 rounded-bl-md dark:bg-slate-900 dark:text-slate-100"
                          }`}
                      >
                        <p className="text-sm leading-relaxed">
                          {message.text}
                        </p>

                        <p
                          className={`mt-2 text-right text-[11px] ${message.sender === "me"
                            ? "text-indigo-100"
                            : "text-slate-400 dark:text-slate-500"
                            }`}
                        >
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <footer className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${activeUser?.fullname || activeUser?.username || ""
                    }...`}
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950"
                />

                <button
                  onClick={handleSendMessage}
                  className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 active:scale-[0.98]"
                >
                  Send
                </button>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Chatt;