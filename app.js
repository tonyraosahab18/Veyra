
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// VEYRA Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLCyL9aHA75fOOSKzn-BvBE4KGeJ9gl6k",
  authDomain: "veyra-ec444.firebaseapp.com",
  projectId: "veyra-ec444",
  storageBucket: "veyra-ec444.firebasestorage.app",
  messagingSenderId: "379323509837",
  appId: "1:379323509837:web:02275c08cfa206c8ec0004"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get HTML elements
const form = document.getElementById("auth-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const usernameInput = document.getElementById("username");
const usernameWrap = document.getElementById("username-wrap");
const submitBtn = document.getElementById("submit-btn");
const guestBtn = document.getElementById("guest-btn");
const message = document.getElementById("message");
const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");

let mode = "login";
let busy = false;

function showMessage(text, success = false) {
  message.textContent = text;
  message.style.color = success ? "#71dfa0" : "#ff7386";
}

function setBusy(value) {
  busy = value;
  submitBtn.disabled = value;
  guestBtn.disabled = value;
  loginTab.disabled = value;
  signupTab.disabled = value;

  submitBtn.innerHTML = value
    ? "Please wait..."
    : mode === "login"
      ? 'Sign in <span>↗</span>'
      : 'Create account <span>↗</span>';

  guestBtn.style.opacity = value ? "0.6" : "1";
}

function setMode(nextMode) {
  if (busy) return;

  mode = nextMode;
  const isSignup = mode === "signup";

  loginTab.classList.toggle("active", !isSignup);
  signupTab.classList.toggle("active", isSignup);

  loginTab.setAttribute("aria-selected", String(!isSignup));
  signupTab.setAttribute("aria-selected", String(isSignup));

  usernameWrap.hidden = !isSignup;
  usernameInput.required = isSignup;

  passwordInput.autocomplete = isSignup
    ? "new-password"
    : "current-password";

  showMessage("");
  submitBtn.innerHTML = isSignup
    ? 'Create account <span>↗</span>'
    : 'Sign in <span>↗</span>';
}

loginTab.addEventListener("click", () => setMode("login"));
signupTab.addEventListener("click", () => setMode("signup"));

function friendlyError(error) {
  const errors = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/missing-password": "Please enter your password.",
    "auth/weak-password": "Choose a stronger password with at least 6 characters.",
    "auth/email-already-in-use": "This email already has an account. Try signing in.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/user-not-found": "Account not found. Create an account first.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/operation-not-allowed": "This sign-in method is not enabled in Firebase.",
    "auth/weak-password": "Your password is too weak. Please choose a stronger one."
  };

  return errors[error.code] || "Something went wrong. Please try again.";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (busy) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const username = usernameInput.value.trim();

  if (mode === "signup") {
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
      showMessage(
        "Username must be 3–20 characters and contain only letters, numbers or underscores."
      );
      return;
    }
  }

  setBusy(true);
  showMessage("");

  try {
    if (mode === "signup") {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Save the chosen name to the Firebase Auth profile.
      // Unique username reservation and database profile come next.
      await updateProfile(credential.user, {
        displayName: username
      });

      showMessage(
        `Account created successfully! Welcome to VEYRA, @${username}. Your saved profile and messaging setup is next.`,
        true
      );
    } else {
      await signInWithEmailAndPassword(auth, email, password);

      showMessage(
        "Signed in successfully! Your VEYRA profile and inbox will be connected in the next step.",
        true
      );
    }
  } catch (error) {
    showMessage(friendlyError(error));
  } finally {
    setBusy(false);
  }
});

guestBtn.addEventListener("click", async () => {
  if (busy) return;

  setBusy(true);
  showMessage("");

  try {
    await signInAnonymously(auth);

    showMessage(
      "Guest access is ready! Guest accounts may be lost if you sign out or clear app data. Profile and messaging setup comes next.",
      true
    );
  } catch (error) {
    showMessage(friendlyError(error));
  } finally {
    setBusy(false);
  }
});

console.log("VEYRA Firebase authentication initialized.");
