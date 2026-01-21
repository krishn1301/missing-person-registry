# Missing Person Registry

A full-stack web application for reporting and tracking missing persons with an admin approval system. This platform enables users to file reports about missing individuals and allows administrators to review, approve, and manage these reports with additional information updates from the community.

## 🎯 Features

- **User Authentication**: Secure login system for both regular users and administrators
- **Report Submission**: Users can file missing person reports with details (name, age, height, last seen location, photo)
- **Admin Dashboard**: Comprehensive control panel with three tabs:
  - **Pending Reports**: Review and approve/reject new missing person reports
  - **Approved Reports**: View all published missing person cases
  - **Pending Information**: Manage community-submitted tips and information
- **Information Submission**: Users can submit and update information about missing persons cases
- **Admin Approval Workflow**: Multi-step approval process ensures report quality and accuracy
- **Real-time Updates**: Backend-persistent storage with instant data synchronization
- **Credential-based Access**: Single login page with automatic role detection (admin/user)

## 🛠 Tech Stack

### Frontend
- **React** 18.3.1
- **TypeScript** 5.6
- **Vite** 5.4.16 (Build tool)
- **React Router** 6.30.0 (Routing)
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)

### Backend
- **Flask** 3.0.2
- **Python** 3.13.2
- **Flask-CORS** (Cross-origin requests)
- **JSON** (Data persistence)

## 📋 Prerequisites

- Node.js 16+ and npm
- Python 3.10+
- Git

## 🚀 Installation

### Clone the Repository
```bash
git clone https://github.com/krishn1301/missing-person-registry.git
cd missing-person-registry
```

### Backend Setup
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Frontend Setup
```bash
# Install dependencies
npm install
```

## 🏃 Running the Project

### Start Backend (Flask)
```bash
python app.py
```
Backend will run on `http://localhost:5000`

### Start Frontend (Vite) - In a new terminal
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

### Access the Application
Open your browser and navigate to: **http://localhost:5173**

## 🔐 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| User (Test) | `krishn` | `123456789` |

## 📂 Project Structure

```
project/
├── app.py                          # Flask backend
├── package.json                    # Frontend dependencies
├── requirements.txt                # Backend dependencies
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── data/
│   ├── users.json                  # User accounts
│   ├── reports.json                # Approved/published reports
│   ├── pending_reports.json        # Reports awaiting admin approval
│   ├── approved_info_updates.json  # Approved community information
│   └── pending_info_updates.json   # Information awaiting approval
├── src/
│   ├── App.tsx                     # Main app component and routing
│   ├── Registration.tsx            # Login page (admin + user)
│   ├── HomePage.tsx                # User dashboard with approved reports
│   ├── RegistrationDetails.tsx     # Form to file missing person reports
│   ├── AdminDashboard.tsx          # Admin control panel
│   ├── AdminLogin.tsx              # Deprecated admin login
│   ├── SignUp.tsx                  # User registration
│   ├── ReportInfoModal.tsx         # Modal for submitting case information
│   └── main.tsx                    # React entry point
├── static/
│   ├── css/                        # Additional styles
│   └── uploads/                    # Image uploads directory
└── templates/                      # Legacy HTML templates (for Flask)
```

## 🔄 Workflow

### For Users
1. **Sign Up**: Create a new account with phone number, user ID, and password
2. **Login**: Use credentials to access the user dashboard
3. **File Report**: Submit missing person report with details and photo
4. **Submit Information**: Add tips or information about existing cases
5. **View Reports**: Browse approved missing person cases

### For Admins
1. **Login**: Use admin credentials to access admin dashboard
2. **Review Pending Reports**: Check new missing person reports in queue
3. **Approve/Reject**: Decide whether to publish reports
4. **Review Information**: Moderate community-submitted tips
5. **Manage Cases**: Track approved reports and pending information

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/signup` - User registration

### Reports
- `POST /api/reports/submit` - Submit new missing person report
- `GET /api/reports` - Get all approved reports
- `GET /api/reports/pending` - Get pending reports (admin)
- `POST /api/reports/approve/<id>` - Approve a pending report
- `POST /api/reports/reject/<id>` - Reject a pending report

### Report Information
- `POST /api/report-info/submit` - Submit information about a case
- `GET /api/report-info/<report_id>` - Get information for a report
- `GET /api/pending-info` - Get pending information updates (admin)
- `POST /api/report-info/approve/<info_id>` - Approve information
- `POST /api/report-info/reject/<info_id>` - Reject information

### Admin
- `GET /api/admin/reports` - Get all reports with admin details

## 📝 How to Use

### Filing a Missing Person Report
1. Login as a regular user
2. Click "File Report" on the homepage
3. Fill in all required fields:
   - Person's name
   - Age and height
   - Last seen location and date
   - Upload a photo (optional)
4. Submit the form
5. Report goes to admin queue for review

### Admin Reviewing Reports
1. Login with admin credentials
2. Go to "Pending Reports" tab
3. Review report details and photo
4. Click "Approve" to publish or "Reject" to decline
5. Approved reports appear in "Approved Reports" tab and on user homepage

### Submitting Information
1. Browse approved missing person cases on homepage
2. Click "Report Information" button on a case
3. Enter your information/tip
4. Submit for admin review
5. Once approved, information is visible to all users

## 🔒 Security Notes

- Admin credentials are hardcoded for demonstration (should use secure authentication in production)
- Passwords are stored as plain text in JSON (should use hashing in production)
- Use HTTPS in production
- Consider implementing JWT tokens for better security
- Set up proper database (PostgreSQL, MongoDB) instead of JSON files

## 🚧 Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Email notifications for report updates
- [ ] Advanced search and filtering
- [ ] Map integration showing last seen locations
- [ ] Mobile app version
- [ ] Social media integration for sharing cases
- [ ] Anonymous reporting option
- [ ] Case status tracking and closure
- [ ] Media gallery support (multiple images)
- [ ] Admin user management interface

## 📄 License

This project is open source and available under the MIT License.

## � Authors

**Krishn Khandelwal**
- GitHub: [@krishn1301](https://github.com/krishn1301)
- Email: 1khandelwalnhk@gmail.com

**[Your Project Mate's Name]**
- GitHub: [@their-username](https://github.com/their-username)
- Email: their-email@example.com

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/krishn1301/missing-person-registry/issues).

## 📞 Support

For issues or questions, please open an issue on the [GitHub repository](https://github.com/krishn1301/missing-person-registry/issues).

---

**Built with ❤️ for community safety**
