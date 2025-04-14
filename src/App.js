import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import Cookies from "js-cookie";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";

function App() {
  const pageRef = useRef();
  const [logo, setLogo] = useState(null);
  const [watermark, setWatermark] = useState(Cookies.get("watermark") || "");
  const [globalCount, setGlobalCount] = useState(0);
  const [links, setLinks] = useState({ github: "", linkedin: "", twitter: "" });

  const API_BASE = process.env.REACT_APP_API_BASE

  useEffect(() => {
    const savedLinks = Cookies.get("socialLinks");
    if (savedLinks) setLinks(JSON.parse(savedLinks));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/count`)
      .then((res) => res.json())
      .then((data) => setGlobalCount(data.value))
      .catch((err) => console.error("Failed to fetch count", err));
  }, []);

  const handleLinkChange = (e) => {
    const { name, value } = e.target;
    const updatedLinks = { ...links, [name]: value };
    setLinks(updatedLinks);
    Cookies.set("socialLinks", JSON.stringify(updatedLinks), { expires: 7 });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  };

  const handleWatermarkChange = (e) => {
    const value = e.target.value;
    setWatermark(value);
    Cookies.set("watermark", value, { expires: 7 });
  };

  const downloadImage = () => {
    html2canvas(pageRef.current).then((canvas) => {
      const link = document.createElement("a");
      link.download = "postcard.png";
      link.href = canvas.toDataURL();
      link.click();

      fetch(`${API_BASE}/count`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => setGlobalCount(data.value))
        .catch((err) => console.error("Failed to update count", err));
    });
  };

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
        minHeight: "100vh",
        padding: 30,
        display: "flex",
        gap: 40,
        color: "#333",
      }}
    >
      {/* Left Sidebar */}
      <div style={{ width: 260, display: "flex", flexDirection: "column" }}>
        <div>
          {/* Top Controls */}
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="logo-upload" style={buttonStyle}>➕ Add Logo</label>
            <input id="logo-upload" type="file" onChange={handleLogoUpload} style={{ display: "none" }} />
            <button onClick={downloadImage} style={buttonStyle}>⬇️ Download</button>
            <input
              type="text"
              placeholder="Watermark"
              value={watermark}
              onChange={handleWatermarkChange}
              style={{ ...inputStyle, marginTop: 10, background: "#fff" }}
            />
          </div>

          {/* Formatting Toolbar */}
          <div style={{ marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={toolbarBtn} onClick={() => document.execCommand("bold")}><b>B</b></button>
            <button style={toolbarBtn} onClick={() => document.execCommand("italic")}><i>I</i></button>
            <button style={toolbarBtn} onClick={() => document.execCommand("underline")}><u>U</u></button>
            <select style={toolbarBtn} onChange={(e) => document.execCommand("fontSize", false, e.target.value)}>
              <option value="3">Font Size</option>
              <option value="1">Small</option>
              <option value="3">Normal</option>
              <option value="5">Large</option>
              <option value="7">Huge</option>
            </select>
            <input
              type="color"
              title="Text Color"
              style={{ border: "none", cursor: "pointer", height: 30, width: 40 }}
              onChange={(e) => document.execCommand("foreColor", false, e.target.value)}
            />
          </div>

          {/* Social Links */}
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.8)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ marginBottom: 12, color: "#444" }}>🔗 Your Links</h3>
            <input name="github" placeholder="GitHub" value={links.github} onChange={handleLinkChange} style={inputStyle} />
            <input name="linkedin" placeholder="LinkedIn" value={links.linkedin} onChange={handleLinkChange} style={inputStyle} />
            <input name="twitter" placeholder="X / Twitter" value={links.twitter} onChange={handleLinkChange} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Right Main Area */}
      <div style={{ flexGrow: 1 }}>
        <p style={{ fontSize: 14, color: "#444", marginBottom: 12 }}>
          🎉 <strong>{globalCount}</strong> postcards created by awesome users!
        </p>

        <div
          ref={pageRef}
          style={{
            maxWidth: 720,
            margin: "0 auto",
            borderRadius: 16,
            border: "1px solid #eee",
            background: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            padding: 30,
            position: "relative",
            minHeight: 480,
            color: "#000",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: 40,
              color: "rgba(0,0,0,0.08)",
              userSelect: "none",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontStyle: watermark ? "normal" : "italic", opacity: watermark ? 1 : 0.6 }}>
              {watermark || "🔏 Add your watermark..."}
            </span>
          </div>

          {logo && (
            <img
              src={logo}
              alt="logo"
              style={{ width: 60, position: "absolute", top: 20, right: 20 }}
            />
          )}

          <div
            contentEditable
            suppressContentEditableWarning
            style={{ zIndex: 1, position: "relative", flexGrow: 1, fontSize: 18, outline: "none", minHeight: 200 }}
          >
            <p>✍️ Write your message here...</p>
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "center",
              gap: 20,
              borderTop: "1px solid #ddd",
              paddingTop: 10,
              fontSize: 14,
              color: "#555",
            }}
          >
            {links.github && (
              <a href={links.github} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                <FaGithub style={iconStyle} /> GitHub
              </a>
            )}
            {links.linkedin && (
              <a href={links.linkedin} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                <FaLinkedin style={{ ...iconStyle, color: "#0072b1" }} /> LinkedIn
              </a>
            )}
            {links.twitter && (
              <a href={links.twitter} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                <FaXTwitter style={iconStyle} /> X
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  marginBottom: 10,
  padding: "8px 12px",
  width: "100%",
  fontSize: 14,
  borderRadius: 8,
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "8px 14px",
  background: "#ffffffcc",
  border: "1px solid #ccc",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
  display: "block",
  marginBottom: 10,
};

const toolbarBtn = {
  padding: "6px 10px",
  border: "1px solid #bbb",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
};

const linkStyle = {
  textDecoration: "none",
  color: "#000",
  display: "flex",
  alignItems: "center",
};

const iconStyle = {
  marginRight: 6,
  verticalAlign: "middle",
};

export default App;