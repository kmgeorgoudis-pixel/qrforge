import os
import certifi
from flask import Flask, render_template, request, jsonify, url_for
from pymongo import MongoClient
from bson.objectid import ObjectId

app = Flask(__name__)

# --- ΣΥΝΔΕΣΗ ΜΕ MONGO DB ATLAS ---
# Δοκιμάζουμε χωρίς SSL verification και με άμεσο string
MONGO_URI = "mongodb+srv://kmgeorgoudis_db_user:LKcu5a70s2zTeidM@cluster0.63qtir3.mongodb.net/qrforge?retryWrites=true&w=majority"

# --- ΣΥΝΔΕΣΗ ΜΕ MONGO DB ATLAS (Direct Mode) ---
MONGO_URI = "mongodb://kmgeorgoudis_db_user:LKcu5a70s2zTeidM@ac-uogfoiv-shard-00-00.63qtir3.mongodb.net:27017,ac-uogfoiv-shard-00-01.63qtir3.mongodb.net:27017,ac-uogfoiv-shard-00-02.63qtir3.mongodb.net:27017/qrforge?ssl=true&replicaSet=atlas-m9v3v1-shard-0&authSource=admin&retryWrites=true&w=majority"

try:
    client = MongoClient(
        MONGO_URI,
        tls=True,
        tlsAllowInvalidCertificates=True
    )
    db = client.get_database("qrforge")
    texts_collection = db.texts
    
    # Force ping
    client.admin.command('ping')
    print("✅ Επιτυχής σύνδεση στη MongoDB Atlas!")
except Exception as e:
    print(f"❌ Σφάλμα σύνδεσης στη MongoDB: {e}")

# --- ROUTES ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/forge/<type>')
def forge(type):
    valid_types = ['url', 'social', 'text']
    if type not in valid_types:
        type = 'url'
    return render_template('forge.html', qr_type=type)

@app.route('/legal')
def legal():
    return render_template('legal.html')

# Αποθήκευση Rich Text στη MongoDB
@app.route('/save-text', methods=['POST'])
def save_text():
    try:
        data = request.get_json()
        content = data.get('content')
        
        if not content:
            return jsonify({'error': 'Το περιεχόμενο είναι κενό'}), 400

        # Εισαγωγή στη βάση
        result = texts_collection.insert_one({'content': content})
        text_id = str(result.inserted_id)
        
        # Δημιουργία του URL για το QR
        view_url = url_for('view_text', text_id=text_id, _external=True)
        return jsonify({'url': view_url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Προβολή του κειμένου (Η σελίδα που ανοίγει το QR)
@app.route('/view-text/<text_id>')
def view_text(text_id):
    try:
        data = texts_collection.find_one({'_id': ObjectId(text_id)})
        if data:
            return render_template('view_text.html', content=data['content'])
        return "Το περιεχόμενο δεν βρέθηκε", 404
    except Exception:
        return "Μη έγκυρο ID περιεχομένου", 400

# --- ERROR HANDLERS ---
@app.errorhandler(404)
def page_not_found(e):
    return "Η σελίδα δεν βρέθηκε (404)", 404

if __name__ == '__main__':
    app.run(debug=True)