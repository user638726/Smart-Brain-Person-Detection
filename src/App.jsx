import { Component } from "react";
import { pipeline, RawImage } from "@huggingface/transformers";
import SignIn from "./components/SignIn/SignIn.jsx";
import Register from "./components/Register/Register.js";
import Navigation from "./components/Navigation/Navigation.jsx";
import Logo from "./components/Logo/Logo.jsx";
import Rank from "./components/Rank/Rank.jsx";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm.jsx";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition.jsx";
import ParticlesBg from "particles-bg";

import "./App.css";

// 模型只載入一次
let detectorPromise = null;

function getDetector() {
  if (!detectorPromise) {
    detectorPromise = pipeline("object-detection", "Xenova/detr-resnet-50", {
      device: "wasm",
      dtype: "q8",
    }).catch((error) => {
      detectorPromise = null;
      throw error;
    });
  }

  return detectorPromise;
}

const MAX_FILE_SIZE = 8 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const initialState = {
      input: "",
      imageUrl: "",
      boxes: [],
      busy: false,
      status: "",
      error: "",
      route: "signin",
      isSignedIn: false,
      user: {
        id: "",
        name: "",
        email: "",
        entries: 0,
        joined: "",
      },
    };


class App extends Component {
  constructor(props) {
    super(props);

    this.state = initialState

    this.previewUrl = null;
    this.jobId = 0;
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
      },
    });
  };
  componentWillUnmount() {
    this.jobId++;

    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }

  // 取得圖片網址輸入
  onInputChange = (event) => {
    this.setState({
      input: event.target.value,
    });
  };

  // 開始新的辨識工作
  beginJob = (message) => {
    const id = ++this.jobId;

    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }

    this.setState({
      imageUrl: "",
      boxes: [],
      busy: true,
      status: message,
      error: "",
    });

    return id;
  };

  // 統一處理錯誤
  handleError = (error, id) => {
    if (id !== this.jobId) return;

    console.error("SmartBrain Error:", error);

    this.setState({
      busy: false,
      status: "",
      error: error.message || "圖片辨識失敗",
    });
  };

  // 核心功能：辨識 Blob 或 File 圖片
  detectImage = async (blob, id) => {
    try {
      if (!ALLOWED_TYPES.includes(blob.type)) {
        throw new Error("只支援 JPG、PNG、WebP 圖片");
      }

      if (blob.size > MAX_FILE_SIZE) {
        throw new Error("圖片不能超過 8 MB");
      }

      if (blob.size === 0) {
        throw new Error("圖片檔案是空的");
      }

      // 建立本機預覽網址
      const preview = URL.createObjectURL(blob);

      if (id !== this.jobId) {
        URL.revokeObjectURL(preview);
        return;
      }

      this.previewUrl = preview;

      this.setState({
        imageUrl: preview,
        status: "正在載入 AI 模型...",
      });

      // 同時載入模型與解碼圖片
      const [detector, image] = await Promise.all([
        getDetector(),
        RawImage.fromBlob(blob),
      ]);

      if (id !== this.jobId) return;

      this.setState({
        status: "正在辨識圖片中的人物...",
      });

      // Hugging Face 本機推論
      const predictions = await detector(image, {
        threshold: 0.5,
      });

      if (id !== this.jobId) return;

      console.log("AI Results:", predictions);

      // 只取得 person
      const persons = predictions.filter(
        (item) => item.label === "person" && item.box,
      );

      // 將模型座標換算成百分比
      const boxes = persons.map((person) => {
        const { xmin, ymin, xmax, ymax } = person.box;

        const left = clamp(xmin, 0, image.width);
        const top = clamp(ymin, 0, image.height);
        const right = clamp(xmax, left, image.width);
        const bottom = clamp(ymax, top, image.height);

        return {
          left: (left / image.width) * 100,
          top: (top / image.height) * 100,
          width: ((right - left) / image.width) * 100,
          height: ((bottom - top) / image.height) * 100,
          score: person.score,
        };
      });

      this.setState({
        boxes,
        busy: false,
        status: `辨識完成：找到 ${boxes.length} 位人物`,
        error: "",
      });

      console.log("Bounding Boxes:", boxes);
    } catch (error) {
      this.handleError(error, id);
    }
  };

  // 功能一：上傳電腦中的圖片
  onFileChange = (event) => {
    const file = event.target.files?.[0];

    // 允許下次重新選擇相同檔案
    event.target.value = "";

    if (!file) return;

    const id = this.beginJob("正在讀取圖片...");

    this.setState({ input: "" });

    this.detectImage(file, id);
  };

  // 功能二：從圖片網址進行辨識
  onButtonSubmit = async () => {
    const input = this.state.input.trim();

    if (!input) {
      this.setState({
        error: "請輸入圖片網址",
      });
      return;
    }

    const id = this.beginJob("正在下載圖片...");

    try {
      const url = new URL(input, window.location.origin);

      // 遠端圖片只接受 HTTPS
      // 本機開發網址允許 HTTP
      const isAllowed =
        url.protocol === "https:" || url.origin === window.location.origin;

      if (!isAllowed) {
        throw new Error("請使用 HTTPS 圖片網址或本機圖片");
      }

      const response = await fetch(url.href);
      if (response) {
        fetch("http://localhost:3000/image", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: this.state.user.id,
          }),
        })
          .then((response) => response.json())
          .then((count) => {
            this.setState((prevState) => ({
              user: {
                ...prevState.user,
                entries: count,
              },
            }));
          }).catch(err=>console.log(err));
      }
      if (!response.ok) {
        throw new Error(`圖片下載失敗：HTTP ${response.status}`);
      }

      const blob = await response.blob();

      if (id !== this.jobId) return;

      await this.detectImage(blob, id);
    } catch (error) {
      this.handleError(error, id);
    }
  };
  onRouteChange = (route) => {
    if (route === "signout") {
      this.setState(initialState);
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };
  render() {
    const { input, imageUrl, boxes, busy, status, error, isSignedIn } =
      this.state;

    return (
      <div className="App">
        <ParticlesBg type="cobweb" color="#2563eb" bg={true} />

        <Navigation
          isSignedIn={isSignedIn}
          onRouteChange={this.onRouteChange}
        />
        {this.state.route === "home" ? (
          <div>
            <Logo />

            <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />

            <ImageLinkForm
              input={input}
              busy={busy}
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
              onFileChange={this.onFileChange}
            />

            {busy && (
              <p className="tc" role="status">
                {status}
              </p>
            )}

            {!busy && status && (
              <p className="tc" role="status">
                {status}
              </p>
            )}

            {error && (
              <p className="tc" role="alert" style={{ color: "red" }}>
                {error}
              </p>
            )}

            <FaceRecognition imageUrl={imageUrl} boxes={boxes} />
          </div>
        ) : this.state.route === "signin" ? (
          <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        ) : (
          <Register
            loadUser={this.loadUser}
            onRouteChange={this.onRouteChange}
          />
        )}
      </div>
    );
  }
}

export default App;
