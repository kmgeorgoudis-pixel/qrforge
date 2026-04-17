/**
 * QRForge - Main Logic (Final Clean Edition)
 * Υποστήριξη: URL, Social & Text Viewer (Base64)
 */

// 1. Καθολική Αρχικοποίηση QR Code Styling
const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    type: "svg",
    data: "QRForge",
    image: "",
    dotsOptions: {
        color: "#6366f1",
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
    window.setQRLogo = function(type, element) {
        const logos = {
            'instagram': 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg',
            'tiktok': '/static/img/tiktok.png',
            'youtube': 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
            'whatsapp': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
            'facebook': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg'
        };

        const logoUrl = logos[type] || "";
        qrCode.update({ image: logoUrl });

        document.querySelectorAll('.logo-opt').forEach(btn => btn.classList.remove('active'));
        if (element) {
            element.classList.add('active');
        }
    };

    document.querySelectorAll('.logo-opt').forEach(button => {
        button.addEventListener('click', function() {
            const socialType = this.getAttribute('data-social');
            window.setQRLogo(socialType, this);
        });
    });

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

    // --- 4. ΕΝΙΑΙΑ ΔΙΑΧΕΙΡΙΣΗ INPUT (URL & TEXT FORGE) ---
    const qrInput = document.getElementById("qr-data");
    if (qrInput) {
        qrInput.addEventListener("input", (e) => {
            const val = e.target.value.trim();
            
            // Έλεγχος αν είμαστε στη σελίδα Text Forge
            if (window.location.pathname.includes('/text')) {
                if (val === "") {
                    qrCode.update({ data: "QRForge" });
                } else {
                    // Μετατροπή σε Base64 ασφαλές για URL (Υποστήριξη Ελληνικών)
                    const encoded = btoa(unescape(encodeURIComponent(val)))
                                    .replace(/\+/g, '-')
                                    .replace(/\//g, '_')
                                    .replace(/=+$/, ''); 
                    
                    const viewerUrl = window.location.origin + "/view/" + encoded;
                    qrCode.update({ data: viewerUrl });
                }
            } else {
                // Για URL και Social Forge
                qrCode.update({ data: val || "https://qrforge-n7ol.onrender.com" });
            }
        });
    }

    // --- 5. STYLE CONTROLS ---
    document.getElementById("dot-color")?.addEventListener("input", (e) => {
        qrCode.update({ dotsOptions: { color: e.target.value } });
    });

    document.getElementById("bg-color-input")?.addEventListener("input", (e) => {
        qrCode.update({ backgroundOptions: { color: e.target.value } });
    });

    document.getElementById("dot-style")?.addEventListener("change", (e) => {
        qrCode.update({ dotsOptions: { type: e.target.value } });
    });

    // --- 6. DOWNLOAD ---
    document.getElementById("download-btn")?.addEventListener("click", () => {
        qrCode.download({ name: "qrforge-code", extension: "png" });
    });
});