import {Link, Navigate} from 'react-router-dom';
import axios from 'axios';
import { useContext, useState } from 'react';
import { UserContext } from '../UserContext';

export default function LoginPage(){
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const [redirect,setRedirect] = useState(false)
    const {setUser} = useContext(UserContext);

    async function handleLoginSubmit(ev){
        ev.preventDefault();
        try {
            const {data} = await axios.post('/login', {email,password} , {withCredentials: true});
            setUser(data);
            alert('Login successful');
            setRedirect(true);
          } catch (e) {
            alert('Login failed');
          }
        }

    if(redirect) {
        return <Navigate to={'/'}/>
    }

    return(
        <div className="mt-4 grow flex items-center justify-around">
            <div className="mb-64">
                <h1 className="text-4xl text-center mt-4">Đăng nhập</h1>
                    <form onSubmit={handleLoginSubmit} className="max-w-md mx-auto border">
                        <input 
                        onChange={ev=> setEmail(ev.target.value)}
                        value={email}
                        type="email" 
                        placeholder="you@gmail.com" />
                        <input 
                        onChange={ev=> setPassword(ev.target.value)}
                        value={password}
                        type="password" 
                        placeholder="password" />
                        <button className="primary">Đăng nhập</button>
                        <div className="text-center py-2">
                            Bạn không có tài khoản? <Link className='underline text-btn' to={'/register'}>Đăng ký</Link>
                        </div>
                    </form>
            </div> 
        </div>
    )
}