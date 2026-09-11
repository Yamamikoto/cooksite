import { useState } from 'react';
import styles from './RecipeForm.module.css';

function RecipeForm({ recipe, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: recipe?.title || '',
    description: recipe?.description || '',
    ingredients: recipe?.ingredients || '',
    steps: recipe?.steps || '',
    category_id: recipe?.category_id || '',
    imageFiles: [],
    videoFile: null,
  });
  const [images, setImages] = useState(
    recipe?.image_urls ? JSON.parse(recipe.image_urls) : []
  );
  const [videoUrl, setVideoUrl] = useState(recipe?.video_url || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, imageFiles: files }));
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, videoFile: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await onSubmit({ ...formData, images, videoUrl });
    } catch (error) {
      setErrors({ general: error.message || 'エラーが発生しました' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="title">タイトル</label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="レシピのタイトル"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description">説明</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="レシピの簡単な説明"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="category_id">カテゴリ</label>
        <select
          id="category_id"
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
        >
          <option value="">選択してください</option>
          <option value="1">和食</option>
          <option value="2">洋食</option>
          <option value="3">中華</option>
          <option value="4">デザート</option>
          <option value="5">ドリンク</option>
          <option value="6">その他</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="ingredients">材料</label>
        <textarea
          id="ingredients"
          name="ingredients"
          value={formData.ingredients}
          onChange={handleChange}
          rows={5}
          required
          placeholder="材料を改行で区切って入力してください"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="steps">作り方</label>
        <textarea
          id="steps"
          name="steps"
          value={formData.steps}
          onChange={handleChange}
          rows={10}
          required
          placeholder="作り方をステップごとに記述してください"
        />
      </div>

      <div className={styles.field}>
        <label>画像アップロード</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
        />
        {images.length > 0 && (
          <div className={styles.imageList}>
            {images.map((url, index) => (
              <img key={index} src={url} alt={`画像${index + 1}`} />
            ))}
          </div>
        )}
      </div>

      <div className={styles.field}>
        <label>動画アップロード（任意）</label>
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
        />
        {videoUrl && (
          <video src={videoUrl} controls className={styles.videoPreview} />
        )}
      </div>

      {errors.general && <div className={styles.error}>{errors.general}</div>}

      <div className={styles.actions}>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            キャンセル
          </button>
        )}
        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? '送信中...' : recipe ? '更新する' : '投稿する'}
        </button>
      </div>
    </form>
  );
}

export default RecipeForm;
