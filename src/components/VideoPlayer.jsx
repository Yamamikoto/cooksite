function VideoPlayer({ src, poster }) {
  if (!src) return null;

  return (
    <div style={{ width: '100%', marginBottom: '20px' }}>
      <video
        controls
        poster={poster}
        style={{ width: '100%', borderRadius: '8px' }}
      >
        <source src={src} type="video/mp4" />
        お使いのブラウザは動画タグをサポートしていません。
      </video>
    </div>
  );
}

export default VideoPlayer;
