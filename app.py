from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/forge/<type>')
def forge(type):
    # Δεχόμαστε μόνο url ή social
    valid_types = ['url', 'social']
    if type not in valid_types:
        type = 'url'
    return render_template('forge.html', qr_type=type)

@app.route('/legal')
def legal():
    return render_template('legal.html')
@app.route('/forge/<qr_type>')
def forge(qr_type):
    # Εδώ απλά περνάμε τον τύπο στο template
    return render_template('forge.html', qr_type=qr_type)

if __name__ == '__main__':
    app.run(debug=True)