/**
 * QRForge - Main Logic (Stable Edition)
 * Υποστήριξη: URL, Social & Text Forge 
 */

// 1. Καθολική Αρχικοποίηση QR Code Styling
const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    type: "svg",
    data: "QRForge", // Αρχική τιμή
    image: "",
    dotsOptions: {
        color: "#6366f1", // Το premium μωβ/μπλε χρώμα σου
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

    // --- 2. SOCIAL LOGOS (Με τοπικό TikTok) ---
    window.setQRLogo = function(type, element) {
        const logos = {
            'instagram': 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg',
            'tiktok': '/static/img/tiktok.png', // Τοπικό αρχείο για ταχύτητα και αξιοπιστία
            'youtube': 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
            'whatsapp': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
            'facebook': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg'
        };

        const logoUrl = logos[type] || "";
        qrCode.update({ 
            image: logoUrl,
            imageOptions: { imageSize: 0.4 }
        });

        // UI Update: Active state για τα κουμπιά
        document.querySelectorAll('.logo-opt').forEach(btn => btn.classList.remove('active'));
        if (element) {
            element.classList.add('active');
        }
    };

    // Σύνδεση clicks στα Social Buttons
    document.querySelectorAll('.logo-opt').forEach(button => {
        button.addEventListener('click', function() {
            const socialType = this.getAttribute('data-social');
            window.setQRLogo(socialType, this);
        });
    });

    // --- 3. CUSTOM LOGO UPLOAD (Από τον χρήστη) ---
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

    // --- 4. DATA INPUT (URL & TEXT FORGE) ---
    const qrInput = document.getElementById("qr-data");
    if (qrInput) {
        qrInput.addEventListener("input", (e) => {
            const val = e.target.value.trim();
            // Χρησιμοποιούμε "QRForge" ως fallback για να παραμένει το QR γεμάτο
            qrCode.update({ data: val || "QRForge" });
        });
    }

    // --- 5. STYLE CONTROLS (Χρώματα & Σχήματα) ---
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

    // --- 6. DOWNLOAD PNG ---
    const downloadBtn = document.getElementById("download-btn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            qrCode.download({ name: "qrforge-code", extension: "png" });
        });
    }
});