import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MessageSquare, Users, Zap } from 'lucide-react';
import '../App.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="hero-content">
        <div className="badge">
          <Zap size={16} fill="var(--accent)" color="var(--accent)" />
          <span>Level Up Your Career</span>
        </div>
        
        <h1 className="hero-title">
          Master the <span className="text-highlight">Soft Skills</span> <br />
          that Employers Crave.
        </h1>
        
        <p className="hero-subtitle">
          Interactive modules designed for college students to excel in communication, leadership, and emotional intelligence.
        </p>
        
        <button onClick={() => navigate('/dashboard')} className="btn-primary cta-button">
          Start Learning Now <ArrowRight size={20} />
        </button>

        <div className="features-grid">
          <FeatureCard 
            icon={MessageSquare} 
            title="Communication" 
            desc="Master art of conversation and public speaking."
          />
          <FeatureCard 
            icon={Users} 
            title="Leadership" 
            desc="Learn to lead teams and manage projects effectively." 
          />
          <FeatureCard 
            icon={Zap} 
            title="Adaptability" 
            desc="Thrive in fast-paced and changing environments." 
          />
        </div>
      </div>
      
      {/* Background Elements */}
      <div className="glow-one" />
      <div className="glow-two" />
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="glass feature-card">
    <div className="icon-box">
      <Icon size={24} color="var(--primary)" />
    </div>
    <h3 className="card-title">{title}</h3>
    <p className="cardDesc">{desc}</p>
  </div>
);

export default Landing;
