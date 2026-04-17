from flask import Flask, render_template
import base64

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/forge/<qr_type>')
def forge_generator(qr_type):
    # Δεχόμαστε url, social και text
    valid_types = ['url', 'social', 'text']
    
    if qr_type not in valid_types:
        qr_type = 'url'
        
    return render_template('forge.html', qr_type=qr_type)

@app.route('/view/<encoded_text>')
def view_text(encoded_text):
    try:
        # Διόρθωση padding για το Base64
        missing_padding = len(encoded_text) % 4
        if missing_padding:
            encoded_text += '=' * (4 - missing_padding)
            
        # Αποκωδικοποίηση από URL-safe Base64
        decoded_bytes = base64.urlsafe_b64decode(encoded_text)
        original_text = decoded_bytes.decode('utf-8')
    except Exception as e:
        original_text = "Το μήνυμα δεν μπόρεσε να διαβαστεί ή είναι κατεστραμμένο."
        
    # Χρησιμοποιούμε το 'content' για να ταιριάζει με το template που φτιάξαμε
    return render_template('view_text.html', content=original_text)

@app.route('/legal')
def legal():
    return render_template('legal.html')

if __name__ == '__main__':
    app.run(debug=True)