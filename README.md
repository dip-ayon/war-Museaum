# Liberation War Museum Archive Software System

A comprehensive digital archive system for preserving and displaying Liberation War artifacts from Bangladesh. This full-stack web application provides an intuitive interface for exploring historical artifacts, managing collections, and generating detailed reports.

## 🌟 Features

### For Visitors
- **Interactive Hero Section**: Beautiful slideshow showcasing key artifacts and stories
- **Advanced Search**: Search artifacts by Collection No., Accession No., Donor, Object Type, and Object Head
- **Filter System**: Filter artifacts by categories (Documents, Weapons, Personal Items, Photos)
- **Responsive Design**: Fully responsive design that works on all devices
- **Smooth Animations**: AOS (Animate On Scroll) animations for enhanced user experience

### For Administrators
- **User Management**: Complete user account administration
- **Artifact Management**: Upload, edit, and delete artifacts with image support (up to 5 images per artifact)
- **Report Generation**: Generate detailed reports with sorting and filtering options
- **System Logs**: Track all system activities and user actions
- **Dashboard Analytics**: View statistics and recent activities

## 🚀 Technology Stack

### Frontend
- **HTML5**: Semantic markup with modern features
- **CSS3**: Advanced styling with CSS Grid, Flexbox, and custom properties
- **JavaScript (ES6+)**: Modern JavaScript with async/await and fetch API
- **AOS Library**: Animate On Scroll for smooth animations
- **Font Awesome**: Icon library for enhanced UI

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **SQLite3**: Lightweight database for data storage
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing for security
- **multer**: File upload handling
- **helmet**: Security middleware
- **cors**: Cross-origin resource sharing
- **express-rate-limit**: Rate limiting for API protection

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd liberation-war-museum-archive
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory (optional):
```env
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
```

### 4. Start the Application
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### 5. Access the Application
- **Main Application**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

## 🔐 Default Admin Credentials

For testing purposes, the system creates a default admin account:

- **Email**: admin@museum.com
- **Password**: admin123

⚠️ **Important**: Change these credentials in production!

## 📁 Project Structure

```
liberation-war-museum-archive/
├── public/
│   ├── assets/
│   │   └── images/          # Artifact images
│   └── uploads/
│       └── artifacts/       # Uploaded artifact images
├── css/
│   ├── styles.css          # Main stylesheet
│   └── admin.css           # Admin panel styles
├── js/
│   └── main.js             # Main JavaScript file
├── index.html              # Main landing page
├── admin.html              # Admin panel page
├── server.js               # Express server
├── package.json            # Dependencies and scripts
├── museum.db               # SQLite database (auto-created)
└── README.md               # This file
```

## 🎨 Design Features

### Modern UI/UX
- **Glass Morphism**: Modern glass-like effects with backdrop blur
- **Gradient Backgrounds**: Beautiful gradient combinations
- **Smooth Transitions**: CSS transitions and animations
- **Responsive Grid**: CSS Grid and Flexbox layouts
- **Custom Scrollbar**: Styled scrollbar for better aesthetics

### Interactive Elements
- **Hover Effects**: Rich hover animations on buttons and cards
- **Loading States**: Visual feedback for user actions
- **Notifications**: Toast notifications for user feedback
- **Modal Dialogs**: Clean modal interfaces for forms

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Artifacts
- `GET /api/artifacts` - Get all artifacts (with search/filter)
- `POST /api/artifacts` - Create new artifact (admin only)
- `PUT /api/artifacts/:id` - Update artifact (admin only)
- `DELETE /api/artifacts/:id` - Delete artifact (admin only)

### User Management
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id` - Update user role (admin only)

### System
- `GET /api/logs` - Get system logs (admin only)
- `GET /api/dashboard` - Get dashboard statistics

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
1. Set environment variables
2. Run `npm start`
3. Use a process manager like PM2 for production

### Docker Deployment (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: API rate limiting to prevent abuse
- **Helmet**: Security headers middleware
- **Input Validation**: Server-side validation
- **File Upload Security**: Image file validation and size limits

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🎯 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Liberation War Museum for preserving our history
- All freedom fighters who sacrificed for our independence
- The open-source community for amazing tools and libraries

## 📞 Support

For technical support or questions, please contact the development team.

---

**Copyright © 2024 Liberation War Museum Archive Software System**
