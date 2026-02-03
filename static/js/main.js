/**
 * QRForge - Main Logic
 * Σύνδεση QR Styling, Quill Editor και File Uploads
 */

// 1. Καθολική Αρχικοποίηση QR Code
const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    type: "svg",
    data: "https://qrforge.gr",
    image: "",
    dotsOptions: {
        color: "#38bdf8",
        type: "rounded"
    },
    backgroundOptions: {
        color: "#ffffff",
    },
    imageOptions: {
        crossOrigin: "anonymous",
        margin: 5,
        hideBackgroundDots: true,
        imageSize: 0.4
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const qrElement = document.getElementById("qrcode");
    if (qrElement) {
        qrCode.append(qrElement);
    }

    // --- 2. SOCIAL LOGOS ---
    window.setQRLogo = function(type) {
        const logos = {
            'instagram': 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg',
            'tiktok': 'https://cdn.pixabay.com/photo/2021/06/15/12/28/tiktok-6338429_1280.png',
            'youtube': 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
            'whatsapp': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
            'facebook': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg'
        };

        const logoUrl = logos[type] || "";
        qrCode.update({
            image: logoUrl
        });

        // UI Update: Active state στα κουμπιά
        document.querySelectorAll('.logo-opt').forEach(btn => btn.classList.remove('active'));
        if (window.event && window.event.currentTarget) {
            window.event.currentTarget.classList.add('active');
        }
    };

    // --- 3. CUSTOM LOGO UPLOAD ---
    const userLogoInput = document.getElementById("user-logo");
    if (userLogoInput) {
        userLogoInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    qrCode.update({ image: event.target.result });
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- 4. DATA INPUTS (URL, TEXT, κλπ) ---
    const qrInput = document.getElementById("qr-data");
    if (qrInput) {
        qrInput.addEventListener("input", (e) => {
            qrCode.update({ data: e.target.value || "https://qrforge.gr" });
        });
    }

    // --- 5. RICH TEXT EDITOR (QUILL) ---
    // Περιμένουμε το Quill να αρχικοποιηθεί από το HTML
    setTimeout(() => {
        if (typeof quill !== 'undefined') {
            quill.on('text-change', function() {
                const text = quill.getText().trim();
                if (text.length > 0) {
                    // Εδώ στέλνουμε το κείμενο στο backend αν θέλουμε μόνιμο link
                    // Για τώρα ενημερώνουμε το QR απευθείας με το κείμενο
                    qrCode.update({ data: text });
                }
            });
        }
    }, 500);

    // --- 6. STYLE CONTROLS ---
    const dotColor = document.getElementById("dot-color");
    if (dotColor) {
        dotColor.addEventListener("input", (e) => {
            qrCode.update({ dotsOptions: { color: e.target.value } });
        });
    }

    const bgColor = document.getElementById("bg-color-input");
    if (bgColor) {
        bgColor.addEventListener("input", (e) => {
            qrCode.update({ backgroundOptions: { color: e.target.value } });
        });
    }

    const dotStyle = document.getElementById("dot-style");
    if (dotStyle) {
        dotStyle.addEventListener("change", (e) => {
            qrCode.update({ dotsOptions: { type: e.target.value } });
        });
    }

    // --- 7. FILE UPLOAD (PDF, ZIP, κλπ) ---
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            // Οπτικό feedback
            const uploadZone = document.querySelector('.upload-zone p');
            if (uploadZone) uploadZone.innerText = "Ανεβάζει: " + file.name;

            fetch('/upload', { method: 'POST', body: formData })
                .then(res => res.json())
                .then(data => {
                    if (data.url) {
                        qrCode.update({ data: data.url });
                        if (uploadZone) uploadZone.innerText = "Επιτυχία! Το QR ενημερώθηκε.";
                    }
                })
                .catch(err => {
                    console.error(err);
                    if (uploadZone) uploadZone.innerText = "Σφάλμα ανεβάσματος.";
                });
        });
    }

    // --- 8. DOWNLOAD ---
    const downloadBtn = document.querySelector(".download-btn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            qrCode.download({ name: "qrforge-code", extension: "png" });
        });
    }
});

// --- 9. NAVIGATION ---
function selectType(type) {
    window.location.href = "/forge/" + type;
}