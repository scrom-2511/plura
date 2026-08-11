type ChatPanelProps = {
    title: string;
    messages: { prompt: string; response: string }[];
    newConversation: boolean;
    currentPrompt: string;
    liveResponse: string;
};

export const ChatPanel = ({
    title,
    messages,
    newConversation,
    currentPrompt,
    liveResponse,
}: ChatPanelProps) => (
    <div className="bg-background border border-input-border rounded-3xl flex flex-col h-full overflow-hidden shadow-xl transition-all duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 z-10 px-4 py-4 border-b border-input-border shadow-sm flex items-center justify-center backdrop-blur-md">
            <h1 className="text-center text-xs font-extrabold tracking-[0.2em] text-foreground uppercase">{title}</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 text-sm space-y-6 scroll-smooth">
            {messages.length === 0 && !newConversation && (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-secondary tracking-widest uppercase text-[10px] font-bold">No Messages</p>
                </div>
            )}

            {messages.map((message, index) => (
                <div key={`${message.prompt}-${index}`} className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* User Side */}
                    <div className="self-end max-w-[90%] bg-accent text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-md">
                        <p className="leading-relaxed whitespace-pre-wrap">{message.prompt}</p>
                    </div>
                    {/* Model Side */}
                    <div className="self-start max-w-[95%] bg-input border border-input-border text-foreground px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-sm">
                        <p className="leading-relaxed whitespace-pre-wrap">{message.response}</p>
                    </div>
                </div>
            ))}

            {newConversation && (
                <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                    <div className="self-end max-w-[90%] bg-accent text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-md">
                        <p className="leading-relaxed whitespace-pre-wrap">{currentPrompt}</p>
                    </div>
                    <div className="self-start max-w-[95%] bg-input border border-input-border text-foreground px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-sm relative min-w-12">
                        <p className="leading-relaxed whitespace-pre-wrap">{liveResponse}</p>
                        {/* Blinking indicator for streaming */}
                        {!liveResponse && (
                            <div className="flex gap-1.5 items-center justify-center h-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce delay-150" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce delay-300" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
);