# PlanePool Mobile App

A React Native mobile application for sharing rides from airports using offline mesh networking and real-time coordination.

**Author**: Zuha Khalid

## 📱 Overview

PlanePool is a revolutionary ride-sharing platform that allows passengers to coordinate shared rides **while still on the plane** using offline mesh networking technology. The app enables users to:

- Select destinations while in-flight (offline mode)
- Discover and join ride groups heading to the same location
- Coordinate meeting points and share contact information
- Split ride costs automatically
- Build trust through verified identity and ratings

## ✨ Features

### Core Features

- **Authentication**: Email/password, phone OTP, and OAuth login
- **In-Flight Destination Selection**: Radio button interface for offline use
- **Ride Matching**: Smart algorithm to group passengers heading to similar destinations
- **Real-Time Chat**: Communicate with group members using mesh networking
- **KYC Verification**: Government ID, selfie, and flight ticket verification
- **Trust Scoring**: Build reputation through verified identity and ride ratings
- **Offline Support**: Full functionality without internet connectivity
- **Mesh Networking**: BLE/WiFi Direct for in-flight communication

### Advanced Features

- **Cost Splitting**: Automatic calculation and payment splitting with Stripe
- **Notifications**: Push notifications for ride updates and group messages
- **User Profiles**: Manage personal information and preferences
- **Ride History**: Track past rides and ratings
- **Payment Methods**: Save and manage multiple payment methods
- **Admin Integration**: Connect to the PlanePool admin panel for monitoring

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React Native with Expo
- **State Management**: Zustand (ride store, notifications)
- **Authentication**: JWT tokens with refresh mechanism
- **Offline Storage**: AsyncStorage for local data persistence
- **Networking**: Axios for HTTP requests, native BLE/WiFi Direct for mesh
- **UI Components**: React Native built-ins + Material Community Icons
- **Payments**: Stripe integration for cost splitting

### Project Structure

```
planepool-mobile/
├── app/                          # Main app screens
│   ├── (tabs)/                   # Tab navigation
│   │   ├── _layout.tsx          # Tab layout
│   │   ├── index.tsx            # Home/Dashboard
│   │   ├── rides.tsx            # My Rides
│   │   ├── notifications.tsx    # Notifications
│   │   └── profile.tsx          # User Profile
│   ├── login.tsx                # Login screen
│   ├── signup.tsx               # Signup screen
│   ├── onboarding.tsx           # Phone verification
│   ├── destination-selection.tsx # In-flight destination picker
│   ├── ride-matching.tsx        # Browse and join groups
│   ├── ride-coordination.tsx    # Group chat and coordination
│   ├── kyc-verification.tsx     # Document upload
│   ├── edit-profile.tsx         # Profile editing
│   └── change-password.tsx      # Password management
├── contexts/
│   └── AuthContext.tsx          # Authentication state
├── store/
│   ├── rideStore.ts             # Ride state management
│   └── notificationStore.ts     # Notification state
├── services/
│   ├── api.ts                   # API client
│   ├── offlineStorage.ts        # Local storage
│   ├── meshNetworking.ts        # BLE/WiFi Direct
│   └── paymentService.ts        # Stripe integration
├── app.json                      # App configuration
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator
- Xcode (Mac) or Android Studio

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zuha-khalid-au3/planepool-mobile.git
   cd planepool-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API endpoints and keys
   ```

4. **Start the development server**
   ```bash
   expo start
   ```

5. **Run on device/emulator**
   - iOS: Press `i` in the terminal
   - Android: Press `a` in the terminal
   - Web: Press `w` in the terminal

## 📋 Screens Overview

### Authentication Flow
- **Login**: Email/password authentication
- **Signup**: User registration with validation
- **Onboarding**: Phone number verification with OTP

### Main App Flow
- **Home/Dashboard**: Welcome banner, quick actions, active rides
- **Destination Selection**: In-flight destination picker (offline)
- **Ride Matching**: Browse and join ride groups
- **Ride Coordination**: Real-time chat with group members
- **My Rides**: History of past and active rides

