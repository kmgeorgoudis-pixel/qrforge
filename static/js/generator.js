document.addEventListener("DOMContentLoaded", () => {
    const qrElement = document.getElementById("qrcode");
    if (!qrElement) return;

    // 1. Αρχικοποίηση QR Code
    const qrCode = new QRCodeStyling({
        width: 300,
        height: 300,
        type: "svg",
        data: "https://qrforge.gr",
        image: "", 
        dotsOptions: {
            color: "#0f172a",
            type: "rounded"
        },
        backgroundOptions: {
            color: "#ffffff",
        },
        imageOptions: {
            crossOrigin: "anonymous",
            margin: 5,
            hideBackgroundDots: true 
        }
    });

    qrCode.append(qrElement);

    // --- ΛΕΙΤΟΥΡΓΙΑ LOGO SELECTION ---
    window.setQRLogo = function(type) {
        let logoUrl = "";
        if (type === 'instagram') logoUrl = "https://cdn-icons-png.flaticon.com/512/174/174855.png";
        if (type === 'tiktok') logoUrl = "https://cdn-icons-png.flaticon.com/512/3046/3046121.png";
        if (type === 'whatsapp') logoUrl = "https://cdn-icons-png.flaticon.com/512/733/733585.png";
        if (type === 'facebook') logoUrl = "https://cdn-icons-png.flaticon.com/512/733/733547.png";
        
        qrCode.update({ image: logoUrl });
        document.querySelectorAll('.logo-opt').forEach(btn => btn.classList.remove('active'));
        if (event) event.currentTarget.classList.add('active');
    };

    const userLogoInput = document.getElementById('user-logo');
    if (userLogoInput) {
        userLogoInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    qrCode.update({ image: event.target.result });
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- RICH TEXT EDITOR (QUILL) ---
    const editorContainer = document.getElementById('editor-container');
    if (editorContainer) {
        var quill = new Quill('#editor-container', { 
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['clean']
                ]
            }
        });

        let typingTimer;
        quill.on('text-change', () => {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                const fullHTML = quill.root.innerHTML;

                fetch('/save-text', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: fullHTML })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.url) {
                        qrCode.update({ data: data.url });
                        console.log("QR updated with link: " + data.url);
                    }
                });
            }, 1000); 
        });
    }

    // --- ΑΠΛΟ INPUT (URL κλπ) ---
    const standardInput = document.getElementById("qr-data");
    if (standardInput) {
        standardInput.addEventListener("input", (e) => {
            qrCode.update({ data: e.target.value || " " });
        });
    }

    // --- ΕΠΙΛΟΓΕΣ ΕΜΦΑΝΙΣΗΣ (ΧΡΩΜΑΤΑ/ΣΤΥΛ) ---
    const dotColorPicker = document.getElementById("dot-color");
    if (dotColorPicker) {
        dotColorPicker.addEventListener("input", (e) => {
            qrCode.update({ dotsOptions: { color: e.target.value } });
        });
    }

    const bgColorPicker = document.getElementById("bg-color-input");
    if (bgColorPicker) {
        bgColorPicker.addEventListener("input", (e) => {
            qrCode.update({ backgroundOptions: { color: e.target.value } });
        });
    }

    const styleSelector = document.getElementById("dot-style");
    if (styleSelector) {
        styleSelector.addEventListener("change", (e) => {
            qrCode.update({ dotsOptions: { type: e.target.value } });
        });
    }

    // --- ΑΝΕΒΑΣΜΑ ΑΡΧΕΙΩΝ ---
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    if (dropZone && fileInput) {
        dropZone.onclick = () => fileInput.click();
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const status = document.getElementById('file-status');
            if (status) status.innerText = "Ανεβάζει: " + file.name;
            let formData = new FormData();
            formData.append('file', file);
            fetch('/upload', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => {
                if (data.url) {
                    qrCode.update({ data: data.url });
                    if (status) status.innerText = "Επιτυχία! Το QR είναι έτοιμο.";
                }
            });
        };
    }

    // --- DOWNLOAD ---
    const downloadBtn = document.querySelector(".download-btn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            qrCode.download({ name: "qrforge-code", extension: "png" });
        });
    }
});