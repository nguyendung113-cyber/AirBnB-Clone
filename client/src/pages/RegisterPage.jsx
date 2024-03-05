import {Link} from 'react-router-dom';
import {useState} from 'react';
import axios from 'axios';

export default function RegisterPage(){

    //Đặt trạng thái cho name, password, email là trống
    const [name,setName] = useState('');
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    
    async function RegisterUser(ev){
        ev.preventDefault();
        try{
        await axios.post('/register',{
            name,
            email,
            password,
        });
        alert('Registration successful. Now you can log in');
        }catch(err){
            alert('Registration failed. Please try again');
        }
    }

    return(
        <div className="mt-4 grow flex items-center justify-around">
            <div className="mb-64">
                <h1 className="text-4xl text-center mt-4">Đăng Ký</h1>
                    <form className="max-w-md mx-auto border" onSubmit={RegisterUser}>
                        <input 
                        value={name}
                        onChange={ev => setName(ev.target.value)}
                        type="text" 
                        placeholder='Your name'/>
                        <input 
                        value = {email}
                        onChange={ev => setEmail(ev.target.value)}
                         type="email" 
                         placeholder="you@gmail.com" />
                        <input 
                        value = {password}
                        onChange={ev => setPassword(ev.target.value) }
                        type="password" 
                        placeholder="password" />
                        <button className="primary">Đăng ký</button>
                        <div className="text-center py-2">
                            Đã có tài khoản? <Link className='underline text-btn' to={'/login'}>Đăng nhập</Link>
                        </div>
                    </form>
            </div> 
        </div>
    )
}