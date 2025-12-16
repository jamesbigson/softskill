import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ChevronRight, RotateCcw, Award, ArrowLeft } from 'lucide-react';
import { quizData } from '../data/quizData';
import { modulesData } from '../data/modulesData';

const Quiz = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  
  // Get data
  const moduleInfo = modulesData.find(m => m.id === moduleId);
  const questions = quizData[moduleId] || [];

  const handleOptionSelect = (index) => {
    if (showExplanation) return;
    setSelectedOption(index);
    setShowExplanation(true);
    
    if (index === questions[currentQuestionIndex].correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizComplete(true);
    // Save Result
    const savedScores = JSON.parse(localStorage.getItem('quizScores') || '{}');
    // Keep high score
    const previousScore = savedScores[moduleId] || 0;
    if (score > previousScore || true) { // Always save latest or logic for higest
        savedScores[moduleId] = Math.max(score, previousScore);
        // Actually, let's keep the best score logic
        if (score >= previousScore) savedScores[moduleId] = score;
    }
    localStorage.setItem('quizScores', JSON.stringify(savedScores));
  };

  if (!moduleInfo || questions.length === 0) {
    return (
        <div style={styles.container}>
            <h2>Quiz not found for these modules.</h2>
            <button className="btn-primary" onClick={() => navigate('/modules')}>Back to Modules</button>
        </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (quizComplete) {
    const percentage = (score / questions.length) * 100;
    return (
      <div style={styles.container}>
        <div className="glass" style={styles.resultCard}>
          <div style={styles.scoreHeader}>
            <Award size={64} color={percentage > 70 ? "#10b981" : "#f59e0b"} />
            <h1 style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>Quiz Complete!</h1>
            <p style={{fontSize: '1.2rem', color: 'var(--text-muted)'}}>
                You scored {score} out of {questions.length}
            </p>
          </div>
          
          <div style={styles.scoreCircle}>
            <span style={styles.scoreValue}>{percentage}%</span>
          </div>

          <div style={styles.resultFeedback}>
            {percentage === 100 && <p>Perfect Score! You're a master of {moduleInfo.title}.</p>}
            {percentage >= 70 && percentage < 100 && <p>Great job! You have a solid understanding.</p>}
            {percentage < 70 && (
                <div>
                    <p style={{marginBottom: '1rem'}}>Keep practicing! Here are some tips:</p>
                    <ul style={{textAlign: 'left', background: 'rgba(0,0,0,0.03)', padding: '1.5rem', borderRadius: '12px'}}>
                        {moduleInfo.tips.slice(0, 2).map((tip, i) => <li key={i} style={{marginBottom:'0.5rem'}}>{tip}</li>)}
                    </ul>
                </div>
            )}
          </div>

          <div style={styles.actionButtons}>
            <button 
                style={styles.secondaryBtn}
                onClick={() => window.location.reload()}
            >
                <RotateCcw size={18} /> Retry Quiz
            </button>
            <button 
                className="btn-primary"
                onClick={() => navigate('/modules')}
            >
                Back to Modules <ArrowLeft size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backLink} onClick={() => navigate('/modules')}>
            <ArrowLeft size={18} /> Exit
        </button>
        <span style={styles.moduleTag}>{moduleInfo.title} Quiz</span>
        <span style={styles.counter}>{currentQuestionIndex + 1}/{questions.length}</span>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressBar}>
        <div style={{...styles.progressFill, width: `${progress}%`}}></div>
      </div>

      {/* Question Card */}
      <div className="glass" style={styles.card}>
        <h2 style={styles.question}>{currentQ.question}</h2>

        <div style={styles.optionsGrid}>
          {currentQ.options.map((option, index) => {
            let borderColor = 'var(--glass-border)';
            let bgColor = 'white';
            let icon = null;

            if (showExplanation) {
                if (index === currentQ.correct) {
                    borderColor = '#10b981';
                    bgColor = 'rgba(16, 185, 129, 0.1)';
                    icon = <CheckCircle size={20} color="#10b981" />;
                } else if (index === selectedOption) {
                    borderColor = '#ef4444';
                    bgColor = 'rgba(239, 68, 68, 0.1)';
                    icon = <XCircle size={20} color="#ef4444" />;
                } else {
                    bgColor = 'rgba(0,0,0,0.02)'; // Fade others
                    borderColor = 'transparent';
                }
            } else if (selectedOption === index) {
                borderColor = 'var(--primary)';
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={showExplanation}
                style={{
                  ...styles.optionBtn,
                  border: `2px solid ${borderColor}`,
                  background: bgColor,
                  opacity: (showExplanation && index !== currentQ.correct && index !== selectedOption) ? 0.5 : 1
                }}
              >
                <div style={{flex: 1, textAlign: 'left'}}>{option}</div>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Explanation Footer */}
        {showExplanation && (
          <div style={styles.footer}>
             <div style={styles.explanationBox}>
                <strong>Explanation:</strong> {currentQ.explanation}
             </div>
             <button className="btn-primary" onClick={handleNext}>
                {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"} <ChevronRight size={18} />
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '100px 2rem 4rem',
    maxWidth: '800px',
    margin: '0 auto',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  backLink: {
    background: 'none',
    border: 'none',
    display: 'flex', 
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  moduleTag: {
    fontWeight: '600',
    color: 'var(--primary)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontSize: '0.9rem'
  },
  counter: {
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  progressBar: {
    height: '6px',
    background: 'rgba(0,0,0,0.05)',
    borderRadius: '100px',
    marginBottom: '2rem',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'var(--primary)',
    transition: 'width 0.3s ease',
  },
  card: {
    padding: '3rem',
    borderRadius: '24px',
    background: 'white',
    boxShadow: 'var(--shadow-lg)',
  },
  question: {
    fontSize: '1.5rem',
    marginBottom: '2rem',
    lineHeight: '1.4',
    color: 'var(--text-main)',
  },
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  optionBtn: {
    padding: '1.2rem',
    borderRadius: '16px',
    fontSize: '1.05rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: 'var(--text-main)',
  },
  footer: {
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid var(--glass-border)',
    animation: 'fadeIn 0.3s ease'
  },
  explanationBox: {
    background: 'rgba(99, 102, 241, 0.05)',
    padding: '1rem',
    borderRadius: '12px',
    color: 'var(--text-main)',
    marginBottom: '1.5rem',
    lineHeight: '1.5'
  },
  
  // Results
  resultCard: {
    padding: '4rem 2rem',
    borderRadius: '24px',
    background: 'white',
    textAlign: 'center',
    boxShadow: 'var(--shadow-lg)',
  },
  scoreHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  scoreCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'var(--gradient-main)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 2rem',
    color: 'white',
    boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)'
  },
  scoreValue: {
    fontSize: '2rem',
    fontWeight: '800'
  },
  resultFeedback: {
    maxWidth: '500px',
    margin: '0 auto 3rem',
    color: 'var(--text-main)',
    lineHeight: '1.6'
  },
  actionButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center'
  },
  secondaryBtn: {
    padding: '0.8rem 1.5rem',
    borderRadius: '100px',
    border: '1px solid var(--glass-border)',
    background: 'white',
    color: 'var(--text-main)',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  }
};

export default Quiz;
