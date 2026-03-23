/**
 * Chart export utilities - export charts as PNG or SVG
 */

export async function exportChartAsPng(
  chartElement: HTMLDivElement,
  filename: string = "chart.png",
  scale: number = 2
): Promise<void> {
  const svg = chartElement.querySelector("svg");
  if (!svg) return;

  const svgClone = svg.cloneNode(true) as SVGSVGElement;
  const bbox = svg.getBoundingClientRect();
  svgClone.setAttribute("width", String(bbox.width));
  svgClone.setAttribute("height", String(bbox.height));

  // Inline computed styles
  inlineStyles(svg, svgClone);

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgClone);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const canvas = document.createElement("canvas");
  canvas.width = bbox.width * scale;
  canvas.height = bbox.height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const img = new Image();
  img.onload = () => {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.download = filename;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    }, "image/png");
  };
  img.src = url;
}

export function exportChartAsSvg(
  chartElement: HTMLDivElement,
  filename: string = "chart.svg"
): void {
  const svg = chartElement.querySelector("svg");
  if (!svg) return;

  const svgClone = svg.cloneNode(true) as SVGSVGElement;
  const bbox = svg.getBoundingClientRect();
  svgClone.setAttribute("width", String(bbox.width));
  svgClone.setAttribute("height", String(bbox.height));
  svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  inlineStyles(svg, svgClone);

  const serializer = new XMLSerializer();
  const svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(svgClone);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const link = document.createElement("a");
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

function inlineStyles(source: SVGSVGElement, target: SVGSVGElement): void {
  const sourceChildren = source.querySelectorAll("*");
  const targetChildren = target.querySelectorAll("*");

  sourceChildren.forEach((el, i) => {
    if (!targetChildren[i]) return;
    const computed = window.getComputedStyle(el);
    const targetEl = targetChildren[i] as SVGElement;
    const importantStyles = ["fill", "stroke", "stroke-width", "font-size", "font-family", "opacity", "text-anchor", "dominant-baseline"];
    importantStyles.forEach((prop) => {
      const val = computed.getPropertyValue(prop);
      if (val) targetEl.style.setProperty(prop, val);
    });
  });
}

/** Generate a data URL for embedding in documents/presentations */
export async function chartToDataUrl(
  chartElement: HTMLDivElement,
  scale: number = 2
): Promise<string | null> {
  const svg = chartElement.querySelector("svg");
  if (!svg) return null;

  const svgClone = svg.cloneNode(true) as SVGSVGElement;
  const bbox = svg.getBoundingClientRect();
  svgClone.setAttribute("width", String(bbox.width));
  svgClone.setAttribute("height", String(bbox.height));
  inlineStyles(svg, svgClone);

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgClone);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = bbox.width * scale;
    canvas.height = bbox.height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) { resolve(null); return; }

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
