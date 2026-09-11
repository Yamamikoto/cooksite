import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm';
import styles from './EditPage.module.css';

function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const response = await fetch(`/api/recipes/${id}`);
      const data = await response.json();
      setRecipe(data);
    } catch (error) {
      console.error('Failed to fetch recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    const imageUrls = recipe.image_urls ? JSON.parse(recipe.image_urls) : [];

    // Upload new images
    for (const file of formData.imageFiles) {
      const url = await uploadFile(file);
      imageUrls.push(url);
    }

    let videoUrl = recipe.video_url;
    if (formData.videoFile) {
      videoUrl = await uploadFile(formData.videoFile);
    }

    const response = await fetch(`/api/recipes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.title,
        description: formData.description,
        ingredients: formData.ingredients,
        steps: formData.steps,
        category_id: formData.category_id || null,
        image_urls: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
        video_url: videoUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update recipe');
    }

    navigate(`/recipes/${id}`);
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

  if (loading) return <div className={styles.loading}>読み込み中...</div>;
  if (!recipe) return <div className={styles.notFound}>レシピが見つかりません</div>;

  return (
    <div className={styles.container}>
      <h1>レシピを編集</h1>
      <RecipeForm recipe={recipe} onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
    </div>
  );
}

export default EditPage;
