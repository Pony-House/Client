import { convertIpfsGateway } from './ipfs';

export default function convertProtocols(tinyUrl, vanillaUrl) {
  return convertIpfsGateway(tinyUrl, vanillaUrl);
}
