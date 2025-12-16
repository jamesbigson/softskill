import React, { useState, useRef, useEffect } from 'react';
import { Upload, Send, MessageSquare, Loader, Mic } from 'lucide-react';
import './MockInterview.css';

const MockInterview = () => {
    const [step, setStep] = useState('upload'); // upload, interview
    const [file, setFile] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
                            <MessageSquare size={20} />
                            <h3>Interview Session</h3>
                        </div>

                        <div className="messages-area">
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
                                placeholder="Type your answer..."
                                disabled={loading}
                            />
                            <button 
                                onClick={handleSendMessage} 
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
