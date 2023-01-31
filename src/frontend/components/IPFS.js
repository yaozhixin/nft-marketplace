import * as ipfs from 'ipfs-core'

class IPFS {
static async getInstance() {
    if (!IPFS.instance) {
        IPFS.instance = await ipfs.create();
    }
    return IPFS.instance;
}
constructor() {}
}
 
IPFS.instance = null;
export default IPFS;