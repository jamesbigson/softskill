import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Upload, Send, MessageSquare, Loader, Mic, MicOff, Volume2, VolumeX, Headphones, X } from 'lucide-react';
import './MockInterview.css';

const VoiceModeOverlay = ({ 
    onClose, 
    isMuted, 
    toggleMute, 
    isListening, 
    toggleListening, 
    isSpeaking,
    transcript 
}) => {
    return ReactDOM.createPortal(
        <div className="voice-mode-wrapper">
            <div className="voice-controls-top">
                <button className="control-btn" onClick={toggleMute}>
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <button className="control-btn" onClick={onClose}>
                    <X size={24} />
                </button>
            </div>

            <div className="orb-container">
                <div className={`orb ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}></div>
            </div>

            <div className="voice-status">
                {isListening ? "Listening..." : isSpeaking ? "AI Speaking..." : "Tap Mic to Speak"}
                {/* Optional: Show live transcript or subtitle if needed */}
                {/* <div className="subtitle">{transcript}</div> */}
            </div>

            <div className="voice-controls-bottom">
                <button 
                    className={`control-btn mic ${isListening ? 'listening' : ''}`}
                    onClick={toggleListening}
                >
                    {isListening ? <MicOff size={30} /> : <Mic size={30} />}
                </button>
            </div>
        </div>,
        document.body
    );
};

const MockInterview = () => {
    const [step, setStep] = useState('upload'); // upload, interview
    const [file, setFile] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Speech States
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceMode, setVoiceMode] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const recognitionRef = useRef(null);
    
    const messagesEndRef = useRef(null);
    const messagesAreaRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesAreaRef.current) {
            messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
        
        // Speak the latest message if it's from assistant and not muted
        if (messages.length > 0 && !isMuted) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === 'assistant') {
                speak(lastMsg.content);
            }
        }
    }, [messages]);

    // Load voices
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            // Try to find a good English voice
            const preferredVoice = voices.find(v => v.name.includes("Google US English")) || 
                                   voices.find(v => v.name.includes("Microsoft Zira")) || 
                                   voices.find(v => v.lang.startsWith("en-US"));
            
            if (preferredVoice) setSelectedVoice(preferredVoice);
        };

        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
    }, []);

    useEffect(() => {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setSpeechSupported(true);
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                
                if (finalTranscript) {
                     setInputText(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                if (event.error === 'not-allowed') {
                    alert("Microphone access denied. Please allow microphone access.");
                    setIsListening(false);
                }
                if (event.error !== 'no-speech') {
                    setIsListening(false);
                }
            };

            recognitionRef.current.onend = () => {
                 setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (!speechSupported) {
            alert("Speech recognition is not supported in this browser. Try Chrome or Edge.");
            return;
        }
        
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err) {
                console.error("Error starting speech recognition:", err);
                setIsListening(false);
            }
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (!isMuted) {
             window.speechSynthesis.cancel();
        }
    };

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop previous
            const utterance = new SpeechSynthesisUtterance(text);
            if (selectedVoice) utterance.voice = selectedVoice;
            
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/upload-resume', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            setSessionId(data.session_id);
            setMessages([{ role: 'assistant', content: data.message }]);
            setStep('interview');
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Failed to upload resume. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    const handleSendMessage = async () => {
        if (!inputText.trim() || !sessionId) return;

        const userMessage = inputText.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInputText('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/ask-question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    answer: userMessage,
                }),
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();
            
            // Add feedback message if analysis exists
            if (data.analysis) {
                 setMessages(prev => [...prev, { 
                     role: 'feedback', 
                     content: data.analysis 
                 }]);
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
            
        } catch (error) {
            console.error('Error asking question:', error);
            setMessages(prev => [...prev, { role: 'system', content: 'Error getting response. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="interview-container">
            {step === 'upload' ? (
                <div className="upload-section glass">
                    <h2>Mock Interview Setup</h2>
                    <p>Upload your resume to start a personalized AI mock interview.</p>
                    
                    <div className="upload-box" onClick={triggerFileInput}>
                        <Upload size={48} color="var(--primary)" />
                        <input 
                            type="file" 
                            accept=".pdf" 
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            style={{ display: 'none' }} 
                        />
                        <span className="upload-label">
                            {file ? file.name : "Choose PDF Resume"}
                        </span>
                    </div>

                    <button 
                        className="start-btn" 
                        onClick={handleUpload}
                        disabled={!file || loading}
                    >
                        {loading ? <Loader className="spin" /> : "Start Interview"}
                    </button>
                </div>
            ) : (
                <div className="interview-layout single-col">
                    
                    {/* Main Chat Area */}
                    <div className="chat-section glass">
                        <div className="chat-header">
                            <div className="header-left">
                                <MessageSquare size={20} />
                                <h3>Interview Session</h3>
                            </div>
                            <div className="header-actions" style={{display:'flex', gap:'10px'}}>
                                <button 
                                    onClick={() => setVoiceMode(true)} 
                                    className="icon-btn" 
                                    title="Enter Voice Mode"
                                >
                                    <Headphones size={20} />
                                </button>
                                <button 
                                    onClick={toggleMute} 
                                    className="icon-btn" 
                                    title={isMuted ? "Unmute TTS" : "Mute TTS"}
                                >
                                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Voice Mode Portal */}
                        {voiceMode && (
                            <VoiceModeOverlay 
                                onClose={() => setVoiceMode(false)}
                                isMuted={isMuted}
                                toggleMute={toggleMute}
                                isListening={isListening}
                                toggleListening={toggleListening}
                                isSpeaking={isSpeaking}
                                transcript={inputText}
                            />
                        )}

                        <div className="messages-area" ref={messagesAreaRef}>
                            {messages.map((msg, idx) => {
                                if (msg.role === 'feedback') {
                                    return (
                                        <div key={idx} className="message feedback">
                                            <div className="feedback-content">
                                                <h4><Mic size={14}/> Speech Analysis</h4>
                                                <div className="stats-grid">
                                                    <div className="stat">
                                                        <span className="label">Words</span>
                                                        <span className="value">{msg.content.word_count}</span>
                                                    </div>
                                                    <div className="stat">
                                                        <span className="label">Fillers</span>
                                                        <span className="value" style={{color: msg.content.filler_count > 2 ? '#ef4444' : '#10b981'}}>
                                                            {msg.content.filler_count}
                                                        </span>
                                                    </div>
                                                    <div className="stat">
                                                        <span className="label">STAR Score</span>
                                                        <span className="value">{msg.content.star_score}</span>
                                                    </div>
                                                </div>
                                                <ul className="feedback-tips">
                                                    {msg.content.feedback.map((tip, i) => <li key={i}>{tip}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={idx} className={`message ${msg.role}`}>
                                        <div className="message-content">
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                            {loading && (
                                <div className="message assistant">
                                    <div className="typing-indicator">
                                        <span>•</span><span>•</span><span>•</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="input-area">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder={isListening ? "Listening..." : "Type your answer..."}
                                disabled={loading}
                            />
                            
                            <button 
                                onClick={toggleListening}
                                className={`icon-btn ${isListening ? 'listening-active' : ''}`}
                                title={isListening ? "Stop Listening" : "Start Listening"}
                                disabled={loading}
                                style={{
                                    animation: isListening ? 'pulse 1.5s infinite' : 'none'
                                }}
                            >
                                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>

                            <button 
                                onClick={handleSendMessage} 
                                className="icon-btn"
                                disabled={!inputText.trim() || loading}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MockInterview;
