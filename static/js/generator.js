/**
 * QRForge - Generator Logic (MongoDB Atlas Edition)
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
    window.setQRLogo = function(type) {
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
        if (window.event && window.event.currentTarget) {
            window.event.currentTarget.classList.add('active');
        }
    };

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

    // --- 4. RICH TEXT EDITOR (QUILL) -> MONGODB ---
    // Χρησιμοποιούμε το κουμπί "Οριστικοποίηση" για σιγουριά, 
    // ή το typingTimer που είχες για αυτόματη αποθήκευση.
    const saveTextBtn = document.getElementById("save-text-btn");
    
    if (typeof quill !== 'undefined') {
        // Αν θέλεις αυτόματη αποθήκευση καθώς γράφει:
        let typingTimer;
        quill.on('text-change', () => {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                const fullHTML = quill.root.innerHTML;
                if (quill.getText().trim().length === 0) return;

                fetch('/save-text', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: fullHTML })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.url) {
                        qrCode.update({ data: data.url });
                        console.log("Saved to Cloud!");
                    }
                })
                .catch(err => console.error("Error saving to MongoDB:", err));
            }, 1200); // Περιμένει 1.2 δευτερόλεπτα αφού σταματήσει η πληκτρολόγηση
        });
    }

    // --- 5. ΑΠΛΟ INPUT (URL / SOCIAL) ---
    const standardInput = document.getElementById("qr-data");
    if (standardInput) {
        standardInput.addEventListener("input", (e) => {
            qrCode.update({ data: e.target.value || "https://qrforge.gr" });
        });
    }

    // --- 6. ΡΥΘΜΙΣΕΙΣ ΧΡΩΜΑΤΩΝ ΚΑΙ ΣΤΥΛ ---
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

    // --- 7. DOWNLOAD ---
    const downloadBtn = document.getElementById("download-btn") || document.querySelector(".download-btn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            qrCode.download({ name: "qrforge-code", extension: "png" });
        });
    }
});