### User Management
- **Profile**: View and edit user information
- **Edit Profile**: Update name, email, phone, bio
- **Change Password**: Security management
- **KYC Verification**: Upload identity documents

### Notifications
- **Notifications**: View and manage push notifications
- **Filtering**: Filter by read/unread status
- **Actions**: Mark as read, clear all

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **KYC Verification**: Multi-step identity verification
- **Trust Scoring**: Reputation system based on verified identity and ratings
- **Encrypted Storage**: Sensitive data stored securely locally
- **HTTPS Only**: All API communications encrypted
- **Password Hashing**: Bcrypt for password security
- **Rate Limiting**: API rate limiting to prevent abuse

## 🌐 Offline Capabilities

PlanePool works seamlessly offline using mesh networking:

- **Bluetooth Low Energy (BLE)**: For short-range communication
- **WiFi Direct**: For local area network communication
- **Message Queuing**: Messages are queued and synced when online
- **Local Storage**: All data cached locally for offline access
- **Automatic Sync**: Data syncs automatically when connection is restored

## 💳 Payment Integration

- **Stripe Integration**: Secure payment processing
- **Cost Splitting**: Automatic calculation of per-person costs
- **Multiple Payment Methods**: Save and manage cards
- **Payment History**: Track all transactions
- **Reminders**: Automatic payment reminders for group members

## 📊 Analytics & Monitoring

The app integrates with the PlanePool admin panel to provide:

- Real-time user activity tracking
- Ride completion rates and metrics
- User engagement analytics
- Payment processing metrics
- KYC verification status monitoring

## 🧪 Testing

### Run Tests
```bash
npm test
# or
yarn test
```

### Manual Testing Checklist

- [ ] Authentication flow (login, signup, logout)
- [ ] In-flight destination selection (offline mode)
- [ ] Ride matching and group joining
- [ ] Real-time chat functionality
- [ ] KYC document upload
- [ ] Payment processing
- [ ] Notifications
- [ ] Profile management
- [ ] Mesh networking (BLE/WiFi Direct)

## 🚢 Deployment

### Build for iOS
```bash
eas build --platform ios
```

### Build for Android
```bash
eas build --platform android
```

### Submit to App Stores
```bash
eas submit --platform ios
eas submit --platform android
```

## 📱 Device Requirements

### iOS
- iOS 13.0+
- iPhone 6s or later

### Android
- Android 8.0+ (API level 26)
- 2GB RAM minimum

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following:

```env
REACT_APP_API_URL=https://api.planepool.com
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
REACT_APP_OAUTH_CLIENT_ID=your_oauth_client_id
REACT_APP_OAUTH_REDIRECT_URI=planepool://oauth/callback
```

### App Configuration

Edit `app.json` to customize:

- App name and slug
- Version number
- Splash screen
- Icons
- Permissions
- Plugins

## 🐛 Troubleshooting

### Common Issues

**Issue**: App crashes on startup
- **Solution**: Clear cache with `expo start -c`

**Issue**: Offline mode not working
- **Solution**: Ensure BLE permissions are granted in device settings

**Issue**: Mesh networking not connecting
- **Solution**: Check WiFi Direct or BLE is enabled on device

**Issue**: Payment integration failing
- **Solution**: Verify Stripe API keys in environment variables

## 📚 API Documentation

For detailed API documentation, see the [Admin Panel Documentation](../planepool-admin/ADMIN_PANEL_README.md).

### Key Endpoints

- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `GET /users/me` - Get current user
- `POST /rides/create` - Create a ride group
- `GET /rides/active` - Get active rides
- `POST /messages/send` - Send a message
- `POST /payments/split` - Split ride costs

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💼 Author

**Zuha Khalid**
- GitHub: [@zuha-khalid-au3](https://github.com/zuha-khalid-au3)
- Email: zuhakhalid@gmail.com

## 🙏 Acknowledgments

- Expo team for the amazing React Native framework
- Stripe for payment processing
- All contributors and testers

## 📞 Support

For support, email zuhakhalid@gmail.com or open an issue on GitHub.

---

**Last Updated**: May 10, 2026
**Version**: 1.0.0
