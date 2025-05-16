import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BidSystem from './BidSystem';
import '../styles/ProjectCard.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get current user ID from your auth system
  const currentUserId = localStorage.getItem('userId'); // Adjust based on your auth implementation

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/projects/${id}`);
        setProject(response.data);
      } catch (err) {
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!project) return <div className="error">Project not found</div>;

  const isOwner = project.userId === currentUserId;

  return (
    <div className="project-details-container">
      <div className="project-card detailed">
        <div className="project-header">
          <h1>{project.title}</h1>
          <div className={`status status-${project.status}`}>
            {getStatusText(project.status)}
          </div>
        </div>

        <div className="project-content">
          <div className="project-description">
            <h3>Description</h3>
            <p>{project.description}</p>
          </div>

          <div className="project-details">
            <div className="detail-item">
              <span className="label">Budget</span>
              <span className="value">${project.budget}</span>
            </div>
            <div className="detail-item">
              <span className="label">Category</span>
              <span className="value">{project.category}</span>
            </div>
            <div className="detail-item">
              <span className="label">Posted By</span>
              <span className="value">User ID: {project.userId}</span>
            </div>
            <div className="detail-item">
              <span className="label">Posted On</span>
              <span className="value">
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Bid System Component */}
          <BidSystem
            projectId={id}
            isOwner={isOwner}
            userId={currentUserId}
            projectStatus={project.status}
          />
        </div>
      </div>
    </div>
  );
};

// Helper function to get status text
const getStatusText = (status) => {
  switch (status) {
    case 1:
      return 'Active';
    case 2:
      return 'In Progress';
    case 3:
      return 'Completed';
    case 4:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

export default ProjectDetails; 