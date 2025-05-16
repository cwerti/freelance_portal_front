import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { formatPrice } from '../utils/formatters';
import BidSystem from './BidSystem';
import '../styles/ProjectCard.css';
import { jwtDecode } from 'jwt-decode';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Get current user ID from JWT token
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // Получаем ID пользователя при монтировании компонента
  useEffect(() => {
    const token = getCookie('access_token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log('=== Token Information ===');
        console.log('Decoded token:', decodedToken);
        
        // Получаем ID пользователя из токена
        const userId = decodedToken.sub ? parseInt(decodedToken.sub) : null;
        console.log('Extracted user ID:', userId);
        
        if (!userId) {
          console.error('No user ID found in token');
          return;
        }
        
        setCurrentUserId(userId);
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    } else {
      console.error('No access token found');
    }
  }, []);

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const projectResponse = await axios.get(`/projects/${id}`);
        setProject(projectResponse.data);

        // Если у проекта есть categoryId, загружаем категорию
        if (projectResponse.data.categoryId) {
          await fetchCategory(projectResponse.data.categoryId);
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // Отдельная функция для загрузки категории
  const fetchCategory = async (categoryId) => {
    try {
      setCategoryLoading(true);
      setCategoryError('');
      
      const response = await axios.get(`/categories/${categoryId}`);
      setCategory(response.data);
    } catch (err) {
      console.error('Error fetching category:', err);
      setCategoryError('Failed to load category');
      setCategory(null);
    } finally {
      setCategoryLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!project) return <div className="error">Project not found</div>;

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
              <span className="value">{formatPrice(project.budget)} ₽</span>
            </div>
            <div className="detail-item">
              <span className="label">Category</span>
              <span className="value">
                {categoryLoading ? (
                  'Loading category...'
                ) : categoryError ? (
                  <span className="error-text">{categoryError}</span>
                ) : category ? (
                  category.name
                ) : (
                  'No category specified'
                )}
              </span>
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
            {project.deadline && (
              <div className="detail-item">
                <span className="label">Deadline</span>
                <span className="value">
                  {new Date(project.deadline).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Bid System Component */}
          <BidSystem
            projectId={id}
            projectOwnerId={project.userId}
            currentUserId={currentUserId}
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