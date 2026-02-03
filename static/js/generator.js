/**
 * QRForge - Generator Logic (Stable Edition)
 * Clean version: No MongoDB, No SSL errors.
 */
document.addEventListener("DOMContentLoaded", () => {
    const qrElement = document.getElementById("qrcode");
    if (!qrElement) return;

    // 1. Αρχικοποίηση QR Code με premium ρυθμίσεις
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

    qrCode.append(qrElement);

    // --- 2. ΛΕΙΤΟΥΡΓΙΑ SOCIAL LOGO SELECTION ---
    window.setQRLogo = function(type, element) {
        const logos = {
            'instagram': 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg',
            'tiktok': 'https://cdn.pixabay.com/photo/2021/06/15/12/28/tiktok-6338429_1280.png',
            'youtube': 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
            'whatsapp': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
            'facebook': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg'
        };
        
        const logoUrl = logos[type] || "";
        qrCode.update({ image: logoUrl });

        // UI Update: Active state στα εικονίδια
        document.querySelectorAll('.logo-opt').forEach(btn => btn.classList.remove('active'));
        if (element) {
            element.classList.add('active');
        }
    };

    // --- 2.1 ΣΥΝΔΕΣΗ ΤΩΝ CLICKS ΣΤΑ SOCIAL BUTTONS ---
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

    // --- 4. ΑΠΛΟ INPUT (URL / SOCIAL) ---
    const standardInput = document.getElementById("qr-data");
    if (standardInput) {
        standardInput.addEventListener("input", (e) => {
            qrCode.update({ data: e.target.value || "https://qrforge.gr" });
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
    const downloadBtn = document.getElementById("download-btn") || document.querySelector(".download-btn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            qrCode.download({ name: "qrforge-code", extension: "png" });
        });
    }
});