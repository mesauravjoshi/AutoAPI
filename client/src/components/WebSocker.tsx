// import {
//   useEffect,
//   useState
// } from 'react';
// import { socket } from '@/services/socket';

// const WebSocker = () => {
//   const [message, setMessage] = useState("");
//   const [room, setRooms] = useState("");
//   const [socketId, setSocketId] = useState<string>();

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     // console.log(message);
//     socket.emit('message', { message, room });
//     setMessage("");
//   };
//   // console.log(socket);

//   useEffect(() => {
//     socket.on('connect', () => {
//       setSocketId(socket.id);
//       console.log('connected....', socket.id);
//     });

//     socket.on('receive-message', (message) => {
//       console.log('message received....', message);
//     });

//     socket.on('welcome', (wel) => {
//       console.log(wel);
//     })

//     // Note: Don't disconnect on unmount as this socket is shared across the app
//   }, [])

//   return (
//     <div className="">
//       <p className="mt-1 text-lg text-gray-500 dark:text-gray-400">
//         Web sockett {socketId}
//       </p>
//       <div className="min-h-100 bg-white dark:bg-gray-900 flex items-center justify-center">
//         <form
//           onSubmit={handleSubmit}
//           className="w-full max-w-md bg-gray-100 dark:bg-gray-800 p-4 rounded-xl shadow-md"
//         >
//           <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
//             Send Message
//           </h2>

//           <input
//             type="text"
//             id='message'
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder="Type your message..."
//             className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <input
//             type="text"
//             id="room"
//             value={room}
//             onChange={(e) => setRooms(e.target.value)}
//             placeholder="Room here..."
//             className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
//           />

//           <button
//             type="submit"
//             className="mt-4 w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
//           >
//             Send
//           </button>
//         </form>
//       </div>
//     </div>
//   )
// }

// export default WebSocker