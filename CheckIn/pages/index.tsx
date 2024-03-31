import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Nav from './layout';

export default function Home() {
    const [input, setValue] = useState('');
    const [pressed, setPressed] = useState(false);
    const router = useRouter();

    const handleChange = (e) => {
        setValue(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPressed(true);

        try {
            const response = await fetch('http://localhost:8080/api/checkin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: input })
            });

            const data = await response.json();

            if (response.ok && data.exist) {
                // Redirect to the ResultPage with the lottery_number and won status as query parameters
                router.push({
                    pathname: '/result',
                    query: {
                        lottery_number: data.lottery_number,
                        won: data.won
                    }
                });
            } else {
                setPressed(false); // Reset pressed state to allow retry
                alert('No record found for the provided email.');
            }
        } catch (error) {
            console.error('Error:', error);
            setPressed(false); // Reset pressed state to allow retry
        }
    };

    return (
        <div className='bg-MidAutumnBg h-screen flex flex-col justify-center'>
            <Nav />
            <h1 className="text-center text-2xl font-extrabold text-orange-200 mt-12">欢迎来到UTCSSA 2024新春晚会</h1>
            <h1 className="text-center text-xl font-medium text-orange-200 mt-1">Welcome to the UTCSSA 2024 New Year Gala!</h1>
            <div className="container w-full max-w-xs bg-white bg-opacity-50 mx-auto shadow-md">
                <form className="justify-center items-center rounded px-8 pt-6 pb-8" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-orange-200 text-lg font-bold pb-2">请输入报名邮箱 / Please enter registration email</label>
                        <input className="shadow appearance-none border rounded-lg py-2 px-3 text-xl text-red-800 leading-tight focus:outline-none focus:shadow-outline w-full"
                            type="email"
                            pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                            value={input}
                            onChange={handleChange}
                        />
                    </div>
                    <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                        Submit
                    </button>
                </form>
                {pressed && <p className="text-center text-red-500 text-sm">Processing...</p>}
            </div>
            <div className="container w-full max-w-xs mx-auto my-2">
                <Link className="inline-block align-baseline font-bold text-orange-200 text-xs" href="https://docs.google.com/forms/d/e/1FAIpQLScn5-ikrSBlFlYIzPMA11kmJt4NOmqauO7VqTlu3X6X2Mp7TA/viewform?usp=sf_link">
                    Not registered? Click here.
                </Link>
            </div>
            <footer className="w-screen text-center mt-6">
                <span className="text-orange-200 text-xs">&copy; UTCSSA - Junyu Yao and Tech Department, 2024.</span>
            </footer>
        </div>
    );
}
