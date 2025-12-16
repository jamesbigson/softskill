import { 
  BookOpen, CheckCircle, ArrowLeft, Clock, 
  MessageCircle, Users, Award, Briefcase, ChevronRight, Star,
  PlayCircle, User
} from 'lucide-react';
import { modulesData } from '../data/modulesData';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Module = () => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState(null);
  const [completedModules, setCompletedModules] = useState([]);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('softSkillsProgress');
    if (saved) {
      setCompletedModules(JSON.parse(saved));
    }
  }, []);

  // Save progress
  const markComplete = (id) => {
    if (!completedModules.includes(id)) {
      const newCompleted = [...completedModules, id];
      setCompletedModules(newCompleted);
      localStorage.setItem('softSkillsProgress', JSON.stringify(newCompleted));
    }
  };

  const getIcon = (iconName) => {
    switch(iconName) {
      case 'MessageCircle': return <MessageCircle size={24} />;
      case 'Users': return <Users size={24} />;
      case 'Clock': return <Clock size={24} />;
      case 'Award': return <Award size={24} />;
      case 'Briefcase': return <Briefcase size={24} />;
      case 'User': return <User size={24} />;
      default: return <BookOpen size={24} />;
    }
  };

  const renderModuleList = () => (
    <div className="module-grid">
      {modulesData.map(module => {
        const isCompleted = completedModules.includes(module.id);
        return (
          <div 
            key={module.id} 
            className="glass module-card"
            onClick={() => setActiveModule(module)}
          >
            <div className="module-card-header">
              <div 
                className="module-icon-box"
                style={{
                    background: isCompleted ? 'var(--primary)' : 'rgba(99, 102, 241, 0.1)', 
                    color: isCompleted ? 'white' : 'var(--primary)'
                }}
              >
                {getIcon(module.icon)}
              </div>
              {isCompleted && <CheckCircle size={20} color="#10b981" />}
            </div>
            <h3 className="module-card-title">{module.title}</h3>
            <p className="module-card-desc">{module.description}</p>
            <div className="module-card-footer">
              <span className="learn-text">Start Learning</span>
              <ChevronRight size={16} />
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderActiveModule = () => {
    const isCompleted = completedModules.includes(activeModule.id);
    return (
      <div className="glass detail-card">
        <button className="back-btn" onClick={() => setActiveModule(null)}>
          <ArrowLeft size={18} /> Back to Modules
        </button>

        <div className="detail-header">
          <div className="detail-icon">
             {getIcon(activeModule.icon)}
          </div>
          <div>
            <h1 className="detail-title">{activeModule.title}</h1>
            <p className="detail-desc">{activeModule.description}</p>
          </div>
        </div>

        {activeModule.image && (
          <div className="imageContainer">
            <img src={activeModule.image} alt={activeModule.title} className="moduleImage" />
          </div>
        )}

        <div className="section">
          <h3 className="section-title"><Star size={18} /> Key Tips</h3>
          <ul className="list">
            {activeModule.tips.map((tip, i) => (
              <li key={i} className="list-item">{tip}</li>
            ))}
          </ul>
        </div>

        <div className="detail-row">
          <div className="col">
            <h3 className="section-title" style={{color: '#10b981'}}>Do's</h3>
            <ul className="list">
              {activeModule.dos.map((item, i) => (
                <li key={i} className="list-item">✓ {item}</li>
              ))}
            </ul>
          </div>
          <div className="col">
            <h3 className="section-title" style={{color: '#ef4444'}}>Don'ts</h3>
            <ul className="list">
              {activeModule.donts.map((item, i) => (
                <li key={i} className="list-item">✗ {item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="section">
            <h3 className="section-title">Real-Life Example</h3>
            <div className="example-box">
                "{activeModule.example}"
            </div>
        </div>

        <div className="action-area">
          <button 
            className="action-btn"
            onClick={() => navigate(`/quiz/${activeModule.id}`)}
            style={{background: 'var(--secondary)', color: 'white'}}
          >
            <PlayCircle size={18} /> Take Quiz
          </button>

          <button 
            className="action-btn"
            onClick={() => markComplete(activeModule.id)}
            disabled={isCompleted}
            style={{background: 'var(--primary)', color: 'white', opacity: isCompleted ? 0.7 : 1}}
          >
            {isCompleted ? (
              <>Completed <CheckCircle size={18} /></>
            ) : (
              <>Mark as Done <CheckCircle size={18} /></>
            )}
          </button>
        </div>

      </div>
    );
  };

  return (
    <div className="page-container">
      <div style={{textAlign: 'center', marginBottom: '3rem'}}>
        <h1 className="hero-title" style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>Skill Modules</h1>
        <p>Master the essential soft skills for your career.</p>
      </div>
      {activeModule ? renderActiveModule() : renderModuleList()}
    </div>
  );
};



export default Module;

