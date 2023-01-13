import { ethers } from 'ethers';
import BE from '../assets/BE.jpg';

const Navigation = ({ account, setAccount }) => {


    //To connect metamask accounts to blockchain and Front End:
    const connectHandler = async () => {

        //Connect accounts through window.ethereum method
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        //Set first account as default account
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account);
    }

    return (
        
        <nav>

            {/* This is the front end part */}
            <ul className='nav__links'>
                <li><a href="#">Buy</a></li>
                <li><a href="#">Rent</a></li>
                <li><a href="#">Sell</a></li>
            </ul>

            <div className='nav__brand'>
                <img src={BE} alt="BlockEstate" />
                <h1>BlockEstate</h1>
            </div>

            {/* If the account exists, show them on a page. Else, connect to metamask. */}

            {account ? (
                <button
                    type="button"
                    className='nav__connect'
                >
                    {/* Take a substring of account number. */}
                    {account.slice(0, 6) + '...' + account.slice(38, 42)}
                </button>
            ) : (
                <button type="button" className='nav__connect' onClick={connectHandler}>
                    Connect your Metamask Wallet
                </button>
            )}
        </nav>
    );
}

export default Navigation;