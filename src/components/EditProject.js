import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../styles/EditProject.css';

const EditProject = ({ project, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    category_id: project.category_id,
    start_price: project.start_price,
    deadline: project.deadline?.split('T')[0] || '',
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    project.image ? `http://localhost:8000/uploads/${project.image}` : null
  );
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = getCookie('access_token');
    if (token) {
      fetchCategories(token);
    }
  }, []);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const fetchCategories = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/orders/categories', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Ошибка при загрузке категорий:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = getCookie('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (image) {
        formDataToSend.append('image', image);
      }

      const response = await fetch(`http://localhost:8000/orders/${project.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
        credentials: 'include',
      });

      if (response.ok) {
        const updatedProject = await response.json();
        onUpdate(updatedProject);
      } else {
        throw new Error('Не удалось обновить проект');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="edit-project-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label>Название проекта</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Описание</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Категория</label>
        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          required
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Стартовая цена</label>
        <input
          type="number"
          name="start_price"
          value={formData.start_price}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Срок выполнения</label>
        <input
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Изображение проекта</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {previewUrl && (
          <div className="image-preview">
            <img src={previewUrl} alt="Preview" />
          </div>
        )}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Сохранение...' : 'Сохранить изменения'}
      </button>
    </form>
  );
};

export default EditProject; 