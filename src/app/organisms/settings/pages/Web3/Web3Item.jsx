import React, { useState, useEffect, useRef } from 'react';
import { setWeb3Cfg } from '../../../../../util/web3';

function Web3Item({ item, networkId }) {

    const idValueRef = useRef(null);
    const blockIdRef = useRef(null);
    const blockNameRef = useRef(null);
    const explorerUrlRef = useRef(null);
    const explorerUrlApiRef = useRef(null);
    const chainRpcRef = useRef(null);
    const factoryScRef = useRef(null);

    console.log(item);

    // Effects
    useEffect(() => {

        const idValue = $(idValueRef.current);
        idValue.val(networkId);

        const blockId = $(blockIdRef.current);
        blockId.val(item.chainId);

        const blockName = $(blockNameRef.current);
        blockName.val(item.chainName);

        const explorerUrl = $(explorerUrlRef.current);
        explorerUrl.val(item?.blockExplorerUrls.join(','));

        const explorerUrlApi = $(explorerUrlApiRef.current);
        explorerUrlApi.val(item?.blockExplorerApis.join(','));

        const chainRpc = $(chainRpcRef.current);
        chainRpc.val(item?.rpcUrls.join(','));

        const factorySc = $(factoryScRef.current);
        factorySc.val(item?.factory.join(','));

    });

    return <div className="card noselect mb-3">
        <ul className="list-group list-group-flush">
            <li className="list-group-item very-small text-gray">{item.chainName} <img src={`${item?.blockExplorerUrls}images/favicon.ico`} className='ms-2 img-fluid' style={{ height: 20 }} alt='logo' /></li>
            <li className="list-group-item">

                <div className="mb-3">
                    <label for={`chain_name_id_${item.chainId}`} className="form-label small">Chain Name</label>
                    <input ref={blockNameRef} type="text" className="form-control form-control-bg" id={`chain_name_id_${item.chainId}`} />
                    <div className="very-small text-gray">Put the blockchain name here.</div>
                </div>

                <div className="mb-3">
                    <label for={`chain_${item.chainId}`} className="form-label small">Object Id</label>
                    <input ref={idValueRef} type="text" className="form-control form-control-bg" id={`chain_id_${item.chainId}`} />
                    <div className="very-small text-gray">This is the name to the blockchain id. This is recommend using only lowercase letters and no spaces to work correctly.</div>
                </div>

                <div className="mb-3">
                    <label for={`chain_block_id_${item.chainId}`} className="form-label small">Blockchain Id</label>
                    <input ref={blockIdRef} type="text" className="form-control form-control-bg" id={`chain_block_id_${item.chainId}`} />
                    <div className="very-small text-gray">This is the blockchain identifier value within the Ethereum network. Enter a chain value here.</div>
                </div>

                <div className="mb-3">
                    <label for={`chain_factory_${item.chainId}`} className="form-label small">Factory Smart Contract</label>
                    <input ref={factoryScRef} type="text" className="form-control form-control-bg" id={`chain_factory_${item.chainId}`} />
                    <div className="very-small text-gray">The smart contract of the blockchain factory.</div>
                </div>

                <div className="mb-3">
                    <label for={`chain_explorer_id_${item.chainId}`} className="form-label small">Explorer Url</label>
                    <input ref={explorerUrlRef} type="text" className="form-control form-control-bg" id={`chain_explorer_id_${item.chainId}`} />
                    <div className="very-small text-gray">The url of the blockchain explorer server.</div>
                </div>

                <div className="mb-3">
                    <label for={`chain_explorer_api_id_${item.chainId}`} className="form-label small">Explorer API Url</label>
                    <input ref={explorerUrlApiRef} type="text" className="form-control form-control-bg" id={`chain_explorer_api_id_${item.chainId}`} />
                    <div className="very-small text-gray">The api url of the blockchain explorer server.</div>
                </div>

                <div className="mb-3">
                    <label for={`chain_rpc_id_${item.chainId}`} className="form-label small">RPC Url</label>
                    <input ref={chainRpcRef} type="text" className="form-control form-control-bg" id={`chain_rpc_id_${item.chainId}`} />
                    <div className="very-small text-gray">The RPC url of the blockchain server.</div>
                </div>

            </li>
        </ul>
    </div>;

};

export default Web3Item;