// Chart export utilities. Wraps html-to-image with an Oracle Bull watermark
// applied via a temporary overlay so exports carry brand attribution.
import { toPng, toSvg } from "html-to-image";

const WATERMARK_TEXT = "oraclebull.com";

function addWatermark(node: HTMLElement) {
  const mark = document.createElement("div");
  mark.setAttribute("data-oracle-watermark", "true");
  mark.textContent = WATERMARK_TEXT;
  Object.assign(mark.style, {
    position: "absolute",
    right: "12px",
    bottom: "8px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.02em",
    color: "rgba(0,0,0,0.35)",
    pointerEvents: "none",
    zIndex: "999",
  } as CSSStyleDeclaration);
  const prevPosition = node.style.position;
  if (!prevPosition || prevPosition === "static") node.style.position = "relative";
  node.appendChild(mark);
  return () => {
    node.removeChild(mark);
    if (!prevPosition) node.style.position = "";
  };
}

function download(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function exportChartPNG(node: HTMLElement, filename: string) {
  const cleanup = addWatermark(node);
  try {
    const dataUrl = await toPng(node, {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      cacheBust: true,
    });
    download(dataUrl, filename.endsWith(".png") ? filename : `${filename}.png`);
  } finally {
    cleanup();
  }
}

export async function exportChartSVG(node: HTMLElement, filename: string) {
  const cleanup = addWatermark(node);
  try {
    const dataUrl = await toSvg(node, {
      backgroundColor: "#ffffff",
      cacheBust: true,
    });
    download(dataUrl, filename.endsWith(".svg") ? filename : `${filename}.svg`);
  } finally {
    cleanup();
  }
}