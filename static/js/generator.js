document.addEventListener("DOMContentLoaded", () => {
    const qrElement = document.getElementById("qrcode");
    if (!qrElement) return;

    // 1. Αρχικοποίηση QR Code με βελτιωμένες ρυθμίσεις εικόνας
    const qrCode = new QRCodeStyling({
        width: 300,
        height: 300,
        type: "svg",
        data: "https://qrforge.gr",
        image: "", 
        dotsOptions: {
            color: "#38bdf8", // Χρησιμοποιούμε το accent color ως default
            type: "rounded"
        },
        backgroundOptions: {
            color: "#ffffff",
        },
        imageOptions: {
            crossOrigin: "anonymous",
            margin: 5,
            hideBackgroundDots: true,
            imageSize: 0.4 // Σταθερό μέγεθος για τα logos στο κέντρο
        }
    });

    qrCode.append(qrElement);

    // --- ΛΕΙΤΟΥΡΓΙΑ LOGO SELECTION ---
    // Χρησιμοποιούμε window για να είναι προσβάσιμη από το HTML onclick
    window.setQRLogo = function(type) {
        let logoUrl = "";
        const logos = {
            'instagram': 'https://cdn-icons-png.flaticon.com/512/174/174855.png',
            'tiktok': 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png',
            'whatsapp': 'https://cdn-icons-png.flaticon.com/512/733/733585.png',
            'facebook': 'https://cdn-icons-png.flaticon.com/512/733/733547.png',
            'youtube': 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png'
        };
        
        logoUrl = logos[type] || "";
        
        qrCode.update({ 
            image: logoUrl,
            imageOptions: { imageSize: 0.4, margin: 5 }
        });

        // UI Update για το ποιο κουμπί είναι ενεργό
        document.querySelectorAll('.logo-opt').forEach(btn => btn.classList.remove('active'));
        if (window.event && window.event.currentTarget) {
            window.event.currentTarget.classList.add('active');
        }
    };

    // --- ΑΝΕΒΑΣΜΑ CUSTOM LOGO ΑΠΟ ΧΡΗΣΤΗ ---
    const userLogoInput = document.getElementById('user-logo');
    if (userLogoInput) {
        userLogoInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    qrCode.update({ 
                        image: event.target.result,
                        imageOptions: { imageSize: 0.4, margin: 5 }
                    });
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- RICH TEXT EDITOR (QUILL) ---
    const editorContainer = document.getElementById('editor-container');
    if (editorContainer && typeof Quill !== 'undefined') {
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
                    }
                })
                .catch(err => console.error("Error saving text:", err));
            }, 1000); 
        });
    }

    // --- ΑΠΛΟ INPUT (URL / USERNAME) ---
    const standardInput = document.getElementById("qr-data");
    if (standardInput) {
        standardInput.addEventListener("input", (e) => {
            qrCode.update({ data: e.target.value || "https://qrforge.gr" });
        });
    }

    // --- ΡΥΘΜΙΣΕΙΣ ΧΡΩΜΑΤΩΝ ΚΑΙ ΣΤΥΛ ---
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

    // --- ΑΝΕΒΑΣΜΑ ΑΡΧΕΙΩΝ (PDF, ZIP, IMAGE, MUSIC) ---
    const fileInput = document.getElementById('file-input');
    // Χρησιμοποιούμε το upload-zone class από το HTML σου
    const uploadZones = document.querySelectorAll('.upload-zone'); 
    
    if (fileInput) {
        fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Εύρεση του text μέσα στο upload zone για feedback
            const uploadText = e.target.parentElement.querySelector('p');
            if (uploadText) uploadText.innerText = "Ανεβάζει: " + file.name + "...";

            let formData = new FormData();
            formData.append('file', file);

            fetch('/upload', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => {
                if (data.url) {
                    qrCode.update({ data: data.url });
                    if (uploadText) uploadText.innerText = "Επιτυχία! " + file.name;
                }
            })
            .catch(err => {
                if (uploadText) uploadText.innerText = "Σφάλμα ανεβάσματος.";
                console.error(err);
            });
        });
    }

    // --- DOWNLOAD ---
    const downloadBtn = document.querySelector(".download-btn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            qrCode.download({ name: "qrforge-code", extension: "png" });
        });
    }
});