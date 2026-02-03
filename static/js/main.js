/**
 * QRForge - Main Logic (Cloud Edition)
 * Σύνδεση QR Styling, Quill Editor και MongoDB Atlas
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

        // UI Update: Active state
        document.querySelectorAll('.logo-opt').forEach(btn => btn.classList.remove('active'));
        if (element) {
            element.classList.add('active');
        }
    };

    // --- 2.1 ΣΥΝΔΕΣΗ CLICKS ΣΤΑ SOCIAL BUTTONS (Η ΔΙΟΡΘΩΣΗ) ---
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

    // --- 4. URL & SOCIAL INPUTS ---
    const qrInput = document.getElementById("qr-data");
    if (qrInput) {
        qrInput.addEventListener("input", (e) => {
            qrCode.update({ data: e.target.value || "https://qrforge.gr" });
        });
    }

    // --- 5. RICH TEXT SAVE (MONGODB) ---
    const saveTextBtn = document.getElementById("save-text-btn");
    if (saveTextBtn && typeof quill !== 'undefined') {
        saveTextBtn.addEventListener("click", () => {
            const htmlContent = quill.root.innerHTML;
            
            saveTextBtn.innerText = "ΑΠΟΘΗΚΕΥΣΗ...";
            saveTextBtn.disabled = true;

            fetch('/save-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: htmlContent })
            })
            .then(res => res.json())
            .then(data => {
                if (data.url) {
                    qrCode.update({ data: data.url });
                    saveTextBtn.innerText = "ΕΠΙΤΥΧΙΑ! ✅";
                    saveTextBtn.style.background = "#22c55e";
                } else {
                    alert("Σφάλμα κατά την αποθήκευση.");
                    saveTextBtn.innerText = "ΔΟΚΙΜΑΣΤΕ ΞΑΝΑ";
                    saveTextBtn.disabled = false;
                }
            })
            .catch(err => {
                console.error(err);
                saveTextBtn.innerText = "ΣΦΑΛΜΑ ΣΥΝΔΕΣΗΣ";
                saveTextBtn.disabled = false;
            });
        });
    }

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

    // --- 7. DOWNLOAD ---
    const downloadBtn = document.getElementById("download-btn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            qrCode.download({ name: "qrforge-code", extension: "png" });
        });
    }
});