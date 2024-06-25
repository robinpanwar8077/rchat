import { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "../Contexts/Chatauth";
import { Timestamp, arrayUnion, doc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import { db, storage } from "../../firebaseconfig";
import { v4 as uuid } from "uuid";
import { AuthContext } from "../Contexts/AuthContext";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import EmojiPicker from 'emoji-picker-react';
import { ArrowBack } from "@mui/icons-material";
import { chooesuser } from "../Contexts/ChooesUser"
import { Avatar } from "@mui/material";

const Chat = () => {
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const reff = useRef(null);
  const { setUserClick } = useContext(chooesuser);

  useEffect(() => {
    if (reff.current) {
      reff.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    try {
      if (img) {
        const storageRef = ref(storage, uuid());
        const uploadTask = uploadBytesResumable(storageRef, img);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log('Upload is ' + progress + '% done');
            },
            (error) => {
              console.error('Upload failed', error);
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                await updateDoc(doc(db, "chats", data.chatId), {
                  messages: arrayUnion({
                    id: uuid(),
                    text,
                    senderId: currentUser.uid,
                    date: Timestamp.now(),
                    img: downloadURL
                  })
                });
                console.log("Checking for chat update");

                await Promise.all([
                  updateDoc(doc(db, "userchats", currentUser.uid), {
                    [`${data.chatId}.lastmessage`]: {
                      text
                    },
                    [`${data.chatId}.date`]: serverTimestamp()
                  }),
                  updateDoc(doc(db, "userchats", data.user.uid), {
                    [`${data.chatId}.lastmessage`]: {
                      text
                    },
                    [`${data.chatId}.date`]: serverTimestamp()
                  })
                ]);

                resolve();
              } catch (error) {
                console.error('Error updating documents:', error);
                reject(error);
              }
            }
          );
        });
      } else {
        await updateDoc(doc(db, "chats", data.chatId), {
          messages: arrayUnion({
            id: uuid(),
            text,
            senderId: currentUser.uid,
            date: Timestamp.now()
          })
        });

        await Promise.all([
          updateDoc(doc(db, "userchats", currentUser.uid), {
            [`${data.chatId}.lastmessage`]: {
              text
            },
            [`${data.chatId}.date`]: serverTimestamp()
          }),
          updateDoc(doc(db, "userchats", data.user.uid), {
            [`${data.chatId}.lastmessage`]: {
              text
            },
            [`${data.chatId}.date`]: serverTimestamp()
          })
        ]);
      }
      setText("");
      setImg(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    if (data.chatId && data.chatId !== 'null') {
      const unsub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
        doc.exists() && setMessages(doc.data().messages);
      });
      return () => {
        unsub();
      };
    }
  }, [data.chatId]);

  const handleButtonClick = () => {
    document.getElementById('fileInput').click();
  };

  const handleEmojiClick = () => {
    setShowPicker(!showPicker);
  };

  const handleEmojiSelect = (emoji) => {
    console.log(emoji.emoji);
    setText((prevText) => prevText + emoji.emoji);
    setShowPicker(!showPicker);
  };

  const handleKeyDown = (e) => {
    if (e.code === "Enter") {
      handleSend();
    }
  };

  const handleBack = () => {
    setUserClick(false);
  };

  console.log(data, "cheking");

  if (!data.chatId || data.chatId === 'null') {
    return  <div className="flex items-center justify-center min-h-screen bg-darkGray">
    <div className="text-center text-white">
      <div className="mb-4 text-6xl">💬</div> {/* Icon representing chat or message */}
      <div className="mb-2 text-2xl">No chat selected</div>
      <div className="text-lg text-gray-400">Please select a chat to start messaging</div>
    </div>
  </div>;
  }

  return (
    <div className="flex-1 bg-chatcolor h-[100vh] justify-between text-gray-900 sm:justify-between flex flex-col">
      <div className="flex justify-between py-3 border-b-2 border-gray-200 bg-darkGray sm:items-center">
        <div className="relative flex items-center space-x-4">
          <span onClick={handleBack} className="text-white sm:hidden lg:hidden">
            <ArrowBack />
          </span>
          <div className="relative">
            <span className="absolute bottom-0 right-0 text-green-500">
              <svg width="20" height="20">
                <circle cx="8" cy="8" r="8" fill="currentColor"></circle>
              </svg>
            </span>
            <Avatar src={data.user.photoURL} alt="" className="w-10 h-10 rounded-full sm:w-16 sm:h-16" />
          </div>
          <div className="flex flex-col leading-tight">
            <div className="flex items-center mt-1 text-2xl">
              <span className="mr-3 text-white">{data.user.displayName}</span>
            </div>
          </div>
        </div>
      </div>

      <div id="messages" className="flex flex-col p-3 space-y-4 overflow-y-auto scrolling-touch scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2">
        {messages.map((message) => (
          <div className="chat-message" key={message.id}>
            <div className={`flex items-end ${message.senderId === currentUser.uid ? 'justify-end' : ''}`}>
              <div className={`flex flex-col space-y-2 text-xs max-w-xs mx-2 ${message.senderId === currentUser.uid ? 'order-1 items-end' : 'order-2 items-start'}`}>
                <span className="px-4 py-2 rounded-lg inline-block bg-[#00A3FF] text-[#FFFFFF]">
                  {message.text}
                  {message.img && <img src={message.img} alt="attachment" className="mt-2" />}
                </span>
              </div>
              <img alt="profile" className="w-6 h-6 rounded-full" src={message.senderId === currentUser.uid ? currentUser.photoURL : data.user.photoURL} />
            </div>
          </div>
        ))}
        <div ref={reff} />
      </div>

      <div className="border-t-[1px] bg-darkGray mx-1 rounded-3xl py-2 lg:border-gray-200 bg-darkGray px-4 pt-4 mb-2 sm:mb-0 sm:border-gray-200 bg-darkGray px-4 pt-4 mb-2 sm:mb-0">
        <div className="relative flex bg-darkGray rounded-xl">
        
          <input
            type="text"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            value={text}
            placeholder="Write your message!"
            className="w-full focus:outline-none focus:placeholder-gray-400 text-[#FFFFFF] placeholder-gray-600 pl-12 bg-darkGray rounded-md py-3"
          />
         <span  onClick={handleSend} className="z-10 mt-2 text-white sm:hidden lg:hidden"> <ArrowBack/></span>
          {showPicker && (
            <div className="absolute z-10 bg-red-400 bottom-20 rounded-xl">
              <EmojiPicker onEmojiClick={handleEmojiSelect} />
            </div>
          )}

          <div className="absolute inset-y-0 right-0 items-center hidden rounded-xl sm:flex">
            <button
              onClick={handleButtonClick}
              type="button"
              className="inline-flex items-center justify-center w-10 h-10 text-gray-500 transition duration-500 ease-in-out rounded-full hover:bg-gray-300 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
              </svg>
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center w-10 h-10 text-gray-500 transition duration-500 ease-in-out rounded-full hover:bg-gray-300 focus:outline-none"
              onClick={handleEmojiClick}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </button>
            <label
              htmlFor="fileInput"
              className="inline-flex items-center justify-center w-10 h-10 text-gray-500 transition duration-500 ease-in-out rounded-full cursor-pointer hover:bg-gray-300 focus:outline-none"
            >
            </label>
            <input
              type="file"
              id="fileInput"
              onChange={(e) => setImg(e.target.files[0])}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleSend}
              className="inline-flex items-center justify-center px-4 py-3 text-white transition duration-500 ease-in-out bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none"
            >
              <span className="font-bold">Send</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 ml-2 transform rotate-90">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
