# Apple Sign-In Setup Guide 🍎

To enable "Sign in with Apple" in Firebase, you need to generate specific credentials from the [Apple Developer Portal](https://developer.apple.com/account).

## 1. Prerequisites
- An enrolled **Apple Developer Account**.
- A Firebase project.

## 2. Get Your Credentials

### A. Team ID
1. Log in to the [Apple Developer Portal](https://developer.apple.com/account).
2. Look at the top right corner next to your name, or go to **Membership Details**.
3. Copy the **Team ID** (e.g., `A1B2C3D4E5`).

### B. App ID (Identifier)
1. Go to **Certificates, IDs & Profiles** > **Identifiers**.
2. Click **(+)** to create a new identifier -> **App IDs** -> **App**.
3. **Description**: `Puzzleletic App` (or your app name).
4. **Bundle ID**: `com.yourdomain.puzzleletic` (Must match your app).
5. **Capabilities**: Scroll down and check **Sign In with Apple**.
6. Click **Continue** -> **Register**.

### C. Service ID (For Web Auth)
1. Go to **Certificates, IDs & Profiles** > **Identifiers**.
2. Click **(+)** -> **Services IDs**.
3. **Description**: `Puzzleletic Web Auth`.
4. **Identifier**: `com.yourdomain.puzzleletic.service` (Common convention).
5. Click **Current** -> **Register**.
6. **Configure the Service ID**:
   - Find the Service ID you just made and click it to edit.
   - Check **Sign In with Apple** -> Click **Configure**.
   - **Primary App ID**: Select the App ID you created in Step B.
   - **Domains and Subdomains**: Enter your Firebase Auth Domain (from Firebase Console) e.g., `your-project.firebaseapp.com`.
   - **Return URLs**: Enter the callback URL provided in the Firebase Console (Auth > Sign-in method > Apple). It looks like: `https://your-project.firebaseapp.com/__/auth/handler`.
   - Click **Next** -> **Done** -> **Save**.
7. This **Identifier** string is your **Service ID**.

### D. Private Key & Key ID
1. Go to **Certificates, IDs & Profiles** > **Keys**.
2. Click **(+)** to create a new key.
3. **Key Name**: `Firebase Login Key`.
4. Check **Sign In with Apple**.
5. Click **Configure**, select your **App ID** (from Step B), and click **Save**.
6. Click **Continue** -> **Register**.
7. **Download the Key**: This will download a `.p8` file. **Save this safely!** You cannot download it again.
8. **Key ID**: Listed on this page (e.g., `ABC123XYZ`). copy it.

## 3. Configure Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/).
2. Go to **Authentication** > **Sign-in method** > **Apple**.
3. Enter the info:
   - **Service ID**: From Step C.
   - **Team ID**: From Step A.
   - **Key ID**: From Step D.
   - **Private Key**: Open the `.p8` file with a text editor and copy the *entire* content (including `-----BEGIN PRIVATE KEY-----`).
4. Click **Save**.

You are now ready to Test! 🚀
