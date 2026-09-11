import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm';
import styles from './CreatePage.module.css';

function CreatePage() {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    const imageUrls = [];
    const videoUrl = null;

    // Upload images
    for (const file of formData.imageFiles) {
      const url = await uploadFile(file);
      imageUrls.push(url);
    }

    let finalVideoUrl = videoUrl;
    if (formData.videoFile) {
      finalVideoUrl = await uploadFile(formData.videoFile);
    }

    const response = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: formData.title,
        description: formData.description,
        ingredients: formData.ingredients,
        steps: formData.steps,
        category_id: formData.category_id || null,
        image_urls: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
        video_url: finalVideoUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create recipe');
    }

    const data = await response.json();
    navigate('/recipes/' + data.id);
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    const data = await response.json();
    return data.url;
  };

  return (
    <div className={styles.container}>
      <h1>レシピを新規投稿</h1>
      <RecipeForm onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
    </div>
  );
}

export default CreatePage;
