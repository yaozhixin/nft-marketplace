# Install
```
git clone git@github.com:dappuniversity/starter_kit_2.git

# If failed, npm cache clear --force
npm install

npm install react-router-dom@6
npm install ipfs-http-client@56.0.1
npm i @openzeppelin/contracts@4.5.0
```
# Run
```
# Launch in a console
npm run start
```

# Test
```
# Hardhat in another console
export NODE_OPTIONS=--openssl-legacy-provider
npx hardhat node

# Another console
npx hardhat run src/backend/scripts/deploy.js --network localhost
npx hardhat console --network localhost

npx hardhat test
```
