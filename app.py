import os
import uuid
import json
from flask import Flask, render_template, request, jsonify, url_for
from werkzeug.utils import secure_filename

app = Flask(__name__)

# --- ΡΥΘΜΙΣΕΙΣ ΑΣΦΑΛΕΙΑΣ & ΦΑΚΕΛΩΝ ---
UPLOAD_FOLDER = 'static/uploads'
TEXTS_FOLDER = 'static/texts'
# Περιορισμός μεγέθους αρχείου στα 16MB
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 

# Δημιουργία φακέλων αν δεν υπάρχουν
for folder in [UPLOAD_FOLDER, TEXTS_FOLDER]:
    if not os.path.exists(folder):
        os.makedirs(folder)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- ROUTES ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/forge/<type>')
def forge(type):
    # Έλεγχος αν ο τύπος είναι έγκυρος (προαιρετικά)
    valid_types = ['url', 'text', 'social', 'pdf', 'image', 'music', 'zip']
    if type not in valid_types:
        type = 'url'
    return render_template('forge.html', qr_type=type)

# 1. Upload για Αρχεία (Images, PDFs, κλπ)
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'Δεν βρέθηκε αρχείο'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Δεν επιλέχθηκε αρχείο'}), 400

    if file:
        # Καθαρισμός ονόματος και προσθήκη UUID για αποφυγή overwrites
        original_name = secure_filename(file.filename)
        unique_id = uuid.uuid4().hex[:8]
        filename = f"{unique_id}_{original_name}"
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Επιστροφή του πλήρους URL για το QR
        file_url = url_for('static', filename='uploads/' + filename, _external=True)
        return jsonify({'url': file_url})

# 2. Αποθήκευση Rich Text από τον Quill Editor
@app.route('/save-text', methods=['POST'])
def save_text():
    data = request.get_json()
    if not data or 'content' not in data:
        return jsonify({'error': 'Κενό περιεχόμενο'}), 400

    content = data.get('content')

    # Δημιουργία μοναδικού ID για τη σελίδα κειμένου
    text_id = uuid.uuid4().hex[:10]
    file_path = os.path.join(TEXTS_FOLDER, f"{text_id}.json")
    
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump({'content': content}, f, ensure_ascii=False)
        
        # Το URL που θα κωδικοποιηθεί στο QR
        view_url = url_for('view_text', text_id=text_id, _external=True)
        return jsonify({'url': view_url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 3. Η σελίδα προβολής του κειμένου (Scan Result)
@app.route('/view-text/<text_id>')
def view_text(text_id):
    file_path = os.path.join(TEXTS_FOLDER, f"{text_id}.json")
    
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return render_template('view_text.html', content=data['content'])
        except Exception:
            return "Σφάλμα κατά την ανάγνωση του αρχείου", 500
            
    return "Το περιεχόμενο δεν βρέθηκε ή έχει διαγραφεί", 404

# --- ERROR HANDLERS ---
@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'error': 'Το αρχείο είναι πολύ μεγάλο (Max 16MB)'}), 413

if __name__ == '__main__':
    # Χρήση 0.0.0.0 για να είναι προσβάσιμο στο τοπικό δίκτυο από κινητό για test
    app.run(host='0.0.0.0', port=5000, debug=True)