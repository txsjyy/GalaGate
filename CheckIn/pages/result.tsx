
import { useRouter } from 'next/router';
import Nav from './layout';
import React from 'react';

function ResultPage() {
    const router = useRouter();
    const { lottery_number, won } = router.query;

    const lotteryId = lottery_number ? String(lottery_number).padStart(3, '0') : '';
    const [d0, d1, d2] = lotteryId.split('');

    return (
        <div className='bg-MidAutumnBg h-screen flex flex-col items-center justify-center'>
            <Nav />
            <div className="text-center">
                <h1 className="text-3xl font-medium text-orange-200 mt-12">Result</h1>
                {lottery_number && (
                    <div>
                        <h2 className="text-2xl font-medium text-orange-200">Your lottery number is: {lottery_number}</h2>
                        <div className="flex gap-3 justify-center">
                            <div className="font-mono text-9xl bg-slate-200 shadow-inner rounded p-2 text-center opacity-60">{d0}</div>
                            <div className="font-mono text-9xl bg-slate-200 shadow-inner rounded p-2 text-center opacity-60">{d1}</div>
                            <div className="font-mono text-9xl bg-slate-200 shadow-inner rounded p-2 text-center opacity-60">{d2}</div>
                        </div>
                        <h3 className="text-xl font-medium text-orange-200 mt-4">Won: {won}</h3>
                    </div>
                )}
                {!lottery_number && (
                    <p className="text-2xl font-medium text-orange-200 mt-4">No lottery number available currently...</p>
                )}
            </div>
        </div>
    );
}

export default ResultPage;
