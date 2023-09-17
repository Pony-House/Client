import React, { useEffect } from 'react';

// import Toggle from '../../../atoms/button/Toggle';
// import SettingTile from '../../../molecules/setting-tile/SettingTile';

/*

    <div className="card noselect mt-3">
        <ul className="list-group list-group-flush">
            <li className="list-group-item very-small text-gray">Chat room</li>
            <SettingTile
                title='Use GPU Mode'
                options={(
                    <Toggle
                        className='d-inline-flex'
                        isActive={isUsingUseGPU}
                        onToggle={() => {
                            const isEnabled = global.localStorage.getItem('usingUseGPU');
                            if (typeof isEnabled === 'string' && isEnabled === 'on') {
                                global.localStorage.removeItem('usingUseGPU');
                                setUsingUseGPU(false);
                            } else {
                                global.localStorage.setItem('usingUseGPU', 'on');
                                setUsingUseGPU(true);
                            }
                        }}
                    />
                )}
                content={<div className="very-small text-gray">This function will theoretically try to use your GPU to render the application. (You need to restart the app for the option to take effect)</div>}
            />
        </ul>
    </div>

*/

function ExperimentalSection() {
    // const [isUsingUseGPU, setUsingUseGPU] = useState(false);

    useEffect(() => {
        // const isEnabledgpu = global.localStorage.getItem('usingUseGPU');
        // setUsingUseGPU((typeof isEnabledgpu === 'string' && isEnabledgpu === 'on'));
    }, []);

    return (
        <div>

            <div className="card noselect mt-3">
                <ul className="list-group list-group-flush">
                    <li className="list-group-item very-small text-gray">WARNING!</li>
                    <li className="list-group-item small text-danger">
                        This is a <strong>TESTING FEATURE</strong> session! Any setting enabled in this location is completely at <strong>your own risk</strong>!
                    </li>
                </ul>
            </div>

        </div>
    );
};

export default ExperimentalSection;