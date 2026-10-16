
import "./FaceRecognition.css";

const FaceRecognition = ({
  imageUrl,
  boxes = []
}) => {
  return (
    <div className="recognition-area">
      {imageUrl && (
        <div className="recognition-frame">
          <img
            id="inputimage"
            className="recognition-image"
            src={imageUrl}
            alt="Uploaded image"
          />

          {boxes.map((box, index) => (
            <div
              key={index}
              className="bounding-box"
              style={{
                left: `${box.left}%`,
                top: `${box.top}%`,
                width: `${box.width}%`,
                height: `${box.height}%`
              }}
            >
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;
