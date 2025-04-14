

<<<<<<< HEAD

=======
>>>>>>> 6e8971ffd686bea13ecd3a3e58b3d65f9392d7d1
import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Cookies from "js-cookie";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";

function App() {
  const pageRef = useRef();
  const [logo, setLogo] = useState(null);
  const [background, setBackground] = useState(null);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [watermark, setWatermark] = useState(Cookies.get("watermark") || "");
  const [globalCount, setGlobalCount] = useState(0);
  const [format, setFormat] = useState("png");
  const [size, setSize] = useState("medium");
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

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBackground(reader.result);
    reader.readAsDataURL(file);
  };

  const handleWatermarkChange = (e) => {
    const value = e.target.value;
    setWatermark(value);
    Cookies.set("watermark", value, { expires: 7 });
  };

  const handleDownload = () => {
    html2canvas(pageRef.current, {
      backgroundColor: null,
      useCORS: true,
    }).then((canvas) => {
      const imageData = canvas.toDataURL(`image/${format === "jpg" ? "jpeg" : "png"}`);

      if (format === "pdf") {
        const pdf = new jsPDF("p", "mm", "a4");
        const imgProps = pdf.getImageProperties(imageData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imageData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("postcard.pdf");
      } else {
        const link = document.createElement("a");
        link.href = imageData;
        link.download = `postcard.${format}`;
        link.click();
      }

      fetch(`${API_BASE}/count`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => setGlobalCount(data.value))
        .catch((err) => console.error("Failed to update count", err));
    });
  };

  const sizeMap = {
    small: 360,
    medium: 480,
    large: 600,
  };

  const watermarkFontSize = {
    small: 28,
    medium: 40,
    large: 52,
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)", minHeight: "100vh", padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{ width: "100%", maxWidth: 1080, display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 12 }}>
          <label htmlFor="logo-upload" style={{ ...buttonStyle, width: "50%" }}>➕ Add Logo</label>
          <input id="logo-upload" type="file" onChange={handleLogoUpload} style={{ display: "none" }} />

          <label htmlFor="background-upload" style={{ ...buttonStyle, width: "50%" }}>🌄 Add Background</label>
          <input id="background-upload" type="file" onChange={handleBackgroundUpload} style={{ display: "none" }} />

          <label style={{ display: "block" }}>🎨 Background Color</label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ marginBottom: 8 }} />

          <label>🧾 File Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)} style={inputStyle}>
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="pdf">PDF</option>
          </select>

          <label>📐 Card Size</label>
          <select value={size} onChange={(e) => setSize(e.target.value)} style={inputStyle}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>

          <input type="text" placeholder="Watermark" value={watermark} onChange={handleWatermarkChange} style={inputStyle} />

          <button onClick={handleDownload} style={{ ...buttonStyle, marginTop: 10 }}>⬇️ Download</button>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
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
            <input type="color" title="Text Color" style={{ border: "none", cursor: "pointer", height: 30, width: 40 }} onChange={(e) => document.execCommand("foreColor", false, e.target.value)} />
          </div>
        </div>

        <div style={{ flex: 2, minWidth: 300 }}>
          <p style={{ fontSize: 14, color: "#444", marginBottom: 12 }}>🎉 <strong>{globalCount}</strong> postcards created by awesome users!</p>
          <div ref={pageRef} style={{ maxWidth: 720, width: sizeMap[size], margin: "0 auto", borderRadius: 16, border: "1px solid #eee", backgroundImage: background ? `url(${background})` : "none", backgroundSize: "cover", backgroundPosition: "center", backgroundColor: background ? "transparent" : bgColor, boxShadow: "0 10px 30px rgba(0,0,0,0.1)", padding: 30, position: "relative", minHeight: 480, color: "#000", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: watermarkFontSize[size], color: "rgba(0,0,0,0.08)", userSelect: "none", pointerEvents: "none", whiteSpace: "nowrap" }}>
              <span style={{ fontStyle: watermark ? "normal" : "italic", opacity: watermark ? 1 : 0.6 }}>{watermark || "🔏 Add your watermark..."}</span>
            </div>
            {logo && <img src={logo} alt="logo" style={{ width: 60, position: "absolute", top: 20, right: 20 }} />}
            <div contentEditable suppressContentEditableWarning style={{ zIndex: 1, position: "relative", flexGrow: 1, fontSize: 18, outline: "none", minHeight: 200 }}>
              <p>✍️ Write your message here...</p>
            </div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 20, borderTop: "1px solid #ddd", paddingTop: 10, fontSize: 14, color: "#555" }}>
              {links.github && <a href={links.github} target="_blank" rel="noopener noreferrer" style={linkStyle}><FaGithub style={iconStyle} /> GitHub</a>}
              {links.linkedin && <a href={links.linkedin} target="_blank" rel="noopener noreferrer" style={linkStyle}><FaLinkedin style={{ ...iconStyle, color: "#0072b1" }} /> LinkedIn</a>}
              {links.twitter && <a href={links.twitter} target="_blank" rel="noopener noreferrer" style={linkStyle}><FaXTwitter style={iconStyle} /> X</a>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  marginBottom: 8,
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
