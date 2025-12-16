import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import '../App.css';

const ResumeBuilder = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/analyze-resume', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error("Analysis failed");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-container">
      <div className="glass resume-card">
        <h2 className="dashboard-title">Smart Resume ATS Checker</h2>
        <p className="dashboard-subtitle">Upload your resume to see how well it matches industry keywords.</p>

        <div className="upload-zone" onClick={() => fileInputRef.current.click()}>
          <Upload size={48} color="var(--primary)" />
          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange} 
            ref={fileInputRef} 
            style={{display: 'none'}}
          />
          <p style={{marginTop: '1rem', color: 'var(--text-main)'}}>
            {file ? file.name : "Click to Upload PDF Resume"}
          </p>
        </div>

        <button 
          className="btn-primary" 
          onClick={handleAnalyze} 
          disabled={!file || loading}
          style={{width: '100%', marginTop: '1rem'}}
        >
          {loading ? <Loader className="spin" /> : "Analyze Resume"}
        </button>

        {result && (
          <div className="result-area">
            <div className="score-circle">
              <span className="score-value">{result.score}</span>
              <span className="score-label">ATS Score</span>
            </div>

            <div className="keywords-grid">
              <div className="keyword-box">
                <h4 style={{color: '#ef4444', marginBottom: '1rem'}}>Missing Keywords</h4>
                <div className="tags">
                  {result.missing_keywords.map(kw => (
                    <span key={kw} className="tag" style={{borderColor: '#ef4444', color: '#ef4444'}}>
                      <AlertCircle size={12} /> {kw}
                    </span>
                  ))}
                  {result.missing_keywords.length === 0 && <span style={{color: '#aaa'}}>None! Great job.</span>}
                </div>
              </div>

              <div className="keyword-box">
                <h4 style={{color: '#10b981', marginBottom: '1rem'}}>Matched Skills</h4>
                <div className="tags">
                  {result.found_keywords.map(kw => (
                    <span key={kw} className="tag" style={{borderColor: '#10b981', color: '#10b981'}}>
                      <CheckCircle size={12} /> {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeBuilder;
