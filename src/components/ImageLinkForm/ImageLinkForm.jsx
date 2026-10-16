
const ImageLinkForm = ({
  input,
  busy,
  onInputChange,
  onButtonSubmit,
  onFileChange
}) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onButtonSubmit();
  };

  return (
    <div className="pa3">
      <p className="f3 tc">
        SmartBrain Person Detection
      </p>

      <p className="tc">
        輸入圖片網址，或直接從電腦上傳圖片
      </p>

      <form
        onSubmit={handleSubmit}
        className="center"
        style={{
          display: "flex",
          gap: "8px",
          maxWidth: "720px"
        }}
      >
        <input
          type="text"
          value={input}
          onChange={onInputChange}
          disabled={busy}
          placeholder="Enter image URL"
          style={{
            flex: 1,
            minWidth: 0,
            padding: "10px"
          }}
        />

        <button
          type="submit"
          disabled={busy}
          className="f4 link ph3 pv2 white bg-light-purple"
        >
          Detect
        </button>
      </form>

      <div className="mt3 tc">
        <label htmlFor="imageUpload">
          上傳圖片（JPG、PNG、WebP）：
        </label>

        <input
          id="imageUpload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileChange}
          disabled={busy}
          className="ma2"
        />
      </div>
    </div>
  );
};

export default ImageLinkForm;
