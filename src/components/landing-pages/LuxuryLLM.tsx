"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar, Menu, Plus, Send, MoreHorizontal, Palette, ChevronDown, Mic } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  lastActivity: Date;
}

interface Project {
  id: string;
  name: string;
  description: string;
  logo: string;
  updatedAt: Date;
}

type BackgroundTheme = "aman" | "aesop" | "aesopDark" | "stone";

type AIModel = {
  id: string;
  name: string;
  description: string;
  icon: string;
  tools?: string[];
};

const AI_MODELS: AIModel[] = [
  { id: "gpt-oss-120b", name: "GPT-OSS 120B", description: "Private | $$ | Text only", icon: "🔒", tools: [] },
  { id: "gpt-5.2", name: "GPT-5.2", description: "Not Private | $$$ | Multimodal", icon: "🌀", tools: ["Create image", "Canvas", "Deep Research", "Deep thinking", "Agent"] },
  { id: "gpt-5.1", name: "GPT-5.1", description: "Not Private | $$$ | Multimodal", icon: "🌀", tools: ["Create image", "Deep Research", "Agent"] },
  { id: "claude-opus-4.5", name: "Claude Opus 4.5", description: "Not Private | $$$ | Multimodal", icon: "✦", tools: ["Canvas", "Deep thinking", "Agent"] },
];

