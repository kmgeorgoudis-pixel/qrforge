import os
import uuid
import json
from flask import Flask, render_template, request, jsonify, url_for
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Ρυθμίσεις φακέλων
UPLOAD_FOLDER = 'static/uploads'
TEXTS_FOLDER = 'static/texts'

for folder in [UPLOAD_FOLDER, TEXTS_FOLDER]:
    if not os.path.exists(folder):
        os.makedirs(folder)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/forge/<type>')
def forge(type):
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
        filename = secure_filename(file.filename)
        # Προσθήκη μοναδικού ID στο όνομα για να μην γίνονται overwrite
        unique_name = f"{uuid.uuid4().hex[:8]}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_name)
        file.save(file_path)
        
        file_url = url_for('static', filename='uploads/' + unique_name, _external=True)
        return jsonify({'url': file_url})

# 2. Αποθήκευση Μορφοποιημένου Κειμένου (Rich Text)
@app.route('/save-text', methods=['POST'])
def save_text():
    data = request.json
    content = data.get('content')
    if not content:
        return jsonify({'error': 'Κενό περιεχόμενο'}), 400

    # Δημιουργία μοναδικού ID για το κείμενο
    text_id = str(uuid.uuid4())[:8]
    file_path = os.path.join(TEXTS_FOLDER, f"{text_id}.json")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump({'content': content}, f, ensure_ascii=False)
    
    # Επιστρέφουμε το URL που θα γίνει QR
    view_url = url_for('view_text', text_id=text_id, _external=True)
    return jsonify({'url': view_url})

# 3. Προβολή του κειμένου όταν κάποιος σκανάρει το QR
@app.route('/view-text/<text_id>')
def view_text(text_id):
    file_path = os.path.join(TEXTS_FOLDER, f"{text_id}.json")
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        # Χρησιμοποιούμε ένα απλό template για την προβολή
        return render_template('view_text.html', content=data['content'])
    return "Το κείμενο δεν βρέθηκε", 404

if __name__ == '__main__':
    app.run(debug=True)