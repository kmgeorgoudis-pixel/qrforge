/**
 * QRForge - Generator Logic (Stable Edition)
 * Updated: Support for Text Forge & Local TikTok Logo
 */
document.addEventListener("DOMContentLoaded", () => {
    const qrElement = document.getElementById("qrcode");
    if (!qrElement) return;

    // 1. Αρχικοποίηση QR Code με premium ρυθμίσεις
    const qrCode = new QRCodeStyling({
        width: 300,
        height: 300,
        type: "svg",
        data: "QRForge", // Αρχικό κείμενο
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

    qrCode.append(qrElement);

    // --- 2. ΛΕΙΤΟΥΡΓΙΑ SOCIAL LOGO SELECTION ---
    window.setQRLogo = function(type, element) {
        const logos = {
            'instagram': 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg',
            'tiktok': '/static/img/tiktok.png', // Τοπικό αρχείο
            'youtube': 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
            'whatsapp': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
            'facebook': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg'
        };
        
        const logoUrl = logos[type] || "";
        
        qrCode.update({ 
            image: logoUrl,
            imageOptions: {
                imageSize: 0.4 
            }
        });

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

    // --- 3. ΑΝΕΒΑΣΜΑ CUSTOM LOGO ΑΠΟ ΧΡΗΣΤΗ ---
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

    // --- 4. INPUT ΔΙΑΧΕΙΡΙΣΗ (URL / TEXT) ---
    const standardInput = document.getElementById("qr-data");
    if (standardInput) {
        standardInput.addEventListener("input", (e) => {
            const val = e.target.value.trim();
            
            // Αν είναι άδειο, βάζουμε ένα default κείμενο για να μην χαλάει το preview
            const fallback = "QRForge";
            qrCode.update({ data: val || fallback });
        });
    }

    // --- 5. ΡΥΘΜΙΣΕΙΣ ΧΡΩΜΑΤΩΝ ΚΑΙ ΣΤΥΛ ---
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

    // --- 6. DOWNLOAD ---
    const downloadBtn = document.getElementById("download-btn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            qrCode.download({ name: "qrforge-code", extension: "png" });
        });
    }
});