export default function LuxuryLLM() {
  const [chats, setChats] = useState<Chat[]>([
    { id: "1", title: "Amsterdam trip with the boys", messages: [], lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: "2", title: "Marble Statue Pizza Cigar.", messages: [], lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 5) },
    { id: "3", title: "Product team meeting in Barcelona", messages: [], lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    { id: "4", title: "Fern Gully, the Chief Leaf Officer", messages: [], lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
    { id: "5", title: "Gradient Background Pack Giveaway", messages: [], lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
  ]);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [backgroundTheme, setBackgroundTheme] = useState<BackgroundTheme>("aman");
  const [themeSelectorOpen, setThemeSelectorOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0]);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [agentsOpen, setAgentsOpen] = useState(true);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [fontStyle, setFontStyle] = useState<string>("inter");
  const [typingSpeed, setTypingSpeed] = useState<number>(1500);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [projects] = useState<Project[]>([
    { id: "1", name: "Brand Identity System", description: "Luxury wellness brand guidelines", logo: "✦", updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4) },
    { id: "2", name: "Editorial Design", description: "Magazine layout concepts", logo: "◆", updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    { id: "3", name: "Interior Concept", description: "Minimalist retail space", logo: "◉", updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
  ]);

  const [agents] = useState([
    { id: "1", name: "Travel assistant", logo: "◈" },
    { id: "2", name: "Product Management", logo: "◇" },
    { id: "3", name: "Personal assistant", logo: "◊" },
    { id: "4", name: "Content Automation", logo: "⬡" },
  ]);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      lastActivity: new Date(),
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    let currentChatId = activeChatId;

    if (!currentChatId) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: input.slice(0, 40) + (input.length > 40 ? "..." : ""),
        messages: [],
        lastActivity: new Date(),
      };
      setChats([newChat, ...chats]);
      currentChatId = newChat.id;
      setActiveChatId(newChat.id);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, userMessage],
              lastActivity: new Date(),
              title: chat.messages.length === 0 ? input.slice(0, 40) + (input.length > 40 ? "..." : "") : chat.title,
            }
          : chat
      )
    );

    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateResponse(input),
        timestamp: new Date(),
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, aiMessage],
                lastActivity: new Date(),
              }
            : chat
        )
      );
      setIsTyping(false);
    }, typingSpeed);
  };

  const generateResponse = (userInput: string): string => {
    const responses = [
      "That's an intriguing perspective. The intersection of creativity and technology has always fascinated me. What aspects would you like to explore further?",
      "I appreciate the nuance in your question. From a thoughtful standpoint, we might consider multiple dimensions of this topic.",
      "Your inquiry touches on something quite profound. Let me offer a considered response that balances various viewpoints.",
      "This is a fascinating area to explore. The complexity here invites us to think more deeply about the underlying patterns.",
      "What you're describing resonates with broader themes in contemporary thought. Shall we examine this from different angles?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const themes = {
    aman: {
      bg: "bg-[#fafaf8]",
      mainBg: "bg-[#fafaf8]",
      sidebarBg: "bg-[#f5f5f3]",
      border: "border-[#e8e8e6]",
      text: "text-[#1a1a18]",
      textMuted: "text-[#5a5a58]",
      textDim: "text-[#8a8a88]",
      accent: "bg-[#1a1a18]",
      accentHover: "hover:bg-[#2d2d2a]",
      accentText: "text-[#5a5a58]",
      inputBorder: "border-[#1a1a18]/20",
      bgPattern: "#fafaf8",
    },
    aesop: {
      bg: "bg-[#ebe5dc]",
      mainBg: "bg-[#f5f0ea]",
      sidebarBg: "bg-[#e3ddd4]",
      border: "border-[#c9c3ba]",
      text: "text-[#1a1108]",
      textMuted: "text-[#4a4038]",
      textDim: "text-[#7a6a58]",
      accent: "bg-[#c9a961]",
      accentHover: "hover:bg-[#b8984d]",
      accentText: "text-[#6b5c4e]",
      inputBorder: "border-[#1a1108]/25",
      bgPattern: "#f5f0ea",
    },
    aesopDark: {
      bg: "bg-[#2a2520]",
      mainBg: "bg-[#1f1c18]",
      sidebarBg: "bg-[#352f28]",
      border: "border-[#4a4035]",
      text: "text-[#ebe5dc]",
      textMuted: "text-[#b9afa2]",
      textDim: "text-[#8b7f72]",
      accent: "bg-[#c9a961]",
      accentHover: "hover:bg-[#b8984d]",
      accentText: "text-[#c9a961]",
      inputBorder: "border-[#c9a961]/30",
      bgPattern: "#1f1c18",
    },
    stone: {
      bg: "bg-[#e5e3df]",
      mainBg: "bg-[#eeecea]",
      sidebarBg: "bg-[#dddbd7]",
      border: "border-[#c5c3bf]",
      text: "text-[#2a2825]",
      textMuted: "text-[#5a5854]",
      textDim: "text-[#8a8882]",
      accent: "bg-[#2a2825]",
      accentHover: "hover:bg-[#3d3a34]",
      accentText: "text-[#5a5854]",
      inputBorder: "border-[#2a2825]/20",
      bgPattern: "#eeecea",
    },
  };

  const currentTheme = themes[backgroundTheme];

  const getFontClass = () => {
    switch (fontStyle) {
      case "crimson":
      case "playfair":
      case "lora":
        return "font-serif";
      default:
        return "font-['Inter',sans-serif]";
    }
  };

  return (
    <div className={`flex h-screen ${currentTheme.bg} ${currentTheme.text} ${getFontClass()} overflow-hidden relative`}>
      <div className="absolute inset-0 pointer-events-none opacity-100" style={{ background: currentTheme.bgPattern }} />

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`w-[320px] ${currentTheme.sidebarBg} ${currentTheme.border} border-r flex flex-col relative z-10`}
          >
            {/* Sidebar Header */}
            <div className="p-8 pb-6">
              <div className="flex items-center justify-between">
                <h1 className={`text-[22px] ${currentTheme.text} font-light tracking-tight`}>Anuma</h1>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className={`w-11 h-11 rounded-full ${currentTheme.sidebarBg} hover:bg-opacity-70 transition-all duration-500 flex items-center justify-center`}
                >
                  <Sidebar className={`w-4 h-4 ${currentTheme.textDim}`} />
                </button>
              </div>
            </div>

            {/* New Chat */}
            <div className="px-8 pb-6">
              <button
                onClick={createNewChat}
                className={`w-full flex items-center justify-center gap-3 px-6 py-5 border ${currentTheme.border} hover:${currentTheme.accent} transition-all duration-700 group`}
              >
                <Plus className={`w-3.5 h-3.5 ${currentTheme.textDim} group-hover:${currentTheme.text} transition-all duration-700`} />
                <span className={`text-[11px] ${currentTheme.textDim} group-hover:${currentTheme.text} tracking-[0.15em] uppercase transition-all duration-700`}>New Conversation</span>
              </button>
            </div>

            {/* Agents Section */}
            <div className={`px-8 pb-8 ${currentTheme.border} border-b border-opacity-40`}>
              <button onClick={() => setAgentsOpen(!agentsOpen)} className="w-full flex items-center justify-between py-3 transition-all duration-300 mb-4">
                <span className={`text-[9px] ${currentTheme.textDim} uppercase tracking-[0.15em]`}>Agents</span>
                <ChevronDown className={`w-3.5 h-3.5 ${currentTheme.textDim} transition-transform duration-300 ${agentsOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {agentsOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden space-y-4">
                    {agents.map((agent) => (
                      <motion.button key={agent.id} whileHover={{ x: 4 }} transition={{ duration: 0.4 }} className="w-full text-left group flex items-center gap-3">
                        <div className={`w-[13px] h-[13px] rounded-sm ${currentTheme.accent} flex items-center justify-center flex-shrink-0`}>
                          <span className={`text-[13px] leading-none ${backgroundTheme === 'aesopDark' ? 'text-[#1f1c18]' : 'text-[#fafaf8]'}`}>{agent.logo}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] ${currentTheme.text} leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-500`}>{agent.name}</p>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Projects Section */}
            <div className={`px-8 pb-8 ${currentTheme.border} border-b border-opacity-40`}>
              <button onClick={() => setProjectsOpen(!projectsOpen)} className="w-full flex items-center justify-between py-3 transition-all duration-300 mb-4">
                <span className={`text-[9px] ${currentTheme.textDim} uppercase tracking-[0.15em]`}>Projects</span>
                <ChevronDown className={`w-3.5 h-3.5 ${currentTheme.textDim} transition-transform duration-300 ${projectsOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {projectsOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden space-y-4">
                    {projects.map((project) => (
                      <motion.button key={project.id} whileHover={{ x: 4 }} transition={{ duration: 0.4 }} className="w-full text-left group flex items-center gap-3">
                        <div className={`w-[13px] h-[13px] rounded-sm ${currentTheme.accent} flex items-center justify-center flex-shrink-0`}>
                          <span className={`text-[13px] leading-none ${backgroundTheme === 'aesopDark' ? 'text-[#1f1c18]' : 'text-[#fafaf8]'}`}>{project.logo}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] ${currentTheme.text} leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-500`}>{project.name}</p>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-8 pt-8">
              <div className="mb-6">
                <p className={`text-[9px] ${currentTheme.textDim} uppercase tracking-[0.15em]`}>Recent</p>
              </div>
              <div className="space-y-2">
                {chats.map((chat) => (
                  <motion.button
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.4 }}
                    className={`w-full text-left py-4 transition-all duration-500 ${currentTheme.border} border-b border-opacity-40 ${activeChatId === chat.id ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
                  >
                    <p className={`text-[15px] ${currentTheme.text} leading-relaxed`}>{chat.title}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Theme Selector */}
            <div className={`px-8 py-6 ${currentTheme.border} border-t`}>
              <button onClick={() => setThemeSelectorOpen(!themeSelectorOpen)} className="w-full flex items-center justify-between py-3 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <Palette className={`w-4 h-4 ${currentTheme.textDim}`} />
                  <span className={`text-[11px] ${currentTheme.textDim} uppercase tracking-[0.15em]`}>Personalize</span>
                </div>
                <ChevronDown className={`w-4 h-4 ${currentTheme.textDim} transition-transform duration-300 ${themeSelectorOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {themeSelectorOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="pt-4 space-y-5">
                      <div>
                        <p className={`text-[9px] ${currentTheme.textDim} uppercase tracking-[0.15em] mb-3`}>Theme</p>
                        <div className="flex items-center gap-2">
                          {(["aman", "aesop", "aesopDark", "stone"] as BackgroundTheme[]).map((theme) => (
                            <button
                              key={theme}
                              onClick={() => setBackgroundTheme(theme)}
                              className={`flex-1 h-10 rounded-md transition-all duration-500 border-2 ${backgroundTheme === theme ? `${themes[theme].accent} border-white/40 scale-105` : `${themes[theme].accent} border-transparent opacity-60 hover:opacity-100`}`}
                              title={theme.charAt(0).toUpperCase() + theme.slice(1)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Section */}
            <div className={`p-8 ${currentTheme.border} border-t relative`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${currentTheme.accent} flex items-center justify-center`}>
                  <span className={`text-[11px] ${backgroundTheme === 'aesopDark' ? 'text-[#1f1c18]' : 'text-[#fafaf8]'} tracking-wider font-light`}>GS</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] ${currentTheme.text} truncate`}>0x1a42...4f5b</p>
                  <p className={`text-[11px] ${currentTheme.textDim} mt-0.5`}>854 Credits</p>
                </div>
                <button onClick={() => setSettingsMenuOpen(!settingsMenuOpen)} className={`${currentTheme.textDim} ${currentTheme.accentText} hover:${currentTheme.text} transition-colors duration-500`}>
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${currentTheme.mainBg} relative z-10`}>
        {/* Header */}
        <div className={`h-20 ${currentTheme.border} border-b flex items-center justify-between px-12`}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className={`w-11 h-11 rounded-full ${currentTheme.sidebarBg} transition-all duration-500 flex items-center justify-center`}>
              <Menu className={`w-5 h-5 ${currentTheme.textDim}`} />
            </button>
          )}
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${currentTheme.accent}`} />
            <span className={`text-[10px] ${currentTheme.textDim} uppercase tracking-[0.15em]`}>Standard</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {!activeChat || activeChat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-12">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="text-center space-y-16 max-w-4xl w-full">
                <div className="space-y-4">
                  <h2 className={`text-[42px] ${currentTheme.text} font-light tracking-tight`}>Hi there,</h2>
                  <p className={`text-[18px] ${currentTheme.textDim} font-light`}>What would you like to do?</p>
                </div>

                {/* Smart Suggestions */}
                <div className="flex items-center justify-center gap-4 flex-nowrap">
                  {["Feed", "Research", "Create", "Agents"].map((suggestion, index) => (
                    <motion.button
                      key={suggestion}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ y: -3, scale: 1.02 }}
                      onClick={() => setInput(suggestion)}
                      className={`px-10 py-5 border ${currentTheme.border} hover:${currentTheme.accent} hover:border-transparent transition-all duration-700 group relative overflow-hidden flex-shrink-0`}
                    >
                      <span className={`text-[11px] ${currentTheme.textDim} group-hover:${backgroundTheme === 'aesopDark' ? 'text-[#1f1c18]' : 'text-[#fafaf8]'} tracking-[0.2em] uppercase transition-all duration-700 relative z-10 font-light whitespace-nowrap`}>
                        {suggestion}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Input */}
                <div className="w-full max-w-3xl">
                  <div className={`flex items-center gap-4 pb-2 border-b ${currentTheme.inputBorder}`}>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message"
                      className={`flex-1 bg-transparent ${currentTheme.text} text-[15px] placeholder:${currentTheme.textDim} focus:outline-none py-3 text-center`}
                    />
                    {input.trim() ? (
                      <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={sendMessage} className={`${currentTheme.accentText} hover:${currentTheme.textMuted} transition-all duration-500`}>
                        <Send className="w-5 h-5" />
                      </motion.button>
                    ) : (
                      <button className={`${currentTheme.accentText} hover:${currentTheme.textMuted} transition-all duration-500`}>
                        <Mic className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <button className={`text-[10px] ${currentTheme.textDim} hover:${currentTheme.textMuted} uppercase tracking-[0.15em] transition-colors duration-500`}>Attach</button>
                    <div className="relative">
                      <button onClick={() => setModelMenuOpen(!modelMenuOpen)} className={`flex items-center gap-2 text-[10px] ${currentTheme.textDim} hover:${currentTheme.textMuted} uppercase tracking-[0.15em] transition-colors duration-500`}>
                        {selectedModel.name}
                        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${modelMenuOpen ? "rotate-180" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {modelMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className={`absolute top-full right-0 mt-2 ${currentTheme.sidebarBg} ${currentTheme.border} border rounded-lg p-3 min-w-[280px] backdrop-blur-sm shadow-xl`}
                          >
                            <div className="space-y-2">
                              {AI_MODELS.map((model) => (
                                <button
                                  key={model.id}
                                  onClick={() => {
                                    setSelectedModel(model);
                                    setModelMenuOpen(false);
                                  }}
                                  className={`w-full text-left p-3 rounded-md transition-all duration-300 ${selectedModel.id === model.id ? `${currentTheme.accent} ${currentTheme.text}` : `hover:bg-opacity-50 ${currentTheme.accentHover}`}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-xl">{model.icon}</span>
                                    <div className="flex-1">
                                      <p className={`text-[13px] ${currentTheme.text}`}>{model.name}</p>
                                      <p className={`text-[10px] ${currentTheme.textDim} mt-0.5`}>{model.description}</p>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Tools Section */}
                  {selectedModel.tools && selectedModel.tools.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex items-center justify-center gap-2 mt-6 flex-wrap">
                      {selectedModel.tools.map((tool, index) => (
                        <motion.button
                          key={tool}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                          className={`px-4 py-2 border ${currentTheme.border} hover:${currentTheme.accent} hover:border-transparent transition-all duration-500 group rounded-sm`}
                        >
                          <span className={`text-[9px] ${currentTheme.textDim} group-hover:${backgroundTheme === 'aesopDark' ? 'text-[#1f1c18]' : 'text-[#fafaf8]'} tracking-[0.12em] uppercase transition-all duration-500`}>{tool}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-12 py-16 space-y-12">
              <AnimatePresence>
                {activeChat.messages.map((message) => (
                  <motion.div key={message.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] ${message.role === "user" ? "text-right" : "text-left"}`}>
                      <p className={`text-[15px] leading-[1.8] ${currentTheme.text}`}>{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="flex justify-start">
                  <div className="flex gap-2">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} className={`w-1.5 h-1.5 rounded-full ${currentTheme.accent}`} />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} className={`w-1.5 h-1.5 rounded-full ${currentTheme.accent}`} />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }} className={`w-1.5 h-1.5 rounded-full ${currentTheme.accent}`} />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Only show when chat is active */}
        {activeChat && activeChat.messages.length > 0 && (
          <div className={`${currentTheme.border} border-t px-12 py-8`}>
            <div className="max-w-4xl mx-auto">
              <div className={`flex items-center gap-4 pb-2 border-b ${currentTheme.inputBorder}`}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message"
                  className={`flex-1 bg-transparent ${currentTheme.text} text-[15px] placeholder:${currentTheme.textDim} focus:outline-none py-3`}
                />
                {input.trim() ? (
                  <button onClick={sendMessage} className={`${currentTheme.accentText} hover:${currentTheme.textMuted} transition-all duration-500`}>
                    <Send className="w-5 h-5" />
                  </button>
                ) : (
                  <button className={`${currentTheme.accentText} hover:${currentTheme.textMuted} transition-all duration-500`}>
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
