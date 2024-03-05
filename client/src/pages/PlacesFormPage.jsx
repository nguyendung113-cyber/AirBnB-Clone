import axios from "axios";
import { useEffect, useState } from "react";
import Perks from "./Perks";
import { Navigate, useParams } from "react-router-dom";
import PhotosUploader from "../PhotoUploader.jsx";
import AccountNav from "./AccountNav.jsx";


export default function PlacesFormPage(){
    const {id} = useParams();
    const [title,setTitle] = useState('');
    const [address,setAdress] = useState('');
    const [addedPhotos,setAddedPhotos] = useState([]);
    const [description,setDescription] = useState('');
    const [perks,setPerks] = useState([]);
    const [extraInfo,setExtraInfo] = useState('');
    const [checkIn,setCheckIn] = useState('');
    const [checkOut,setCheckOut] = useState('');
    const [maxGuests,setMaxGuest] = useState(1);
    const [redirect,setRedirect] = useState(false);
    const [price,setPrice] = useState('');
    
    useEffect(() =>{
        if(!id){
            return;
        }
        axios.get('/places/'+id).then(response =>{
            
            const {data} = response;
            setTitle(data.title);
            setAdress(data.address);
            setAddedPhotos(data.photos);
            setDescription(data.description);
            setPerks(data.perks);
            setExtraInfo(data.extraInfo);
            setCheckIn(data.checkIn);
            setCheckOut(data.checkOut);
            setMaxGuest(data.maxGuests);
            setPrice(data.price);
    })
    },[id]);
    function inputHeader(text){
        return(
            <h2 className="text-2xl mt-4">{text}</h2>
        );
    }

    function inputDescription(text){
        return(
            <p className="text-gray-500 text-sm">{text}</p>
        )
    }

    function preInput(header,description) {
        return (
          <>
            {inputHeader(header)}
            {inputDescription(description)}
          </>
        );
      }


//create new place and update placeholder
      async function savePlaces(ev){
        ev.preventDefault();
        const placeData={
            title, address, addedPhotos,
            description, perks, extraInfo,
            checkIn, checkOut, maxGuests,price,
        }
        if(id){
            //update
            await axios.put('/places' , {
                id, ...placeData
            });
            setRedirect(true);
        }else{
            //new place
            await axios.post('/places' , placeData);
            setRedirect(true);
        }
    }

      if(redirect){
        return<Navigate to={'/account/places'}/>
      }
    return(
        <div>
            <AccountNav/>
            <form onSubmit={savePlaces}>
                {preInput('Title', 'Title for your place. should be short and catchy as in advertisement')}
                    <input type="text" value={title} onChange={ev => setTitle(ev.target.value)} placeholder="title, for example: My lovely apt"/>
                
                {preInput('Address','Address this your place')}
                    <input type="text" value={address} onChange={ev => setAdress(ev.target.value)} placeholder="adress" />

                {preInput('Photos','more = better')}
                <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />

                {preInput('Description','description of the places')}
                <textarea value={description} onChange={ev => setDescription(ev.target.value)}/>
                
                {preInput('Perk','selcet all the perk')}
                <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                   <Perks selected={perks} onChange={setPerks}/>
                </div>

                {preInput('Extra Info')}
                <textarea selected={extraInfo} onChange={ev=>setExtraInfo(ev.target.value)}/>
                {preInput('Check in & out times, max guest', 'Add check in and out time, remember to have some time windwos for clearing the room beween guests')}
                    <h2 className="text-2xl mt-4"></h2>
                    <p className="text-gray-500 text-sm"></p>
                    <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
                    <div>
            <h3 className="mt-2 -mb-1">Check in time</h3>
            <input type="text"
                   value={checkIn}
                   onChange={ev => setCheckIn(ev.target.value)}
                   placeholder="14"/>
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Check out time</h3>
            <input type="text"
                   value={checkOut}
                   onChange={ev => setCheckOut(ev.target.value)}
                   placeholder="11" />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Max number of guests</h3>
            <input type="number" value={maxGuests}
                   onChange={ev => setMaxGuest(ev.target.value)}/>
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Price per night</h3>
            <input type="number" value={price}
                   onChange={ev => setPrice(ev.target.value)}/>
          </div>
        </div>
                    <button className="primary my-4">Save</button>
                </form>
        </div>
    );
}