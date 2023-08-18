import React from 'react';

function DonateSection() {
    return (
        <div className="card noselect">
            <ul className="list-group list-group-flush">
                <li className="list-group-item very-small text-gray">Donation</li>

                <li className="list-group-item border-0">
                    {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
                    <div className='small'>If you are enjoying the app, you are invited to make donations to help me keep all the infrastructure of the application and the domain working. All types of donation is welcome! Feel free to choose below.</div>
                    <br />
                </li>

                <li className="list-group-item border-0">
                    {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
                    <div className='small'><i className="fa-brands fa-patreon" /> <a href="https://patreon.com/jasmindreasond" target="_blank" rel="noreferrer noopener">Patreon</a></div>
                </li>

                <li className="list-group-item border-0">
                    {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
                    <div className='small'><i className="fa-solid fa-mug-hot" /> <a href="https://ko-fi.com/jasmindreasond" target="_blank" rel="noreferrer noopener">Ko-Fi</a></div>
                </li>

                <li className="list-group-item border-0">
                    {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
                    <div className='small'><i className="fa-brands fa-stripe-s" /> <a href="https://donate.stripe.com/bIYeYL3U08a3gsE7st" target="_blank" rel="noreferrer noopener">Stripe</a></div>
                </li>

                <li className="list-group-item border-0">
                    {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
                    <div className='small'><i className="fa-brands fa-ethereum" /> <a href="https://ud.me/jasmindreasond.wallet" target="_blank" rel="noreferrer noopener">Crypto</a></div>
                </li>

            </ul>
        </div>
    );
};

export default DonateSection;