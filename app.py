import os
from flask import Flask, render_template, request, jsonify, url_for
from pymongo import MongoClient
from bson.objectid import ObjectId

app = Flask(__name__)

# --- ΣΥΝΔΕΣΗ ΜΕ MONGO DB ATLAS ---
# Χρησιμοποιούμε το δικό σου Connection String
MONGO_URI = "mongodb+srv://kmgeorgoudis_db_user:LKcu5a70s2zTeidM@cluster0.63qtir3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

try:
    # Σύνδεση με τη βάση
    client = MongoClient(MONGO_URI)
    db = client.qrforge
    texts_collection = db.texts
    # Έλεγχος αν η σύνδεση είναι ενεργή
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
    # Επιτρέπουμε μόνο τους τύπους που υποστηρίζουμε τώρα
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

        # Εισαγωγή στη βάση δεδομένων
        result = texts_collection.insert_one({'content': content})
        text_id = str(result.inserted_id)
        
        # Δημιουργία του URL που θα μπει στο QR code
        view_url = url_for('view_text', text_id=text_id, _external=True)
        return jsonify({'url': view_url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Προβολή του κειμένου (Η σελίδα που ανοίγει το QR)
@app.route('/view-text/<text_id>')
def view_text(text_id):
    try:
        # Αναζήτηση στη βάση με το ID της MongoDB (ObjectId)
        data = texts_collection.find_one({'_id': ObjectId(text_id)})
        
        if data:
            return render_template('view_text.html', content=data['content'])
        return "Το περιεχόμενο δεν βρέθηκε", 404
    except Exception:
        return "Μη έγκυρο ID περιεχομένου", 400

# --- ERROR HANDLERS ---
@app.errorhandler(404)
def page_not_found(e):
    return "Η σελίδα δεν βρέθηκε", 404

if __name__ == '__main__':
    # Χρήση debug=True για τοπικές δοκιμές
    app.run(debug=True)