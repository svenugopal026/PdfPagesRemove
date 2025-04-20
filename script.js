let originalPdfBytes = null;
let totalPages = 0;

document.getElementById("pdfUpload").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Enable "Download Original"
  document.getElementById("downloadOriginalBtn").disabled = false;
  document.getElementById("removePagesBtn").disabled = false;

  const reader = new FileReader();
  reader.onload = async function () {
    originalPdfBytes = reader.result;

    const pdfDoc = await PDFLib.PDFDocument.load(originalPdfBytes);
    totalPages = pdfDoc.getPageCount();

    const pageSelector = document.getElementById("pageSelector");
    pageSelector.innerHTML = "<h3>Select Pages to Remove:</h3>";

    for (let i = 0; i < totalPages; i++) {
      const btn = document.createElement("div");
      btn.classList.add("page-btn");
      btn.textContent = `Page ${i + 1}`;
      btn.dataset.page = i;
      btn.addEventListener("click", () => btn.classList.toggle("selected"));
      pageSelector.appendChild(btn);
    }
  };

  reader.readAsArrayBuffer(file);

  // Save original for download
  const url = URL.createObjectURL(file);
  document.getElementById("downloadOriginalBtn").onclick = () => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "original.pdf";
    link.click();
  };
});

async function removeSelectedPages() {
  const selected = document.querySelectorAll(".page-btn.selected");
  const pagesToRemove = Array.from(selected).map(btn => parseInt(btn.dataset.page));
  const status = document.getElementById("status");

  if (!originalPdfBytes || pagesToRemove.length === 0) {
    status.textContent = "Please select pages to remove.";
    return;
  }

  const originalPdf = await PDFLib.PDFDocument.load(originalPdfBytes);
  const newPdf = await PDFLib.PDFDocument.create();

  for (let i = 0; i < totalPages; i++) {
    if (!pagesToRemove.includes(i)) {
      const [page] = await newPdf.copyPages(originalPdf, [i]);
      newPdf.addPage(page);
    }
  }

  const newPdfBytes = await newPdf.save();
  const blob = new Blob([newPdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "updated.pdf";
  link.click();

  status.textContent = "Downloaded updated PDF!";
}
