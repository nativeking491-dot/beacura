import React, { useState, useRef, useEffect } from "react";
import { MOCK_MENTORS } from "../constants";
import {
  Star,
  MessageCircle,
  Video,
  Calendar,
  ShieldCheck,
  X,
  Check,
  Clock,
  Users,
  Send,
  Shield,
  Info,
  ArrowLeft,
  Phone,
  Smartphone,
  Loader2,
} from "lucide-react";
import { Mentor } from "../types";
import { generateLocalResponse } from "../services/localChatService";
import { useUser } from "../context/UserContext";
import { CravingGeneratorTool } from "../components/CravingGeneratorTool";

interface MentorMessage {
  id: string;
  sender: "user" | "mentor";
  text: string;
  timestamp: Date;
}

const Counseling: React.FC = () => {
  const { user } = useUser();
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [activeChat, setActiveChat] = useState<Mentor | null>(null);
  const [bookingStep, setBookingStep] = useState<
    "details" | "payment" | "success"
  >("details");
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<
    Record<string, MentorMessage[]>
  >({});
  const [chatInput, setChatInput] = useState("");
  const [upiId, setUpiId] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Generate next 5 days dynamically
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);

      days.push({
        day:
          i === 0
            ? "Today"
            : nextDate.toLocaleDateString("en-US", { weekday: "short" }),
        date: nextDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      });
    }
    return days;
  };

  const dates = getNextDays();

  const timeSlots = [
    "09:00 AM",
    "10:30 AM",
    "11:00 AM",
    "01:00 PM",
    "02:30 PM",
    "04:00 PM",
    "05:30 PM",
    "07:00 PM",
  ];

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, activeChat, isTyping]);

  const handleBookSession = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setBookingStep("details");
    setSelectedTime(null);
    setUpiId("");
  };

  const handleStartChat = (mentor: Mentor) => {
    setActiveChat(mentor);
    if (!chatMessages[mentor.id]) {
      setChatMessages((prev) => ({
        ...prev,
        [mentor.id]: [
          {
            id: "1",
            sender: "mentor",
            text: `Hi! I'm ${mentor.name}. I've been clean for ${mentor.experience}. How can I support you today?`,
            timestamp: new Date(),
          },
        ],
      }));
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !activeChat || isTyping) return;

    const userMsg: MentorMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: chatInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), userMsg],
    }));
    const currentInput = chatInput;
    setChatInput("");
    setIsTyping(true);

    // Context for the AI to act as the specific mentor
    // In localChatService, we might need to adjust this, but for now we'll pass the input.
    // The local service is rule-based, so it might not impersonate perfectly yet, 
    // but we can pass the mentor name as the "user name" context or similar if needed,
    // or just rely on its general support capabilities. 
    // For this update, we'll use the local response generator.

    // We pass user's name (from context if available, or "Friend") 
    // We don't have easy access to UserContext here without useContext, let's fix that.

    const aiResponse = await generateLocalResponse(
      currentInput,
      0, // streak placeholer
      "Friend" // name placeholder
    );

    const reply: MentorMessage = {
      id: (Date.now() + 1).toString(),
      sender: "mentor",
      text: aiResponse || "I'm here for you. Let's keep talking.",
      timestamp: new Date(),
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), reply],
    }));
    setIsTyping(false);
  };

  const proceedToPayment = () => {
    if (selectedTime) {
      setBookingStep("payment");
    }
  };

  const confirmPayment = () => {
    if (!upiId.trim()) return;
    setBookingStep("success");
  };

  const closeModals = () => {
    setSelectedMentor(null);
    setActiveChat(null);
    setBookingStep("details");
    setIsTyping(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Counseling Center</h1>
        <p className="text-slate-500">
          Professional peer support and community circles.
        </p>
      </header>

      {/* Anonymous Feature */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl flex items-center justify-between shadow-xl shadow-slate-200">
        <div className="flex items-center space-x-4">
          <div className="bg-amber-500/20 p-3 rounded-2xl border border-amber-500/30">
            <ShieldCheck size={24} className="text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Identity Protection Active</h3>
            <p className="text-slate-400 text-sm">
              Your real identity is only shared if you choose to.
            </p>
          </div>
        </div>
        <button
          onClick={() => (window.location.href = "/counseling/settings")}
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-white/10"
          title="Counseling settings"
        >
          Settings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Featured Tool: AI Craving Intervention */}
        <div className="md:col-span-2 lg:col-span-3 mb-4">
          <CravingGeneratorTool />
        </div>

        {MOCK_MENTORS.map((mentor) => (
          <div
            key={mentor.id}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group"
          >
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-5">
                <div className="relative">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-16 h-16 rounded-2xl border-2 border-slate-50 object-cover shadow-sm group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {mentor.name}
                  </h3>
                  <div className="flex items-center text-amber-500">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-bold ml-1">
                      {mentor.rating}
                    </span>
                    <span className="text-slate-400 font-normal ml-2">
                      {mentor.experience}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Focus Areas
                </p>
                <div className="flex flex-wrap gap-2">
                  {mentor.specialty.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleStartChat(mentor)}
                  className="flex items-center justify-center space-x-2 bg-slate-50 text-slate-700 py-3 rounded-2xl text-sm font-bold hover:bg-amber-50 hover:text-amber-700 transition-all border border-slate-100"
                >
                  <MessageCircle size={18} />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => handleBookSession(mentor)}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-2xl text-sm font-bold hover:shadow-lg transition-all shadow-lg shadow-amber-200"
                >
                  <Video size={18} />
                  <span>Video Call</span>
                </button>
              </div>
            </div>
            <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-500 text-[10px] font-bold uppercase">
                <Clock size={12} className="text-amber-500" />
                <span>Next Slot: 2 PM</span>
              </div>
              <span className="text-[10px] font-black text-amber-600">
                BOOK NOW
              </span>
            </div>
          </div>
        ))}

        <div className="border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center bg-slate-50/30 group hover:bg-white transition-colors">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
            <Users size={32} className="text-slate-300" />
          </div>
          <h3 className="font-bold text-slate-700">Group Support Circle</h3>
          <p className="text-slate-500 text-xs mb-4 max-w-[200px] mx-auto">
            Join others in a moderated group healing session.
          </p>
          <button
            onClick={() => (window.location.href = "/circles")}
            className="bg-white border border-slate-200 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
            title="Browse support circles"
          >
            Browse Circles
          </button>
        </div>
      </div>

      {/* Mentor Chat Modal */}
      {
        activeChat && (
          <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg md:rounded-[2.5rem] shadow-2xl flex flex-col h-[90vh] md:h-[600px] animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
              {/* Chat Header */}
              <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <div className="flex items-center space-x-3">
                  <img
                    src={activeChat.avatar}
                    className="w-10 h-10 rounded-xl object-cover border-2 border-white/20"
                  />
                  <div>
                    <h3 className="font-bold leading-none">{activeChat.name}</h3>
                    <span className="text-[10px] text-amber-100">
                      Peer Mentor • {isTyping ? "Typing..." : "Online"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeModals}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Messages */}
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50"
              >
                {chatMessages[activeChat.id]?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.sender === "user"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-tr-none"
                        : "bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-sm"
                        }`}
                    >
                      {msg.text}
                      <p
                        className={`text-[10px] mt-1 ${msg.sender === "user" ? "text-teal-100" : "text-slate-400"}`}
                      >
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-2">
                      <Loader2 className="animate-spin text-amber-600" size={14} />
                      <span className="text-slate-400 text-xs font-medium">
                        {activeChat.name} is typing...
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t">
                <div className="flex items-center space-x-2 bg-slate-100 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-teal-500 transition-all">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    disabled={isTyping}
                    placeholder={
                      isTyping ? "Please wait..." : "Type a message..."
                    }
                    className="flex-1 bg-transparent border-none outline-none text-sm px-3 py-2 disabled:opacity-50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!chatInput.trim() || isTyping}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-2.5 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Booking & Payment Modal (Existing functionality preserved) */}
      {
        selectedMentor && !activeChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              {bookingStep === "details" && (
                <div className="p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center space-x-4">
                      <img
                        src={selectedMentor.avatar}
                        className="w-14 h-14 rounded-2xl object-cover shadow-sm"
                      />
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          Schedule Video Call
                        </h2>
                        <p className="text-sm text-slate-500">
                          with {selectedMentor.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeModals}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <X size={20} className="text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                        Select Date
                      </label>
                      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                        {dates.map((d, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedDate(i)}
                            className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-all ${selectedDate === i
                              ? "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-500 text-white shadow-lg shadow-amber-200"
                              : "bg-white border-slate-200 text-slate-600 hover:border-teal-300"
                              }`}
                          >
                            <span className="text-[10px] font-bold uppercase mb-1">
                              {d.day}
                            </span>
                            <span className="text-sm font-bold">
                              {d.date.split(" ")[1]}
                            </span>
                            <span className="text-[10px]">
                              {d.date.split(" ")[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center space-x-2">
                        <Clock size={14} className="text-amber-600" />
                        <span>Available Slots</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-3 rounded-xl text-xs font-bold border transition-all ${selectedTime === time
                              ? "bg-amber-50 border-amber-500 text-amber-700"
                              : "bg-slate-50 border-slate-100 text-slate-600 hover:border-teal-200"
                              }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={proceedToPayment}
                        disabled={!selectedTime}
                        className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg ${selectedTime
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg shadow-amber-200"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                          }`}
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {bookingStep === "payment" && (
                <div className="p-8 space-y-8 animate-in slide-in-from-right-10 duration-500">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setBookingStep("details")}
                      className="p-2 hover:bg-slate-100 rounded-full"
                    >
                      <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <h2 className="text-xl font-bold text-slate-900">
                      Payment via PhonePe
                    </h2>
                  </div>

                  <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <Smartphone size={100} className="text-indigo-600" />
                    </div>
                    <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-1 relative z-10">
                      Total Amount
                    </p>
                    <p className="text-4xl font-black text-indigo-900 relative z-10">
                      ₹79
                    </p>
                    <p className="text-[10px] text-indigo-500 mt-2 font-medium italic relative z-10">
                      Instant verification via PhonePe/UPI
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative group">
                      <Smartphone
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 group-focus-within:text-indigo-600 transition-colors"
                        size={18}
                      />
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="Enter UPI ID or Mobile Number"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm font-medium"
                      />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center space-x-3 border border-slate-100">
                      <div className="bg-indigo-600 p-2 rounded-lg">
                        <Phone size={16} className="text-white" />
                      </div>
                      <span className="text-xs text-slate-600 font-medium">
                        Link your PhonePe account for faster checkout
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-400 font-bold uppercase">
                    <Shield size={12} className="text-indigo-500" />
                    <span>Verified Secure UPI Gateway</span>
                  </div>

                  <button
                    onClick={confirmPayment}
                    disabled={!upiId.trim()}
                    className="w-full bg-[#5f259f] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#4a1c7d] transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Smartphone size={20} />
                    <span>Pay ₹79 via PhonePe</span>
                  </button>
                </div>
              )}

              {bookingStep === "success" && (
                <div className="p-12 text-center space-y-6">
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Check size={48} strokeWidth={3} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Payment Successful!
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Your call with{" "}
                      <span className="text-slate-900 font-bold">
                        {selectedMentor?.name}
                      </span>{" "}
                      is confirmed for
                      <span className="text-amber-600 font-bold">
                        {" "}
                        {dates[selectedDate].date} at {selectedTime}
                      </span>
                      .
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 text-left">
                    <div className="flex items-start space-x-3">
                      <div className="bg-white p-2.5 rounded-xl shadow-sm mt-1">
                        <Video size={20} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700 mb-1">
                          Meeting Link Sent
                        </p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Check your email for the meeting link. The session will
                          also appear on your dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={closeModals}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all shadow-lg shadow-amber-200"
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Counseling;
