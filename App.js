import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

/*
We have 4 types of people involved in each transaction. These are Buyer, Seller, Inspector(Like Registrar Offices) and Lender(like Banks)
*/

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Config
import config from './config.json';

function App() {
  const [provider, setProvider] = useState(null)
  const [escrow, setEscrow] = useState(null)

  const [account, setAccount] = useState(null)

  const [homes, setHomes] = useState([])
  const [home, setHome] = useState({})
  const [toggle, setToggle] = useState(false);

  const loadBlockchainData = async () => {

    /* For provider */
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    /* For Network ID: */
    const network = await provider.getNetwork()

    // config[network.chainId].realEstate.address is used to fetch address from config.json file
    //Here, RealEstate is imported from ABI folder -> RealEstate.json
    const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider)

    //Get total supply of homes
    const totalSupply = await realEstate.totalSupply()
    console.log(totalSupply);

    //Now, we have loaded real estate and its total supply
    //Now, we store all homes
    const homes = []

    for (var i = 1; i <= totalSupply; i++) {
      const uri = await realEstate.tokenURI(i)
      const response = await fetch(uri)
      const metadata = await response.json()
      homes.push(metadata)
    }

    setHomes(homes)

    // config[network.chainId].escrow.address is used to fetch address from config.json file
    //Here, Escrow is imported from ABI folder -> Escrow.json
    const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider)
    setEscrow(escrow)

    
    /* Change and update the page if user changes metamask account. */
    window.ethereum.on('accountsChanged', async () => {

      /* Refetch the account, Connect accounts through window.ethereum method*/
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      /* Set first account as default account */
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account);
    })
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  const togglePop = (home) => {
    setHome(home)
    toggle ? setToggle(false) : setToggle(true);
  }

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />

      <div className='cards__section'>

        <h3>Available Properties:</h3>

        <hr />

        <div className='cards'>
          {/* Mixing Javascript and HTML at the same place
              "map" is a Javascript function that lets us loop over the array
              "key" is a unique key to identify each home; It is required in React
          */}
          {homes.map((home, index) => (
            <div className='card' key={index} onClick={() => togglePop(home)}>
              <div className='card__image'>
                <img src={home.image} alt="Home" />
              </div>
              <div className='card__info'>
                <h4>{home.attributes[0].value} ETH</h4>
                <p>

                  {/* bds: beds, ie, number of bedrooms; ba: bath, ie, number of bathrooms; sqft: Area in square feet */}
                  <strong>{home.attributes[2].value}</strong> bds |
                  <strong>{home.attributes[3].value}</strong> ba |
                  <strong>{home.attributes[4].value}</strong> sqft
                </p>
                <p>{home.address}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {toggle && (
        <Home home={home} provider={provider} account={account} escrow={escrow} togglePop={togglePop} />
      )}

    </div>
  );
}

export default App;


/*
HOW TO RUN THE PROJECT ON LOCAL HOST:
1) Go to terminal, open this folder in 3 different tabs
2) 1st tab: npx hardhat node
3) 2nd tab: npx hardhat run ./scripts/deploy.js --network localhost
4) 3rd tab: npm run start 
            This will run project on local host

METAMASK:
1) Login to metamask from Extensions button in Chrome
2) In "networks", choose "Hardhat"
3) There are 6 accounts, namely Hardhat0 to Hardhat5. Each has around 10000ETH
4) These accounts will be used to buy and sell real estate.

CONNECTING TO METAMASK:
1) There is a connect button on top right corner of website.
2) Click on it and Connect "Hardhat" network and accounts numbered Hardhat0 to Hardhat5.
3) Metamask is connected, and each account is assumed to be:
    Hardhat0 : buyer
    Hardhat1 : seller
    Hardhat2 : inspector
    Hardhat3 : lender


DATA ABOUT HOUSES:
1) The data about houses is stored in "metadata" folder. It is done manually.
*/