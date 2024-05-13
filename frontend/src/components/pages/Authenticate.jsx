import axios from 'axios';
import React, { useCallback, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';

import Webcam from 'react-webcam';

const Authenticate = () => {

    const navigate=useNavigate();
    const webcamRef=useRef(null);
    const [capturedImage, setCapturedImage]=useState(null);
    const location=useLocation();
    const {username, roomId}=location.state;

    const capture=useCallback(()=>{
        const imageSrc=webcamRef.current.getScreenshot();
        setCapturedImage(imageSrc);
    }, [webcamRef]);

    const submitImageHandler=async()=>{
        try{
            const formData=new FormData();
            const blob = await fetch(capturedImage).then((res) => res.blob());
            formData.append('faceImage', blob);
            const response=await axios.post(
                "http://localhost:4000/api/auth/faceauthenticate",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // const formData = new FormData();
            // const blob = await fetch(capturedImage).then((res) => res.blob()); 
            // formData.append('image', blob);
            // const response= await axios.post(
            //     "http://localhost:5000/recognize",
            //     formData,
            //     {
            //         headers: {
            //             'Content-Type': 'multipart/form-data'
            //         }
            //     }
            // );
            console.log(response.data);
            if(!response.data.success){
                throw new Error('Face not matched');
            }
            navigate(`/room/${roomId}`, { state: { username } });
        }catch(error){
            console.log(error);
            navigate('/');
        }
    }

  return (
    <div className='w-100vw h-screen flex items-center justify-evenly gap-2'>

        <div className="video-container flex flex-col gap-2 w-1/3">
            <Webcam className='w-full rounded-lg' audio={false} ref={webcamRef} />
            <button className='bg-red-400 hover:bg-red-500 text-white p-2 rounded-lg w-full' onClick={capture}>Take Photo</button>
        </div>
        {
            capturedImage ? <div className='photo-container flex flex-col gap-2 w-1/3'>
                <img className='w-full rounded-lg' src={capturedImage} alt="" />
                <button className='bg-red-400 hover:bg-red-500 text-white p-2 rounded-lg w-full' onClick={submitImageHandler} >Submit</button>
            </div>
            :
            <div className='w-1/3 bg-gray-400 h-96 rounded-lg'></div>
        }
    </div>
  )
}

export default Authenticate