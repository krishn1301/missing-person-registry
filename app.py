from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
from datetime import datetime
import json
from functools import wraps

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.secret_key = 'your-secret-key-here'  # Required for flash messages and sessions

# Configure upload folder
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/auth/login', methods=['POST'])
def auth_login():
    user_id = request.form.get('userId')
    password = request.form.get('password')
    
    if user_id and password:
        # Here you would typically verify against your database
        session['user_id'] = user_id
        return redirect(url_for('home'))
    
    flash('Invalid credentials')
    return redirect(url_for('login'))

@app.route('/auth/signup', methods=['POST'])
def auth_signup():
    phone = request.form.get('phone')
    user_id = request.form.get('userId')
    password = request.form.get('password')
    confirm_password = request.form.get('confirmPassword')
    
    if not all([phone, user_id, password, confirm_password]):
        flash('All fields are required')
        return redirect(url_for('signup'))
    
    if password != confirm_password:
        flash('Passwords do not match')
        return redirect(url_for('signup'))
    
    # Here you would typically save to your database
    session['user_id'] = user_id
    return redirect(url_for('home'))

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    """API endpoint for login from React frontend"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        password = data.get('password')
        
        if not user_id or not password:
            return jsonify({'error': 'User ID and password are required'}), 400
        
        # Load users from file
        users_file = 'data/users.json'
        users = []
        if os.path.exists(users_file):
            with open(users_file, 'r') as f:
                users = json.load(f)
        
        # Find user and verify password
        user = next((u for u in users if u['user_id'] == user_id), None)
        if not user or user['password'] != password:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        return jsonify({
            'message': 'Login successful',
            'user_id': user_id,
            'isLoggedIn': True
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/signup', methods=['POST'])
def api_signup():
    """API endpoint for signup from React frontend"""
    try:
        data = request.get_json()
        phone = data.get('phone')
        user_id = data.get('userId')
        password = data.get('password')
        confirm_password = data.get('confirmPassword')
        
        if not all([phone, user_id, password, confirm_password]):
            return jsonify({'error': 'All fields are required'}), 400
        
        if password != confirm_password:
            return jsonify({'error': 'Passwords do not match'}), 400
        
        # Save user data (in a real app, you'd use a database)
        users_file = 'data/users.json'
        os.makedirs('data', exist_ok=True)
        
        users = []
        if os.path.exists(users_file):
            with open(users_file, 'r') as f:
                users = json.load(f)
        
        # Check if user already exists
        if any(u['user_id'] == user_id for u in users):
            return jsonify({'error': 'User ID already exists'}), 400
        
        # Add new user
        users.append({
            'id': len(users) + 1,
            'phone': phone,
            'user_id': user_id,
            'password': password,  # In production, hash this!
            'created_at': datetime.now().isoformat()
        })
        
        with open(users_file, 'w') as f:
            json.dump(users, f)
        
        return jsonify({'message': 'User created successfully', 'user_id': user_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/home')
@login_required
def home():
    # Load missing persons reports from JSON file
    reports = []
    try:
        with open('data/reports.json', 'r') as f:
            reports = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        pass
    
    return render_template('home.html', reports=reports, user_id=session.get('user_id'))

@app.route('/registration-details')
@login_required
def registration_details():
    return render_template('registration_details.html')

@app.route('/submit-details', methods=['POST'])
@login_required
def submit_details():
    if 'photo' not in request.files:
        flash('No file part')
        return redirect(url_for('registration_details'))
    
    file = request.files['photo']
    if file.filename == '':
        flash('No selected file')
        return redirect(url_for('registration_details'))
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Create new report
        new_report = {
            'id': int(datetime.now().timestamp()),
            'name': request.form.get('personName'),
            'age': int(request.form.get('age')),
            'height': int(request.form.get('height')),
            'lastSeen': request.form.get('lastSeen'),
            'location': request.form.get('place'),
            'image': f'/static/uploads/{filename}'
        }
        
        # Load existing reports
        reports = []
        try:
            with open('data/reports.json', 'r') as f:
                reports = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            pass
        
        # Add new report and save
        reports.append(new_report)
        os.makedirs('data', exist_ok=True)
        with open('data/reports.json', 'w') as f:
            json.dump(reports, f)
        
        flash('Report submitted successfully')
        return redirect(url_for('home'))
    
    flash('Invalid file type')
    return redirect(url_for('registration_details'))

@app.route('/api/auth/admin-login', methods=['POST'])
def api_admin_login():
    """API endpoint for admin login"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        password = data.get('password')
        
        if not user_id or not password:
            return jsonify({'error': 'User ID and password are required'}), 400
        
        # Check admin credentials
        admin_creds = [
            {'user_id': 'admin', 'password': 'admin123'},
            {'user_id': 'admin1', 'password': 'password123'}
        ]
        
        admin = next((a for a in admin_creds if a['user_id'] == user_id and a['password'] == password), None)
        if not admin:
            return jsonify({'error': 'Invalid admin credentials'}), 401
        
        return jsonify({
            'message': 'Admin login successful',
            'user_id': user_id,
            'isAdmin': True
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/pending', methods=['GET'])
def get_pending_reports():
    """Get all pending reports and updates"""
    try:
        pending_file = 'data/pending_reports.json'
        pending_reports = []
        
        if os.path.exists(pending_file):
            with open(pending_file, 'r') as f:
                pending_reports = json.load(f)
        
        return jsonify(pending_reports), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/approve/<int:report_id>', methods=['POST'])
def approve_report(report_id):
    """Admin approves a pending report"""
    try:
        pending_file = 'data/pending_reports.json'
        approved_file = 'data/reports.json'
        
        # Load pending reports
        pending_reports = []
        if os.path.exists(pending_file):
            with open(pending_file, 'r') as f:
                pending_reports = json.load(f)
        
        # Find and remove the approved report
        report = next((r for r in pending_reports if r['id'] == report_id), None)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        pending_reports.remove(report)
        
        # Save updated pending reports
        os.makedirs('data', exist_ok=True)
        with open(pending_file, 'w') as f:
            json.dump(pending_reports, f)
        
        # Add to approved reports
        approved_reports = []
        if os.path.exists(approved_file):
            with open(approved_file, 'r') as f:
                approved_reports = json.load(f)
        
        report['status'] = 'approved'
        report['approved_at'] = datetime.now().isoformat()
        approved_reports.append(report)
        
        with open(approved_file, 'w') as f:
            json.dump(approved_reports, f)
        
        return jsonify({'message': 'Report approved successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/reject/<int:report_id>', methods=['POST'])
def reject_report(report_id):
    """Admin rejects a pending report"""
    try:
        pending_file = 'data/pending_reports.json'
        
        # Load pending reports
        pending_reports = []
        if os.path.exists(pending_file):
            with open(pending_file, 'r') as f:
                pending_reports = json.load(f)
        
        # Find and remove the rejected report
        report = next((r for r in pending_reports if r['id'] == report_id), None)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        pending_reports.remove(report)
        
        # Save updated pending reports
        os.makedirs('data', exist_ok=True)
        with open(pending_file, 'w') as f:
            json.dump(pending_reports, f)
        
        return jsonify({'message': 'Report rejected successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/report-info/submit', methods=['POST'])
def submit_report_info():
    """Submit new information about a missing person"""
    try:
        data = request.get_json()
        report_id = data.get('report_id')
        info_text = data.get('info')
        submitted_by = data.get('submitted_by')
        
        if not all([report_id, info_text, submitted_by]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Create info update
        info_update = {
            'id': int(datetime.now().timestamp() * 1000),
            'report_id': report_id,
            'info': info_text,
            'submitted_by': submitted_by,
            'status': 'pending',
            'submitted_at': datetime.now().isoformat()
        }
        
        # Load pending info updates
        info_file = 'data/pending_info_updates.json'
        info_updates = []
        if os.path.exists(info_file):
            with open(info_file, 'r') as f:
                info_updates = json.load(f)
        
        info_updates.append(info_update)
        
        # Save info updates
        os.makedirs('data', exist_ok=True)
        with open(info_file, 'w') as f:
            json.dump(info_updates, f)
        
        return jsonify({'message': 'Information submitted for review', 'id': info_update['id']}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/report-info/approve/<int:info_id>', methods=['POST'])
def approve_info(info_id):
    """Admin approves new information"""
    try:
        info_file = 'data/pending_info_updates.json'
        approved_info_file = 'data/approved_info_updates.json'
        
        # Load pending info updates
        info_updates = []
        if os.path.exists(info_file):
            with open(info_file, 'r') as f:
                info_updates = json.load(f)
        
        # Find and remove the approved info
        info = next((i for i in info_updates if i['id'] == info_id), None)
        if not info:
            return jsonify({'error': 'Info not found'}), 404
        
        info_updates.remove(info)
        
        # Save updated pending info
        os.makedirs('data', exist_ok=True)
        with open(info_file, 'w') as f:
            json.dump(info_updates, f)
        
        # Add to approved info
        approved_info = []
        if os.path.exists(approved_info_file):
            with open(approved_info_file, 'r') as f:
                approved_info = json.load(f)
        
        info['status'] = 'approved'
        info['approved_at'] = datetime.now().isoformat()
        approved_info.append(info)
        
        with open(approved_info_file, 'w') as f:
            json.dump(approved_info, f)
        
        return jsonify({'message': 'Information approved successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/report-info/<int:report_id>', methods=['GET'])
def get_report_info(report_id):
    """Get all approved information for a report"""
    try:
        info_file = 'data/approved_info_updates.json'
        info_updates = []
        
        if os.path.exists(info_file):
            with open(info_file, 'r') as f:
                all_info = json.load(f)
                info_updates = [i for i in all_info if i['report_id'] == report_id]
        
        return jsonify(info_updates), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports')
def get_reports():
    search_term = request.args.get('search', '').lower()
    try:
        with open('data/reports.json', 'r') as f:
            reports = json.load(f)
            if search_term:
                reports = [r for r in reports if 
                          search_term in r['name'].lower() or 
                          search_term in r['location'].lower()]
            return jsonify(reports)
    except (FileNotFoundError, json.JSONDecodeError):
        return jsonify([])

@app.route('/api/reports/submit', methods=['POST'])
def submit_report():
    """User submits a missing person report"""
    try:
        person_name = request.form.get('personName')
        age = request.form.get('age')
        height = request.form.get('height')
        last_seen = request.form.get('lastSeen')
        place = request.form.get('place')
        submitted_by = request.form.get('submitted_by')
        
        if not all([person_name, age, height, last_seen, place, submitted_by]):
            return jsonify({'error': 'All fields are required'}), 400
        
        # Handle image
        image_data = None
        if 'photo' in request.files:
            file = request.files['photo']
            if file and file.filename:
                # Convert to base64
                import base64
                image_data = base64.b64encode(file.read()).decode('utf-8')
                image_data = f"data:image/{file.filename.split('.')[-1]};base64,{image_data}"
        
        # Create report
        report = {
            'id': int(datetime.now().timestamp() * 1000),
            'name': person_name,
            'age': int(age),
            'height': int(height),
            'lastSeen': last_seen,
            'location': place,
            'image': image_data or '',
            'submitted_by': submitted_by,
            'status': 'pending',
            'submitted_at': datetime.now().isoformat()
        }
        
        # Save to pending reports
        pending_file = 'data/pending_reports.json'
        pending_reports = []
        if os.path.exists(pending_file):
            with open(pending_file, 'r') as f:
                pending_reports = json.load(f)
        
        pending_reports.append(report)
        
        os.makedirs('data', exist_ok=True)
        with open(pending_file, 'w') as f:
            json.dump(pending_reports, f)
        
        return jsonify({'message': 'Report submitted successfully', 'report_id': report['id']}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/reports', methods=['GET'])
def admin_get_all_reports():
    """Admin view all approved reports"""
    try:
        reports_file = 'data/reports.json'
        reports = []
        
        if os.path.exists(reports_file):
            with open(reports_file, 'r') as f:
                reports = json.load(f)
        
        return jsonify(reports), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/reports/<int:report_id>', methods=['DELETE'])
def admin_delete_report(report_id):
    """Admin delete a report"""
    try:
        reports_file = 'data/reports.json'
        reports = []
        
        if os.path.exists(reports_file):
            with open(reports_file, 'r') as f:
                reports = json.load(f)
        
        # Find and remove the report
        report = next((r for r in reports if r['id'] == report_id), None)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        reports.remove(report)
        
        # Save updated reports
        os.makedirs('data', exist_ok=True)
        with open(reports_file, 'w') as f:
            json.dump(reports, f)
        
        # Also delete associated approved info updates
        info_file = 'data/approved_info_updates.json'
        if os.path.exists(info_file):
            with open(info_file, 'r') as f:
                info_updates = json.load(f)
            
            # Remove info for this report
            info_updates = [i for i in info_updates if i.get('report_id') != report_id]
            
            with open(info_file, 'w') as f:
                json.dump(info_updates, f)
        
        return jsonify({'message': 'Report and associated information deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/reports/<int:report_id>', methods=['PUT'])
def admin_update_report(report_id):
    """Admin update report details"""
    try:
        data = request.get_json()
        reports_file = 'data/reports.json'
        
        reports = []
        if os.path.exists(reports_file):
            with open(reports_file, 'r') as f:
                reports = json.load(f)
        
        # Find and update the report
        report = next((r for r in reports if r['id'] == report_id), None)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        # Update allowed fields
        if 'name' in data:
            report['name'] = data['name']
        if 'age' in data:
            report['age'] = data['age']
        if 'height' in data:
            report['height'] = data['height']
        if 'location' in data:
            report['location'] = data['location']
        if 'lastSeen' in data:
            report['lastSeen'] = data['lastSeen']
        
        report['updated_at'] = datetime.now().isoformat()
        
        # Save updated reports
        os.makedirs('data', exist_ok=True)
        with open(reports_file, 'w') as f:
            json.dump(reports, f)
        
        return jsonify({'message': 'Report updated successfully', 'report': report}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/report-info/add', methods=['POST'])
def admin_add_report_info():
    """Admin add information directly to a report"""
    try:
        data = request.get_json()
        report_id = data.get('report_id')
        info_text = data.get('info')
        admin_id = data.get('admin_id')
        
        if not all([report_id, info_text, admin_id]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Create info update
        info_update = {
            'id': int(datetime.now().timestamp() * 1000),
            'report_id': report_id,
            'info': info_text,
            'submitted_by': f'[ADMIN] {admin_id}',
            'status': 'approved',
            'submitted_at': datetime.now().isoformat(),
            'approved_at': datetime.now().isoformat()
        }
        
        # Load approved info updates
        info_file = 'data/approved_info_updates.json'
        info_updates = []
        if os.path.exists(info_file):
            with open(info_file, 'r') as f:
                info_updates = json.load(f)
        
        info_updates.append(info_update)
        
        # Save info updates
        os.makedirs('data', exist_ok=True)
        with open(info_file, 'w') as f:
            json.dump(info_updates, f)
        
        return jsonify({'message': 'Information added successfully', 'id': info_update['id']}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/report-info/<int:info_id>', methods=['DELETE'])
def admin_delete_report_info(info_id):
    """Admin delete approved information"""
    try:
        info_file = 'data/approved_info_updates.json'
        
        info_updates = []
        if os.path.exists(info_file):
            with open(info_file, 'r') as f:
                info_updates = json.load(f)
        
        # Find and remove the info
        info = next((i for i in info_updates if i['id'] == info_id), None)
        if not info:
            return jsonify({'error': 'Information not found'}), 404
        
        info_updates.remove(info)
        
        # Save updated info
        os.makedirs('data', exist_ok=True)
        with open(info_file, 'w') as f:
            json.dump(info_updates, f)
        
        return jsonify({'message': 'Information deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pending-info', methods=['GET'])
def get_pending_info():
    """Get all pending information updates for admin review"""
    try:
        info_file = 'data/pending_info_updates.json'
        info_updates = []
        
        if os.path.exists(info_file):
            with open(info_file, 'r') as f:
                info_updates = json.load(f)
        
        return jsonify(info_updates), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)