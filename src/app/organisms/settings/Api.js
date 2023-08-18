import initMatrix from '../../../client/initMatrix';

const toggleAction = (dataFolder, valueName, setToggle) => data => {

    const content = initMatrix.matrixClient.getAccountData(dataFolder)?.getContent() ?? {};
    content[valueName] = data;

    initMatrix.matrixClient.setAccountData(dataFolder, content);
    setToggle((data === true));

};

export { toggleAction };