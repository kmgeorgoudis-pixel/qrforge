import os
import certifi  # <--- Προσθήκη αυτής της βιβλιοθήκης
from flask import Flask, render_template, request, jsonify, url_for
from pymongo import MongoClient
from bson.objectid import ObjectId

app = Flask(__name__)

# --- ΣΥΝΔΕΣΗ ΜΕ MONGO DB ATLAS ---
MONGO_URI = "mongodb+srv://kmgeorgoudis_db_user:LKcu5a70s2zTeidM@cluster0.63qtir3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

try:
    # Προσθέτουμε το tlsCAFile=certifi.where() για να λυθεί το SSL error
    client = MongoClient(MONGO_URI, tlsCAFile=certifi.where()) 
    db = client.qrforge
    texts_collection = db.texts
    
    # Έλεγχος αν η σύνδεση είναι ενεργή
    client.admin.command('ping')
    print("✅ Επιτυχής σύνδεση στη MongoDB Atlas!")
except Exception as e:
    print(f"❌ Σφάλμα σύνδεσης στη MongoDB: {e}")

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