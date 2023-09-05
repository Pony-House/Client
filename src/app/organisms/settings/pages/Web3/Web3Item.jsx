import React, { useEffect, useRef } from 'react';
import { setWeb3Cfg, getWeb3Cfg } from '../../../../../util/web3';
import { objType } from '../../../../../util/tools';

function Web3Item({ item, networkId }) {

    const idValueRef = useRef(null);
    const blockIdRef = useRef(null);
    const blockIdNumberRef = useRef(null);
    const blockNameRef = useRef(null);
    const explorerUrlRef = useRef(null);
    const explorerUrlApiRef = useRef(null);
    const chainRpcRef = useRef(null);
    const factoryScRef = useRef(null);
    const tokenNameRef = useRef(null);
    const tokenSymbolRef = useRef(null);
    const tokenDecimalsRef = useRef(null);

    console.log(item);

    // Effects
    useEffect(() => {

        // Template
        const valueTemplate = (where, type, data, folder) => {

            // Prepare Config Base
            const web3Settings = getWeb3Cfg();

            // Get New Item
            const newData = { nativeCurrency: {} };
            if (web3Settings.networks[networkId]) {
                for (const titem in web3Settings.networks[networkId]) {
                    newData[titem] = web3Settings.networks[networkId][titem];
                }
            }

            // Insert new data
            if (typeof data === 'string' || typeof data === 'number') {

                if (type === 'array') {

                    if (typeof folder === 'string') {

                        if (!objType(newData[where], 'object')) { newData[where] = {}; }
                        newData[where][folder] = data.split(',');

                        for (const item2 in newData[where][folder]) {
                            newData[where][folder][item2] = newData[where][folder][item2].trim();
                        }

                    } else {

                        newData[where] = data.split(',');

                        for (const item2 in newData[where]) {
                            newData[where][item2] = newData[where][item2].trim();
                        }

                    }

                } else if (type === 'number') {

                    if (typeof folder === 'string') {
                        if (!objType(newData[where], 'object')) { newData[where] = {}; }
                        newData[where][folder] = Number(data);
                    } else {
                        newData[where] = Number(data);
                    }

                } else if (typeof folder === 'string') {
                    if (!objType(newData[where], 'object')) { newData[where] = {}; }
                    newData[where][folder] = data;
                } else {
                    newData[where] = data;
                }

            } else if (typeof newData[where][folder] !== 'undefined') {
                delete newData[where][folder];
            } else if (typeof newData[where] !== 'undefined') {
                delete newData[where];
            }

            // Reset Data
            if (web3Settings.networks[networkId]) delete web3Settings.networks[networkId];
            web3Settings.networks[networkId] = newData;

            console.log(newData);

        };

        // Object Id
        const idValue = $(idValueRef.current);
        idValue.val(networkId);
        const idValueChange = () => {

        };

        // Blockchain Id
        const blockId = $(blockIdRef.current);
        blockId.val(item.chainId);
        const blockIdChange = (event) => valueTemplate('chainId', 'string', $(event.target).val());

        // Blockchain Id Int
        const blockIdNumber = $(blockIdNumberRef.current);
        blockIdNumber.val(item.chainIdInt);
        const blockIdNumberChange = (event) => valueTemplate('chainIdInt', 'number', $(event.target).val());

        // Blockchain Name
        const blockName = $(blockNameRef.current);
        blockName.val(item.chainName);
        const blockNameChange = (event) => valueTemplate('chainName', 'string', $(event.target).val());

        // Token Name
        const tokenName = $(tokenNameRef.current);
        tokenName.val(item.nativeCurrency?.name);
        const tokenNameChange = (event) => valueTemplate('nativeCurrency', 'string', $(event.target).val(), 'name');

        // Token Symbol
        const tokenSymbol = $(tokenSymbolRef.current);
        tokenSymbol.val(item.nativeCurrency?.symbol);
        const tokenSymbolChange = (event) => valueTemplate('nativeCurrency', 'string', $(event.target).val(), 'symbol');

        // Token Decimals
        const tokenDecimals = $(tokenDecimalsRef.current);
        tokenDecimals.val(item.nativeCurrency?.decimals);
        const tokenDecimalsChange = (event) => valueTemplate('nativeCurrency', 'number', $(event.target).val(), 'decimals');

        // Explorer Url
        const explorerUrl = $(explorerUrlRef.current);
        explorerUrl.val(item?.blockExplorerUrls.join(', '));
        const explorerUrlChange = (event) => valueTemplate('blockExplorerUrls', 'array', $(event.target).val());

        // Explorer Url - API
        const explorerUrlApi = $(explorerUrlApiRef.current);
        explorerUrlApi.val(item?.blockExplorerApis.join(', '));
        const explorerUrlApiChange = (event) => valueTemplate('blockExplorerApis', 'array', $(event.target).val());

        // Chain RPC
        const chainRpc = $(chainRpcRef.current);
        chainRpc.val(item?.rpcUrls.join(', '));
        const chainRpcChange = (event) => valueTemplate('rpcUrls', 'array', $(event.target).val());

        // Factory Smart Contract
        const factorySc = $(factoryScRef.current);
        factorySc.val(item?.factory.join(', '));
        const factoryScChange = (event) => valueTemplate('factory', 'array', $(event.target).val());

        // Turn On
        idValue.on('change', idValueChange);
        blockId.on('change', blockIdChange);
        blockIdNumber.on('change', blockIdNumberChange);
        blockName.on('change', blockNameChange);
        tokenName.on('change', tokenNameChange);
        tokenSymbol.on('change', tokenSymbolChange);
        tokenDecimals.on('change', tokenDecimalsChange);
        explorerUrl.on('change', explorerUrlChange);
        explorerUrlApi.on('change', explorerUrlApiChange);
        chainRpc.on('change', chainRpcChange);
        factorySc.on('change', factoryScChange);

        // Complete
        return () => {
            idValue.off('change', idValueChange);
            blockId.off('change', blockIdChange);
            blockIdNumber.off('change', blockIdNumberChange);
            blockName.off('change', blockNameChange);
            tokenName.off('change', tokenNameChange);
            tokenSymbol.off('change', tokenSymbolChange);
            tokenDecimals.off('change', tokenDecimalsChange);
            explorerUrl.off('change', explorerUrlChange);
            explorerUrlApi.off('change', explorerUrlApiChange);
            chainRpc.off('change', chainRpcChange);
            factorySc.off('change', factoryScChange);
        };

    });

    return <div className="card noselect mb-3">
        <ul className="list-group list-group-flush">

            <li className="list-group-item very-small text-gray">
                <a data-bs-toggle="collapse" href={`#chain_collapse_${item.chainId}`} role="button" aria-expanded="false" aria-controls={`chain_collapse_${item.chainId}`}>
                    {item.chainName} <img src={`${item?.blockExplorerUrls}images/favicon.ico`} className='ms-2 img-fluid' style={{ height: 20 }} alt='logo' />
                </a>
            </li>

            <li id={`chain_collapse_${item.chainId}`} className="list-group-item collapse">

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
                    <label for={`chain_block_id_number_${item.chainId}`} className="form-label small">Blockchain Id (Number)</label>
                    <input ref={blockIdNumberRef} type="number" className="form-control form-control-bg" id={`chain_block_id_number_${item.chainId}`} />
                    <div className="very-small text-gray">This is the blockchain identifier value (Number) within the Ethereum network. Enter a chain value here.</div>
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

                <div className="mb-3">
                    <label for={`chain_name_${item.chainId}`} className="form-label small">Name</label>
                    <input ref={tokenNameRef} type="text" className="form-control form-control-bg" id={`chain_name_${item.chainId}`} />
                    <div className="very-small text-gray">The token name.</div>
                </div>

                <div className="mb-3">
                    <label for={`chain_symbol_${item.chainId}`} className="form-label small">Symbol</label>
                    <input ref={tokenSymbolRef} type="text" className="form-control form-control-bg" id={`chain_symbol_${item.chainId}`} />
                    <div className="very-small text-gray">The token symbol.</div>
                </div>

                <div className="mb-3">
                    <label for={`chain_decimals_${item.chainId}`} className="form-label small">Decimals</label>
                    <input ref={tokenDecimalsRef} type="number" min={0} className="form-control form-control-bg" id={`chain_decimals_${item.chainId}`} />
                    <div className="very-small text-gray">The token decimals.</div>
                </div>

                <div className="mb-3">
                    <button type="button" class="btn btn-sm btn-danger">Delete Blockchain</button>
                </div>

            </li>
        </ul>
    </div>;

};

export default Web3Item;