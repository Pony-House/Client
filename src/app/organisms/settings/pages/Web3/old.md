    const signMessage = web3SignTemplate(initMatrix.matrixClient.getUserId(), null, 'Matrix Client - Bitcoin Account');


    const btcSignValueRef = useRef(null);
    const btcSignAddressRef = useRef(null);



        <div className="card noselect mb-3">
            <ul className="list-group list-group-flush">

                <li className="list-group-item very-small text-gray">Bitcoin Settings</li>

                <li className="list-group-item very-small text-gray">

                    {userWeb3.btc.address ? <>

                        <p>Bitcoin connected: <strong className={userWeb3.btc.valid ? 'text-success' : 'text-danger'}>{userWeb3.btc.address}</strong></p>

                        <button type="button" className="btn btn-sm btn-danger my-1 my-sm-0" onClick={async () => {
                            const isConfirmed = await tinyConfirm('Are you sure you want to reset your ethereum wallet storage? All your data will be lost forever!', 'Reset Ethereum Wallet');
                            if (isConfirmed) {
                                // const newAccount = resetUserWeb3Account();
                                // ethereumUpdate(newAccount);
                                // </>setUserWeb3(newAccount);
                            }
                        }}><i className="fa-brands fa-bitcoin" /> Disconnect Wallet</button>

                    </> : <>

                        <p>Sign the message below to verify your bitcoin wallet.</p>

                        <textarea className='form-control form-control-bg mb-3' onClick={(e) => { $(e.target).select(); }} value={signMessage} readOnly />

                        <div className="mb-3">
                            <label for="web3-btc-sign-value" className="form-label">Sign value</label>
                            <input ref={btcSignValueRef} type="text" className="form-control form-control-bg" id="web3-btc-sign-value" />
                        </div>

                        <div className="mb-3">
                            <label for="web3-btc-sign-address" className="form-label">Wallet address</label>
                            <input ref={btcSignAddressRef} type="text" className="form-control form-control-bg" id="web3-btc-sign-address" />
                        </div>

                        <button type="button" className="btn btn-sm btn-primary my-1 my-sm-0" onClick={() => {

                            let verified = false;

                            try {
                                verified = new bitcore.Message(signMessage).verify($(btcSignAddressRef.current).val(), $(btcSignValueRef.current).val());
                                console.log(verified);
                            } catch (err) {
                                verified = false;
                                console.error(err);
                            }

                        }}><i className="fa-brands fa-bitcoin" /> Verify bitcoin wallet</button>

                    </>}

                </li>

            </ul>
        </div>
