// ===== Global variables =====
const fileInput = document.getElementById('fileInput');
const editor = document.getElementById('editor');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const fileIdInput = document.getElementById('fileId');

// ===== Event listeners =====
fileInput.addEventListener('change', handleFile);
saveBtn.addEventListener('click', saveDoc);
resetBtn.addEventListener('click', resetCounter);

// ===== Load counter.json (optional) =====
let counter = {};
fetch('counter.json')
  .then(r => r.ok ? r.json() : {})
  .then(json => counter = json)
  .catch(() => console.log('No counter.json found, using localStorage.'));

// ===== Handle DOCX upload =====
async function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.convertToHtml({ arrayBuffer });
  editor.innerHTML = value;

  const year = new Date().getFullYear();
  let local = JSON.parse(localStorage.getItem('docCounter')) || {};
  let x = 1;

  if (counter[year]) {
    x = counter[year] + 1;
  } else if (local[year]) {
    x = local[year] + 1;
  }

  counter[year] = x;
  local[year] = x;
  localStorage.setItem('docCounter', JSON.stringify(local));

  fileIdInput.value = `${x}/${year}`;
}

// ===== Save updated DOCX =====
async function saveDoc() {
  const text = editor.innerText.trim();
  const fileId = fileIdInput.value.trim() || "1/UnknownYear";

  const doc = new docx.Document({
    sections: [{
      children: [
        new docx.Paragraph({
          children: [
            new docx.TextRun({ text: `ID: ${fileId}`, bold: true }),
          ]
        }),
        new docx.Paragraph({ text })
      ]
    }]
  });

  const blob = await docx.Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `edited_${fileId.replace('/', '-')}.docx`;
  link.click();
}

// ===== Reset counter =====
function resetCounter() {
  if (confirm("Reset all counters?")) {
    localStorage.removeItem('docCounter');
    counter = {};
    alert("Counters reset.");
  }
}
