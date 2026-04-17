from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/forge/<qr_type>')
def forge_generator(qr_type):
    # Δεχόμαστε πλέον url, social και text
    valid_types = ['url', 'social', 'text']
    
    if qr_type not in valid_types:
        qr_type = 'url'
        
    return render_template('forge.html', qr_type=qr_type)

@app.route('/legal')
def legal():
    return render_template('legal.html')
import base64

@app.route('/view/<encoded_text>')
def view_text(encoded_text):
    try:
        # Αποκωδικοποίηση του κειμένου από το URL
        decoded_bytes = base64.urlsafe_b64decode(encoded_text)
        original_text = decoded_bytes.decode('utf-8')
    except:
        original_text = "Σφάλμα κατά την ανάγνωση του μηνύματος."
        
    return render_template('view_text.html', message=original_text)

if __name__ == '__main__':
    app.run(debug=True)