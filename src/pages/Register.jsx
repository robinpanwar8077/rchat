import { useState, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential ,updateProfile} from 'firebase/auth';
import { auth, db, storage } from '../../firebaseconfig.js';
import { getDownloadURL, ref,  } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { uploadBytesResumable,  } from "firebase/storage";
import { useNavigate } from 'react-router-dom';
const Register = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [verificationId, setVerificationId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth,'recaptcha-container', {
          size: 'invisible',
          callback: (response) => {
            console.log('reCAPTCHA resolved:', response);
          },
          'expired-callback': () => {
            setError('reCAPTCHA expired. Please refresh the page.');
          },
          'error-callback': (err) => {
            console.error('reCAPTCHA error:', err);
            setError('reCAPTCHA error. Please try again.');
          }
        }, auth);
        window.recaptchaVerifier.render();
      }
    } catch (error) {
      console.error('Error initializing reCAPTCHA', error);
      setError('Error initializing reCAPTCHA');
    }
  }, []);

  const handleSendOtp = async () => {
    const appVerifier = window.recaptchaVerifier;
    const fullPhoneNumber = `+91${phoneNumber}`;

    if (!appVerifier) {
      setError('reCAPTCHA verifier not initialized');
      return;
    }

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      setVerificationId(confirmationResult.verificationId);
      setError(null);
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError(error.message || 'Error sending OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!verificationId) {
      setError('Verification ID not found');
      return;
    }
  
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);
  
      let profileImageUrl = '';
  
      if (profileImage) {
        const storageRef = ref(storage, `profile_images/${result.user.uid}`);
        const uploadTask = uploadBytesResumable(storageRef, profileImage);
  
      
        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
           
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log('Upload is ' + progress + '% done');
            }, 
            (error) => {
              
              console.error('Upload failed', error);
              setError('Upload failed');
              reject(error);
            }, 
            () => {
             
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                profileImageUrl = downloadURL;
                resolve();
              });
            }
          );
        });
  
        
        await updateProfile(result.user, {
          displayName: username,
          photoURL: profileImageUrl,
        });
      }
     
      
  
      
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        phoneNumber: result.user.phoneNumber,
        displayName: username,
        photoURL: profileImageUrl,
      });
    await result.user.reload();

      await setDoc(doc(db, 'userchats', result.user.uid),{})
      navigate("/")
      console.log('User signed in and profile created successfully', result);
      setError(null);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError(error.message || 'Error verifying OTP');
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-100 ">

    <div className="w-full max-w-sm p-8 bg-white rounded shadow-md sm:mr-0">
        <h2 className="mb-6 text-2xl font-semibold text-center ">Phone Authentication</h2>
        <div id="recaptcha-container"></div>
        {error && <p className="mt-4 text-red-500">{error}</p>}
        {verificationId ? (
          <>
            <input
              type="text"
              className="w-full px-4 py-2 mb-4 border rounded"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              onClick={handleVerifyOtp}
              className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Verify OTP
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              className="w-full px-4 py-2 mb-4 border rounded"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <input
              type="text"
              className="w-full px-4 py-2 mb-4 border rounded"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
        <lable className ="text-gray-400">Please upload profile image</lable>
            <input
              type="file"
              className="w-full px-4 py-2 mb-4 border rounded"
            
              onChange={(e) => setProfileImage(e.target.files[0])}
            />
            <button
              onClick={handleSendOtp}
              className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Send OTP
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
