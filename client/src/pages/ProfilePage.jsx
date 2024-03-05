import { Navigate,useLocation } from 'react-router-dom';
import { UserContext } from "../UserContext"
import { useContext, useState } from 'react';
import axios from 'axios';
import PlacePage from './PlacesPage';
import AccountNav from './AccountNav';
export default function ProfilePage(){
    const [redirect,setRedirect] = useState(null);
    const{ ready, user, setUser} = useContext(UserContext);

    const {pathname} = useLocation();
    let subpage = pathname.split('/')?.[2];
    if (subpage === undefined) {
      subpage = 'profile';
    }
    async function logout(){  
        await axios.post('/logout');
        setUser(null);
        setRedirect('/');
    }    

    if(ready && !user){
        return(
            <Navigate to={'/login'}/>
        )
    } 


    if(!ready){
        return'Loading...'
    }


    if(ready &&!user && !redirect){
        return <Navigate to={'/login'}/>
    }

    return(
        <div className=' mb-10'>
        <AccountNav />
        {subpage === 'profile' &&(
            <div className='mt-10 text-center'>
                Logger in as {user.name}({user.email})<br/>
                <button onClick={logout} className='primary max-w-sm mt-2'>Logout</button>
            </div>
        )}
        {subpage ==='places' &&(
            <PlacePage/>
        )}
        </div>
    )
}